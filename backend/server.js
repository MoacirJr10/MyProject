require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

// Limpa espaços extras e garante que as variáveis existam
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim() : null;

if (!CLIENT_ID || !ADMIN_EMAIL) {
    console.error("ERRO CRÍTICO: Variáveis de ambiente não configuradas corretamente no arquivo .env");
    process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID);

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'comments.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Erro DB:', err.message);
    else {
        console.log('DB Conectado.');
        createTable();
    }
});

function createTable() {
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

async function verifyGoogleToken(token) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        return ticket.getPayload();
    } catch (error) {
        console.error("Erro Token:", error.message);
        return null;
    }
}

// GET
app.get('/api/comments', (req, res) => {
    const sql = `SELECT * FROM comments ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });

        const commentsMap = {};
        const rootComments = [];

        rows.forEach(row => {
            row.replies = [];
            delete row.user_email;
            commentsMap[row.id] = row;
        });

        rows.forEach(row => {
            if (row.parent_id && commentsMap[row.parent_id]) {
                commentsMap[row.parent_id].replies.push(row);
            } else {
                rootComments.push(row);
            }
        });

        const sortReplies = (comment) => {
            if (comment.replies?.length > 0) {
                comment.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                comment.replies.forEach(sortReplies);
            }
        };

        rootComments.forEach(sortReplies);
        res.json(rootComments);
    });
});

// POST
app.post('/api/comments', async (req, res) => {
    const { name, message, parent_id, token } = req.body;
    let userEmail = null;

    if (token) {
        const userData = await verifyGoogleToken(token);
        if (userData) userEmail = userData.email;
    }

    if (!name || !message) {
        return res.status(400).json({ error: "Campos obrigatórios." });
    }

    const createdAt = new Date().toISOString();
    const sql = `INSERT INTO comments (name, message, user_email, parent_id, created_at) VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [name, message, userEmail, parent_id || null, createdAt], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID, name, message, parent_id, created_at: createdAt });
    });
});

// DELETE (Com Logs Detalhados)
app.delete('/api/comments/:id', async (req, res) => {
    const token = req.headers['authorization'];
    const id = req.params.id;

    if (!token) return res.status(401).json({ error: "Login necessário." });

    const userData = await verifyGoogleToken(token.replace("Bearer ", ""));
    if (!userData) return res.status(403).json({ error: "Token inválido." });

    // Normaliza os emails para minúsculo e sem espaços
    const userEmail = userData.email.toLowerCase().trim();
    const adminEmail = ADMIN_EMAIL.toLowerCase().trim();

    console.log(`--- TENTATIVA DE APAGAR ---`);
    console.log(`ID do Comentário: ${id}`);
    console.log(`Quem está tentando: [${userEmail}]`);
    console.log(`Email do Admin configurado: [${adminEmail}]`);

    db.get(`SELECT user_email FROM comments WHERE id = ?`, [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Comentário não encontrado." });

        const ownerEmail = row.user_email ? row.user_email.toLowerCase().trim() : null;
        console.log(`Dono do comentário: [${ownerEmail}]`);

        // Verifica se é Admin OU Dono
        if (userEmail === adminEmail || userEmail === ownerEmail) {
            console.log(">> PERMISSÃO CONCEDIDA <<");

            db.run(`DELETE FROM comments WHERE parent_id = ?`, id, () => {
                db.run(`DELETE FROM comments WHERE id = ?`, id, (err) => {
                    if (err) return res.status(400).json({ error: err.message });
                    res.json({ message: "Deletado." });
                });
            });
        } else {
            console.log(">> PERMISSÃO NEGADA: Emails não batem <<");
            return res.status(403).json({ error: "Sem permissão." });
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
