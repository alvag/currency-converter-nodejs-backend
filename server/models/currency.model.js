const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let currencySchema = new Schema({
    id: {
        type: String
    },
    currencyName: {
        type: String
    },
    currencySymbol: {
        type: String
    },
    flag: {
        type: String,
        default: '_unknown.png'
    }
}, { versionKey: false });

module.exports = mongoose.model('Currency', currencySchema);
