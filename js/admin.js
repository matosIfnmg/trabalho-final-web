// js/admin.js

// ⬇️ MUITO IMPORTANTE: Cole a URL da sua API aqui (sem a barra no final)
const API_URL = 'https://back-end-tf-web-nu.vercel.app'; 

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MENU HAMBÚRGUER (Do seu código original) ---
    const adminHamburger = document.querySelector('.admin-hamburger');
    const adminSidebar = document.getElementById('admin-sidebar');

    if(adminHamburger && adminSidebar) {
        adminHamburger.addEventListener('click', () => {
            adminSidebar.classList.toggle('active');
        });
    }

    // --- 2. VERIFICAÇÃO DE LOGIN ---
    const isLoginPage = window.location.pathname.includes('login.html');
    const isLoggedIn = localStorage.getItem('adminLoggedIn');

    // Se não estiver logado e tentar acessar qualquer página que não seja login -> chuta para login
    if (!isLoggedIn && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

    // --- 3. LÓGICA DA PÁGINA DE LOGIN ---
    if (isLoginPage) {
        const loginBtn = document.querySelector('.login-button');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const senha = document.getElementById('senha').value;
                
                // Login Simples (Hardcoded)
                if (email === 'admin@vf.com' && senha === 'admin123') {
                    localStorage.setItem('adminLoggedIn', 'true');
                    window.location.href = 'index.html';
                } else {
                    alert('Email ou senha incorretos!');
                }
            });
        }
        return; 
    }

    // Logout (Sair)
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            localStorage.removeItem('adminLoggedIn');
        });
    });

    // --- 4. ROTEAMENTO DAS PÁGINAS ---
    
    // Se estiver na lista de produtos
    if (window.location.pathname.includes('produtos.html')) {
        fetchProductsTable();
    }

    // Se estiver adicionando produto
    if (window.location.pathname.includes('adicionar-produto.html')) {
        setupProductForm('create');
    }

    // Se estiver editando produto
    if (window.location.pathname.includes('editar-produto.html')) {
        setupProductForm('edit');
    }
});

// ==========================================
// FUNÇÕES DO SISTEMA (CRUD REAL)
// ==========================================

// Carrega a tabela de produtos vinda da API
async function fetchProductsTable() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando produtos do banco de dados...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        tbody.innerHTML = ''; // Limpa o loading

        if(products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum produto encontrado.</td></tr>';
            return;
        }
        
        products.forEach(product => {
            const tr = document.createElement('tr');
            
            // Formata o preço
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
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Erro ao conectar com a API.</td></tr>';
    }
}

// Função de Excluir (Chamada pelo botão HTML acima)
async function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto do banco de dados?')) {
        try {
            const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Produto excluído com sucesso!');
                fetchProductsTable(); // Recarrega a tabela para sumir o item
            } else {
                alert('Erro ao excluir o produto.');
            }
        } catch (error) {
            alert('Erro de conexão.');
        }
    }
}

// Configura o formulário de Adicionar/Editar
async function setupProductForm(mode) {
    const form = document.querySelector('.product-form');
    const saveBtn = document.querySelector('.save-button');
    
    // Lógica para Inserir Imagem via URL (já que não temos upload de arquivo no plano grátis)
    const imgPlaceholder = document.querySelector('.image-upload-placeholder');
    let currentImageUrl = ''; // Guarda a URL da imagem
    
    if (imgPlaceholder) {
        imgPlaceholder.innerHTML = '<p style="font-size:12px; color:#555; text-align:center;">Clique para inserir o <strong>LINK</strong> da imagem</p>';
        imgPlaceholder.addEventListener('click', () => {
            const url = prompt('Cole o LINK (URL) da imagem aqui:\n(Ex: Copie o endereço da imagem do Google ou do seu GitHub)', currentImageUrl);
            if (url) {
                currentImageUrl = url;
                imgPlaceholder.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:contain;">`;
            }
        });
    }

    // Se for EDIÇÃO, precisamos preencher os campos com os dados atuais
    let editId = null;
    if (mode === 'edit') {
        const params = new URLSearchParams(window.location.search);
        editId = params.get('id');
        
        if (editId) {
            // Busca dados do produto
            try {
                const res = await fetch(`${API_URL}/products/${editId}`);
                const product = await res.json();
                
                // Preenche inputs
                document.getElementById('nome').value = product.name;
                document.getElementById('descricao').value = product.description;
                document.getElementById('preco').value = product.price;
                document.getElementById('estoque').value = product.stock || 0;
                
                // Preenche imagem
                currentImageUrl = product.image;
                if(imgPlaceholder && currentImageUrl) {
                    imgPlaceholder.innerHTML = `<img src="${currentImageUrl}" style="width:100%; height:100%; object-fit:contain;">`;
                }
                
                // Muda texto do botão
                if(saveBtn) saveBtn.textContent = 'Salvar Alterações';

            } catch (err) {
                alert('Erro ao carregar produto para edição.');
            }
        }
    }

    // Ação do Botão Salvar
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Monta o objeto para enviar
            const productData = {
                name: document.getElementById('nome').value,
                description: document.getElementById('descricao').value,
                price: parseFloat(document.getElementById('preco').value.replace(',', '.')), // Garante formato numérico
                stock: parseInt(document.getElementById('estoque').value),
                image: currentImageUrl || 'https://placehold.co/400?text=Sem+Imagem', // Imagem padrão se vazio
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
                    alert(mode === 'edit' ? 'Produto atualizado!' : 'Produto criado com sucesso!');
                    window.location.href = 'produtos.html'; // Volta para a lista
                } else {
                    const errorData = await res.json();
                    alert('Erro ao salvar: ' + (errorData.error || 'Desconhecido'));
                    saveBtn.textContent = 'Tentar Novamente';
                    saveBtn.disabled = false;
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão com a API.');
                saveBtn.textContent = 'Tentar Novamente';
                saveBtn.disabled = false;
            }
        });
    }
}

// Expõe a função delete para o HTML poder chamar via onclick
window.deleteProduct = deleteProduct;