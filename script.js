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

    // === CONTAINER PIX ===
    const pixContainer = document.getElementById("pix-container");

    // Overlay
    const overlay = document.getElementById("modal-overlay");

    // === ESTADO DA APLICAÇÃO ===
    let cart = []; 
    let allProducts = [];

    // === RENDERIZAÇÃO DE PRODUTOS ===
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

    async function carregarProdutos() {
        container.innerHTML = '<p>Carregando produtos...</p>';
        try {
            const response = await fetch("https://dummyjson.com/products?limit=30");
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const data = await response.json();
            allProducts = data.products;

            const cardsHtml = allProducts.map(renderProductCard).join('');
            container.innerHTML = cardsHtml;

        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            container.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
        }
    }

    // === LÓGICA DO CARRINHO ===
    function addToCart(productId) {
        const id = parseInt(productId);
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            const productToAdd = allProducts.find(p => p.id === id);
            if (productToAdd) {
                cart.push({ ...productToAdd, quantity: 1 });
            }
        }
        updateCartUI();
    }

    function removeFromCart(productId) {
        const id = parseInt(productId);
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        } else {
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

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.innerText = `R$ ${total.toFixed(2)}`;

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
        updateCartUI();
        cartModal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }

    function openPaymentModal() {
        cartModal.classList.add('hidden');
        paymentModal.classList.remove('hidden');
        overlay.classList.remove('hidden');
        generatePixQRCode(); // Gera o QR Code Pix assim que abrir o modal
    }

    function closeModals() {
        cartModal.classList.add('hidden');
        paymentModal.classList.add('hidden');
        overlay.classList.add('hidden');
        creditCardForm.classList.add('hidden');
        pixContainer.classList.add('hidden');
    }

    // === PIX: GERAÇÃO DE QR CODE ===
    function generatePixQRCode() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (total <= 0) return;

        const chavePix = "suachavepix@exemplo.com";
        const payloadPix = `00020126580014BR.GOV.BCB.PIX0136${chavePix}520400005303986540${total.toFixed(2).replace('.', '')}5802BR5913Impacto Cell6009Novo Hamb7005BR***6304`;
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payloadPix)}`;

        pixContainer.classList.remove('hidden');
        pixContainer.innerHTML = `
            <p class="text-center text-lg font-semibold mb-3">Escaneie o QR Code abaixo para pagar via Pix:</p>
            <img src="${apiUrl}" alt="QR Code Pix" class="mx-auto rounded-lg shadow-md border" />
            <p class="mt-3 text-sm text-gray-600">Valor: <strong>R$ ${total.toFixed(2)}</strong></p>
            <p class="text-xs text-gray-400">Chave Pix: ${chavePix}</p>
        `;
    }

    // === PAGAMENTO ===
    function processPayment() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
        alert(`Pagamento via ${selectedMethod} processado com sucesso! (Simulação)`);
        cart = [];
        updateCartUI();
        closeModals();
    }

    // === EVENTOS ===
    carregarProdutos();

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-comprar')) {
            const productId = e.target.dataset.id;
            addToCart(productId);
            e.target.innerText = 'Adicionado!';
            setTimeout(() => { e.target.innerText = 'Comprar'; }, 1000);
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remover')) {
            const productId = e.target.dataset.id;
            removeFromCart(productId);
        }
    });

    cartIcon.addEventListener('click', openCartModal);
    checkoutButton.addEventListener('click', openPaymentModal);
    finishPaymentButton.addEventListener('click', processPayment);

    closeCartModal.addEventListener('click', closeModals);
    closePaymentModal.addEventListener('click', closeModals);
    overlay.addEventListener('click', closeModals);

    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            const selected = e.target.value;
            if (selected === 'credit-card') {
                creditCardForm.classList.remove('hidden');
                pixContainer.classList.add('hidden');
            } else if (selected === 'pix') {
                creditCardForm.classList.add('hidden');
                generatePixQRCode();
            } else {
                creditCardForm.classList.add('hidden');
                pixContainer.classList.add('hidden');
            }
        });
    });
});
