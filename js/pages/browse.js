import { qs, qsa, on, escapeHtml } from "../utils.js";
import { PRODUCTS, CATEGORIES, CONDITIONS, getProductById } from "../products.js";
import { initCommonDelegates } from "./common-page.js";
import { filterProducts, parseFiltersFromUI, hydrateFiltersFromQuery } from "../search.js";
import { productCard, emptyState, starsMarkup } from "../ui.js";

const PAGE_SIZE = 9;

function renderFilterOptions(){
  const catEl = qs("[data-filter-categories]");
  const condEl = qs("[data-filter-conditions]");
  if(catEl){
    catEl.innerHTML = CATEGORIES.map(c=>`
      <label class="toggle" style="padding:10px 12px;">
        <input type="checkbox" name="category" value="${escapeHtml(c.id)}" aria-label="Category ${escapeHtml(c.name)}" style="margin-right:10px;"/>
        <span>${escapeHtml(c.name)}</span>
      </label>
    `).join("");
  }
  if(condEl){
    condEl.innerHTML = CONDITIONS.map(c=>`
      <label class="toggle" style="padding:10px 12px;">
        <input type="checkbox" name="condition" value="${escapeHtml(c)}" aria-label="Condition ${escapeHtml(c)}" style="margin-right:10px;"/>
        <span>${escapeHtml(c)}</span>
      </label>
    `).join("");
  }
}

function setView(view){
  const results = qs("[data-results]");
  if(!results) return;
  const isGrid = view === "grid";
  results.classList.toggle("products-grid", isGrid);
  results.classList.toggle("products-list", !isGrid);
  localStorage.setItem("webmart_view_v1", view);
  qsa('[data-view]').forEach(b=>b.setAttribute("aria-pressed", b.getAttribute("data-view") === view ? "true":"false"));
}

function listRowMarkup(p){
  return `
    <div class="list-row">
      <a class="thumb" href="product-detail.html?id=${encodeURIComponent(p.id)}" aria-label="Open product detail">
        <img src="${p.images?.[0]||""}" loading="lazy" alt="${escapeHtml(p.title)}"/>
      </a>
      <div>
        <div class="row wrap" style="justify-content:space-between;">
          <div style="min-width:0;">
            <div style="font-weight:900; letter-spacing:-.02em; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${escapeHtml(p.title)}
            </div>
            <div class="note">${escapeHtml(p.location)} • ${escapeHtml(p.condition)} • ${escapeHtml(p.shipping?.includes("Shipping") ? "Ships" : "Pickup")}</div>
          </div>
          <div style="text-align:right;">
            <div class="price" style="font-size:1.2rem;">$${Math.round(p.price)}</div>
            <div class="rating" style="justify-content:flex-end;">${starsMarkup(p.rating)} <span class="muted">(${escapeHtml(p.reviews)})</span></div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="row wrap" style="justify-content:space-between;">
          <div class="note">Seller: <strong>${escapeHtml(p.seller?.name || "Seller")}</strong> • Response: <strong>${escapeHtml(p.seller?.responseMins ?? 45)} min</strong></div>
          <div class="row wrap">
            <button class="btn outline small" type="button" data-quick-view="${escapeHtml(p.id)}">Quick view</button>
            <button class="btn primary small" type="button" data-add-to-cart="${escapeHtml(p.id)}">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPagination({ total, page }){
  const el = qs("[data-pagination]");
  if(!el) return;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = [];
  const mk = (p, label=p, cur=false)=>`<button class="page-btn" type="button" data-page="${p}" ${cur?'aria-current="page"':''}>${label}</button>`;
  items.push(mk(Math.max(1, page-1), "Prev"));
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  for(let p=start; p<=end; p++) items.push(mk(p, p, p===page));
  items.push(mk(Math.min(pages, page+1), "Next"));
  el.innerHTML = items.join("");
}

function writeStateToUrl(state){
  const u = new URL(window.location.href);
  const set = (k, v)=>{
    if(v == null || v === "" || (Array.isArray(v) && v.length===0)) u.searchParams.delete(k);
    else u.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v));
  };
  set("q", state.q);
  set("category", state.category);
  set("condition", state.condition);
  set("location", state.location);
  set("minPrice", state.minPrice);
  set("maxPrice", state.maxPrice);
  set("minRating", state.minRating);
  set("sort", state.sort);
  u.searchParams.set("page", String(state.page || 1));
  history.replaceState(null, "", u.toString());
}

function renderCompareTable(){
  const el = qs("[data-compare-table]");
  const ids = JSON.parse(localStorage.getItem("webmart_compare_v1") || '{"ids":[]}').ids || [];
  const items = ids.map(getProductById).filter(Boolean);
  if(!el) return;
  if(!items.length){
    el.innerHTML = `Add items to compare from any product card.`;
    return;
  }
  el.innerHTML = `
    <div class="card pad" style="overflow:auto;">
      <table style="width:100%; border-collapse:collapse; font-size: var(--small);">
        <thead>
          <tr>
            <th style="text-align:left; padding:10px; border-bottom:1px solid var(--border);">Item</th>
            ${items.map(p=>`<th style="text-align:left; padding:10px; border-bottom:1px solid var(--border);">${escapeHtml(p.id)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${row("Title", items.map(p=>escapeHtml(p.title)))}
          ${row("Price", items.map(p=>`$${Math.round(p.price)}`))}
          ${row("Condition", items.map(p=>escapeHtml(p.condition)))}
          ${row("Rating", items.map(p=>`${p.rating.toFixed(1)} (${p.reviews})`))}
          ${row("Location", items.map(p=>escapeHtml(p.location)))}
          ${row("Offers", items.map(p=>p.acceptOffers ? "Yes" : "No"))}
          ${row("Shipping", items.map(p=>escapeHtml(p.shipping?.join(", ") || "Pickup")))}
        </tbody>
      </table>
    </div>
  `;
  function row(label, vals){
    return `
      <tr>
        <td style="padding:10px; border-bottom:1px solid var(--border); color: var(--muted);">${label}</td>
        ${vals.map(v=>`<td style="padding:10px; border-bottom:1px solid var(--border);">${v}</td>`).join("")}
      </tr>
    `;
  }
}

function render(){
  const resultsEl = qs("[data-results]");
  const countEl = qs("[data-result-count]");
  const suggestedEl = qs("[data-suggested]");
  const sortEl = qs("[data-sort]");
  const form = qs("[data-filters]");
  if(!resultsEl || !form) return;

  const url = new URL(window.location.href);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const base = parseFiltersFromUI(form);
  const state = { ...base, sort: sortEl?.value || base.sort, page };

  const filtered = filterProducts(state);
  const total = filtered.length;

  if(countEl) countEl.textContent = String(total);
  if(suggestedEl){
    suggestedEl.textContent = total ? `Tip: Use “Compare” on cards to shortlist faster.` : `Try a different category or broaden your price range.`;
  }

  const start = (page - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  const view = localStorage.getItem("webmart_view_v1") || "grid";
  setView(view);

  resultsEl.setAttribute("aria-busy","true");
  requestAnimationFrame(()=>{
    if(!slice.length){
      resultsEl.innerHTML = emptyState({
        title: "No results",
        message: "Try clearing filters, changing category, or searching for a broader term like “phone” or “table”.",
        ctaHref: "browse.html",
        ctaLabel: "Reset browse"
      });
    }else if(view === "list"){
      resultsEl.innerHTML = slice.map(listRowMarkup).join("");
    }else{
      resultsEl.innerHTML = slice.map(p=>productCard(p)).join("");
    }
    resultsEl.setAttribute("aria-busy","false");
    renderPagination({ total, page });
    renderCompareTable();
    writeStateToUrl(state);
  });
}

initCommonDelegates();
renderFilterOptions();

const form = qs("[data-filters]");
hydrateFiltersFromQuery(document);
qs("[data-sort]")?.addEventListener("change", ()=>{ render(); });

form?.addEventListener("submit", (e)=>{ e.preventDefault(); history.replaceState(null,"",new URL(window.location.href).toString()); render(); });
qs("[data-reset]")?.addEventListener("click", ()=>{
  form?.reset();
  qsa('input[name="category"], input[name="condition"]').forEach(x=>x.checked=false);
  const u = new URL(window.location.href);
  u.search = "";
  history.replaceState(null,"",u.toString());
  render();
});

on(document, "click", "[data-page]", (e, btn)=>{
  e.preventDefault();
  const p = Number(btn.getAttribute("data-page") || "1") || 1;
  const u = new URL(window.location.href);
  u.searchParams.set("page", String(p));
  history.replaceState(null,"",u.toString());
  render();
  window.scrollTo({ top: 0, behavior:"smooth" });
});

on(document, "click", "[data-view]", (e, btn)=>{
  const v = btn.getAttribute("data-view");
  setView(v);
  render();
});

document.addEventListener("webmart:compare_updated", renderCompareTable);
qs("[data-compare-open]")?.addEventListener("click", ()=>{
  const target = document.querySelector("#compare");
  target?.scrollIntoView({ behavior:"smooth", block:"start" });
});

render();

