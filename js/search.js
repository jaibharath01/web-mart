import { qs, qsa, debounce, escapeHtml, parseQuery } from "./utils.js";
import { PRODUCTS, CATEGORIES, CONDITIONS } from "./products.js";

export function buildAutocompleteIndex(){
  // Basic token-based suggestions.
  const items = PRODUCTS.map(p=>{
    const cat = CATEGORIES.find(c=>c.id===p.category)?.name || "Other";
    return { id:p.id, title:p.title, category:cat, price:p.price, location:p.location };
  });
  return items;
}

export function attachHeaderSearch(){
  const wrap = qs("[data-header-search]");
  if(!wrap) return;
  const input = qs("input", wrap);
  const pop = qs(".search-pop", wrap);
  const index = buildAutocompleteIndex();

  const show = (items)=>{
    if(!pop) return;
    pop.innerHTML = items.slice(0,6).map(it=>`
      <div class="item" role="option" tabindex="0" data-suggest-id="${it.id}">
        <div>
          <strong>${escapeHtml(it.title)}</strong><br/>
          <small>${escapeHtml(it.category)} • ${escapeHtml(it.location)}</small>
        </div>
        <small>$${Math.round(it.price)}</small>
      </div>
    `).join("");
    pop.setAttribute("aria-hidden", items.length ? "false" : "true");
  };
  const hide = ()=>pop?.setAttribute("aria-hidden","true");

  const update = debounce(()=>{
    const q = String(input.value||"").trim().toLowerCase();
    if(!q){ hide(); return; }
    const m = index.filter(it=>it.title.toLowerCase().includes(q) || it.category.toLowerCase().includes(q));
    show(m);
  }, 120);

  input.addEventListener("input", update);
  input.addEventListener("focus", update);
  document.addEventListener("click", (e)=>{
    if(!wrap.contains(e.target)) hide();
  });

  const go = (idOrQuery)=>{
    const v = String(idOrQuery||"").trim();
    if(v.startsWith("p")) window.location.href = `product-detail.html?id=${encodeURIComponent(v)}`;
    else window.location.href = `search.html?q=${encodeURIComponent(v)}`;
  };

  pop?.addEventListener("click", (e)=>{
    const it = e.target.closest("[data-suggest-id]");
    if(!it) return;
    go(it.getAttribute("data-suggest-id"));
  });

  input.addEventListener("keydown", (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      go(input.value);
      hide();
    }
    if(e.key === "Escape") hide();
  });
}

export function filterProducts(filters){
  const {
    q = "",
    category = [],
    minPrice = null,
    maxPrice = null,
    condition = [],
    location = "",
    minRating = null,
    sort = "relevance"
  } = filters;

  const query = String(q||"").trim().toLowerCase();
  const loc = String(location||"").trim().toLowerCase();
  let out = PRODUCTS.slice();

  if(query){
    out = out.filter(p=>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (CATEGORIES.find(c=>c.id===p.category)?.name || "").toLowerCase().includes(query)
    );
  }
  if(category?.length){
    const set = new Set(category);
    out = out.filter(p=>set.has(p.category));
  }
  if(condition?.length){
    const set = new Set(condition);
    out = out.filter(p=>set.has(p.condition));
  }
  if(minPrice != null) out = out.filter(p=>p.price >= Number(minPrice));
  if(maxPrice != null) out = out.filter(p=>p.price <= Number(maxPrice));
  if(loc) out = out.filter(p=>p.location.toLowerCase().includes(loc));
  if(minRating != null) out = out.filter(p=>p.rating >= Number(minRating));

  if(sort === "price_asc") out.sort((a,b)=>a.price-b.price);
  if(sort === "price_desc") out.sort((a,b)=>b.price-a.price);
  if(sort === "rating_desc") out.sort((a,b)=>b.rating-a.rating);
  if(sort === "newest") out.sort((a,b)=>String(b.id).localeCompare(String(a.id)));
  if(sort === "popular") out.sort((a,b)=>(b.reviews*b.rating)-(a.reviews*a.rating));

  return out;
}

export function parseFiltersFromUI(root){
  const getChecked = (name)=>qsa(`input[name="${name}"]:checked`, root).map(x=>x.value);
  const q = qs('input[name="q"]', root)?.value || "";
  const category = getChecked("category");
  const condition = getChecked("condition");
  const location = qs('input[name="location"]', root)?.value || "";
  const minRating = qs('select[name="minRating"]', root)?.value || "";
  const sort = qs('select[name="sort"]', root)?.value || "relevance";
  const minPrice = qs('input[name="minPrice"]', root)?.value || "";
  const maxPrice = qs('input[name="maxPrice"]', root)?.value || "";

  return {
    q,
    category,
    condition,
    location,
    minRating: minRating ? Number(minRating) : null,
    sort,
    minPrice: minPrice ? Number(minPrice) : null,
    maxPrice: maxPrice ? Number(maxPrice) : null
  };
}

export function hydrateFiltersFromQuery(root){
  const q = parseQuery();
  const setVal = (sel, v)=>{
    const el = qs(sel, root);
    if(el && v != null) el.value = v;
  };
  setVal('input[name="q"]', q.q || "");
  setVal('select[name="sort"]', q.sort || "relevance");
  setVal('input[name="location"]', q.location || "");
  setVal('input[name="minPrice"]', q.minPrice || "");
  setVal('input[name="maxPrice"]', q.maxPrice || "");
  setVal('select[name="minRating"]', q.minRating || "");

  const setChecks = (name, values)=>{
    const arr = Array.isArray(values) ? values : String(values||"").split(",").filter(Boolean);
    if(!arr.length) return;
    qsa(`input[name="${name}"]`, root).forEach(el=>{
      el.checked = arr.includes(el.value);
    });
  };
  setChecks("category", q.category);
  setChecks("condition", q.condition);
}

export function defaultFilterOptions(){
  return { categories: CATEGORIES, conditions: CONDITIONS };
}

