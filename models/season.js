const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const seasonSchema = new Schema({
  properties: {
    identifier: { type: Number, required: true },
    title: { type: String, required: true },
    status: { type: String, required: true },
    isRecruiting: { type: Boolean, required: true },
  },
  drivers: [{
    _id: { type: String },
    username: { type: String, default:'...' },
    status: { type: String, default:'Active' },
    role: { type: String, default:'Full-Time' },
    team: { type: String, default:'unassigned' },
    bestFinish: { type: Number },
    bestGrid: { type: Number },
    fastestLaps: { type: Number, default: 0 },
    finishes: { type: Number, default: 0 },
    podiums: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    poles: { type: Number, default: 0},
    races: { type: Number, default: 0 },
    wins: { type: Number, default: 0 }
  }, { toJSON: { virtuals: true }, toObject: { virtuals: true }}],
  league: { type: mongoose.Types.ObjectId, ref: 'League', required: true },
  series: { type: mongoose.Types.ObjectId, ref: 'Series', required: true },
  division: { type: mongoose.Types.ObjectId, ref: 'Division', required: true },
  events: [{ type: mongoose.Types.ObjectId, ref: 'Event' }],
}, { timestamps: true });

module.exports = mongoose.model('Season', seasonSchema);