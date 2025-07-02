import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM comments ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar comentários:", err);
    res.status(500).json({ error: "Erro ao buscar comentários" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: "Nome e mensagem são obrigatórios" });
    }

    const result = await pool.query(
      "INSERT INTO comments (name, message) VALUES ($1, $2) RETURNING *",
      [name, message]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar comentário:", err);
    res.status(500).json({ error: "Erro ao adicionar comentário" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM comments WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Comentário não encontrado" });
    }

    res.json({ message: `Comentário com ID ${id} removido com sucesso.` });
  } catch (err) {
    console.error("Erro ao deletar comentário:", err);
    res.status(500).json({ error: "Erro ao deletar comentário" });
  }
});

export default router;
