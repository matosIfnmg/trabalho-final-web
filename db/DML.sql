-- DML (Data Manipulation Language) para o projeto VF Amigurumis
-- Insere dados de exemplo no banco

-- 1. Inserir Categorias
INSERT INTO categorias (nome) VALUES
('Personagens de Anime'),
('Animais Fofos'),
('Heróis'),
('Chaveiros');

-- 2. Inserir um Administrador (Exemplo)
-- IMPORTANTE: A senha 'admin123' está aqui apenas como exemplo.
-- Em produção, você deve gerar um hash seguro (ex: bcrypt) no back-end
-- e inserir apenas o HASH no banco.
INSERT INTO administradores (nome_usuario, senha_hash) VALUES
('admin_vf', '$2b$10$exemploDeHashMuitoSeguro123456...');

-- 3. Inserir Produtos de exemplo
-- Assumindo que 'Personagens de Anime' é id=1 e 'Animais Fofos' é id=2
INSERT INTO produtos (nome, descricao, preco, estoque, categoria_id)
VALUES
('Amigurumi Pikachu', 'Pikachu de crochê, perfeito para fãs de Pokémon.', 79.90, 10, 1),
('Amigurumi Gatinho Cinza', 'Gatinho de crochê dorminhoco, super macio.', 59.90, 15, 2),
('Amigurumi Naruto', 'Naruto Uzumaki em versão amigurumi.', 89.90, 5, 1),
('Amigurumi Polvo do Humor', 'Polvo reversível (feliz/triste) em crochê.', 45.00, 20, 2);

-- Exemplo de produto com mais detalhes
INSERT INTO produtos (nome, descricao, preco, estoque, imagem_principal_url, status, categoria_id)
VALUES
(
    'Amigurumi Homem-Aranha', 
    'Cabeça do Homem-Aranha em amigurumi. Ideal para decoração.', 
    65.00, 
    8, 
    'https://exemplo.com/imagens/spider.png', 
    'ativo',
    3 -- Assumindo que 'Heróis' é id=3
);