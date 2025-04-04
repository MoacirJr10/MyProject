const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

const db = new sqlite3.Database("contador.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
    } else {
        console.log("Banco de dados conectado!");
    }
});

db.run("CREATE TABLE IF NOT EXISTS visitas (contador INTEGER)", () => {
    db.get("SELECT contador FROM visitas", (err, row) => {
        if (!row) {
            db.run("INSERT INTO visitas (contador) VALUES (0)");
        }
    });
});

app.get("/visitas", (req, res) => {
    db.get("SELECT contador FROM visitas", (err, row) => {
        if (err) {
            res.status(500).json({ error: "Erro ao obter visitas" });
        } else {
            let novaContagem = row.contador + 1;
            db.run("UPDATE visitas SET contador = ?", [novaContagem], (err) => {
                if (err) {
                    res.status(500).json({ error: "Erro ao atualizar visitas" });
                } else {
                    res.json({ visitas: novaContagem });
                }
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
