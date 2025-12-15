// js/admin.js

// URL da API
const API_URL = 'https://back-end-tf-web-nu.vercel.app'; 

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. VERIFICAÇÃO DE LOGIN ---
    const isLoginPage = window.location.pathname.includes('login.html');
    const isLoggedIn = localStorage.getItem('adminLoggedIn');

    if (!isLoggedIn && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

    // --- 2. LÓGICA DA PÁGINA DE LOGIN ---
    if (isLoginPage) {
        const loginForm = document.getElementById('login-form') || document.querySelector('form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault(); 
                
                const loginBtn = document.querySelector('.login-button');
                const emailInput = document.getElementById('email');
                const senhaInput = document.getElementById('senha');
                
                if(loginBtn) {
                    loginBtn.textContent = 'Verificando...';
                    loginBtn.disabled = true;
                }

                try {
                    const response = await fetch(`${API_URL}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: emailInput.value, senha: senhaInput.value })
                    });
                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('adminLoggedIn', 'true');
                        window.location.href = 'index.html'; 
                    } else {
                        alert(data.error || 'Login inválido');
                        if(loginBtn) { loginBtn.textContent = 'Entrar'; loginBtn.disabled = false; }
                    }
                } catch (error) {
                    console.error(error);
                    alert('Erro ao conectar com o servidor.');
                    if(loginBtn) { loginBtn.textContent = 'Entrar'; loginBtn.disabled = false; }
                }
            });
        }
        return; 
    }

    // Logout
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', () => localStorage.removeItem('adminLoggedIn'));
    });

    // Menu Hambúrguer
    const adminHamburger = document.querySelector('.admin-hamburger');
    const adminSidebar = document.getElementById('admin-sidebar');
    if(adminHamburger && adminSidebar) {
        adminHamburger.addEventListener('click', () => adminSidebar.classList.toggle('active'));
    }

    // Rotas
    if (window.location.pathname.includes('produtos.html')) fetchProductsTable();
    if (window.location.pathname.includes('adicionar-produto.html')) setupProductForm('create');
    if (window.location.pathname.includes('editar-produto.html')) setupProductForm('edit');
});

// ==========================================
// FUNÇÕES DO SISTEMA
// ==========================================

async function fetchProductsTable() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        tbody.innerHTML = ''; 

        if(products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
            return;
        }
        
        products.forEach(product => {
            const tr = document.createElement('tr');
            const priceFormatted = parseFloat(product.price).toFixed(2).replace('.', ',');

            tr.innerHTML = `
                <td>
                    <div class="table-image-placeholder">
                        <img src="${product.image}" style="width:100%; height:100%; object-fit:cover; border-radius:5px;" onerror="this.src='../images/logo.png'">
                    </div>
                </td>
                <td>${product.name}</td>
                <td>R$ ${priceFormatted}</td>
                <td>${product.stock || 0}</td>
                <td><span class="status active">Ativo</span></td>
                <td>
                    <a href="editar-produto.html?id=${product.id}" class="action-btn edit">Editar</a>
                    <button class="action-btn delete" onclick="deleteProduct('${product.id}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Erro na API.</td></tr>';
    }
}

async function deleteProduct(id) {
    if (confirm('Excluir este produto permanentemente?')) {
        try {
            const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Produto excluído!');
                fetchProductsTable(); 
            } else {
                alert('Erro ao excluir.');
            }
        } catch (error) {
            alert('Erro de conexão.');
        }
    }
}

async function setupProductForm(mode) {
    const saveBtn = document.querySelector('.save-button');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    let currentImageUrl = ''; 

    // --- 1. INTEGRAÇÃO UPLOADCARE + PREVIEW ---
    let widget = null;
    try {
        // Inicializa o widget no input hidden
        widget = uploadcare.Widget('[role=uploadcare-uploader]');
        
        // Quando o upload termina...
        widget.onUploadComplete(function(fileInfo) {
            if (fileInfo) {
                // Pega a URL CDN do arquivo
                currentImageUrl = fileInfo.cdnUrl; 
                console.log("Upload concluído. URL:", currentImageUrl);
                
                // Atualiza o visual para o usuário ver que deu certo
                if(previewContainer && previewImg) {
                    previewImg.src = currentImageUrl;
                    previewContainer.style.display = 'block'; // Mostra a caixa
                }
            }
        });
    } catch (e) {
        console.warn("Uploadcare não carregou (verifique a internet).", e);
    }

    // --- 2. SE FOR EDIÇÃO: CARREGAR DADOS EXISTENTES ---
    let editId = null;
    if (mode === 'edit') {
        const params = new URLSearchParams(window.location.search);
        editId = params.get('id');
        
        // Atualiza título (caso o HTML não tenha)
        const pageTitle = document.getElementById('page-title');
        if(pageTitle) pageTitle.textContent = 'Editar Produto';

        if (editId) {
            try {
                const res = await fetch(`${API_URL}/products/${editId}`);
                const product = await res.json();
                
                document.getElementById('nome').value = product.name;
                document.getElementById('descricao').value = product.description;
                document.getElementById('preco').value = product.price;
                document.getElementById('estoque').value = product.stock || 0;
                
                // Define a imagem atual
                currentImageUrl = product.image;
                
                // Preenche o widget do Uploadcare com a imagem atual
                if (widget && currentImageUrl) {
                    widget.value(currentImageUrl); 
                }

                // Mostra o preview da imagem atual
                if (currentImageUrl && previewContainer && previewImg) {
                    previewImg.src = currentImageUrl;
                    previewContainer.style.display = 'block';
                }

                if(saveBtn) saveBtn.textContent = 'Salvar Alterações';

            } catch (err) { alert('Erro ao carregar dados do produto.'); }
        }
    }

    // --- 3. AÇÃO DO BOTÃO SALVAR ---
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const nomeVal = document.getElementById('nome').value;
            const precoVal = document.getElementById('preco').value;

            if(!nomeVal || !precoVal) {
                alert('Preencha Nome e Preço!');
                return;
            }

            // Se não tiver imagem nenhuma, coloca placeholder
            if (!currentImageUrl) {
                currentImageUrl = 'https://placehold.co/400?text=Sem+Imagem';
            }

            const productData = {
                name: nomeVal,
                description: document.getElementById('descricao').value,
                price: parseFloat(precoVal.replace(',', '.')),
                stock: parseInt(document.getElementById('estoque').value) || 0,
                image: currentImageUrl, // Manda a URL do Uploadcare para o banco
                category: 'Geral'
            };

            try {
                saveBtn.textContent = 'Salvando...';
                saveBtn.disabled = true;

                const method = mode === 'edit' ? 'PUT' : 'POST';
                const url = mode === 'edit' ? `${API_URL}/products/${editId}` : `${API_URL}/products`;

                const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });

                if (res.ok) {
                    alert('Salvo com sucesso!');
                    window.location.href = 'produtos.html'; 
                } else {
                    alert('Erro ao salvar no banco.');
                    saveBtn.textContent = 'Tentar Novamente';
                    saveBtn.disabled = false;
                }
            } catch (error) {
                alert('Erro de conexão.');
                saveBtn.textContent = 'Tentar Novamente';
                saveBtn.disabled = false;
            }
        });
    }
}
window.deleteProduct = deleteProduct;