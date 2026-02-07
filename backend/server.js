const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração do Middleware
app.use(cors());
app.use(express.json());

// Configuração do Banco de Dados SQLite
const dbPath = path.resolve(__dirname, 'comments.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        createTable();
    }
});

function createTable() {
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        parent_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(parent_id) REFERENCES comments(id)
    )`);
}

// Rotas da API

// GET: Listar todos os comentários
app.get('/api/comments', (req, res) => {
    const sql = `SELECT * FROM comments ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        // Organizar em árvore (comentários e respostas)
        const commentsMap = {};
        const rootComments = [];

        rows.forEach(row => {
            row.replies = [];
            commentsMap[row.id] = row;
        });

        rows.forEach(row => {
            if (row.parent_id) {
                if (commentsMap[row.parent_id]) {
                    commentsMap[row.parent_id].replies.push(row);
                }
            } else {
                rootComments.push(row);
            }
        });

        // Ordenar respostas cronologicamente (mais antigas primeiro)
        const sortReplies = (comment) => {
            if (comment.replies && comment.replies.length > 0) {
                comment.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                comment.replies.forEach(sortReplies);
            }
        };

        rootComments.forEach(sortReplies);

        res.json(rootComments);
    });
});

// POST: Adicionar novo comentário
app.post('/api/comments', (req, res) => {
    const { name, message, parent_id } = req.body;

    if (!name || !message) {
        res.status(400).json({ error: "Nome e mensagem são obrigatórios." });
        return;
    }

    const sql = `INSERT INTO comments (name, message, parent_id) VALUES (?, ?, ?)`;
    const params = [name, message, parent_id || null];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            id: this.lastID,
            name,
            message,
            parent_id,
            created_at: new Date()
        });
    });
});

// DELETE: Remover comentário (Protegido por token simples)
app.delete('/api/comments/:id', (req, res) => {
    const adminToken = req.headers['x-admin-token'];
    // ATENÇÃO: Mude este token para algo seguro antes de usar em produção!
    const SECRET_TOKEN = "moacir-admin-secret-123";

    if (adminToken !== SECRET_TOKEN) {
        return res.status(403).json({ error: "Acesso negado." });
    }

    const id = req.params.id;

    // Primeiro deleta as respostas
    db.run(`DELETE FROM comments WHERE parent_id = ?`, id, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        // Depois deleta o comentário principal
        db.run(`DELETE FROM comments WHERE id = ?`, id, function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: "Comentário deletado com sucesso", changes: this.changes });
        });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
