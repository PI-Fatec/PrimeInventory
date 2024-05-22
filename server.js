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
            // Redirecionar para a tela do jogo
            res.sendFile(path.join(__dirname, '/index.html'));

            //Rora para fornecero usuario_id ao código .js
            connection.query(queryUserID, function (err, results) {
                if (results.length > 0) {
                    userID = results[0].usuario_id;
                    console.log("UserID: ", userID);
                }
            });

        } else {
            // Alerta de igualdade
            res.write('<script>alert("Email ou senha incorretos, tente novamente");</script>');
            // Redirecionar para a tela de cadastro novamente
            res.write('<script>setTimeout(function() { window.location.href = "/index.html"; }, 300);</script>');
            res.end();;
        }
    });
});


// Rota de cadastro
app.post('/cadastro', (req, res) => {
    console.log("Teste", req.body)
    const { newEmail, newSenha, newName, newCpf, newEmpresa, newCargo, newTelefone, newCep, newCnpj } = req.body;
    const queryIfEquals = `SELECT * FROM usuario WHERE email = '${newEmail}' AND senha = '${newPassword}' OR cnpj = '${newCnpj}' OR nome_da_empresa = '${newEmpresa}'`
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
            res.write('<script>alert("Cadastro indisponivel, este email/senha/cnpj/empresa ja estão em uso");</script>');
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
                    res.write('<script>setTimeout(function() { window.location.href = "/index.html"; }, 300);</script>');
                    res.end();
                }
            });
        }
    });
});








// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});