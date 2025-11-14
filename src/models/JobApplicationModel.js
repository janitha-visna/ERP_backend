const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const JobApplication = sequelize.define("JobApplication", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  recruitmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Recruitment",
      key: "id",
    },
  },
  applicantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resume: {
    type: DataTypes.STRING,
  },
  coverLetter: {
    type: DataTypes.TEXT,
  },
  experience: {
    type: DataTypes.INTEGER,
  },
  currentSalary: {
    type: DataTypes.DECIMAL(12, 2),
  },
  expectedSalary: {
    type: DataTypes.DECIMAL(12, 2),
  },
  status: {
    type: DataTypes.ENUM(
      "applied",
      "screening",
      "interview",
      "offered",
      "rejected",
      "hired"
    ),
    defaultValue: "applied",
  },
  applicationDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  interviewDate: {
    type: DataTypes.DATE,
  },
  interviewNotes: {
    type: DataTypes.TEXT,
  },
  rating: {
    type: DataTypes.INTEGER,
  },
});
module.exports = JobApplication; 