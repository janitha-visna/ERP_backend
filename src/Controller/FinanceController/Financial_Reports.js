
const { Op } = require("sequelize");
const sequelize = require("../../config/database"); // Sequelize instance
const Payment = require("../../models/PaymentModel");
const Expense = require("../../models/ExpenseModel");
const Payroll = require("../../models/PayrollModel");
const FinancialTransaction = require("../../models/FinancialTransactionModel");
const Invoice = require("../../models/InvoiceModel");
const Budget = require("../../models/BudgetModel");
const Asset = require("../../models/AssetModel");

class Financial_Reports {
  async getFinancialReports(req, res) {
    try {
      const { startDate, endDate, reportType } = req.query;

      const start = new Date(startDate || new Date().getFullYear() + "-01-01");
      const end = new Date(endDate || new Date().getFullYear() + "-12-31");

      let reports = {};

      switch (reportType) {
        case "income_statement":
          reports = await this.generateIncomeStatement(start, end);
          break;
        case "balance_sheet":
          reports = await this.generateBalanceSheet(start, end);
          break;
        case "cash_flow":
          reports = await this.generateCashFlow(start, end);
          break;
        case "budget_variance":
          reports = await this.generateBudgetVariance(start, end);
          break;
        default:
          reports = await this.generateComprehensiveReport(start, end);
      }

      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error generating financial reports",
        error: error.message,
      });
    }
  }

  async generateIncomeStatement(start, end) {
    // Revenue calculations
    const feeRevenue = await Payment.sum("amount", {
      where: {
        paymentDate: { [Op.between]: [start, end] },
        status: "completed",
      },
    });

    const otherRevenue = await FinancialTransaction.sum("amount", {
      where: {
        transactionDate: { [Op.between]: [start, end] },
        transactionType: "revenue",
        category: { [Op.not]: "tuition_fee" },
      },
    });

    const totalRevenue = (feeRevenue || 0) + (otherRevenue || 0);

    // Expense calculations
    const salaryExpenses = await Payroll.sum("netSalary", {
      where: {
        paymentDate: { [Op.between]: [start, end] },
        paymentStatus: "paid",
      },
    });

    const operationalExpenses = await Expense.sum("amount", {
      where: {
        expenseDate: { [Op.between]: [start, end] },
        status: "paid",
      },
    });

    const otherExpenses = await FinancialTransaction.sum("amount", {
      where: {
        transactionDate: { [Op.between]: [start, end] },
        transactionType: "expense",
      },
    });

    const totalExpenses =
      (salaryExpenses || 0) +
      (operationalExpenses || 0) +
      (Math.abs(otherExpenses) || 0);
    const netIncome = totalRevenue - totalExpenses;

    return {
      reportType: "income_statement",
      period: { start, end },
      revenue: {
        feeRevenue: feeRevenue || 0,
        otherRevenue: otherRevenue || 0,
        total: totalRevenue,
      },
      expenses: {
        salary: salaryExpenses || 0,
        operational: operationalExpenses || 0,
        other: Math.abs(otherExpenses) || 0,
        total: totalExpenses,
      },
      netIncome,
    };
  }

  async generateBalanceSheet(start, end) {
    // Assets
    const currentAssets = await FinancialTransaction.sum("amount", {
      where: {
        transactionDate: { [Op.between]: [start, end] },
        transactionType: { [Op.in]: ["revenue", "asset_purchase"] },
      },
    });

    const fixedAssets = await Asset.sum("currentValue", {
      where: {
        status: "active",
      },
    });

    const totalAssets = (currentAssets || 0) + (fixedAssets || 0);

    // Liabilities & Equity (simplified)
    const totalLiabilities = await this.calculateLiabilities();
    const totalEquity = totalAssets - totalLiabilities;

    return {
      reportType: "balance_sheet",
      asOf: end,
      assets: {
        currentAssets: currentAssets || 0,
        fixedAssets: fixedAssets || 0,
        total: totalAssets,
      },
      liabilities: {
        total: totalLiabilities,
      },
      equity: {
        total: totalEquity,
      },
    };
  }

  async calculateLiabilities() {
    // This would typically include loans, accounts payable, etc.
    // Simplified for this example
    const unpaidInvoices = await Invoice.sum("balanceDue", {
      where: {
        status: { [Op.in]: ["issued", "partial", "overdue"] },
      },
    });

    return unpaidInvoices || 0;
  }

  async generateCashFlow(start, end) {
    const operatingActivities = await FinancialTransaction.sum("amount", {
      where: {
        transactionDate: { [Op.between]: [start, end] },
        transactionType: { [Op.in]: ["revenue", "expense"] },
      },
    });

    const investingActivities = await FinancialTransaction.sum("amount", {
      where: {
        transactionDate: { [Op.between]: [start, end] },
        transactionType: "asset_purchase",
      },
    });

    const netCashFlow = (operatingActivities || 0) + (investingActivities || 0);

    return {
      reportType: "cash_flow",
      period: { start, end },
      operatingActivities: operatingActivities || 0,
      investingActivities: investingActivities || 0,
      netCashFlow,
    };
  }

  async generateBudgetVariance(start, end) {
    const budgets = await Budget.findAll({
      where: {
        status: "active",
        startDate: { [Op.lte]: end },
        endDate: { [Op.gte]: start },
      },
      include: [
        {
          model: FinancialTransaction,
          as: "transactions",
          where: {
            transactionDate: { [Op.between]: [start, end] },
          },
          required: false,
        },
      ],
    });

    const varianceReport = budgets.map((budget) => {
      const utilized = budget.transactions.reduce(
        (sum, txn) => sum + Math.abs(parseFloat(txn.amount)),
        0
      );
      const allocated = parseFloat(budget.allocatedAmount);
      const variance = allocated - utilized;
      const variancePercentage = (variance / allocated) * 100;

      return {
        budget: budget.budgetName,
        department: budget.department,
        allocated,
        utilized,
        variance,
        variancePercentage: variancePercentage.toFixed(2),
        status: variance >= 0 ? "under_budget" : "over_budget",
      };
    });

    return {
      reportType: "budget_variance",
      period: { start, end },
      data: varianceReport,
    };
  }
}

module.exports = new Financial_Reports();