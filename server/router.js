const express = require('express');
const app = express();
const currencyController = require('./controllers/currency.controller');

app.get('/getCountries', currencyController.getCountries);

module.exports = app;
