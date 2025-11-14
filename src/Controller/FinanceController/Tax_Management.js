const { Op } = require("sequelize");
const Tax = require("../models/TaxModel");
const User = require("../models/UserModel");

class Tax_Management {
  async createTax(req, res) {
    try {
      const taxData = req.body;
      taxData.createdBy = req.user.id;

      const tax = await Tax.create(taxData);

      res.status(201).json({
        success: true,
        message: "Tax created successfully",
        data: tax,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating tax",
        error: error.message,
      });
    }
  }

  async getTaxes(req, res) {
    try {
      const { page = 1, limit = 10, taxType, isActive } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (taxType) whereCondition.taxType = taxType;
      if (isActive !== "") whereCondition.isActive = isActive === "true";

      const { count, rows: taxes } = await Tax.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["email"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["applicableFrom", "DESC"]],
      });

      res.json({
        success: true,
        data: taxes,
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
        message: "Error fetching taxes",
        error: error.message,
      });
    }
  }
}

module.exports = new Tax_Management();
