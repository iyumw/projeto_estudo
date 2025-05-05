document.addEventListener("DOMContentLoaded", () => {
  // Função principal de inicialização chamada após o DOM carregar.
  function init() {
    console.log("DOM fully loaded. Initializing features...");
    initScrollReveal();
    initButtonClickFeedback(); // Inicializa para botões estáticos
    initGlobalCartFunctions();
    initWishlistButtonListener(); // Configura listener global para wishlist
    loadProductGrid(); // Carrega produtos e inicializa feedback para botões dinâmicos
    updateCartCount(); // Atualiza contagem inicial do carrinho
  }

  // --- 1. Scroll Reveal ---
  function initScrollReveal() {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Observa apenas uma vez
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elementsToFade = document.querySelectorAll(".fade-in-element");
    elementsToFade.forEach((el) => observer.observe(el));
    console.log("Scroll Reveal initialized for", elementsToFade.length, "elements.");
  }

  // --- 2. Button Click Feedback ---
  // Função auxiliar para adicionar listeners de feedback a um botão
  function addButtonFeedbackListeners(button) {
    button.addEventListener("mousedown", () => button.classList.add("button-clicked"));
    button.addEventListener("mouseup", () => button.classList.remove("button-clicked"));
    button.addEventListener("mouseleave", () => button.classList.remove("button-clicked"));
    button.addEventListener("focusout", () => button.classList.remove("button-clicked"));
  }

  // Inicializa feedback para botões que já existem no DOM ao carregar
  function initButtonClickFeedback() {
    const staticButtons = document.querySelectorAll(".add-to-cart-btn, .add-to-wishlist-btn");
    staticButtons.forEach(addButtonFeedbackListeners);
    console.log("Button click feedback initialized for static buttons.");
  }

  // --- 3. Global Cart Functions ---
  function initGlobalCartFunctions() {
    // Adiciona um produto ao carrinho no localStorage.
    window.addToCart = function (product, quantity = 1) {
      if (!product || !product.id) {
          console.error("addToCart: Invalid product data provided.", product);
          return;
      }
      let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
      const existingItemIndex = cart.findIndex((item) => item.id === product.id);

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Garante que apenas dados necessários sejam adicionados
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
      }
      localStorage.setItem("shoppingCart", JSON.stringify(cart));
      updateCartCount(); // Atualiza o contador visual
      console.log(`Product ${product.id} quantity updated/added.`);
    };

    // Atualiza o contador visual do carrinho no header.
    window.updateCartCount = function () {
      let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      // Tenta encontrar o link da nav e o badge dentro dele
      const cartNavLink = document.querySelector('nav a[href="cart.html"]');
      if (!cartNavLink) return; // Sai se o link do carrinho não for encontrado

      let countSpan = cartNavLink.querySelector(".cart-count-badge");

      if (totalItems > 0) {
        if (!countSpan) {
          // Cria o badge se não existir
          countSpan = document.createElement("span");
          countSpan.className = "cart-count-badge bg-secondary text-primary text-xs font-bold rounded-full px-1.5 py-0.5 ml-1";
          cartNavLink.appendChild(countSpan); // Adiciona ao link
        }
        countSpan.textContent = totalItems;
        countSpan.style.display = "inline-block";
      } else {
        // Esconde ou remove o badge se o carrinho estiver vazio
        if (countSpan) {
          countSpan.style.display = "none";
        }
      }
    };
    console.log("Global cart functions (addToCart, updateCartCount) initialized.");
  }

  // --- 4. Product Grid Loading ---
  // Função auxiliar para criar o elemento HTML de um card de produto
  function createProductCardElement(product, index, staggerDelayMs) {
     const cardLink = document.createElement("a");
     cardLink.href = `product-detail.html?id=${product.id}`;
     cardLink.className = "product-card-link block group";

     const cardDiv = document.createElement("div");
     cardDiv.className = "product-card fade-in-element rounded-lg overflow-hidden shadow-sm p-3 flex flex-col h-full group-hover:shadow-lg transition-shadow duration-200";

     const imageContainer = document.createElement("div");
     imageContainer.className = "relative";

     const img = document.createElement("img");
     // Usa placeholder se imagem não existir
     img.src = product.image || 'https://placehold.co/300x160/f5f0e1/a99cbf?text=No+Image';
     img.alt = product.name || "Product Image";
     img.className = "w-full h-40 object-contain mb-3";
     img.onerror = "this.src='https://placehold.co/300x160/f5f0e1/a99cbf?text=Error';"; // Fallback de erro

     const wishlistButton = document.createElement("button");
     wishlistButton.className = "card-wishlist-btn add-to-wishlist-btn icon-button absolute top-2 right-2 z-10"; // Classe comum para delegação
     wishlistButton.setAttribute("aria-label", "Add to Wishlist");
     wishlistButton.dataset.productId = product.id;
     wishlistButton.innerHTML = '<i class="bi bi-heart text-xl"></i>';
     // TODO: Adicionar lógica para verificar se o item já está na wishlist e mostrar bi-heart-fill

     imageContainer.appendChild(img);
     imageContainer.appendChild(wishlistButton);

     const title = document.createElement("h3");
     title.className = "text-lg font-semibold mb-1";
     title.textContent = product.name || "Unnamed Product";

     const description = document.createElement("p");
     description.className = "text-sm text-gray-600 mb-2 flex-grow";
     description.textContent = product.description || "No description available."; // Descrição padrão

     const footerDiv = document.createElement("div");
     footerDiv.className = "flex justify-between items-center mt-auto pt-2";

     const price = document.createElement("p");
     price.className = "text-md font-bold";
     price.textContent = `$${(product.price || 0).toFixed(2)}`; // Preço padrão 0

     const buttonsDiv = document.createElement("div");
     buttonsDiv.className = "flex justify-start items-center gap-x-2";

     const cartButton = document.createElement("button");
     cartButton.className = "add-to-cart-btn icon-button py-1 px-3 rounded z-10 relative"; // Classe comum
     cartButton.setAttribute("aria-label", "Add to Cart");
     cartButton.dataset.productId = product.id;
     cartButton.innerHTML = '<i class="bi bi-cart-plus text-xl"></i>';

     // Event listener para o botão Add to Cart (em vez de onclick)
     cartButton.addEventListener('click', (event) => {
         event.preventDefault(); // Previne navegação do link pai
         event.stopPropagation(); // Impede que o clique chegue ao listener do body (se houver)

         const clickedProductId = event.currentTarget.dataset.productId;
         // Assume que 'products' está acessível aqui ou busca novamente se necessário
         const productToAdd = typeof products !== 'undefined' ? products.find((p) => p.id === clickedProductId) : null;

         if (productToAdd) {
             addToCart(productToAdd); // Chama a função global
             console.log(`Added ${productToAdd.name} to cart via card button.`);
             // Feedback visual no botão
             event.currentTarget.innerHTML = '<i class="bi bi-cart-check-fill text-xl"></i>';
             setTimeout(() => {
                 event.currentTarget.innerHTML = '<i class="bi bi-cart-plus text-xl"></i>';
             }, 1500);
         } else {
             console.error("Could not find product data for ID:", clickedProductId);
         }
     });


     buttonsDiv.appendChild(cartButton);
     footerDiv.appendChild(price);
     footerDiv.appendChild(buttonsDiv);

     cardDiv.appendChild(imageContainer);
     cardDiv.appendChild(title);
     cardDiv.appendChild(description);
     cardDiv.appendChild(footerDiv);

     cardLink.appendChild(cardDiv);

     // Aplica animação com delay
     setTimeout(() => {
         cardDiv.classList.add("is-visible");
     }, index * staggerDelayMs);

     return cardLink; // Retorna o elemento completo do link/card
  }

  // Carrega os produtos na grade
  function loadProductGrid() {
    const productGrid = document.getElementById("product-grid");
    // Verifica se a grade existe e se o array 'products' foi carregado (de products.js)
    if (!productGrid || typeof products === "undefined") {
      console.log("Product grid not found or products array is missing. Skipping grid loading.");
      return;
    }

    console.log("Loading products into grid...");
    productGrid.innerHTML = ""; // Limpa placeholders
    const staggerDelayMs = 100; // Delay menor para parecer mais rápido

    products.forEach((product, index) => {
      const cardElement = createProductCardElement(product, index, staggerDelayMs);
      productGrid.appendChild(cardElement);
    });

    const dynamicButtons = productGrid.querySelectorAll(".add-to-cart-btn, .card-wishlist-btn");
    dynamicButtons.forEach(addButtonFeedbackListeners);
    console.log("Product grid loaded. Feedback listeners applied to dynamic buttons.");
  }

  // --- 5. Wishlist Button Listener (Global) ---
  function initWishlistButtonListener() {
    document.body.addEventListener("click", function (event) {
      const wishlistButton = event.target.closest(".add-to-wishlist-btn"); // Usa a classe comum
      if (!wishlistButton) return; // Sai se não for um botão de wishlist

      event.preventDefault();
      event.stopPropagation();

      const icon = wishlistButton.querySelector("i");
      if (!icon) return;

      // Alterna o ícone e o estado
      const isWishlisted = icon.classList.toggle("bi-heart-fill");
      icon.classList.toggle("bi-heart", !isWishlisted);
      wishlistButton.classList.toggle("wishlist-added", isWishlisted);

      // Lógica de persistência (Placeholder)
      const productId = wishlistButton.dataset.productId;
      if (productId) {
        if (isWishlisted) {
          console.log(`TODO: Add product ${productId} to wishlist storage.`);
          // Ex: addToWishlistStorage(productId);
        } else {
          console.log(`TODO: Remove product ${productId} from wishlist storage.`);
          // Ex: removeFromWishlistStorage(productId);
        }
      } else {
        console.warn("Wishlist button clicked without a product ID.");
      }
    });
    console.log("Global wishlist button listener initialized.");
  }

  // --- Executa a Inicialização ---
  init();

});
