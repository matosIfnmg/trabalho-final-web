// Vitoria, este código cuida da interatividade do site público

document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica Geral do Carrinho ---
    const updateCart = (productId, quantityChange) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex > -1) {
            cart[productIndex].quantity += quantityChange;
            if (cart[productIndex].quantity <= 0) {
                cart.splice(productIndex, 1);
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    };

    // --- Lógica da Página do Carrinho ---
    const cartItemList = document.getElementById('cart-item-list');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    const renderCart = () => {
        if (!cartItemList) return; 

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemList.innerHTML = '';

        if (cart.length === 0) {
            cartItemList.innerHTML = '<tr><td colspan="5" style="text-align:center;">Seu carrinho está vazio.</td></tr>';
            subtotalEl.textContent = 'R$ 0,00';
            totalEl.textContent = 'R$ 0,00';
            return;
        }

        let subtotal = 0;

        cart.forEach((product, index) => {
            const itemTotal = product.price * product.quantity;
            subtotal += itemTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="product-info-cell">
                        <div class="image-placeholder small"><span>${product.name}</span></div>
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-selector">
                        <button data-index="${index}" class="decrease-cart-quantity">-</button>
                        <input type="text" value="${product.quantity}" readonly>
                        <button data-index="${index}" class="increase-cart-quantity">+</button>
                    </div>
                </td>
                <td>R$ ${itemTotal.toFixed(2)}</td>
                <td>
                    <button data-index="${index}" class="remove-btn">X</button>
                </td>
            `;
            cartItemList.appendChild(row);
        });

        subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
        totalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
    };

    if (cartItemList) {
        cartItemList.addEventListener('click', (event) => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const index = event.target.dataset.index;

            if (event.target.classList.contains('increase-cart-quantity')) {
                cart[index].quantity++;
            }
            if (event.target.classList.contains('decrease-cart-quantity')) {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                }
            }
            if (event.target.classList.contains('remove-btn')) {
                cart.splice(index, 1);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        });
        renderCart();
    }

    // --- Lógica da Página de Produto ---
    const quantityInput = document.getElementById('quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const decreaseBtn = document.getElementById('decrease-quantity');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const modal = document.getElementById('add-to-cart-modal');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');

    if (addToCartBtn) {
        increaseBtn.addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(quantityInput.value);
            if (val > 1) quantityInput.value = val - 1;
        });

        addToCartBtn.addEventListener('click', () => {
            const productInfoEl = document.querySelector('.product-info');
            const product = {
                id: productInfoEl.dataset.productId,
                name: productInfoEl.dataset.productName,
                price: parseFloat(productInfoEl.dataset.productPrice),
                quantity: parseInt(quantityInput.value)
            };
            
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push(product);
            localStorage.setItem('cart', JSON.stringify(cart));
            
            modal.style.display = 'flex';
        });

        continueShoppingBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // --- Vitoria, aqui está a nova lógica para o filtro de preço ---
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');

    if (priceSlider && priceValue) {
        // Função para atualizar o texto do valor
        const updatePriceValue = () => {
            priceValue.textContent = `Até R$ ${priceSlider.value}`;
        };
        
        // Adiciona o evento que chama a função toda vez que o slider é movido
        priceSlider.addEventListener('input', updatePriceValue);
        
        // Atualiza o valor quando a página carrega
        updatePriceValue();
    }
});