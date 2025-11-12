// services/FeeService.js
const { FeeStructure, User } = require("../models");
const { Op } = require("sequelize");

class FeeService {
  // Calculate total from components
  calculateTotal(feeComponents = []) {
    return feeComponents.reduce(
      (total, component) => total + parseFloat(component.amount || 0),
      0
    );
  }

  async createFeeStructure(feeData, userId) {
    feeData.createdBy = userId;
    if (feeData.feeComponents) {
      feeData.totalAmount = this.calculateTotal(feeData.feeComponents);
    }
    return FeeStructure.create(feeData);
  }

  async getFeeStructures({ page = 1, limit = 10, academicYear, grade }) {
    const offset = (page - 1) * limit;
    const whereCondition = { isActive: true };
    if (academicYear) whereCondition.academicYear = academicYear;
    if (grade) whereCondition.grade = grade;

    const { count, rows } = await FeeStructure.findAndCountAll({
      where: whereCondition,
      include: [{ model: User, as: "creator", attributes: ["email"] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return { count, rows };
  }

  async updateFeeStructure(id, updateData) {
    const feeStructure = await FeeStructure.findByPk(id);
    if (!feeStructure) return null;

    if (updateData.feeComponents) {
      updateData.totalAmount = this.calculateTotal(updateData.feeComponents);
    }

    await feeStructure.update(updateData);
    return feeStructure;
  }

  async getFinanceDashboard() {
    const totalFeeStructures = await FeeStructure.count({
      where: { isActive: true },
    });
    const currentYear = new Date().getFullYear();

    const activeAcademicYears = await FeeStructure.findAll({
      attributes: ["academicYear"],
      group: ["academicYear"],
      where: { academicYear: { [Op.like]: `%${currentYear}%` } },
    });

    const totalExpectedRevenue = await FeeStructure.sum("totalAmount", {
      where: { isActive: true },
    });

    const recentFeeStructures = await FeeStructure.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "creator", attributes: ["email"] }],
    });

    return {
      summary: {
        totalFeeStructures,
        activeAcademicYears: activeAcademicYears.length,
        totalExpectedRevenue: totalExpectedRevenue || 0,
      },
      recentFeeStructures,
    };
  }
}

module.exports = new FeeService();
