import {
  escapeHtml,
  getDiscountAmount,
  getImageUrl,
  getCurrentCustomer,
  getCustomerStorageKey,
  getLocalStorage,
  isDiscounted,
  setLocalStorage,
  setCartItems,
  alertMessage,
  updateCartCount,
  animateCartIcon, // Backlog 3 - Animate cart (backpack) icon when item added to cart - CEC
} from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource, category) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    this.category = category;
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    this.renderProductDetails();
    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));
    document
      .getElementById("addToWishlist")
      .addEventListener("click", this.addProductToWishlist.bind(this));

    const commentForm = document.querySelector("#comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", this.addProductComment.bind(this));
    }
  }

  addProductToCart() {
    this.addItemToCart(this.product);
    animateCartIcon(); // Backlog 3 - Animate cart (backpack) icon when item added to cart - CEC
    alertMessage(`${this.product.Name} was added to the cart.`, false);
  }

  addItemToCart(product) {
    const cart = getCartItems();
    const cartItem = cart.find((item) => item.Id === product.Id);

    if (cartItem) {
      cartItem.Quantity = (Number(cartItem.Quantity) || 1) + 1;
    } else {
      cart.push({ ...product, Quantity: 1 });
    }

    setCartItems(cart);
    updateCartCount();
  }

  getWishlist() {
    const wishlistKey = getCustomerStorageKey("so-wishlist");
    if (!wishlistKey) {
      return [];
    }

    const storedWishlist = getLocalStorage(wishlistKey);
    return Array.isArray(storedWishlist) ? storedWishlist : [];
  }

  saveWishlist(wishlist) {
    const wishlistKey = getCustomerStorageKey("so-wishlist");
    if (!wishlistKey) {
      return;
    }

    setLocalStorage(wishlistKey, wishlist);
  }

  addProductToWishlist() {
    const customer = getCurrentCustomer();
    if (!customer) {
      alertMessage("Please register or sign in before adding items to your wishlist.");
      return;
    }

    const wishlist = this.getWishlist();
    const existingItem = wishlist.find((item) => item.Id === this.product.Id);

    if (existingItem) {
      alertMessage(`${this.product.Name} is already in your wishlist.`, false);
      return;
    }

    wishlist.push({ ...this.product, addedAt: new Date().toISOString() });
    this.saveWishlist(wishlist);
    alertMessage(`${this.product.Name} was added to your wishlist.`, false);
  }

  getAllComments() {
    const storedComments = getLocalStorage("so-product-comments");
    return storedComments && typeof storedComments === "object" ? storedComments : {};
  }

  saveAllComments(comments) {
    setLocalStorage("so-product-comments", comments);
  }

  getProductComments() {
    const comments = this.getAllComments();
    return Array.isArray(comments[this.product.Id]) ? comments[this.product.Id] : [];
  }

  addProductComment(event) {
    event.preventDefault();

    const customer = getCurrentCustomer();
    if (!customer) {
      alertMessage("Please register or sign in before adding a comment.");
      this.updateCommentForm();
      return;
    }

    const commentInput = document.querySelector("#comment-text");
    const commentText = commentInput.value.trim();
    if (!commentText) {
      alertMessage("Please enter a comment before submitting.");
      return;
    }

    const comments = this.getAllComments();
    const productComments = this.getProductComments();
    const customerName =
      customer.name ||
      [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
      "Customer";
    productComments.push({
      id: Date.now(),
      customerName,
      customerEmail: customer.email,
      avatar: customer.avatar,
      text: commentText,
      createdAt: new Date().toISOString(),
    });
    comments[this.product.Id] = productComments;
    this.saveAllComments(comments);
    commentInput.value = "";
    this.renderComments();
    alertMessage("Your comment was posted.", false);
  }

  updateCommentForm() {
    const customer = getCurrentCustomer();
    const commentForm = document.querySelector("#comment-form");
    if (!commentForm) {
      return;
    }

    const commentInput = commentForm.querySelector("#comment-text");
    const submitButton = commentForm.querySelector("button");
    const loginMessage = commentForm.querySelector(".comment-login-message");

    commentInput.disabled = !customer;
    submitButton.disabled = !customer;
    loginMessage.classList.toggle("hide", Boolean(customer));
  }

  renderComments() {
    const commentList = document.querySelector("#comment-list");
    if (!commentList) {
      return;
    }

    const productComments = this.getProductComments();
    if (productComments.length === 0) {
      commentList.innerHTML = `<p class="empty-message">No comments yet.</p>`;
      this.updateCommentForm();
      return;
    }

    commentList.innerHTML = productComments
      .map((comment) => this.commentTemplate(comment))
      .join("");
    this.updateCommentForm();
  }

  commentTemplate(comment) {
    const avatar = comment.avatar
      ? `<img src="${escapeHtml(comment.avatar)}" alt="${escapeHtml(comment.customerName)} avatar" />`
      : "";
    const date = new Date(comment.createdAt).toLocaleDateString();

    return `<article class="comment-card">
      ${avatar}
      <div>
        <h4>${escapeHtml(comment.customerName || "Customer")}</h4>
        <p class="comment-date">${escapeHtml(date)}</p>
        <p>${escapeHtml(comment.text)}</p>
      </div>
    </article>`;
  }

  renderProductDetails() {
    const { product } = this;

    document.querySelector(".product-detail h3").textContent =
      product.Brand.Name;
    document.querySelector(".product-detail h2").textContent =
      product.NameWithoutBrand;

    const img = document.querySelector(".product-detail img");
    img.src = getImageUrl(product.Images.PrimaryMedium || product.Images.PrimaryLarge);
    img.srcset = [
      [product.Images.PrimarySmall, "80w"],
      [product.Images.PrimaryMedium, "160w"],
      [product.Images.PrimaryLarge, "320w"],
      [product.Images.PrimaryExtraLarge, "600w"],
    ]
      .filter(([image]) => image)
      .map(([image, width]) => `${getImageUrl(image)} ${width}`)
      .join(", ");
    img.sizes = "(max-width: 700px) 100vw, 500px";
    img.alt = product.NameWithoutBrand;

    const retailEl = document.querySelector(".product-card__price--retail");
    const priceEl = document.querySelector(".product-card__price");
    const discountEl = document.querySelector(".product-discount");
    const discountFlagEl = document.querySelector(".product-discount-flag");
    const breadcrumbs = document.querySelector(".breadcrumbs");

    if (breadcrumbs) {
      const category = this.category || product.Category || "";
      const categoryName = category
        .split("-")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
      const homeLink = `<a href="/index.html">Home</a>`;
      const categoryLink = categoryName
        ? `<a href="/product_listing/index.html?category=${encodeURIComponent(category)}">${categoryName}</a>`
        : "";
      const productName = product.NameWithoutBrand || "Product";

      if (categoryLink) {
        breadcrumbs.innerHTML = `${homeLink} &gt; ${categoryLink} &gt; ${productName}`;
      } else {
        breadcrumbs.innerHTML = `${homeLink} &gt; ${productName}`;
      }
    }

    priceEl.textContent = `$${product.FinalPrice.toFixed(2)}`;

    if (isDiscounted(product)) {
      const savings = getDiscountAmount(product);
      retailEl.textContent = `$${product.SuggestedRetailPrice.toFixed(2)}`;
      retailEl.classList.remove("hide");
      discountEl.textContent = `Save $${savings.toFixed(2)}`;
      discountEl.classList.remove("hide");
      discountFlagEl.textContent = `Save $${savings.toFixed(2)}`;
      discountFlagEl.classList.remove("hide");
    } else {
      retailEl.textContent = "";
      retailEl.classList.add("hide");
      discountEl.textContent = "";
      discountEl.classList.add("hide");
      discountFlagEl.textContent = "";
      discountFlagEl.classList.add("hide");
    }

    document.querySelector(".product__color").textContent =
      product.Colors[0].ColorName;
    document.querySelector(".product__description").innerHTML =
      product.DescriptionHtmlSimple;

    document.getElementById("addToCart").dataset.id = product.Id;
    document.getElementById("addToWishlist").dataset.id = product.Id;
    this.renderComments();
    document.title = `Sleep Outside | ${product.Name}`;
  }
}
