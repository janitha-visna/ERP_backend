const Expense = require("../../models/ExpenseModel");
const FinancialTransaction = require("../../models/FinancialTransactionModel");
const User = require("../../models/UserModel");
const { Op } = require("sequelize");

class Expense_Management {
  async createExpense(req, res) {
    try {
      const expenseData = req.body;
      expenseData.approvedBy = req.user.id;

      const expense = await Expense.create(expenseData);

      // Create financial transaction if expense is paid
      if (expenseData.status === "paid") {
        await FinancialTransaction.create({
          transactionCode: `TXN-${Date.now()}`,
          transactionDate: new Date(),
          transactionType: "expense",
          category: expenseData.category,
          amount: -expenseData.amount, // Negative for expenses
          description: expenseData.description,
          paymentMethod: expenseData.paymentMethod,
          expenseId: expense.id,
          status: "completed",
          createdBy: req.user.id,
        });
      }

      res.status(201).json({
        success: true,
        message: "Expense recorded successfully",
        data: expense,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error recording expense",
        error: error.message,
      });
    }
  }

  async getExpenses(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        category,
        status,
      } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (startDate && endDate) {
        whereCondition.expenseDate = {
          [Op.between]: [startDate, endDate],
        };
      }
      if (category) whereCondition.category = category;
      if (status) whereCondition.status = status;

      const { count, rows: expenses } = await Expense.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: "approver",
            attributes: ["email", "role"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["expenseDate", "DESC"]],
      });

      res.json({
        success: true,
        data: expenses,
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
        message: "Error fetching expenses",
        error: error.message,
      });
    }
  }

  async updateExpenseStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const expense = await Expense.findByPk(id);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found",
        });
      }

      const updateData = { status };
      if (status === "rejected" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      await expense.update(updateData);

      // Create financial transaction when expense is paid
      if (status === "paid") {
        await FinancialTransaction.create({
          transactionCode: `TXN-${Date.now()}`,
          transactionDate: new Date(),
          transactionType: "expense",
          category: expense.category,
          amount: -expense.amount,
          description: expense.description,
          paymentMethod: expense.paymentMethod,
          expenseId: expense.id,
          status: "completed",
          createdBy: req.user.id,
        });
      }

      res.json({
        success: true,
        message: `Expense ${status} successfully`,
        data: expense,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating expense status",
        error: error.message,
      });
    }
  }
}

module.exports = new Expense_Management();