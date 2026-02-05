import { validateForm, attachRealtimeValidation } from "../forms.js";
import { toast } from "../utils.js";

attachRealtimeValidation(document);

const form = document.querySelector("[data-contact-form]");
form?.addEventListener("submit", (e)=>{
  e.preventDefault();
  if(!validateForm(form)) return;
  toast({ title:"Message sent", message:"We received your inquiry (demo).", tone:"success" });
  form.reset();
});

