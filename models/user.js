const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: { type: String },
    properties: {
        name: { type: String, },
        username: { type: String, required: true, unique: true, minlength: 8 },
        email: { type: String, unique: true },
        avatar: { type: String },
        language: { type: String },
        continent: { type: String },
        country: { type: String },
        state: { type: String },
        city: { type: String },
        timezone: { type: String }
      },
    leagues: [{ type: mongoose.Types.ObjectId, ref: 'League' }],
    driverProfiles: [{ type: mongoose.Types.ObjectId, ref: 'Driver' }]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
