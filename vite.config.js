import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        cart: resolve(__dirname, "src/cart/index.html"),
        checkout: resolve(__dirname, "src/checkout/index.html"),
        checkoutSuccess: resolve(__dirname, "src/checkout/success.html"),
        register: resolve(__dirname, "src/register/index.html"),
        signin: resolve(__dirname, "src/signin/index.html"),
        wishlist: resolve(__dirname, "src/wishlist/index.html"),
        "product-listing": resolve(
          __dirname,
          "src/product_listing/index.html",
        ),
        product: resolve(__dirname, "src/product_pages/index.html"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "main" || chunkInfo.name === "main2") {
            return "js/main.js";
          }

          return "js/[name].js";
        },
        chunkFileNames: "js/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "css/style.css";
          }

          return "assets/[name][extname]";
        },
      },
    },
  },
});
