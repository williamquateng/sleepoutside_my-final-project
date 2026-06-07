export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function isDiscounted(product) {
  return product.FinalPrice < product.SuggestedRetailPrice;
}

export function getDiscountAmount(product) {
  return product.SuggestedRetailPrice - product.FinalPrice;
}

export function getListingPriceHtml(product) {
  if (isDiscounted(product)) {
    return `<div class="product-pricing">
      <p class="product-card__price--retail">$${product.SuggestedRetailPrice.toFixed(2)}</p>
      <p class="product-card__price">$${product.FinalPrice.toFixed(2)}</p>
    </div>`;
  }
  return `<p class="product-card__price">$${product.FinalPrice.toFixed(2)}</p>`;
}

export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.replace(/^(\.\.\/)+/, "").replace(/^\//, "");
  return `/${normalized}`;
}

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

let previousCartCount = null;

export function getLocalStorage(key) {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }
  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function clearLocalStorage(key) {
  localStorage.removeItem(key);
}

const authTokenKey = "so-auth-token";

export function getAuthToken() {
  return localStorage.getItem(authTokenKey);
}

export function setAuthToken(token) {
  if (token == null) {
    localStorage.removeItem(authTokenKey);
    return;
  }
  localStorage.setItem(authTokenKey, String(token));
}

export function clearAuthToken() {
  localStorage.removeItem(authTokenKey);
}

export function getCurrentCustomer() {
  return getLocalStorage("so-current-customer");
}

export function setCurrentCustomer(customer) {
  setLocalStorage("so-current-customer", customer);
}

export function clearCurrentCustomer() {
  clearLocalStorage("so-current-customer");
}

export function getCustomerStorageKey(prefix, customer = getCurrentCustomer()) {
  if (!customer) {
    return null;
  }

  const identifier = customer.id || customer.email;
  return `${prefix}-${String(identifier).toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
}
export function normalizeCartItems(cart) {
  if (!cart) return [];

  const items = Array.isArray(cart) ? cart : [cart];
  const normalized = new Map();

  for (const item of items) {
    if (!item || typeof item !== "object" || !item.Id) continue;
    const id = String(item.Id);
    const quantity = Number(item.Quantity) || 1;
    const existing = normalized.get(id);
    if (existing) {
      existing.Quantity = (Number(existing.Quantity) || 1) + quantity;
    } else {
      normalized.set(id, { ...item, Quantity: quantity });
    }
  }

  return [...normalized.values()];
}

export function getCartItems() {
  const storedCart = getLocalStorage("so-cart");
  return normalizeCartItems(storedCart);
}

export function setCartItems(cart) {
  const cartArray = Array.isArray(cart) ? cart : [cart];
  setLocalStorage("so-cart", normalizeCartItems(cartArray));
}

export function getCartCount() {
  const cartItems = getCartItems();

  return cartItems.reduce(
    (total, item) => total + (Number(item.Quantity) || 1),
    0,
  );
}

export function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  const cartWrapper = document.querySelector(".cart");
  if (!cartCount) {
    return;
  }

  const count = getCartCount();
  cartCount.textContent = count;
  cartCount.classList.toggle("hide", count === 0);

  if (previousCartCount !== null && count > previousCartCount && cartWrapper) {
    cartWrapper.classList.add("cart-added");
    cartWrapper.addEventListener(
      "animationend",
      () => cartWrapper.classList.remove("cart-added"),
      { once: true },
    );
  }

  previousCartCount = count;
}

export function alertMessage(message, scroll = true) {
  const main = document.querySelector("main");
  if (!main) {
    return;
  }

  const alert = document.createElement("section");
  alert.classList.add("message-alert");
  alert.innerHTML = `<p>${message}</p><button type="button" aria-label="Close message">X</button>`;
  alert.querySelector("button").addEventListener("click", () => {
    alert.remove();
  });
  main.prepend(alert);

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  const htmlStrings = list.map(templateFn);

  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(
  template,
  parentElement,
  data,
  callback,
) {
  parentElement.innerHTML = template;
  if(callback) {
    callback(data);
  }

  /*const htmlStrings = list.map(templateFn);

  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));*/
}

export async function loadTemplate(path) {
    const res = await fetch(path);
    const template = await res.text();
    return template;
}

export async function LoadHeaderFooter() {
  const headerTemplate = await loadTemplate("../partials/header.html");
  const headerElement = document.querySelector("#header");
  renderWithTemplate(headerTemplate, headerElement);
  updateCartCount();
  updateAccountMenu();

  const footerTemplate = await loadTemplate("../partials/footer.html");
  const footerElement = document.querySelector("#footer");
  renderWithTemplate(footerTemplate, footerElement);
}

export function updateAccountMenu() {
  const account = document.querySelector(".account");
  if (!account) {
    return;
  }

  const customer = getCurrentCustomer();
  if (!customer) {
    account.innerHTML = `
      <a class="account-link" href="/register/index.html">Register</a>
      <a class="account-link" href="/signin/index.html">Sign In</a>
    `;
    return;
  }

  const avatar = customer.avatar
    ? `<img class="account-avatar" src="${escapeHtml(customer.avatar)}" alt="${escapeHtml(customer.firstName || customer.name || "Customer")} avatar" />`
    : "";
  account.innerHTML = `
    ${avatar}
    <span class="account-greeting">Hi, ${escapeHtml(customer.firstName || customer.name || "Customer")}</span>
    <a class="account-link" href="/wishlist/index.html">Wishlist</a>
    <button class="account-link account-logout" type="button">Logout</button>
  `;
  account.querySelector(".account-logout").addEventListener("click", () => {
    clearCurrentCustomer();
    localStorage.removeItem("registerBannerSeen");
    window.location.href = "/index.html";
  });
}

/* Backlog 3 - Animate cart (backpack) icon when item added to cart */
/* Added by Cliff Cummings */
export function animateCartIcon() {
  const cart = document.querySelector(".cart");
  if (!cart) return;
  cart.classList.remove("cart-animate");
  cart.classList.add("cart-animate");
  cart.addEventListener("animationend", () => {
    cart.classList.remove("cart-animate");
  }, { once: true });
}

export function showRegisterBanner() {
  if (
    getCurrentCustomer() ||
    !document.querySelector(".hero") ||
    document.querySelector(".register-banner")
  ) {
    return;
  }

  // Create the banner element
  const banner = document.createElement("div");
  banner.classList.add("register-banner");
  banner.innerHTML = `
    <p>Register today for a chance to win a free tent!</p>
    <div class="register-banner__buttons">
      <a href="/register/index.html">
        <button type="button" class="register-banner__register">Register Now</button>
      </a>
      <button type="button" class="register-banner__dismiss">No Thanks</button>
      <button type="button" class="register-banner__close">✕</button>
    </div>
  `;

  // Add click listeners for all three buttons
  banner.querySelector(".register-banner__close").addEventListener("click", () => {
    dismissBanner(banner);
  });

  banner.querySelector(".register-banner__dismiss").addEventListener("click", () => {
    dismissBanner(banner);
  });

  banner.querySelector(".register-banner__register").addEventListener("click", () => {
    dismissBanner(banner);
  });

  // Insert at the top of main
  const main = document.querySelector("main");
  if (main) {
    main.prepend(banner);
  }
}

function dismissBanner(banner) {
  banner.remove();
}