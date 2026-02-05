import { qs, qsa, on, parseQuery, escapeHtml, formatMoney, toast } from "../utils.js";
import { openModal } from "../modal.js";
import { getProductById, PRODUCTS, CATEGORIES } from "../products.js";
import { addToCart, toggleWishlist, isWishlisted } from "../cart.js";
import { productCard, starsMarkup } from "../ui.js";
import { initCommonDelegates, trackDetailView } from "./common-page.js";

function shippingEstimate(p){
  if(p.shipping?.includes("Shipping")) return 14;
  return 0;
}

function taxEstimate(subtotal){
  return Math.round(subtotal * 0.0725);
}

function render(p){
  const mainImg = qs("[data-main-image]");
  const thumbs = qs("[data-thumbs]");
  const title = qs("[data-title]");
  const subtitle = qs("[data-subtitle]");
  const rating = qs("[data-rating]");
  const desc = qs("[data-description]");
  const tags = qs("[data-tags]");
  const variants = qs("[data-variants]");
  const seller = qs("[data-seller]");
  const similar = qs("[data-similar]");
  const reviews = qs("[data-reviews]");

  if(title) title.textContent = p.title;
  if(subtitle){
    const cat = CATEGORIES.find(c=>c.id===p.category)?.name || "Category";
    subtitle.innerHTML = `${escapeHtml(cat)} • ${escapeHtml(p.condition)} • ${escapeHtml(p.location)} • <strong>${escapeHtml(p.shipping?.join(", ") || "Pickup")}</strong>`;
  }
  if(rating) rating.innerHTML = `${starsMarkup(p.rating)} <span class="muted">(${escapeHtml(p.reviews)} reviews)</span>`;
  if(desc) desc.textContent = p.description;

  if(mainImg){
    mainImg.src = p.images?.[0] || "";
    mainImg.alt = p.title;
  }
  if(thumbs){
    thumbs.innerHTML = (p.images || []).map((src, idx)=>`
      <button class="thumb-tile" type="button" style="padding:0; border-radius:16px; overflow:hidden;" data-thumb="${idx}" aria-label="View image ${idx+1}">
        <img src="${src}" alt="" loading="lazy" style="height:90px;"/>
      </button>
    `).join("");
  }

  if(tags){
    const t = [
      p.acceptOffers ? "Accepts offers" : "Fixed price",
      p.shipping?.includes("Shipping") ? "Ships" : "Pickup",
      p.seller?.badge?.includes("Verified") ? "Verified seller" : "Seller profile",
      `Avg response ${p.seller?.responseMins ?? 45} min`
    ];
    tags.innerHTML = t.map(x=>`<span class="pill">${escapeHtml(x)}</span>`).join("");
  }

  if(variants){
    if(!p.variants?.length){
      variants.innerHTML = `<div class="note">No variants for this item.</div>`;
    }else{
      variants.innerHTML = p.variants.map(v=>`
        <div class="field">
          <label class="muted">${escapeHtml(v.name)}</label>
          <select class="select" name="variant_${escapeHtml(v.name)}">
            ${(v.options||[]).map(o=>`<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("")}
          </select>
        </div>
      `).join("");
    }
  }

  if(seller){
    const s = p.seller || { name:"Seller", badge:[], responseMins: 45, sold: 0 };
    seller.innerHTML = `
      <div class="avatar" aria-hidden="true">${escapeHtml(s.name.split(" ").map(x=>x[0]).slice(0,2).join(""))}</div>
      <div>
        <div class="row wrap" style="gap:8px;">
          <div class="name">${escapeHtml(s.name)}</div>
          ${(s.badge||[]).includes("Verified") ? `<span class="badge success">Verified</span>` : ``}
          ${(s.badge||[]).includes("Top rated") ? `<span class="badge accent">Top rated</span>` : ``}
          ${(s.badge||[]).includes("Fast shipper") ? `<span class="badge">Fast shipper</span>` : ``}
        </div>
        <div class="meta">Avg response: ${escapeHtml(s.responseMins)} min • Sold: ${escapeHtml(s.sold)}</div>
        <div class="note" style="margin-top:6px;">Verification and security are UI placeholders in this demo.</div>
      </div>
    `;
  }

  if(similar){
    const list = PRODUCTS.filter(x=>x.category===p.category && x.id!==p.id).slice(0, 8);
    similar.innerHTML = list.length ? list.map(x=>`<div>${productCard(x)}</div>`).join("") : `<div class="note">No similar items yet.</div>`;
  }

  if(reviews){
    const items = [
      { who:"Verified Buyer", stars:5, text:"Exactly as described, fast response, and clear photos. The checkout UI is incredibly clean." },
      { who:"Top Reviewer", stars:4, text:"Great value. Would love to see more shipping options, but the experience feels premium and safe." },
      { who:"Returning Customer", stars:5, text:"Love the compare feature and quick view. Found what I needed in seconds." },
      { who:"Local Pickup", stars:5, text:"Smooth pickup coordination through messages. Seller was responsive and professional." }
    ];
    reviews.innerHTML = items.slice(0,4).map(r=>`
      <div class="card pad">
        <div class="row space-between">
          <strong>${escapeHtml(r.who)}</strong>
          <span class="rating">${starsMarkup(r.stars)}</span>
        </div>
        <p style="margin-top:8px;">${escapeHtml(r.text)}</p>
      </div>
    `).join("");
  }
}

function initGallery(p){
  const mainImg = qs("[data-main-image]");
  on(document, "click", "[data-thumb]", (e, btn)=>{
    const idx = Number(btn.getAttribute("data-thumb") || "0");
    const src = p.images?.[idx];
    if(src && mainImg) mainImg.src = src;
  });
  mainImg?.addEventListener("click", ()=>{
    openModal({
      title: "Image zoom",
      bodyHtml: `
        <div class="card" style="overflow:hidden;border-radius:22px;">
          <img src="${mainImg.src}" alt="${escapeHtml(p.title)}" style="width:100%;display:block; transform: translateZ(0);"/>
        </div>
        <p class="note" style="margin-top:10px;">Tip: Replace SVG placeholders with real WebP images for production.</p>
      `
    });
  });
}

function initAccordions(){
  on(document, "click", "[data-acc]", (e, btn)=>{
    const item = btn.closest(".acc-item");
    if(!item) return;
    const expanded = item.getAttribute("aria-expanded") === "true";
    item.setAttribute("aria-expanded", expanded ? "false" : "true");
  });
}

function initPricing(p){
  const qtyInput = qs('input[name="qty"]');
  const itemEl = qs("[data-price-item]");
  const shipEl = qs("[data-price-ship]");
  const taxEl = qs("[data-price-tax]");
  const totalEl = qs("[data-price-total]");

  const recalc = ()=>{
    const qty = Math.min(99, Math.max(1, Number(qtyInput?.value || 1)));
    if(qtyInput) qtyInput.value = String(qty);
    const item = p.price * qty;
    const ship = shippingEstimate(p);
    const tax = taxEstimate(item);
    const total = item + ship + tax;
    if(itemEl) itemEl.textContent = formatMoney(item);
    if(shipEl) shipEl.textContent = formatMoney(ship);
    if(taxEl) taxEl.textContent = formatMoney(tax);
    if(totalEl) totalEl.textContent = formatMoney(total);
  };
  recalc();
  qtyInput?.addEventListener("input", recalc);
  qs("[data-qty-minus]")?.addEventListener("click", ()=>{
    qtyInput.value = String(Math.max(1, Number(qtyInput.value||1) - 1));
    recalc();
  });
  qs("[data-qty-plus]")?.addEventListener("click", ()=>{
    qtyInput.value = String(Math.min(99, Number(qtyInput.value||1) + 1));
    recalc();
  });

  qs("[data-buy-now]")?.addEventListener("click", ()=>{
    const qty = Math.min(99, Math.max(1, Number(qtyInput?.value || 1)));
    addToCart(p.id, qty);
    window.location.href = "checkout.html";
  });
  qs("[data-add-to-cart]")?.addEventListener("click", ()=>{
    const qty = Math.min(99, Math.max(1, Number(qtyInput?.value || 1)));
    addToCart(p.id, qty);
  });
}

function initShareAndReport(p){
  qs("[data-share]")?.addEventListener("click", async ()=>{
    const url = window.location.href;
    try{
      if(navigator.share){
        await navigator.share({ title: p.title, text: "Check this out on WebMart", url });
        return;
      }
    }catch{}
    try{
      await navigator.clipboard.writeText(url);
      toast({ title:"Link copied", message:"Share URL copied to clipboard.", tone:"success" });
    }catch{
      toast({ title:"Share", message:"Your browser blocked clipboard access. Copy from the address bar.", tone:"accent" });
    }
  });
  qs("[data-report]")?.addEventListener("click", ()=>{
    toast({ title:"Report sent", message:"Report flow is simulated for this prototype.", tone:"accent" });
  });
}

initCommonDelegates();
initAccordions();

const q = parseQuery();
const p = getProductById(q.id);
if(!p){
  document.querySelector("main")?.insertAdjacentHTML("afterbegin", `
    <section class="section">
      <div class="container wide">
        <div class="card pad">
          <h1 style="font-size:var(--h2);margin:0 0 8px;">Product not found</h1>
          <p>Try browsing the catalog or searching for a different item.</p>
          <div class="row wrap">
            <a class="btn primary" href="browse.html">Browse products</a>
            <a class="btn outline" href="search.html">Search</a>
          </div>
        </div>
      </div>
    </section>
  `);
}else{
  render(p);
  initGallery(p);
  initPricing(p);
  initShareAndReport(p);
  trackDetailView(p.id);
}

