// Vitoria, este é o código final e completo para toda a interatividade do site.

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DO MENU HAMBÚRGUER (para todas as páginas) ---
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mainNav = document.getElementById('main-nav');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // --- 2. LÓGICA DA PÁGINA DE PRODUTO ---
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        const quantityInput = document.getElementById('quantity');
        const increaseBtn = document.getElementById('increase-quantity');
        const decreaseBtn = document.getElementById('decrease-quantity');
        const modal = document.getElementById('add-to-cart-modal');
        const continueShoppingBtn = document.getElementById('continue-shopping-btn');

        increaseBtn.addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(quantityInput.value);
            if (val > 1) {
                quantityInput.value = val - 1;
            }
        });

        addToCartBtn.addEventListener('click', () => {
            const productInfoEl = document.querySelector('.product-info');
            const product = {
                id: productInfoEl.dataset.productId,
                name: productInfoEl.dataset.productName.replace(' de Crochê', ''),
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

    // --- 3. LÓGICA DA PÁGINA DO CARRINHO ---
    const cartItemList = document.getElementById('cart-item-list');
    if (cartItemList) {
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');

        const renderCart = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartItemList.innerHTML = '';

            if (cart.length === 0) {
                cartItemList.innerHTML = `<tr><td colspan="5" class="empty-cart-message"><p>Seu carrinho está vazio.</p><a href="loja.html" class="cta-button">Ver a Loja</a></td></tr>`;
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
                    <td><div class="product-info-cell"><div class="image-placeholder small"><span>${product.name}</span></div><span>${product.name}</span></div></td>
                    <td>R$ ${product.price.toFixed(2)}</td>
                    <td><div class="quantity-selector"><button class="decrease-cart-quantity" data-index="${index}">-</button><input type="text" value="${product.quantity}" readonly><button class="increase-cart-quantity" data-index="${index}">+</button></div></td>
                    <td>R$ ${itemTotal.toFixed(2)}</td>
                    <td><button class="remove-btn" data-index="${index}">X</button></td>
                `;
                cartItemList.appendChild(row);
            });
            subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
            totalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
        };

        cartItemList.addEventListener('click', (event) => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const index = parseInt(event.target.dataset.index);

            if (event.target.classList.contains('increase-cart-quantity')) {
                cart[index].quantity++;
            }
            if (event.target.classList.contains('decrease-cart-quantity')) {
                if (cart[index].quantity > 1) cart[index].quantity--;
            }
            if (event.target.classList.contains('remove-btn')) {
                cart.splice(index, 1);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        });

        renderCart();
    }

    // --- 4. LÓGICA DA PÁGINA DA LOJA ---
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        const priceValue = document.getElementById('price-value');
        const updatePriceValue = () => {
            priceValue.textContent = `Até R$ ${priceSlider.value}`;
        };
        priceSlider.addEventListener('input', updatePriceValue);
        updatePriceValue();
    }

    // --- 5. LÓGICA DA PÁGINA DE CHECKOUT ---
    const checkoutSummaryItems = document.getElementById('checkout-summary-items');
    if (checkoutSummaryItems) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const checkoutTotalEl = document.getElementById('checkout-total');
        const whatsappButton = document.getElementById('whatsapp-button');
        let total = 0;
        let whatsappMessage = 'Olá! Tenho interesse nos seguintes produtos:\n';

        if (cart.length === 0) {
            checkoutSummaryItems.innerHTML = '<p style="text-align:center;">Seu carrinho está vazio. Volte para a loja para adicionar produtos.</p>';
            whatsappButton.style.display = 'none'; // Esconde o botão se não houver itens
        } else {
            cart.forEach(product => {
                const itemTotal = product.price * product.quantity;
                total += itemTotal;
                
                const summaryRow = document.createElement('div');
                summaryRow.classList.add('summary-row');
                summaryRow.innerHTML = `
                    <span>${product.quantity}x ${product.name}</span>
                    <span>R$ ${itemTotal.toFixed(2)}</span>
                `;
                checkoutSummaryItems.appendChild(summaryRow);

                whatsappMessage += `- ${product.quantity}x ${product.name}\n`;
            });
        }

        checkoutTotalEl.textContent = `R$ ${total.toFixed(2)}`;
        whatsappMessage += `\nTotal: R$ ${total.toFixed(2)}`;

        const numeroVendedor = '5531982684415';
        whatsappButton.href = `https://api.whatsapp.com/send?phone=${numeroVendedor}&text=${encodeURIComponent(whatsappMessage)}`;
    }
});