const Budget = require("../models/BudgetModel");
const FinancialTransaction = require("../models/FinancialTransactionModel");
const User = require("../models/UserModel");
const { Op } = require("sequelize");

class Budget_Management {
  async createBudget(req, res) {
    try {
      const budgetData = req.body;
      budgetData.createdBy = req.user.id;

      // Generate budget code
      const budgetCount = await Budget.count();
      budgetData.budgetCode = `BUD-${budgetData.fiscalYear}-${(budgetCount + 1)
        .toString()
        .padStart(3, "0")}`;

      budgetData.remainingAmount = budgetData.allocatedAmount;

      const budget = await Budget.create(budgetData);

      res.status(201).json({
        success: true,
        message: "Budget created successfully",
        data: budget,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating budget",
        error: error.message,
      });
    }
  }

  async getBudgets(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        fiscalYear,
        department,
        status,
      } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (fiscalYear) whereCondition.fiscalYear = fiscalYear;
      if (department) whereCondition.department = department;
      if (status) whereCondition.status = status;

      const { count, rows: budgets } = await Budget.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["email"],
          },
          {
            model: User,
            as: "approver",
            attributes: ["email"],
            required: false,
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: budgets,
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
        message: "Error fetching budgets",
        error: error.message,
      });
    }
  }

  async updateBudgetStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const budget = await Budget.findByPk(id);
      if (!budget) {
        return res.status(404).json({
          success: false,
          message: "Budget not found",
        });
      }

      await budget.update({
        status,
        approvedBy: req.user.id,
      });

      res.json({
        success: true,
        message: `Budget ${status} successfully`,
        data: budget,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating budget status",
        error: error.message,
      });
    }
  }

  async getBudgetUtilization(req, res) {
    try {
      const { budgetId } = req.params;

      const budget = await Budget.findByPk(budgetId, {
        include: [
          {
            model: FinancialTransaction,
            as: "transactions",
            attributes: ["id", "amount", "description", "transactionDate"],
          },
        ],
      });

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: "Budget not found",
        });
      }

      const totalUtilized = budget.transactions.reduce(
        (sum, transaction) => sum + Math.abs(parseFloat(transaction.amount)),
        0
      );

      const utilizationRate =
        (totalUtilized / parseFloat(budget.allocatedAmount)) * 100;

      res.json({
        success: true,
        data: {
          budget,
          utilization: {
            allocated: budget.allocatedAmount,
            utilized: totalUtilized,
            remaining: parseFloat(budget.allocatedAmount) - totalUtilized,
            utilizationRate: utilizationRate.toFixed(2),
          },
          transactions: budget.transactions,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching budget utilization",
        error: error.message,
      });
    }
  }
}

module.exports = new Budget_Management();
