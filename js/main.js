// js/main.js

const BASE_API_URL = 'https://back-end-tf-web-nu.vercel.app'; 

// Variáveis Globais para guardar os produtos e filtrar localmente
let currentProducts = []; 
let currentCategoryFilter = 'Todos';

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MENU HAMBÚRGUER ---
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const mainNav = document.getElementById('main-nav');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // --- 2. CONTROLES DA LOJA (Slider e Categorias) ---
    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');
    
    // Evento: Quando mexe no slider
    if (priceSlider && priceValue) {
        priceSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            priceValue.textContent = `Até R$ ${val}`;
            renderGrid(); // Redesenha a tela aplicando o filtro de preço
        });
    }

    // Carregar Lista de Categorias Lateral
    setupCategorySidebar();

    // --- 3. CARREGAMENTO INICIAL ---
    if (document.getElementById('products-grid')) {
        // Carrega todos os produtos ao entrar na loja
        fetchProducts(); 
    }

    // --- 4. PÁGINA DE DETALHES ---
    if (window.location.pathname.includes('produto.html')) {
        setupProductDetails();
    }

    // --- 5. CARRINHO ---
    if (document.getElementById('cart-item-list')) renderCartPage();
    if (document.getElementById('checkout-summary-items')) renderCheckoutPage();
});

// =========================================
// LÓGICA DA LOJA (PRODUTOS E FILTROS)
// =========================================

function setupCategorySidebar() {
    const categoryListEl = document.getElementById('dynamic-category-list');
    if (!categoryListEl) return;

    fetch(`${BASE_API_URL}/categories`)
        .then(res => res.json())
        .then(categories => {
            categoryListEl.innerHTML = ''; 

            // Botão "Todos"
            createCategoryButton(categoryListEl, 'Todos', true);

            // Botões do Banco
            categories.forEach(cat => {
                createCategoryButton(categoryListEl, cat, false);
            });
        })
        .catch(err => categoryListEl.innerHTML = '<li>Erro ao carregar</li>');
}

function createCategoryButton(container, name, isAll) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = "#";
    a.textContent = name;
    
    // Adiciona classe 'active' se for o selecionado atual
    if (name === currentCategoryFilter) a.classList.add('active-category');

    a.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Atualiza visual (negrito no selecionado)
        document.querySelectorAll('.filter-group a').forEach(el => el.classList.remove('active-category'));
        e.target.classList.add('active-category');

        // Busca produtos
        if (isAll) fetchProducts();
        else fetchProducts(name);
    });

    li.appendChild(a);
    container.appendChild(li);
}

// 1. Busca dados da API
function fetchProducts(category = null) {
    const productGrid = document.getElementById('products-grid');
    if (!productGrid) return;

    productGrid.innerHTML = '<p style="text-align:center; width:100%;">Carregando...</p>';
    currentCategoryFilter = category || 'Todos';

    const endpoint = category 
        ? `${BASE_API_URL}/products/category/${category}`
        : `${BASE_API_URL}/products`;

    fetch(endpoint)
        .then(res => res.json())
        .then(products => {
            currentProducts = products; // Guarda na memória global
            setupPriceSliderMax(products); // Ajusta o máximo do slider
            renderGrid(); // Desenha na tela
        })
        .catch(err => {
            console.error(err);
            productGrid.innerHTML = '<p>Erro ao carregar produtos.</p>';
        });
}

// 2. Ajusta o slider baseado no produto mais caro
function setupPriceSliderMax(products) {
    const slider = document.getElementById('price-slider');
    const priceDisplay = document.getElementById('price-value');
    if (!slider || products.length === 0) return;

    // Acha o maior preço da lista
    const maxPrice = Math.max(...products.map(p => parseFloat(p.price)));
    
    // Arredonda para cima (ex: 145 -> 150)
    const niceMax = Math.ceil(maxPrice / 10) * 10;
    
    slider.max = niceMax;
    slider.value = niceMax; // Começa selecionando tudo
    priceDisplay.textContent = `Até R$ ${niceMax}`;
}

// 3. Desenha os produtos (Aplicando filtro de preço)
function renderGrid() {
    const productGrid = document.getElementById('products-grid');
    const slider = document.getElementById('price-slider');
    if (!productGrid) return;

    const maxPrice = slider ? parseFloat(slider.value) : 10000;

    productGrid.innerHTML = ''; // Limpa tela

    // Filtra localmente pelo preço do slider
    const filtered = currentProducts.filter(p => parseFloat(p.price) <= maxPrice);

    if (filtered.length === 0) {
        productGrid.innerHTML = '<p style="text-align:center; width:100%; padding: 20px;">Nenhum produto nessa faixa de preço.</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('a');
        card.href = `produto.html?id=${product.id}`;
        card.classList.add('product-card');
        
        const priceFormatted = parseFloat(product.price).toFixed(2).replace('.', ',');

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>R$ ${priceFormatted}</p>
        `;
        productGrid.appendChild(card);
    });
}

// =========================================
// OUTRAS FUNÇÕES (DETALHES, CARRINHO)
// =========================================

function setupProductDetails() {
    const productInfoEl = document.querySelector('.product-info');
    if (!productInfoEl) return;
    
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    document.querySelector('.product-info h1').textContent = 'Carregando...';

    fetch(`${BASE_API_URL}/products/${productId}`)
        .then(res => { if (!res.ok) throw new Error('404'); return res.json(); })
        .then(product => {
            const priceVal = parseFloat(product.price);
            
            // Preenche HTML
            const breadcrumbSpan = document.querySelector('.breadcrumbs span');
            if(breadcrumbSpan) breadcrumbSpan.textContent = product.name;
            
            const mainImg = document.querySelector('.product-gallery .main-image');
            if(mainImg) mainImg.src = product.image;

            document.querySelector('.product-info h1').textContent = product.name;
            document.querySelector('.product-info .price').textContent = `R$ ${priceVal.toFixed(2).replace('.', ',')}`;
            
            const desc = document.querySelector('.product-info .description');
            if(desc) desc.textContent = product.description;

            // Dados para o botão adicionar
            productInfoEl.dataset.productId = product.id;
            productInfoEl.dataset.productName = product.name;
            productInfoEl.dataset.productPrice = priceVal;
            
            setupCartActions(product);
        })
        .catch(() => {
            document.querySelector('.product-info h1').textContent = 'Produto não encontrado';
        });
}

function setupCartActions(productData) {
    const quantityInput = document.getElementById('quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const decreaseBtn = document.getElementById('decrease-quantity');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const modal = document.getElementById('add-to-cart-modal');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const productInfoEl = document.querySelector('.product-info');

    if(increaseBtn) increaseBtn.addEventListener('click', () => quantityInput.value = (parseInt(quantityInput.value)||1) + 1);
    if(decreaseBtn) decreaseBtn.addEventListener('click', () => { let v = (parseInt(quantityInput.value)||1); if(v>1) quantityInput.value = v-1; });

    if(addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const qtd = parseInt(quantityInput.value) || 1;
            const item = {
                id: productInfoEl.dataset.productId,
                name: productInfoEl.dataset.productName,
                price: parseFloat(productInfoEl.dataset.productPrice),
                quantity: qtd,
                image: productData.image
            };
            
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const idx = cart.findIndex(p => p.id === item.id);
            if(idx > -1) cart[idx].quantity += qtd;
            else cart.push(item);

            localStorage.setItem('cart', JSON.stringify(cart));
            if(modal) modal.style.display = 'flex';
        });
    }
    if(continueShoppingBtn) continueShoppingBtn.addEventListener('click', () => modal.style.display = 'none');
}

function renderCartPage() {
    const list = document.getElementById('cart-item-list');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    const render = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        list.innerHTML = '';
        if(cart.length === 0) {
            list.innerHTML = '<tr><td colspan="5" class="empty-cart-message"><p>Carrinho vazio.</p><a href="loja.html" class="cta-button">Ver Loja</a></td></tr>';
            if(subtotalEl) subtotalEl.textContent = 'R$ 0,00';
            if(totalEl) totalEl.textContent = 'R$ 0,00';
            return;
        }

        let total = 0;
        cart.forEach((p, i) => {
            const sum = p.price * p.quantity;
            total += sum;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div class="product-info-cell"><img src="${p.image}" class="cart-item-image"><span>${p.name}</span></div></td>
                <td>R$ ${p.price.toFixed(2).replace('.', ',')}</td>
                <td><div class="quantity-selector"><button class="dec" data-i="${i}">-</button><input type="text" value="${p.quantity}" readonly><button class="inc" data-i="${i}">+</button></div></td>
                <td>R$ ${sum.toFixed(2).replace('.', ',')}</td>
                <td><button class="remove" data-i="${i}">X</button></td>
            `;
            list.appendChild(tr);
        });

        if(subtotalEl) subtotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        if(totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    };

    list.addEventListener('click', (e) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const i = e.target.dataset.i;
        if(e.target.classList.contains('inc')) cart[i].quantity++;
        if(e.target.classList.contains('dec') && cart[i].quantity > 1) cart[i].quantity--;
        if(e.target.classList.contains('remove')) cart.splice(i, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        render();
    });
    render();
}

function renderCheckoutPage() {
    const summary = document.getElementById('checkout-summary-items');
    const totalEl = document.getElementById('checkout-total');
    const whatsappBtn = document.getElementById('whatsapp-button');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    let total = 0;
    let msg = 'Olá! Tenho interesse nos seguintes produtos:\n';
    summary.innerHTML = '';

    if(cart.length === 0) {
        summary.innerHTML = '<p>Carrinho vazio.</p>';
        if(whatsappBtn) whatsappBtn.style.display = 'none';
    } else {
        cart.forEach(p => {
            const sum = p.price * p.quantity;
            total += sum;
            const div = document.createElement('div');
            div.className = 'summary-row';
            div.innerHTML = `<span>${p.quantity}x ${p.name}</span><span>R$ ${sum.toFixed(2).replace('.', ',')}</span>`;
            summary.appendChild(div);
            msg += `- ${p.quantity}x ${p.name}\n`;
        });
    }
    
    if(totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    msg += `\nTotal: R$ ${total.toFixed(2).replace('.', ',')}`;
    
    if(whatsappBtn) whatsappBtn.href = `https://api.whatsapp.com/send?phone=5538998838889&text=${encodeURIComponent(msg)}`;
}