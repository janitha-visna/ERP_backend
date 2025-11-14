const Asset = require("../models/AssetsModel");
const FinancialTransaction = require("../models/FinancialTransactionModel");
const Teacher = require("../models/TeacherModel");
const { Op } = require("sequelize");

class Asset_Management {
  async createAsset(req, res) {
    try {
      const assetData = req.body;

      // Generate asset code
      const assetCount = await Asset.count();
      assetData.assetCode = `AST-${new Date().getFullYear()}-${(assetCount + 1)
        .toString()
        .padStart(4, "0")}`;

      assetData.currentValue = assetData.purchaseCost;

      const asset = await Asset.create(assetData);

      // Create financial transaction for asset purchase
      await FinancialTransaction.create({
        transactionCode: `TXN-${Date.now()}`,
        transactionDate: new Date(),
        transactionType: "asset_purchase",
        category: "fixed_assets",
        amount: -assetData.purchaseCost,
        description: `Purchase of ${assetData.assetName}`,
        paymentMethod: "bank_transfer",
        status: "completed",
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Asset created successfully",
        data: asset,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating asset",
        error: error.message,
      });
    }
  }

  async getAssets(req, res) {
    try {
      const { page = 1, limit = 10, category, status } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (category) whereCondition.category = category;
      if (status) whereCondition.status = status;

      const { count, rows: assets } = await Asset.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Teacher,
            as: "assignedToEmployee",
            attributes: ["firstName", "lastName", "employeeId"],
            required: false,
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["purchaseDate", "DESC"]],
      });

      res.json({
        success: true,
        data: assets,
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
        message: "Error fetching assets",
        error: error.message,
      });
    }
  }

  async updateAsset(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const asset = await Asset.findByPk(id);
      if (!asset) {
        return res.status(404).json({
          success: false,
          message: "Asset not found",
        });
      }

      // Calculate depreciation if needed
      if (updateData.depreciationRate && asset.purchaseDate) {
        const purchaseDate = new Date(asset.purchaseDate);
        const currentDate = new Date();
        const monthsOwned =
          (currentDate.getFullYear() - purchaseDate.getFullYear()) * 12 +
          (currentDate.getMonth() - purchaseDate.getMonth());

        const monthlyDepreciation =
          (parseFloat(asset.purchaseCost) *
            parseFloat(updateData.depreciationRate)) /
          1200;
        updateData.currentValue = Math.max(
          0,
          parseFloat(asset.purchaseCost) - monthlyDepreciation * monthsOwned
        );
      }

      await asset.update(updateData);

      res.json({
        success: true,
        message: "Asset updated successfully",
        data: asset,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating asset",
        error: error.message,
      });
    }
  }
}

module.exports = new Asset_Management();
