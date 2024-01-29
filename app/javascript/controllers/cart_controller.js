import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="cart"
export default class extends Controller {
  initialize() {
    const cart = JSON.parse(localStorage.getItem("cart"));

    if (!cart) {
      return;
    }

    let total = 0;
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      total += item.price * item.quantity;
      const div = document.createElement("div");
      div.classList.add("mt-8");
      div.innerText = `Item: ${item.name}, Size: ${item.size} - Price:$${
        item.price / 100.0
      }, Qty:${item.quantity}`;
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Remove";
      deleteBtn.value = JSON.stringify({ id: item.id, size: item.size });
      deleteBtn.classList.add(
        "bg-red-500",
        "rounded",
        "text-white",
        "px-2",
        "py-1"
      );
      deleteBtn.addEventListener("click", this.removeFromCart);
      div.appendChild(deleteBtn);
      this.element.prepend(div);
    }
    const totalEl = document.createElement("div");
    totalEl.innerText = `Total: $${total / 100.0}`;
    let totalContainer = document.getElementById("total");
    totalContainer.appendChild(totalEl);
  }

  clear() {
    localStorage.removeItem("cart");
    window.location.reload();
  }

  removeFromCart(e) {
    const cart = JSON.parse(localStorage.getItem("cart"));
    const values = JSON.parse(e.target.value);
    const { id, size } = values;
    const index = cart.findIndex(
      (item) => item.id === id && item.size === size
    );
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.reload();
  }

  checkout() {
    const cart = JSON.parse(localStorage.getItem("cart"));
    const payload = {
      authenticity_token: "",
      cart: cart,
    };

    fetch("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (response.ok) {
        response.json().then((body) => {
          window.location.href = body.url;
        });
      } else {
        response.json().then((body) => {
          const errorEl = document.createElement("div");
          errorEl.innerText = `there was an error processing your order, ${body.error}`;
          let errorContainer = document.getElementById("error");
          errorContainer.appendChild(errorEl);
        });
      }
    });
  }
}
