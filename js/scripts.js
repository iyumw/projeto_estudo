document.addEventListener("DOMContentLoaded", () => {
  // Ensures the script runs only after the full HTML document has been loaded and parsed.

  // --- Scroll Reveal ---
  // Configuration for the Intersection Observer API to detect when elements become visible.
  const observerOptions = {
    root: null, // Use the viewport as the root.
    rootMargin: "0px", // No margin around the root.
    threshold: 0.1, // Trigger when 10% of the element is visible.
  };

  // Callback function executed when an observed element intersects the viewport.
  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      // Check if the element is intersecting (visible).
      if (entry.isIntersecting) {
        // Add the 'is-visible' class to trigger the fade-in animation.
        entry.target.classList.add("is-visible");
        // Stop observing the element once it has become visible to prevent re-triggering.
        observer.unobserve(entry.target);
      }
    });
  };

  // Create a new Intersection Observer instance.
  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Select all elements that should have the fade-in effect.
  const elementsToFade = document.querySelectorAll(".fade-in-element");
  // Start observing each selected element.
  elementsToFade.forEach((el) => observer.observe(el));

  // --- Button Click Feedback ---
  // Provides visual feedback when certain buttons are clicked.
  const buttons = document.querySelectorAll(
    ".add-to-cart-btn, .add-to-wishlist-btn" // Select all relevant buttons.
  );

  buttons.forEach((button) => {
    // Add 'button-clicked' class on mouse down for visual effect.
    button.addEventListener("mousedown", () => {
      button.classList.add("button-clicked");
    });
    // Remove the class on mouse up.
    button.addEventListener("mouseup", () => {
      button.classList.remove("button-clicked");
    });
    // Remove the class if the mouse leaves the button while pressed down.
    button.addEventListener("mouseleave", () => {
      button.classList.remove("button-clicked");
    });
    // Remove the class when the button loses focus (e.g., tabbing away).
    button.addEventListener("focusout", () => {
      button.classList.remove("button-clicked");
    });
  });

  // --- Load Products into Grid (for index.html, products.html, etc.) ---
  // Dynamically populates the product grid if it exists on the page and product data is available.
  const productGrid = document.getElementById("product-grid");
  // Check if the grid element exists and the 'products' array (from products.js) is defined.
  if (productGrid && typeof products !== "undefined") {
    // Clear any existing content in the grid (e.g., placeholders).
    productGrid.innerHTML = "";
    // Define the delay between animating each product card for a staggered effect.
    const staggerDelayMs = 150;

    // Iterate over the products array (defined in js/products.js).
    products.forEach((product, index) => {
      // Create the main link element for the product card.
      const cardLink = document.createElement("a");
      cardLink.href = `product-detail.html?product=${product.id}.png`; // Link to product detail page.
      cardLink.className = "product-card-link block group"; // Tailwind classes for styling.

      // Create the container div for the card content.
      const cardDiv = document.createElement("div");
      cardDiv.className =
        "product-card fade-in-element rounded-lg overflow-hidden shadow-sm p-3 flex flex-col h-full group-hover:shadow-lg transition-shadow duration-200"; // Styling and fade-in class.

      // Create a container for the image and wishlist button.
      const imageContainer = document.createElement("div");
      imageContainer.className = "relative"; // For positioning the absolute wishlist button.

      // Create the product image element.
      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.name;
      img.className = "w-full h-40 object-contain mb-3"; // Styling for the image.

      // Create the Wishlist Button dynamically for each card.
      const wishlistButton = document.createElement("button");
      // Classes for styling and importantly, for the global event listener to identify it.
      wishlistButton.className =
        "card-wishlist-btn add-to-wishlist-btn icon-button absolute top-2 right-2 z-10";
      wishlistButton.setAttribute("aria-label", "Add to Wishlist"); // Accessibility label.
      wishlistButton.dataset.productId = product.id; // Store product ID for the event listener.
      wishlistButton.innerHTML = '<i class="bi bi-heart text-xl"></i>'; // Initial heart icon.

      // Add the image and wishlist button to their container.
      imageContainer.appendChild(img);
      imageContainer.appendChild(wishlistButton);

      // Create the product title element.
      const title = document.createElement("h3");
      title.className = "text-lg font-semibold mb-1";
      title.textContent = product.name;

      // Create the product description element.
      const description = document.createElement("p");
      description.className = "text-sm text-gray-600 mb-2 flex-grow"; // flex-grow makes it take available space.
      description.textContent = product.description;

      // Create a footer div to hold price and buttons.
      const footerDiv = document.createElement("div");
      footerDiv.className = "flex justify-between items-center mt-auto pt-2"; // mt-auto pushes it to the bottom.

      // Create the price element.
      const price = document.createElement("p");
      price.className = "text-md font-bold";
      price.textContent = `$${product.price.toFixed(2)}`; // Format price to 2 decimal places.

      // Create a container for the action buttons (currently just Add to Cart).
      const buttonsDiv = document.createElement("div");
      buttonsDiv.className = "flex justify-start items-center gap-x-2";

      // Create the Add to Cart Button dynamically.
      const cartButton = document.createElement("button");
      cartButton.className =
        "add-to-cart-btn icon-button py-1 px-3 rounded z-10 relative"; // Styling classes.
      cartButton.setAttribute("aria-label", "Add to Cart"); // Accessibility label.
      cartButton.dataset.productId = product.id; // Store product ID for the click handler.
      // Define the inline click handler for the Add to Cart button.
      cartButton.onclick = (event) => {
        event.preventDefault(); // Prevent the parent link from navigating immediately.
        // Find the product details using the ID stored in the button's dataset.
        const clickedProductId = event.currentTarget.dataset.productId;
        const productToAdd = products.find((p) => p.id === clickedProductId);
        if (productToAdd) {
          // Call the global addToCart function (defined below).
          addToCart(productToAdd);
          // Optional: Provide feedback to the user.
          console.log(`Added ${productToAdd.name} to cart.`);
          // Change button icon briefly to show success.
          event.currentTarget.innerHTML =
            '<i class="bi bi-cart-check-fill text-xl"></i>';
          // Revert icon after a delay.
          setTimeout(() => {
            event.currentTarget.innerHTML =
              '<i class="bi bi-cart-plus text-xl"></i>';
          }, 1500);
        }
      };
      cartButton.innerHTML = '<i class="bi bi-cart-plus text-xl"></i>'; // Set initial cart icon.

      // Add the cart button to its container.
      buttonsDiv.appendChild(cartButton);

      // Add price and button container to the footer.
      footerDiv.appendChild(price);
      footerDiv.appendChild(buttonsDiv);

      // Assemble the card: image container, title, description, footer.
      cardDiv.appendChild(imageContainer);
      cardDiv.appendChild(title);
      cardDiv.appendChild(description);
      cardDiv.appendChild(footerDiv);

      // Add the complete card div to the link element.
      cardLink.appendChild(cardDiv);
      // Add the link element (containing the card) to the product grid.
      productGrid.appendChild(cardLink);

      // Trigger the fade-in animation with a staggered delay based on the product index.
      setTimeout(() => {
        cardDiv.classList.add("is-visible");
      }, index * staggerDelayMs);
    });

    // Re-initialize button click feedback for the newly added dynamic buttons.
    // Select buttons *within* the product grid that were just created.
    const newButtons = productGrid.querySelectorAll(
      ".add-to-cart-btn, .card-wishlist-btn"
    );
    newButtons.forEach((button) => {
      // Add the same mousedown/mouseup/mouseleave/focusout listeners as above.
      button.addEventListener("mousedown", () => {
        button.classList.add("button-clicked");
      });
      button.addEventListener("mouseup", () => {
        button.classList.remove("button-clicked");
      });
      button.addEventListener("mouseleave", () => {
        button.classList.remove("button-clicked");
      });
      button.addEventListener("focusout", () => {
        button.classList.remove("button-clicked");
      });
    });
  }

  // --- Global Cart Functions ---

  // Make addToCart function globally accessible (e.g., from product detail page).
  // Adds a product to the shopping cart stored in localStorage.
  window.addToCart = function (product, quantity = 1) {
    // Allow specifying quantity, default to 1.
    // Retrieve the current cart from localStorage, or initialize an empty array if none exists.
    let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    // Check if the product (by ID) is already in the cart.
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      // If the item exists, increment its quantity.
      cart[existingItemIndex].quantity += quantity;
    } else {
      // If the item is new, add it to the cart array with the specified quantity.
      // Use spread syntax (...) to copy product properties and add the quantity.
      cart.push({ ...product, quantity: quantity });
    }

    // Save the updated cart array back to localStorage, converting it to a JSON string.
    localStorage.setItem("shoppingCart", JSON.stringify(cart));

    // Update the cart item count displayed in the navigation header.
    updateCartCount(); // Call the global update function (defined below).
  };

  // Make updateCartCount function globally accessible.
  // Updates the cart item count badge in the navigation bar.
  window.updateCartCount = function () {
    // Retrieve the current cart from localStorage.
    let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    // Calculate the total number of items by summing the quantities of all items in the cart.
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Find the navigation link element for the cart page.
    const cartCountElement = document.querySelector('nav a[href="cart.html"]');
    if (cartCountElement) {
      // Check if the badge span already exists.
      let countSpan = cartCountElement.querySelector(".cart-count-badge");
      if (!countSpan) {
        // If the badge doesn't exist, create it.
        countSpan = document.createElement("span");
        countSpan.className =
          "cart-count-badge bg-secondary text-primary text-xs font-bold rounded-full px-1.5 py-0.5 ml-1"; // Styling classes.
        // Append the new badge to the cart navigation link.
        cartCountElement.appendChild(countSpan);
      }

      // Update the badge text and visibility based on the total item count.
      if (totalItems > 0) {
        countSpan.textContent = totalItems; // Display the count.
        countSpan.style.display = "inline-block"; // Make it visible.
      } else {
        countSpan.style.display = "none"; // Hide the badge if the cart is empty.
      }
    }
  };

  // --- Initial Setup Calls ---

  // Update the cart count immediately when the page loads to reflect the current cart state.
  updateCartCount();

  // --- Event Delegation for ALL Wishlist Buttons ---
  // Use event delegation on the body to handle clicks on any wishlist button,
  // including those added dynamically (like in the product grid).
  document.body.addEventListener("click", function (event) {
    // Check if the clicked element or its ancestor is a wishlist button.
    // `closest()` efficiently finds the nearest element matching the selector.
    const wishlistButton = event.target.closest(".add-to-wishlist-btn"); // Target the common class.

    // If the click was not on or inside a wishlist button, do nothing.
    if (!wishlistButton) {
      return;
    }

    // Prevent default actions (like link navigation) if the button is inside an anchor tag.
    event.preventDefault();
    // Stop the event from bubbling up further (optional, but can prevent unintended side effects).
    event.stopPropagation();

    // Find the icon element within the clicked button.
    const icon = wishlistButton.querySelector("i");
    if (!icon) {
      // Error handling if the icon isn't found (shouldn't happen with current HTML structure).
      console.error("Could not find icon element within the wishlist button.");
      return;
    }

    // Toggle the Bootstrap icon classes to switch between filled and empty heart.
    // `toggle()` returns true if the class was added, false if removed.
    const isWishlisted = icon.classList.toggle("bi-heart-fill"); // Add filled heart, returns true if added.
    icon.classList.toggle("bi-heart", !isWishlisted); // Add empty heart if filled was removed (isWishlisted is false).

    // Optionally, toggle a class on the button itself for additional styling.
    wishlistButton.classList.toggle("wishlist-added", isWishlisted);

    // --- Wishlist Persistence Logic (Placeholder) ---
    // Get the product ID stored in the button's data attribute.
    const productId = wishlistButton.dataset.productId;
    if (productId) {
      // Log action based on the product ID if available (e.g., for card buttons).
      if (isWishlisted) {
        console.log(`Added product ${productId} to Wishlist`);
        // TODO: Add logic to actually save the product ID to a wishlist (e.g., in localStorage).
      } else {
        console.log(`Removed product ${productId} from Wishlist`);
        // TODO: Add logic to remove the product ID from the wishlist.
      }
    } else {
      // Handle cases where the button might not have a product ID initially
      // (e.g., potentially the button on the product detail page if not set up).
      if (isWishlisted) {
        console.log(`Added item to Wishlist (Detail Page or missing ID)`);
      } else {
        console.log(`Removed item from Wishlist (Detail Page or missing ID)`);
      }
      // Ensure product-detail.js adds the dataset.productId to its wishlist button.
    }
    // Note: Actual persistence (saving the wishlist state) is not implemented here yet.
  });
}); // End of DOMContentLoaded listener
