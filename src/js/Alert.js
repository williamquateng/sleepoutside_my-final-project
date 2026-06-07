export default class Alert {
  constructor(path = "/json/alerts.json") {
    this.path = path;
  }

  async init() {
    const alerts = await this.loadAlerts();
    if (!alerts.length) {
      return;
    }

    const section = document.createElement("section");
    section.classList.add("alert-list");

    alerts.forEach((alert) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = alert.message || "";
      paragraph.style.backgroundColor = alert.background || "#f5f5f5";
      paragraph.style.color = alert.color || "#111";
      section.appendChild(paragraph);
    });

    const main = document.querySelector("main");
    if (main) {
      main.prepend(section);
    }
  }

  async loadAlerts() {
    try {
      const response = await fetch(this.path);
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
}
