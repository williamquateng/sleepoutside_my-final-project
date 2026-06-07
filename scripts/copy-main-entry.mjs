import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const jsDir = join(process.cwd(), "dist", "js");
const files = await readdir(jsDir);
const homeEntry = files.find((file) => /^main\d*\.js$/.test(file));

if (homeEntry && homeEntry !== "main.js") {
  await copyFile(join(jsDir, homeEntry), join(jsDir, "main.js"));
}

async function copyIfExists(from, to) {
  try {
    await copyFile(join(process.cwd(), from), join(process.cwd(), to));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

const assetsDir = join(process.cwd(), "dist", "assets");
await mkdir(assetsDir, { recursive: true });

const compatibilityAssets = [
  ["dist/css/style.css", "dist/assets/utils-CauCxvKc.css"],
  ["dist/css/style.css", "dist/assets/utils-Bmkw5Q76.css"],
  ["dist/css/style.css", "dist/assets/utils-DKq3Bsbm.css"],
  ["dist/js/utils.js", "dist/assets/utils-CGGOHlq-.js"],
  ["dist/js/utils.js", "dist/assets/utils-9vrMJyM5.js"],
  ["dist/js/utils.js", "dist/assets/utils-DnA3psMX.js"],
  ["dist/js/main2.js", "dist/assets/main--EOQpHS9.js"],
  ["dist/js/main2.js", "dist/assets/main-4iW2Os6y.js"],
  ["dist/js/main2.js", "dist/assets/main-BavQrC0a.js"],
  ["dist/js/product-listing.js", "dist/assets/productListing-VkPN6sO3.js"],
  ["dist/js/product-listing.js", "dist/assets/productListing-CB4deUsJ.js"],
  ["dist/js/product-listing.js", "dist/assets/productListing-DT9occWR.js"],
  ["dist/js/product.js", "dist/assets/product-DDhEML1E.js"],
  ["dist/js/product.js", "dist/assets/product-uMpZ8vMB.js"],
  ["dist/js/product.js", "dist/assets/product-jvd-MuqI.js"],
  ["dist/js/cart.js", "dist/assets/cart-c0vQ6zrP.js"],
  ["dist/js/cart.js", "dist/assets/cart-zqm1BApn.js"],
  ["dist/js/cart.js", "dist/assets/cart-Clel23dG.js"],
];

await Promise.all(
  compatibilityAssets.map(([from, to]) => copyIfExists(from, to)),
);

await writeFile(
  join(process.cwd(), "dist", "js", "ProductData.js"),
  'export { E as P } from "./ExternalServices.js";\n',
);

await writeFile(
  join(process.cwd(), "dist", "assets", "ProductData-BzbZu8QD.js"),
  'export { E as P } from "../js/ExternalServices.js";\n',
);
