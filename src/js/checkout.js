import CheckoutProcess from "./CheckoutProcess.mjs";
import { LoadHeaderFooter } from "./utils.mjs";

LoadHeaderFooter();

const checkout = new CheckoutProcess("so-cart", ".order-summary");
const form = document.forms.checkout;
const zipCode = document.querySelector("#zipCode");

checkout.init();

if (zipCode) {
  zipCode.addEventListener("change", () => {
    checkout.calculateOrderTotal();
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    await checkout.checkout(form);
  });
}
