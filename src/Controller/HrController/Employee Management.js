const EmployeeService = require("../service/EmployeeService");
const { Teacher, User } = require("../models"); 



class Employee_Management {
  async createEmployee(req, res) {
    try {
      const teacher = await EmployeeService.createEmployee(req.body);
      res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: teacher,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAllEmployees(req, res) {
    try {
      const data = await EmployeeService.getAllEmployees(req.query);
      res.json({ success: true, ...data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getEmployeeById(req, res) {
    try {
      const teacher = await EmployeeService.getEmployeeById(req.params.id);
      if (!teacher)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });
      res.json({ success: true, data: teacher });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateEmployee(req, res) {
    try {
      const teacher = await EmployeeService.updateEmployee(
        req.params.id,
        req.body
      );
      if (!teacher)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });
      res.json({
        success: true,
        message: "Employee updated successfully",
        data: teacher,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async terminateEmployee(req, res) {
    try {
      const { id } = req.params;
      const { terminationDate, reason, remarks } = req.body;

      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      await teacher.update({
        isActive: false,
        terminationDate,
        terminationReason: reason,
        terminationRemarks: remarks,
      });

      // Deactivate user account
      const user = await User.findByPk(teacher.userId);
      if (user) {
        await user.update({ isActive: false });
      }

      res.json({
        success: true,
        message: "Employee terminated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error terminating employee",
        error: error.message,
      });
    }
  }
}

module.exports = new Employee_Management();