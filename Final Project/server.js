const express = require('express');
const app = express();
const port = process.env.PORT || 80;
const path = require('path');

// app.use(express.static(path.join(__dirname , 'assets')));
app.use(express.static(path.join(__dirname , '/dist')));


app.listen(port, () => console.log(`Game is running at http://localhost:${port}`))