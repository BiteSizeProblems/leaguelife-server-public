const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const HttpError = require('../models/http-error');

/*
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
*/

const User = require('../models/user');
const Driver = require('../models/driver');
const League = require('../models/league');
const Series = require('../models/series');
const Division = require('../models/division');
const Season = require('../models/season');
const Event = require('../models/event');
const Notification = require('../models/notification');
//const Incident = require('../models/incident');
//const getPoints = require('../middleware/get-points');

const flattenObject = (obj) => {
    const flattened = {}

    Object.keys(obj).forEach((key) => {
        const value = obj[key]
    
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(flattened, flattenObject(value))
        } else {
          flattened[key] = value
        }
    })
    
    return flattened
}
 
// Driver

const createDriver = async (req, res, next) => {
    const leagueId = req.params.lid;

    const { link, username, tags } = req.body;

    let linkId, avatar;
    if (link) {
        linkId = link.id;
        avatar = link.avatar;
    }

    const createdDriver = new Driver({
        link: linkId,
        properties: {
            username: username,
            nickname: '',
            preferredName: username,
            avatar: avatar
        },
        tags: tags,
        league: leagueId
   });

   let league;
   try {
    league = await League.findById(leagueId);
   } catch (err) {
    console.log('err', err);
    const error = new HttpError('Could not find this league.', 500);
    return next(error);
   };

   if (!league) {
    const error = new HttpError('Could not find this league.', 404);
    return next(error);
   };

   try {
     const sess = await mongoose.startSession();
     sess.startTransaction();
     await createdDriver.save({ session: sess });
     league.drivers.push(createdDriver);
     await league.save({ session: sess });
     await sess.commitTransaction();
   } catch (err) {
    console.log('err', err);
    const error = new HttpError('Error: Could not save this driver.', 500);
    return next(error);
   }
    
    res.status(201).json({driver: createdDriver});
};

const getDriversByLeagueId = async (req, res, next) => {
    const leagueId = req.params.lid;

    let leagueDrivers;
    try {
        leagueDrivers = await Driver.find({ 'refs.league': leagueId });
    } catch (err) {
        const error = new HttpError('Fetching league drivers failed, please try again later.', 500);
        return next(error);
    };

    res.json({drivers: leagueDrivers.map(driver => driver.toObject({ getters: true }))});
};

const getMembersByLeagueId = async (req, res, next) => {
    const leagueId = req.params.lid;

    let league;
    try {
        league = await League.findById(leagueId);
    } catch (err) {
        const error = new HttpError('Fetching this league failed, please try again later.', 500);
        return next(error);
    };

    let members;
    try {
        members = await User.find({ 'leagues': leagueId });
    } catch (err) {
        const error = new HttpError('Fetching league members failed, please try again later.', 500);
        return next(error);
    };

    members = members.map((member) => {
        return {
            id: member.id,
            name: member.properties.name,
            username: member.properties.username,
            email: member.properties.email,
            avatar: member.properties.avatar,
            city: member.properties.city,
            state: member.properties.state,
            country: member.properties.country,
            continent: member.properties.continent,
            driverProfiles: member.driverProfiles,
            leagues: member.leagues
        }
    });

    let drivers;
    try {
        drivers = await Driver.find({ 'league': leagueId });
    } catch (err) {
        const error = new HttpError('Fetching league drivers failed, please try again later.', 500);
        return next(error);
    };

    const staff = members.filter(member => league.staff.includes(member.id));

    res.json({ members: members, staff: staff, drivers: drivers });
};

const discordImportDrivers = async (req, res, next) => {
    const leagueId = req.params.lid;
    const { drivers } = req.body;

    const createdDrivers = drivers.map((driver) => {
        let createdDriver = new Driver ({
                link: driver.link,
                tags: driver.tags,
                properties: {
                    discordId: driver.id,
                    username: driver.username,
                    nickname: driver.nickname,
                    preferredName: driver.preferredName,
                    avatar: driver.avatar,
                },
                record: {
                    races: 0,
                    wins: 0,
                    podiums: 0,
                    points: 0,
                    retirements: 0,
                },
                license: {
                    status: 'active',
                    points: 0
                },
                refs: {
                    series: [],
                    divisions: [],
                    seasons: [],
                    events: [],
                },
                league: leagueId
        })
        return createdDriver;
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await Driver.insertMany(createdDrivers);
        await League.updateOne({ id: leagueId }, { $push: { 'drivers' : createdDrivers } });
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not import these drivers', 500);
        return next(error);
    }
    
    res.status(201).json({drivers: createdDrivers});
};

const excelImportDrivers = async (req, res, next) => {
    const leagueId = req.params.lid;
    const { drivers } = req.body;

    const createdDrivers = drivers.map((driver) => {
        let createdDriver = new Driver ({
                tags: driver.tags,
                properties: {
                    username: driver.username,
                    nickname: driver.nickname,
                    preferredName: driver.preferredName,
                    avatar: driver.avatar,
                },
                record: {
                    races: 0,
                    wins: 0,
                    podiums: 0,
                    points: 0,
                    retirements: 0,
                },
                license: {
                    status: 'active',
                    points: 0
                },
                refs: {
                    series: [],
                    divisions: [],
                    seasons: [],
                    events: [],
                },
                league: leagueId
        })
        return createdDriver;
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await Driver.insertMany(createdDrivers);
        await League.updateOne({ id: leagueId }, { $push: { 'drivers' : createdDrivers } });
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not import these drivers', 500);
        return next(error);
    }
    
    res.status(201).json({drivers: createdDrivers});
};

const inviteDriver = async (req, res, next) => {

    const { title, subject, type, author, additionalContent, recipient, league } = req.body;

    console.log(req.body);

    let invite = new Notification({
        title,
        subject,
        type,
        reference: `${recipient}.${league}`,
        author,
        recipient,
        league,
        content: "",
        additionalContent
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await invite.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could send this invitation.', 500);
        return next(error);
    }
    
    res.status(201).json({notification: invite});
}

const removeDriver = async (req, res, next) => {
    const driverId = req.params.drivid;
    const leagueId = req.params.lid;

    let thisDriver;
    try {
        thisDriver = await Driver.findById(driverId);
    } catch (err) {
        const error = new HttpError('Error: Could not find this driver.', 500);
        return next(error);
    };

    let league;
    try {
        league = await League.findById(leagueId);
    } catch (err) {
        const error = new HttpError('Error: Could not find this league.', 500);
        return next(error);
    };

    try {
        await thisDriver.remove();
        league.drivers.pull(thisDriver);
        await league.save();
    } catch (err) {
        const error = new HttpError('Error: Could not find this driver.', 500);
        return next(error);
    };

    res.status(200).json({message: 'This driver has been successfully deleted.' });
};

const getNonEnrolledDriversForSeasonByDivision = async (req, res, next) => {
    console.log("getNonEnrolledDriversForSeasonByDivision");
    const divisionid = req.params.did;

    let divisionWithDrivers
    try {
        divisionWithDrivers = await Division.findById(divisionid).populate('drivers');
        seasonWithEvents = await Season.findById(seasonId).populate({path: 'drivers', match: { complete: true }});
    } catch (err) {
        const error = new HttpError('Error: Could not find any drivers for this division.', 500);
        return next(error);
    };

    if (!divisionWithDrivers) {
        const error = new HttpError('Could not find drivers for the provided division id.', 404);
        return next(error);
    };

    res.json({ drivers: divisionWithDrivers.drivers.map(driver => driver.toObject({getters: true})) });
};

// Notifications

const getNotificationsByLeagueId = async (req, res, next) => {
    const leagueId = req.params.lid;

    //const userId = req.params.uid;

    let notifications;
    try {
      notifications = await Notification.find( { $or: [ { author: leagueId }, { recipient: leagueId }, { league: leagueId} ] } );
    } catch (err) {
        const error = new HttpError('Fetching notifications failed. Please try again later.', 500);
        return next(error);
    };
  
    if (!notifications) {
      const error = new HttpError('Could not find any notifications for this league.', 404);
      return next(error);
    };
  
    const sent = notifications.filter(notification => notification.author == leagueId);
    const received = notifications.filter(notification => notification.recipient == leagueId);
  
    res.json({
      sent: sent.map(notification => notification.toObject({ getters: true })), 
      received: received.map(notification => notification.toObject({ getters: true }))
    });
};

const respondToNotification = async (req, res, next) => {
    console.log("Responding...");

    const { lid, nid } = req.params;
    const { originalMessage, response } = req.body;

    let message;
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        message = await Notification.findById(nid);
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not find the original message.', 500);
        return next(error);
    };
    
    if (originalMessage.title == 'League Application') {
        const applicantId = originalMessage.author;

        if (response == 'approve') {

            try {
                const sess = await mongoose.startSession();
                sess.startTransaction();
                await League.updateOne({id: lid},{$push: {members: applicantId}});
                await User.updateOne({_id: applicantId},{$push: {leagues: lid}});
                await message.remove();
                await sess.commitTransaction();
            } catch (err) {
                const error = new HttpError('Error: Could not add this user to the league.', 500);
                return next(error);
            }

        } else {

            try {
                const sess = await mongoose.startSession();
                sess.startTransaction();
                await message.remove();
                await sess.commitTransaction();
            } catch (err) {
                const error = new HttpError('Error: Could not delete this notification.', 500);
                return next(error);
            }

        }
    };
};

// League

const getLeagueById = async (req, res, next) => {
    const leagueId = req.params.lid;

    let league;
    try {
        league = await League.findById(leagueId);
    } catch (err) {
        const error = new HttpError('Error: Could not find a league with this ID.', 500);
        return next(error);
    }
    
    if (!league) {
        const error = new HttpError('Could not find a league for the provided league id.', 404); // throw cancels subsequent execution(s)
        return next(error);
    }

    let events;
    try {
        events = await Event.find({ league: leagueId });
    } catch (err) {
        const error = new HttpError('Error: Could not find any events for this league.', 500);
        return next(error);
    }
    
    res.json({ league: league.toObject( {getters: true }), events: events }); // => { league } => { league: league }
};

const createLeague = async (req, res, next) => { // ACTIVE
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please try again...', 422));
    };

    const { title, acronym, tagline, description, region, owner } = req.body;

    const createdLeague = new League({
        properties: {
            title,
            acronym,
            tagline,
            description,
            region
        },
        owner,
        staff: [owner],
        members: [owner],
        drivers: [],
        series: [],
        events: []
   });

   let leagueOwner;
   try {
    leagueOwner = await User.findOne({ _id: owner });
   } catch (err) {
    console.log('err', err);
    const error = new HttpError('Creating your league failed, please try again.', 500);
    return next(error);
   }

   if (!leagueOwner) {
    const error = new HttpError('Could not find a user with this id.', 404);
    return next(error);
   }

   try {
     const sess = await mongoose.startSession();
     sess.startTransaction();
     await createdLeague.save({ session: sess });
     leagueOwner.leagues.push(createdLeague);         
     await leagueOwner.save({ session: sess });
     await sess.commitTransaction();
   } catch (err) {
    console.log('err', err);
    const error = new HttpError('Error: Could not save this league.', 500);
    return next(error);
   }
    
    res.status(201).json({league: createdLeague});
};

const updateLeague = async (req, res, next) => {
    const leagueId = req.params.lid;
    const { title, acronym, tagline, description, region, guildId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please try again...', 422));
    }

    let league;
    try {
        league = await League.findById(leagueId);
    } catch (err) {
        const error = new HttpError('Error: Could not find a league with this ID.', 500);
        return next(error);
    };

    league.properties.title = title;
    league.properties.acronym = acronym;
    league.properties.tagline = tagline;
    league.properties.description = description;
    league.properties.region = region;
    league.properties.guildId = guildId;

    try {
        await League.updateOne(
            {_id: leagueId},
            { $set: league }
            )
    } catch (err) {
        const error = new HttpError('Could not update this league.', 500);
        return next(error);
    }

    res.status(200).json({league: league.toObject({ getters: true })});
};

const removeMemberFromLeague = async (req, res, next) => {
    const { lid, mid } = req.params;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await League.updateOne({ id: lid },{ $pull: { members: mid } });
        await User.updateOne({ _id: mid },{ $pull: { leagues: lid } });
        await message.remove();
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Error: Could not remove this member from the league.', 500);
        return next(error);
    }

    res.status(201).json({Message: "This member has been successfully removed from the league."});
};

const updateLeagueDriver = async (req, res, next) => {
    const { driver, leagueId } = req.body;

    let leagueDriver;
    try {
        leagueDriver = await Driver.findById(driver.id);
    } catch (err) {
        const error = new HttpError('Error: Could not find a driver with this ID.', 500);
        return next(error);
    };

    leagueDriver.assignments.roles = driver.roles;
    leagueDriver.assignments.tags = driver.tags;

    try {
        await leagueDriver.save();
    } catch (err) {
        const error = new HttpError('Could not update this driver.', 500);
        return next(error);
    }

    res.status(200).json({driver: leagueDriver.toObject({ getters: true })});
};

const deleteLeague = async (req, res, next) => {
    const leagueId = req.params.lid;
    
    let league;
    try {
        league = await League.findById(leagueId);
    } catch (err) {
        const error = new HttpError('Error: Something went wrong, could not find this league.', 500);
        return next(error);
    };

    if (!league) {
        const error = new HttpError('Could not find a league for this ID.', 404);
        return next(error);
    };

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await league.remove({ session: sess }); 
        // owner
        await User.updateMany({  }); // staff
        await Driver.deleteMany({ 'refs.league': leagueId });
        await Series.deleteMany({ session: sess, 'refs.league': leagueId });
        await Division.deleteMany({ session: sess, 'refs.league': leagueId });
        await Season.deleteMany({ session: sess, 'refs.league': leagueId });
        await Event.deleteMany({ session: sess, 'refs.league': leagueId });
        await sess.commitTransaction();
      } catch (err) {
       const error = new HttpError('Error: Could not delete this league and related documents', 500);
       return next(error);
      }

    res.status(200).json({message: 'Deleted league and all related documents.' });
};

// Series

const getSeriesById = async (req, res, next) => {
    const leagueId = req.params.lid;
    const seriesId = req.params.sid;

    let series;
    try {
        series = await Series.findById(seriesId).
            populate({ path: 'divisions' }).
            populate({ path: 'drivers' });
    } catch (err) {
        const error = new HttpError('Error: Could not find a series with this ID.', 500);
        return next(error);
    }
    
    if (!series) {
        const error = new HttpError('Could not find a series for the provided id.', 404);
        return next(error);
    };

    let divisions;
    try {
        divisions = await Division.find({ series : seriesId })
                            .populate('seasons')
                            .populate('drivers');
    } catch (err) {
        const error = new HttpError('Error: Could not find a series with this ID.', 500);
        return next(error);
    };

    divisions = divisions.map((division) => {
        return {
            id: division._id,
            title: division.properties.title,
            description: division.properties.description,
            avatar: division.properties.avatar,
            league: division.league,
            series: division.series,
            seasons: division.seasons,
            drivers: division.drivers
        };
    });

    const drivers = series.drivers;

    // return flattenObject(driver) <--- Keep for future reference!!!!! <--- must be mapped!

    let seriesDriverIds = drivers.map(driver => driver._id.toString());

    let leagueDrivers;
    try {
        leagueDrivers = await Driver.find({ 'league' : leagueId });
    } catch (err) {
        const error = new HttpError('Error: Could not find a series with this ID.', 500);
        return next(error);
    };

    leagueDrivers = leagueDrivers.filter(driver => !seriesDriverIds.includes(driver._id.toString()));
    
    res.json({ 
        series: series.toObject( {getters: true }), 
        divisions: divisions, 
        drivers: drivers, 
        leagueDrivers: leagueDrivers 
    });
};

const getSeriesByLeagueId = async (req, res, next) => {
    const leagueId = req.params.lid;

    let series;
    try {
        series = await Series.find({ 'league' : leagueId })
        .populate({ path: 'divisions' })
    } catch (err) {
        const error = new HttpError('Fetching series for this league failed, please try again later.', 500);
        return next(error);
    };

    series = series.map((series) => {
        return {
            id: series.id,
            title: series.properties.title,
            description: series.properties.description,
            sim: series.properties.sim,
            avatar: series.properties.avatar,
            rulebook: series.properties.rulebook,
            league: series.league,
            divisions: series.divisions,
            drivers: series.drivers
        }
    });

    res.json({seriesList: series });
};

const createSeries = async (req, res, next) => {

    const leagueId = req.params.lid;
    const { title, league, description, sim } = req.body;

    const createdSeries = new Series({
        properties: {
            title,
            description,
            sim,
            avatar: undefined,
            rulebook: undefined
        },
        league,
        divisions: [],
        drivers: []
   });

   let parentLeague;
   try {
    parentLeague = await League.findById(leagueId);
   } catch (err) {
    console.log('err', err);
    const error = new HttpError('Could not find a parent league to place this series.', 500);
    return next(error);
   };

   if (!parentLeague) {
    console.log('err', err);
    const error = new HttpError('Could not find a league for this ID.', 404);
    return next(error);
   };

   try {
     const sess = await mongoose.startSession();
     sess.startTransaction();
     await createdSeries.save({ session: sess });
     parentLeague.series.push(createdSeries);
     await parentLeague.save({ session: sess });
     await sess.commitTransaction();
   } catch (err) {
    console.log('err', err);
    const error = new HttpError('Error: Could not save this league', 500);
    return next(error);
   };
    
    res.status(201).json({series: createdSeries});
};

const updateSeries = async (req, res, next) => {
    console.log("updateSeries");
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please try again...', 422));
    }

    const newData = req.body.series;
    const seriesId = newData.id;

    let series;
    try {
        series = await Series.findById(seriesId);
    } catch (err) {
        const error = new HttpError('Error: Could not find any series with this ID.', 500);
        return next(error);
    };

    series.properties.title = newData.title;
    series.properties.description = newData.description;
    series.drivers = newData.drivers;

    try {
        await series.save();
    } catch (err) {
        const error = new HttpError('Could not update this series.', 500);
        return next(error);
    }

    res.status(200).json({series: series.toObject({ getters: true })});
};

const addDriversToSeries = async (req, res, next) => {
    const seriesId = req.params.sid;

    const { drivers } = req.body;

    console.log(drivers);

    if ( drivers ) {
        let loadedDrivers = drivers.map(driver => driver._id);

        console.log("is drivers")

        let series;
        try {
            series = await Series.findById(seriesId);
        } catch (err) {
            const error = new HttpError('Could not find this series.', 500);
            return next(error);
        };

        if (!series) {
            const error = new HttpError('Could not find a series with the provided ID.', 404);
            return next(error);
        };

        try {
            await Series.updateOne({id: seriesId}, { $set: { drivers: drivers } } )
        } catch (err) {
            const error = new HttpError('Could not add the selected drivers to this series.', 500);
            return next(error);
        }; 

        res.status(200).json({message: 'driver(s) successfully added to this series.' });
    }
};

const removeDriverFromSeries = async (req, res, next) => {
    const driverId = req.params.drivid;
    const seriesId = req.params.sid;

    let series;
    try {
        series = await Series.findById(seriesId);
    } catch (err) {
        const error = new HttpError('Error: Could not find this series.', 500);
        return next(error);
    };

    try {
        series.drivers.pull(driverId);
        await series.save();
    } catch (err) {
        const error = new HttpError('Error: Could not remove this driver from the series.', 500);
        return next(error);
    };

    res.status(200).json({message: 'This driver has been successfully removed from the series.' });
};

const deleteSeries = async (req, res, next) => {
    const leagueId = req.params.lid;
    const seriesId = req.params.sid;

    let series;
    try {
        series = await Series.findById(seriesId).populate('league');
    } catch (err) {
        const error = new HttpError('Error: Could not find any series with this ID.', 500);
        return next(error);
    };

    if (!series) {
        const error = new HttpError('Could not find a series for this ID.', 404);
        return next(error);
    };

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await series.remove({ session: sess });
        await League.updateOne(
            { id: leagueId },
            { $pull: { 'series': seriesId } }
        );

        await Division.deleteMany({ session: sess, 'series': seriesId });

        await Season.deleteMany({ session: sess, 'series': seriesId });

        await sess.commitTransaction();
      } catch (err) {
       const error = new HttpError('Error: Could not delete this series', 500);
       return next(error);
      }

    res.status(200).json({message: 'Deleted series.' });
};

// Division

const createDivision = async (req, res, next) => {
    const leagueId = req.params.lid;
    const seriesId = req.params.sid;
    const { title, description } = req.body;

    const createdDivision = new Division({
        properties: {
            title,
            description,
            avatar: undefined,
        },
        league: leagueId,
        series: seriesId,
        seasons: [],
        drivers: [],
    });

    let parentSeries;
    try {
        parentSeries = await Series.findById(seriesId);
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Creating division failed, please try again', 500);
        return next(error);
    }

    if (!parentSeries) {
        const error = new HttpError('Could not find series for provided id', 404);
        return next(error);
    };

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdDivision.save({ session: sess });
        parentSeries.divisions.push(createdDivision);
        await parentSeries.save();
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not save this division', 500);
        return next(error); 
    }
    
    res.status(201).json({division: createdDivision});
};

const updateDivision = async (req, res, next) => {
    const divisionId = req.params.did;
    const { division } = req.body;

    try {
        await Division.updateOne(
            {_id : divisionId}, 
            {
                $set: {
                    'properties.title': division.title,
                    'properties.description': division.description,
                    'drivers': division.drivers
                }
            }
        )
    } catch (err) {
        const error = new HttpError('Could not update this division.', 500);
        return next(error);
    }

    res.status(200).json({division: division});
};

const addDriversToDivision = async (req, res, next) => {
    /*const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please try again...', 422));
    };

    const drivers = req.body.drivers;
    const divisionId = req.body.division;

    try {
        await Division.updateOne({ _id: divisionId }, { $push: { 'refs.drivers' : drivers } });
    } catch (err) {
        const error = new HttpError('Could not add drivers to this division.', 500);
        return next(error);
    };

    res.status(200).json({message: 'drivers successfully added to this division.' });*/

    //

    const divisionId = req.params.did;

    const { drivers } = req.body;

    if ( drivers ) {

        try {
            await Division.updateOne({id: divisionId}, { $set: { drivers: drivers } } )
        } catch (err) {
            const error = new HttpError('Could not update the drivers for this division.', 500);
            return next(error);
        }; 

        res.status(200).json({message: 'driver(s) successfully updated for this division.' });
    }
};

const deleteDivision = async (req, res, next) => {
    console.log("deleteDivision");
    const divisionId = req.params.did;

    let division;
    try {
        division = await Division.findById(divisionId);
    } catch (err) {
        const error = new HttpError('Error: Could not find any division with this ID.', 500);
        return next(error);
    };

    if (!division) {
        const error = new HttpError('Could not find a division for this ID.', 404);
        return next(error);
    };

    let seriesId = division.series;

    let series;
    try {
        series = await Series.findById(seriesId);
    } catch (err) {
        const error = new HttpError('Error: Could not find any series with this ID.', 500);
        return next(error);
    };

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await division.remove({ session: sess });
        series.divisions.pull(divisionId);
        await series.save({ session: sess });
        await Season.deleteMany({ session: sess, 'refs.division': divisionId });
        await Event.deleteMany({ session: sess, 'refs.division': divisionId });
        await sess.commitTransaction();
      } catch (err) {
       const error = new HttpError('Error: Could not delete this division', 500);
       return next(error);
      };

    res.status(200).json({message: 'Deleted division.' });
};

// Season

const getSeasonById = async (req, res, next) => {
    const seriesId = req.params.sid;
    const divisionId = req.params.did;
    const seasonId = req.params.seid;

    // Get Series
    
    let series;
    try {
        series = await Series.findById(seriesId)
        series = series.properties.title;
    } catch (err) {
        const error = new HttpError('Error: Could not find a series with this ID.', 500);
        return next(error);
    }

    // Get Division

    let division;
    try {
        division = await Division.findById(divisionId).populate('drivers');
    } catch (err) {
        const error = new HttpError('Error: Could not find a division with this ID.', 500);
        return next(error);
    }

    let thisSeason;
    try {
        thisSeason = await Season.findById(seasonId);
    } catch (err) {
        const error = new HttpError('Error: Could not find a season with this ID.', 500);
        return next(error);
    }

    /*let seasonDrivers;
    if (thisSeason.drivers.length > 0) {
        seasonDrivers = thisSeason.drivers.map((driver) => {
            return {
                _id: driver._id,
                username: driver.username
            }
        })
    } else {
        seasonDrivers = [];
    }*/

    let seasonDrivers = thisSeason.drivers;

    // Update Season Drivers

    let aggregateResults;
    try {
        aggregateResults = await Event.aggregate([
            // Unwind drivers array to flatten object.
            { $unwind: "$drivers" },
            // Filter for drivers that attended a completed event in this season.
            { $match: {
                  season: ObjectId(seasonId),
                  "properties.status": "complete",
                  "drivers.attendance": "Attended",
                  "properties.resultsEntered": true
            } },
            // Minimize object and flatten.
            {
                $project: {
                  league: 1,
                  season: 1,
                  _id: "$drivers._id",
                  username: "$drivers.username",
                  role: "$drivers.role",
                  team: "$drivers.team",
                  qualifying: "$drivers.result.qualifying",
                  sprint: "$drivers.result.sprint",
                  race: "$drivers.result.race",
                  points: "$drivers.result.points",
                  attended: {
                    $cond: [ { $eq: [ "$drivers.attendance", "Attended" ] }, 1, 0 ]
                  },
                  finished: {
                    $cond: [ { $eq: [ "$drivers.result.finished", true ] }, 1, 0 ]
                  },
                  fastestLap: {
                    $cond: [ { $eq: [ "$drivers.result.fastestLap", true ] }, 1, 0 ]
                  },
                  pole: {
                    $cond: [ { $eq: [ "$drivers.result.qualifying", 1 ] }, 1, 0 ]
                  },
                  winner: {
                    $cond: [ { $eq: [ "$drivers.result.race", 1 ] }, 1, 0 ]
                  },
                  podium: {
                    $cond: [ { $and: 
                        [{ $lt: [ "$drivers.result.race", 4 ] }, { $gt: [ "$drivers.result.race", 0 ] }] 
                    }, 1, 0 ]
                  }
                }
            },
            // Group results by driver.
            {
                $group: {
                  _id: "$_id",
                  username: { $first: "$username" },
                  role: { $first: "$role" },
                  team: { $first: "$team" },
                  fastestLaps: { $sum: "$fastestLap" },
                  finishes: { $sum: "$finished" },
                  podiums: { $sum: "$podium" },
                  points: { $sum: "$points" },
                  poles: { $sum: "$pole" },
                  races: { $sum: "$attended" },
                  wins: { $sum: "$winner" },
                  bestGrid: { $min: "$qualifying" },
                  bestFinish: { $min: "$race" },
                  averageGrid: { $avg: "$qualifying" },
                  averageFinish: { $avg: "$race" }
                }
            },
            // Sort results by points.
            { $sort: { points: -1 } }
        ]);

        console.log(aggregateResults)

        /*if (aggregateResults.length > 0) {
            console.log("Results:")
            console.log(aggregateResults.map((driver) => {
                return {
                    id: driver._id,
                    pts: driver.points,
                    u: driver.username
                }
            }))
        }*/
        
        if (aggregateResults.length > 0) {
            let updatedDrivers = aggregateResults.map(driver => driver._id);
            let inactiveDrivers = seasonDrivers.filter(driver => !updatedDrivers.includes(driver._id));
            Array.prototype.push.apply(aggregateResults,inactiveDrivers); 
            await Season.updateOne(
                { _id : seasonId }, 
                { $set : { drivers: aggregateResults } }
            );
        }
    } catch (err) {
        const error = new HttpError('Error: Could not aggregate results for this season.', 500);
        return next(error);
    }

     // Get Season

     let season;
     try {
         season = await Season.findById(seasonId).populate('events')
     } catch (err) {
         const error = new HttpError('Error: Could not find a season with this ID.', 500);
         return next(error);
     }
     
     if (!season) {
         const error = new HttpError('Could not find a season for the provided season id.', 404);
         return next(error);
     }
 
     // Get Events & Sort
 
     let events = season.events;
 
     events = events.sort(function(a,b) {
         return new Date(a.properties.start) - new Date(b.properties.start);
     })

    // Return Data
    
    res.json(
        { 
            series: series,
            division: division.toObject( {getters: true }),
            season: season.toObject( {getters: true })
        }
    );
};

const createSeason = async (req, res, next) => {
    const leagueId = req.params.lid;
    const seriesId = req.params.sid;
    const divisionId = req.params.did;

    const { season } = req.body;

    const createdSeason = new Season({
        properties: 
        {
            identifier: season.title,
            title: `${season.divisionTitle}: Season ${season.title}`,
            status: season.status,
            isRecruiting: season.isRecruiting,
        },
        drivers: [],
        league: leagueId,
        series: seriesId,
        division: divisionId,
        events: []
    });

    let thisDivision;
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        thisDivision = await Division.findOne({ _id : divisionId });
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not find this division', 500);
        return next(error);
    };

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdSeason.save({ session: sess });
        await Division.updateOne({ _id : divisionId }, { $push: { seasons : createdSeason._id } });
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not save this season', 500);
        return next(error);
    };
    
    res.status(201).json({season: createdSeason});
};

const updateSeason = async (req, res, next) => {
    console.log("updateSeason");
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please try again...', 422));
    }

    const seasonId = req.params.seid;

    const { title, status, isRecruiting } = req.body;

    let season;
        try {
            season = await Season.findById(seasonId);
        } catch (err) {
            const error = new HttpError('Error: Could not find a season with this ID.', 500);
            return next(error);
        };

    season.title = title;
    season.status = status;
    season.isRecruiting = isRecruiting;

    try {
        await season.save();
    } catch (err) {
        const error = new HttpError('Could not update this season.', 500);
        return next(error);
    };

    res.status(200).json({season: season.toObject({ getters: true })});
};

const addDriversToSeason = async (req, res, next) => {
    const seasonId = req.params.seid;
    const { drivers } = req.body;

    let season;
    try {
        season = await Season.findById(seasonId);
    } catch (err) {
        const error = new HttpError('Could not find this season.', 500);
        return next(error);
    };

    let existingDrivers = season.drivers;

    let newDrivers, removeDrivers;
    if (existingDrivers.length > 0) {

        let importedDriverIds = drivers.map(driver => driver._id.toString());
        let existingDriverIds = existingDrivers.map(driver => driver._id);

        newDrivers = drivers.filter(driver => !existingDriverIds.includes(driver._id));
        removeDrivers = existingDriverIds.filter(driver => !importedDriverIds.includes(driver));

        try {
            const sess = await mongoose.startSession();
            sess.startTransaction();
            if (newDrivers.length > 0) {
                await Season.updateOne(
                    { _id : seasonId },
                    { $push: { drivers: { $each: newDrivers } } }
                )
            }

            if (removeDrivers.length > 0) {
                await Season.updateOne(
                    { _id : seasonId },
                    { $pull: { 'drivers' : { _id: { $in : removeDrivers } } } },
                    { multi : true }
                )
            }
            await sess.commitTransaction();
        } catch (err) {
           const error = new HttpError('Error: Could not delete this event', 500);
           return next(error);
        }

        res.status(200).json({message: 'driver(s) have been successfully updated for this season.' });

    } else {

        newDrivers = drivers;

        try {
            await Season.updateOne({id: seasonId}, { $set: { drivers: newDrivers } });
        } catch (err) {
            const error = new HttpError('Could not add these drivers to this season.', 500);
            return next(error);
        };

        res.status(200).json({message: 'driver(s) have been successfully added to this season.' });
    }
};

const removeDriverFromSeason = async (req, res, next) => {
    const driverId = req.params.drivid;
    const seasonId = req.params.seid;

    let season;
    try {
        season = await Season.findById(seasonId);
    } catch (err) {
        const error = new HttpError('Error: Could not find this season.', 500);
        return next(error);
    };

    try {
        season.drivers.pull(driverId);
        await season.save();
    } catch (err) {
        const error = new HttpError('Error: Could not remove this driver from the season.', 500);
        return next(error);
    };

    res.status(200).json({message: 'This driver has been successfully removed from the season.' });
};

const updateSeasonDrivers = async (req, res, next) => {
    const seasonId = req.params.seid;
    const { drivers } = req.body;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await Season.updateOne(
            { _id: seasonId }, 
            { $set: { 'drivers': drivers } }
        );
        await sess.commitTransaction();
      } catch (err) {
       const error = new HttpError('Error: Could not update the drivers for this season', 500);
       return next(error);
      };

    res.status(200).json({message: 'drivers successfully this driver.' });
};

const deleteSeason = async (req, res, next) => {
    const seasonId = req.params.seid;
    let divisionId = req.params.did;

    let season;
    try {
        season = await Season.findById(seasonId);
    } catch (err) {
        const error = new HttpError('Error: Could not find any season with this ID.', 500);
        return next(error);
    };

    if (!season) {
        const error = new HttpError('Could not find a season for this ID.', 404);
        return next(error);
    };

    let division;
    try {
        division = await Division.findById(divisionId);
    } catch (err) {
        const error = new HttpError('Error: Could not find any division with this ID.', 500);
        return next(error);
    };

    if (!division) {
        const error = new HttpError('Could not find a division for this ID.', 404);
        return next(error);
    };

    let events;
    try {
        events = await Event.find({'refs.season' : seasonId});
    } catch (err) {
        const error = new HttpError('Error: Could not find any division with this ID.', 500);
        return next(error);
    };

    if (!events) {
        const error = new HttpError('Could not find a division for this ID.', 404);
        return next(error);
    };

    let eventIds = events.map((event) => { return event.id });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await season.remove({ session: sess }); // delete season from database.
        division.seasons.pull(season); // remove season from division.
        await division.save({ session: sess });
        await Driver.updateMany({}, { $pull: { 'refs.seasons': seasonId } });
        await Driver.updateMany({}, { $pull: { 'refs.events': eventIds } });
        await Event.deleteMany({ 'refs.season' : seasonId }) // delete season's events
        await sess.commitTransaction();
      } catch (err) {
       const error = new HttpError('Error: Could not delete this season', 500);
       return next(error);
      };

    res.status(200).json({message: 'Successfully deleted this season, and accompanied events.' });
};

// Event

const getEvents = async (req, res, next) => {
    let events;
    try {
        events = await Event.find({events});
    } catch (err) {
        const error = new HttpError('Fetching events failed, please try again later.', 500);
        return next(error);
    }

    res.json({events: events.map(event => event.toObject({ getters: true }))});
};

const getEventsBySeason = async (req, res, next) => {
    const seasonId = req.params.seid;

    let events;
    try {
        events = await Event.find({ 'refs.season': seasonId })
    } catch (err) {
        const error = new HttpError('Fetching events failed, please try again later.', 500);
        return next(error);
    };

    res.json({events: events.map(event => event.toObject({ getters: true }))});
};

const createEvent = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid inputs passed, please try again...', 422));
    };

    const { league, season, title, date, status } = req.body;

    let backgroundColor;
    if (status === 'complete') { backgroundColor = 'white' } else { backgroundColor = 'green' };

    const createdEvent = new Event({
        properties: { title, start: date[0], end: date[1], status, backgroundColor },
        drivers: [],
        refs: { league, season }
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await Event.create(createdEvent);
        await Season.updateOne({ id: season }, { $push: { 'refs.events' : createdEvent } });
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not save this event', 500);
        return next(error);
    };
    
    res.status(201).json({event: createdEvent});
};

const createEvents = async (req, res, next) => {
    const leagueId = req.params.lid;
    const seasonId = req.params.seid;

    const { events } = req.body;

    let newEvents = events.map((event) => {
        return new Event({
            properties: {
                start: event.date,
                end: event.date,
                status: event.status,
                backgroundColor: event.backgroundColor
            },
            drivers: [],
            league: leagueId,
            season: seasonId
        });
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await Event.insertMany(newEvents);
        await Season.updateOne({ id: seasonId }, { $push: { 'events' : newEvents } });
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not save these events', 500);
        return next(error);
    };
    
    res.status(201).json({event: newEvents});
};

const updateEvents = async (req, res, next) => {
    const eventId = req.params.eid;
    const { event } = req.body;

    let backgroundColor;
    if (event.status === 'complete') { backgroundColor = 'white' } else { backgroundColor = 'green' };

    let updatedEvent;
    try {
        updatedEvent = await Event.updateOne(
            { _id: eventId },
            {
                $set: {
                    'properties.title': event.title,
                    'properties.start': event.start,
                    'properties.end': event.end,
                    'properties.status': event.status,
                    'properties.backgroundColor': backgroundColor
                }
            });
    } catch (err) {
        const error = new HttpError('Error: Could not find an event with this ID.', 500);
        return next(error);
    }

    res.status(200).json({ event: updatedEvent });
};

const updateEventDrivers = async (req, res, next) => {
    const eventId = req.params.eid;

    const { drivers } = req.body;

    let event;
    try {
        event = await Event.findById(eventId);
    } catch (err) {
        const error = new HttpError('Error: Could not find an event with this ID.', 500);
        return next(error);
    }

    let newDrivers, toBeRemoved;
    if (event.drivers.length > 0) {
        const existingDriverIds = event.drivers.map(driver => driver._id);
        const loadedDriverIds = drivers.map(driver => driver._id);

        newDrivers = drivers.filter(driver => !existingDriverIds.includes(driver._id));

        toBeRemoved = event.drivers.filter(driver => !loadedDriverIds.includes(driver._id));
    } else {
        newDrivers = drivers;
    }

    if (typeof toBeRemoved == 'string'){
        toBeRemoved = [toBeRemoved];
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        if (newDrivers.length > 0){
            await Event.updateOne({ _id : eventId }, { $push: { 'drivers' : newDrivers } });
        }
        if (toBeRemoved !== undefined) {
            await Event.updateOne(
                { _id : eventId }, 
                { $pull: { 'drivers' : { _id: { $in : toBeRemoved } } } },
                { multi : true }
            );
        }
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not find an event with this ID.', 500);
        return next(error);
    }

    res.status(200).json({ message: "Drivers Successfully updated for this event." });
};

const updateEventResults = async (req, res, next) => {
    const eventId = req.params.eid;

    const { results, fastestLap, sprint, halfPoints } = req.body;

    let drivers = results.map((driver) => {
        let flap;
        if(driver.username == fastestLap) {
            flap = true;
        } else {
            flap = false;
        }

        return {
            _id: driver._id,
            username: driver.username,
            attendance: driver.attendance,
            role: driver.role,
            team: driver.team,
            result: {
                qualifying: driver.qualifying,
                sprint: driver.sprint,
                race: driver.race,
                points: driver.points,
                fastestLap: flap,
                finished: driver.finished
            },
            incidents: {
                warning: driver.warning,
                penalty: driver.penalty
            }
        }
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
            await Event.updateOne(
                { _id: eventId }, 
                { $set: { 
                            'summary.fastestLap' : fastestLap, 
                            'properties.isSprint' : sprint, 
                            'properties.halfPoints' : halfPoints, 
                            'drivers' : drivers,
                            'properties.resultsEntered' : true
                        } 
                });
        await sess.commitTransaction();
    } catch (err) {
        console.log('err', err);
        const error = new HttpError('Error: Could not complete this transaction.', 500);
        return next(error);
    }

    res.status(200).json({ message: "Results have been successfully updated for this event." });
};

const deleteEvent = async (req, res, next) => {
    const { seid, eid } = req.params;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await Event.deleteOne({ _id : eid });
        await Season.updateOne({ _id : seid }, { $pull: { 'events': eid } })
        await Driver.updateMany({}, { $pull: { 'refs.events': eid } });
        await sess.commitTransaction();
      } catch (err) {
       const error = new HttpError('Error: Could not delete this event', 500);
       return next(error);
      }

    res.status(200).json({message: 'Deleted event.' });
};

// GET
exports.getMembersByLeagueId = getMembersByLeagueId;
exports.getDriversByLeagueId = getDriversByLeagueId;
exports.getNonEnrolledDriversForSeasonByDivision = getNonEnrolledDriversForSeasonByDivision;
exports.getLeagueById = getLeagueById;
exports.getSeriesById = getSeriesById;
exports.getSeasonById = getSeasonById;
exports.getSeriesByLeagueId = getSeriesByLeagueId;
exports.getEvents = getEvents;
exports.getEventsBySeason = getEventsBySeason;
exports.getNotificationsByLeagueId = getNotificationsByLeagueId;

// POST
exports.createDriver = createDriver;
exports.inviteDriver = inviteDriver;
exports.createLeague = createLeague;
exports.createSeries = createSeries;
exports.createDivision = createDivision;
exports.createSeason = createSeason;
exports.createEvent = createEvent;
exports.createEvents = createEvents;

// PATCH
exports.removeMemberFromLeague = removeMemberFromLeague;
exports.respondToNotification = respondToNotification;
exports.discordImportDrivers = discordImportDrivers;
exports.excelImportDrivers = excelImportDrivers;
exports.updateLeague = updateLeague;
exports.updateLeagueDriver = updateLeagueDriver;
exports.updateSeries = updateSeries;
exports.updateDivision = updateDivision;
exports.addDriversToDivision = addDriversToDivision;
exports.updateSeason = updateSeason;
exports.addDriversToSeason = addDriversToSeason;
exports.updateSeasonDrivers = updateSeasonDrivers;
exports.updateEvents = updateEvents;
exports.updateEventDrivers = updateEventDrivers;
exports.updateEventResults = updateEventResults;
exports.addDriversToSeries = addDriversToSeries;
exports.removeDriverFromSeries = removeDriverFromSeries;
exports.removeDriverFromSeason = removeDriverFromSeason;

// DELETE
exports.deleteLeague = deleteLeague;
exports.removeDriver = removeDriver;
exports.deleteSeries = deleteSeries;
exports.deleteDivision = deleteDivision;
exports.deleteSeason = deleteSeason;
exports.deleteEvent = deleteEvent;