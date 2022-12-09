const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DriverSchema = new Schema({
  link: { type: String, ref: 'User' },
  tags: [{ type: String }],
  active: { type: Boolean, default: true },
  properties: {
    discordId: { type: String },
    username: { type: String },
    nickname: { type: String },
    preferredName: { type: String },
    avatar: { type: String, default: '' },
  },
  record: {
    races: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    podiums: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    retirements: { type: Number, default: 0 },
  },
  license: {
    status: { type: String, default: 'active'}, // active/pending/suspended
    points: { type: Number, default: 0 },
    incidents: { type: mongoose.Types.ObjectId, ref: 'Incident' },
  },
  refs: {
    series: [{ type: mongoose.Types.ObjectId, ref: 'Series' }],
    divisions: [{ type: mongoose.Types.ObjectId, ref: 'Division' }],
    seasons: [{ type: mongoose.Types.ObjectId, ref: 'Season' }],
    events: [{ type: mongoose.Types.ObjectId, ref: 'Event' }],
  },
  league: { type: mongoose.Types.ObjectId, ref: 'League' },
}, { timestamps: true });

DriverSchema.virtual('linkedUser', {
  ref: 'User',
  localField: 'link',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Driver', DriverSchema);