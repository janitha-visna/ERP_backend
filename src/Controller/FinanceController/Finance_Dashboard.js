const { Op } = require("sequelize");
const sequelize = require("../config/database"); // Sequelize instance
const Payment = require("../models/PaymentModel");
const Expense = require("../models/ExpenseModel");
const Payroll = require("../models/PayrollModel");
const Invoice = require("../models/InvoiceModel");
const Budget = require("../models/BudgetModel");
const FinancialTransaction = require("../models/FinancialTransactionModel");
const User = require("../models/UserModel");
const Student = require("../models/StudentModel");

class Finance_Dashboard {
  async getFinanceDashboard(req, res) {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // Revenue metrics
      const monthlyRevenue = await Payment.sum("amount", {
        where: {
          paymentDate: {
            [Op.between]: [
              new Date(currentYear, currentMonth - 1, 1),
              new Date(currentYear, currentMonth, 0),
            ],
          },
          status: "completed",
        },
      });

      const yearlyRevenue = await Payment.sum("amount", {
        where: {
          paymentDate: {
            [Op.between]: [
              new Date(currentYear, 0, 1),
              new Date(currentYear, 11, 31),
            ],
          },
          status: "completed",
        },
      });

      // Expense metrics
      const monthlyExpenses = await Expense.sum("amount", {
        where: {
          expenseDate: {
            [Op.between]: [
              new Date(currentYear, currentMonth - 1, 1),
              new Date(currentYear, currentMonth, 0),
            ],
          },
          status: "paid",
        },
      });

      const monthlyPayroll = await Payroll.sum("netSalary", {
        where: {
          paymentDate: {
            [Op.between]: [
              new Date(currentYear, currentMonth - 1, 1),
              new Date(currentYear, currentMonth, 0),
            ],
          },
          paymentStatus: "paid",
        },
      });

      // Invoice metrics
      const totalInvoices = await Invoice.count();
      const pendingInvoices = await Invoice.count({
        where: {
          status: { [Op.in]: ["issued", "partial", "overdue"] },
        },
      });

      const overdueInvoices = await Invoice.count({
        where: {
          status: "overdue",
        },
      });

      // Budget metrics
      const activeBudgets = await Budget.count({
        where: { status: "active" },
      });

      const budgetUtilization = await Budget.findOne({
        attributes: [
          [
            sequelize.fn("SUM", sequelize.col("allocatedAmount")),
            "totalAllocated",
          ],
          [
            sequelize.fn("SUM", sequelize.col("utilizedAmount")),
            "totalUtilized",
          ],
        ],
        where: { status: "active" },
        raw: true,
      });

      res.json({
        success: true,
        data: {
          summary: {
            monthlyRevenue: monthlyRevenue || 0,
            yearlyRevenue: yearlyRevenue || 0,
            monthlyExpenses: (monthlyExpenses || 0) + (monthlyPayroll || 0),
            netCashFlow:
              (monthlyRevenue || 0) -
              ((monthlyExpenses || 0) + (monthlyPayroll || 0)),
            totalInvoices,
            pendingInvoices,
            overdueInvoices,
            activeBudgets,
          },
          budgetOverview: {
            allocated: budgetUtilization?.totalAllocated || 0,
            utilized: budgetUtilization?.totalUtilized || 0,
            utilizationRate:
              budgetUtilization?.totalAllocated > 0
                ? (
                    (budgetUtilization.totalUtilized /
                      budgetUtilization.totalAllocated) *
                    100
                  ).toFixed(2)
                : 0,
          },
          recentTransactions: await FinancialTransaction.findAll({
            limit: 10,
            order: [["transactionDate", "DESC"]],
            include: [
              {
                model: User,
                as: "creator",
                attributes: ["email"],
              },
            ],
          }),
          upcomingPayments: await Invoice.findAll({
            where: {
              dueDate: {
                [Op.between]: [
                  new Date(),
                  new Date(new Date().setDate(new Date().getDate() + 30)),
                ],
              },
              status: { [Op.in]: ["issued", "partial"] },
            },
            limit: 5,
            include: [
              {
                model: Student,
                as: "student",
                attributes: ["firstName", "lastName"],
              },
            ],
          }),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching finance dashboard",
        error: error.message,
      });
    }
  }
}

module.exports = new Finance_Dashboard();