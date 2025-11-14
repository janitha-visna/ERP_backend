const { Op } = require("sequelize");
const FinancialTransaction = require("../../models/FinancialTransactionModel");
const User = require("../../models/UserModel");
const Invoice = require("../../models/InvoiceModel");
const Expense = require("../../models/ExpenseModel");
const Budget = require("../../models/BudgetModel");

class Financial_Transactions {
  async getFinancialTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        transactionType,
        startDate,
        endDate,
        status,
      } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (transactionType) whereCondition.transactionType = transactionType;
      if (status) whereCondition.status = status;
      if (startDate && endDate) {
        whereCondition.transactionDate = {
          [Op.between]: [startDate, endDate],
        };
      }

      const { count, rows: transactions } =
        await FinancialTransaction.findAndCountAll({
          where: whereCondition,
          include: [
            {
              model: User,
              as: "creator",
              attributes: ["email"],
            },
            {
              model: Invoice,
              as: "invoice",
              attributes: ["invoiceNumber"],
              required: false,
            },
            {
              model: Expense,
              as: "expense",
              attributes: ["description"],
              required: false,
            },
            {
              model: Budget,
              as: "budget",
              attributes: ["budgetName"],
              required: false,
            },
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [["transactionDate", "DESC"]],
        });

      res.json({
        success: true,
        data: transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching financial transactions",
        error: error.message,
      });
    }
  }
}


module.exports = new Financial_Transactions();