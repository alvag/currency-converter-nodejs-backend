const express = require('express');
const app = express();
const currencyController = require('./controllers/currency.controller');

/* app.get('/getCountries', currencyController.getCountries); */
app.get('/getCurrencies', currencyController.getCurrencies);

module.exports = app;
