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

    // NOVA TABELA: Controle de Likes
    db.run(`CREATE TABLE IF NOT EXISTS comment_likes (
        user_email TEXT NOT NULL,
        comment_id INTEGER NOT NULL,
        PRIMARY KEY (user_email, comment_id),
        FOREIGN KEY(comment_id) REFERENCES comments(id)
    )`);
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

// GET: Listar comentários (com info se o usuário atual curtiu)
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

        if (currentUserEmail) {
            const likesSql = `SELECT comment_id FROM comment_likes WHERE user_email = ?`;
            db.all(likesSql, [currentUserEmail], (err, likes) => {
                const userLikes = new Set(likes ? likes.map(l => l.comment_id) : []);
                processComments(rows, currentUserEmail, userLikes, res);
            });
        } else {
            processComments(rows, null, new Set(), res);
        }
    });
});

function processComments(rows, currentUserEmail, userLikes, res) {
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

        // Info se já curtiu
        row.liked_by_me = userLikes.has(row.id);

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
}

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

// ROTA DE LIKE (Toggle)
app.post('/api/comments/:id/like', writeLimiter, async (req, res) => {
    const token = req.headers['authorization'];
    const id = req.params.id;

    if (!token) return res.status(401).json({ error: "Login necessário." });

    const userData = await verifyGoogleToken(token);
    if (!userData) return res.status(403).json({ error: "Token inválido." });

    const userEmail = userData.email.toLowerCase();

    db.get(`SELECT * FROM comment_likes WHERE user_email = ? AND comment_id = ?`, [userEmail, id], (err, row) => {
        if (err) return res.status(400).json({ error: err.message });

        if (row) {
            // Já curtiu -> Remove
            db.run(`DELETE FROM comment_likes WHERE user_email = ? AND comment_id = ?`, [userEmail, id], () => {
                db.run(`UPDATE comments SET likes = likes - 1 WHERE id = ?`, [id], () => {
                    res.json({ message: "Like removido.", liked: false });
                });
            });
        } else {
            // Não curtiu -> Adiciona
            db.run(`INSERT INTO comment_likes (user_email, comment_id) VALUES (?, ?)`, [userEmail, id], () => {
                db.run(`UPDATE comments SET likes = likes + 1 WHERE id = ?`, [id], () => {
                    res.json({ message: "Like registrado.", liked: true });
                });
            });
        }
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
