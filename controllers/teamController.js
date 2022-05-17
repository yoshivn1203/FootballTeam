const Team = require('../models/teamModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllTeams = catchAsync(async (req, res, next) => {
  const teams = await Team.find();

  res.status(200).json({
    status: 'success',
    results: teams.length,
    data: {
      teams
    }
  });
});

exports.getTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(new AppError('No team found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      team
    }
  });
});

exports.createTeam = catchAsync(async (req, res, next) => {
  const newTeam = await Team.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      team: newTeam
    }
  });
});

exports.updateTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!team) {
    return next(new AppError('No team found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      team
    }
  });
});

exports.deleteTeam = catchAsync(async (req, res, next) => {
  const team = await Team.findByIdAndDelete(req.params.id);

  if (!team) {
    return next(new AppError('No team found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getBestTeam = catchAsync(async (req, res, next) => {
  console.log(req.body[0].mainSkill);

  const team = [];
  //GET THE PLAYERS WITH THE DISERED SKILL AND SORT BY VALUE
  for (let i = 0; i < req.body.length; i++) {
    let playersWithoutDesiredSkill = [];
    let playersWithDesiredSkill = await Team.aggregate([
      {
        $match: { position: req.body[i].position }
      },
      {
        $unwind: '$playerSkills'
      },

      {
        $match: { 'playerSkills.skill': req.body[i].mainSkill }
      },

      {
        $sort: { 'playerSkills.value': -1 }
      },
      {
        $limit: req.body[i].numberOfPlayers
      }
    ]);

    //GET THE PLAYERS WITHOUT THE DISERED SKILL AND SORT BY VALUE
    if (playersWithDesiredSkill.length < req.body[i].numberOfPlayers) {
      playersWithoutDesiredSkill = await Team.aggregate([
        {
          $match: { position: req.body[i].position }
        },
        {
          $match: { 'playerSkills.skill': { $ne: req.body[i].mainSkill } }
        },

        {
          $sort: { 'playerSkills.value': -1 }
        },
        {
          $limit: req.body[i].numberOfPlayers - playersWithDesiredSkill.length
        }
      ]);

      //THROW ERROR IF THERE ARE NOT ENOUGH PLAYERS IN THE REQUIRED POSSITION
      if (
        playersWithDesiredSkill.length + playersWithoutDesiredSkill.length <
        req.body[i].numberOfPlayers
      ) {
        return next(
          new AppError(
            `Insufficient number of players for position: ${
              req.body[i].position
            }`,
            404
          )
        );
      }
    }
    playersWithDesiredSkill.push.apply(team, playersWithDesiredSkill);
    playersWithoutDesiredSkill.push.apply(team, playersWithoutDesiredSkill);
  }

  res.status(200).json({
    status: 'success',
    data: {
      team
    }
  });
});
