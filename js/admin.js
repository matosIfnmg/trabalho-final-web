// Vitoria, este código cuida da interatividade da página de produtos do admin

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os botões de excluir
    const deleteButtons = document.querySelectorAll('.action-btn.delete');

    // Adiciona a funcionalidade para cada botão
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Pede confirmação
            const userConfirmed = confirm("Tem certeza que deseja excluir este produto?");
            
            if (userConfirmed) {
                // Se confirmar, remove a linha da tabela (o avô do botão)
                button.closest('tr').remove();
            }
        });
    });

    // Seleciona todos os botões de editar
    const editButtons = document.querySelectorAll('.action-btn.edit');

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Apenas simula a ação de redirecionar para a página de edição
            alert("Redirecionando para a página de edição do produto...");
            // Em um site real, aqui iria o código: window.location.href = 'editar-produto.html?id=...';
        });
    });
});