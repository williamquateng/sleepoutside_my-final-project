import { getImageUrl, getListingPriceHtml, renderListWithTemplate } from "./utils.mjs";

function getProductImage(product, size) {
  return product.Images?.[size] || product.Image || product.Images?.PrimaryMedium || "";
}

function getProductImageSrcset(product) {
  const imageSizes = [
    [getProductImage(product, "PrimarySmall"), "80w"],
    [getProductImage(product, "PrimaryMedium"), "160w"],
    [getProductImage(product, "PrimaryLarge"), "320w"],
  ];

  return imageSizes
    .filter(([image]) => image)
    .map(([image, width]) => `${getImageUrl(image)} ${width}`)
    .join(", ");
}

function productCardTemplate(product, category) {
  const image = getProductImage(product, "PrimaryMedium");
  const srcset = getProductImageSrcset(product);
  const productCategory = product.Category || category || "";
  const categoryParam = productCategory ? `&category=${productCategory}` : "";
  return `<li class="product-card">
  <a href="/product_pages/?product=${product.Id}${categoryParam}">
    <img
      src="${getImageUrl(image)}"
      ${srcset ? `srcset="${srcset}" sizes="(min-width: 900px) 250px, (min-width: 700px) 180px, 80vw"` : ""}
      alt="${product.Name}"
    />
    <h3 class="card__brand">${product.Brand.Name}</h3>
    <h2 class="card__name">${product.NameWithoutBrand}</h2>
    ${getListingPriceHtml(product)}
  </a>
  <button class="product-card__quick-view" type="button" data-quick-view-id="${product.Id}">
    Quick View
  </button>
  <button class="product-card__wishlist" type="button" data-wishlist-id="${product.Id}">
    Add to Wishlist
  </button>
</li>`;
}

function getProductFamily(product) {
  return product.NameWithoutBrand.split(" - ")[0];
}

function getUniqueProducts(products) {
  const productFamilies = new Set();

  return products.filter((product) => {
    const family = getProductFamily(product);
    if (productFamilies.has(family)) {
      return false;
    }

    productFamilies.add(family);
    return true;
  });
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    const list = await this.dataSource.getData(this.category);
    this.products = getUniqueProducts(list);
    this.renderList(this.products);
    return this.products;
  }

  sortProducts(sortBy) {
    const sortedProducts = [...this.products];

    if (sortBy === "name-asc") {
      sortedProducts.sort((a, b) => a.Name.localeCompare(b.Name));
    }

    if (sortBy === "name-desc") {
      sortedProducts.sort((a, b) => b.Name.localeCompare(a.Name));
    }

    if (sortBy === "price-asc") {
      sortedProducts.sort((a, b) => Number(a.FinalPrice) - Number(b.FinalPrice));
    }

    if (sortBy === "price-desc") {
      sortedProducts.sort((a, b) => Number(b.FinalPrice) - Number(a.FinalPrice));
    }

    this.renderList(sortedProducts);
  }

  renderList(list) {
    if (!list.length) {
      this.listElement.innerHTML = `
        <li class="product-list__empty">
          No products found. Try a different search or browse another category.
        </li>
      `;
      return;
    }

    renderListWithTemplate(
      (product) => productCardTemplate(product, this.category),
      this.listElement,
      list,
      "afterbegin",
      true,
    );
  }
}
