import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
  res.send("Servidor do App de Artes online 🚀");
});

app.post("/acoes", async (req, res) => {
  const { aluno, turma, serie, acao, dados } = req.body;

  try {
    await pool.query(
      `INSERT INTO acoes (aluno, turma, serie, acao, dados)
       VALUES ($1, $2, $3, $4, $5)`,
      [aluno, turma, serie, acao, dados]
    );

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar ação" });
  }
});

app.get("/relatorios", async (req, res) => {
  const { turma, serie } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM acoes WHERE turma = $1 AND serie = $2 ORDER BY id DESC`,
      [turma, serie]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar relatórios" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
