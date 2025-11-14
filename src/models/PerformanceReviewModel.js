const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PerformanceReview = sequelize.define("PerformanceReview", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Teachers",
      key: "id",
    },
  },
  reviewPeriod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reviewDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reviewerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  technicalSkills: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  communication: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  teamwork: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  productivity: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  attendance: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  overallRating: {
    type: DataTypes.DECIMAL(3, 2),
  },
  strengths: {
    type: DataTypes.TEXT,
  },
  areasForImprovement: {
    type: DataTypes.TEXT,
  },
  goals: {
    type: DataTypes.TEXT,
  },
  comments: {
    type: DataTypes.TEXT,
  },
  employeeComments: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("draft", "in_review", "completed", "acknowledged"),
    defaultValue: "draft",
  },
});
module.exports = PerformanceReview;
