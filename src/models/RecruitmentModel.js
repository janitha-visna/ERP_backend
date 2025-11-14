const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Recruitment = sequelize.define("Recruitment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  positionType: {
    type: DataTypes.ENUM("full_time", "part_time", "contract", "internship"),
    allowNull: false,
  },
  requiredExperience: {
    type: DataTypes.INTEGER,
  },
  jobDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  requirements: {
    type: DataTypes.JSONB,
  },
  salaryRange: {
    type: DataTypes.JSONB,
  },
  vacancies: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  applicationDeadline: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM("open", "closed", "on_hold", "cancelled"),
    defaultValue: "open",
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
});
module.exports = Recruitment;