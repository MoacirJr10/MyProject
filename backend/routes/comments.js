import express from 'express';
import db from '../db.js';

const router = express.Router();

// Rota para buscar todos os comentários (de forma hierárquica)
router.get('/', async (req, res) => {
  try {
    // 1. Busca todos os comentários ordenados pela data de criação
    const comments = await db.all('SELECT * FROM comments ORDER BY created_at DESC');
    
    // 2. Mapeia os comentários por ID para fácil acesso
    const commentsById = {};
    comments.forEach(comment => {
      commentsById[comment.id] = { ...comment, replies: [] }; // Adiciona um array para as respostas
    });

    // 3. Aninha as respostas dentro de seus comentários pais
    const nestedComments = [];
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentsById[comment.parent_id];
        if (parent) {
          // Adiciona a resposta ao início do array para manter a ordem cronológica invertida
          parent.replies.unshift(commentsById[comment.id]);
        }
      } else {
        // Adiciona comentários de nível superior ao resultado final
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

    // Insere o novo comentário no banco de dados
    const result = await db.run(
      'INSERT INTO comments (name, message, parent_id) VALUES (?, ?, ?)',
      [name, message, parent_id]
    );

    // Busca o comentário recém-criado para retornar ao frontend
    const newComment = await db.get('SELECT * FROM comments WHERE id = ?', result.lastID);
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Erro ao adicionar comentário:', err);
    res.status(500).json({ error: 'Erro interno ao adicionar comentário' });
  }
});

// Rota para deletar um comentário
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.run('DELETE FROM comments WHERE id = ?', id);

    // Verifica se algum comentário foi realmente deletado
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    res.json({ message: `Comentário com ID ${id} e suas respostas foram removidos.` });
  } catch (err) {
    console.error('Erro ao deletar comentário:', err);
    res.status(500).json({ error: 'Erro interno ao deletar comentário' });
  }
});

export default router;
