import { qs, qsa, on, toast, escapeHtml, uid } from "../utils.js";
import { PRODUCTS } from "../products.js";

const MSG_KEY = "webmart_msgs_v1";

function getMsgs(){
  try{ return JSON.parse(localStorage.getItem(MSG_KEY) || "[]"); }catch{ return []; }
}
function setMsgs(msgs){
  localStorage.setItem(MSG_KEY, JSON.stringify(msgs));
}

function seedIfEmpty(){
  if(getMsgs().length) return;
  const sample = [
    {
      id: uid("c"),
      title: "Buyer • iPhone 14 Pro",
      productId: "p001",
      archived: false,
      messages: [
        { from:"Buyer", text:"Hi! Is the Deep Purple still available?", at: Date.now()-3600e3 },
        { from:"You", text:"Yes, still available. Ships today.", at: Date.now()-3500e3 },
        { from:"Buyer", text:"Great. Can you do $760?", at: Date.now()-3400e3 }
      ]
    },
    {
      id: uid("c"),
      title: "Jordan • Headphones",
      productId: "p002",
      archived: false,
      messages: [
        { from:"Buyer", text:"Are the pads original?", at: Date.now()-8200e3 },
        { from:"You", text:"They’re original and clean.", at: Date.now()-8100e3 }
      ]
    }
  ];
  setMsgs(sample);
}

let currentId = null;

function renderList(){
  const list = qs("[data-conv-list]");
  if(!list) return;
  const msgs = getMsgs().filter(m=>!m.archived);
  if(!msgs.length){
    list.innerHTML = `<div class="note">No conversations yet. Start one from a product detail page.</div>`;
    return;
  }
  list.innerHTML = msgs.map(m=>`
    <div class="conv" role="button" tabindex="0" data-thread="${escapeHtml(m.id)}">
      <strong>${escapeHtml(m.title)}</strong>
      <div class="note">${escapeHtml(m.messages[m.messages.length-1]?.text || "")}</div>
    </div>
  `).join("");
}

function renderThread(id){
  const thread = getMsgs().find(m=>m.id===id);
  const log = qs("[data-chat-log]");
  const title = qs("[data-chat-title]");
  const sub = qs("[data-chat-subtitle]");
  const product = qs("[data-chat-product]");
  if(!thread || !log) return;
  currentId = id;
  title.textContent = thread.title;
  sub.textContent = "Secure, modern messaging UI (demo).";

  log.innerHTML = thread.messages.map(m=>`
    <div class="bubble ${m.from==="You"?"me":""}">
      <strong>${escapeHtml(m.from)}</strong><br/>
      ${escapeHtml(m.text)}
    </div>
  `).join("");
  log.scrollTop = log.scrollHeight;

  const p = PRODUCTS.find(p=>p.id === thread.productId);
  product.innerHTML = p ? `${escapeHtml(p.title)} • $${escapeHtml(p.price)} • ${escapeHtml(p.location)}` : "Product context placeholder";
}

function sendMessage(text){
  if(!currentId || !text.trim()) return;
  const msgs = getMsgs();
  const thread = msgs.find(m=>m.id===currentId);
  if(!thread) return;
  thread.messages.push({ from:"You", text: text.trim(), at: Date.now() });
  setMsgs(msgs);
  renderThread(currentId);
}

function archiveThread(){
  if(!currentId) return;
  const msgs = getMsgs();
  const t = msgs.find(m=>m.id===currentId);
  if(t){ t.archived = true; setMsgs(msgs); }
  currentId = null;
  renderList();
  qs("[data-chat-log]").innerHTML = "";
  qs("[data-chat-title]").textContent = "Choose a conversation";
  qs("[data-chat-subtitle]").textContent = "Messages and product context will appear here.";
}

function blockThread(){
  if(!currentId) return;
  archiveThread();
  toast({ title:"User blocked", message:"Block/report flow is a UI placeholder.", tone:"accent" });
}

seedIfEmpty();
renderList();

on(document, "click", "[data-thread]", (e, t)=>{
  renderThread(t.getAttribute("data-thread"));
});

qs("[data-chat-send]")?.addEventListener("click", ()=>{
  const input = qs("[data-chat-input]");
  sendMessage(input.value);
  input.value = "";
});
qs("[data-chat-input]")?.addEventListener("keydown", (e)=>{
  if(e.key === "Enter"){
    e.preventDefault();
    sendMessage(e.target.value);
    e.target.value = "";
  }
});

qs("[data-archive]")?.addEventListener("click", archiveThread);
qs("[data-block]")?.addEventListener("click", blockThread);
qs("[data-new-thread]")?.addEventListener("click", ()=>{
  const msgs = getMsgs();
  const id = uid("c");
  msgs.unshift({
    id,
    title: "New conversation",
    productId: "p003",
    archived: false,
    messages: [{ from:"You", text:"Hi! I’m interested in your item.", at: Date.now() }]
  });
  setMsgs(msgs);
  renderList();
  renderThread(id);
});

