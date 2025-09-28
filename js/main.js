// Vitoria, este é o código final e corrigido para a interatividade do site.

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DA PÁGINA DE PRODUTO ---
    // Procura por elementos que só existem na página de produto
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        const quantityInput = document.getElementById('quantity');
        const increaseBtn = document.getElementById('increase-quantity');
        const decreaseBtn = document.getElementById('decrease-quantity');
        const modal = document.getElementById('add-to-cart-modal');
        const continueShoppingBtn = document.getElementById('continue-shopping-btn');

        // Funcionalidade do seletor de quantidade
        increaseBtn.addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(quantityInput.value);
            if (val > 1) {
                quantityInput.value = val - 1;
            }
        });

        // Funcionalidade de adicionar ao carrinho e mostrar a janela
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
            
            modal.style.display = 'flex'; // Mostra a janela de confirmação
        });

        // Funcionalidade de fechar a janela
        continueShoppingBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // --- 2. LÓGICA DA PÁGINA DO CARRINHO ---
    // Procura por elementos que só existem na página do carrinho
    const cartItemList = document.getElementById('cart-item-list');
    if (cartItemList) {
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');

        // Função para desenhar os itens do carrinho na tela
        const renderCart = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartItemList.innerHTML = ''; // Limpa a tabela

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

        // Eventos para os botões de +/- e remover DENTRO do carrinho
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

        renderCart(); // Desenha o carrinho assim que a página carrega
    }

    // --- 3. LÓGICA DA PÁGINA DA LOJA ---
    // Procura por elementos que só existem na página da loja
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        const priceValue = document.getElementById('price-value');
        const updatePriceValue = () => {
            priceValue.textContent = `Até R$ ${priceSlider.value}`;
        };
        priceSlider.addEventListener('input', updatePriceValue);
        updatePriceValue();
    }
});