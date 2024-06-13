const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');


const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Configurações de conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'mysql-joguinho-viniyoda360-d36d.f.aivencloud.com',
    port: '27906',
    user: 'avnadmin',
    password: '',
    database: 'primeinventory',
    connectTimeout: 100000 // 10 segundos
  });
  // Conectar ao banco de dados
  connection.connect((err) => {
      if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        return;
      }
      console.log('Conexão bem-sucedida ao banco de dados.');
  });

app.use(express.json());


// Servir arquivos estáticos (como index.html)
app.use(express.static(path.join(__dirname)));


let userID = 0;
// Rota de login
app.post('/login', (req, res) => {
    console.log("Teste", req.body)
    const { email, senha } = req.body;
    const queryLogin = `SELECT * FROM usuario WHERE email = '${email}' AND senha = '${senha}'`;
    const queryUserID = `SELECT usuario_id FROM usuario WHERE email = '${email}' AND senha = '${senha}'`;
    
    connection.query(queryLogin,function (err, results) {
        if (err) {
            console.error('Erro ao executar consulta:', err);
            res.status(500).send('Erro interno ao realizar o login');
            return;
        }

        if (results.length > 0) {
            // Redirecionar para a tela de gerenciamento
            res.sendFile(path.join(__dirname, '/home2.html'));

            //Rora para fornecero usuario_id ao código .js
            connection.query(queryUserID, function (err, results) {
                if (results.length > 0) {
                    userID = results[0].usuario_id;
                    console.log("UserID: ", userID);
                }
            });

        } else {
            // Alerta de valores errados
            res.write('<script>alert("Email ou senha incorretos, tente novamente");</script>');
            // Redirecionar para a tela de cadastro novamente
            res.write('<script>setTimeout(function() { window.location.href = "/login.html"; }, 300);</script>');
            res.end();;
        }
    });
});


// Rota de cadastro
app.post('/cadastro', (req, res) => {
    console.log("Teste", req.body)
    const { newEmail, newSenha, newName, newCpf, newEmpresa, newCargo, newTelefone, newCep, newCnpj } = req.body;
    const queryIfEquals = `SELECT * FROM usuario WHERE email = '${newEmail}' OR senha = '${newSenha}' OR cnpj = '${newCnpj}' OR nome_da_empresa = '${newEmpresa}'`
    const queryCadastro = `INSERT INTO usuario (email, senha, nome_completo, cpf, nome_da_empresa, cargo, telefone, cep, cnpj)
    VALUES ('${newEmail}', '${newSenha}', '${newName}', '${newCpf}', '${newEmpresa}', '${newCargo}', '${newTelefone}', '${newCep}', '${newCnpj}')`;
    
    connection.query(queryIfEquals,function (err, results) {
        if (err) {
            console.error('Erro ao executar a igualdade:', err);
            res.status(500).send('Erro interno ao realizar a igualdade');
            return;
        }
        
        if (results.length > 0) {
            // Alerta de igualdade
            res.write('<script>alert("Cadastro indisponivel, este email, senha, cnpj ou empresa ja estão em uso");</script>');
            // Redirecionar para a tela de cadastro novamente
            res.write('<script>setTimeout(function() { window.location.href = "/cadastro.html"; }, 300);</script>');
            res.end();
        } else{
            connection.query(queryCadastro,function (err, results) {
                if (err) {
                    console.error('Erro ao executar a insercao:', err);
                    res.status(500).send('Erro interno ao realizar a insercao');
                    return;
                } else {
                    // Alerta de sucesso
                    res.write('<script>alert("Cadastro realizado com sucesso!");</script>');
                    // Redirecionar para a tela de login
                    res.write('<script>setTimeout(function() { window.location.href = "/login.html"; }, 300);</script>');
                    res.end();
                }
            });
        }
    });
});


app.post('/adicionar', (req, res) => {
    console.log("Teste", req.body)
    const { nomeProd, valorProd, fornecedorProd, marcaProd } = req.body
    const addProd = `INSERT INTO produtos (usuario_id, nome_prod, valor_prod, fornecedor_prod, marca_prod) VALUES 
    (${userID}, '${nomeProd}', ${valorProd}, '${fornecedorProd}', '${marcaProd}')`
    connection.query(addProd,function (err, results) {
        if (err) {
            console.error('Erro ao inserir produto:', err);
            res.status(500).send('Erro interno ao inserir produto:');
            return;
        } else{
            res.send('<script>alert("Produto adicionado"); window.location.href = "/gerenciamento.html";</script>');
        }
    });
});


app.post('/deletar', (req, res) => {
    const produtoId = req.body.produtoId;

    const deleteProd = `DELETE FROM produtos WHERE produto_id = ${produtoId}`;

    connection.query(deleteProd, function (err, results) {
        if (err) {
            console.error('Erro ao deletar produto:', err);
            res.status(500).send('Erro interno ao deletar produto.');
            return;
        }

        if (results.affectedRows > 0) {
            res.send('<script>alert("Produto deletado com sucesso"); window.location.href = "/gerenciamento.html";</script>');
        } else {
            res.status(404).send('Produto não encontrado.');
        }
    });
});


/*// Rota para receber do front e fornecer os dados do banco
app.post('/pesquisar', async (req, res) => {
    console.log("Teste", req.body)
    const { selectId, selectNome, selectValor, selectFornecedor, selectMarca } = req.body;
    console.log("Teste se recebeu o username sendo: ", userID); 
    // CALL get_produtos(usuario_id, produto_id, nome_prod, valor_prod, fornecedor_prod, marca_prod);
    const getProdutos = `CALL get_produtos(${userID}, 1, '${selectNome}', 30, '${selectFornecedor}', '${selectMarca}');`
    try {
        // Consulta para obter os dados do banco
        connection.query(getProdutos, function (err, bancoResults) {
            if (err) {
                console.error('Erro ao buscar dados do banco:', err);
                return res.status(500).json({ error: 'Erro ao buscar dados do banco.' });
            }
            console.log("ResultGetProdutos: ", bancoResults);
            if (bancoResults.length >= 5) {
                const produto0 = bancoResults[0].produto_id;
                const produto1 = bancoResults[1].produto_id;
                const produto2 = bancoResults[2].produto_id;
                const produto3 = bancoResults[3].produto_id;
                const produto4 = bancoResults[4].produto_id;
                const nome0 = bancoResults[0].nome_prod;
                const nome1 = bancoResults[1].nome_prod;
                const nome2 = bancoResults[2].nome_prod;
                const nome3 = bancoResults[3].nome_prod;
                const nome4 = bancoResults[4].nome_prod;
                const valor0 = bancoResults[0].valor_prod;
                const valor1 = bancoResults[1].valor_prod;
                const valor2 = bancoResults[2].valor_prod;
                const valor3 = bancoResults[3].valor_prod;
                const valor4 = bancoResults[4].valor_prod;
                const fornecedor0 = bancoResults[0].fornecedor_prod;
                const fornecedor1 = bancoResults[1].fornecedor_prod;
                const fornecedor2 = bancoResults[2].fornecedor_prod;
                const fornecedor3 = bancoResults[3].fornecedor_prod;
                const fornecedor4 = bancoResults[4].fornecedor_prod;
                const marca0 = bancoResults[0].marca_prod;
                const marca1 = bancoResults[1].marca_prod;
                const marca2 = bancoResults[2].marca_prod;
                const marca3 = bancoResults[3].marca_prod;
                const marca4 = bancoResults[4].marca_prod;

                /*const { produto_id: produto0, nome: nome0, valor_prod: valor0, fornecedor_prod: fornecedor0, marca_prod: marca0 } = bancoResults[0];
                const { produto_id: produto1, nome: nome1, valor_prod: valor1, fornecedor_prod: fornecedor1, marca_prod: marca1 } = bancoResults[1];
                const { produto_id: produto2, nome: nome2, valor_prod: valor2, fornecedor_prod: fornecedor2, marca_prod: marca2 } = bancoResults[2];
                const { produto_id: produto3, nome: nome3, valor_prod: valor3, fornecedor_prod: fornecedor3, marca_prod: marca3 } = bancoResults[3];
                const { produto_id: produto4, nome: nome4, valor_prod: valor4, fornecedor_prod: fornecedor4, marca_prod: marca4 } = bancoResults[4];
                
                res.json({ produto0, nome0, valor0, fornecedor0, marca0, 
                    produto1, nome1, valor1, fornecedor1, marca1, 
                    produto2, nome2, valor2, fornecedor2, marca2, 
                    produto3, nome3, valor3, fornecedor3, marca3, 
                    produto4, nome4, valor4, fornecedor4, marca4,
                });
            }
        });
    } catch (error) {
        console.error('Erro ao buscar dados do banco:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do herói e do vilão.' });
    }
});*/


// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});