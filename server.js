const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(__dirname +'/client/'));

app.get("/api/:yes", (req, res) => {
    res.json([req.params.yes]);
})

app.listen(process.env.PORT || 3001, console.log(`Server listening on port ${process.env.PORT || 3001}`))