const express = require('express');
const app = express();

app.use(require('./test.router'));

module.exports = app;
