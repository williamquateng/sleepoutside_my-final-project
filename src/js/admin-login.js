import ExternalServices from "./ExternalServices.mjs";
import { qs, setAuthToken, clearAuthToken } from "./utils.mjs";

const loginForm = qs("#admin-login-form");
const loginMessage = qs("#admin-login-message");
const services = new ExternalServices();

function showLoginMessage(text, type = "error") {
  if (!loginMessage) {
    return;
  }

  loginMessage.textContent = text;
  loginMessage.className = `form-message ${type}`;
}

function clearLoginMessage() {
  if (!loginMessage) {
    return;
  }

  loginMessage.textContent = "";
  loginMessage.className = "form-message hide";
}

function extractToken(response) {
  if (!response) {
    return null;
  }

  return (
    response.Result?.token ||
    response.result?.token ||
    response.Token ||
    response.token ||
    response.accessToken ||
    response.access_token ||
    null
  );
}

async function handleLogin(event) {
  event.preventDefault();
  clearLoginMessage();

  const email = loginForm.querySelector("#admin-email").value.trim().toLowerCase();
  const password = loginForm.querySelector("#admin-password").value;

  if (!email || !password) {
    showLoginMessage("Please enter your email and password.");
    return;
  }

  try {
    const response = await services.login({ email, password });
    const token = extractToken(response);

    if (!token) {
      throw new Error("Login succeeded but no token was returned.");
    }

    clearAuthToken();
    setAuthToken(token);
    window.location.href = "/admin/orders/index.html";
  } catch (error) {
    const message = error?.message || "Unable to sign in. Please check your credentials and try again.";
    showLoginMessage(message);
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}
