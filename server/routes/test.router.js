const express = require('express');
const app = express();
const testController = require('../controllers/test.controller');

app.get('/test', testController.get);

module.exports = app;
