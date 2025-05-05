/** Obtém o carrinho do localStorage. */
function getCart() {
  return JSON.parse(localStorage.getItem("shoppingCart")) || [];
}

/** Salva o carrinho no localStorage. */
function saveCart(cart) {
  localStorage.setItem("shoppingCart", JSON.stringify(cart));
}

/** Atualiza a contagem de itens no cabeçalho. */
function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountElement = document.getElementById("header-cart-count");

  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
    // Mostra/esconde baseado na contagem
    cartCountElement.style.display = totalItems > 0 ? "inline-block" : "none";
  }
  console.log("Header cart count updated:", totalItems);
}

/** Adiciona um produto ao carrinho. */
function addProductToCart(product) {
  if (!product || !product.id || !product.name || product.price === undefined || !product.image) {
    console.error("addProductToCart: Produto inválido:", product);
    return;
  }

  const cart = getCart();
  const existingItemIndex = cart.findIndex((item) => item.id === product.id);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({ ...product, price: parseFloat(product.price), quantity: 1 });
  }

  saveCart(cart);
  console.log("Product added/updated:", product.id);
  updateCartCount(); // Atualiza o contador do header
}

// ----- LÓGICA DA PÁGINA DO CARRINHO -----

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded. Initializing cart.");

  const cartItemsContainer = document.getElementById("cart-items");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartTotalEl = document.getElementById("cart-total");
  const clearCartButton = document.getElementById("clear-cart-btn");
  const checkoutButton = document.querySelector(".checkout-btn");

  // Verifica Elementos Essenciais
  if (!cartItemsContainer || !cartSubtotalEl || !cartTotalEl || !clearCartButton) {
    console.error("Erro: Elementos essenciais do carrinho não encontrados.");
    return;
  }

  // Opções padrão para SweetAlert
  const swalOptions = {
      background: "#f5f0e1",
      color: "#222530",
      confirmButtonColor: "#a99cbf", // Cor padrão para confirmação não destrutiva
      cancelButtonColor: "#6c757d", // Cor padrão para cancelar
  };
  const swalDestructiveOptions = {
      ...swalOptions, // Herda as opções padrão
      confirmButtonColor: "#d33", // Vermelho para ações destrutivas (remover, limpar)
  };

  /** Atualiza o resumo (subtotal/total) no DOM. */
  function updateCartSummary(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = 0.00; // Definir lógica de frete se necessário
    const total = subtotal + shippingCost;

    cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalEl.textContent = `$${total.toFixed(2)}`;

    // Habilita/desabilita botão de checkout
    if (checkoutButton) {
        checkoutButton.disabled = cart.length === 0;
        checkoutButton.classList.toggle('opacity-50', cart.length === 0);
        checkoutButton.classList.toggle('cursor-not-allowed', cart.length === 0);
    }
  }

  /** Cria o elemento HTML para um item do carrinho. */
  function createCartItemElement(item) {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item flex flex-col sm:flex-row items-center border-b py-4";
    itemElement.dataset.productId = item.id;
    itemElement.dataset.productName = item.name; // Para confirmações

    const itemTotal = item.price * item.quantity;

    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="h-20 w-20 object-contain mr-0 sm:mr-4 mb-2 sm:mb-0 rounded flex-shrink-0" onerror="this.src='https://placehold.co/80x80/f5f0e1/a99cbf?text=Img+Error'; this.alt='Image error';" />
      <div class="flex-grow text-center sm:text-left mb-2 sm:mb-0">
        <h3 class="font-semibold">${item.name}</h3>
        <p class="item-unit-price text-sm text-gray-500">Unit Price: $${item.price.toFixed(2)}</p>
      </div>
      <div class="flex items-center justify-center mx-0 sm:mx-4 mb-2 sm:mb-0">
        <button class="quantity-decrease px-3 py-1 border rounded-l bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Decrease quantity">-</button>
        <span class="item-quantity px-4 py-1 border-t border-b min-w-[40px] text-center">${item.quantity}</span>
        <button class="quantity-increase px-3 py-1 border rounded-r bg-gray-100 hover:bg-gray-200 transition-colors" aria-label="Increase quantity">+</button>
      </div>
      <p class="item-total font-semibold w-full sm:w-24 text-center sm:text-right mb-2 sm:mb-0">Total: $${itemTotal.toFixed(2)}</p>
      <button class="remove-item-btn ml-0 sm:ml-4 text-red-500 hover:text-red-700 transition-colors" aria-label="Remove item">
        <i class="bi bi-trash text-lg"></i>
      </button>
    `;
    return itemElement;
  }

  /** Renderiza o carrinho completo no DOM. */
  function renderCart() {
    console.log("Rendering cart...");
    const cart = getCart();
    cartItemsContainer.innerHTML = ""; // Limpa antes de renderizar

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="text-center py-4 text-gray-600">Your cart is currently empty.</div>';
    } else {
      cart.forEach(item => {
        // Validação do item antes de criar o elemento
        if (item && item.id && item.name && item.price !== undefined && item.image && item.quantity > 0) {
            const itemElement = createCartItemElement(item);
            cartItemsContainer.appendChild(itemElement);
        } else {
            console.warn("Skipping invalid cart item:", item);
            // Opcional: Remover item inválido do carrinho aqui
            // removeItemFromCart(item?.id, false); // Cuidado com chamadas recursivas
        }
      });
    }

    updateCartSummary(cart);
    updateCartCount(); // Atualiza contador do header
    console.log("Cart rendering complete.");
  }

  /** Modifica a quantidade ou remove (com confirmação) um item. */
  function updateQuantity(productId, change) {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex === -1) {
      console.warn(`updateQuantity: Product ${productId} not found.`);
      return;
    }

    const item = cart[itemIndex];
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      // Pede confirmação para remover se a quantidade chegar a zero
      showConfirmation(
          `Remove ${item.name}?`,
          "Are you sure you want to remove this item?",
          () => removeItemFromCart(productId) // Função a executar se confirmado
      );
    } else {
      item.quantity = newQuantity;
      saveCart(cart);
      renderCart(); // Re-renderiza para mostrar a nova quantidade
    }
  }

  /** Remove um item do carrinho (sem confirmação direta, assume que foi confirmada antes). */
  function removeItemFromCart(productId) {
    console.log(`Removing product ${productId}.`);
    let cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);

    if (cart.length !== updatedCart.length) {
      saveCart(updatedCart);
      renderCart(); // Re-renderiza para mostrar a remoção
    } else {
      console.warn(`removeItemFromCart: Product ${productId} not found or already removed.`);
    }
  }

  /** Função genérica para mostrar confirmação (Swal ou confirm). */
  function showConfirmation(title, text, confirmCallback, isDestructive = true) {
      const options = isDestructive ? swalDestructiveOptions : swalOptions;
      const confirmButtonText = isDestructive ? "Yes, proceed!" : "OK"; // Ajuste conforme necessário

      if (typeof Swal !== 'undefined') {
          Swal.fire({
              title: title,
              text: text,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: confirmButtonText,
              cancelButtonText: "Cancel",
              ...options // Aplica as opções de estilo
          }).then((result) => {
              if (result.isConfirmed) {
                  confirmCallback(); // Executa a ação se confirmado
              } else {
                  console.log("User cancelled action.");
                  // Se a ação foi cancelada ao tentar remover por quantidade zero, re-renderiza
                  if (text.includes("remove this item")) { // Identifica se era uma remoção
                      renderCart();
                  }
              }
          });
      } else {
          // Fallback para confirm nativo
          if (confirm(`${title}\n${text}`)) {
              confirmCallback();
          } else {
               console.log("User cancelled action (confirm).");
               if (text.includes("remove this item")) {
                   renderCart();
               }
          }
      }
  }

  // ----- MANIPULADORES DE EVENTOS -----

  // Delegação para botões dentro dos itens do carrinho
  cartItemsContainer.addEventListener('click', (event) => {
    const target = event.target;
    const cartItemElement = target.closest('.cart-item');
    if (!cartItemElement) return;

    const productId = cartItemElement.dataset.productId;
    const productName = cartItemElement.dataset.productName || "this item";
    if (!productId) return;

    if (target.closest('.quantity-decrease')) {
      updateQuantity(productId, -1);
    } else if (target.closest('.quantity-increase')) {
      updateQuantity(productId, 1);
    } else if (target.closest('.remove-item-btn')) {
      // Pede confirmação antes de remover diretamente
      showConfirmation(
          `Remove ${productName}?`,
          "Are you sure you want to remove this item?",
          () => removeItemFromCart(productId) // Ação: remover o item
      );
    }
  });

  // Botão Limpar Carrinho
  clearCartButton.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) {
      // Informa que já está vazio
       if (typeof Swal !== 'undefined') {
            Swal.fire({title: 'Already Empty', text: 'Your cart is already empty.', icon: 'info', ...swalOptions});
        } else {
            alert('Your cart is already empty.');
        }
      return;
    }

    showConfirmation(
      "Clear entire cart?",
      "This action cannot be undone.",
      () => { // Função a executar se confirmado
        saveCart([]); // Salva um carrinho vazio
        renderCart();
        console.log("Cart cleared by user.");
         if (typeof Swal !== 'undefined') {
             Swal.fire({title: 'Cleared!', text: 'Your cart is now empty.', icon: 'success', timer: 1500, showConfirmButton: false, ...swalOptions});
         } else {
             alert("Cart cleared!");
         }
      }
    );
  });

  // Botão Checkout
  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      const cart = getCart();
      if (cart.length === 0) {
         if (typeof Swal !== 'undefined') {
            Swal.fire({title: 'Empty Cart', text: 'Cannot checkout with an empty cart.', icon: 'warning', ...swalOptions});
         } else {
            alert('Your cart is empty.');
         }
        return;
      }

      console.log("Processing checkout...");
      // Simulação de checkout
       if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Purchase Complete!',
                text: 'Thank you for your purchase.',
                icon: 'success',
                timer: 2500,
                showConfirmButton: false,
                timerProgressBar: true,
                ...swalOptions
            }).then(() => {
                saveCart([]); // Limpa o carrinho
                window.location.href = 'index.html'; // Redireciona
            });
       } else {
            alert("Thank you for your purchase!");
            saveCart([]);
            window.location.href = 'index.html';
       }
    });
  }

  // ----- INICIALIZAÇÃO -----
  renderCart(); // Renderiza o estado inicial do carrinho

});