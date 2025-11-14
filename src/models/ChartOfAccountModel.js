const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChartOfAccount = sequelize.define("ChartOfAccount", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  accountCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  accountName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountType: {
    type: DataTypes.ENUM("asset", "liability", "equity", "revenue", "expense"),
    allowNull: false,
  },
  parentAccount: {
    type: DataTypes.UUID,
    references: {
      model: "ChartOfAccounts",
      key: "id",
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
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
module.exports = ChartOfAccount;