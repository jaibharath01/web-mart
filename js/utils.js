export const storage = {
  get(key, fallback = null){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch{
      return fallback;
    }
  },
  set(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  },
  del(key){
    localStorage.removeItem(key);
  }
};

export const session = {
  get(key, fallback = null){
    try{
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch{
      return fallback;
    }
  },
  set(key, value){
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  del(key){
    sessionStorage.removeItem(key);
  }
};

export function qs(sel, root=document){ return root.querySelector(sel); }
export function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

export function on(el, ev, sel, handler){
  // event delegation: on(document, 'click', '[data-x]', (e, target)=>{})
  el.addEventListener(ev, (e)=>{
    const t = e.target?.closest?.(sel);
    if(t && el.contains(t)) handler(e, t);
  });
}

export function uid(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function formatMoney(amount, currency="USD"){
  const n = Number(amount || 0);
  try{
    return new Intl.NumberFormat(undefined, { style:"currency", currency, maximumFractionDigits: 0 }).format(n);
  }catch{
    return `$${Math.round(n)}`;
  }
}

export function clamp(n, min, max){
  return Math.min(max, Math.max(min, n));
}

export function debounce(fn, wait=250){
  let t = null;
  return (...args)=>{
    clearTimeout(t);
    t = setTimeout(()=>fn(...args), wait);
  };
}

export function setAriaExpanded(btn, expanded){
  btn.setAttribute("aria-expanded", expanded ? "true" : "false");
}

export function toast({ title="Done", message="", tone="info", timeout=3500 }){
  let root = document.querySelector(".toast-stack");
  if(!root){
    root = document.createElement("div");
    root.className = "toast-stack";
    document.body.appendChild(root);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role","status");
  el.innerHTML = `
    <div class="row space-between">
      <div>
        <p class="title">${escapeHtml(title)}</p>
        <p class="msg">${escapeHtml(message)}</p>
      </div>
      <button class="icon-btn" type="button" aria-label="Dismiss notification">
        ${icon("x")}
      </button>
    </div>
  `;
  if(tone === "success") el.style.borderColor = "rgba(16,185,129,.35)";
  if(tone === "danger") el.style.borderColor = "rgba(239,68,68,.45)";
  if(tone === "accent") el.style.borderColor = "rgba(245,158,11,.45)";
  root.appendChild(el);
  const remove = ()=>{ el.remove(); };
  el.querySelector("button")?.addEventListener("click", remove);
  setTimeout(remove, timeout);
}

export function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

export function icon(name){
  // Single outline icon set (inline SVG).
  const common = `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  switch(name){
    case "search": return `<svg class="icon" viewBox="0 0 24 24" ${common}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`;
    case "cart": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M6 6h15l-1.5 8H7.5L6 6Z"/><path d="M6 6l-2-2"/><circle cx="9" cy="20" r="1.7"/><circle cx="18" cy="20" r="1.7"/></svg>`;
    case "heart": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z"/></svg>`;
    case "bell": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`;
    case "user": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg>`;
    case "menu": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>`;
    case "x": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>`;
    case "chevDown": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M6 9l6 6 6-6"/></svg>`;
    case "check": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M20 6 9 17l-5-5"/></svg>`;
    case "spark": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M12 2l1.3 5.2L18 9l-4.7 1.8L12 16l-1.3-5.2L6 9l4.7-1.8L12 2Z"/></svg>`;
    case "shield": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"/></svg>`;
    case "truck": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7.5" cy="19" r="1.7"/><circle cx="18.5" cy="19" r="1.7"/></svg>`;
    case "star": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M12 2l3.1 6.3L22 9.3l-5 4.9L18.2 22 12 18.6 5.8 22 7 14.2 2 9.3l6.9-1L12 2Z"/></svg>`;
    case "share": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>`;
    case "flag": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M5 3v18"/><path d="M5 4h12l-2 4 2 4H5"/></svg>`;
    case "image": return `<svg class="icon" viewBox="0 0 24 24" ${common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M21 15l-5-5L5 21"/></svg>`;
    case "edit": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>`;
    case "trash": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 16h10l1-16"/></svg>`;
    case "eye": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
    case "arrowUp": return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>`;
    default: return `<svg class="icon" viewBox="0 0 24 24" ${common}><path d="M12 20l9-16H3l9 16Z"/></svg>`;
  }
}

export function parseQuery(){
  const out = {};
  const u = new URL(window.location.href);
  u.searchParams.forEach((v,k)=>{ out[k] = v; });
  return out;
}

export function setMetaTitle(title){
  document.title = `${title} • WebMart`;
}

