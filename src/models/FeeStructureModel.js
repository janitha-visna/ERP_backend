const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeeStructure = sequelize.define("FeeStructure", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  feeComponents: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
  },
  lateFeePenalty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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

module.exports = FeeStructure;
