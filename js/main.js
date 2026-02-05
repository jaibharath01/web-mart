import { qs, qsa, on, toast, icon, setMetaTitle } from "./utils.js";
import { cartCount, getWishlist, getCompare, toggleCompare, toggleWishlist, isWishlisted } from "./cart.js";
import { attachHeaderSearch } from "./search.js";
import { getAuth, logout } from "./auth.js";
import { closeModal } from "./modal.js";

function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("webmart_theme_v1", theme);
}

function initTheme(){
  const saved = localStorage.getItem("webmart_theme_v1");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(saved || (prefersDark ? "dark" : "light"));
}

function updateBadges(){
  const cartEl = qs("[data-cart-count]");
  const wishEl = qs("[data-wishlist-count]");
  const cart = cartCount();
  const wish = getWishlist().ids.length;
  if(cartEl) cartEl.textContent = String(cart);
  if(wishEl) wishEl.textContent = String(wish);

  qsa("[data-wishlist-toggle]").forEach(btn=>{
    const id = btn.getAttribute("data-wishlist-toggle");
    btn.setAttribute("aria-pressed", isWishlisted(id) ? "true" : "false");
  });
}

function renderShell(){
  const root = qs("[data-shell]");
  if(!root) return;
  const page = document.body.getAttribute("data-page") || "";
  const auth = getAuth();
  const user = auth.user;

  root.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="topbar">
      <div class="container inner">
        <div class="badge" aria-label="Security and checkout status">
          <span class="dot" aria-hidden="true"></span>
          <span><strong>Secure demo</strong> • HTTPS & payments are design placeholders</span>
        </div>
        <div class="row wrap">
          <a class="chip" href="faq.html">Help</a>
          <a class="chip" href="about.html">About</a>
          <a class="chip" href="contact.html">Contact</a>
        </div>
      </div>
    </div>

    <header class="header" data-header>
      <div class="container wide">
        <div class="row">
          <a class="brand" href="index.html" aria-label="WebMart home">
            <span class="brand-mark" aria-hidden="true">${icon("spark")}</span>
            <span>WebMart</span>
          </a>

          <div class="search" data-header-search role="search" aria-label="Site search">
            ${icon("search")}
            <input type="search" placeholder="Search for products…" aria-label="Search for products"/>
            <span class="hint">Try <span class="kbd">headphones</span> or <span class="kbd">bike</span></span>
            <div class="search-pop" aria-hidden="true" role="listbox" aria-label="Search suggestions"></div>
          </div>

          <div class="actions">
            <a class="btn sell small" href="sell.html" aria-label="Start selling a product">
              Sell
            </a>

            <div class="theme-wrap" style="position:relative;">
              <button class="icon-btn" type="button" data-theme-toggle aria-haspopup="true" aria-expanded="false" aria-label="Theme options">
                ${icon("shield")}
              </button>
              <div class="theme-menu" data-theme-menu aria-hidden="true" role="menu">
                <button type="button" class="theme-option" data-theme-select="light" role="menuitem">Light</button>
                <button type="button" class="theme-option" data-theme-select="dust" role="menuitem">Dust</button>
                <button type="button" class="theme-option" data-theme-select="dark" role="menuitem">Dark</button>
              </div>
            </div>

            <a class="icon-btn" href="messages.html" aria-label="Messages">
              ${icon("bell")}
            </a>

            <a class="icon-btn" href="cart.html" aria-label="Shopping cart" style="position:relative">
              ${icon("cart")}
              <span class="badge-count" data-cart-count aria-label="Cart items">0</span>
            </a>

            <a class="icon-btn" href="dashboard.html" aria-label="Your dashboard">
              ${icon("user")}
            </a>
          </div>

          <nav class="nav" aria-label="Primary">
            <a href="browse.html" ${page==="browse"?"aria-current=\"page\"":""}>Shop</a>
            <a href="categories.html" ${page==="categories"?"aria-current=\"page\"":""}>Categories</a>
            <a href="search.html" ${page==="search"?"aria-current=\"page\"":""}>Search</a>
            <a href="sell.html" ${page==="sell"?"aria-current=\"page\"":""}><strong>Sell (Premium)</strong></a>
            <a href="dashboard.html" ${page==="dashboard"?"aria-current=\"page\"":""}>Dashboard</a>
            <a href="profile.html" ${page==="profile"?"aria-current=\"page\"":""}>Seller Profile</a>
            <a href="terms.html" ${page==="terms"?"aria-current=\"page\"":""}>Legal</a>
          </nav>
        </div>
      </div>
    </header>

    <div class="compare-bar" data-compare-bar aria-label="Product comparison bar">
      <div class="compare-inner">
        <div>
          <strong>Compare</strong>
          <div class="note">Up to 4 items • Side-by-side view</div>
        </div>
        <div class="compare-items" data-compare-items></div>
        <div class="row">
          <a class="btn outline small" href="browse.html#compare" data-compare-open>Open</a>
          <button class="btn ghost small" type="button" data-compare-clear>Clear</button>
        </div>
      </div>
    </div>

    <button class="icon-btn backtop" data-backtop type="button" aria-label="Back to top">
      ${icon("arrowUp")}
    </button>

    <div class="modal-overlay" data-modal aria-hidden="true">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Modal">
        <div class="head">
          <strong data-modal-title>Modal</strong>
          <button class="icon-btn" type="button" data-modal-close aria-label="Close modal">${icon("x")}</button>
        </div>
        <div class="body" data-modal-body></div>
      </div>
    </div>

    <footer>
      <div class="container wide">
        <div class="footer-grid">
          <div>
            <div class="row" style="gap:10px; margin-bottom:10px;">
              <span class="brand-mark" aria-hidden="true" style="width:38px;height:38px;border-radius:14px;">${icon("spark")}</span>
              <strong style="font-size:1.05rem;letter-spacing:-.02em;">WebMart</strong>
            </div>
            <p>Premium peer-to-peer marketplace demo with best-in-class UX patterns, accessibility, and high-performance vanilla JS.</p>
            <div class="row wrap">
              <span class="pill">${icon("shield")} WCAG-first UI</span>
              <span class="pill">${icon("truck")} Smart shipping</span>
              <span class="pill">${icon("spark")} Premium micro-interactions</span>
            </div>
          </div>
          <div>
            <h3>Marketplace</h3>
            <a href="browse.html">Shop</a>
            <a href="sell.html"><strong>Sell (highlighted)</strong></a>
            <a href="categories.html">Categories</a>
            <a href="search.html">Search</a>
            <a href="cart.html">Cart</a>
            <a href="checkout.html">Checkout</a>
          </div>
          <div>
            <h3>Your account</h3>
            <a href="dashboard.html">Dashboard</a>
            <a href="messages.html">Messages</a>
            <a href="profile.html">Public Profile</a>
            <a href="settings.html">Account Settings</a>
          </div>
          <div>
            <h3>Company</h3>
            <a href="about.html">About</a>
            <a href="faq.html">Help / FAQ</a>
            <a href="contact.html">Contact</a>
            <a href="terms.html">Terms</a>
            <a href="privacy.html">Privacy</a>
          </div>
        </div>
        <div class="subfooter">
          <div>© ${new Date().getFullYear()} WebMart • Prototype demo</div>
          <div class="row wrap">
            <span class="pill">Cookie banner in `main.js`</span>
            <span class="pill">Secure checkout badges (UI)</span>
          </div>
        </div>
      </div>
    </footer>
  `;

  // Footer links include settings.html but spec names "Account Settings (Private)".
  // We’ll map it to account-settings.html but keep a friendly alias where possible later.
}

function initModal(){
  on(document, "click", "[data-modal-close]", ()=>closeModal());
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") closeModal();
  });
}

function initHeaderEffects(){
  const header = qs("[data-header]");
  const back = qs("[data-backtop]");
  const onScroll = ()=>{
    const y = window.scrollY || 0;
    header?.classList.toggle("scrolled", y > 6);
    back?.classList.toggle("show", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  back?.addEventListener("click", ()=>window.scrollTo({ top: 0, behavior:"smooth" }));
}

function initThemeToggle(){
  const btn = qs("[data-theme-toggle]");
  const menu = qs("[data-theme-menu]");

  // Toggle menu visibility
  btn?.addEventListener("click", (e)=>{
    e.stopPropagation();
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", expanded ? "false" : "true");
    menu?.setAttribute("aria-hidden", expanded ? "true" : "false");
  });

  // Theme selection
  on(document, "click", "[data-theme-select]", (e, t)=>{
    e.preventDefault();
    const theme = t.getAttribute("data-theme-select");
    if(theme) setTheme(theme);
    menu?.setAttribute("aria-hidden", "true");
    btn?.setAttribute("aria-expanded", "false");
    toast({ title:"Theme updated", message:`Switched to ${theme} mode.` });
  });

  // Click outside closes the menu
  document.addEventListener("click", (e)=>{
    if(!btn?.contains(e.target) && !menu?.contains(e.target)){
      menu?.setAttribute("aria-hidden", "true");
      btn?.setAttribute("aria-expanded", "false");
    }
  });
}

function initCookieBanner(){
  const KEY = "webmart_cookie_v1";
  if(localStorage.getItem(KEY)) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.style.position = "fixed";
  el.style.left = "14px";
  el.style.bottom = "14px";
  el.style.zIndex = "109";
  el.style.width = "min(560px, calc(100vw - 28px))";
  el.innerHTML = `
    <div class="row space-between" style="align-items:flex-start;">
      <div style="padding-right:10px;">
        <p class="title">Cookies & privacy</p>
        <p class="msg">This demo uses local storage for cart, wishlist, drafts, and preferences. See <a href="privacy.html" style="text-decoration:underline;">Privacy Policy</a>.</p>
        <div class="row wrap" style="margin-top:8px;">
          <button class="btn primary small" type="button" data-ck-accept>Accept</button>
          <button class="btn outline small" type="button" data-ck-manage>Manage</button>
        </div>
      </div>
      <button class="icon-btn" type="button" aria-label="Dismiss cookie notice" data-ck-dismiss>${icon("x")}</button>
    </div>
  `;
  document.body.appendChild(el);
  const close = (val)=>{
    localStorage.setItem(KEY, val);
    el.remove();
  };
  el.querySelector("[data-ck-accept]")?.addEventListener("click", ()=>close("accepted"));
  el.querySelector("[data-ck-dismiss]")?.addEventListener("click", ()=>close("dismissed"));
  el.querySelector("[data-ck-manage]")?.addEventListener("click", ()=>{
    close("managed");
    toast({ title:"Preferences", message:"Cookie preferences UI placeholder for a full implementation." });
  });
}

function initCompareBar(){
  const bar = qs("[data-compare-bar]");
  const itemsEl = qs("[data-compare-items]");
  const render = ()=>{
    const ids = getCompare().ids || [];
    if(!bar || !itemsEl) return;
    bar.classList.toggle("show", ids.length > 0);
    itemsEl.innerHTML = ids.map(id=>`
      <span class="compare-pill">
        <strong>${id}</strong>
        <button type="button" aria-label="Remove from comparison" data-compare-remove="${id}">×</button>
      </span>
    `).join("");
  };
  render();
  document.addEventListener("webmart:compare_updated", render);
  on(document, "click", "[data-compare-remove]", (e, t)=>{
    toggleCompare(t.getAttribute("data-compare-remove"));
  });
  qs("[data-compare-clear]")?.addEventListener("click", ()=>{
    localStorage.setItem("webmart_compare_v1", JSON.stringify({ ids: [] }));
    document.dispatchEvent(new CustomEvent("webmart:compare_updated"));
  });
}

function initProductActionDelegates(){
  on(document, "click", "[data-wishlist-toggle]", (e, btn)=>{
    e.preventDefault();
    const id = btn.getAttribute("data-wishlist-toggle");
    const onState = toggleWishlist(id);
    btn.setAttribute("aria-pressed", onState ? "true" : "false");
  });
  on(document, "click", "[data-compare-toggle]", (e, btn)=>{
    e.preventDefault();
    const id = btn.getAttribute("data-compare-toggle");
    const ids = toggleCompare(id);
    btn.setAttribute("aria-pressed", ids.includes(id) ? "true" : "false");
  });
}

function initAuthMenu(){
  // Lightweight: dashboard shows auth state; header can provide logout via keyboard shortcut.
  document.addEventListener("keydown", (e)=>{
    if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l"){
      logout();
    }
  });
}

export function initPage(){
  initTheme();
  renderShell();
  initModal();
  initHeaderEffects();
  initThemeToggle();
  initCookieBanner();
  initCompareBar();
  attachHeaderSearch();
  initProductActionDelegates();
  initAuthMenu();

  updateBadges();
  document.addEventListener("webmart:cart_updated", updateBadges);
  document.addEventListener("webmart:wishlist_updated", updateBadges);

  // Page meta title helper
  const pageTitle = document.body.getAttribute("data-title");
  if(pageTitle) setMetaTitle(pageTitle);
}

// Auto init
initPage();

