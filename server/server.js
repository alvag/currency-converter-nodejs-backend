require('dotenv').config();

const express = require('express');
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('./routes/index.router'));

app.listen(process.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}.`);
});
