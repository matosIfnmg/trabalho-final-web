// js/admin.js

const API_URL = 'https://back-end-tf-web-nu.vercel.app'; 
const IMGBB_API_KEY = '5b5aad6e4d902479434ab0d4bcb7d8f3'; // Sua Chave ImgBB

document.addEventListener('DOMContentLoaded', () => {
    // Verificações de Login
    const isLoginPage = window.location.pathname.includes('login.html');
    const isLoggedIn = localStorage.getItem('adminLoggedIn');

    if (!isLoggedIn && !isLoginPage) { window.location.href = 'login.html'; return; }
    if (isLoginPage) { setupLoginForm(); return; }

    document.querySelectorAll('a[href="login.html"]').forEach(link => link.addEventListener('click', () => localStorage.removeItem('adminLoggedIn')));
    const adminHamburger = document.querySelector('.admin-hamburger');
    const adminSidebar = document.getElementById('admin-sidebar');
    if(adminHamburger && adminSidebar) adminHamburger.addEventListener('click', () => adminSidebar.classList.toggle('active'));

    // Roteamento
    if (window.location.pathname.includes('produtos.html')) fetchProductsTable();
    if (window.location.pathname.includes('adicionar-produto.html')) setupProductForm('create');
    if (window.location.pathname.includes('editar-produto.html')) setupProductForm('edit');
});

// --- LOGIN ---
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
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
            if (response.ok) { localStorage.setItem('adminLoggedIn', 'true'); window.location.href = 'produtos.html'; } 
            else { alert('Login inválido'); if(loginBtn) { loginBtn.textContent = 'Entrar'; loginBtn.disabled = false; } }
        } catch (error) { alert('Erro na conexão.'); if(loginBtn) { loginBtn.textContent = 'Entrar'; loginBtn.disabled = false; } }
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
        if(products.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum produto.</td></tr>'; return; }
        products.forEach(product => {
            const priceFormatted = parseFloat(product.price).toFixed(2).replace('.', ',');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div class="table-image-placeholder"><img src="${product.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='../images/logo.png'"></div></td>
                <td>${product.name}</td>
                <td>R$ ${priceFormatted}</td>
                <td>${product.category || 'Geral'}</td>
                <td><span class="status active">Ativo</span></td>
                <td>
                    <a href="editar-produto.html?id=${product.id}" class="action-btn edit">Editar</a>
                    <button class="action-btn delete" onclick="deleteProduct('${product.id}')">Excluir</button>
                </td>`;
            tbody.appendChild(tr);
        });
    } catch (e) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Erro na API.</td></tr>'; }
}

async function deleteProduct(id) {
    if (confirm('Excluir produto?')) {
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        fetchProductsTable();
    }
}

// --- FORMULÁRIO COM CATEGORIA DINÂMICA ---
async function setupProductForm(mode) {
    const saveBtn = document.querySelector('.save-button');
    const uploadBtn = document.getElementById('btn-upload-imgbb');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    
    // Elementos da Categoria
    const catSelect = document.getElementById('categoria');
    const btnNewCat = document.getElementById('btn-new-cat');
    const newCatContainer = document.getElementById('new-cat-container');
    const newCatInput = document.getElementById('new-category-input');

    let currentImageUrl = ''; 

    // 1. CARREGAR CATEGORIAS DO BANCO
    async function loadCategories(selectedCategory = null) {
        try {
            const res = await fetch(`${API_URL}/categories`);
            const categories = await res.json();
            
            catSelect.innerHTML = '<option value="Geral">Geral</option>'; // Padrão
            
            categories.forEach(cat => {
                if(cat !== 'Geral') {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    catSelect.appendChild(option);
                }
            });

            if (selectedCategory) {
                // Se a categoria do produto não estiver na lista (criada agora ou antiga), adiciona ela
                if (!categories.includes(selectedCategory) && selectedCategory !== 'Geral') {
                    const option = document.createElement('option');
                    option.value = selectedCategory;
                    option.textContent = selectedCategory;
                    catSelect.appendChild(option);
                }
                catSelect.value = selectedCategory;
            }
        } catch (e) { console.error('Erro ao carregar categorias'); }
    }

    // Carrega categorias ao iniciar o formulário
    await loadCategories();

    // 2. LÓGICA DO BOTÃO "NOVA CATEGORIA"
    let isCreatingCategory = false;
    if(btnNewCat) {
        btnNewCat.addEventListener('click', () => {
            isCreatingCategory = !isCreatingCategory;
            if(isCreatingCategory) {
                catSelect.style.display = 'none';
                newCatContainer.style.display = 'block';
                newCatInput.value = '';
                newCatInput.focus();
                btnNewCat.textContent = '✕';
                btnNewCat.style.background = '#dc3545'; // Vermelho para cancelar
            } else {
                catSelect.style.display = 'block';
                newCatContainer.style.display = 'none';
                btnNewCat.textContent = '+';
                btnNewCat.style.background = '#333';
            }
        });
    }

    // 3. UPLOAD IMGBB
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (fileInput.files.length === 0) { alert("Selecione uma foto."); return; }

            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append("image", file);

            uploadBtn.textContent = "Enviando...";
            uploadBtn.disabled = true;
            if(saveBtn) saveBtn.disabled = true;

            try {
                const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
                const data = await res.json();

                if (data.success) {
                    currentImageUrl = data.data.url;
                    if (previewContainer && previewImg) { previewImg.src = currentImageUrl; previewContainer.style.display = 'block'; }
                    uploadBtn.textContent = "✅ Sucesso!";
                } else { alert("Erro ImgBB."); }
            } catch (error) { alert("Erro de conexão."); } 
            finally { 
                uploadBtn.disabled = false; 
                if(saveBtn) saveBtn.disabled = false; 
            }
        });
    }

    // 4. CARREGAR DADOS NA EDIÇÃO
    let editId = null;
    if (mode === 'edit') {
        const params = new URLSearchParams(window.location.search);
        editId = params.get('id');
        if (editId) {
            const res = await fetch(`${API_URL}/products/${editId}`);
            const product = await res.json();
            
            document.getElementById('nome').value = product.name;
            document.getElementById('descricao').value = product.description;
            document.getElementById('preco').value = product.price;
            document.getElementById('estoque').value = product.stock || 0;
            
            // Carrega e seleciona a categoria
            await loadCategories(product.category);

            currentImageUrl = product.image;
            if (currentImageUrl && previewContainer && previewImg) {
                previewImg.src = currentImageUrl;
                previewContainer.style.display = 'block';
                if(uploadBtn) uploadBtn.textContent = '⬆️ Alterar Foto';
            }
        }
    }

    // 5. SALVAR
    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const nomeVal = document.getElementById('nome').value;
            const precoVal = document.getElementById('preco').value;

            if(!nomeVal || !precoVal) { alert('Preencha Nome e Preço!'); return; }

            // Decide qual categoria usar (Select ou Input de texto)
            let finalCategory = 'Geral';
            if (isCreatingCategory && newCatInput.value.trim() !== '') {
                finalCategory = newCatInput.value.trim();
            } else {
                finalCategory = catSelect.value;
            }

            const productData = {
                name: nomeVal,
                description: document.getElementById('descricao').value,
                price: parseFloat(precoVal.replace(',', '.')),
                stock: parseInt(document.getElementById('estoque').value) || 0,
                image: currentImageUrl || 'https://placehold.co/400?text=Sem+Imagem',
                category: finalCategory 
            };

            const url = mode === 'edit' ? `${API_URL}/products/${editId}` : `${API_URL}/products`;
            const method = mode === 'edit' ? 'PUT' : 'POST';

            saveBtn.textContent = 'Salvando...';
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (res.ok) { alert('Salvo!'); window.location.href = 'produtos.html'; } 
            else { alert('Erro ao salvar.'); saveBtn.textContent = 'Tentar Novamente'; }
        });
    }
}
window.deleteProduct = deleteProduct;