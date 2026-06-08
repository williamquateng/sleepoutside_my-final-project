import ExternalServices from "./ExternalServices.mjs";
import {
  alertMessage,
  clearLocalStorage,
  getLocalStorage,
  updateCartCount,
} from "./utils.mjs";

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemSubtotal = 0;
    this.itemCount = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
    this.services = new ExternalServices();
  }

  init() {
    const storedCart = getLocalStorage(this.key);
    this.list = Array.isArray(storedCart)
      ? storedCart
      : storedCart
        ? [storedCart]
        : [];
    this.calculateItemSubtotal();
  }

  calculateItemSubtotal() {
    this.itemSubtotal = this.list.reduce(
      (total, item) =>
        total + (Number(item.FinalPrice) || 0) * (Number(item.Quantity) || 1),
      0,
    );
    this.itemCount = this.list.reduce(
      (total, item) => total + (Number(item.Quantity) || 1),
      0,
    );

    this.displayOrderTotals();
  }

  calculateOrderTotal() {
    this.tax = this.itemSubtotal * 0.06;
    this.shipping = this.itemCount > 0 ? 10 + (this.itemCount - 1) * 2 : 0;
    this.orderTotal = this.itemSubtotal + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const numItems = document.querySelector(`${this.outputSelector} #num-items`);
    if (numItems) numItems.textContent = this.itemCount;

    this.setSummaryText("cartTotal", this.itemSubtotal);
    this.setSummaryText("tax", this.tax);
    this.setSummaryText("shipping", this.shipping);
    this.setSummaryText("orderTotal", this.orderTotal);
  }

  setSummaryText(id, amount) {
    const element = document.querySelector(`${this.outputSelector} #${id}`);
    if (element) {
      element.textContent = `$${amount.toFixed(2)}`;
    }
  }

  packageItems(items) {
    return items.map((item) => ({
      id: item.Id,
      name: item.Name,
      price: item.FinalPrice,
      quantity: Number(item.Quantity) || 1,
    }));
  }

  formDataToJSON(form) {
    const formData = new FormData(form);
    return Object.fromEntries(formData.entries());
  }

  async checkout(form) {
    const inlineMessageEl = document.querySelector("#checkout-message");

    function showInline(text, type = "error") {
      if (inlineMessageEl) {
        inlineMessageEl.textContent = text;
        inlineMessageEl.className = `form-message ${type}`;
        inlineMessageEl.classList.remove("hide");
      }
      alertMessage(text);
    }

    try {
      // Basic pre-flight checks
      if (!Array.isArray(this.list) || this.list.length === 0) {
        showInline("Your cart is empty. Please add items before checking out.");
        return null;
      }

      const order = this.formDataToJSON(form);
      this.calculateOrderTotal();

      // Validate card number (Luhn) if present
      const cardNumberRaw = (order.cardNumber || "").replace(/\s/g, "");
      if (!cardNumberRaw || !this.isCardNumberValid(cardNumberRaw)) {
        showInline("Please enter a valid credit card number.");
        return null;
      }

      // Validate expiry
      if (!order.expiration || !this.isExpiryValid(order.expiration)) {
        showInline("Please enter a valid expiration date in MM/YY format.");
        return null;
      }

      // Validate CVC
      if (!order.code || !this.isCvcValid(order.code)) {
        showInline("Please enter a valid 3-digit CVC/CVV code.");
        return null;
      }

      // minimal email check if provided
      if (order.email && !this.isEmailValid(order.email)) {
        showInline("Please enter a valid email address.");
        return null;
      }

      order.orderDate = new Date().toISOString();
      order.items = this.packageItems(this.list);
      order.orderTotal = this.orderTotal.toFixed(2);
      order.shipping = this.shipping;
      order.tax = this.tax.toFixed(2);
      order.cardNumber = cardNumberRaw;

      const response = await this.services.checkout(order);

      clearLocalStorage(this.key);
      updateCartCount();

      showInline("Your order was placed successfully. Redirecting...", "success");
      // small delay so user sees message before redirect
      setTimeout(() => {
        window.location.href = "/checkout/success.html";
      }, 900);

      return response;
    } catch (error) {
      const msg = this.getErrorMessage(error);
      const friendly = msg || "Unable to process your order. Please check your information and try again.";
      const inline = `Checkout failed: ${friendly}`;
      alertMessage(inline);
      const inlineMessageEl2 = document.querySelector("#checkout-message");
      if (inlineMessageEl2) {
        inlineMessageEl2.textContent = inline;
        inlineMessageEl2.className = `form-message error`;
        inlineMessageEl2.classList.remove("hide");
      }
      return null;
    }
  }

  isEmailValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
  }

  isCardNumberValid(number) {
    // Luhn algorithm
    const sanitized = String(number).replace(/\D/g, "");
    if (!/^[0-9]{13,19}$/.test(sanitized)) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  isExpiryValid(value) {
    // Expect MM/YY
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(value)) return false;
    const [mm, yy] = value.split("/").map((v) => parseInt(v, 10));
    const now = new Date();
    const fullYear = 2000 + yy;
    const expiry = new Date(fullYear, mm, 1);
    // set to first day of month following expiry
    const endOfMonth = new Date(fullYear, mm, 0, 23, 59, 59);
    return endOfMonth >= now;
  }

  isCvcValid(value) {
    return /^[0-9]{3,4}$/.test(String(value || ""));
  }

  getErrorMessage(error) {
    if (typeof error.message === "string") {
      return error.message;
    }

    if (error.message?.message) {
      return error.message.message;
    }

    if (error.message) {
      return JSON.stringify(error.message);
    }

    return "Unable to process your order. Please check your information and try again.";
  }
}