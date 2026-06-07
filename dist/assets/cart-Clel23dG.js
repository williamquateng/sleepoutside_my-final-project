import{L as f,s as u,u as i,a as l,g as p,b as g}from"./utils.js";function o(){return p().filter(e=>e&&typeof e=="object"&&e.Id)}function d(t){return Number(t.FinalPrice)||0}function m(t){return Number(t.Quantity)||1}function _(t){const e=o();t<0||t>=e.length||(e.splice(t,1),u(e),s(),i(),l())}function C(t,e){const r=o();t<0||t>=r.length||(r[t].Quantity=e,u(r),s(),i(),l())}function y(){const t=document.querySelector(".product-list");t&&(t.addEventListener("click",e=>{const r=e.target.closest(".cart-card__remove");if(!r)return;const a=Number(r.dataset.index);Number.isInteger(a)&&_(a)}),t.addEventListener("change",e=>{const r=e.target.closest(".cart-card__quantity-input");if(!r)return;const a=Number(r.dataset.index),n=Number(r.value);Number.isInteger(a)&&n>0&&C(a,n)}))}function s(){const t=o(),e=document.querySelector(".product-list");e&&(t.length===0?e.innerHTML="":e.innerHTML=t.map((r,a)=>b(r,a)).join(""),I(t))}function I(t){const e=document.querySelector(".cart-footer"),r=document.querySelector(".cart-total");if(!e||!r)return;if(t.length===0){e.classList.add("hide"),r.textContent="Total: ";return}const a=t.reduce((n,c)=>n+d(c)*m(c),0);e.classList.remove("hide"),r.textContent=`Total: $${a.toFixed(2)}`}function b(t,e){var n,c;const r=((n=t.Colors[0])==null?void 0:n.ColorName)??"",a=t.Image||((c=t.Images)==null?void 0:c.PrimaryMedium);return`<li class="cart-card divider">
  <a href="/product_pages/?product=${t.Id}" class="cart-card__image">
    <img
      src="${g(a)}"
      alt="${t.Name??"Cart item"}"
    />
  </a>
  <a href="/product_pages/?product=${t.Id}" class="card__name">
    ${t.Name??""}
  </a>
  <p class="cart-card__color">${r}</p>
  <label class="cart-card__quantity">
    qty:
    <input class="cart-card__quantity-input" type="number" min="1" value="${m(t)}" data-index="${e}" />
  </label>
  <p class="cart-card__price">$${d(t).toFixed(2)}</p>
  <button class="cart-card__remove" type="button" data-index="${e}" aria-label="Remove ${t.Name??"item"} from cart">Remove</button>
</li>`}y();s();f();
