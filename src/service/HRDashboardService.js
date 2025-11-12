const EmployeeService = require("./EmployeeService");
const AttendanceService = require("./AttendanceService");
const LeaveService = require("./LeaveService");
const { Teacher } = require("../models");
const { Op } = require("sequelize");

class HRDashboardService {
  async getDashboard() {
    const totalEmployees = await Teacher.count({ where: { isActive: true } });

    const today = new Date().toISOString().split("T")[0];
    const presentToday = await AttendanceService.markAttendance({ date: today })
      .count;

    const pendingLeaves = await LeaveService.countPendingLeaves();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newHires = await Teacher.count({
      where: { joiningDate: { [Op.gte]: thirtyDaysAgo } },
    });

    const currentMonth = new Date().toISOString().slice(0, 7);
    const attendanceSummary = await AttendanceService.getMonthlySummary(
      currentMonth
    );

    const recentEmployees = await EmployeeService.getRecentEmployees(5);

    return {
      totalEmployees,
      presentToday,
      pendingLeaves,
      newHires,
      attendanceSummary,
      recentEmployees,
    };
  }
}

module.exports = new HRDashboardService();
