const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Asset = sequelize.define("Asset", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  assetCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  assetName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(
      "equipment",
      "furniture",
      "vehicle",
      "technology",
      "property",
      "other"
    ),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  purchaseCost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  currentValue: {
    type: DataTypes.DECIMAL(12, 2),
  },
  depreciationRate: {
    type: DataTypes.DECIMAL(5, 2),
  },
  usefulLife: {
    type: DataTypes.INTEGER, // in years
  },
  location: {
    type: DataTypes.STRING,
  },
  assignedTo: {
    type: DataTypes.UUID,
    references: {
      model: "Teachers",
      key: "id",
    },
  },
  status: {
    type: DataTypes.ENUM(
      "active",
      "maintenance",
      "disposed",
      "lost",
      "retired"
    ),
    defaultValue: "active",
  },
  maintenanceSchedule: {
    type: DataTypes.JSONB,
  },
  warranty: {
    type: DataTypes.JSONB,
  },
  documents: {
    type: DataTypes.JSONB,
  },
});
module.exports = Asset; 