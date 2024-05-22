CREATE DATABASE primeinventory;

USE primeinventory;

CREATE TABLE usuario (
    usuario_id 						INT AUTO_INCREMENT,
    email 							VARCHAR(255) NOT NULL,
    senha 							VARCHAR(255) NOT NULL,
    nome_completo 					VARCHAR(255) NOT NULL,
    cpf 							CHAR(11) NOT NULL,
    nome_da_empresa 				VARCHAR(255),
    cargo 							VARCHAR(255),
    telefone 						CHAR(11),
    cep 							CHAR(8),
    cnpj 							CHAR(14),
    PRIMARY KEY (usuario_id)
);
SELECT * FROM usuario;

CREATE TABLE produtos (
    produto_id INT AUTO_INCREMENT,
    usuario_id INT,
    nome_prod VARCHAR(255) NOT NULL,
    valor_prod DECIMAL(10, 2) NOT NULL,
    fornecedor_prod VARCHAR(255),
    marca_prod VARCHAR(255),
    PRIMARY KEY (produto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id)
);
SELECT * FROM produtos;

INSERT INTO usuario (email, senha, nome_completo, cpf, nome_da_empresa, cargo, telefone, cep, cnpj)
VALUES ('', '', '', '', '', '', '', '', '');
