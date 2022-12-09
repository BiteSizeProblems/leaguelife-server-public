const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  properties: {
    title: { type: String, required: true, default: 'Unknown'  },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: { type: String, default: 'scheduled'  },
    isSprint: { type: Boolean, default: false  },
    halfPoints: { type: Boolean, default: false  },
    backgroundColor: { type: String, default: 'green'  },
    resultsEntered: { type: Boolean, default: false }
  },
  drivers: [{
    _id: { type: String, required: true }, 
    username: {type: String }, 
    attendance: {type: String, default: 'Attended' },
    role: {type: String, default: 'Full-Time' },
    team: {type: String, default: 'None' },
    result: {
      qualifying: {type: Number, default: 0 },
      sprint: {type: Number, default: 0 },
      race: {type: Number, default: 0 },
      points: {type: Number, default: 0 },
      fastestLap: { type: Boolean, default: false },
      finished: {type: Boolean, default: true }
    },
    incidents: {
      warning: { type: Boolean, default: false },
      penalty: { type: Boolean, default: false },
      penaltyAwarded: { type: String },
      description: { type: String },
    }
  }, { toJSON: { virtuals: true }, toObject: { virtuals: true }}],
  summary: {
    pole: {type: String, default: 'pending' },
    winner: {type: String, default: 'pending' },
    fastestLap: {type: String, default: 'pending' },
  },
  league: { type: mongoose.Types.ObjectId, ref: 'League', required: true  },
  series: { type: mongoose.Types.ObjectId, ref: 'Series' },
  season: { type: mongoose.Types.ObjectId, ref: 'Season', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);