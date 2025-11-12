// controllers/FinanceController.js
const FeeService = require("../service/FeeService");

class FinanceController {
  async createFeeStructure(req, res) {
    try {
      const feeStructure = await FeeService.createFeeStructure(
        req.body,
        req.user.id
      );
      res
        .status(201)
        .json({
          success: true,
          message: "Fee structure created successfully",
          data: feeStructure,
        });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error creating fee structure",
          error: error.message,
        });
    }
  }

  async getFeeStructures(req, res) {
    try {
      const { page, limit, academicYear, grade } = req.query;
      const { count, rows } = await FeeService.getFeeStructures({
        page,
        limit,
        academicYear,
        grade,
      });

      res.json({
        success: true,
        data: rows,
        pagination: {
          currentPage: parseInt(page) || 1,
          totalPages: Math.ceil(count / (limit || 10)),
          totalItems: count,
          itemsPerPage: parseInt(limit) || 10,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching fee structures",
          error: error.message,
        });
    }
  }

  async updateFeeStructure(req, res) {
    try {
      const feeStructure = await FeeService.updateFeeStructure(
        req.params.id,
        req.body
      );
      if (!feeStructure)
        return res
          .status(404)
          .json({ success: false, message: "Fee structure not found" });

      res.json({
        success: true,
        message: "Fee structure updated successfully",
        data: feeStructure,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error updating fee structure",
          error: error.message,
        });
    }
  }

  async getFinanceDashboard(req, res) {
    try {
      const dashboardData = await FeeService.getFinanceDashboard();
      res.json({ success: true, data: dashboardData });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching finance dashboard",
          error: error.message,
        });
    }
  }
}

module.exports = new FinanceController();
