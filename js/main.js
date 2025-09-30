// Vitoria, este é o nosso "banco de dados" de produtos no navegador.
const products = {
    luffy: {
        id: 'luffy',
        name: 'Luffy',
        price: 49.90,
        image: 'images/luffy.jpeg',
        description: 'Descrição detalhada do boneco Luffy, feito com materiais de alta qualidade, perfeito para fãs de One Piece.'
    },
    cooky: {
        id: 'cooky',
        name: 'Cooky (Coelho BTS)',
        price: 35.00,
        image: 'images/coelho.jpeg',
        description: 'Descrição detalhada do coelho Cooky do BTS, um presente ideal para fãs do grupo.'
    },
    princesa: {
        id: 'princesa',
        name: 'Princesa',
        price: 39.90,
        image: 'images/princesa.jpeg',
        description: 'Descrição detalhada da Princesa amigurumi, com vestido e coroa feitos à mão.'
    },
    boneca: {
        id: 'boneca',
        name: 'Boneca',
        price: 69.90,
        image: 'images/boneca.jpeg',
        description: 'Descrição detalhada da boneca amigurumi, com roupas e acessórios.'
    }
};

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DO MENU HAMBÚRGUER (para todas as páginas) ---
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mainNav = document.getElementById('main-nav');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // --- 2. LÓGICA DA PÁGINA DE PRODUTO (Agora Dinâmica) ---
    const productInfoEl = document.querySelector('.product-info');
    // Verifica se estamos na página de produto pela presença do elemento
    if (productInfoEl && window.location.pathname.includes('produto.html')) {
        
        // Pega o ID do produto da URL (ex: ?id=luffy)
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = products[productId];

        // Se o produto for encontrado em nosso catálogo, preenche a página
        if (product) {
            document.querySelector('.breadcrumbs span').textContent = product.name;
            document.querySelector('.product-gallery .main-image').src = product.image;
            document.querySelector('.product-info h1').textContent = product.name;
            document.querySelector('.product-info .price').textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
            document.querySelector('.product-info .description').textContent = product.description;

            // Atualiza os data-attributes para o carrinho funcionar com o produto certo
            productInfoEl.dataset.productId = product.id;
            productInfoEl.dataset.productName = product.name;
            productInfoEl.dataset.productPrice = product.price;
        }

        const quantityInput = document.getElementById('quantity');
        const increaseBtn = document.getElementById('increase-quantity');
        const decreaseBtn = document.getElementById('decrease-quantity');
        const addToCartBtn = document.getElementById('add-to-cart-btn');
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
            const productToAdd = {
                id: productInfoEl.dataset.productId,
                name: productInfoEl.dataset.productName,
                price: parseFloat(productInfoEl.dataset.productPrice),
                quantity: parseInt(quantityInput.value),
                image: products[productInfoEl.dataset.productId].image // Adiciona a imagem ao carrinho
            };
            
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push(productToAdd);
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
                    <td><div class="product-info-cell"><img src="${product.image}" alt="${product.name}" class="cart-item-image"><span>${product.name}</span></div></td>
                    <td>R$ ${product.price.toFixed(2).replace('.', ',')}</td>
                    <td><div class="quantity-selector"><button class="decrease-cart-quantity" data-index="${index}">-</button><input type="text" value="${product.quantity}" readonly><button class="increase-cart-quantity" data-index="${index}">+</button></div></td>
                    <td>R$ ${itemTotal.toFixed(2).replace('.', ',')}</td>
                    <td><button class="remove-btn" data-index="${index}">X</button></td>
                `;
                cartItemList.appendChild(row);
            });
            subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
            totalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
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
            whatsappButton.style.display = 'none'; 
        } else {
            cart.forEach(product => {
                const itemTotal = product.price * product.quantity;
                total += itemTotal;
                
                const summaryRow = document.createElement('div');
                summaryRow.classList.add('summary-row');
                summaryRow.innerHTML = `
                    <span>${product.quantity}x ${product.name}</span>
                    <span>R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
                `;
                checkoutSummaryItems.appendChild(summaryRow);

                whatsappMessage += `- ${product.quantity}x ${product.name}\n`;
            });
        }

        checkoutTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        whatsappMessage += `\nTotal: R$ ${total.toFixed(2).replace('.', ',')}`;

        const numeroVendedor = '5538998838889';
        whatsappButton.href = `https://api.whatsapp.com/send?phone=${numeroVendedor}&text=${encodeURIComponent(whatsappMessage)}`;
    }
});