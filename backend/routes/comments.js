import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM comments ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { name, message } = req.body;
  const result = await pool.query(
    "INSERT INTO comments (name, message) VALUES ($1, $2) RETURNING *",
    [name, message]
  );
  res.json(result.rows[0]);
});

export default router;
