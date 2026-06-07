import Alert from "./Alert.js";
import { LoadHeaderFooter, showRegisterBanner } from "./utils.mjs";

const isHomePage = Boolean(document.querySelector(".hero"));

if (isHomePage) {
  const alerts = new Alert();
  alerts.init();
  showRegisterBanner();
}

LoadHeaderFooter();