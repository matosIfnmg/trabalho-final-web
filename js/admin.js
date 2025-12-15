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

    // --- 2. LÓGICA DA PÁGINA DE LOGIN (Corrigida para Botão/Formulário) ---
    if (isLoginPage) {
        // Agora pegamos o FORMULÁRIO, não só o botão
        const loginForm = document.getElementById('login-form') || document.querySelector('form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // Impede a página de recarregar
                
                const loginBtn = document.querySelector('.login-button');
                const emailInput = document.getElementById('email');
                const senhaInput = document.getElementById('senha');
                
                // Feedback visual
                if(loginBtn) {
                    loginBtn.textContent = 'Verificando...';
                    loginBtn.disabled = true;
                }

                try {
                    const response = await fetch(`${API_URL}/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            email: emailInput.value, 
                            senha: senhaInput.value 
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('adminLoggedIn', 'true');
                        window.location.href = 'index.html'; // Agora sim redireciona
                    } else {
                        alert(data.error || 'Login inválido');
                        if(loginBtn) {
                            loginBtn.textContent = 'Entrar';
                            loginBtn.disabled = false;
                        }
                    }
                } catch (error) {
                    console.error('Erro:', error);
                    alert('Erro ao conectar com o servidor.');
                    if(loginBtn) {
                        loginBtn.textContent = 'Entrar';
                        loginBtn.disabled = false;
                    }
                }
            });
        }
        return; 
    }

    // ... (O RESTO DO CÓDIGO CONTINUA IGUAL: Menu Hambúrguer, Logout, Produtos, etc.) ...
    
    // --- 3. MENU HAMBÚRGUER ---
    const adminHamburger = document.querySelector('.admin-hamburger');
    const adminSidebar = document.getElementById('admin-sidebar');
    if(adminHamburger && adminSidebar) {
        adminHamburger.addEventListener('click', () => {
            adminSidebar.classList.toggle('active');
        });
    }

    // Logout
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', () => localStorage.removeItem('adminLoggedIn'));
    });

    if (window.location.pathname.includes('produtos.html')) fetchProductsTable();
    if (window.location.pathname.includes('adicionar-produto.html')) setupProductForm('create');
    if (window.location.pathname.includes('editar-produto.html')) setupProductForm('edit');
});

// ... (Mantenha as funções fetchProductsTable, deleteProduct e setupProductForm aqui embaixo) ...
// (Copie as funções do código anterior se precisar, elas não mudaram)
// ==========================================
// FUNÇÕES DO SISTEMA (CRUD)
// ==========================================

async function fetchProductsTable() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando produtos...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        tbody.innerHTML = ''; 

        if(products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum produto encontrado.</td></tr>';
            return;
        }
        
        products.forEach(product => {
            const tr = document.createElement('tr');
            const priceFormatted = parseFloat(product.price).toFixed(2).replace('.', ',');

            tr.innerHTML = `
                <td>
                    <div class="table-image-placeholder">
                        <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; border-radius:5px;" onerror="this.src='../images/logo.png'">
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
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Erro na API.</td></tr>';
    }
}

async function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto do banco de dados?')) {
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
    const imgPlaceholder = document.querySelector('.image-upload-placeholder');
    let currentImageUrl = ''; 
    
    if (imgPlaceholder) {
        imgPlaceholder.innerHTML = '<p style="font-size:12px; color:#555; text-align:center;">Clique para inserir o <strong>LINK</strong> da imagem</p>';
        imgPlaceholder.addEventListener('click', () => {
            const url = prompt('Cole o LINK (URL) da imagem aqui:', currentImageUrl);
            if (url) {
                currentImageUrl = url;
                imgPlaceholder.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:contain;">`;
            }
        });
    }

    let editId = null;
    if (mode === 'edit') {
        const params = new URLSearchParams(window.location.search);
        editId = params.get('id');
        
        if (editId) {
            try {
                const res = await fetch(`${API_URL}/products/${editId}`);
                const product = await res.json();
                
                document.getElementById('nome').value = product.name;
                document.getElementById('descricao').value = product.description;
                document.getElementById('preco').value = product.price;
                document.getElementById('estoque').value = product.stock || 0;
                
                currentImageUrl = product.image;
                if(imgPlaceholder && currentImageUrl) {
                    imgPlaceholder.innerHTML = `<img src="${currentImageUrl}" style="width:100%; height:100%; object-fit:contain;">`;
                }
                if(saveBtn) saveBtn.textContent = 'Salvar Alterações';

            } catch (err) { alert('Erro ao carregar dados.'); }
        }
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const productData = {
                name: document.getElementById('nome').value,
                description: document.getElementById('descricao').value,
                price: parseFloat(document.getElementById('preco').value.replace(',', '.')),
                stock: parseInt(document.getElementById('estoque').value),
                image: currentImageUrl || 'https://placehold.co/400?text=Sem+Imagem',
                category: 'Geral'
            };

            if(!productData.name || !productData.price) {
                alert('Nome e Preço são obrigatórios!');
                return;
            }

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
                    alert(mode === 'edit' ? 'Atualizado com sucesso!' : 'Criado com sucesso!');
                    window.location.href = 'produtos.html'; 
                } else {
                    alert('Erro ao salvar.');
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