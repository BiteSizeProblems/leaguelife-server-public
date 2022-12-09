const express = require('express');
const searchControllers = require('../controllers/search-controllers');
const router = express.Router();

router.get('/:uid', searchControllers.getUsersAndLeagues);

router.get('/:uid/league-invite', searchControllers.getLeaguesForInvite);

module.exports = router;