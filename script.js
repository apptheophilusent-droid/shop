// PRODUCTS DATA
const products = [
  {
    id: 1,
    name: "Elegant Floral Dress",
    price: 45.0,
    image:
      "https://images.unsplash.com/photo-1495121605193-b116b5b09c08?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Chic Casual Jumpsuit",
    price: 60.0,
    image:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Bohemian Maxi Skirt",
    price: 38.0,
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c08?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Classic White Blouse",
    price: 25.0,
    image:
      "https://images.unsplash.com/photo-1520975923512-99f7aef55c5d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Modern Wrap Dress",
    price: 55.0,
    image:
      "https://images.unsplash.com/photo-1520976045105-3b09de4c4681?auto=format&fit=crop&w=600&q=80",
  },
];

// CART DATA
let cart = [];

// DOM ELEMENTS
const productsContainer = document.getElementById("products");
const cartSection = document.getElementById("cart-section");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const btnCheckout = document.getElementById("btn-checkout");
const orderSection = document.getElementById("order-section");
const orderForm = document.getElementById("order-form");

// Render Products
function renderProducts() {
  productsContainer.innerHTML = "";
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <div>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">$${product.price.toFixed(2)}</p>
        </div>
        <button class="btn-add" data-id="${product.id}">Add to Cart</button>
      </div>
    `;

    productsContainer.appendChild(productCard);
  });
}

// Render Cart
function renderCart() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartTotalEl.textContent = "0.00";
    btnCheckout.disabled = true;
    return;
  }

  btnCheckout.disabled = false;

  cartItemsContainer.innerHTML = "";
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id);
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <div class="cart-item-name">${product.name}</div>
      <div class="cart-item-qty">
        <button class="btn-decrease" data-id="${item.id}">−</button>
        <span>${item.qty}</span>
        <button class="btn-increase" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item-price">$${(product.price * item.qty).toFixed(2)}</div>
    `;

    cartItemsContainer.appendChild(cartItem);
  });

  const total = cart.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.id);
    return acc + product.price * item.qty;
  }, 0);

  cartTotalEl.textContent = total.toFixed(2);
}

// Add to Cart
productsContainer.addEventListener("click", (e) => {
  if (!e.target.classList.contains("btn-add")) return;
  const id = Number(e.target.dataset.id);
  const item = cart.find((i) => i.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }

  cartSection.style.display = "block";
  renderCart();
});

// Cart quantity buttons
cartItemsContainer.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  if (e.target.classList.contains("btn-increase")) {
    const item = cart.find((i) => i.id === id);
    item.qty++;
    renderCart();
  }
  if (e.target.classList.contains("btn-decrease")) {
    const itemIndex = cart.findIndex((i) => i.id === id);
    if (cart[itemIndex].qty > 1) {
      cart[itemIndex].qty--;
    } else {
      cart.splice(itemIndex, 1);
    }
    if (cart.length === 0) {
      cartSection.style.display = "none";
      orderSection.style.display = "none";
    }
    renderCart();
  }
});

// Proceed to Checkout button
btnCheckout.addEventListener("click", () => {
  if (cart.length === 0) return;
  orderSection.style.display = "block";
  window.scrollTo({ top: orderSection.offsetTop, behavior: "smooth" });
});

// Flutterwave Payment & WhatsApp Order

orderForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !address) {
    alert("Please fill all required fields.");
    return;
  }

  const amount = cart.reduce((acc, item) => {
    const product = products.find((p) => p.id === item.id);
    return acc + product.price * item.qty;
  }, 0);

  // Flutterwave payment
  FlutterwaveCheckout({
    public_key: "FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx-X", // Replace with your Flutterwave public key
    tx_ref: "MYBRAND_" + Date.now(),
    amount: amount,
    currency: "USD",
    payment_options: "card,ussd,banktransfer",
    customer: {
      name: name,
      phone_number: phone,
      email: "customer@example.com",
    },
    customizations: {
      title: "MyBrand Ladies Clothes",
      description: "Purchase from MyBrand Ladies Clothes",
      logo: "https://via.placeholder.com/120x60?text=MyBrand+Logo",
    },
    callback: function (data) {
      if (data.status === "successful") {
        sendWhatsAppOrder(name, phone, address);
        alert("Payment successful! Thank you for your purchase.");
        resetCartAndForm();
      } else {
        alert("Payment failed or cancelled.");
      }
    },
    onclose: function () {
      // Payment modal closed without completing payment
    },
  });
});

// Send order details to WhatsApp
function sendWhatsAppOrder(name, phone, address) {
  const message = encodeURIComponent(
    `New Order from ${name}%0APhone: ${phone}%0AAddress: ${address}%0AOrder Details:%0A` +
      cart
        .map((item) => {
          const product = products.find((p) => p.id === item.id);
          return `${product.name} x${item.qty} - $${(product.price * item.qty).toFixed(2)}`;
        })
        .join("%0A") +
      `%0ATotal: $${cart.reduce(
        (acc, item) => acc + products.find((p) => p.id === item.id).price * item.qty,
        0
      ).toFixed(2)}`
  );

  // Replace YOUR_WHATSAPP_NUMBER with your number in international format without + sign
  const whatsappURL = `https://wa.me/YOUR_WHATSAPP_NUMBER?text=${message}`;
  window.open(whatsappURL, "_blank");
}

// Reset cart and form after successful order
function resetCartAndForm() {
  cart = [];
  renderCart();
  orderSection.style.display = "none";
  cartSection.style.display = "none";
  orderForm.reset();
}

// Initialize
renderProducts();
