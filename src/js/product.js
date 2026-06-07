import { getParam } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

const productId = getParam("product");
const category = getParam("category");
const dataSource = new ExternalServices();

const product = new ProductDetails(productId, dataSource, category);
product.init();
