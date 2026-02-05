import { qs, qsa, on, toast } from "../utils.js";
import { attachRealtimeValidation, validateForm } from "../forms.js";

const KEY = "webmart_settings_v1";

function load(){
  try{
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  }catch{
    return {};
  }
}
function save(data){
  localStorage.setItem(KEY, JSON.stringify(data));
}

function apply(data){
  qs('input[name="name"]')?.setAttribute("value", data.name || "Demo Seller");
  qs('input[name="email"]')?.setAttribute("value", data.email || "demo@webmart.test");
  qs('input[name="avatar"]')?.setAttribute("value", data.avatar || "");
  qs('input[name="password"]')?.setAttribute("value", data.password || "");
  qsa("[data-setting]").forEach(sw=>{
    const key = sw.getAttribute("data-setting");
    const val = data[key];
    sw.setAttribute("aria-checked", val ? "true":"false");
  });
}

function collect(){
  const form = qs("[data-settings-form]");
  const data = load();
  data.name = form.elements.name.value;
  data.email = form.elements.email.value;
  data.avatar = form.elements.avatar.value;
  data.password = form.elements.password.value;
  qsa("[data-setting]").forEach(sw=>{
    const key = sw.getAttribute("data-setting");
    data[key] = sw.getAttribute("aria-checked") === "true";
  });
  return data;
}

function toggleSetting(sw){
  const cur = sw.getAttribute("aria-checked") === "true";
  sw.setAttribute("aria-checked", cur ? "false" : "true");
}

attachRealtimeValidation(document);
apply(load());

on(document, "click", "[data-setting]", (e, sw)=>{
  toggleSetting(sw);
});

qs("[data-settings-form]")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const form = e.currentTarget;
  if(!validateForm(form)) return;
  const data = collect();
  save(data);
  toast({ title:"Settings saved", message:"Preferences stored locally for this demo.", tone:"success" });
});

qs("[data-reset]")?.addEventListener("click", ()=>{
  localStorage.removeItem(KEY);
  apply({});
  toast({ title:"Reset", message:"Settings reset to defaults.", tone:"accent" });
});

qs("[data-add-card]")?.addEventListener("click", ()=>{
  toast({ title:"Add card", message:"Payment method UI is a placeholder.", tone:"accent" });
});
qs("[data-remove-card]")?.addEventListener("click", ()=>{
  toast({ title:"Removed", message:"Card removed (demo).", tone:"success" });
});

