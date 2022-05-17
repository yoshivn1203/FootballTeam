const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A player must have a name'],
    unique: true
  },
  position: {
    type: String,
    required: [true, 'Position cantnot be empty'],
    enum: {
      values: ['defender', 'midfielder', 'forward'],
      message: 'Position is either: defender, midfielder, forward'
    }
  },
  playerSkills: [
    {
      skill: {
        type: String,
        required: [true, 'A player must have at least a skill'],
        enum: {
          values: ['defense', 'attack', 'speed', 'strength', 'stamina'],
          message: 'Skill is either: defense, attack, speed, strength, stamina'
        }
      },
      value: Number
    }
  ]
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
