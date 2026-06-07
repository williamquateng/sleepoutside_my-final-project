const baseURL = import.meta.env.VITE_SERVER_URL;

async function convertToJson(res) {
  const responseText = await res.text();
  let jsonResponse = {};
  try {
    jsonResponse = responseText ? JSON.parse(responseText) : {};
  } catch {
    jsonResponse = { message: responseText || res.statusText };
  }

  if (res.ok) {
    return jsonResponse;
  } else {
    throw { name: "servicesError", message: jsonResponse };
  }
}

export default class ExternalServices {
  async getData(category) {
    const response = await fetch(
      `${baseURL}products/search/${encodeURIComponent(category)}`,
    );
    const data = await convertToJson(response);
    return data.Result;
  }

  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async checkout(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
    const response = await fetch(`${baseURL}checkout`, options);
    return convertToJson(response);
  }

  async createUser(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
    const response = await fetch(`${baseURL}users`, options);
    return convertToJson(response);
  }

  async login(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
    const response = await fetch(`${baseURL}auth/login`, options);
    return convertToJson(response);
  }

  async getOrders(token) {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(`${baseURL}orders`, options);
    return convertToJson(response);
  }

  async subscribeNewsletter(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(`${baseURL}newsletter`, options);
    return convertToJson(response);
  }

  async getProductsByCount(count = 4) {
    const products = await this.getData("tents");
    const featuredIds = ["880RR", "985RF", "985PR", "344YJ"];
    return featuredIds
      .map((id) => products.find((item) => item.Id === id))
      .filter(Boolean)
      .slice(0, count);
  }
}
