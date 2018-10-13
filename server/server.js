require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', require('./router'));

app.use(express.static(path.resolve(__dirname, 'public')));
//app.use(express.static('public'));


mongoose.connect(process.env.DB_URL, { useNewUrlParser: true }, (error, res) => {
    if (error) throw error;
    // eslint-disable-next-line no-console
    console.log(`Conectado a la base de datos: ${res.name}`);

    app.listen(process.env.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Servidor corriendo en ${process.env.APP_URL}`);
    });

});
