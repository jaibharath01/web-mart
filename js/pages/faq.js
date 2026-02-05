import { qs, qsa, on, escapeHtml } from "../utils.js";

const FAQS = [
  { q:"How do I list an item?", a:"Go to the Sell page, complete the multi-step form, upload 1–8 photos, and publish. Drafts auto-save." },
  { q:"Can I make offers?", a:"Yes. Sellers can enable offers. Buyers can tap Make Offer on product detail (UI placeholder in this demo)." },
  { q:"How is shipping calculated?", a:"Demo uses a flat estimator: free over $300, else $14. Replace with live rates in production." },
  { q:"How do I compare products?", a:"Use the shield icon on product cards to add up to 4 items, then open the compare bar." },
  { q:"Is my data stored?", a:"Only locally (localStorage/sessionStorage) for this prototype. No network calls are made." }
];

function render(list=FAQS){
  const el = qs("[data-faq-list]");
  if(!el) return;
  el.innerHTML = list.map((f, i)=>`
    <div class="acc-item" aria-expanded="${i===0?"true":"false"}">
      <button class="acc-btn" type="button" data-acc>
        <strong>${escapeHtml(f.q)}</strong><span aria-hidden="true">▾</span>
      </button>
      <div class="acc-panel">${escapeHtml(f.a)}</div>
    </div>
  `).join("");
}

render();

on(document, "click", "[data-acc]", (e, btn)=>{
  const item = btn.closest(".acc-item");
  const open = item.getAttribute("aria-expanded") === "true";
  item.setAttribute("aria-expanded", open ? "false":"true");
});

qs("[data-faq-search]")?.addEventListener("input", (e)=>{
  const q = e.target.value.toLowerCase();
  const filtered = FAQS.filter(f=>f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  render(filtered);
});

