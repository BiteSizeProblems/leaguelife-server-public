const HttpError = require('../models/http-error');
const User = require('../models/user');
const Driver = require('../models/driver');
const League = require('../models/league');
const Notification = require('../models/notification');
const mongoose = require('mongoose');

// GET

const getUserById = async(req, res, next) => {
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findOne({ _id: userId });
  } catch (err) {
    const error = new HttpError('Fetching this user failed, please try again later.', 500);
    return next(error);
  };

  res.json({ user: user.toObject( {getters: true }) }); 
};

const getNotifications = async(req, res, next) => {
  const userId = req.params.uid;

  let notifications;
  try {
    notifications = await Notification.find( { $or: [ { author: userId }, { recipient: userId } ] } );
  } catch (err) {
      const error = new HttpError('Fetching notifications failed. Please try again later.', 500);
      return next(error);
  };

  if (!notifications) {
    const error = new HttpError('Could not find any notifications for this user.', 404);
    return next(error);
  };

  const sent = notifications.filter(notification => notification.author == userId);
  const received = notifications.filter(notification => notification.recipient == userId);

  res.json({
    sent: sent.map(notification => notification.toObject({ getters: true })), 
    received: received.map(notification => notification.toObject({ getters: true }))
  });
};

const getLeagueByUserId = async(req, res, next) => {
  const { uid } = req.params;

  let leagues;
  try {
    leagues = await League.find({ $or: [ { owner: uid }, {staff: uid }, {members: uid }] });
  } catch (err) {
      const error = new HttpError('Fetching this user failed, please try again later.', 500);
      return next(error);
  };

  res.json({leagues: leagues.map(league => league.toObject({ getters: true }))}); 
}

// POST

const respondToInvitation = async(req, res, next) => {
  const userId = req.params.uid;
  const { original, response } = req.body;

  let message;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    message = await Notification.findById(original.id)
    await sess.commitTransaction();
  } catch (err) {
      console.log('err', err);
      const error = new HttpError('Error: Could not find the original message.', 500);
      return next(error);
  };

  if(response === "accepted") {

    if (original.additionalContent == 'staff') {

      try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await League.updateOne({id: original.league},{$push:{members: userId}});
        await League.updateOne({id: original.league},{$push:{staff: userId}});
        await User.updateOne(
          { _id : userId },
          { $push : { leagues: original.league } }
          );
        await message.remove();
        await sess.commitTransaction();
      } catch (err) {
          console.log('err', err);
          const error = new HttpError('Error: Could not process this response.', 500);
          return next(error);
      }

    } else {

      try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await League.updateOne({id: original.league},{$push:{members: userId}});
        await User.updateOne({ _id : userId },{ $push : { leagues: original.league } });
        await message.remove();
        await sess.commitTransaction();
      } catch (err) {
          console.log('err', err);
          const error = new HttpError('Error: Could not process this response.', 500);
          return next(error);
      }

    }

  } else {
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await message.remove();
      await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not delete the original message.', 500);
        return next(error);
    }
  }

  res.status(201).json({response: "Notification Response: Received"});
};

const applyToLeague = async (req, res, next) => {

  const { applicantId, application, league } = req.body;

  if (league.isMember == false) {

    let newApplication = new Notification({
      title: 'League Application',
      subject: `${application.username} would like to join ${league.title}`,
      type: 'Initial',
      reference: `${applicantId}.${league._id}`,
      author: applicantId,
      recipient: league._id,
      league: league._id,
      content: `Please review the application details and provide a response to their request.`,
    });

    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await newApplication.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      console.log('err', err);
      const error = new HttpError('Error: Could send this invitation.', 500);
      return next(error);
    }

    res.status(201).json({notification: newApplication});

  } else {
    res.status(201).json({Error: 'You are already a member of this league.'});
  }
}

// PATCH

const patchUser = async(req, res, next) => {
  const userId = req.params.uid;
  const { name, city, state, country, continent } = req.body;

    let user;
    try {
      user = await User.findOne({ _id: userId });
    } catch (err) {
        const error = new HttpError('Fetching this user failed, please try again later.', 500);
        return next(error);
    };

    if(!user) {
      const error = new HttpError('Could not find this user.', 404);
      return next(error);
    };

    user.properties.name = name;
    user.properties.city = city;
    user.properties.state = state;
    user.properties.country = country;
    user.properties.continent = continent;

    try {
      await user.save();
    } catch (err) {
        const error = new HttpError('Could not update this user profile.', 500);
        return next(error);
    };

    res.json({ user: user.toObject( {getters: true }) }); 
};

const leaveLeague = async(req, res, next) => {
  const { uid, lid } = req.params;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await User.updateOne({ _id: uid }, { $pull: { leagues: lid } })
    await League.updateOne({ _id: lid }, { $pull: { staff: uid, members: uid } })
    await Driver.updateOne({ link: uid }, { $unset: { link: "" } })
    await sess.commitTransaction();
  } catch (err) {
   console.log('err', err);
   const error = new HttpError('Error: Could not leave this league', 500);
   return next(error);
  };

  res.json({Message: 'Successfully left this league'}); 
};

// DELETE

const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;

  try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await User.deleteOne({ session: sess, _id: userId });
      await Driver.updateMany({ session: sess, link: userId }, {$pull: {link: userId}});
      await League.updateMany({ session: sess }, { $pull: { $or: [{ staff: userId }, { users: userId }] } });
      await Notification.deleteMany({ session: sess, $or: [{ author: userId }, { recipient: userId }] });
      await sess.commitTransaction();
    } catch (err) {
     const error = new HttpError('Error: Could not delete this user.', 500);
     return next(error);
    }

  res.status(200).json({message: 'Successfully deleted this user account.' });
};

exports.getUserById = getUserById;
exports.getNotifications = getNotifications;
exports.getLeagueByUserId = getLeagueByUserId;
exports.respondToInvitation = respondToInvitation;
exports.applyToLeague = applyToLeague;
exports.patchUser = patchUser;
exports.leaveLeague = leaveLeague;
exports.deleteUser = deleteUser;