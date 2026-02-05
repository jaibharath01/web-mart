import { qs, on, toast, escapeHtml } from "../utils.js";
import { openModal } from "../modal.js";
import { PRODUCTS, getProductById } from "../products.js";
import { addToCart, addRecent } from "../cart.js";
import { productCard } from "../ui.js";

export function initCommonDelegates(){
  // Add-to-cart buttons
  on(document, "click", "[data-add-to-cart]", (e, btn)=>{
    e.preventDefault();
    const id = btn.getAttribute("data-add-to-cart");
    addToCart(id, 1);
  });

  // Quick view modal
  on(document, "click", "[data-quick-view]", (e, btn)=>{
    e.preventDefault();
    const id = btn.getAttribute("data-quick-view");
    const p = getProductById(id);
    if(!p) return;
    openModal({
      title: "Quick view",
      bodyHtml: `
        <div class="layout-2" style="grid-template-columns: 1fr 1fr;">
          <div class="card" style="overflow:hidden;border-radius:22px;">
            <img src="${p.images?.[0]||""}" alt="${escapeHtml(p.title)}" style="width:100%;height:auto;display:block;">
          </div>
          <div>
            <h2 style="margin:0 0 8px;">${escapeHtml(p.title)}</h2>
            <p class="note">Condition: <strong>${escapeHtml(p.condition)}</strong> • Location: <strong>${escapeHtml(p.location)}</strong></p>
            <div class="divider"></div>
            <p>${escapeHtml(p.description)}</p>
            <div class="row wrap" style="margin-top:10px;">
              <a class="btn outline" href="product-detail.html?id=${encodeURIComponent(p.id)}">Full details</a>
              <button class="btn primary" type="button" data-add-to-cart="${escapeHtml(p.id)}">Add to cart</button>
            </div>
          </div>
        </div>
      `
    });
  });

  // “Offer” placeholder
  on(document, "click", "[data-make-offer]", (e)=>{
    e.preventDefault();
    toast({ title:"Make offer", message:"Offer flow is a UI placeholder in this demo.", tone:"accent" });
  });
}

export function renderTrending(el){
  if(!el) return;
  const list = PRODUCTS.filter(p=>p.trending).slice(0, 10);
  el.innerHTML = list.map(p=>`<div>${productCard(p)}</div>`).join("");
}

export function renderFeaturedSellers(el){
  if(!el) return;
  const sellers = PRODUCTS
    .map(p=>p.seller)
    .filter(Boolean)
    .reduce((acc, s)=>{
      if(acc.find(x=>x.id===s.id)) return acc;
      acc.push(s);
      return acc;
    }, [])
    .slice(0, 6);

  el.innerHTML = sellers.map(s=>`
    <div class="card pad">
      <div class="seller">
        <div class="avatar" aria-hidden="true">${escapeHtml(s.name.split(" ").map(x=>x[0]).slice(0,2).join(""))}</div>
        <div>
          <div class="row wrap" style="gap:8px;">
            <div class="name">${escapeHtml(s.name)}</div>
            ${(s.badge||[]).includes("Verified") ? `<span class="badge success">Verified</span>` : ``}
            ${(s.badge||[]).includes("Top rated") ? `<span class="badge accent">Top rated</span>` : ``}
          </div>
          <div class="meta">Avg response: ${escapeHtml(s.responseMins)} min • Sold: ${escapeHtml(s.sold)}</div>
          <div class="row wrap" style="margin-top:10px;">
            <a class="btn outline small" href="profile.html">View profile</a>
            <a class="btn primary small" href="messages.html">Contact</a>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

export function renderRecentViews(el){
  if(!el) return;
  const ids = JSON.parse(localStorage.getItem("webmart_recent_v1") || '{"ids":[]}').ids || [];
  const items = ids.map(getProductById).filter(Boolean);
  if(!items.length){
    el.innerHTML = `<div class="note">No recent views yet. Open a product to start tracking.</div>`;
    return;
  }
  el.innerHTML = `<div class="carousel">${items.map(p=>`<div>${productCard(p)}</div>`).join("")}</div>`;
}

export function trackDetailView(productId){
  if(productId) addRecent(productId);
}

