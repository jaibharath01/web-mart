import { qs, on, escapeHtml, formatMoney } from "../utils.js";
import { cartTotals, updateQty, removeFromCart, clearCart, addToCart, getWishlist, toggleWishlist } from "../cart.js";
import { getProductById } from "../products.js";
import { initCommonDelegates } from "./common-page.js";

let coupon = "";

function render(){
  const itemsEl = qs("[data-cart-items]");
  const savedEl = qs("[data-saved]");
  const totals = cartTotals({ couponCode: coupon });
  if(itemsEl){
    if(!totals.items.length){
      itemsEl.innerHTML = `
        <div class="card pad center" style="min-height:180px;">
          <div style="max-width:520px; text-align:center;">
            <h3 style="margin:0 0 8px;">Your cart is empty</h3>
            <p>Browse premium listings and add items to your cart in one click.</p>
            <a class="btn primary" href="browse.html">Shop now</a>
          </div>
        </div>
      `;
    }else{
      itemsEl.innerHTML = totals.items.map(({ product, qty, line })=>`
        <div class="list-row" style="grid-template-columns: 150px 1fr 260px;">
          <a class="thumb" href="product-detail.html?id=${encodeURIComponent(product.id)}">
            <img src="${product.images?.[0]||""}" alt="${escapeHtml(product.title)}" loading="lazy"/>
          </a>
          <div>
            <div style="font-weight:900; letter-spacing:-.02em; margin-bottom:6px;">${escapeHtml(product.title)}</div>
            <div class="note">${escapeHtml(product.location)} • ${escapeHtml(product.condition)}</div>
            <div class="row wrap" style="margin-top:10px;">
              <button class="btn ghost small" type="button" data-save="${escapeHtml(product.id)}">Save for later</button>
              <button class="btn ghost small" type="button" data-remove="${escapeHtml(product.id)}">Remove</button>
            </div>
          </div>
          <div style="text-align:right;">
            <div class="price">${formatMoney(line)}</div>
            <div class="row" style="justify-content:flex-end; margin-top:8px;">
              <button class="btn outline small" type="button" data-qty-minus="${escapeHtml(product.id)}">−</button>
              <input class="input" style="max-width:86px;text-align:center;" inputmode="numeric" value="${escapeHtml(qty)}" data-qty-input="${escapeHtml(product.id)}" aria-label="Quantity for ${escapeHtml(product.title)}"/>
              <button class="btn outline small" type="button" data-qty-plus="${escapeHtml(product.id)}">+</button>
            </div>
          </div>
        </div>
      `).join("");
    }
  }

  if(savedEl){
    const wl = getWishlist().ids.map(getProductById).filter(Boolean);
    if(!wl.length){
      savedEl.innerHTML = `<div class="note">No saved items yet. Use “Save for later” from the cart.</div>`;
    }else{
      savedEl.innerHTML = wl.slice(0, 6).map(p=>`
        <div class="list-row" style="grid-template-columns: 150px 1fr 240px;">
          <a class="thumb" href="product-detail.html?id=${encodeURIComponent(p.id)}">
            <img src="${p.images?.[0]||""}" alt="${escapeHtml(p.title)}" loading="lazy"/>
          </a>
          <div>
            <div style="font-weight:900; letter-spacing:-.02em; margin-bottom:6px;">${escapeHtml(p.title)}</div>
            <div class="note">${escapeHtml(p.location)} • ${escapeHtml(p.condition)}</div>
          </div>
          <div class="row wrap" style="justify-content:flex-end;">
            <button class="btn outline small" type="button" data-move-to-cart="${escapeHtml(p.id)}">Move to cart</button>
            <button class="btn ghost small" type="button" data-wishlist-toggle="${escapeHtml(p.id)}" aria-pressed="true">Remove</button>
          </div>
        </div>
      `).join("");
    }
  }

  qs("[data-subtotal]")?.replaceChildren(document.createTextNode(formatMoney(totals.subtotal)));
  qs("[data-shipping]")?.replaceChildren(document.createTextNode(formatMoney(totals.shipping)));
  qs("[data-tax]")?.replaceChildren(document.createTextNode(formatMoney(totals.tax)));
  qs("[data-total]")?.replaceChildren(document.createTextNode(formatMoney(totals.total)));

  const discRow = qs("[data-discount-row]");
  if(discRow){
    discRow.style.display = totals.discount ? "" : "none";
    qs("[data-discount]")?.replaceChildren(document.createTextNode(`-${formatMoney(totals.discount)}`));
  }
}

initCommonDelegates();
render();

on(document, "click", "[data-remove]", (e, btn)=>{
  removeFromCart(btn.getAttribute("data-remove"));
  render();
});
on(document, "click", "[data-save]", (e, btn)=>{
  const id = btn.getAttribute("data-save");
  toggleWishlist(id);
  removeFromCart(id);
  render();
});
on(document, "click", "[data-qty-minus]", (e, btn)=>{
  const id = btn.getAttribute("data-qty-minus");
  const input = qs(`[data-qty-input="${CSS.escape(id)}"]`);
  const v = Math.max(1, Number(input?.value || 1) - 1);
  updateQty(id, v);
  render();
});
on(document, "click", "[data-qty-plus]", (e, btn)=>{
  const id = btn.getAttribute("data-qty-plus");
  const input = qs(`[data-qty-input="${CSS.escape(id)}"]`);
  const v = Math.min(99, Number(input?.value || 1) + 1);
  updateQty(id, v);
  render();
});
on(document, "input", "[data-qty-input]", (e, input)=>{
  const id = input.getAttribute("data-qty-input");
  updateQty(id, input.value);
  render();
});

qs("[data-clear-cart]")?.addEventListener("click", ()=>{
  clearCart();
  render();
});

qs("[data-apply-coupon]")?.addEventListener("click", ()=>{
  coupon = String(qs("#coupon")?.value || "").trim();
  render();
});

on(document, "click", "[data-move-to-cart]", (e, btn)=>{
  const id = btn.getAttribute("data-move-to-cart");
  addToCart(id, 1);
  render();
});

