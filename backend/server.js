import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import commentsRoutes from './routes/comments.js';
import authRoutes from './routes/auth.js'; // Importa as rotas de autenticação
import db from './db.js'; // Importa o db para garantir que a tabela seja criada na inicialização
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Habilita o CORS para todas as origens
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Middleware para verificar JWT (para rotas protegidas)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user; // Adiciona as informações do usuário (incluindo isAdmin) à requisição
    next();
  });
};

// Rotas de autenticação (não precisam de autenticação JWT para serem acessadas)
app.use('/api/auth', authRoutes);

// Rotas de comentários (a rota DELETE será protegida individualmente)
app.use('/api/comments', commentsRoutes);

// Rota de "health check" para verificar se o servidor está no ar
app.get('/', (req, res) => {
  res.send('Backend do sistema de comentários está funcionando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Banco de dados PostgreSQL inicializado.`);
});
