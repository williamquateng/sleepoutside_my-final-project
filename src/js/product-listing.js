import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.js";
import {
  addProductToWishlist,
  alertMessage,
  getParam,
  LoadHeaderFooter,
  getImageUrl,
  getListingPriceHtml,
  updateWishlistCount,
} from "./utils.mjs";

const category = getParam("category") || "tents";
const searchTerm = getParam("search");
const query = searchTerm || category;
const dataSource = new ExternalServices();
const productListElement = document.querySelector(".product-list");
const title = document.querySelector(".product-listing__title");
const sort = document.querySelector(".product-sort");
const breadcrumbs = document.querySelector(".breadcrumbs");
const modal = document.getElementById("productQuickViewModal");
const modalBody = modal?.querySelector(".product-modal__body");
const listing = new ProductList(query, dataSource, productListElement);

function getQuickViewImageSrcset(product) {
  return [
    [product.Images?.PrimarySmall, "80w"],
    [product.Images?.PrimaryMedium, "160w"],
    [product.Images?.PrimaryLarge, "320w"],
  ]
    .filter(([image]) => image)
    .map(([image, width]) => `${getImageUrl(image)} ${width}`)
    .join(", ");
}

function getQuickViewHtml(product) {
  const image = getImageUrl(
    product.Images?.PrimaryMedium ||
      product.Images?.PrimaryLarge ||
      product.Image ||
      "",
  );
  const srcset = getQuickViewImageSrcset(product);
  const categoryParam = product.Category
    ? `&category=${encodeURIComponent(product.Category)}`
    : "";

  return `
    <div class="product-quick-view">
      <button class="product-modal__close" type="button" aria-label="Close quick view">&times;</button>
      <img src="${image}" ${srcset ? `srcset="${srcset}" sizes="(min-width: 700px) 320px, 80vw"` : ""} alt="${product.NameWithoutBrand}" />
      <h3 class="card__brand">${product.Brand?.Name || ""}</h3>
      <h2 class="card__name">${product.NameWithoutBrand}</h2>
      ${getListingPriceHtml(product)}
      <div class="product-description">${product.DescriptionHtmlSimple || product.Description || ""}</div>
      <a class="button" href="/product_pages/?product=${product.Id}${categoryParam}">View full product</a>
    </div>
  `;
}

function openQuickView(product) {
  if (!modal || !modalBody) {
    return;
  }

  modalBody.innerHTML = getQuickViewHtml(product);
  modal.classList.remove("hide");
}

function closeQuickView() {
  if (!modal) {
    return;
  }

  modal.classList.add("hide");
}

productListElement?.addEventListener("click", async (event) => {
  const quickViewButton = event.target.closest("[data-quick-view-id]");
  if (quickViewButton) {
    event.preventDefault();
    const productId = quickViewButton.dataset.quickViewId;
    const product = await dataSource.findProductById(productId);
    openQuickView(product);
    return;
  }

  const wishlistButton = event.target.closest("[data-wishlist-id]");
  if (wishlistButton) {
    event.preventDefault();
    const productId = wishlistButton.dataset.wishlistId;
    const product = await dataSource.findProductById(productId);
    const added = addProductToWishlist(product);
    if (added) {
      alertMessage(`${product.Name} was added to your wishlist.`, false);
    } else {
      alertMessage(`${product.Name} is already in your wishlist.`, false);
    }
    updateWishlistCount();

function formatCategory(value) {
  return value
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function updateTitle() {
  if (!title) {
    return;
  }

  if (searchTerm) {
    title.textContent = `Search Results: ${searchTerm}`;
    return;
  }

  title.textContent = `Top Products: ${formatCategory(category)}`;
}

function updateBreadcrumb(products) {
  if (!breadcrumbs) {
    return;
  }

  const homeCrumb = `<a href="/index.html">Home</a>`;
  if (searchTerm) {
    breadcrumbs.innerHTML = `${homeCrumb} &gt; Search results for "${searchTerm}" (${products.length} items)`;
    return;
  }

  const categoryLabel = formatCategory(category);
  const categoryLink = `<a href="/product_listing/index.html?category=${encodeURIComponent(category)}">${categoryLabel}</a>`;
  breadcrumbs.innerHTML = `${homeCrumb} &gt; ${categoryLink} &gt; ${products.length} items`;
}

async function init() {
  LoadHeaderFooter();
  const alerts = new Alert();
  await alerts.init();
  updateTitle();

  const products = await listing.init();
  updateBreadcrumb(products);

  if (sort) {
    sort.addEventListener("change", () => {
      listing.sortProducts(sort.value);
    });
  }
}

init();
