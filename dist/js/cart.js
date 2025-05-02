// Ensures the script runs only after the entire HTML document has been loaded and parsed.
document.addEventListener("DOMContentLoaded", () => {
  // Get references to the HTML elements where cart items and totals will be displayed.
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartTotalEl = document.getElementById("cart-total");

  // Function to render cart items dynamically from localStorage
  function renderCart() {
    // Check if the cart items container exists before proceeding.
    if (!cartItemsContainer) return; // Should always exist on cart page, but good check

    // Retrieve the cart data from localStorage, or initialize an empty array if none exists.
    let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    cartItemsContainer.innerHTML = ""; // Clear existing items before rendering new ones.

    // Handle the case where the cart is empty.
    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<div class="border-b pb-4 mb-4"><p class="text-gray-600">Your cart is currently empty.</p></div>';
      updateCartSummary(0); // Update summary to show zero totals.
      // If the updateCartCount function exists (likely in a global scope or another script), call it.
      if (typeof updateCartCount === "function") {
        updateCartCount(); // Update header cart item count.
      }
      return; // Exit the function as there are no items to render.
    }

    let subtotal = 0; // Initialize subtotal for the cart.
    // Iterate over each item in the cart array.
    cart.forEach((item) => {
      // Create a new div element for each cart item.
      const itemElement = document.createElement("div");
      itemElement.className = "cart-item flex items-center border-b py-4";
      // Store unit price and product ID in data attributes for later access.
      itemElement.dataset.unitPrice = item.price;
      itemElement.dataset.productId = item.id;

      // Calculate the total price for the current item (price * quantity).
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal; // Add the item total to the cart subtotal.

      // Set the inner HTML of the item element with product details and controls.
      itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="h-16 w-16 object-contain mr-4 rounded" />
                <div class="flex-grow">
                    <h3 class="font-semibold">${item.name}</h3>
                    <p class="item-unit-price text-sm text-gray-500">$${item.price.toFixed(2)}</p>
                </div>
                <div class="flex items-center mx-4">
                    <button class="quantity-decrease px-2 py-1 border rounded-l">-</button>
                    <span class="item-quantity px-4 py-1 border-t border-b">${item.quantity}</span>
                    <button class="quantity-increase px-2 py-1 border rounded-r">+</button>
                </div>
                <p class="item-total font-semibold w-20 text-right">$${itemTotal.toFixed(2)}</p>
                <button class="remove-item-btn ml-4 text-red-500 hover:text-red-700" aria-label="Remove item">
                    <i class="bi bi-trash"></i>
                </button>
            `;
      // Append the newly created item element to the cart items container.
      cartItemsContainer.appendChild(itemElement);
    });

    // Update the cart summary (subtotal and total) displayed on the page.
    updateCartSummary(subtotal);
    // If the updateCartCount function exists, call it to update the header count.
    if (typeof updateCartCount === "function") {
      updateCartCount(); // Update header cart item count.
    }
  }

  // Function to update the order summary section (subtotal and total).
  function updateCartSummary(subtotal) {
    // Check if the summary elements exist before updating.
    if (cartSubtotalEl && cartTotalEl) {
      cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      cartTotalEl.textContent = `$${subtotal.toFixed(2)}`; // Assuming total = subtotal for simplicity.
    }
  }

  // Add event listeners for cart interactions (increase/decrease quantity, remove item).
  // Uses event delegation by attaching the listener to the container.
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (event) => {
      const target = event.target; // The element that was actually clicked.
      // Find the closest ancestor element with the class 'cart-item'.
      const cartItem = target.closest(".cart-item");
      if (!cartItem) return; // Exit if the click was not inside a cart item.

      // Get the product ID from the cart item's data attribute.
      const productId = cartItem.dataset.productId;
      // Retrieve the current cart from localStorage.
      let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
      // Find the index of the item in the cart array.
      const itemIndex = cart.findIndex((item) => item.id === productId);
      if (itemIndex === -1) return; // Exit if the item is not found (shouldn't happen normally).

      let quantity = cart[itemIndex].quantity; // Get the current quantity.

      // Check which button was clicked using closest() to handle clicks on icons inside buttons.
      if (target.closest(".quantity-increase")) {
        quantity++; // Increase quantity.
        cart[itemIndex].quantity = quantity;
      } else if (target.closest(".quantity-decrease")) {
        quantity = Math.max(1, quantity - 1); // Decrease quantity, minimum 1.
        cart[itemIndex].quantity = quantity;
      } else if (target.closest(".remove-item-btn")) {
        cart.splice(itemIndex, 1); // Remove the item from the cart array.
      }

      // Save the updated cart back to localStorage.
      localStorage.setItem("shoppingCart", JSON.stringify(cart));
      // Re-render the cart display to reflect the changes.
      renderCart();
      // updateCartCount is called within renderCart, so no need to call it separately here.
    });

    // Initial render of the cart when the page loads.
    renderCart();
  }

  // Checkout Button Logic - Simulates checkout by clearing the cart.
  const checkoutButton = document.querySelector(".checkout-btn");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      // Clear the cart data from localStorage.
      localStorage.removeItem("shoppingCart");
      // Re-render the cart, which will now show the empty message.
      renderCart();
      // updateCartCount is called within renderCart.
      console.log("Checkout initiated, cart cleared."); // Log action to console.
    });
  }

  // Add event listener for the 'Clear Cart' button.
  const clearCartButton = document.getElementById("clear-cart-btn");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      // Use SweetAlert2 library for a confirmation dialog before clearing.
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33", // Red color for the confirm button (destructive action).
        cancelButtonColor: "#a99cbf", // Custom color for the cancel button.
        confirmButtonText: "Yes, clear it!",
        background: "#f5f0e1", // Custom background color for the dialog.
        color: "#222530", // Custom text color.
      }).then((result) => {
        // Proceed only if the user confirms the action.
        if (result.isConfirmed) {
          localStorage.removeItem("shoppingCart"); // Clear the cart data.
          renderCart(); // Re-render the cart (will show empty message).
          // Show a success message using SweetAlert2.
          Swal.fire({
            title: "Cleared!",
            text: "Your cart has been cleared.",
            icon: "success",
            confirmButtonColor: "#a99cbf", // Custom color for the confirm button.
            background: "#f5f0e1",
            color: "#222530",
          });
          console.log("Cart cleared by user."); // Log action to console.
        }
      });
    });
  }
});
