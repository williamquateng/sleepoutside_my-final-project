import {
  addProductToWishlist,
  alertMessage,
  animateCartIcon,
  escapeHtml,
  getCurrentCustomer,
  getImageUrl,
  getLocalStorage,
  getWishlistItems,
  LoadHeaderFooter,
  saveWishlistItems,
  setCartItems,
  updateCartCount,
  updateWishlistCount,
} from "./utils.mjs";

const listElement = document.querySelector(".wishlist-list");
const emptyMessage = document.querySelector(".wishlist-empty");


function getCartItems() {
  const storedCart = getLocalStorage("so-cart");
  return Array.isArray(storedCart) ? storedCart : storedCart ? [storedCart] : [];
}

function addToCart(product) {
  const cart = getCartItems();
  const existingItem = cart.find((item) => item.Id === product.Id);

  if (existingItem) {
    existingItem.Quantity = (Number(existingItem.Quantity) || 1) + 1;
  } else {
    cart.push({ ...product, Quantity: 1 });
  }
  setCartItems(cart);
  updateCartCount();
  animateCartIcon();
}

function removeWishlistItem(index) {
  const wishlist = getWishlistItems();
  wishlist.splice(index, 1);
  saveWishlistItems(wishlist);
  renderWishlist();
}

function moveWishlistItemToCart(index) {
  const wishlist = getWishlistItems();
  const product = wishlist[index];
  if (!product) {
    return;
  }

  addToCart(product);
  wishlist.splice(index, 1);
  saveWishlistItems(wishlist);
  renderWishlist();
  alertMessage(`${product.Name} was moved to the cart.`, false);
}

function wishlistItemTemplate(item, index) {
  const image = item.Images?.PrimaryMedium || item.Image;
  const category = item.Category ? `&category=${encodeURIComponent(item.Category)}` : "";

  return `<li class="wishlist-card product-card">
    <a href="/product_pages/?product=${encodeURIComponent(item.Id)}${category}">
      <img src="${getImageUrl(image)}" alt="${escapeHtml(item.Name)}" />
      <h3 class="card__brand">${escapeHtml(item.Brand?.Name || "")}</h3>
      <h2 class="card__name">${escapeHtml(item.NameWithoutBrand || item.Name)}</h2>
      <p class="product-card__price">$${Number(item.FinalPrice).toFixed(2)}</p>
    </a>
    <div class="wishlist-card__actions">
      <button type="button" data-action="move" data-index="${index}">Move to Cart</button>
      <button type="button" data-action="remove" data-index="${index}">Remove</button>
    </div>
  </li>`;
}

function renderWishlist() {
  if (!listElement) return;

  const customer = getCurrentCustomer();
  const wishlist = getWishlistItems();

  if (wishlist.length === 0) {
    emptyMessage.innerHTML = customer
      ? "Your wishlist is empty."
      : 'Your wishlist is empty. <a href="/register/index.html">Register</a> to save your wishlist across devices.';
    listElement.innerHTML = "";
    updateWishlistCount();
    return;
  }

  emptyMessage.textContent = "";
  listElement.innerHTML = wishlist
    .map((item, index) => wishlistItemTemplate(item, index))
    .join("");
  updateWishlistCount();
}

listElement.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const index = Number(button.dataset.index);
  if (!Number.isInteger(index)) {
    return;
  }

  if (button.dataset.action === "move") {
    moveWishlistItemToCart(index);
  }

  if (button.dataset.action === "remove") {
    removeWishlistItem(index);
  }
});

renderWishlist();
LoadHeaderFooter();
