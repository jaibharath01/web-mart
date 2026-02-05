import { formatMoney } from "./utils.js";

// Demo product catalog (realistic, varied across categories).
// Images are inline SVG data-URIs for a zero-asset prototype; swap with real WebP later.

function svgData({ label, c1="#2563eb", c2="#10b981" }){
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${c1}" stop-opacity="0.28"/>
          <stop offset="1" stop-color="${c2}" stop-opacity="0.22"/>
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="24"/></filter>
      </defs>
      <rect width="1200" height="900" fill="#ffffff"/>
      <rect width="1200" height="900" fill="url(#g)"/>
      <circle cx="260" cy="240" r="220" fill="${c1}" opacity="0.15" filter="url(#blur)"/>
      <circle cx="980" cy="240" r="240" fill="${c2}" opacity="0.16" filter="url(#blur)"/>
      <circle cx="660" cy="730" r="280" fill="#f59e0b" opacity="0.13" filter="url(#blur)"/>
      <g font-family="Inter,Segoe UI,Arial" fill="#0b1220">
        <text x="64" y="110" font-size="52" font-weight="800">WebMart</text>
        <text x="64" y="170" font-size="28" opacity="0.75">Premium marketplace demo</text>
        <text x="64" y="520" font-size="70" font-weight="900">${label}</text>
        <text x="64" y="590" font-size="26" opacity="0.75">Photo placeholder • Replace with real imagery</text>
      </g>
    </svg>
  `);
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

export const CATEGORIES = [
  { id:"electronics", name:"Electronics", emoji:"📱" },
  { id:"fashion", name:"Fashion", emoji:"🧥" },
  { id:"home", name:"Home & Garden", emoji:"🏡" },
  { id:"sports", name:"Sports & Outdoors", emoji:"⛺" },
  { id:"toys", name:"Toys & Games", emoji:"🧩" },
  { id:"books", name:"Books & Media", emoji:"📚" },
  { id:"auto", name:"Automotive", emoji:"🚗" },
  { id:"beauty", name:"Health & Beauty", emoji:"🧴" },
  { id:"jewelry", name:"Jewelry & Accessories", emoji:"💎" },
  { id:"collectibles", name:"Collectibles & Art", emoji:"🖼️" }
];

export const CONDITIONS = ["New","Like New","Good","Fair"];

export const PRODUCTS = [
  {
    id:"p001",
    title:"iPhone 14 Pro 256GB (Unlocked) — Deep Purple",
    price: 799,
    category:"electronics",
    condition:"Like New",
    rating: 4.8,
    reviews: 214,
    location:"Austin, TX",
    shipping:["Shipping","Local pickup"],
    acceptOffers:true,
    seller: { id:"u101", name:"Maya Chen", badge:["Verified","Fast shipper"], responseMins: 38, sold: 1294 },
    images: [
      svgData({ label:"iPhone 14 Pro", c1:"#2563eb", c2:"#7c3aed" }),
      svgData({ label:"Camera & Screen", c1:"#1d4ed8", c2:"#10b981" }),
      svgData({ label:"Battery Health", c1:"#2563eb", c2:"#f59e0b" })
    ],
    description:
      "Lightly used iPhone 14 Pro with pristine screen and minimal wear. Battery health at 93%. Includes original box, USB‑C to Lightning cable, and a matte MagSafe case. Great for photos and video with ProRAW + ProRes support. Clean IMEI and ready to activate.",
    variants: [{ name:"Storage", options:["128GB","256GB","512GB"] }],
    trending:true,
    featured:true
  },
  {
    id:"p002",
    title:"Sony WH‑1000XM5 Noise Canceling Headphones",
    price: 249,
    category:"electronics",
    condition:"Good",
    rating: 4.6,
    reviews: 98,
    location:"San Jose, CA",
    shipping:["Shipping"],
    acceptOffers:true,
    seller: { id:"u102", name:"Jordan Patel", badge:["Top rated"], responseMins: 22, sold: 642 },
    images: [svgData({ label:"WH‑1000XM5", c1:"#111827", c2:"#2563eb" }), svgData({ label:"Case + Accessories", c1:"#111827", c2:"#10b981" })],
    description:
      "Comfortable, powerful ANC headphones with excellent call quality. Pads are clean and the hinge is tight. Includes carrying case and airline adapter. Perfect for travel, focus sessions, and high‑detail listening.",
    variants: [{ name:"Color", options:["Black","Silver"] }],
    trending:true
  },
  {
    id:"p003",
    title:"Vintage Levi’s 501 (Made in USA) — 32x32",
    price: 120,
    category:"fashion",
    condition:"Good",
    rating: 4.7,
    reviews: 51,
    location:"Portland, OR",
    shipping:["Shipping"],
    acceptOffers:false,
    seller: { id:"u103", name:"Avery Miles", badge:["Verified"], responseMins: 55, sold: 312 },
    images: [svgData({ label:"Levi’s 501", c1:"#ef4444", c2:"#f59e0b" }), svgData({ label:"Fit & Fade", c1:"#ef4444", c2:"#2563eb" })],
    description:
      "Authentic vintage 501s with a great fade and solid structure. No major stains; small edge wear consistent with age. True to size with classic straight leg. Washed and ready to wear.",
    variants: [{ name:"Size", options:["30x32","32x32","34x32"] }]
  },
  {
    id:"p004",
    title:"Solid Walnut Coffee Table — Mid‑Century Style",
    price: 420,
    category:"home",
    condition:"Like New",
    rating: 4.9,
    reviews: 33,
    location:"Brooklyn, NY",
    shipping:["Local pickup","Delivery radius"],
    acceptOffers:true,
    seller: { id:"u104", name:"Sofia Reyes", badge:["Fast shipper"], responseMins: 18, sold: 87 },
    images: [svgData({ label:"Walnut Table", c1:"#a16207", c2:"#10b981" }), svgData({ label:"Joinery Detail", c1:"#a16207", c2:"#2563eb" })],
    description:
      "Beautiful walnut coffee table with a warm finish and clean lines. Kept in a smoke‑free home and rarely used. Smooth surface with no scratches. Great anchor piece for living rooms and studios.",
    variants: []
  },
  {
    id:"p005",
    title:"Trek Domane AL 3 Road Bike — Size 54",
    price: 950,
    category:"sports",
    condition:"Good",
    rating: 4.5,
    reviews: 19,
    location:"Denver, CO",
    shipping:["Local pickup"],
    acceptOffers:true,
    seller: { id:"u105", name:"Ethan Kim", badge:["Verified"], responseMins: 44, sold: 58 },
    images: [svgData({ label:"Trek Domane", c1:"#10b981", c2:"#2563eb" }), svgData({ label:"Drivetrain", c1:"#10b981", c2:"#111827" })],
    description:
      "Well‑maintained endurance road bike, tuned and ready for spring rides. Fresh bar tape and new chain installed last month. Brakes are strong, shifting is crisp. Ideal for commuting or long weekend routes.",
    variants: [{ name:"Pedals", options:["Flat","SPD clipless"] }]
  },
  {
    id:"p006",
    title:"Nintendo Switch OLED Bundle — 2 Games + Case",
    price: 325,
    category:"toys",
    condition:"Like New",
    rating: 4.8,
    reviews: 76,
    location:"Chicago, IL",
    shipping:["Shipping","Local pickup"],
    acceptOffers:true,
    seller: { id:"u106", name:"Noah Brooks", badge:["Top rated","Fast shipper"], responseMins: 15, sold: 402 },
    images: [svgData({ label:"Switch OLED", c1:"#ef4444", c2:"#2563eb" }), svgData({ label:"Dock + Case", c1:"#ef4444", c2:"#10b981" })],
    description:
      "OLED Switch in excellent condition with vibrant display. Includes dock, Joy‑Cons, charger, travel case, and two popular games. Reset and ready for your account. Great gift or upgrade.",
    variants: []
  },
  {
    id:"p007",
    title:"Kindle Paperwhite (11th Gen) — 8GB, Ad‑Free",
    price: 85,
    category:"books",
    condition:"Good",
    rating: 4.4,
    reviews: 40,
    location:"Raleigh, NC",
    shipping:["Shipping"],
    acceptOffers:false,
    seller: { id:"u107", name:"Priya Nair", badge:["Verified"], responseMins: 62, sold: 210 },
    images: [svgData({ label:"Kindle", c1:"#111827", c2:"#f59e0b" }), svgData({ label:"Warm Light", c1:"#111827", c2:"#2563eb" })],
    description:
      "Paperwhite with warm light and long battery life. Screen is clean; minor back scuffs. Includes a slim magnetic cover. Perfect for travel and nighttime reading.",
    variants: [{ name:"Cover", options:["None","Black","Sage"] }]
  },
  {
    id:"p008",
    title:"CarPlay/Android Auto Dash Display — 9\" IPS",
    price: 149,
    category:"auto",
    condition:"New",
    rating: 4.3,
    reviews: 12,
    location:"Phoenix, AZ",
    shipping:["Shipping"],
    acceptOffers:true,
    seller: { id:"u108", name:"Harper Lane", badge:["Fast shipper"], responseMins: 27, sold: 130 },
    images: [svgData({ label:"Dash Display", c1:"#2563eb", c2:"#111827" }), svgData({ label:"Mount + Cables", c1:"#2563eb", c2:"#10b981" })],
    description:
      "Brand new CarPlay/Android Auto display with bright IPS panel and responsive touch. Includes suction mount, dash pad, and cable set. Great upgrade for older vehicles without replacing the head unit.",
    variants: []
  },
  {
    id:"p009",
    title:"Dyson Airwrap Complete — Long (Nickel/Copper)",
    price: 399,
    category:"beauty",
    condition:"Like New",
    rating: 4.7,
    reviews: 64,
    location:"Miami, FL",
    shipping:["Shipping"],
    acceptOffers:true,
    seller: { id:"u109", name:"Lina Gomez", badge:["Verified","Top rated"], responseMins: 20, sold: 519 },
    images: [svgData({ label:"Dyson Airwrap", c1:"#f59e0b", c2:"#2563eb" }), svgData({ label:"Attachments", c1:"#f59e0b", c2:"#10b981" })],
    description:
      "Barely used Airwrap with full attachment set. Cleaned and sanitized. Works perfectly with strong airflow and consistent heat. Includes storage case and brush attachments for smooth blowouts and curls.",
    variants: [{ name:"Barrel", options:["Long","Short"] }]
  },
  {
    id:"p010",
    title:"14K Gold Minimalist Chain Necklace — 18\"",
    price: 260,
    category:"jewelry",
    condition:"New",
    rating: 4.9,
    reviews: 27,
    location:"Los Angeles, CA",
    shipping:["Shipping"],
    acceptOffers:false,
    seller: { id:"u110", name:"Elise Park", badge:["Verified"], responseMins: 48, sold: 77 },
    images: [svgData({ label:"14K Chain", c1:"#f59e0b", c2:"#a16207" }), svgData({ label:"Clasp Detail", c1:"#f59e0b", c2:"#2563eb" })],
    description:
      "New 14K gold chain with a refined, minimalist look. Comfortable for everyday wear and layers beautifully. Includes gift box and authenticity card.",
    variants: [{ name:"Length", options:['16"','18"','20"'] }]
  },
  {
    id:"p011",
    title:"Original Abstract Canvas — 24x36, Signed",
    price: 540,
    category:"collectibles",
    condition:"New",
    rating: 4.6,
    reviews: 9,
    location:"Seattle, WA",
    shipping:["Shipping"],
    acceptOffers:true,
    seller: { id:"u111", name:"Kai Nguyen", badge:["Verified"], responseMins: 33, sold: 44 },
    images: [svgData({ label:"Abstract Canvas", c1:"#7c3aed", c2:"#2563eb" }), svgData({ label:"Texture Closeup", c1:"#7c3aed", c2:"#10b981" })],
    description:
      "Original acrylic abstract on stretched canvas with rich texture and a modern palette. Signed on the back and sealed with a matte varnish. Ships safely with corner protection and tracking.",
    variants: []
  },
  {
    id:"p012",
    title:"Premium Espresso Grinder — Stepless, Single Dose",
    price: 289,
    category:"home",
    condition:"Good",
    rating: 4.5,
    reviews: 22,
    location:"Boston, MA",
    shipping:["Shipping"],
    acceptOffers:true,
    seller: { id:"u112", name:"Samir Ali", badge:["Fast shipper"], responseMins: 26, sold: 96 },
    images: [svgData({ label:"Espresso Grinder", c1:"#111827", c2:"#10b981" }), svgData({ label:"Burrs", c1:"#111827", c2:"#2563eb" })],
    description:
      "Stepless grinder tuned for espresso and pour-over. Consistent particle size with low retention for single dosing. Recently cleaned; burrs are in great shape. Includes dosing cup and bellows.",
    variants: [{ name:"Voltage", options:["110V","220V"] }]
  }
  ,
  {
    id:"p013",
    title:"GoPro HERO11 Black — Bundle",
    price: 379,
    category:"electronics",
    condition:"Like New",
    rating: 4.7,
    reviews: 48,
    location:"Orlando, FL",
    shipping:["Shipping","Local pickup"],
    acceptOffers:true,
    seller: { id:"u113", name:"Iris Wang", badge:["Top rated"], responseMins: 20, sold: 210 },
    images: [svgData({ label:"GoPro HERO11", c1:"#111827", c2:"#2563eb" })],
    description: "High-quality action camera with mounts and spare battery. Well cared for; includes ND filters and travel case.",
    variants: []
  },
  {
    id:"p014",
    title:"Patio Bistro Set — 2 chairs + table",
    price: 199,
    category:"home",
    condition:"Good",
    rating: 4.4,
    reviews: 14,
    location:"Tucson, AZ",
    shipping:["Local pickup"],
    acceptOffers:true,
    seller: { id:"u114", name:"Lola Bennett", badge:[], responseMins: 72, sold: 34 },
    images: [svgData({ label:"Bistro Set", c1:"#a16207", c2:"#f59e0b" })],
    description: "Compact bistro set perfect for small patios and balconies. Cushions included.",
    variants: []
  },
  {
    id:"p015",
    title:"Used DSLR Kit — 24-70mm + 50mm",
    price: 625,
    category:"electronics",
    condition:"Good",
    rating: 4.6,
    reviews: 26,
    location:"San Diego, CA",
    shipping:["Shipping"],
    acceptOffers:true,
    seller: { id:"u115", name:"Marco Silva", badge:["Verified"], responseMins: 34, sold: 98 },
    images: [svgData({ label:"DSLR Kit", c1:"#2563eb", c2:"#7c3aed" })],
    description: "Reliable DSLR kit for enthusiasts — includes two lenses, bag, and a spare battery. Lightly used.",
    variants: []
  },
  {
    id:"p016",
    title:"Kids Wooden Train Set — 120 pcs",
    price: 45,
    category:"toys",
    condition:"New",
    rating: 4.8,
    reviews: 82,
    location:"Cleveland, OH",
    shipping:["Shipping"],
    acceptOffers:false,
    seller: { id:"u116", name:"Nina Park", badge:["Top rated"], responseMins: 12, sold: 410 },
    images: [svgData({ label:"Train Set", c1:"#10b981", c2:"#2563eb" })],
    description: "Durable wooden train pieces with bridges and scenery. Great educational toy for toddlers.",
    variants: []
  },
  {
    id:"p017",
    title:"Leather Office Chair — Ergonomic",
    price: 180,
    category:"home",
    condition:"Like New",
    rating: 4.5,
    reviews: 37,
    location:"Columbus, OH",
    shipping:["Local pickup","Delivery radius"],
    acceptOffers:true,
    seller: { id:"u117", name:"Darren Cole", badge:[], responseMins: 40, sold: 66 },
    images: [svgData({ label:"Office Chair", c1:"#111827", c2:"#a16207" })],
    description: "Comfortable leather chair with lumbar support and tilt. Excellent for home offices.",
    variants: [{ name:"Color", options:["Black","Brown"] }]
  },
  {
    id:"p018",
    title:"Hardcover Cookbooks Set — 6 Volumes",
    price: 65,
    category:"books",
    condition:"Good",
    rating: 4.2,
    reviews: 11,
    location:"Minneapolis, MN",
    shipping:["Shipping"],
    acceptOffers:false,
    seller: { id:"u118", name:"Greta Olson", badge:[], responseMins: 88, sold: 24 },
    images: [svgData({ label:"Cookbooks", c1:"#f59e0b", c2:"#2563eb" })],
    description: "A curated set of hardcover cookbooks covering baking, grilling, and weeknight dinners.",
    variants: []
  }
];

export function getProductById(id){
  return PRODUCTS.find(p=>p.id === id) || null;
}

export function shippingLabel(p){
  if(!p?.shipping?.length) return "Pickup";
  if(p.shipping.includes("Shipping") && p.shipping.includes("Local pickup")) return "Ship or pickup";
  if(p.shipping.includes("Shipping")) return "Ships";
  if(p.shipping.includes("Delivery radius")) return "Local delivery";
  return p.shipping[0];
}

export function productToCardViewModel(p){
  return {
    id: p.id,
    title: p.title,
    priceText: formatMoney(p.price),
    rating: p.rating,
    reviews: p.reviews,
    location: p.location,
    condition: p.condition,
    ship: shippingLabel(p),
    image: p.images?.[0]
  };
}

