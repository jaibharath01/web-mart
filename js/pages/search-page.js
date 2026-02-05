import { qs, on, debounce, escapeHtml } from "../utils.js";
import { buildAutocompleteIndex, filterProducts } from "../search.js";
import { productCard } from "../ui.js";

const index = buildAutocompleteIndex();

function renderResults(list){
  const el = qs("[data-results]");
  if(!el) return;
  if(!list.length){
    el.innerHTML = `
      <div class="card pad center" style="min-height:240px;text-align:center;">
        <h3>No results</h3>
        <p class="note">Try a simpler query or browse categories.</p>
        <a class="btn primary" href="browse.html">Go to browse</a>
      </div>
    `;
    return;
  }
  el.innerHTML = list.slice(0, 20).map(p=>productCard(p)).join("");
}

function attachSearch(){
  const bar = qs("[data-search-bar]");
  if(!bar) return;
  const input = bar.querySelector("input");
  const pop = bar.querySelector(".search-pop");

  const show = (items)=>{
    pop.innerHTML = items.slice(0,6).map(it=>`
      <div class="item" data-suggest="${escapeHtml(it.title)}">${escapeHtml(it.title)}</div>
    `).join("");
    pop.setAttribute("aria-hidden", items.length ? "false":"true");
  };
  const hide = ()=>pop.setAttribute("aria-hidden","true");

  const run = ()=>{
    const q = String(input.value||"").trim();
    const results = filterProducts({ q });
    renderResults(results);
  };

  const update = debounce(()=>{
    const q = String(input.value||"").trim().toLowerCase();
    if(!q){ hide(); renderResults([]); return; }
    const m = index.filter(it=>it.title.toLowerCase().includes(q));
    show(m);
    run();
  }, 120);

  input.addEventListener("input", update);
  input.addEventListener("focus", update);
  document.addEventListener("click", (e)=>{ if(!bar.contains(e.target)) hide(); });

  pop.addEventListener("click", (e)=>{
    const it = e.target.closest("[data-suggest]");
    if(!it) return;
    input.value = it.getAttribute("data-suggest");
    hide();
    run();
  });
}

on(document, "change", "[data-sort]", (e, sel)=>{
  const q = qs("[data-search-bar] input")?.value || "";
  const sort = sel.value;
  renderResults(filterProducts({ q, sort }));
});

attachSearch();
renderResults(filterProducts({ q: "" }));

