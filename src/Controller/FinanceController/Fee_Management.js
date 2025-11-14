const FeeStructure = require("../models/FeeStructureModel");
const User = require("../models/UserModel");
const { Op } = require("sequelize");

class Fee_Management {
  async createFeeStructure(req, res) {
    try {
      const feeData = req.body;
      feeData.createdBy = req.user.id;

      // Calculate total amount from components
      if (feeData.feeComponents && Array.isArray(feeData.feeComponents)) {
        feeData.totalAmount = feeData.feeComponents.reduce(
          (total, component) => {
            return total + parseFloat(component.amount || 0);
          },
          0
        );
      }

      const feeStructure = await FeeStructure.create(feeData);

      res.status(201).json({
        success: true,
        message: "Fee structure created successfully",
        data: feeStructure,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating fee structure",
        error: error.message,
      });
    }
  }

  async getFeeStructures(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        academicYear = "",
        grade = "",
        isActive = "",
      } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (academicYear) whereCondition.academicYear = academicYear;
      if (grade) whereCondition.grade = grade;
      if (isActive !== "") whereCondition.isActive = isActive === "true";

      const { count, rows: feeStructures } = await FeeStructure.findAndCountAll(
        {
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
          order: [["createdAt", "DESC"]],
        }
      );

      res.json({
        success: true,
        data: feeStructures,
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
        message: "Error fetching fee structures",
        error: error.message,
      });
    }
  }

  async updateFeeStructure(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const feeStructure = await FeeStructure.findByPk(id);
      if (!feeStructure) {
        return res.status(404).json({
          success: false,
          message: "Fee structure not found",
        });
      }

      // Recalculate total amount if components are updated
      if (updateData.feeComponents && Array.isArray(updateData.feeComponents)) {
        updateData.totalAmount = updateData.feeComponents.reduce(
          (total, component) => {
            return total + parseFloat(component.amount || 0);
          },
          0
        );
      }

      await feeStructure.update(updateData);

      res.json({
        success: true,
        message: "Fee structure updated successfully",
        data: feeStructure,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating fee structure",
        error: error.message,
      });
    }
  }
}

module.exports = new Fee_Management();
