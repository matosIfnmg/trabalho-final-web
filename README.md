trabalho-final-web
Trabalho final da disciplina de WEB
Equipe do Vinicius
Integrantes
[comment]: <> Caio Augusto Costa Ferreira github.com/caioo19
Daniela Almeida Oliveira https://github.com/daniela1234d Fernanda Rodrigues Sales https://github.com/NandaSales Vinicius Araújo Matos https://github.com/matosIfnmg Vitória Ferraz dos Santos https://github.com/vfs15
Titulo: Projeto de Wireframes em Figma: E-commerce de Amigurumis com Portal Admin
Descrição: Este projeto contém os wireframes de baixa fidelidade para um sistema completo de e-commerce, focado na venda de amigurumis artesanais. A estrutura visual foi planejada para abranger tanto a experiência do cliente (site público) quanto a área de gerenciamento do lojista (portal administrativo).
Todo o design foi desenvolvido utilizando o Figma, desde a concepção da estrutura de cada página até a criação de um protótipo interativo que simula a navegação real entre as telas, cumprindo todos os requisitos de um fluxo de usuário completo.

### Principais Funcionalidades

O sistema foi dividido em duas grandes áreas, cada uma com suas funcionalidades específicas planejadas neste wireframe:

**1. Site Público**
* **Página Inicial:** Apresenta a marca, produtos em destaque e seções de conexão com a história do artesão.
* **Página da Loja:** Exibe todos os produtos em um grid, com um sistema de filtros por categorias e faixa de preço para facilitar a busca do usuário.
* **Página de Produto:** Oferece uma visão detalhada de cada item, com galeria de imagens, descrição, preço e o botão para adicionar ao carrinho.
* **Fluxo de Compra Completo:**
    * **Carrinho de Compras:** Permite ao usuário revisar os itens selecionados, ajustar quantidades e ver um resumo do pedido.
    * **Checkout:** Uma página clara e objetiva para coletar informações de endereço e detalhes de pagamento, finalizando a venda.

**2. Portal Administrativo**
* **Autenticação Segura:** Tela de Login para acesso exclusivo do administrador.
* **Dashboard:** Painel de controle que exibe uma visão geral e rápida da loja, com métricas de vendas e lista de pedidos recentes.
* **Gerenciamento de Produtos:**
    * Tela para visualizar todos os produtos cadastrados em formato de grade.
    * Formulário completo para adicionar e editar produtos, incluindo campos para nome, descrição, preço, estoque, upload de imagens e definição de categorias.

**3. Prototipagem Interativa**
* Todas as páginas estão conectadas através do "Flow de Interação" do Figma, permitindo uma simulação navegável e realista da experiência completa, tanto do cliente quanto do administrador.

Link para o Protótipo no Figma: https://www.figma.com/design/7rW12kAGOuukJEjkipR5uS/Display-inicial-v1?node-id=0-1&t=P3jukm7aspeKYdUo-1

---

## 🗃️ Projeto de Banco de Dados (TF04)

Esta seção detalha a estrutura do banco de dados desenvolvida para o projeto, cobrindo os modelos Conceitual, Lógico e Físico.

### 1. Modelo Conceitual

O Modelo Conceitual representa as entidades principais do negócio e como elas se relacionam em alto nível.

* **[Ver Imagem do Modelo Conceitual](db/modelo_conceitual.png)**

#### Explicação do Modelo

Conforme solicitado na atividade, aqui está a descrição das entidades, atributos e relacionamentos:

**Entidades:**
`PRODUTO`: Representa os itens (amigurumis) que estão à venda na loja.
`CATEGORIA`: Utilizada para agrupar e organizar os produtos (ex: "Animais", "Personagens", "Chaveiros").
`ADMINISTRADOR`: Representa o usuário que gerencia o portal, sendo responsável por cadastrar produtos, gerenciar estoque, etc.

**Atributos Principais:**
`PRODUTO`: Possui atributos essenciais como `id` (identificador), `nome`, `descricao`, `preco`, `estoque`, `status` (se está ativo ou não) e `imagem_principal_url`.
`CATEGORIA`: Possui `id` (identificador) e `nome` (o nome da categoria).
`ADMINISTRADOR`: Possui `id` (identificador), `nome_usuario` (para login) e `senha_hash` (a senha criptografada).

**Relacionamentos:**
`CATEGORIA` **possui** `PRODUTO` (Relacionamento 1..N): Define que uma (1) `CATEGORIA` pode estar associada a um ou vários (N) `PRODUTOS`.
`PRODUTO` **pertence a** `CATEGORIA` (Relacionamento 1..1): Define que um (1) `PRODUTO` deve pertencer a exatamente uma (1) `CATEGORIA`.

### 2. Modelo Lógico

O Modelo Lógico traduz o modelo conceitual para uma estrutura de tabelas, colunas e chaves, definindo os tipos de dados e as restrições (como `NOT NULL`).

* **[Ver Imagem do Modelo Lógico](db/modelo_logico.png)**

*(Nota: O relacionamento 1..N é implementado na prática com uma chave estrangeira `categoria_id` na tabela `produtos` que aponta para o `id` da tabela `categorias`.)*

### 3. Modelo Físico

O Modelo Físico é a implementação real do banco de dados em um SGBD específico (neste caso, PostgreSQL, compatível com Neon). Ele é composto pelos arquivos DDL (Data Definition Language) e DML (Data Manipulation Language).

* **[Arquivo DDL (Definição das Tabelas)](db/DDL.sql)**
* **[Arquivo DML (Inserção de Dados)](db/DML.sql)**