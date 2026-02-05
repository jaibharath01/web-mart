import { qs, qsa, on, toast, escapeHtml } from "../utils.js";
import { getWishlist, toggleWishlist } from "../cart.js";
import { getProductById, PRODUCTS } from "../products.js";

const LISTINGS_KEY = "webmart_listings_v1";
const ORDERS_KEY = "webmart_orders_v1";
const SETTINGS_KEY = "webmart_dash_settings_v1";

function getListings(){
  try{ return JSON.parse(localStorage.getItem(LISTINGS_KEY) || "[]"); }catch{ return []; }
}
function getOrders(){
  try{ return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); }catch{ return []; }
}
function getSettings(){
  try{ return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"); }catch{ return {}; }
}
function setSettings(s){
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function switchTab(tab){
  qsa("[data-panel]").forEach(p=>{
    p.hidden = p.getAttribute("data-panel") !== tab;
  });
  qsa("[data-tab]").forEach(t=>{
    t.setAttribute("aria-selected", t.getAttribute("data-tab") === tab ? "true" : "false");
  });
}

function renderCounts(){
  qs("[data-count-listings]")?.replaceChildren(document.createTextNode(String(getListings().length)));
  qs("[data-count-purchases]")?.replaceChildren(document.createTextNode(String(getOrders().length)));
  qs("[data-count-wishlist]")?.replaceChildren(document.createTextNode(String(getWishlist().ids.length)));
}

function renderListings(){
  const el = qs("[data-listings]");
  if(!el) return;
  const list = getListings();
  if(!list.length){
    el.innerHTML = `<div class="note">No listings yet. Create one from the Sell page.</div>`;
    return;
  }
  el.innerHTML = list.map(l=>`
    <div class="card pad">
      <div class="row space-between">
        <strong>${escapeHtml(l.title)}</strong>
        <span class="badge ${l.status==="active"?"success":""}">${escapeHtml(l.status)}</span>
      </div>
      <div class="note">${escapeHtml(l.location)} • ${escapeHtml(l.condition)} • $${escapeHtml(l.price)}</div>
      <div class="row wrap" style="margin-top:10px;">
        <a class="btn outline small" href="product-detail.html?id=${encodeURIComponent(l.id || "p001")}">Preview</a>
        <button class="btn ghost small" type="button" data-delete-listing="${escapeHtml(l.id)}">Delete</button>
      </div>
    </div>
  `).join("");
}

function renderPurchases(){
  const el = qs("[data-purchases]");
  if(!el) return;
  const orders = getOrders();
  if(!orders.length){
    el.innerHTML = `<div class="note">No purchases yet. Add items to cart and checkout.</div>`;
    return;
  }
  el.innerHTML = orders.map(o=>`
    <div class="card pad">
      <div class="row space-between">
        <div><strong>Order ${escapeHtml(o.id)}</strong> • <span class="badge success">${escapeHtml(o.status)}</span></div>
        <div class="note">${new Date(o.placedAt).toLocaleString()}</div>
      </div>
      <div class="divider"></div>
      <div class="note">Items: ${escapeHtml(o.totals.items.map(i=>`${i.qty}× ${i.productId}`).join(", "))}</div>
      <div class="row wrap" style="margin-top:10px;">
        <a class="btn outline small" href="browse.html">Reorder</a>
        <a class="btn ghost small" href="messages.html">Contact seller</a>
      </div>
    </div>
  `).join("");
}

function renderActivity(){
  const el = qs("[data-activity]");
  if(!el) return;
  const items = [
    "Draft autosaved successfully.",
    "Wishlist synced across pages.",
    "Compare bar updated.",
    "Order confirmation created.",
    "Message placeholders ready."
  ];
  el.innerHTML = items.map(i=>`<div class="pill">${escapeHtml(i)}</div>`).join("");
}

function renderFavorites(){
  const el = qs("[data-favorites]");
  if(!el) return;
  const ids = getWishlist().ids;
  const items = ids.map(getProductById).filter(Boolean);
  if(!items.length){
    el.innerHTML = `<div class="note">No wishlist items yet.</div>`;
    return;
  }
  el.innerHTML = items.map(p=>`
    <div class="card pad">
      <div class="row space-between">
        <strong>${escapeHtml(p.title)}</strong>
        <button class="btn ghost small" type="button" data-wishlist-toggle="${escapeHtml(p.id)}">Remove</button>
      </div>
      <div class="note">${escapeHtml(p.location)} • $${escapeHtml(p.price)}</div>
      <div class="row wrap" style="margin-top:8px;">
        <a class="btn outline small" href="product-detail.html?id=${encodeURIComponent(p.id)}">View</a>
        <a class="btn primary small" href="cart.html">Add to cart</a>
      </div>
    </div>
  `).join("");
}

function renderSettings(){
  const s = { notifs:true, twofa:false, ...getSettings() };
  qsa("[data-setting]").forEach(sw=>{
    const key = sw.getAttribute("data-setting");
    sw.setAttribute("aria-checked", s[key] ? "true" : "false");
  });
}

function randomAnalytics(){
  qs("[data-ana-views]")?.replaceChildren(document.createTextNode(String(1200 + Math.floor(Math.random()*600))));
  qs("[data-ana-offers]")?.replaceChildren(document.createTextNode(String(24 + Math.floor(Math.random()*10))));
  qs("[data-ana-conv]")?.replaceChildren(document.createTextNode(`${(3.4 + Math.random()).toFixed(1)}%`));
}

switchTab("overview");
renderCounts();
renderListings();
renderPurchases();
renderActivity();
renderFavorites();
renderSettings();
randomAnalytics();

on(document, "click", "[data-tab]", (e, btn)=>{
  switchTab(btn.getAttribute("data-tab"));
});

on(document, "click", "[data-delete-listing]", (e, btn)=>{
  const id = btn.getAttribute("data-delete-listing");
  const list = getListings().filter(l=>l.id !== id);
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(list));
  toast({ title:"Listing removed", message:"Draft removed from dashboard.", tone:"accent" });
  renderListings();
  renderCounts();
});

on(document, "click", "[data-setting]", (e, sw)=>{
  const key = sw.getAttribute("data-setting");
  const cur = sw.getAttribute("aria-checked") === "true";
  const next = !cur;
  sw.setAttribute("aria-checked", next ? "true":"false");
  const s = { ...getSettings(), [key]: next };
  setSettings(s);
  toast({ title:"Preference saved", message:`${key} ${next ? "enabled":"disabled"}.` });
});

qs("[data-reset-settings]")?.addEventListener("click", ()=>{
  setSettings({ notifs:true, twofa:false });
  renderSettings();
  toast({ title:"Settings reset", message:"Preferences restored to default." });
});

document.addEventListener("webmart:wishlist_updated", ()=>{
  renderFavorites();
  renderCounts();
});

