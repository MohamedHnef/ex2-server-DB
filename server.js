const express = require("express");
const logger = require('morgan');
const app = express();

const port = process.env.PORT || 3000;

const { courseRouter } = require('./routers/courseRouter');
const { studentRouter } = require('./routers/studentRouter');

const { authRouter } = require('./routers/authRouter');
const { authMiddleware } = require('./middlewares/authMiddleware');

app.use(express.json());

app.use(logger("dev"));

app.use('/api/auth', authRouter);
app.use('/api/courses', authMiddleware.verifyToken, courseRouter);
app.use('/api/students', authMiddleware.verifyToken, studentRouter);


app.get('/', (req, res) => {
    res.send('Welcome to the Course Registration API!');
});

app.use((req, res) => {
    res.status(400).send("Page wasn't found");
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
