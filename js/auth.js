import { storage, toast, uid } from "./utils.js";

const AUTH_KEY = "webmart_auth_v1";

export function getAuth(){
  return storage.get(AUTH_KEY, { user: null });
}

export function isLoggedIn(){
  return !!getAuth().user;
}

export function login({ email, password }){
  // Demo-only auth: accept any email, password length >= 8.
  const e = String(email||"").trim().toLowerCase();
  if(!e.includes("@")){
    toast({ title:"Check your email", message:"Enter a valid email address.", tone:"danger" });
    return false;
  }
  if(String(password||"").length < 8){
    toast({ title:"Password too short", message:"Use at least 8 characters.", tone:"danger" });
    return false;
  }
  const name = e.split("@")[0].replaceAll(".", " ").replace(/\b\w/g, m=>m.toUpperCase());
  const user = { id: uid("u"), email: e, name, verified: true, twoFA: false };
  storage.set(AUTH_KEY, { user });
  document.dispatchEvent(new CustomEvent("webmart:auth_updated"));
  toast({ title:"Welcome back", message:`Signed in as ${user.email}`, tone:"success" });
  return true;
}

export function signup({ name, email, password }){
  const n = String(name||"").trim();
  if(n.length < 2){
    toast({ title:"Name required", message:"Enter your full name.", tone:"danger" });
    return false;
  }
  return login({ email, password });
}

export function logout(){
  storage.set(AUTH_KEY, { user: null });
  document.dispatchEvent(new CustomEvent("webmart:auth_updated"));
  toast({ title:"Signed out", message:"You’ve been signed out." });
}

