import express from 'express';
import cors from 'cors';
import commentsRoutes from './routes/comments.js';
import db from './db.js'; // Importa o db para garantir que a tabela seja criada na inicialização
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Habilita o CORS para todas as origens
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Rotas de comentários
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
