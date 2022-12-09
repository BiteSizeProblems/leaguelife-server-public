const express = require('express');
const LeagueDriversControllers =  require('../controllers/drivers-controllers');
const router = express.Router();

router.get('/', LeagueDriversControllers.getDrivers);

router.get('/:lmid', LeagueDriversControllers.getDriverById);

module.exports = router; 