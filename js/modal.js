import { qs } from "./utils.js";

export function openModal({ title="Modal", bodyHtml="" }){
  const overlay = qs("[data-modal]");
  if(!overlay) return;
  qs("[data-modal-title]")?.replaceChildren(document.createTextNode(title));
  const body = qs("[data-modal-body]");
  if(body) body.innerHTML = bodyHtml;
  overlay.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}

export function closeModal(){
  const overlay = qs("[data-modal]");
  if(!overlay) return;
  overlay.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

