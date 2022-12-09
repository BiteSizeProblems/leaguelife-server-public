const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const seriesSchema = new Schema({
    properties: {
        title: { type: String, required: true },
        description: { type: String },
        sim: { type: String, required: true },
        avatar: { type: String },
        rulebook: { type: String }
    },
    league: { type: mongoose.Types.ObjectId, required: true, ref: 'League' },
    divisions: [{ type: mongoose.Types.ObjectId, ref: 'Division' }],
    drivers: [{ type: mongoose.Types.ObjectId, ref: 'Driver' }]
}, { timestamps: true });

module.exports = mongoose.model('Series', seriesSchema);