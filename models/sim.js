const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const simSchema = new Schema({
    name: { type: String, required: true, unique: true },
    shortName: { type: String, required: true, unique: true },
    icon: { type: String },
    image: { type: String },
    platforms: [{ type: String }]
});

module.exports = mongoose.model('Sim', simSchema);