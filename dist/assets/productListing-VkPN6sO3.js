import{r as p,b as d,k as y,l as g,L as P}from"./utils.js";import{E as $}from"./ExternalServices.js";function i(t,e){var r,s;return((r=t.Images)==null?void 0:r[e])||t.Image||((s=t.Images)==null?void 0:s.PrimaryMedium)||""}function S(t){return[[i(t,"PrimarySmall"),"80w"],[i(t,"PrimaryMedium"),"160w"],[i(t,"PrimaryLarge"),"320w"]].filter(([r])=>r).map(([r,s])=>`${d(r)} ${s}`).join(", ")}function L(t,e){const r=i(t,"PrimaryMedium"),s=S(t),a=t.Category||e||"",f=a?`&category=${a}`:"";return`<li class="product-card">
  <a href="/product_pages/?product=${t.Id}${f}">
    <img
      src="${d(r)}"
      ${s?`srcset="${s}" sizes="(min-width: 700px) 160px, 80px"`:""}
      alt="${t.Name}"
    />
    <h3 class="card__brand">${t.Brand.Name}</h3>
    <h2 class="card__name">${t.NameWithoutBrand}</h2>
    ${y(t)}
  </a>
</li>`}function b(t){return t.NameWithoutBrand.split(" - ")[0]}function C(t){const e=new Set;return t.filter(r=>{const s=b(r);return e.has(s)?!1:(e.add(s),!0)})}class w{constructor(e,r,s){this.category=e,this.dataSource=r,this.listElement=s,this.products=[]}async init(){const e=await this.dataSource.getData(this.category);return this.products=C(e),this.renderList(this.products),this.products}sortProducts(e){const r=[...this.products];e==="name"&&r.sort((s,a)=>s.Name.localeCompare(a.Name)),e==="price"&&r.sort((s,a)=>s.FinalPrice-a.FinalPrice),this.renderList(r)}renderList(e){p(r=>L(r,this.category),this.listElement,e,"afterbegin",!0)}}const u=g("category")||"tents",n=g("search"),x=n||u,I=new $,_=document.querySelector(".product-list"),c=document.querySelector(".product-listing__title"),o=document.querySelector(".product-sort"),m=document.querySelector(".breadcrumbs"),l=new w(x,I,_);function h(t){return t.split("-").map(e=>e[0].toUpperCase()+e.slice(1)).join(" ")}function q(){if(c){if(n){c.textContent=`Search Results: ${n}`;return}c.textContent=`Top Products: ${h(u)}`}}function E(t){if(!m)return;const e=n?"Search Results":h(u);m.textContent=`${e}->(${t.length} items)`}async function N(){P(),q();const t=await l.init();E(t),o&&o.addEventListener("change",()=>{l.sortProducts(o.value)})}N();
