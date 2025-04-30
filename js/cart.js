document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartTotalEl = document.getElementById("cart-total");

  // Function to render cart items from localStorage
  function renderCart() {
    if (!cartItemsContainer) return; // Should always exist on cart page, but good check

    let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    cartItemsContainer.innerHTML = ""; // Clear existing items

    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<div class="border-b pb-4 mb-4"><p class="text-gray-600">Your cart is currently empty.</p></div>';
      updateCartSummary(0); // Update summary to zero
      if (typeof updateCartCount === "function") {
        updateCartCount(); // Update header count
      }
      return;
    }

    let subtotal = 0;
    cart.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "cart-item flex items-center border-b py-4";
      itemElement.dataset.unitPrice = item.price;
      itemElement.dataset.productId = item.id;

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      itemElement.innerHTML = `
                <img src="${item.image}" alt="${
        item.name
      }" class="h-16 w-16 object-contain mr-4 rounded" />
                <div class="flex-grow">
                    <h3 class="font-semibold">${item.name}</h3>
                    <p class="item-unit-price text-sm text-gray-500">$${item.price.toFixed(
                      2
                    )}</p>
                </div>
                <div class="flex items-center mx-4">
                    <button class="quantity-decrease px-2 py-1 border rounded-l">-</button>
                    <span class="item-quantity px-4 py-1 border-t border-b">${
                      item.quantity
                    }</span>
                    <button class="quantity-increase px-2 py-1 border rounded-r">+</button>
                </div>
                <p class="item-total font-semibold w-20 text-right">$${itemTotal.toFixed(
                  2
                )}</p>
                <button class="remove-item-btn ml-4 text-red-500 hover:text-red-700" aria-label="Remove item">
                    <i class="bi bi-trash"></i>
                </button>
            `;
      cartItemsContainer.appendChild(itemElement);
    });

    updateCartSummary(subtotal);
    if (typeof updateCartCount === "function") {
      updateCartCount(); // Update header count
    }
  }

  // Function to update the order summary section
  function updateCartSummary(subtotal) {
    if (cartSubtotalEl && cartTotalEl) {
      cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      cartTotalEl.textContent = `$${subtotal.toFixed(2)}`; // Assuming total = subtotal for now
    }
  }

  // Add event listeners for cart interactions
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (event) => {
      const target = event.target;
      const cartItem = target.closest(".cart-item");
      if (!cartItem) return;

      const productId = cartItem.dataset.productId;
      let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
      const itemIndex = cart.findIndex((item) => item.id === productId);
      if (itemIndex === -1) return;

      let quantity = cart[itemIndex].quantity;

      if (target.closest(".quantity-increase")) {
        quantity++;
        cart[itemIndex].quantity = quantity;
      } else if (target.closest(".quantity-decrease")) {
        quantity = Math.max(1, quantity - 1);
        cart[itemIndex].quantity = quantity;
      } else if (target.closest(".remove-item-btn")) {
        cart.splice(itemIndex, 1);
      }

      localStorage.setItem("shoppingCart", JSON.stringify(cart));
      renderCart(); // Re-render the cart display
      // updateCartCount is called within renderCart
    });

    // Initial render of the cart when the page loads
    renderCart();
  }

  // Checkout Button Logic
  const checkoutButton = document.querySelector(".checkout-btn");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      localStorage.removeItem("shoppingCart");
      renderCart(); // Re-render the cart (will show empty message)
      // updateCartCount is called within renderCart
      console.log("Checkout initiated, cart cleared.");
    });
  }

  // Add event listener for the new Clear Cart button
  const clearCartButton = document.getElementById("clear-cart-btn");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      // Use SweetAlert2 for confirmation
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33", // Standard red for destructive action
        cancelButtonColor: "#a99cbf", 
        confirmButtonText: "Yes, clear it!",
        background: "#f5f0e1", 
        color: "#222530", 
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("shoppingCart"); // Clear the cart data
          renderCart(); // Re-render the cart (will show empty)
          // Show success message
          Swal.fire({
            title: "Cleared!",
            text: "Your cart has been cleared.",
            icon: "success",
            confirmButtonColor: "#a99cbf",
            background: "#f5f0e1",
            color: "#222530",
          });
          console.log("Cart cleared by user.");
        }
      });
    });
  }
});
