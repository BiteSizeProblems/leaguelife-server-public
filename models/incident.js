const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const incidentSchema = new Schema({
  incident: {
    season: { type: mongoose.Types.ObjectId, ref: 'Season', required: true },
    event: { type: mongoose.Types.ObjectId, ref: 'Event', required: true },
    lap: { type: Number, required: true  },
    author: { type: mongoose.Types.ObjectId, ref: 'Driver', required: true },
    offence: { type: String, required: true  },
    description: { type: String, required: true  },
    offenders: [{ type: mongoose.Types.ObjectId, ref: 'Driver', required: true  }],
    evidence: { type: String, required: true  },
  },
  refs: {
    league: { type: mongoose.Types.ObjectId, ref: 'League', required: true },
    series: { type: mongoose.Types.ObjectId, ref: 'Series', required: true },
    division: { type: mongoose.Types.ObjectId, ref: 'Division', required: true }
  }
  }, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);