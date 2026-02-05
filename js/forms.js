import { qs, qsa, toast, session, debounce } from "./utils.js";

export function validateField(fieldEl){
  const input = fieldEl.querySelector("input,select,textarea");
  const err = fieldEl.querySelector(".error-text");
  if(!input) return true;

  const value = (input.type === "checkbox") ? (input.checked ? "1" : "") : String(input.value ?? "").trim();
  let msg = "";
  const required = input.hasAttribute("required");
  if(required && !value) msg = "This field is required.";

  if(!msg && input.dataset.minlength){
    const min = Number(input.dataset.minlength);
    if(value.length < min) msg = `Use at least ${min} characters.`;
  }
  if(!msg && input.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value)){
    msg = "Enter a valid email address.";
  }
  if(!msg && input.dataset.pattern){
    const re = new RegExp(input.dataset.pattern);
    if(value && !re.test(value)) msg = input.dataset.patternMsg || "Please match the requested format.";
  }
  if(!msg && input.dataset.min){
    const min = Number(input.dataset.min);
    if(value && Number(value) < min) msg = `Must be at least ${min}.`;
  }

  const ok = !msg;
  fieldEl.classList.toggle("invalid", !ok);
  if(err) err.textContent = msg;
  input.setAttribute("aria-invalid", ok ? "false" : "true");
  return ok;
}

export function attachRealtimeValidation(root=document){
  qsa(".field[data-validate]", root).forEach(field=>{
    const input = field.querySelector("input,select,textarea");
    if(!input) return;
    const fn = debounce(()=>validateField(field), 150);
    input.addEventListener("input", fn);
    input.addEventListener("blur", ()=>validateField(field));
  });
}

export function validateForm(formEl){
  const fields = qsa(".field[data-validate]", formEl);
  let ok = true;
  for(const f of fields) ok = validateField(f) && ok;
  if(!ok) toast({ title:"Fix highlighted fields", message:"Review the form for validation messages.", tone:"danger" });
  return ok;
}

export function attachCharacterCounters(root=document){
  qsa("[data-counter-for]", root).forEach(counter=>{
    const id = counter.getAttribute("data-counter-for");
    const input = qs(`#${CSS.escape(id)}`, root);
    if(!input) return;
    const max = Number(input.getAttribute("maxlength") || input.dataset.maxlength || 0) || null;
    const update = ()=>{
      const len = String(input.value||"").length;
      counter.textContent = max ? `${len}/${max}` : `${len} characters`;
      counter.style.color = max && len > max ? "var(--danger)" : "";
    };
    input.addEventListener("input", update);
    update();
  });
}

export function draftBind({ key, formSelector, extraSerialize }){
  const form = qs(formSelector);
  if(!form) return { load:()=>{}, clear:()=>{} };
  const load = ()=>{
    const d = session.get(key, null);
    if(!d) return;
    for(const [k,v] of Object.entries(d.values || {})){
      const el = form.elements.namedItem(k);
      if(!el) continue;
      if(el.type === "checkbox") el.checked = !!v;
      else el.value = v;
    }
    if(d.extra?.restore) d.extra.restore();
    toast({ title:"Draft restored", message:"We loaded your saved listing draft.", tone:"success" });
  };
  const save = debounce(()=>{
    const values = {};
    Array.from(form.elements).forEach(el=>{
      if(!el.name) return;
      if(el.type === "password") return;
      values[el.name] = (el.type === "checkbox") ? el.checked : el.value;
    });
    const extra = extraSerialize ? extraSerialize() : {};
    session.set(key, { values, extra, savedAt: Date.now() });
  }, 350);

  form.addEventListener("input", save);
  form.addEventListener("change", save);

  return {
    load,
    clear: ()=>session.del(key)
  };
}

