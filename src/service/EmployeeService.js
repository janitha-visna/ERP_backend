const { Teacher, User } = require("../models");
const { Op } = require("sequelize");

class EmployeeService {
  async createEmployee(data) {
    const employeeCount = await Teacher.count();
    data.employeeId = `EMP${(employeeCount + 1).toString().padStart(4, "0")}`;
    return await Teacher.create(data);
  }

  async getAllEmployees({
    page = 1,
    limit = 10,
    search = "",
    department = "",
  }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { employeeId: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (department) where.department = department;

    const { count, rows } = await Teacher.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email", "role", "isActive", "lastLogin"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return { rows, count, page: parseInt(page), limit: parseInt(limit) };
  }

  async getEmployeeById(id) {
    return await Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email", "role", "isActive", "lastLogin"],
        },
      ],
    });
  }

  async updateEmployee(id, updateData) {
    const teacher = await Teacher.findByPk(id);
    if (!teacher) return null;
    return await teacher.update(updateData);
  }

  async getRecentEmployees(limit = 5) {
    return await Teacher.findAll({
      limit,
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "user", attributes: ["email"] }],
    });
  }
}

module.exports = new EmployeeService();
