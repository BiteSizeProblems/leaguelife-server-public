const HttpError = require('../models/http-error');
const LeagueDriver = require('../models/driver');

const getDrivers = async(req, res, next) => {
    let leagueDrivers;
    try {
        leagueDrivers = await LeagueDriver.find();
    } catch (err) {
        const error = new HttpError('Fetching drivers failed, please try again later.', 500);
        return next(error);
    };
    res.json({leagueDrivers: leagueDrivers.map(driver => driver.toObject({ getters: true }))});
};

const getDriverById = async(req, res, next) => {
    const driverId = req.params.drivid;

    let driver;
    try {
        driver = await LeagueDriver.findById(driverId);
    } catch (err) {
        const error = new HttpError('Fetching driver failed, please try again later.', 500);
        return next(error);
    };
    res.json({ driver: driver.toObject( {getters: true }) });
};

exports.getDrivers = getDrivers;
exports.getDriverById = getDriverById;