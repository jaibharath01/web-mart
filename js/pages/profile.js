import { qs, escapeHtml, toast } from "../utils.js";
import { PRODUCTS } from "../products.js";
import { productCard } from "../ui.js";

const SELLER_ID = "u104"; // from products dataset

function render(){
  const sellerProduct = PRODUCTS.find(p=>p.seller?.id === SELLER_ID);
  const seller = sellerProduct?.seller || { name:"Seller", badge:[], responseMins: 30, sold: 0 };
  qs("[data-name]")?.replaceChildren(document.createTextNode(seller.name));
  qs("[data-meta]")?.replaceChildren(document.createTextNode(`Seller • ${seller.sold} sales • Avg response ${seller.responseMins} min`));
  qs("[data-avatar]")?.replaceChildren(document.createTextNode(seller.name.split(" ").map(x=>x[0]).slice(0,2).join("")));

  const grid = qs("[data-profile-listings]");
  if(grid){
    const items = PRODUCTS.filter(p=>p.seller?.id === SELLER_ID);
    grid.innerHTML = items.length ? items.map(p=>productCard(p)).join("") : `<div class="note">No active listings.</div>`;
  }
}

qs("[data-follow]")?.addEventListener("click", ()=>{
  toast({ title:"Followed", message:"You’ll get updates from this seller (demo).", tone:"success" });
});

render();

