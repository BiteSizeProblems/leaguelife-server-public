const express = require('express');
const leaguesControllers = require('../controllers/leagues-controllers');
const router = express.Router();

// GET

router.get('/:lid', leaguesControllers.getLeagueById ); // <--- Good

router.get('/:lid/drivers', leaguesControllers.getDriversByLeagueId ); // <--- Good

router.get('/:lid/members', leaguesControllers.getMembersByLeagueId ); // <--- Good

router.get('/:lid/notifications', leaguesControllers.getNotificationsByLeagueId ); // <--- Good

router.get('/:lid/series', leaguesControllers.getSeriesByLeagueId ); // <--- Good

router.get('/:lid/series/:sid', leaguesControllers.getSeriesById ); // <--- Good

router.get('/:lid/series/:sid/divisions/:did/seasons/:seid', leaguesControllers.getSeasonById ); // <--- Good

router.get('/:lid/events', leaguesControllers.getEvents ); // <--- Good

router.get('/:lid/series/:sid/divisions/:did/seasons/:seid/events', leaguesControllers.getEventsBySeason ); // !!! Not being used now?

// POST

router.post('/', leaguesControllers.createLeague); // <--- Good

router.post('/:lid/drivers/discord-import', leaguesControllers.discordImportDrivers ); // <--- Good

router.post('/:lid/drivers/excel-import', leaguesControllers.excelImportDrivers ); // <--- Good

router.post('/:lid/driver', leaguesControllers.createDriver ); // <--- Good

router.post('/:lid/invite', leaguesControllers.inviteDriver ); // <--- Good

router.post('/:lid/series', leaguesControllers.createSeries); // <--- Good

router.post('/:lid/series/:sid/divisions', leaguesControllers.createDivision); // <--- Good

router.post('/:lid/series/:sid/divisions/:did/seasons', leaguesControllers.createSeason); // <--- Good

router.post('/:lid/series/:sid/divisions/:did/seasons/:seid/events', leaguesControllers.createEvents); // <--- Good

// PATCH

router.patch('/:lid/notifications/:nid', leaguesControllers.respondToNotification); // <--- Good

router.patch('/:lid/members/:mid', leaguesControllers.removeMemberFromLeague); // !!! Not being used now?

router.patch('/:lid', leaguesControllers.updateLeague); // <--- Good

router.patch('/:lid/driver', leaguesControllers.updateLeagueDriver); // <--- Good

router.patch('/:lid/series/:sid', leaguesControllers.updateSeries); // <--- Good

router.patch('/:lid/series/:sid/drivers', leaguesControllers.addDriversToSeries); // <--- Good

router.patch('/:lid/series/:sid/remove-driver/:drivid', leaguesControllers.removeDriverFromSeries); // <--- Good

router.patch('/:lid/series/:sid/divisions/:did', leaguesControllers.updateDivision); // <--- Good

router.patch('/:lid/series/:sid/divisions/:did/seasons/:seid/events/:eid', leaguesControllers.updateEvents); // <--- Good

router.patch('/:lid/series/:sid/divisions/:did/seasons/:seid/events/:eid/results', leaguesControllers.updateEventResults); // <--- Good

router.patch('/:lid/series/:sid/divisions/:did/drivers', leaguesControllers.addDriversToDivision); // <--- Good

router.patch('/:lid/series/:sid/divisions/:did/seasons/:seid', leaguesControllers.updateSeason); // <--- Good

router.patch('/:lid/series/:sid/divisions/:did/seasons/:seid/drivers', leaguesControllers.addDriversToSeason); // <--- Good

router.patch('/:lid/series/:sid/divisions/:did/seasons/:seid/remove-driver/:drivid', leaguesControllers.removeDriverFromSeason); // <--- Good

router.patch('/:lid/series/:sid/divisions/:did/seasons/:seid/update-drivers', leaguesControllers.updateSeasonDrivers); // <--- Good

router.patch('/:lid/series/:sid/divisions/:did/seasons/:seid/events/:eid/drivers', leaguesControllers.updateEventDrivers); // <--- Good

// DELETE

router.delete('/:lid/remove-driver/:drivid', leaguesControllers.removeDriver) // <--- Good

router.delete('/:lid', leaguesControllers.deleteLeague ); // <--- Good

router.delete('/:lid/series/:sid', leaguesControllers.deleteSeries ); // <--- Good

router.delete('/:lid/series/:sid/divisions/:did', leaguesControllers.deleteDivision ); // <--- Good

router.delete('/:lid/series/:sid/divisions/:did/seasons/:seid', leaguesControllers.deleteSeason ); // <--- Good

router.delete('/:lid/series/:sid/divisions/:did/seasons/:seid/events/:eid', leaguesControllers.deleteEvent); // <--- Good



module.exports = router;