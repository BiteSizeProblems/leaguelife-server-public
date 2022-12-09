const express = require('express');
const UsersControllers =  require('../controllers/users-controllers');
const router = express.Router();

// GET

router.get('/:uid', UsersControllers.getUserById); // <--- Good

router.get('/:uid/notifications' , UsersControllers.getNotifications); // <--- Good

router.get('/:uid/leagues', UsersControllers.getLeagueByUserId ); // <--- Good

// POST

router.post('/:uid/league-application' , UsersControllers.applyToLeague); // <--- Good

router.post('/:uid/invitation-response', UsersControllers.respondToInvitation); // <--- Good

// PATCH

router.patch('/:uid' , UsersControllers.patchUser); // <--- Good

router.patch('/:uid/leagues/:lid', UsersControllers.leaveLeague); // <--- Good

// DELETE

router.delete('/:uid', UsersControllers.deleteUser); // <--- Good

module.exports = router;