import { escapeHtml, icon, formatMoney } from "./utils.js";
import { isWishlisted, getCompare } from "./cart.js";

export function starsMarkup(rating){
  const r = Number(rating || 0);
  const full = Math.round(r);
  let out = "";
  for(let i=1;i<=5;i++){
    out += `<span class="${i<=full ? "on" : "off"}">${icon("star")}</span>`;
  }
  return `<span class="stars" aria-label="${r.toFixed(1)} out of 5 stars">${out}</span>`;
}

export function productCard(p, { compact=false } = {}){
  const wish = isWishlisted(p.id);
  const cmpIds = getCompare().ids || [];
  const inCompare = cmpIds.includes(p.id);
  const badges = [
    p.condition ? `<span class="badge">${escapeHtml(p.condition)}</span>` : "",
    p.acceptOffers ? `<span class="badge accent">Offers</span>` : "",
    p.seller?.badge?.includes("Verified") ? `<span class="badge success">Verified</span>` : ""
  ].filter(Boolean).join("");

  return `
    <article class="product-card" aria-label="${escapeHtml(p.title)}">
      <a href="product-detail.html?id=${encodeURIComponent(p.id)}" aria-label="Open product detail">
        <div class="product-media">
          <img loading="lazy" decoding="async" src="${p.images?.[0] || ""}" alt="${escapeHtml(p.title)}"/>
          <div class="product-badges">${badges}</div>
          <div class="product-actions" aria-label="Quick actions">
            <button type="button" aria-label="Toggle wishlist" data-wishlist-toggle="${escapeHtml(p.id)}" aria-pressed="${wish ? "true":"false"}">
              ${icon("heart")}
            </button>
            <button type="button" aria-label="Toggle compare" data-compare-toggle="${escapeHtml(p.id)}" aria-pressed="${inCompare ? "true":"false"}" title="Compare up to 4">
              ${icon("shield")}
            </button>
            <button type="button" aria-label="Quick view" data-quick-view="${escapeHtml(p.id)}" title="Quick view">
              ${icon("eye")}
            </button>
          </div>
        </div>
      </a>
      <div class="product-body">
        <h3 class="product-title">${escapeHtml(p.title)}</h3>
        <div class="product-meta">
          <span>${escapeHtml(p.location)}</span>
          <span>${escapeHtml(p.shipping?.includes("Shipping") ? "Ships" : "Pickup")}</span>
        </div>
        <div class="row space-between">
          <div>
            <div class="price">${formatMoney(p.price)}</div>
            <div class="rating">
              ${starsMarkup(p.rating)}
              <span class="muted">(${escapeHtml(p.reviews)})</span>
            </div>
          </div>
          <div class="row">
            <a class="btn outline small" href="product-detail.html?id=${encodeURIComponent(p.id)}">Details</a>
            <button class="btn primary small" type="button" data-add-to-cart="${escapeHtml(p.id)}">Add</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

export function emptyState({ title, message, ctaHref, ctaLabel }){
  return `
    <div class="card pad center" style="min-height:260px;text-align:center;">
      <div style="max-width:520px;">
        <div class="pill" style="justify-content:center;margin:0 auto 10px; width: fit-content;">${icon("spark")} Premium empty state</div>
        <h3 style="margin:0 0 8px;">${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        ${ctaHref ? `<a class="btn primary" href="${escapeHtml(ctaHref)}">${escapeHtml(ctaLabel || "Continue")}</a>` : ""}
      </div>
    </div>
  `;
}

