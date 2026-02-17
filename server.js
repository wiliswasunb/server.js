import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔐 Configure no Render / .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.post('/relatorios', async (req, res) => {
  try {
    const relatorios = Array.isArray(req.body) ? req.body : [req.body];
    for (const r of relatorios) {
      await pool.query(
        `INSERT INTO relatorios (nome, serie, turma, bimestre, acertos, total, rubrica, data)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [r.nome, r.serie, r.turma, r.fase, r.acertos, r.total, r.rubrica, r.data]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao salvar relatórios' });
  }
});

app.post('/eventos', async (req, res) => {
  try {
    const eventos = Array.isArray(req.body) ? req.body : [req.body];
    for (const e of eventos) {
      await pool.query(
        `INSERT INTO eventos (nome, serie, turma, bimestre, tela, acao, detalhe, data)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [e.nome, e.serie, e.turma, e.bimestre, e.tela, e.acao, e.detalhe, e.data]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao salvar eventos' });
  }
});

app.get('/export/csv', async (req, res) => {
  const { serie, turma, bimestre } = req.query;
  const { rows } = await pool.query(
    `SELECT * FROM relatorios
     WHERE ($1::text IS NULL OR serie = $1)
       AND ($2::text IS NULL OR turma = $2)
       AND ($3::int IS NULL OR bimestre = $3)
     ORDER BY data DESC`,
    [serie || null, turma || null, bimestre ? Number(bimestre) : null]
  );

  const header = 'nome,serie,turma,bimestre,acertos,total,rubrica,data\n';
  const csv = rows.map(r =>
    `${r.nome},${r.serie},${r.turma},${r.bimestre},${r.acertos},${r.total},${r.rubrica},${r.data}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.send(header + csv);
});

app.listen(3000, () => console.log('Backend rodando na porta 3000'));
