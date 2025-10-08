import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false, // Necessário para alguns provedores de hospedagem como o Render
});

// Função para criar a tabela se ela não existir
async function createCommentsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        parent_id INTEGER,
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
      );
    `);
    console.log('Tabela comments verificada/criada com sucesso.');
  } catch (err) {
    console.error('Erro ao criar a tabela comments:', err);
  }
}

// Chama a função para criar a tabela quando o módulo é carregado
createCommentsTable();

export default pool;
