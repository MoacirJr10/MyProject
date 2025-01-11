const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../..')));

app.get('/api', (req, res) => {
     res.send('Backend rodando!');
});

app.listen(PORT, () => {
     console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;