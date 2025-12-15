// js/admin.js

const API_URL = 'https://back-end-tf-web-nu.vercel.app'; 
const IMGBB_API_KEY = '5b5aad6e4d902479434ab0d4bcb7d8f3'; // ✅ Sua Chave ImgBB

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificação de Login
    const isLoginPage = window.location.pathname.includes('login.html');
    const isLoggedIn = localStorage.getItem('adminLoggedIn');

    if (!isLoggedIn && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }

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

// --- LOGIN ---
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
                // ⬇️ MUDANÇA AQUI: Redireciona direto para PRODUTOS
                window.location.href = 'produtos.html'; 
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

// --- LISTAGEM ---
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

// --- FORMULÁRIO (IMGBB + SALVAR) ---
async function setupProductForm(mode) {
    const saveBtn = document.querySelector('.save-button');
    const uploadBtn = document.getElementById('btn-upload-imgbb');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    
    let currentImageUrl = ''; 

    // 1. UPLOAD PARA O IMGBB
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (fileInput.files.length === 0) {
                alert("Por favor, selecione uma foto no campo acima primeiro.");
                return;
            }

            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append("image", file);

            uploadBtn.textContent = "Enviando...";
            uploadBtn.disabled = true;
            if(saveBtn) {
                saveBtn.disabled = true;
                saveBtn.textContent = "Aguarde o upload...";
                saveBtn.style.opacity = "0.6";
            }

            try {
                const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: "POST",
                    body: formData
                });
                
                const data = await res.json();

                if (data.success) {
                    currentImageUrl = data.data.url;
                    console.log("Upload ImgBB Sucesso:", currentImageUrl);

                    if (previewContainer && previewImg) {
                        previewImg.src = currentImageUrl;
                        previewContainer.style.display = 'block';
                    }

                    uploadBtn.textContent = "✅ Foto Carregada!";
                    
                    if(saveBtn) {
                        saveBtn.disabled = false;
                        saveBtn.textContent = mode === 'edit' ? 'Salvar Alterações' : 'Salvar Produto';
                        saveBtn.style.opacity = "1";
                    }

                } else {
                    console.error("Erro ImgBB:", data);
                    alert("Erro ao enviar imagem: " + (data.error ? data.error.message : "Desconhecido"));
                    uploadBtn.textContent = "Tentar Novamente";
                    uploadBtn.disabled = false;
                    if(saveBtn) saveBtn.disabled = false;
                }

            } catch (error) {
                console.error(error);
                alert("Erro de conexão ao enviar imagem.");
                uploadBtn.textContent = "Tentar Novamente";
                uploadBtn.disabled = false;
                if(saveBtn) saveBtn.disabled = false;
            }
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
                
                const catSelect = document.getElementById('categoria');
                if(catSelect) catSelect.value = product.category || 'Geral'; 
                
                currentImageUrl = product.image;
                
                if (currentImageUrl && previewContainer && previewImg) {
                    previewImg.src = currentImageUrl;
                    previewContainer.style.display = 'block';
                    if(uploadBtn) uploadBtn.textContent = '⬆️ Alterar Foto';
                }

                if(saveBtn) saveBtn.textContent = 'Salvar Alterações';

            } catch (err) { alert('Erro ao carregar dados do produto.'); }
        }
    }

    // 3. SALVAR NO BANCO
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const nomeVal = document.getElementById('nome').value;
            const precoVal = document.getElementById('preco').value;

            if(!nomeVal || !precoVal) {
                alert('Preencha Nome e Preço!');
                return;
            }

            if (!currentImageUrl) {
                currentImageUrl = 'https://placehold.co/400?text=Sem+Imagem';
            }

            const categoriaVal = document.getElementById('categoria')?.value || 'Geral';

            const productData = {
                name: nomeVal,
                description: document.getElementById('descricao').value,
                price: parseFloat(precoVal.replace(',', '.')),
                stock: parseInt(document.getElementById('estoque').value) || 0,
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