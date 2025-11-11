const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Leave = sequelize.define("Leave", {
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
  leaveType: {
    type: DataTypes.ENUM(
      "casual",
      "sick",
      "annual",
      "maternity",
      "paternity",
      "emergency"
    ),
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  totalDays: {
    type: DataTypes.INTEGER,
  },
  reason: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected", "cancelled"),
    defaultValue: "pending",
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: "Users",
      key: "id",
    },
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
  },
  documents: {
    type: DataTypes.JSONB,
  },
});

module.exports = Leave;
