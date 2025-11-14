const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const TrainingParticipant = sequelize.define("TrainingParticipant", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  trainingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Training",
      key: "id",
    },
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Teachers",
      key: "id",
    },
  },
  status: {
    type: DataTypes.ENUM("registered", "attended", "absent", "completed"),
    defaultValue: "registered",
  },
  preTrainingScore: {
    type: DataTypes.INTEGER,
  },
  postTrainingScore: {
    type: DataTypes.INTEGER,
  },
  feedback: {
    type: DataTypes.TEXT,
  },
  certificateIssued: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});
module.exports = TrainingParticipant;