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
    try {
      const order = this.formDataToJSON(form);
      this.calculateOrderTotal();

      order.orderDate = new Date().toISOString();
      order.items = this.packageItems(this.list);
      order.orderTotal = this.orderTotal.toFixed(2);
      order.shipping = this.shipping;
      order.tax = this.tax.toFixed(2);
      order.cardNumber = order.cardNumber.replace(/\s/g, "");

      const response = await this.services.checkout(order);
      clearLocalStorage(this.key);
      updateCartCount();
      window.location.href = "/checkout/success.html";
      return response;
    } catch (error) {
      alertMessage(this.getErrorMessage(error));
      return null;
    }
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