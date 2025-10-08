import express from 'express';
import pool from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Rota para buscar todos os comentários (de forma hierárquica)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    const comments = result.rows;
    
    const commentsById = {};
    comments.forEach(comment => {
      commentsById[comment.id] = { ...comment, replies: [] };
    });

    const nestedComments = [];
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentsById[comment.parent_id];
        if (parent) {
          parent.replies.unshift(commentsById[comment.id]);
        }
      } else {
        nestedComments.push(commentsById[comment.id]);
      }
    });

    res.json(nestedComments);
  } catch (err) {
    console.error('Erro ao buscar comentários:', err);
    res.status(500).json({ error: 'Erro interno ao buscar comentários' });
  }
});

// Rota para postar um novo comentário ou uma resposta
router.post('/', async (req, res) => {
  try {
    const { name, message, parent_id = null } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: 'Nome e mensagem são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO comments (name, message, parent_id) VALUES ($1, $2, $3) RETURNING *'
      ,
      [name, message, parent_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar comentário:', err);
    res.status(500).json({ error: 'Erro interno ao adicionar comentário' });
  }
});

// Rota para deletar um comentário (agora com verificação de token de administrador via header)
router.delete('/:id', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ error: 'Acesso negado. Token de administrador inválido.' });
    }

    const { id } = req.params;
    const result = await pool.query('DELETE FROM comments WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    res.json({ message: `Comentário com ID ${id} e suas respostas foram removidos.` });
  } catch (err) {
    console.error('Erro ao deletar comentário:', err);
    res.status(500).json({ error: 'Erro interno ao deletar comentário' });
  }
});

export default router;
