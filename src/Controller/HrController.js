const EmployeeService = require("../services/EmployeeService");
const AttendanceService = require("../services/AttendanceService");
const LeaveService = require("../services/LeaveService");
const HRDashboardService = require("../services/HRDashboardService");

class HRController {
  async createEmployee(req, res) {
    try {
      const teacher = await EmployeeService.createEmployee(req.body);
      res
        .status(201)
        .json({
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

  async markAttendance(req, res) {
    try {
      const attendance = await AttendanceService.markAttendance(req.body);
      res.json({ success: true, data: attendance });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async applyLeave(req, res) {
    try {
      const leave = await LeaveService.applyLeave(req.body);
      res.status(201).json({ success: true, data: leave });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getHRDashboard(req, res) {
    try {
      const data = await HRDashboardService.getDashboard();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new HRController();
