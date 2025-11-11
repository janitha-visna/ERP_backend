const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Teacher = sequelize.define("Teacher", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
  },
  gender: {
    type: DataTypes.ENUM("male", "female", "other"),
  },
  contactNumber: {
    type: DataTypes.STRING,
  },
  emergencyContact: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  qualification: {
    type: DataTypes.JSONB,
  },
  specialization: {
    type: DataTypes.JSONB,
  },
  joiningDate: {
    type: DataTypes.DATE,
  },
  employmentType: {
    type: DataTypes.ENUM("full_time", "part_time", "contract"),
  },
  department: {
    type: DataTypes.STRING,
  },

  designation: {
    type: DataTypes.STRING,
  },
  salaryGrade: {
    type: DataTypes.STRING,
  },
  bankDetails: {
    type: DataTypes.JSONB,
  },
  documents: {
    type: DataTypes.JSONB,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Teacher;
