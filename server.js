const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: '',
    host: '',
    database: '',
    password: '',
    port: 5432,
    ssl: true
});

app.get('/pessoas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM TB_PESSOA');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro no servidor");
    }
});

app.post('/pessoas', async (req, res) => {
    const { nome_completo, documento, data_nascimeanto, genero, telefone, cep } = req.body;

    try {
        const query = `
            INSERT INTO TB_PESSOA (nome_completo, documento, data_nascimeanto, genero, telefone, cep)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await pool.query(query, [
            nome_completo,
            documento,
            data_nascimeanto,
            genero, telefone,
            cep
        ]);

        res.status(201).send("Pessoa cadastrada com sucesso!");

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao salvar no banco");
    }
});

app.delete('/pessoas/:documento', async (req, res) => {
    const { documento } = req.params;

    try {
        await pool.query("DELETE FROM TB_PESSOA WHERE documento = $1", [documento]);
        res.send("Pessoa deletada");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao deletar");
    }
});



app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
