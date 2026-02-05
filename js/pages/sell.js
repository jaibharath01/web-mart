import { qs, qsa, on, toast, escapeHtml, uid, formatMoney } from "../utils.js";
import { openModal } from "../modal.js";
import { attachRealtimeValidation, validateForm, attachCharacterCounters, draftBind, validateField } from "../forms.js";
import { CATEGORIES } from "../products.js";

const DRAFT_KEY = "webmart_sell_draft_v1";
const LISTINGS_KEY = "webmart_listings_v1";

function getListings(){
  try{ return JSON.parse(localStorage.getItem(LISTINGS_KEY) || "[]"); }catch{ return []; }
}
function setListings(listings){
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

function initCategorySelect(){
  const sel = qs('select[name="category"]');
  if(!sel) return;
  sel.innerHTML = `<option value="">Select category</option>` + CATEGORIES.map(c=>`<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join("");
}

function currentStep(){
  return Number(qs("[data-sell-form]")?.getAttribute("data-current-step") || "1");
}

function setStep(step){
  const form = qs("[data-sell-form]");
  if(!form) return;
  const s = Math.max(1, Math.min(6, Number(step||1)));
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
  const next = qs("[data-next]");
  const prev = qs("[data-prev]");
  if(prev) prev.disabled = s === 1;
  if(next) next.textContent = s === 6 ? "Review" : "Next";
}

function priceSuggestion(){
  const cat = qs('select[name="category"]')?.value;
  const cond = qs('select[name="condition"]')?.value;
  const hint = qs("[data-price-suggestion]");
  if(!hint) return;
  // Quick heuristic suggestions per category.
  const base = ({
    electronics: 380, fashion: 90, home: 260, sports: 420, toys: 140,
    books: 55, auto: 160, beauty: 190, jewelry: 240, collectibles: 310
  })[cat] || 200;
  const mult = cond === "New" ? 1.15 : cond === "Like New" ? 1.05 : cond === "Good" ? 0.92 : 0.8;
  const low = Math.round(base * mult * 0.85);
  const high = Math.round(base * mult * 1.15);
  hint.textContent = `Suggested: ${formatMoney(low)}–${formatMoney(high)}`;
}

function initAcceptOffersToggle(){
  const sw = qs("[data-accept-offers]");
  const cb = qs('input[name="acceptOffers"]');
  if(!sw || !cb) return;
  const sync = ()=>{
    sw.setAttribute("aria-checked", cb.checked ? "true" : "false");
  };
  sync();
  sw.addEventListener("click", ()=>{
    cb.checked = !cb.checked;
    sync();
    toast({ title:"Offers updated", message: cb.checked ? "Buyers can make offers on your listing." : "Offers disabled. Fixed-price listing.", tone:"accent" });
  });
}

function initRichEditor(){
  const ed = qs("[data-rich]");
  const hidden = qs('input[name="descRichHtml"]');
  if(!ed || !hidden) return;
  const sync = ()=>{ hidden.value = sanitizeRich(ed.innerHTML); };
  ed.addEventListener("input", sync);
  sync();

  on(document, "click", "[data-rt]", (e, btn)=>{
    const action = btn.getAttribute("data-rt");
    ed.focus();
    if(action === "bold") document.execCommand("bold");
    if(action === "italic") document.execCommand("italic");
    if(action === "ul") document.execCommand("insertUnorderedList");
    if(action === "link"){
      const url = prompt("Enter a URL (https://...)");
      if(url) document.execCommand("createLink", false, url);
    }
    sync();
  });

  function sanitizeRich(html){
    // Very small allowlist for demo: b/i/strong/em/ul/ol/li/a/br/p
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const allowed = new Set(["B","I","STRONG","EM","UL","OL","LI","A","BR","P","DIV"]);
    const walk = (node)=>{
      const kids = Array.from(node.childNodes);
      for(const k of kids){
        if(k.nodeType === Node.ELEMENT_NODE){
          if(!allowed.has(k.tagName)){
            // unwrap
            const frag = document.createDocumentFragment();
            while(k.firstChild) frag.appendChild(k.firstChild);
            k.replaceWith(frag);
            continue;
          }
          if(k.tagName === "A"){
            const href = k.getAttribute("href") || "";
            if(!/^https?:\/\//i.test(href)) k.removeAttribute("href");
            k.setAttribute("rel","nofollow noopener");
            k.setAttribute("target","_blank");
          }
          // strip all attributes except href/rel/target for links
          if(k.tagName !== "A"){
            Array.from(k.attributes).forEach(a=>k.removeAttribute(a.name));
          }else{
            Array.from(k.attributes).forEach(a=>{
              if(!["href","rel","target"].includes(a.name)) k.removeAttribute(a.name);
            });
          }
          walk(k);
        }
      }
    };
    walk(tmp);
    // Convert DIVs to P for nicer formatting
    tmp.querySelectorAll("div").forEach(d=>{
      const p = document.createElement("p");
      p.innerHTML = d.innerHTML;
      d.replaceWith(p);
    });
    return tmp.innerHTML.trim();
  }
}

function initPhotos(){
  const dz = qs("[data-dropzone]");
  const input = qs("[data-file-input]");
  const grid = qs("[data-photo-grid]");
  const field = dz?.closest(".field");
  if(!dz || !input || !grid) return { get:()=>[], set:()=>{} };

  let photos = []; // array of { id, name, dataUrl }
  let dragId = null;

  const validate = ()=>{
    const ok = photos.length >= 1 && photos.length <= 8;
    field?.classList.toggle("invalid", !ok);
    return ok;
  };

  const render = ()=>{
    grid.innerHTML = photos.map((p, idx)=>`
      <div class="thumb-tile" draggable="true" data-photo-id="${escapeHtml(p.id)}" aria-label="Photo ${idx+1}">
        <img src="${p.dataUrl}" alt="Uploaded photo ${idx+1}" />
        <div class="overlay">
          <small style="color:#fff; font-weight:800;">#${idx+1}</small>
          <div class="row" style="gap:8px;">
            <button type="button" aria-label="Set as cover" data-photo-cover="${escapeHtml(p.id)}">★</button>
            <button type="button" aria-label="Remove photo" data-photo-remove="${escapeHtml(p.id)}">×</button>
          </div>
        </div>
      </div>
    `).join("");
    validate();
  };

  const readFiles = async (files)=>{
    const list = Array.from(files || []);
    for(const f of list){
      if(photos.length >= 8) break;
      const dataUrl = await fileToDataUrl(f);
      photos.push({ id: uid("img"), name: f.name, dataUrl });
    }
    photos = photos.slice(0, 8);
    render();
  };

  const openPicker = ()=>input.click();
  dz.addEventListener("click", openPicker);
  dz.addEventListener("keydown", (e)=>{ if(e.key === "Enter" || e.key === " ") openPicker(); });

  input.addEventListener("change", ()=>{ readFiles(input.files); input.value = ""; });

  dz.addEventListener("dragover", (e)=>{ e.preventDefault(); dz.classList.add("dragover"); });
  dz.addEventListener("dragleave", ()=>dz.classList.remove("dragover"));
  dz.addEventListener("drop", (e)=>{
    e.preventDefault();
    dz.classList.remove("dragover");
    readFiles(e.dataTransfer.files);
  });

  on(grid, "click", "[data-photo-remove]", (e, btn)=>{
    const id = btn.getAttribute("data-photo-remove");
    photos = photos.filter(x=>x.id!==id);
    render();
  });
  on(grid, "click", "[data-photo-cover]", (e, btn)=>{
    const id = btn.getAttribute("data-photo-cover");
    const idx = photos.findIndex(x=>x.id===id);
    if(idx > 0){
      const [p] = photos.splice(idx, 1);
      photos.unshift(p);
      render();
      toast({ title:"Cover updated", message:"First photo is now the cover.", tone:"success" });
    }
  });

  // Drag reorder
  grid.addEventListener("dragstart", (e)=>{
    const tile = e.target.closest("[data-photo-id]");
    if(!tile) return;
    dragId = tile.getAttribute("data-photo-id");
    tile.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  grid.addEventListener("dragend", (e)=>{
    const tile = e.target.closest("[data-photo-id]");
    tile?.classList.remove("dragging");
    dragId = null;
  });
  grid.addEventListener("dragover", (e)=>{
    e.preventDefault();
    const over = e.target.closest("[data-photo-id]");
    if(!over || !dragId) return;
    const overId = over.getAttribute("data-photo-id");
    if(overId === dragId) return;
    const from = photos.findIndex(x=>x.id===dragId);
    const to = photos.findIndex(x=>x.id===overId);
    if(from < 0 || to < 0) return;
    const [m] = photos.splice(from, 1);
    photos.splice(to, 0, m);
    render();
  });

  const api = {
    get: ()=>photos.slice(),
    set: (arr)=>{ photos = Array.isArray(arr) ? arr.slice(0,8) : []; render(); }
  };
  return api;

  function fileToDataUrl(file){
    return new Promise((resolve, reject)=>{
      const r = new FileReader();
      r.onload = ()=>resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
}

function collectShipping(form){
  const ship = [];
  if(form.elements.namedItem("shipShipping")?.checked) ship.push("Shipping");
  if(form.elements.namedItem("shipPickup")?.checked) ship.push("Local pickup");
  if(form.elements.namedItem("shipDelivery")?.checked) ship.push("Delivery radius");
  return ship;
}

function buildPreview({ values, photos }){
  const cover = photos?.[0]?.dataUrl || "";
  const ship = values.ship;
  const offers = values.acceptOffers ? `<span class="badge accent">Offers</span>` : "";
  const badges = `
    <span class="badge">${escapeHtml(values.condition||"")}</span>
    <span class="badge">${escapeHtml(ship.join(", ") || "Pickup")}</span>
    ${offers}
  `;
  return `
    <div class="layout-2" style="grid-template-columns: 1fr 1fr;">
      <div class="card" style="overflow:hidden;border-radius:22px;">
        ${cover ? `<img src="${cover}" alt="Cover photo" style="width:100%;display:block;object-fit:cover;aspect-ratio:4/3;" />` : `<div class="center" style="aspect-ratio:4/3;">Add photos to preview</div>`}
      </div>
      <div>
        <div class="row wrap">${badges}</div>
        <h2 style="margin:10px 0 6px; font-size:1.35rem;">${escapeHtml(values.title || "Untitled listing")}</h2>
        <div class="price" style="font-size:1.35rem;">${formatMoney(Number(values.price||0))}</div>
        <p class="note">${escapeHtml(values.location||"")}</p>
        <div class="divider"></div>
        <h3>Summary</h3>
        <p>${escapeHtml(values.descPlain || "")}</p>
        <div class="divider"></div>
        <h3>Rich description</h3>
        <div class="card pad" style="background: var(--surface);">${values.descRichHtml || `<p class="note">Add a rich description to stand out.</p>`}</div>
      </div>
    </div>
  `;
}

function init(){
  const form = qs("[data-sell-form]");
  if(!form) return;
  initCategorySelect();
  attachCharacterCounters(form);
  attachRealtimeValidation(form);
  initAcceptOffersToggle();
  initRichEditor();

  // Photos and draft binding (includes photo data).
  const photosApi = initPhotos();
  const binder = draftBind({
    key: DRAFT_KEY,
    formSelector: "[data-sell-form]",
    extraSerialize: ()=>({
      photos: photosApi.get(),
      restore: ()=>{}
    })
  });

  // Restore draft if present (also restores photos)
  const existing = sessionStorage.getItem(DRAFT_KEY);
  if(existing){
    binder.load();
    try{
      const d = JSON.parse(existing);
      if(d?.extra?.photos) photosApi.set(d.extra.photos);
    }catch{}
  }

  // Step navigation with validation gates
  setStep(1);
  qs("[data-prev]")?.addEventListener("click", ()=>{
    setStep(currentStep() - 1);
  });
  qs("[data-next]")?.addEventListener("click", ()=>{
    const s = currentStep();
    if(!validateStep(s, { photosApi, form })) return;
    setStep(s + 1);
    if(s + 1 === 6) renderPreview();
  });

  qs("[data-save-draft]")?.addEventListener("click", ()=>{
    toast({ title:"Draft saved", message:"Your listing is saved and will restore automatically.", tone:"success" });
  });
  qs("[data-draft-clear]")?.addEventListener("click", ()=>{
    sessionStorage.removeItem(DRAFT_KEY);
    toast({ title:"Draft cleared", message:"Draft removed from this browser session." });
  });

  // Price suggestion updates
  qsa('select[name="category"], select[name="condition"]').forEach(el=>el.addEventListener("change", priceSuggestion));
  priceSuggestion();

  function values(){
    const fd = new FormData(form);
    const acceptOffers = !!form.elements.namedItem("acceptOffers")?.checked;
    const ship = collectShipping(form);
    return {
      title: String(fd.get("title")||"").trim(),
      category: String(fd.get("category")||"").trim(),
      condition: String(fd.get("condition")||"").trim(),
      location: String(fd.get("location")||"").trim(),
      price: String(fd.get("price")||"").trim(),
      offerMin: String(fd.get("offerMin")||"").trim(),
      acceptOffers,
      descPlain: String(fd.get("descPlain")||"").trim(),
      descRichHtml: String(fd.get("descRichHtml")||"").trim(),
      ship,
      deliveryRadius: String(fd.get("deliveryRadius")||"").trim()
    };
  }

  function renderPreview(){
    const p = qs("[data-preview]");
    if(!p) return;
    const v = values();
    const photos = photosApi.get();
    p.innerHTML = buildPreview({ values: v, photos });
  }

  qs("[data-preview-open]")?.addEventListener("click", ()=>{
    const v = values();
    const photos = photosApi.get();
    openModal({ title:"Listing preview", bodyHtml: buildPreview({ values: v, photos }) });
  });

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    // Validate all steps quickly
    for(let s=1; s<=6; s++){
      if(!validateStep(s, { photosApi, form })) { setStep(s); return; }
    }
    const v = values();
    const photos = photosApi.get();
    if(!photos.length){
      toast({ title:"Add photos", message:"Upload at least 1 photo to publish.", tone:"danger" });
      setStep(4);
      return;
    }
    const listing = {
      id: uid("l"),
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...v,
      price: Number(v.price || 0),
      offerMin: v.offerMin ? Number(v.offerMin) : null,
      photos,
      sellerName: "You"
    };
    const listings = getListings();
    listings.unshift(listing);
    setListings(listings);
    sessionStorage.removeItem(DRAFT_KEY);
    toast({ title:"Published", message:"Your listing is now live (demo).", tone:"success" });
    window.location.href = "dashboard.html#listings";
  });

  // Keep preview fresh if user edits on step 6
  form.addEventListener("input", ()=>{
    if(currentStep() === 6) renderPreview();
  });

  // Step pill click (progressive disclosure with validation)
  on(document, "click", "[data-step-pill]", (e, pill)=>{
    const target = Number(pill.getAttribute("data-step-pill"));
    // allow going back freely; forward requires validation of current step
    const cur = currentStep();
    if(target > cur && !validateStep(cur, { photosApi, form })) return;
    setStep(target);
    if(target === 6) renderPreview();
  });
}

function validateStep(step, { photosApi, form }){
  if(step === 1){
    // validate title/category/condition/location
    const ok = validateFormBlock(form, [ "title", "category", "condition", "location" ]);
    return ok;
  }
  if(step === 2){
    const ok = validateFormBlock(form, [ "price" ]);
    return ok;
  }
  if(step === 3){
    const ok = validateFormBlock(form, [ "descPlain" ]);
    // Rich editor: require at least 40 chars of visible text (demo gate)
    const ed = qs("[data-rich]");
    const visible = String(ed?.textContent || "").trim();
    if(visible.length < 40){
      toast({ title:"Add more detail", message:"Rich description should be at least ~40 characters for best results.", tone:"accent" });
      return false;
    }
    return ok;
  }
  if(step === 4){
    const photos = photosApi.get();
    const ok = photos.length >= 1 && photos.length <= 8;
    if(!ok) toast({ title:"Photos required", message:"Add 1–8 photos to continue.", tone:"danger" });
    return ok;
  }
  if(step === 5){
    const ship = collectShipping(form);
    if(!ship.length){
      toast({ title:"Choose shipping", message:"Select at least one shipping option.", tone:"danger" });
      return false;
    }
    return true;
  }
  return true;
}

function validateFormBlock(form, names){
  let ok = true;
  for(const n of names){
    const el = form.elements.namedItem(n);
    if(!el) continue;
    const field = el.closest(".field");
    if(field) ok = validateField(field) && ok;
  }
  if(!ok) toast({ title:"Fix fields", message:"Please correct the highlighted fields to continue.", tone:"danger" });
  return ok;
}

init();

