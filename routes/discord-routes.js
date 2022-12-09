const express = require('express');
const DiscordControllers =  require('../controllers/discord-controllers');
const router = express.Router();

router.get('/:lid/members', DiscordControllers.getMembers);

module.exports = router;