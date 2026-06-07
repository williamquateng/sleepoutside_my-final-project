import ExternalServices from "./ExternalServices.mjs";
import {
  getLocalStorage,
  setCurrentCustomer,
  setLocalStorage,
  qs,
  updateAccountMenu,
} from "./utils.mjs";

const form = qs("#register-form");
const loginForm = qs("#login-form");
const message = qs("#form-message");
const loginMessage = qs("#login-message");
const storageKey = "so-customers";
const services = new ExternalServices();

function getCustomers() {
  const stored = getLocalStorage(storageKey);
  return Array.isArray(stored) ? stored : stored ? [stored] : [];
}

function saveCustomers(customers) {
  setLocalStorage(storageKey, customers);
}

function showMessage(text, type = "error") {
  if (!message) {
    return;
  }

  message.textContent = text;
  message.className = `form-message ${type}`;
}

function showLoginMessage(text, type = "error") {
  if (!loginMessage) {
    return;
  }

  loginMessage.textContent = text;
  loginMessage.className = `form-message ${type}`;
}

function clearMessage() {
  if (!message) {
    return;
  }

  message.textContent = "";
  message.className = "form-message hide";
}

function clearLoginMessage() {
  if (!loginMessage) {
    return;
  }

  loginMessage.textContent = "";
  loginMessage.className = "form-message hide";
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getGenderAvatar(gender) {
  if (gender === "female") {
    return "/images/avatar-female.svg";
  }

  return "/images/avatar-male.svg";
}

function getRegistrationValues() {
  const firstName = form.querySelector("#first-name").value.trim();
  const lastName = form.querySelector("#last-name").value.trim();
  const address = form.querySelector("#address").value.trim();
  const gender = form.querySelector("#gender").value;
  const email = form.querySelector("#email").value.trim().toLowerCase();
  const password = form.querySelector("#password").value;
  const confirmPassword = form.querySelector("#confirm-password").value;

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    address,
    gender,
    email,
    password,
    confirmPassword,
  };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function validateRegistration(customer) {
  if (
    !customer.firstName ||
    !customer.lastName ||
    !customer.address ||
    !customer.gender ||
    !customer.email ||
    !customer.password ||
    !customer.confirmPassword
  ) {
    return "Please complete every required field before registering.";
  }

  if (!isEmailValid(customer.email)) {
    return "Please use a valid email address.";
  }

  if (customer.password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (customer.password !== customer.confirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}

function getErrorMessage(error) {
  if (typeof error.message === "string") {
    return error.message;
  }

  if (error.message?.message) {
    return error.message.message;
  }

  if (error.message) {
    return JSON.stringify(error.message);
  }

  return "Registration could not be completed. Please try again.";
}

async function handleSubmit(event) {
  event.preventDefault();
  clearMessage();

  const customer = getRegistrationValues();
  // handle optional avatar file input (stretch)
  const avatarInput = form.querySelector("#avatar");
  const avatarFile = avatarInput?.files?.[0];
  if (avatarFile) {
    try {
      customer.avatar = await readFileAsDataURL(avatarFile);
    } catch (err) {
      console.warn("Avatar read failed, falling back to gender avatar", err);
      customer.avatar = getGenderAvatar(customer.gender);
    }
  } else {
    customer.avatar = getGenderAvatar(customer.gender);
  }
  const validationError = validateRegistration(customer);
  if (validationError) {
    showMessage(validationError);
    return;
  }

  const customers = getCustomers();
  const existing = customers.find((storedCustomer) => storedCustomer.email === customer.email);

  if (existing) {
    showMessage("An account already exists for that email address.");
    return;
  }

  const customerPayload = {
    ...customer,
    createdAt: new Date().toISOString(),
  };
  delete customerPayload.confirmPassword;

  try {
    const serverResponse = await services.createUser(customerPayload);
    const serverCustomer = serverResponse.Result || serverResponse;
    const savedCustomer = {
      ...customerPayload,
      id: serverCustomer.id || serverCustomer.Id || Date.now(),
    };

    customers.push(savedCustomer);
    saveCustomers(customers);
    setCurrentCustomer(savedCustomer);
    updateAccountMenu();

    showMessage("Registration successful! You are now signed in.", "success");
    form.reset();
    window.location.href = "/index.html";
  } catch (error) {
    showMessage(getErrorMessage(error));
  }
}

function handleLogin(event) {
  event.preventDefault();
  clearLoginMessage();

  const email = loginForm.querySelector("#login-email").value.trim().toLowerCase();
  const password = loginForm.querySelector("#login-password").value;

  if (!email || !password) {
    showLoginMessage("Please enter your email and password.");
    return;
  }

  const customer = getCustomers().find(
    (storedCustomer) =>
      storedCustomer.email === email && storedCustomer.password === password,
  );

  if (!customer) {
    showLoginMessage("No account was found with that email and password.");
    return;
  }

  setCurrentCustomer(customer);
  updateAccountMenu();
  showLoginMessage("You are signed in.", "success");
  loginForm.reset();
  window.location.href = "/index.html";
}

function migrateExistingCustomer() {
  const customers = getCustomers();
  const changedCustomers = customers.map((customer) => {
    if (customer.name && typeof customer.address === "string" && customer.avatar) {
      return customer;
    }

    const address =
      typeof customer.address === "string"
        ? customer.address
        : [
            customer.address?.street || customer.street,
            customer.address?.city || customer.city,
            customer.address?.state || customer.state,
            customer.address?.zip || customer.zip,
          ]
            .filter(Boolean)
            .join(", ");
    const gender = customer.gender || "male";

    return {
      ...customer,
      name: `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim(),
      address,
      gender,
      avatar: customer.avatar || getGenderAvatar(gender),
    };
  });

  saveCustomers(changedCustomers);
}

function setupPasswordVisibilityToggles() {
  document.querySelectorAll(".password-toggle").forEach((button) => {
    const input = button.closest(".password-field")?.querySelector("input");
    if (!input) {
      return;
    }

    button.addEventListener("click", () => {
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      button.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", String(isHidden));
      button.classList.toggle("is-visible", isHidden);
    });
  });
}

if (form || loginForm) {
  migrateExistingCustomer();
}

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

setupPasswordVisibilityToggles();

function setupAvatarPreview() {
  const avatarInput = form?.querySelector("#avatar");
  const preview = form?.querySelector("#avatar-preview");
  if (!avatarInput || !preview) return;

  avatarInput.addEventListener("change", async () => {
    const file = avatarInput.files?.[0];
    if (!file) {
      preview.src = "";
      preview.classList.add("hide");
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      preview.src = dataUrl;
      preview.classList.remove("hide");
    } catch (err) {
      console.warn("Failed to load avatar preview", err);
      preview.src = "";
      preview.classList.add("hide");
    }
  });
}

setupAvatarPreview();
