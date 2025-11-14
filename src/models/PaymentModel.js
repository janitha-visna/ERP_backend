const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  paymentNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Invoices",
      key: "id",
    },
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Students",
      key: "id",
    },
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM("cash", "bank_transfer", "cheque", "card", "online"),
    allowNull: false,
  },
  referenceNumber: {
    type: DataTypes.STRING,
  },
  bankName: {
    type: DataTypes.STRING,
  },
  chequeNumber: {
    type: DataTypes.STRING,
  },
  cardLastFour: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
    defaultValue: "pending",
  },
  collectedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  notes: {
    type: DataTypes.TEXT,
  },
  receiptUrl: {
    type: DataTypes.STRING,
  },
});
module.exports = Payment;