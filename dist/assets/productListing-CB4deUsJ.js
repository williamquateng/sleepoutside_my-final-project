import{r as _,b as d,m as $,n as w,L as I}from"./utils.js";import{E as L}from"./ExternalServices.js";import{A as S}from"./Alert.js";function o(t,e){var r,i;return((r=t.Images)==null?void 0:r[e])||t.Image||((i=t.Images)==null?void 0:i.PrimaryMedium)||""}function k(t){return[[o(t,"PrimarySmall"),"80w"],[o(t,"PrimaryMedium"),"160w"],[o(t,"PrimaryLarge"),"320w"]].filter(([r])=>r).map(([r,i])=>`${d(r)} ${i}`).join(", ")}function v(t,e){const r=o(t,"PrimaryMedium"),i=k(t),a=t.Category||e||"",n=a?`&category=${a}`:"";return`<li class="product-card">
  <a href="/product_pages/?product=${t.Id}${n}">
    <img
      src="${d(r)}"
      ${i?`srcset="${i}" sizes="(min-width: 900px) 250px, (min-width: 700px) 180px, 80vw"`:""}
      alt="${t.Name}"
    />
    <h3 class="card__brand">${t.Brand.Name}</h3>
    <h2 class="card__name">${t.NameWithoutBrand}</h2>
    ${$(t)}
  </a>
  <button class="product-card__quick-view" type="button" data-quick-view-id="${t.Id}">
    Quick View
  </button>
</li>`}function N(t){return t.NameWithoutBrand.split(" - ")[0]}function C(t){const e=new Set;return t.filter(r=>{const i=N(r);return e.has(i)?!1:(e.add(i),!0)})}class q{constructor(e,r,i){this.category=e,this.dataSource=r,this.listElement=i,this.products=[]}async init(){const e=await this.dataSource.getData(this.category);return this.products=C(e),this.renderList(this.products),this.products}sortProducts(e){const r=[...this.products];e==="name-asc"&&r.sort((i,a)=>i.Name.localeCompare(a.Name)),e==="name-desc"&&r.sort((i,a)=>a.Name.localeCompare(i.Name)),e==="price-asc"&&r.sort((i,a)=>Number(i.FinalPrice)-Number(a.FinalPrice)),e==="price-desc"&&r.sort((i,a)=>Number(a.FinalPrice)-Number(i.FinalPrice)),this.renderList(r)}renderList(e){if(!e.length){this.listElement.innerHTML=`
        <li class="product-list__empty">
          No products found. Try a different search or browse another category.
        </li>
      `;return}_(r=>v(r,this.category),this.listElement,e,"afterbegin",!0)}}const u=w("category")||"tents",c=w("search"),x=c||u,P=new L,m=document.querySelector(".product-list"),l=document.querySelector(".product-listing__title"),g=document.querySelector(".product-sort"),h=document.querySelector(".breadcrumbs"),s=document.getElementById("productQuickViewModal"),y=s==null?void 0:s.querySelector(".product-modal__body"),p=new q(x,P,m);function M(t){var e,r,i;return[[(e=t.Images)==null?void 0:e.PrimarySmall,"80w"],[(r=t.Images)==null?void 0:r.PrimaryMedium,"160w"],[(i=t.Images)==null?void 0:i.PrimaryLarge,"320w"]].filter(([a])=>a).map(([a,n])=>`${d(a)} ${n}`).join(", ")}function T(t){var a,n,f;const e=d(((a=t.Images)==null?void 0:a.PrimaryMedium)||((n=t.Images)==null?void 0:n.PrimaryLarge)||t.Image||""),r=M(t),i=t.Category?`&category=${encodeURIComponent(t.Category)}`:"";return`
    <div class="product-quick-view">
      <button class="product-modal__close" type="button" aria-label="Close quick view">&times;</button>
      <img src="${e}" ${r?`srcset="${r}" sizes="(min-width: 700px) 320px, 80vw"`:""} alt="${t.NameWithoutBrand}" />
      <h3 class="card__brand">${((f=t.Brand)==null?void 0:f.Name)||""}</h3>
      <h2 class="card__name">${t.NameWithoutBrand}</h2>
      ${$(t)}
      <div class="product-description">${t.DescriptionHtmlSimple||t.Description||""}</div>
      <a class="button" href="/product_pages/?product=${t.Id}${i}">View full product</a>
    </div>
  `}function H(t){!s||!y||(y.innerHTML=T(t),s.classList.remove("hide"))}function V(){s&&s.classList.add("hide")}m==null||m.addEventListener("click",async t=>{const e=t.target.closest("[data-quick-view-id]");if(!e)return;t.preventDefault();const r=e.dataset.quickViewId,i=await P.findProductById(r);H(i)});s==null||s.addEventListener("click",t=>{(t.target===s||t.target.closest(".product-modal__close"))&&V()});function b(t){return t.split("-").map(e=>e[0].toUpperCase()+e.slice(1)).join(" ")}function B(){if(l){if(c){l.textContent=`Search Results: ${c}`;return}l.textContent=`Top Products: ${b(u)}`}}function E(t){if(!h)return;const e='<a href="/index.html">Home</a>';if(c){h.innerHTML=`${e} &gt; Search results for "${c}" (${t.length} items)`;return}const r=b(u),i=`<a href="/product_listing/index.html?category=${encodeURIComponent(u)}">${r}</a>`;h.innerHTML=`${e} &gt; ${i} &gt; ${t.length} items`}async function F(){I(),await new S().init(),B();const e=await p.init();E(e),g&&g.addEventListener("change",()=>{p.sortProducts(g.value)})}F();
