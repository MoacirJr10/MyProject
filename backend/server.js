require('dotenv').config(); // Carrega as variáveis do arquivo .env

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

// Carrega configurações sensíveis do ambiente
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!CLIENT_ID || !ADMIN_EMAIL) {
    console.error("ERRO CRÍTICO: Variáveis de ambiente GOOGLE_CLIENT_ID ou ADMIN_EMAIL não configuradas.");
    process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID);

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
    // Adicionamos user_email para saber quem é o dono
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        user_email TEXT,
        parent_id INTEGER,
        created_at TEXT,
        FOREIGN KEY(parent_id) REFERENCES comments(id)
    )`);
}

// Função para verificar token do Google
async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload; // Retorna dados do usuário (email, nome, etc)
    } catch (error) {
        console.error("Erro ao verificar token:", error);
        return null;
    }
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
            // NÃO enviamos o email para o frontend por segurança (privacidade)
            delete row.user_email;
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

        // Ordenar respostas cronologicamente
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

// POST: Adicionar novo comentário (Com Login Opcional ou Obrigatório)
app.post('/api/comments', async (req, res) => {
    const { name, message, parent_id, token } = req.body;
    let userEmail = null;

    if (token) {
        const userData = await verifyGoogleToken(token);
        if (userData) {
            userEmail = userData.email;
        }
    }

    if (!name || !message) {
        res.status(400).json({ error: "Nome e mensagem são obrigatórios." });
        return;
    }

    const createdAt = new Date().toISOString();

    const sql = `INSERT INTO comments (name, message, user_email, parent_id, created_at) VALUES (?, ?, ?, ?, ?)`;
    const params = [name, message, userEmail, parent_id || null, createdAt];

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
            created_at: createdAt
        });
    });
});

// DELETE: Remover comentário (Seguro com Google)
app.delete('/api/comments/:id', async (req, res) => {
    const token = req.headers['authorization']; // Token do Google enviado no header
    const id = req.params.id;

    if (!token) {
        return res.status(401).json({ error: "Login necessário." });
    }

    const userData = await verifyGoogleToken(token.replace("Bearer ", ""));
    if (!userData) {
        return res.status(403).json({ error: "Token inválido." });
    }

    const userEmail = userData.email;

    // Verifica se é o Admin ou o Dono do comentário
    const sqlCheck = `SELECT user_email FROM comments WHERE id = ?`;
    db.get(sqlCheck, [id], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: "Comentário não encontrado." });
        }

        // Se for Admin OU se for o dono do comentário
        if (userEmail === ADMIN_EMAIL || (row.user_email && row.user_email === userEmail)) {

            // Deleta respostas primeiro
            db.run(`DELETE FROM comments WHERE parent_id = ?`, id, (err) => {
                if (err) console.error(err);

                // Deleta o comentário
                db.run(`DELETE FROM comments WHERE id = ?`, id, function(err) {
                    if (err) return res.status(400).json({ error: err.message });
                    res.json({ message: "Comentário deletado com sucesso" });
                });
            });

        } else {
            return res.status(403).json({ error: "Você não tem permissão para apagar este comentário." });
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
