// js/main.js

// URL da sua API (Já configurada)
const BASE_API_URL = 'https://back-end-tf-web-nu.vercel.app'; 

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LÓGICA DO MENU HAMBÚRGUER ---
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mainNav = document.getElementById('main-nav');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // --- 2. CARREGAR PRODUTOS NA HOME (index.html) ---
    const productGrid = document.getElementById('products-grid'); 

    // Só tenta buscar produtos se a "grade" existir na tela
    if (productGrid) {
        productGrid.innerHTML = '<p>Carregando catálogo...</p>';
        
        fetch(`${BASE_API_URL}/products`)
            .then(response => response.json())
            .then(products => {
                productGrid.innerHTML = ''; // Limpa o "Carregando..."
                
                products.forEach(product => {
                    const card = document.createElement('a');
                    card.href = `produto.html?id=${product.id}`; // O ID vem do banco ('luffy', 'cooky', etc)
                    card.classList.add('product-card');
                    
                    // Formata o preço (converte texto/número para formato BRL)
                    const priceVal = parseFloat(product.price);
                    const priceFormatted = priceVal.toFixed(2).replace('.', ',');

                    card.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>R$ ${priceFormatted}</p>
                    `;
                    productGrid.appendChild(card);
                });
            })
            .catch(err => {
                console.error('Erro na API:', err);
                productGrid.innerHTML = '<p>Erro ao carregar produtos. Tente recarregar a página.</p>';
            });
    }

    // --- 3. LÓGICA DA PÁGINA DE PRODUTO (produto.html) ---
    const productInfoEl = document.querySelector('.product-info');
    
    // Verifica se estamos na página de detalhes
    if (productInfoEl && window.location.pathname.includes('produto.html')) {
        
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        document.querySelector('.product-info h1').textContent = 'Carregando...';

        // Busca o produto específico na API
        fetch(`${BASE_API_URL}/products/${productId}`)
            .then(response => {
                if (!response.ok) throw new Error('Produto não encontrado');
                return response.json();
            })
            .then(product => {
                const priceFloat = parseFloat(product.price);
                const priceFormatted = priceFloat.toFixed(2).replace('.', ',');
                
                // Preenche os dados na tela
                const breadcrumbSpan = document.querySelector('.breadcrumbs span');
                if(breadcrumbSpan) breadcrumbSpan.textContent = product.name;

                const mainImg = document.querySelector('.product-gallery .main-image');
                if(mainImg) mainImg.src = product.image;
                
                document.querySelector('.product-info h1').textContent = product.name;
                document.querySelector('.product-info .price').textContent = `R$ ${priceFormatted}`;
                
                const descEl = document.querySelector('.product-info .description');
                if(descEl) descEl.textContent = product.description;

                // Salva dados nos atributos para o carrinho usar depois
                productInfoEl.dataset.productId = product.id;
                productInfoEl.dataset.productName = product.name;
                productInfoEl.dataset.productPrice = priceFloat;
                
                // Ativa os botões do carrinho agora que os dados chegaram
                setupCartLogic(product, productInfoEl);
            })
            .catch(err => {
                console.error(err);
                document.querySelector('.product-info h1').textContent = 'Produto não encontrado';
                const desc = document.querySelector('.product-info .description');
                if(desc) desc.textContent = 'Não foi possível carregar as informações deste produto.';
            });
    }

    // --- 4. FUNÇÃO DO CARRINHO DE COMPRAS (Lógica Local) ---
    function setupCartLogic(productData, infoElement) {
        const quantityInput = document.getElementById('quantity');
        const increaseBtn = document.getElementById('increase-quantity');
        const decreaseBtn = document.getElementById('decrease-quantity');
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        const modal = document.getElementById('add-to-cart-modal');
        const continueShoppingBtn = document.getElementById('continue-shopping-btn');

        if(increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                let current = parseInt(quantityInput.value) || 1;
                quantityInput.value = current + 1;
            });
        }
        
        if(decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                let val = parseInt(quantityInput.value) || 1;
                if (val > 1) quantityInput.value = val - 1;
            });
        }

        if(addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const qtd = parseInt(quantityInput.value) || 1;
                const productToAdd = {
                    id: infoElement.dataset.productId,
                    name: infoElement.dataset.productName,
                    price: parseFloat(infoElement.dataset.productPrice),
                    quantity: qtd,
                    image: productData.image 
                };
                
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                
                // Verifica se já existe no carrinho para somar quantidade
                const existingIndex = cart.findIndex(item => item.id === productToAdd.id);
                if(existingIndex > -1) {
                    cart[existingIndex].quantity += qtd;
                } else {
                    cart.push(productToAdd);
                }

                localStorage.setItem('cart', JSON.stringify(cart));
                
                if(modal) modal.style.display = 'flex';
            });
        }

        if(continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    // --- 5. CARRINHO E CHECKOUT (Lógica de exibição do LocalStorage) ---
    // (Esta parte roda apenas nas páginas carrinho.html ou checkout.html)
    const cartItemList = document.getElementById('cart-item-list');
    const checkoutSummaryItems = document.getElementById('checkout-summary-items');

    if (cartItemList) {
        renderCartPage();
    }
    
    if (checkoutSummaryItems) {
        renderCheckoutPage();
    }

    function renderCartPage() {
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        
        const render = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartItemList.innerHTML = '';

            if (cart.length === 0) {
                cartItemList.innerHTML = `<tr><td colspan="5" class="empty-cart-message"><p>Seu carrinho está vazio.</p><a href="loja.html" class="cta-button">Ver a Loja</a></td></tr>`;
                if(subtotalEl) subtotalEl.textContent = 'R$ 0,00';
                if(totalEl) totalEl.textContent = 'R$ 0,00';
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
            if(subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
            if(totalEl) totalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
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
            render();
        });

        render();
    }

    function renderCheckoutPage() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const checkoutTotalEl = document.getElementById('checkout-total');
        const whatsappButton = document.getElementById('whatsapp-button');
        let total = 0;
        let whatsappMessage = 'Olá! Tenho interesse nos seguintes produtos:\n';

        checkoutSummaryItems.innerHTML = '';

        if (cart.length === 0) {
            checkoutSummaryItems.innerHTML = '<p style="text-align:center;">Seu carrinho está vazio.</p>';
            if(whatsappButton) whatsappButton.style.display = 'none'; 
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

        if(checkoutTotalEl) checkoutTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        whatsappMessage += `\nTotal: R$ ${total.toFixed(2).replace('.', ',')}`;

        const numeroVendedor = '5538998838889';
        if(whatsappButton) whatsappButton.href = `https://api.whatsapp.com/send?phone=${numeroVendedor}&text=${encodeURIComponent(whatsappMessage)}`;
    }
});