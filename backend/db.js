import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// open the database file
const db = await open({
  filename: './comments.db',
  driver: sqlite3.Database
});

// create the comments table if it doesn't exist
await db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    parent_id INTEGER,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
  )
`);

export default db;
