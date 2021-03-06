const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let countrySchema = new Schema({
    alpha3: {
        type: String
    },
    currencyId: {
        type: String
    },
    currencyName: {
        type: String
    },
    currencySymbol: {
        type: String
    },
    id: {
        type: String
    },
    name: {
        type: String
    }
}, { versionKey: false });

module.exports = mongoose.model('Country', countrySchema);
