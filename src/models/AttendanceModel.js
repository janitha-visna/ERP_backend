const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Attendance = sequelize.define("Attendance", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Teachers",
      key: "id",
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  checkIn: {
    type: DataTypes.DATE,
  },
  checkOut: {
    type: DataTypes.DATE,
  },
  totalHours: {
    type: DataTypes.FLOAT,
  },
  status: {
    type: DataTypes.ENUM("present", "absent", "half_day", "leave", "holiday"),
    defaultValue: "present",
  },
  biometricId: {
    type: DataTypes.STRING,
  },
  lateMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  overtimeMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
});

module.exports = Attendance;
