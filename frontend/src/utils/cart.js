export function readCartItems() {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem("cart");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCartItems(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("cart", JSON.stringify(items));
}

function buildCartItem(product, quantity = 1) {
  return {
    product: {
      _id: product?._id || product?.id,
      id: product?.id,
      name: product?.name,
      price: product?.price,
      image: product?.image,
      category: product?.category
    },
    quantity: quantity || 1
  };
}

function getProductId(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || item.productId || item.name || "";
}

export function addProductToCart(product, quantity = 1) {
  if (!product) return readCartItems();

  const cartItems = readCartItems();
  const productId = getProductId(product);

  const existingIndex = cartItems.findIndex(
    entry => getProductId(entry.product || entry) === productId
  );

  if (existingIndex >= 0) {
    const entry = cartItems[existingIndex];
    cartItems[existingIndex] = {
      ...entry,
      quantity: (entry.quantity || 1) + quantity
    };
  } else {
    cartItems.push(buildCartItem(product, quantity));
  }

  writeCartItems(cartItems);
  return cartItems;
}
