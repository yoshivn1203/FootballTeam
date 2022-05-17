const express = require('express');
const teamController = require('../controllers/teamController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/process').post(teamController.getBestTeam);

router
  .route('/')
  .get(teamController.getAllTeams)
  .post(teamController.createTeam);

router
  .route('/:id')
  .get(teamController.getTeam)
  .patch(teamController.updateTeam)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    teamController.deleteTeam
  );

module.exports = router;
