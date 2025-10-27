-- DDL (Data Definition Language) para o projeto VF Amigurumis
-- Compatível com PostgreSQL (Neon.tech)

-- Tabela para as categorias dos produtos
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT (NOW())
);

-- Tabela principal para os produtos (amigurumis)
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    estoque INT DEFAULT 0,
    imagem_principal_url VARCHAR(255),
    status VARCHAR(10) DEFAULT 'ativo', -- Ex: 'ativo', 'inativo', 'esgotado'
    categoria_id INT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT (NOW()),
    atualizado_em TIMESTAMP WITH TIME ZONE,

    -- Definição da Chave Estrangeira (Foreign Key)
    CONSTRAINT fk_produtos_categorias
        FOREIGN KEY(categoria_id) 
        REFERENCES categorias(id)
        ON DELETE SET NULL -- Se uma categoria for deletada, o produto fica sem categoria
        ON UPDATE CASCADE -- Se o id da categoria mudar, atualiza aqui também
);

-- Tabela para os administradores do sistema
CREATE TABLE administradores (
    id SERIAL PRIMARY KEY,
    nome_usuario VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL, -- Importante: Armazenar apenas o hash da senha
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT (NOW())
);

-- (Opcional) Cria uma função e um trigger para atualizar 'atualizado_em' automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.atualizado_em = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_produtos_atualizado_em
BEFORE UPDATE ON produtos
FOR EACH ROW
EXECUTE FUNCTION update_atualizado_em_column();