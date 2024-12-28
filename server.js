const express = require("express");
const logger = require('morgan');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.use(logger("dev"));

app.use((req, res) => {
    res.status(400).send("Page wasn't found");
});

app.get('/', (req, res) => {
    res.send('Welcome to the Course Registration API!');
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
