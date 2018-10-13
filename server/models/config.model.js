const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let configSchema = new Schema({
    idConfig: {
        type: String
    },
    updated: {
        type: Date,
        default: Date.now
    },
}, { versionKey: false });

module.exports = mongoose.model('Configuration', configSchema);
