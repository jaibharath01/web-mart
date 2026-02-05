import { qs } from "../utils.js";
import { CATEGORIES, PRODUCTS } from "../products.js";
import { productCard } from "../ui.js";
import { initCommonDelegates, renderFeaturedSellers, renderRecentViews } from "./common-page.js";

function renderCategories(){
  const el = qs("[data-home-categories]");
  if(!el) return;
  el.innerHTML = CATEGORIES.map(c=>`
    <a class="category" href="browse.html?category=${encodeURIComponent(c.id)}" aria-label="Browse ${c.name}">
      <div class="emoji" aria-hidden="true">${c.emoji}</div>
      <div>
        <strong>${c.name}</strong>
        <small>Shop premium picks</small>
      </div>
    </a>
  `).join("");
}

function renderTrending(){
  const el = qs("[data-home-trending]");
  if(!el) return;
  const list = PRODUCTS.filter(p=>p.trending).slice(0, 10);
  el.innerHTML = list.map(p=>`<div>${productCard(p)}</div>`).join("");

  const mini = qs("[data-home-trending-mini]");
  if(mini){
    mini.innerHTML = list.slice(0,3).map(p=>`
      <a class="card pad" href="product-detail.html?id=${encodeURIComponent(p.id)}" style="display:flex; gap:12px; align-items:center;">
        <img src="${p.images?.[0]||""}" alt="" loading="lazy" style="width:64px;height:48px;border-radius:14px;object-fit:cover;border:1px solid var(--border);"/>
        <div style="min-width:0;">
          <div style="font-weight:900; letter-spacing:-.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.title}</div>
          <div class="note">${p.location} • $${Math.round(p.price)}</div>
        </div>
      </a>
    `).join("");
  }
}

function animateCounters(){
  const nodes = document.querySelectorAll("[data-counter]");
  nodes.forEach(n=>{
    const end = Number(String(n.textContent||"").replaceAll(",","")) || 0;
    const start = Math.max(0, Math.round(end * 0.72));
    const t0 = performance.now();
    const dur = 900;
    const step = (t)=>{
      const k = Math.min(1, (t - t0)/dur);
      const val = Math.round(start + (end-start) * (1 - Math.pow(1-k, 3)));
      n.textContent = val.toLocaleString();
      if(k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

initCommonDelegates();
renderCategories();
renderTrending();
renderFeaturedSellers(qs("[data-home-sellers]"));
renderRecentViews(qs("[data-home-recents]"));
animateCounters();

