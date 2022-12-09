const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Driver = require('../models/driver');
const League = require('../models/league');

const getUsersAndLeagues = async(req, res, next) => {

    const { uid } = req.params;

    let users;
    try {
        users = await User.find();
    } catch (err) {
        const error = new HttpError('Fetching users failed, please try again later.', 500);
        return next(error);
    };

    users = users.map((user) => {
        return {
            _id: user.id,
            leagues: user.leagues,
            username: user.properties.username,
            avatar: user.properties.avatar,
            continent: user.properties.continent
        }
    })

    let leagues;
    try {
        leagues = await League.find()
    } catch (err) {
        const error = new HttpError('Fetching leagues failed, please try again later.', 500);
        return next(error);
    };

    leagues = leagues.filter(league => league.properties.isPrivate !== true);

    leagues = leagues.map((league) => {

        let hasPermissions;
        if(league.owner == uid || league.staff.includes(uid)){
            hasPermissions = true;
        } else {
            hasPermissions = false;
        };

        let isMember;
        if(league.members.includes(uid)){
            isMember = true;
        } else {
            isMember = false;
        }

        return {
            hasPermissions: hasPermissions,
            isMember: isMember,
            _id: league._id,
            drivers: league.drivers.length,
            title: league.properties.title,
            acronym: league.properties.acronym,
            tagline: league.properties.tagline,
            region: league.properties.region,
        }
    });

    res.json({ users: users, leagues: leagues });
};

const getLeaguesForInvite = async(req, res, next) => {
    const userId = req.params.uid;

    let leagues;
    try {
        leagues = await League.find({ 
            $or: [{ owner : userId }, { staff : userId }]
         })
    } catch (err) {
        const error = new HttpError('Error: Could not find any leagues owned by this user.', 500);
        return next(error);
    };

    if (!leagues) {
        const error = new HttpError('Could not find any leagues owned by a user with this ID.', 404);
        return next(error);
    };

    leagues = leagues.map((league) => {
        return {
            _id: league._id,
            title: league.properties.title
        }
    });

    res.json({ leagues: leagues });
};

exports.getUsersAndLeagues = getUsersAndLeagues;
exports.getLeaguesForInvite = getLeaguesForInvite;