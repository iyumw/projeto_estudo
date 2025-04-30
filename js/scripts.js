document.addEventListener("DOMContentLoaded", () => {

  // --- Scroll Reveal ---
  const observerOptions = {
    root: null, // relative to document viewport
    rootMargin: "0px",
    threshold: 0.1, // 10% of item has to be visible
  };

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Stop observing once visible
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  const elementsToFade = document.querySelectorAll(".fade-in-element");
  elementsToFade.forEach((el) => observer.observe(el));

  // --- Button Click Feedback ---
  const buttons = document.querySelectorAll(
    ".add-to-cart-btn, .add-to-wishlist-btn"
  );

  buttons.forEach((button) => {
    button.addEventListener("mousedown", () => {
      button.classList.add("button-clicked");
    });
    // Remove class on mouseup or if mouse leaves the button while pressed
    button.addEventListener("mouseup", () => {
      button.classList.remove("button-clicked");
    });
    button.addEventListener("mouseleave", () => {
      button.classList.remove("button-clicked");
    });
    // Also remove on focus out for accessibility (e.g., keyboard navigation)
    button.addEventListener("focusout", () => {
      button.classList.remove("button-clicked");
    });
  });

  // --- Load Products into Grid (for index.html, products.html, etc.) ---
  const productGrid = document.getElementById("product-grid");
  if (productGrid && typeof products !== "undefined") {
    productGrid.innerHTML = "";
    const staggerDelayMs = 150;

    products.forEach((product, index) => {
      const cardLink = document.createElement("a");
      cardLink.href = `product-detail.html?product=${product.id}.png`;
      cardLink.className = "product-card-link block group";

      const cardDiv = document.createElement("div");
      cardDiv.className =
        "product-card fade-in-element rounded-lg overflow-hidden shadow-sm p-3 flex flex-col h-full group-hover:shadow-lg transition-shadow duration-200";

      const imageContainer = document.createElement("div");
      imageContainer.className = "relative";

      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.name;
      img.className = "w-full h-40 object-contain mb-3";

      // Create Wishlist Button Programmatically
      const wishlistButton = document.createElement("button");
      // Add relevant classes for styling AND for the body event listener to find it
      wishlistButton.className =
        "card-wishlist-btn add-to-wishlist-btn icon-button absolute top-2 right-2 z-10";
      wishlistButton.setAttribute("aria-label", "Add to Wishlist");
      wishlistButton.dataset.productId = product.id; // Add product ID to button data
      wishlistButton.innerHTML = '<i class="bi bi-heart text-xl"></i>';

      imageContainer.appendChild(img);
      imageContainer.appendChild(wishlistButton);

      const title = document.createElement("h3");
      title.className = "text-lg font-semibold mb-1";
      title.textContent = product.name;

      const description = document.createElement("p");
      description.className = "text-sm text-gray-600 mb-2 flex-grow";
      description.textContent = product.description; // Use full description or truncate if needed

      const footerDiv = document.createElement("div");
      footerDiv.className = "flex justify-between items-center mt-auto pt-2";

      const price = document.createElement("p");
      price.className = "text-md font-bold";
      price.textContent = `$${product.price.toFixed(2)}`;

      const buttonsDiv = document.createElement("div");
      buttonsDiv.className = "flex justify-start items-center gap-x-2";

      // Create Add to Cart Button Programmatically (optional, but consistent)
      const cartButton = document.createElement("button");
      cartButton.className =
        "add-to-cart-btn icon-button py-1 px-3 rounded z-10 relative";
      cartButton.setAttribute("aria-label", "Add to Cart");
      cartButton.dataset.productId = product.id; // Add product ID to button data
      cartButton.onclick = (event) => {
        event.preventDefault();
        // Find the product details using the ID stored in the button's dataset
        const clickedProductId = event.currentTarget.dataset.productId;
        const productToAdd = products.find((p) => p.id === clickedProductId);
        if (productToAdd) {
          addToCart(productToAdd);
          // Optional: Provide feedback
          console.log(`Added ${productToAdd.name} to cart.`);
          // Maybe change button appearance briefly
          event.currentTarget.innerHTML =
            '<i class="bi bi-cart-check-fill text-xl"></i>';
          setTimeout(() => {
            event.currentTarget.innerHTML =
              '<i class="bi bi-cart-plus text-xl"></i>';
          }, 1500);
        }
      };
      cartButton.innerHTML = '<i class="bi bi-cart-plus text-xl"></i>'; // Set initial icon

      buttonsDiv.appendChild(cartButton);

      footerDiv.appendChild(price);
      footerDiv.appendChild(buttonsDiv);

      cardDiv.appendChild(imageContainer);
      cardDiv.appendChild(title);
      cardDiv.appendChild(description);
      cardDiv.appendChild(footerDiv);

      cardLink.appendChild(cardDiv);
      productGrid.appendChild(cardLink);

      // Directly trigger the animation with a staggered delay
      setTimeout(() => {
        cardDiv.classList.add("is-visible");
      }, index * staggerDelayMs); // Stagger the addition of the visible class
    });

    // Re-initialize button feedback for newly added buttons
    const newButtons = productGrid.querySelectorAll(
      ".add-to-cart-btn, .card-wishlist-btn"
    );
    newButtons.forEach((button) => {
      // Add mousedown listener
      button.addEventListener("mousedown", () => {
        button.classList.add("button-clicked");
      });
      // Remove class on mouseup or if mouse leaves the button while pressed
      button.addEventListener("mouseup", () => {
        button.classList.remove("button-clicked");
      });
      button.addEventListener("mouseleave", () => {
        button.classList.remove("button-clicked");
      });
      // Also remove on focus out for accessibility
      button.addEventListener("focusout", () => {
        button.classList.remove("button-clicked");
      });
    });
  }

  // Make addToCart global
  window.addToCart = function (product, quantity = 1) {
    // Allow quantity parameter
    // Get existing cart from localStorage or initialize an empty array
    let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    // Check if product is already in cart
    const existingItemIndex = cart.findIndex((item) => item.id === product.id);

    if (existingItemIndex > -1) {
      // If yes, increment quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // If no, add new item with quantity
      cart.push({ ...product, quantity: quantity });
    }

    // Save updated cart back to localStorage
    localStorage.setItem("shoppingCart", JSON.stringify(cart));

    // Update cart count display in header
    updateCartCount(); // Call the global function
  };

  // --- Update Cart Count in Header ---
  window.updateCartCount = function () {
    // Assign to window to make global
    let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartCountElement = document.querySelector('nav a[href="cart.html"]');
    if (cartCountElement) {
      let countSpan = cartCountElement.querySelector(".cart-count-badge");
      if (!countSpan) {
        countSpan = document.createElement("span");
        countSpan.className =
          "cart-count-badge bg-secondary text-primary text-xs font-bold rounded-full px-1.5 py-0.5 ml-1";
        cartCountElement.appendChild(countSpan);
      }

      if (totalItems > 0) {
        countSpan.textContent = totalItems;
        countSpan.style.display = "inline-block";
      } else {
        countSpan.style.display = "none";
      }
    }
  };

  // Initial cart count update on page load (for all pages)
  updateCartCount(); // Call the global function

  // --- Event Delegation for ALL Wishlist Buttons ---
  document.body.addEventListener("click", function (event) {
    // Use closest() to find the nearest ancestor (or self) with the class
    const wishlistButton = event.target.closest(".add-to-wishlist-btn"); // Use common class

    if (!wishlistButton) {
      return; // Exit if the click wasn't on a wishlist button
    }

    // Prevent default behavior if it's inside a link (like product cards)
    event.preventDefault();
    event.stopPropagation();

    const icon = wishlistButton.querySelector("i");
    if (!icon) {
      console.error("Could not find icon element within the wishlist button.");
      return;
    }

    // Toggle the heart classes
    const isWishlisted = icon.classList.toggle("bi-heart-fill");
    icon.classList.toggle("bi-heart", !isWishlisted);

    // Toggle a class on the button itself (optional, for styling)
    wishlistButton.classList.toggle("wishlist-added", isWishlisted);

    // Log based on product ID if available (might not be on detail page button initially)
    const productId = wishlistButton.dataset.productId;
    if (productId) {
      // Check if productId exists in dataset
      if (isWishlisted) {
        console.log(`Added product ${productId} to Wishlist`);
      } else {
        console.log(`Removed product ${productId} from Wishlist`);
      }
    } else {
      // Handle case for detail page button if it doesn't have dataset initially
      // Or ensure product-detail.js adds the dataset to its button
      if (isWishlisted) {
        console.log(`Added item to Wishlist (Detail Page)`);
      } else {
        console.log(`Removed item from Wishlist (Detail Page)`);
      }
    }
    // Add actual wishlist persistence logic here later
  });
});
