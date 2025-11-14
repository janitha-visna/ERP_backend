const { Op } = require("sequelize");
const sequelize = require("../../config/database"); // Sequelize instance
const Payment = require("../../models/PaymentModel");
const Expense = require("../../models/ExpenseModel");
const Payroll = require("../../models/PayrollModel");
const FinancialTransaction = require("../../models/FinancialTransactionModel");
const Invoice = require("../../models/InvoiceModel");
const User = require("../../models/UserModel");



class Financial_Analytics {
  async getFinancialAnalytics(req, res) {
    try {
      const { period } = req.query; // monthly, quarterly, yearly

      // Revenue trends
      const revenueTrends = await this.getRevenueTrends(period);

      // Expense analysis
      const expenseAnalysis = await this.getExpenseAnalysis(period);

      // Profitability metrics
      const profitability = await this.getProfitabilityMetrics(period);

      // Cash flow analysis
      const cashFlow = await this.getCashFlowAnalysis(period);

      res.json({
        success: true,
        data: {
          revenueTrends,
          expenseAnalysis,
          profitability,
          cashFlow,
          keyMetrics: await this.getKeyFinancialMetrics(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching financial analytics",
        error: error.message,
      });
    }
  }

  async getRevenueTrends(period) {
    const months = 12; // Last 12 months
    const trends = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const revenue = await Payment.sum("amount", {
        where: {
          paymentDate: { [Op.between]: [startOfMonth, endOfMonth] },
          status: "completed",
        },
      });

      trends.push({
        period: startOfMonth.toISOString().slice(0, 7),
        revenue: revenue || 0,
      });
    }

    return trends;
  }

  async getExpenseAnalysis(period) {
    const categories = await Expense.findAll({
      attributes: [
        "category",
        [sequelize.fn("SUM", sequelize.col("amount")), "total"],
      ],
      where: {
        expenseDate: {
          [Op.gte]: new Date(new Date().getFullYear(), 0, 1),
        },
        status: "paid",
      },
      group: ["category"],
      order: [[sequelize.fn("SUM", sequelize.col("amount")), "DESC"]],
    });

    const payroll = await Payroll.sum("netSalary", {
      where: {
        paymentDate: {
          [Op.gte]: new Date(new Date().getFullYear(), 0, 1),
        },
        paymentStatus: "paid",
      },
    });

    return {
      byCategory: categories,
      payroll: payroll || 0,
      totalExpenses:
        categories.reduce((sum, cat) => sum + parseFloat(cat.get("total")), 0) +
        (payroll || 0),
    };
  }

  async getProfitabilityMetrics(period) {
    const currentYear = new Date().getFullYear();

    const revenue = await Payment.sum("amount", {
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

    const expenses = await Expense.sum("amount", {
      where: {
        expenseDate: {
          [Op.between]: [
            new Date(currentYear, 0, 1),
            new Date(currentYear, 11, 31),
          ],
        },
        status: "paid",
      },
    });

    const payroll = await Payroll.sum("netSalary", {
      where: {
        paymentDate: {
          [Op.between]: [
            new Date(currentYear, 0, 1),
            new Date(currentYear, 11, 31),
          ],
        },
        paymentStatus: "paid",
      },
    });

    const totalExpenses = (expenses || 0) + (payroll || 0);
    const netIncome = (revenue || 0) - totalExpenses;
    const profitMargin = (revenue || 0) > 0 ? (netIncome / revenue) * 100 : 0;

    return {
      grossRevenue: revenue || 0,
      totalExpenses,
      netIncome,
      profitMargin: profitMargin.toFixed(2),
      operatingRatio: (revenue || 0) > 0 ? (totalExpenses / revenue) * 100 : 0,
    };
  }

  async getCashFlowAnalysis(period) {
    const currentYear = new Date().getFullYear();

    const operating = await FinancialTransaction.sum("amount", {
      where: {
        transactionDate: {
          [Op.between]: [
            new Date(currentYear, 0, 1),
            new Date(currentYear, 11, 31),
          ],
        },
        transactionType: { [Op.in]: ["revenue", "expense"] },
      },
    });

    const investing = await FinancialTransaction.sum("amount", {
      where: {
        transactionDate: {
          [Op.between]: [
            new Date(currentYear, 0, 1),
            new Date(currentYear, 11, 31),
          ],
        },
        transactionType: "asset_purchase",
      },
    });

    return {
      operatingCashFlow: operating || 0,
      investingCashFlow: investing || 0,
      netCashFlow: (operating || 0) + (investing || 0),
    };
  }

  async getKeyFinancialMetrics() {
    const currentYear = new Date().getFullYear();

    // Current Ratio (simplified)
    const currentAssets = await Payment.sum("amount", {
      where: {
        paymentDate: {
          [Op.between]: [
            new Date(currentYear, 0, 1),
            new Date(currentYear, 11, 31),
          ],
        },
      },
    });

    const currentLiabilities = await Invoice.sum("balanceDue", {
      where: {
        status: { [Op.in]: ["issued", "partial", "overdue"] },
      },
    });

    const currentRatio =
      currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;

    // Accounts Receivable Turnover
    const averageReceivable = await Invoice.sum("balanceDue", {
      where: {
        status: { [Op.in]: ["issued", "partial", "overdue"] },
      },
    });

    const revenue = await Payment.sum("amount", {
      where: {
        paymentDate: {
          [Op.between]: [
            new Date(currentYear, 0, 1),
            new Date(currentYear, 11, 31),
          ],
        },
      },
    });

    const receivableTurnover =
      averageReceivable > 0 ? revenue / averageReceivable : 0;

    return {
      currentRatio: currentRatio.toFixed(2),
      receivableTurnover: receivableTurnover.toFixed(2),
      debtToEquity: 0.25, // Simplified
      returnOnAssets: 0.15, // Simplified
    };
  }
}

module.exports = new Financial_Analytics();