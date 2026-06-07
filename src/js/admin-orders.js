import ExternalServices from "./ExternalServices.mjs";
import { qs, getAuthToken, clearAuthToken, escapeHtml, LoadHeaderFooter } from "./utils.mjs";

const ordersList = qs(".orders-list");
const message = qs("#orders-message");
const logoutButton = qs("#admin-logout");
const services = new ExternalServices();

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

function normalizeOrderItems(order) {
  const items = order.items || order.Items || [];
  if (!Array.isArray(items)) {
    return [];
  }
  return items;
}

function formatDate(value) {
  if (!value) {
    return "Unknown date";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function renderOrder(order) {
  const orderId = escapeHtml(order.Id || order.id || order.OrderId || order.orderId || "Unknown");
  const status = escapeHtml(order.Status || order.status || order.orderStatus || "New");
  const total = escapeHtml(String(order.orderTotal || order.OrderTotal || order.total || order.Total || "N/A"));
  const created = formatDate(order.orderDate || order.createdAt || order.createdAtDate || order.created_at || "");
  const customer = escapeHtml(order.customerName || order.customerEmail || order.email || order.CustomerName || "Unknown customer");
  const items = normalizeOrderItems(order);

  const itemsHtml = items.length
    ? `<ul class="order-items">${items
        .map(
          (item) => `
            <li>${escapeHtml(item.Name || item.name || item.productName || item.ProductName || "Item")} × ${escapeHtml(String(item.Quantity || item.quantity || item.qty || 1))}</li>`,
        )
        .join("")}
      </ul>`
    : "<p>No item details available.</p>";

  return `
    <li class="order-card">
      <div class="order-meta">
        <div>
          <h3>Order ${orderId}</h3>
          <p><strong>Customer:</strong> ${customer}</p>
          <p><strong>Date:</strong> ${escapeHtml(created)}</p>
          <p><strong>Total:</strong> $${total}</p>
        </div>
        <span class="order-status">${status}</span>
      </div>
      ${itemsHtml}
      <button type="button" class="order-action-process">Mark reviewed</button>
    </li>
  `;
}

function bindOrderActions() {
  ordersList?.querySelectorAll(".order-action-process").forEach((button) => {
    button.addEventListener("click", () => {
      button.textContent = "Reviewed";
      button.disabled = true;
    });
  });
}

function renderOrders(orders) {
  if (!ordersList) {
    return;
  }

  if (!orders || orders.length === 0) {
    ordersList.innerHTML = `<li class="order-card"><p>No incoming orders available.</p></li>`;
    return;
  }

  ordersList.innerHTML = orders.map(renderOrder).join("");
  bindOrderActions();
}

async function init() {
  if (!getAuthToken()) {
    window.location.href = "/admin/login/index.html";
    return;
  }

  await LoadHeaderFooter();

  clearMessage();

  try {
    const token = getAuthToken();
    const response = await services.getOrders(token);
    const orders = response.Result || response.orders || response.data || response || [];
    renderOrders(orders);
  } catch (error) {
    clearAuthToken();
    showMessage("You must sign in again to view orders.");
    window.location.href = "/admin/login/index.html";
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    clearAuthToken();
    window.location.href = "/admin/login/index.html";
  });
}

init();
