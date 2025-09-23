import pool from './db.js';

const createTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(queryText);
    console.log('Tabela \'comments\' criada com sucesso ou já existente.');
  } catch (err) {
    console.error('Erro ao criar a tabela \'comments\':', err);
  } finally {
    await pool.end();
  }
};

createTable();

