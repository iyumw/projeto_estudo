document.addEventListener("DOMContentLoaded", () => {
  // Get product ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const productIdWithExt = urlParams.get("product"); // e.g., "02.png"

  if (!productIdWithExt) {
    displayProductNotFound();
    return;
  }

  // Extract the ID part (e.g., "02" from "02.png")
  const productId = productIdWithExt.split(".")[0];

  // Find the product in the global products array (from js/products.js)
  const product =
    typeof products !== "undefined"
      ? products.find((p) => p.id === productId)
      : null;

  if (!product) {
    displayProductNotFound();
    return;
  }

  // Populate the page with product details
  populateProductDetails(product);

  // Setup quantity controls and add to cart button
  setupInteractions(product);
});

function displayProductNotFound() {
  const mainContainer = document.querySelector("main.container");
  if (mainContainer) {
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

function populateProductDetails(product) {
  // Update image
  const imgElement = document.querySelector(".product-image-container img");
  if (imgElement) {
    imgElement.src = product.image;
    imgElement.alt = product.name;
  }

  // Update details
  const detailsContainer = document.querySelector(".product-details");
  if (detailsContainer) {
    detailsContainer.querySelector("h2").textContent = product.name;
    detailsContainer.querySelector("p.text-lg").textContent =
      product.description;
    detailsContainer.querySelector(
      "p.text-2xl"
    ).textContent = `$${product.price.toFixed(2)}`;

    // Update wishlist button dataset for consistency with event delegation
    const wishlistBtn = detailsContainer.querySelector(".add-to-wishlist-btn");
    if (wishlistBtn) {
      wishlistBtn.dataset.productId = product.id;
    }
  }
}

function setupInteractions(product) {
  const quantityInput = document.getElementById("quantity");
  const decreaseBtn = document.querySelector(".quantity-decrease");
  const increaseBtn = document.querySelector(".quantity-increase");
  const addToCartBtn = document.querySelector(
    ".product-details .add-to-cart-btn"
  ); // More specific selector

  if (!quantityInput || !decreaseBtn || !increaseBtn || !addToCartBtn) {
    console.error("Could not find all interaction elements on the page.");
    return;
  }

  // Quantity Decrease
  decreaseBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  });

  // Quantity Increase
  increaseBtn.addEventListener("click", () => {
    let currentValue = parseInt(quantityInput.value);
    quantityInput.value = currentValue + 1; // No upper limit for now
  });

  // Add to Cart Button
  addToCartBtn.addEventListener("click", () => {
    const quantity = parseInt(quantityInput.value);
    if (quantity > 0 && typeof window.addToCart === "function") {
      window.addToCart(product, quantity);

      // Provide visual feedback
      const originalText = addToCartBtn.querySelector("span").textContent;
      const icon = addToCartBtn.querySelector("i");
      const originalIconClass = icon.className;

      addToCartBtn.querySelector("span").textContent = "Added!";
      icon.className = "bi bi-cart-check-fill";
      addToCartBtn.disabled = true; // Prevent multiple rapid clicks

      setTimeout(() => {
        addToCartBtn.querySelector("span").textContent = originalText;
        icon.className = originalIconClass;
        addToCartBtn.disabled = false;
      }, 1500); // Revert after 1.5 seconds
    } else {
      console.error("Invalid quantity or addToCart function not found.");
    }
  });
}
