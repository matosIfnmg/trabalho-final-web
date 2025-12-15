// js/admin.js

const API_URL = 'https://back-end-tf-web-nu.vercel.app'; 
const UPLOADCARE_KEY = '33e296cc27133dfa32a7'; // Chave pública

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
        setupLoginForm();
        return; 
    }

    // Logout
    document.querySelectorAll('a[href="login.html"]').forEach(link => {
        link.addEventListener('click', () => localStorage.removeItem('adminLoggedIn'));
    });

    // Menu Hambúrguer
    const adminHamburger = document.querySelector('.admin-hamburger');
    const adminSidebar = document.getElementById('admin-sidebar');
    if(adminHamburger && adminSidebar) {
        adminHamburger.addEventListener('click', () => adminSidebar.classList.toggle('active'));
    }

    // Roteamento
    if (window.location.pathname.includes('produtos.html')) fetchProductsTable();
    if (window.location.pathname.includes('adicionar-produto.html')) setupProductForm('create');
    if (window.location.pathname.includes('editar-produto.html')) setupProductForm('edit');
});

// ==========================================
// FUNÇÕES DO SISTEMA
// ==========================================

// --- FUNÇÃO DE LOGIN ---
function setupLoginForm() {
    const loginForm = document.getElementById('login-form') || document.querySelector('form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const loginBtn = document.querySelector('.login-button');
        const emailInput = document.getElementById('email');
        const senhaInput = document.getElementById('senha');
        
        if(loginBtn) { loginBtn.textContent = 'Verificando...'; loginBtn.disabled = true; }

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

// --- LISTAGEM DE PRODUTOS ---
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

// --- FORMULÁRIO DE PRODUTO (CRIAR/EDITAR) ---
async function setupProductForm(mode) {
    const saveBtn = document.querySelector('.save-button');
    const uploadBtn = document.getElementById('btn-upload');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    
    // Variável que guarda o link da imagem (Vazia no início ou preenchida na edição)
    let currentImageUrl = ''; 

    // 1. UPLOAD MANUAL COM PROTEÇÃO PARA ANDROID & SUBSTITUIÇÃO
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            uploadcare.openDialog(null, {
                publicKey: UPLOADCARE_KEY,
                imagesOnly: true,
                tabs: 'file camera url facebook gdrive',
                crop: 'free'
            }).done(function(file) {
                
                // BLOQUEIO DE SEGURANÇA: Impede salvar antes do upload terminar
                if(saveBtn) {
                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Aguarde o upload...';
                    saveBtn.style.opacity = '0.6';
                }
                uploadBtn.textContent = 'Enviando arquivo...';
                
                // Promessa do upload
                file.promise()
                    .done(function(fileInfo) {
                        // SUCESSO:
                        // 1. Atualiza a variável com o NOVO link (sobrescrevendo o antigo)
                        currentImageUrl = fileInfo.cdnUrl;
                        console.log('Nova imagem definida:', currentImageUrl);
                        
                        // 2. Mostra a nova imagem na tela imediatamente
                        if(previewContainer && previewImg) {
                            previewImg.src = currentImageUrl;
                            previewContainer.style.display = 'block';
                        }
                        uploadBtn.textContent = '✅ Foto Carregada!';
                        
                        // 3. Libera o botão salvar
                        if(saveBtn) {
                            saveBtn.disabled = false;
                            saveBtn.textContent = mode === 'edit' ? 'Salvar Alterações' : 'Salvar Produto';
                            saveBtn.style.opacity = '1';
                        }
                    })
                    .fail(function(error) {
                        // ERRO:
                        alert("Erro ao enviar a imagem. Tente novamente.");
                        uploadBtn.textContent = '📷 Tentar Novamente';
                        if(saveBtn) {
                            saveBtn.disabled = false;
                            saveBtn.textContent = mode === 'edit' ? 'Salvar Alterações' : 'Salvar Produto';
                            saveBtn.style.opacity = '1';
                        }
                    });
            });
        });
    }

    // 2. CARREGAR DADOS NA EDIÇÃO
    let editId = null;
    if (mode === 'edit') {
        const params = new URLSearchParams(window.location.search);
        editId = params.get('id');
        
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
                
                // Categoria
                const catSelect = document.getElementById('categoria');
                if(catSelect) catSelect.value = product.category || 'Geral'; 
                
                // Imagem: Carrega a do banco
                currentImageUrl = product.image;
                
                // Mostra a imagem do banco no preview
                if (currentImageUrl && previewContainer && previewImg) {
                    previewImg.src = currentImageUrl;
                    previewContainer.style.display = 'block';
                    if(uploadBtn) uploadBtn.textContent = '📷 Alterar Foto';
                }

                if(saveBtn) saveBtn.textContent = 'Salvar Alterações';

            } catch (err) { alert('Erro ao carregar dados do produto.'); }
        }
    }

    // 3. SALVAR
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const nomeVal = document.getElementById('nome').value;
            const precoVal = document.getElementById('preco').value;

            if(!nomeVal || !precoVal) {
                alert('Preencha Nome e Preço!');
                return;
            }

            // Se não tiver imagem (nem antiga, nem nova), usa placeholder
            if (!currentImageUrl) {
                currentImageUrl = 'https://placehold.co/400?text=Sem+Imagem';
            }

            // Pega Categoria com segurança
            const categoriaVal = document.getElementById('categoria')?.value || 'Geral';

            const productData = {
                name: nomeVal,
                description: document.getElementById('descricao').value,
                price: parseFloat(precoVal.replace(',', '.')),
                stock: parseInt(document.getElementById('estoque').value) || 0,
                // Aqui vai a imagem correta (seja a que veio do banco ou a nova que foi upada)
                image: currentImageUrl,
                category: categoriaVal 
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