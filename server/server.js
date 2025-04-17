require('dotenv').config();
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


const db = new sqlite3.Database("contador.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        askDeepSeek(`Erro ao conectar ao SQLite: ${err.message}. Como resolver?`).then(console.log);
    } else {
        console.log("Banco de dados conectado com sucesso!");

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


async function askDeepSeek(question) {
    try {
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-chat",
            messages: [{ role: "user", content: question }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Erro ao chamar DeepSeek API:", error.response?.data || error.message);
        return "Não foi possível obter resposta do assistente.";
    }
}


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

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
