import { qs, qsa, on, escapeHtml, formatMoney, toast, uid } from "../utils.js";
import { attachRealtimeValidation, validateField } from "../forms.js";
import { cartTotals, clearCart, getCart } from "../cart.js";
import { getProductById } from "../products.js";

const ORDERS_KEY = "webmart_orders_v1";

function getOrders(){
  try{ return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); }catch{ return []; }
}
function setOrders(orders){
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function setStep(step){
  const form = qs("[data-checkout-form]");
  if(!form) return;
  const s = Math.max(1, Math.min(4, Number(step||1)));
  form.setAttribute("data-current-step", String(s));
  qsa("[data-step]").forEach(el=>{
    const n = Number(el.getAttribute("data-step") || "0");
    el.hidden = n !== s;
  });
  qsa("[data-step-pill]").forEach(p=>{
    const n = Number(p.getAttribute("data-step-pill") || "0");
    p.classList.toggle("active", n === s);
    p.classList.toggle("done", n < s);
  });
  qs("[data-prev]") && (qs("[data-prev]").disabled = s === 1);
  qs("[data-next]") && (qs("[data-next]").disabled = s === 4);
  qs("[data-place-order]") && (qs("[data-place-order]").disabled = s !== 3);
}

function syncTotals(){
  const totals = cartTotals();
  qs("[data-subtotal]")?.replaceChildren(document.createTextNode(formatMoney(totals.subtotal)));
  qs("[data-shipping]")?.replaceChildren(document.createTextNode(formatMoney(totals.shipping)));
  qs("[data-tax]")?.replaceChildren(document.createTextNode(formatMoney(totals.tax)));
  qs("[data-total]")?.replaceChildren(document.createTextNode(formatMoney(totals.total)));

  const itemsEl = qs("[data-summary-items]");
  if(itemsEl){
    itemsEl.innerHTML = totals.items.map(({ product, qty })=>`
      <div class="row space-between">
        <span class="muted" style="max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(product.title)}</span>
        <strong>${escapeHtml(qty)}×</strong>
      </div>
    `).join("") || `<div class="note">No items. Add products to cart to checkout.</div>`;
  }
  return totals;
}

function validateShippingStep(){
  const form = qs("[data-checkout-form]");
  const names = ["firstName","lastName","email","address1","city","state","zip"];
  let ok = true;
  for(const n of names){
    const el = form.elements.namedItem(n);
    const field = el?.closest(".field");
    if(field) ok = validateField(field) && ok;
  }
  if(!ok) toast({ title:"Fix shipping info", message:"Please correct the highlighted fields.", tone:"danger" });
  return ok;
}

function buildReview(){
  const form = qs("[data-checkout-form]");
  const totals = syncTotals();
  const v = (n)=>String(form.elements.namedItem(n)?.value || "").trim();
  const review = qs("[data-review]");
  if(!review) return;
  review.innerHTML = `
    <div class="row space-between">
      <strong>Shipping</strong>
      <span class="badge success">Validated</span>
    </div>
    <div class="divider"></div>
    <div class="note">
      <strong>${escapeHtml(v("firstName"))} ${escapeHtml(v("lastName"))}</strong><br/>
      ${escapeHtml(v("address1"))}<br/>
      ${escapeHtml(v("city"))}, ${escapeHtml(v("state"))} ${escapeHtml(v("zip"))}<br/>
      ${escapeHtml(v("email"))}
    </div>
    <div class="divider"></div>
    <div class="row space-between"><span class="muted">Total</span><strong>${formatMoney(totals.total)}</strong></div>
    <div class="note" style="margin-top:10px;">Payment method is a placeholder in this prototype, but the UX is production-ready for integration.</div>
  `;
}

function placeOrder(){
  const totals = syncTotals();
  if(!totals.items.length){
    toast({ title:"Cart is empty", message:"Add items before placing an order.", tone:"danger" });
    return;
  }
  const form = qs("[data-checkout-form]");
  const order = {
    id: uid("ord"),
    placedAt: Date.now(),
    status: "confirmed",
    totals: { ...totals, items: totals.items.map(({ product, qty })=>({ productId: product.id, qty })) },
    shipping: {
      firstName: form.elements.namedItem("firstName")?.value || "",
      lastName: form.elements.namedItem("lastName")?.value || "",
      email: form.elements.namedItem("email")?.value || "",
      address1: form.elements.namedItem("address1")?.value || "",
      city: form.elements.namedItem("city")?.value || "",
      state: form.elements.namedItem("state")?.value || "",
      zip: form.elements.namedItem("zip")?.value || ""
    }
  };
  const orders = getOrders();
  orders.unshift(order);
  setOrders(orders);
  clearCart();

  const confirm = qs("[data-confirm]");
  if(confirm){
    confirm.innerHTML = `
      <div class="pill" style="width:fit-content;">✅ <strong>Order confirmed</strong></div>
      <h3 style="margin:10px 0 8px;">Thank you! Your order is placed.</h3>
      <p>Order <span class="kbd">${escapeHtml(order.id)}</span> is confirmed. You can track it from your dashboard.</p>
      <div class="row wrap">
        <a class="btn primary" href="dashboard.html#purchases">View purchases</a>
        <a class="btn outline" href="browse.html">Keep shopping</a>
      </div>
      <div class="divider"></div>
      <div class="note"><strong>Note:</strong> This is a functional UI prototype. Payments and fulfillment are placeholders.</div>
    `;
  }
  setStep(4);
  toast({ title:"Order placed", message:"Confirmation created and added to My Purchases.", tone:"success" });
}

// Init
attachRealtimeValidation(document);
syncTotals();
setStep(1);

// Updates switch
const sw = qs("[data-updates-switch]");
const cb = qs('input[name="updates"]');
if(sw && cb){
  const sync = ()=>sw.setAttribute("aria-checked", cb.checked ? "true":"false");
  sync();
  sw.addEventListener("click", ()=>{ cb.checked = !cb.checked; sync(); });
}

qs("[data-prev]")?.addEventListener("click", ()=>{
  const cur = Number(qs("[data-checkout-form]")?.getAttribute("data-current-step") || "1");
  setStep(cur - 1);
});
qs("[data-next]")?.addEventListener("click", ()=>{
  const cur = Number(qs("[data-checkout-form]")?.getAttribute("data-current-step") || "1");
  if(cur === 1 && !validateShippingStep()) return;
  if(cur === 2){
    // Payment step validation is light (placeholder).
    // Only validate if card method is selected.
    const method = qs('input[name="payMethod"]:checked')?.value || "card";
    if(method === "card"){
      const names = ["cardNumber","exp","cvv"];
      let ok = true;
      for(const n of names){
        const el = qs(`[name="${CSS.escape(n)}"]`);
        const field = el?.closest(".field");
        if(field) ok = validateField(field) && ok;
      }
      if(!ok){
        toast({ title:"Check payment fields", message:"Payment fields are placeholders but still validated for UX.", tone:"danger" });
        return;
      }
    }
  }
  const next = Math.min(4, cur + 1);
  setStep(next);
  if(next === 3) buildReview();
});

qs("[data-place-order]")?.addEventListener("click", ()=>{
  if(!validateShippingStep()) { setStep(1); return; }
  buildReview();
  placeOrder();
});

on(document, "click", "[data-step-pill]", (e, pill)=>{
  const target = Number(pill.getAttribute("data-step-pill") || "1");
  const cur = Number(qs("[data-checkout-form]")?.getAttribute("data-current-step") || "1");
  if(target > cur){
    if(cur === 1 && !validateShippingStep()) return;
  }
  setStep(target);
  if(target === 3) buildReview();
});

