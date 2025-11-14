const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FinancialTransaction = sequelize.define("FinancialTransaction", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transactionCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  transactionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  transactionType: {
    type: DataTypes.ENUM(
      "revenue",
      "expense",
      "asset_purchase",
      "liability",
      "equity"
    ),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM("cash", "bank_transfer", "cheque", "card"),
    allowNull: false,
  },
  referenceNumber: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "cancelled", "reconciled"),
    defaultValue: "pending",
  },
  budgetId: {
    type: DataTypes.UUID,
    references: {
      model: "Budgets",
      key: "id",
    },
  },
  invoiceId: {
    type: DataTypes.UUID,
    references: {
      model: "Invoices",
      key: "id",
    },
  },
  expenseId: {
    type: DataTypes.UUID,
    references: {
      model: "Expenses",
      key: "id",
    },
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
module.exports = FinancialTransaction; 