const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Tax = sequelize.define("Tax", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  taxName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taxType: {
    type: DataTypes.ENUM(
      "income_tax",
      "sales_tax",
      "property_tax",
      "service_tax",
      "other"
    ),
    allowNull: false,
  },
  taxRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  applicableFrom: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  applicableTo: {
    type: DataTypes.DATEONLY,
  },
  description: {
    type: DataTypes.TEXT,
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
module.exports = Tax;