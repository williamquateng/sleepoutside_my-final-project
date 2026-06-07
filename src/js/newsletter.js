import ExternalServices from "./ExternalServices.mjs";
import { qs, getLocalStorage, setLocalStorage } from "./utils.mjs";

const form = qs("#newsletter-form");
const message = qs("#newsletter-message");
const services = new ExternalServices();
const storageKey = "so-newsletter-subscribers";

function showMessage(text, type = "error") {
  if (!message) {
    return;
  }
  message.textContent = text;
  message.className = `form-message ${type}`;
}

function clearMessage() {
  if (!message) {
    return;
  }
  message.textContent = "";
  message.className = "form-message hide";
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSubscribers() {
  const stored = getLocalStorage(storageKey);
  return Array.isArray(stored) ? stored : stored ? [stored] : [];
}

function saveSubscriber(email) {
  const subscribers = getSubscribers();
  if (subscribers.some((subscriber) => subscriber.email === email)) {
    return subscribers;
  }

  const updated = [...subscribers, { email, subscribedAt: new Date().toISOString() }];
  setLocalStorage(storageKey, updated);
  return updated;
}

async function handleSubscribe(event) {
  event.preventDefault();
  clearMessage();

  const emailInput = form.querySelector("#newsletter-email");
  const email = emailInput.value.trim().toLowerCase();

  if (!email || !isEmailValid(email)) {
    showMessage("Please enter a valid email address.");
    return;
  }

  const existingSubscribers = getSubscribers();
  if (existingSubscribers.some((subscriber) => subscriber.email === email)) {
    showMessage("You are already subscribed.", "success");
    form.reset();
    return;
  }

  try {
    await services.subscribeNewsletter({ email, source: "home" });
    saveSubscriber(email);
    showMessage("Thank you! You are subscribed to the newsletter.", "success");
    form.reset();
  } catch (error) {
    saveSubscriber(email);
    showMessage(
      "Sign-up saved locally. If an online service is available, it will be submitted automatically later.",
      "success",
    );
    form.reset();
  }
}

if (form) {
  form.addEventListener("submit", handleSubscribe);
}
