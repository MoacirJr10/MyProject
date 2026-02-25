require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss');

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;

if (!CLIENT_ID || !ADMIN_EMAIL) {
    console.error("ERRO CRÍTICO: Variáveis de ambiente não configuradas.");
    process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID);

app.use(helmet());

const allowedOrigins = ['https://moacirjr10.github.io', 'http://localhost:63342'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado pelo CORS.'));
        }
    }
}));

app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));

// Aumentei limites para permitir likes
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
    message: { error: "Muitas requisições." }
});

const writeLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 50,
    message: { error: "Limite de ações atingido." }
});

app.use('/api/', generalLimiter);

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
        likes INTEGER DEFAULT 0,
        created_at TEXT,
        FOREIGN KEY(parent_id) REFERENCES comments(id)
    )`);

    // Migração para adicionar coluna likes se não existir
    db.run("ALTER TABLE comments ADD COLUMN likes INTEGER DEFAULT 0", (err) => {
        // Ignora erro se já existir
    });
}

async function verifyGoogleToken(token) {
    if (!token) return null;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token.replace("Bearer ", ""),
            audience: CLIENT_ID,
        });
        return ticket.getPayload();
    } catch (error) {
        return null;
    }
}

app.get('/api/comments', async (req, res) => {
    const token = req.headers['authorization'];
    let currentUserEmail = null;

    if (token) {
        const userData = await verifyGoogleToken(token);
        if (userData) currentUserEmail = userData.email.toLowerCase();
    }

    const sql = `SELECT * FROM comments ORDER BY created_at DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });

        const commentsMap = {};
        const rootComments = [];

        rows.forEach(row => {
            row.replies = [];
            const ownerEmail = row.user_email ? row.user_email.toLowerCase() : null;

            if (currentUserEmail && (currentUserEmail === ADMIN_EMAIL || currentUserEmail === ownerEmail)) {
                row.can_delete = true;
            } else {
                row.can_delete = false;
            }

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

app.post('/api/comments', writeLimiter, async (req, res) => {
    const { name, message, parent_id, token } = req.body;
    let userEmail = null;

    if (token) {
        const userData = await verifyGoogleToken(token);
        if (userData) userEmail = userData.email;
    }

    if (!name || !message) {
        return res.status(400).json({ error: "Campos obrigatórios." });
    }

    const cleanName = xss(name);
    const cleanMessage = xss(message);
    const createdAt = new Date().toISOString();

    const sql = `INSERT INTO comments (name, message, user_email, parent_id, likes, created_at) VALUES (?, ?, ?, ?, 0, ?)`;

    db.run(sql, [cleanName, cleanMessage, userEmail, parent_id || null, createdAt], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID, name: cleanName, message: cleanMessage, parent_id, likes: 0, created_at: createdAt });
    });
});

// ROTA DE LIKE
app.post('/api/comments/:id/like', writeLimiter, async (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE comments SET likes = likes + 1 WHERE id = ?`;

    db.run(sql, [id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Like registrado." });
    });
});

app.delete('/api/comments/:id', writeLimiter, async (req, res) => {
    const token = req.headers['authorization'];
    const id = req.params.id;

    if (!token) return res.status(401).json({ error: "Login necessário." });

    const userData = await verifyGoogleToken(token);
    if (!userData) return res.status(403).json({ error: "Token inválido." });

    const userEmail = userData.email.toLowerCase();

    db.get(`SELECT user_email FROM comments WHERE id = ?`, [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Comentário não encontrado." });

        const ownerEmail = row.user_email ? row.user_email.toLowerCase() : null;

        if (userEmail === ADMIN_EMAIL || userEmail === ownerEmail) {
            db.run(`DELETE FROM comments WHERE parent_id = ?`, id, () => {
                db.run(`DELETE FROM comments WHERE id = ?`, id, (err) => {
                    if (err) return res.status(400).json({ error: err.message });
                    res.json({ message: "Deletado." });
                });
            });
        } else {
            return res.status(403).json({ error: "Sem permissão." });
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
