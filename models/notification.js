const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  title: { type: String, required: true }, // League Invite
  subject: { type: String, required: true }, // The Gravel Trap
  type: { type: String, required: true }, // Initial / Response
  reference: { type: String, required: true }, // recipientId-authorId
  author: { type: String, ref: 'User', required: true },
  recipient: { type: String, ref: 'User', required: true },
  league: { type: mongoose.Types.ObjectId, ref: 'League' },
  content: { type: String },
  read: {type: Boolean, default: false },
  applicationResponse: { type: String },
  additionalContent: { type: String }
}, { timestamps: true });

notificationSchema.virtual('notificationAuthor', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true
});

notificationSchema.virtual('notificationRecipient', {
  ref: 'User',
  localField: 'recipient',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Notification', notificationSchema);