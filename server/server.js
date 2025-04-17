const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 3000;

// Configurações do Express
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados
const db = new sqlite3.Database("contador.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        askDeepSeek(`Erro ao conectar ao SQLite: ${err.message}. Como resolver?`).then(console.log);
    } else {
        console.log("Banco de dados conectado com sucesso!");

        // Inicializa a tabela de visitas se não existir
        db.run("CREATE TABLE IF NOT EXISTS visitas (contador INTEGER)", (err) => {
            if (err) {
                console.error("Erro ao criar tabela visitas:", err);
            } else {
                db.get("SELECT contador FROM visitas", (err, row) => {
                    if (err) {
                        console.error("Erro ao verificar contador:", err);
                    } else if (!row) {
                        db.run("INSERT INTO visitas (contador) VALUES (0)", (err) => {
                            if (err) console.error("Erro ao inicializar contador:", err);
                        });
                    }
                });
            }
        });
    }
});

// Função para consultar o DeepSeek (simulada)
async function askDeepSeek(question) {
    // Simulação (substitua por chamada real quando a API estiver disponível)
    const solutions = {
        "SQLITE_CORRUPT": "O arquivo do banco pode estar corrompido. Tente restaurar a partir de um backup.",
        "no such table": "A tabela não existe. Verifique se ela foi criada corretamente.",
        "EFAULT": "Erro de permissão. Verifique se o servidor tem acesso ao arquivo do banco de dados."
    };

    for (const [key, solution] of Object.entries(solutions)) {
        if (question.includes(key)) {
            return `Solução para o erro: ${solution}`;
        }
    }

    return `Sugestão geral: ${question}. Verifique: 1) Se o arquivo do banco existe, 2) Se as tabelas estão criadas corretamente, 3) Permissões de leitura/escrita.`;
}

// Rota para contagem de visitas
app.get("/visitas", (req, res) => {
    db.get("SELECT contador FROM visitas", (err, row) => {
        if (err) {
            console.error("Erro ao obter visitas:", err);
            askDeepSeek(`Erro no SQLite: ${err.message}. Query: SELECT contador FROM visitas`)
                .then(solucao => {
                    res.status(500).json({ error: err.message, solucao });
                });
        } else {
            const novaContagem = row.contador + 1;
            db.run("UPDATE visitas SET contador = ?", [novaContagem], (err) => {
                if (err) {
                    console.error("Erro ao atualizar visitas:", err);
                    askDeepSeek(`Erro no SQLite: ${err.message}. Query: UPDATE visitas`)
                        .then(solucao => {
                            res.status(500).json({ error: err.message, solucao });
                        });
                } else {
                    res.json({ visitas: novaContagem });
                }
            });
        }
    });
});

// Rota para diagnóstico de erros
app.get("/diagnosticar-erro", (req, res) => {
    const errorQuery = req.query.error || "Erro desconhecido";
    askDeepSeek(errorQuery)
        .then(solucao => {
            res.json({ erro: errorQuery, solucao });
        })
        .catch(err => {
            res.status(500).json({ error: "Erro ao consultar assistente" });
        });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

require('dotenv').config(); // Adicione no início do arquivo

const apiKey = process.env.API_KEY; // ← Assim você acessa a chave

// Exemplo com OpenAI (não use a chave vazada!)
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: process.env.API_KEY });
const openai = new OpenAIApi(configuration);