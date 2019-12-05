require('./db/mongoose');
const express = require('express');

const UserRouter = require('./routers/user');
const TaskRouter = require('./routers/task');
const app = express();

app.use(express.json());
app.use(UserRouter);
app.use(TaskRouter);

module.exports = app;