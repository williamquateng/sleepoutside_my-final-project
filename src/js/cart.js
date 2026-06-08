import {
  getImageUrl,
  getCartItems,
  LoadHeaderFooter,
  setCartItems,
  updateCartCount,
  animateCartIcon, // Backlog 3 - Animate cart (backpack) icon when item added to cart - CEC
} from "./utils.mjs";

function getFilteredCartItems() {
  const storedCart = getCartItems();
  const items = Array.isArray(storedCart) ? storedCart : [];
  return items.filter((item) => item && typeof item === "object" && item.Id);
}

function getItemPrice(item) {
  return Number(item.FinalPrice) || 0;
}

function getItemQuantity(item) {
  return Number(item.Quantity) || 1;
}

function removeFromCart(indexToRemove) {
  const cart = getFilteredCartItems();
  if (indexToRemove < 0 || indexToRemove >= cart.length) {
    return;
  }

  cart.splice(indexToRemove, 1);
  setCartItems(cart);
  renderCartContents();
  updateCartCount();
  animateCartIcon(); // Backlog 3 - Animate cart (backpack) icon when item added to cart - CEC
}

function updateCartItemQuantity(indexToUpdate, quantity) {
  const cart = getFilteredCartItems();
  if (indexToUpdate < 0 || indexToUpdate >= cart.length) {
    return;
  }

  cart[indexToUpdate].Quantity = quantity;
  setCartItems(cart);
  renderCartContents();
  updateCartCount();
  animateCartIcon(); // Backlog 3 - Animate cart (backpack) icon when item added to cart - CEC
}

function setupCartActions() {
  const listEl = document.querySelector(".product-list");
  if (!listEl) {
    return;
  }

  listEl.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".cart-card__remove");
    if (!removeButton) {
      return;
    }

    const indexToRemove = Number(removeButton.dataset.index);
    if (Number.isInteger(indexToRemove)) {
      removeFromCart(indexToRemove);
    }
  });

  listEl.addEventListener("change", (event) => {
    const quantityInput = event.target.closest(".cart-card__quantity-input");
    if (!quantityInput) {
      return;
    }

    const indexToUpdate = Number(quantityInput.dataset.index);
    const quantity = Number(quantityInput.value);
    if (Number.isInteger(indexToUpdate) && quantity > 0) {
      updateCartItemQuantity(indexToUpdate, quantity);
    }
  });
}

function renderCartContents() {
  const cartItems = getFilteredCartItems() || [];
  const listEl = document.querySelector(".product-list");
  if (!listEl) {
    return;
  }
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    listEl.innerHTML = `
      <li class="cart-card cart-card--empty">
        Your cart is empty. Browse products to add items to your cart.
      </li>`;
  } else {
    listEl.innerHTML = cartItems
      .map((item, index) => cartItemTemplate(item, index))
      .join("");
  }
  renderCartTotal(cartItems);
}

function renderCartTotal(cartItems) {
  const footer = document.querySelector(".cart-footer");
  const totalEl = document.querySelector(".cart-total");
  if (!footer || !totalEl) {
    return;
  }
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    footer.classList.add("hide");
    totalEl.textContent = "Total: ";
    return;
  }
  const total = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * getItemQuantity(item),
    0,
  );
  footer.classList.remove("hide");
  totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

function cartItemTemplate(item, index) {
  const colorName = item.Colors?.[0]?.ColorName ?? "";
  const image = item.Image || item.Images?.PrimaryMedium;

  return `<li class="cart-card divider">
  <a href="/product_pages/?product=${item.Id}" class="cart-card__image">
    <img
      src="${getImageUrl(image)}"
      alt="${item.Name ?? "Cart item"}"
    />
  </a>
  <a href="/product_pages/?product=${item.Id}" class="card__name">
    ${item.Name ?? ""}
  </a>
  <p class="cart-card__color">${colorName}</p>
  <label class="cart-card__quantity">
    qty:
    <input class="cart-card__quantity-input" type="number" min="1" value="${getItemQuantity(item)}" data-index="${index}" />
  </label>
  <p class="cart-card__price">$${getItemPrice(item).toFixed(2)}</p>
  <button class="cart-card__remove" type="button" data-index="${index}" aria-label="Remove ${item.Name ?? "item"} from cart">Remove</button>
</li>`;
}

setupCartActions();
renderCartContents();
LoadHeaderFooter();
