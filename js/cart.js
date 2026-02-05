import { storage, toast, clamp } from "./utils.js";
import { getProductById } from "./products.js";

const CART_KEY = "webmart_cart_v1";
const WISHLIST_KEY = "webmart_wishlist_v1";
const RECENTS_KEY = "webmart_recent_v1";
const COMPARE_KEY = "webmart_compare_v1";

export function getCart(){
  return storage.get(CART_KEY, { items: [] });
}

export function setCart(cart){
  storage.set(CART_KEY, cart);
  document.dispatchEvent(new CustomEvent("webmart:cart_updated"));
}

export function cartCount(){
  return getCart().items.reduce((sum, it)=>sum + (it.qty || 0), 0);
}

export function addToCart(productId, qty=1){
  const p = getProductById(productId);
  if(!p){
    toast({ title:"Can’t add to cart", message:"That item isn’t available.", tone:"danger" });
    return;
  }
  const cart = getCart();
  const existing = cart.items.find(i=>i.productId === productId);
  if(existing) existing.qty = clamp((existing.qty || 1) + qty, 1, 99);
  else cart.items.push({ productId, qty: clamp(qty,1,99) });
  setCart(cart);
  toast({ title:"Added to cart", message:`${p.title}`, tone:"success" });
}

export function updateQty(productId, qty){
  const cart = getCart();
  const it = cart.items.find(i=>i.productId === productId);
  if(!it) return;
  it.qty = clamp(Number(qty || 1), 1, 99);
  setCart(cart);
}

export function removeFromCart(productId){
  const cart = getCart();
  cart.items = cart.items.filter(i=>i.productId !== productId);
  setCart(cart);
  toast({ title:"Removed", message:"Item removed from cart." });
}

export function clearCart(){
  setCart({ items: [] });
}

export function getWishlist(){
  return storage.get(WISHLIST_KEY, { ids: [] });
}

export function toggleWishlist(productId){
  const wl = getWishlist();
  const idx = wl.ids.indexOf(productId);
  const p = getProductById(productId);
  if(idx >= 0){
    wl.ids.splice(idx, 1);
    storage.set(WISHLIST_KEY, wl);
    document.dispatchEvent(new CustomEvent("webmart:wishlist_updated"));
    toast({ title:"Removed from wishlist", message: p?.title || "Item", tone:"accent" });
    return false;
  }
  wl.ids.unshift(productId);
  wl.ids = Array.from(new Set(wl.ids)).slice(0, 100);
  storage.set(WISHLIST_KEY, wl);
  document.dispatchEvent(new CustomEvent("webmart:wishlist_updated"));
  toast({ title:"Saved to wishlist", message: p?.title || "Item", tone:"success" });
  return true;
}

export function isWishlisted(productId){
  return getWishlist().ids.includes(productId);
}

export function addRecent(productId){
  const rec = storage.get(RECENTS_KEY, { ids: [] });
  rec.ids = [productId, ...rec.ids.filter(id=>id!==productId)].slice(0, 12);
  storage.set(RECENTS_KEY, rec);
}

export function getRecents(){
  return storage.get(RECENTS_KEY, { ids: [] }).ids.map(getProductById).filter(Boolean);
}

export function getCompare(){
  return storage.get(COMPARE_KEY, { ids: [] });
}

export function toggleCompare(productId){
  const cmp = getCompare();
  const idx = cmp.ids.indexOf(productId);
  if(idx >= 0) cmp.ids.splice(idx, 1);
  else{
    if(cmp.ids.length >= 4){
      toast({ title:"Comparison full", message:"You can compare up to 4 items.", tone:"accent" });
      return cmp.ids;
    }
    cmp.ids.push(productId);
  }
  storage.set(COMPARE_KEY, cmp);
  document.dispatchEvent(new CustomEvent("webmart:compare_updated"));
  return cmp.ids;
}

export function cartTotals({ couponCode="" } = {}){
  const cart = getCart();
  const items = cart.items.map(it=>{
    const p = getProductById(it.productId);
    return { ...it, product: p, line: (p?.price || 0) * (it.qty || 1) };
  }).filter(x=>x.product);

  const subtotal = items.reduce((s,x)=>s+x.line,0);
  const shipping = subtotal > 300 ? 0 : (items.length ? 14 : 0);
  const tax = Math.round(subtotal * 0.0725);
  const coupon = (couponCode || "").trim().toUpperCase();
  const discount = coupon === "WEBMART10" ? Math.round(subtotal * 0.10) : 0;
  const total = Math.max(0, subtotal + shipping + tax - discount);
  return { items, subtotal, shipping, tax, discount, total, couponApplied: discount>0 };
}

