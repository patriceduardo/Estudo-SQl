// server.js (BACKEND - Express + Postgres)

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

/* ======================
   REGISTER
====================== */
app.post('/usuarios', async (req, res) => {
  console.log('REQ BODY:', req.body);

  const { login_usuario, nome_cliente, email_cliente, telefone, senha } = req.body;
  console.log('LOGIN RECEBIDO:', login_usuario);

  if (!login_usuario || !nome_cliente || !email_cliente || !telefone || !senha) {
  
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  }

  try {
        const check = await pool.query(
      `SELECT 1 FROM login WHERE login_usuario = $1 OR email_cliente = $2`,
      [login_usuario, email_cliente]
    );  
    if (check.rows.length > 0) {
      return res.status(400).json({ erro: 'Usuário ou email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO login (login_usuario, nome_cliente, email_cliente, telefone, senha)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id_cliente, login_usuario, nome_cliente, telefone, email_cliente`,
      [login_usuario, nome_cliente, email_cliente, telefone, senhaHash]
    );

    console.log('SALVO NO BANCO:', result.rows[0]);

    return res.json({ mensagem: 'Usuário cadastrado com sucesso', usuario: result.rows[0] });
  } catch (err) {
    console.error('ERRO AO CADASTRAR:', err);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
});



/* ======================
   LISTAR USUÁRIOS
====================== */
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query(`
  SELECT 
    id_cliente,
    nome_cliente,
    email_cliente,
    telefone,
    login_usuario
  FROM login
  ORDER BY id_cliente
`);
    return res.json(result.rows);
  } catch (err) {
    console.error('ERRO AO LISTAR USUÁRIOS:', err);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
});

/* ======================
   EXCLUIR USUÁRIO
====================== */
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM login WHERE id_cliente = $1', [id]);
    return res.json({ mensagem: 'Usuário excluído com sucesso' });
  } catch (err) {
    console.error('ERRO AO EXCLUIR USUÁRIO:', err);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
});

/* ======================
   ATUALIZAR USUÁRIO
====================== */

app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_cliente, email_cliente, telefone, login_usuario } = req.body;

  try {
    await pool.query(
      `UPDATE login
       SET nome_cliente = $1,
           email_cliente = $2,
            login_usuario = $3,
           telefone = $4
       WHERE id_cliente = $5`,
      [nome_cliente, email_cliente, login_usuario, telefone, id]
    );

    return res.json({ mensagem: 'Usuário atualizado com sucesso' });
  } catch (err) {
    console.error('ERRO AO ATUALIZAR USUÁRIO:', err);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
});


/* ======================
   START SERVER
====================== */
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
