// Ensures the script runs only after the entire HTML document has been loaded and parsed.
document.addEventListener("DOMContentLoaded", () => {
  // Get product ID from URL query parameter (e.g., ?product=02.png)
  const urlParams = new URLSearchParams(window.location.search);
  const productIdFromUrl = urlParams.get("id"); // e.g., "02.png"
  console.log("Raw Product ID from URL:", productIdFromUrl);

  // If no product ID is found in the URL, display a not found message and stop.
  if (!productIdFromUrl) {
    console.log("No product ID in URL.");
    displayProductNotFound();
    return;
  }

  // Extract the ID part (e.g., "02" from "02.png") assuming format ID.extension
  const productId = productIdFromUrl;
  console.log("Extracted Product ID:", productId); // LOG 3

  // Find the product in the global products array (expected to be defined in js/products.js)
  // Check if the 'products' array exists before trying to find the product.
  const product =
    typeof products !== "undefined"
      ? products.find((p) => p.id === productId)
      : null;

  // If the product with the extracted ID is not found in the array, display not found message.
  if (!product) {
    console.log("Product not found in array or array was undefined."); // LOG 6
    displayProductNotFound();
    return;
  }

  // If the product is found, populate the page elements with its details.
  populateProductDetails(product);

  // Setup event listeners for quantity controls and the add to cart button.
  setupInteractions(product);
});

// Function to display a 'Product Not Found' message in the main content area.
function displayProductNotFound() {
  const mainContainer = document.querySelector("main.container");
  if (mainContainer) {
    // Replace the main container's content with the not found message and a link back.
    mainContainer.innerHTML = `
      <div class="text-center py-10">
        <h2 class="text-2xl font-semibold mb-4">Product Not Found</h2>
        <p class="text-gray-600 mb-6">Sorry, we couldn't find the product you were looking for.</p>
        <a href="products.html" class="inline-block bg-primary text-background py-2 px-5 rounded hover:bg-opacity-90 transition-opacity">
          Back to Products
        </a>
      </div>
    `;
  }
}

// Function to populate the product detail elements on the page with data from the product object.
function populateProductDetails(product) {
  // Update the main product image source and alt text.
  const imgElement = document.querySelector(".product-image-container img");
  if (imgElement) {
    imgElement.src = product.image;
    imgElement.alt = product.name;
  }

  // Update the text content of the product details section.
  const detailsContainer = document.querySelector(".product-details");
  if (detailsContainer) {
    detailsContainer.querySelector("h2").textContent = product.name;
    detailsContainer.querySelector("p.text-lg").textContent =
      product.description;
    detailsContainer.querySelector(
      "p.text-2xl"
    ).textContent = `$${product.price.toFixed(2)}`; // Format price to 2 decimal places.

    // Update the wishlist button's data attribute with the product ID.
    // This helps identify the product when the button is clicked, especially if using event delegation elsewhere.
    const wishlistBtn = detailsContainer.querySelector(".add-to-wishlist-btn");
    if (wishlistBtn) {
      wishlistBtn.dataset.productId = product.id;
    }
  }
}

// Function to set up event listeners for user interactions (quantity adjustment, add to cart).
function setupInteractions(product) {
  // Get references to the interactive elements.
  const quantityInput = document.getElementById("quantity");
  const decreaseBtn = document.querySelector(".quantity-decrease");
  const increaseBtn = document.querySelector(".quantity-increase");
  // Use a more specific selector to ensure we get the button within the product details section.
  const addToCartBtn = document.querySelector(
    ".product-details .add-to-cart-btn"
  );

  // Check if all required elements were found.
  if (!quantityInput || !decreaseBtn || !increaseBtn || !addToCartBtn) {
    console.error("Could not find all interaction elements on the page.");
    return; // Stop if any element is missing.
  }

  // Event listener for the quantity decrease button.
  decreaseBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    // Prevent quantity from going below 1.
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });

  // Event listener for the quantity increase button.
  increaseBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    quantityInput.value = currentValue + 1; // No upper limit defined here.
  });

  // Event listener for the 'Add to Cart' button.
  addToCartBtn.addEventListener("click", () => {
    const quantity = parseInt(quantityInput.value);
    // Check if quantity is valid and the global addToCart function
    if (quantity > 0 && typeof window.addToCart === "function") {
      // Call the global function to add the product to the cart.
      window.addToCart(product, quantity);

      // Provide visual feedback to the user that the item was added.
      const buttonTextSpan = addToCartBtn.querySelector("span");
      const originalText = buttonTextSpan.textContent;
      const icon = addToCartBtn.querySelector("i");
      const originalIconClass = icon.className;

      // Change button text and icon, and disable it temporarily.
      buttonTextSpan.textContent = "Added!";
      icon.className = "bi bi-cart-check-fill"; // Change icon to a checkmark.
      addToCartBtn.disabled = true; // Prevent multiple rapid clicks.

      // Set a timeout to revert the button back to its original state.
      setTimeout(() => {
        buttonTextSpan.textContent = originalText;
        icon.className = originalIconClass;
        addToCartBtn.disabled = false;
      }, 1500); // Revert after 1.5 seconds.
    } else {
      // Log an error if the quantity is invalid or the addToCart function is missing.
      console.error("Invalid quantity or addToCart function not found.");
    }
  });
}
