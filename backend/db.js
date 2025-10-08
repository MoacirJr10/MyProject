import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Função assíncrona para abrir a conexão com o banco de dados
async function openDb() {
  return open({
    filename: './comments.db', // O arquivo do banco de dados
    driver: sqlite3.Database
  });
}

// Inicializa o banco de dados e cria a tabela se ela não existir
async function setup() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Data e hora automáticas
      parent_id INTEGER, -- Para identificar a qual comentário esta é uma resposta
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE -- Se um comentário for deletado, suas respostas também serão
    )
  `);
  return db;
}

// Exporta a instância do banco de dados pronta para ser usada em outros arquivos
const db = await setup();

export default db;
