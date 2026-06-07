import{L as f,d as p,h as y,g as d,s as m,u as C,a as I,b,i as n,j as w}from"./utils.js";const r=document.querySelector(".wishlist-list"),o=document.querySelector(".wishlist-empty");function h(){return w("so-wishlist")}function i(){const t=h();if(!t)return[];const e=d(t);return Array.isArray(e)?e:[]}function g(t){const e=h();e&&m(e,t)}function v(){const t=d("so-cart");return Array.isArray(t)?t:t?[t]:[]}function $(t){const e=v(),s=e.find(a=>a.Id===t.Id);s?s.Quantity=(Number(s.Quantity)||1)+1:e.push({...t,Quantity:1}),m("so-cart",e),C(),I()}function L(t){const e=i();e.splice(t,1),g(e),c()}function N(t){const e=i(),s=e[t];s&&($(s),e.splice(t,1),g(e),c(),p(`${s.Name} was moved to the cart.`,!1))}function _(t,e){var u,l;const s=((u=t.Images)==null?void 0:u.PrimaryMedium)||t.Image,a=t.Category?`&category=${encodeURIComponent(t.Category)}`:"";return`<li class="wishlist-card product-card">
    <a href="/product_pages/?product=${encodeURIComponent(t.Id)}${a}">
      <img src="${b(s)}" alt="${n(t.Name)}" />
      <h3 class="card__brand">${n(((l=t.Brand)==null?void 0:l.Name)||"")}</h3>
      <h2 class="card__name">${n(t.NameWithoutBrand||t.Name)}</h2>
      <p class="product-card__price">$${Number(t.FinalPrice).toFixed(2)}</p>
    </a>
    <div class="wishlist-card__actions">
      <button type="button" data-action="move" data-index="${e}">Move to Cart</button>
      <button type="button" data-action="remove" data-index="${e}">Remove</button>
    </div>
  </li>`}function c(){if(!y()){o.innerHTML='Please <a href="/register/index.html">register or sign in</a> to use a wishlist.',r.innerHTML="";return}const e=i();if(e.length===0){o.textContent="Your wishlist is empty.",r.innerHTML="";return}o.textContent="",r.innerHTML=e.map((s,a)=>_(s,a)).join("")}r.addEventListener("click",t=>{const e=t.target.closest("button");if(!e)return;const s=Number(e.dataset.index);Number.isInteger(s)&&(e.dataset.action==="move"&&N(s),e.dataset.action==="remove"&&L(s))});c();f();
