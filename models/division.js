const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const divisionSchema = new Schema({
  properties: {
    title: { type: String, required: true  },
    description: { type: String },
    avatar: { type: String },
  },
  league: { type: mongoose.Types.ObjectId, ref: 'League', required: true },
  series: { type: mongoose.Types.ObjectId, ref: 'Series', required: true },
  seasons: [ { type: mongoose.Types.ObjectId, ref: 'Season' } ],
  drivers: [ { type: mongoose.Types.ObjectId, ref: 'Driver' } ],
  }, { timestamps: true });

module.exports = mongoose.model('Division', divisionSchema);