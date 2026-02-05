import { qs, escapeHtml } from "../utils.js";
import { CATEGORIES, PRODUCTS } from "../products.js";
import { productCard } from "../ui.js";

function render(){
  const grid = qs("[data-cat-grid]");
  if(!grid) return;
  grid.innerHTML = CATEGORIES.map(c=>{
    const items = PRODUCTS.filter(p=>p.category===c.id).slice(0,3);
    return `
      <div class="card pad">
        <div class="row space-between">
          <div>
            <div class="emoji" aria-hidden="true" style="margin-bottom:6px;">${c.emoji}</div>
            <strong>${escapeHtml(c.name)}</strong>
          </div>
          <a class="btn ghost small" href="browse.html?category=${encodeURIComponent(c.id)}">Open</a>
        </div>
        <div class="divider"></div>
        ${items.length ? items.map(p=>`
          <div class="row space-between" style="margin-bottom:8px;">
            <span class="muted" style="max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(p.title)}</span>
            <strong>$${escapeHtml(Math.round(p.price))}</strong>
          </div>
        `).join("") : `<div class="note">No demo items yet.</div>`}
      </div>
    `;
  }).join("");
}

render();

