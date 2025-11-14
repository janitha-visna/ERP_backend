const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Training = sequelize.define("Training", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  trainer: {
    type: DataTypes.STRING,
  },
  trainingType: {
    type: DataTypes.ENUM(
      "technical",
      "soft_skills",
      "compliance",
      "leadership",
      "other"
    ),
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // in hours
  },
  location: {
    type: DataTypes.STRING,
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
  },
  status: {
    type: DataTypes.ENUM("scheduled", "ongoing", "completed", "cancelled"),
    defaultValue: "scheduled",
  },
  materials: {
    type: DataTypes.JSONB,
  },
});
module.exports = Training;
