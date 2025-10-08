import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all comments (hierarchically)
router.get('/', async (req, res) => {
  try {
    const comments = await db.all('SELECT * FROM comments ORDER BY created_at DESC');
    
    const commentsById = {};
    comments.forEach(comment => {
      commentsById[comment.id] = { ...comment, replies: [] };
    });

    const nestedComments = [];
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentsById[comment.parent_id];
        if (parent) {
          parent.replies.push(commentsById[comment.id]);
        }
      } else {
        nestedComments.push(commentsById[comment.id]);
      }
    });

    res.json(nestedComments);
  } catch (err) {
    console.error('Erro ao buscar comentários:', err);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// POST a new comment or reply
router.post('/', async (req, res) => {
  try {
    const { name, message, parent_id = null } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: 'Nome e mensagem são obrigatórios' });
    }

    const result = await db.run(
      'INSERT INTO comments (name, message, parent_id) VALUES (?, ?, ?)',
      [name, message, parent_id]
    );

    const newComment = await db.get('SELECT * FROM comments WHERE id = ?', result.lastID);
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Erro ao adicionar comentário:', err);
    res.status(500).json({ error: 'Erro ao adicionar comentário' });
  }
});

// DELETE a comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.run('DELETE FROM comments WHERE id = ?', id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    res.json({ message: `Comentário com ID ${id} e suas respostas foram removidos.` });
  } catch (err) {
    console.error('Erro ao deletar comentário:', err);
    res.status(500).json({ error: 'Erro ao deletar comentário' });
  }
});

export default router;
