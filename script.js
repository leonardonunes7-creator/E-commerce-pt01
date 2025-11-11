document.addEventListener("DOMContentLoaded", () => {

    // === SELETORES DO DOM ===
    const container = document.getElementById("produtos-container");
    const cartIcon = document.getElementById("cart-icon");
    const cartBadge = document.getElementById("cart-badge");
    
    // Elementos do Modal de Carrinho
    const cartModal = document.getElementById("cart-modal");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const closeCartModal = document.getElementById("close-cart-modal");
    const checkoutButton = document.getElementById("checkout-button");

    // Elementos do Modal de Pagamento
    const paymentModal = document.getElementById("payment-modal");
    const closePaymentModal = document.getElementById("close-payment-modal");
    const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
    const creditCardForm = document.getElementById("credit-card-form");
    const finishPaymentButton = document.getElementById("finish-payment-button");
    
    // Overlay
    const overlay = document.getElementById("modal-overlay");

    // === ESTADO DA APLICAÇÃO ===
    let cart = []; // Array para armazenar os produtos do carrinho
    let allProducts = []; // Array para armazenar todos os produtos da API

    /**
     * Gera o HTML para um único card de produto.
     * Adicionamos 'data-id' ao botão para sabermos qual produto foi clicado.
     */
    function renderProductCard(product) {
        return `
            <div class="card">
                <img src="${product.thumbnail}" alt="${product.title}">
                <div class="card-content">
                    <h2>${product.title}</h2>
                    <p>${product.description}</p>
                    <div class="price">Preço: R$ ${product.price.toFixed(2)}</div>
                    <div class="rating">Avaliação: ${product.rating.toFixed(2)}</div>
                    <button class="btn-comprar" data-id="${product.id}">Comprar</button>
                </div>
            </div>`;
    }

    /**
     * Busca os produtos da API e renderiza na tela.
     */
    async function carregarProdutos() {
        container.innerHTML = '<p>Carregando produtos...</p>';
        try {
            const response = await fetch("https://dummyjson.com/products?limit=30");
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const data = await response.json();
            allProducts = data.products; // Armazena os produtos globalmente

            const cardsHtml = allProducts.map(renderProductCard).join('');
            container.innerHTML = cardsHtml;

        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            container.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
        }
    }

    // === LÓGICA DO CARRINHO ===

    /** Adiciona um produto ao carrinho ou incrementa a quantidade */
    function addToCart(productId) {
        // Converte productId de string (do data-id) para número
        const id = parseInt(productId);
        
        // Verifica se o item já está no carrinho
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            // Encontra o produto completo no array 'allProducts'
            const productToAdd = allProducts.find(p => p.id === id);
            if (productToAdd) {
                cart.push({ ...productToAdd, quantity: 1 });
            }
        }
        
        // Atualiza a UI do carrinho (modal e badge)
        updateCartUI();
    }

    /** Remove um produto do carrinho */
    function removeFromCart(productId) {
        const id = parseInt(productId);
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    /** Atualiza o modal do carrinho, o total e o badge */
    function updateCartUI() {
        // 1. Limpa o container do modal
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        } else {
            // 2. Renderiza cada item
            cart.forEach(item => {
                const itemHtml = `
                    <div class="cart-item">
                        <img src="${item.thumbnail}" alt="${item.title}">
                        <div class="cart-item-info">
                            <h4>${item.title}</h4>
                            <p>Preço: R$ ${item.price.toFixed(2)}</p>
                            <p>Quantidade: ${item.quantity}</p>
                        </div>
                        <button class="btn-remover" data-id="${item.id}">Remover</button>
                    </div>`;
                cartItemsContainer.innerHTML += itemHtml;
            });
        }

        // 3. Calcula e atualiza o total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.innerText = `R$ ${total.toFixed(2)}`;

        // 4. Atualiza o badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartBadge.innerText = totalItems;
            cartBadge.classList.remove('hidden');
        } else {
            cartBadge.classList.add('hidden');
        }
    }

    // === LÓGICA DOS MODAIS ===

    function openCartModal() {
        updateCartUI(); // Atualiza o carrinho antes de mostrar
        cartModal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }

    function openPaymentModal() {
        cartModal.classList.add('hidden'); // Fecha modal do carrinho
        paymentModal.classList.remove('hidden'); // Abre modal de pagamento
        overlay.classList.remove('hidden'); // Garante que o overlay continue visível
    }

    function closeModals() {
        cartModal.classList.add('hidden');
        paymentModal.classList.add('hidden');
        overlay.classList.add('hidden');
        // Reseta o formulário de pagamento
        creditCardForm.classList.add('hidden');
        document.querySelector('input[name="payment-method"][value="pix"]').checked = true;
    }

    /** Simula o processo de pagamento */
    function processPayment() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
        
        // Simplesmente mostra um alerta
        alert(`Pagamento via ${selectedMethod} processado com sucesso! (Simulação)`);

        // Limpa o carrinho
        cart = [];
        updateCartUI();
        
        // Fecha os modais
        closeModals();
    }


    // === EVENT LISTENERS (Ouvintes de Eventos) ===

    // Inicia o carregamento dos produtos
    carregarProdutos();

    // Event Delegation para os botões "Comprar"
    container.addEventListener('click', (e) => {
        // Verifica se o clique foi em um botão com a classe 'btn-comprar'
        if (e.target.classList.contains('btn-comprar')) {
            const productId = e.target.dataset.id;
            addToCart(productId);
            // Opcional: Efeito visual de "adicionado"
            e.target.innerText = 'Adicionado!';
            setTimeout(() => { e.target.innerText = 'Comprar'; }, 1000);
        }
    });

    // Event Delegation para os botões "Remover" no carrinho
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remover')) {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        }
    });

    // Abrir/Fechar Modais
    cartIcon.addEventListener('click', openCartModal);
    checkoutButton.addEventListener('click', openPaymentModal);
    finishPaymentButton.addEventListener('click', processPayment);

    // Formas de fechar
    closeCartModal.addEventListener('click', closeModals);
    closePaymentModal.addEventListener('click', closeModals);
    overlay.addEventListener('click', closeModals);

    // Lógica do Modal de Pagamento (mostrar/esconder form do cartão)
    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'credit-card') {
                creditCardForm.classList.remove('hidden');
            } else {
                creditCardForm.classList.add('hidden');
            }
        });
    });

});