// Vitoria, este código cuida da interatividade do painel administrativo

document.addEventListener('DOMContentLoaded', () => {

    // --- Vitoria, aqui está a nova lógica do Menu Hambúrguer do Admin ---
    const adminHamburger = document.querySelector('.admin-hamburger');
    const adminSidebar = document.getElementById('admin-sidebar');

    if(adminHamburger && adminSidebar) {
        adminHamburger.addEventListener('click', () => {
            // Adiciona ou remove a classe 'active' para o CSS mostrar/esconder o menu
            adminSidebar.classList.toggle('active');
        });
    }

    // --- Lógica da Página de Produtos ---
    const productList = document.querySelector('.table-container');
    if (productList) {
        // Funcionalidade para os botões de excluir
        const deleteButtons = document.querySelectorAll('.action-btn.delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const userConfirmed = confirm("Tem certeza que deseja excluir este produto?");
                if (userConfirmed) {
                    button.closest('tr').remove();
                }
            });
        });

        // Funcionalidade para os botões de editar
        const editButtons = document.querySelectorAll('.action-btn.edit');
        editButtons.forEach(button => {
            // Em um site real, o link no HTML já faria o trabalho.
            // Mas para simular, podemos adicionar um alerta.
            button.addEventListener('click', (event) => {
                // Previne o comportamento padrão do link caso seja necessário
                // event.preventDefault(); 
                alert("Simulando: Redirecionando para a página de edição...");
                // A navegação real acontece pelo href="editar-produto.html" no botão
            });
        });
    }
});