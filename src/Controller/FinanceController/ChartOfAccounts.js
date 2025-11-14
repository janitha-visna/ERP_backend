const ChartOfAccount = require("../models/ChartOfAccountModel");
const { Op } = require("sequelize");

class ChartOfAccounts {
  async createChartOfAccount(req, res) {
    try {
      const accountData = req.body;
      accountData.createdBy = req.user.id;

      const account = await ChartOfAccount.create(accountData);

      res.status(201).json({
        success: true,
        message: "Chart of account created successfully",
        data: account,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating chart of account",
        error: error.message,
      });
    }
  }

  async getChartOfAccounts(req, res) {
    try {
      const { accountType, isActive } = req.query;

      const whereCondition = {};
      if (accountType) whereCondition.accountType = accountType;
      if (isActive !== "") whereCondition.isActive = isActive === "true";

      const accounts = await ChartOfAccount.findAll({
        where: whereCondition,
        include: [
          {
            model: ChartOfAccount,
            as: "subAccounts",
            attributes: ["id", "accountCode", "accountName", "balance"],
          },
        ],
        order: [["accountCode", "ASC"]],
      });

      res.json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching chart of accounts",
        error: error.message,
      });
    }
  }
}

module.exports = new ChartOfAccounts();