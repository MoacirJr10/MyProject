const express = require('express');
const app = express();
const port = 3000;

app.use(express.jason());

app.get('/api/hello', (req, res) => {
    res.jason({ message: 'Hello Frontend!' });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
