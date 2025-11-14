const { Op } = require("sequelize");
const Teacher = require("../../models/TeacherModel");
const Attendance = require("../../models/AttendanceModel");
const AttendanceService = require("../../service/AttendanceService");

class Attendance_Management {
  async markAttendance(req, res) {
    try {
      const attendance = await AttendanceService.markAttendance(req.body);
      res.json({ success: true, data: attendance });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAttendanceReport(req, res) {
    try {
      const { employeeId, startDate, endDate, department } = req.query;

      const whereCondition = {};
      if (startDate && endDate) {
        whereCondition.date = {
          [Op.between]: [startDate, endDate],
        };
      }

      const includeCondition = [
        {
          model: Teacher,
          as: "teacher",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "employeeId",
            "department",
          ],
          where: {},
        },
      ];

      if (employeeId) includeCondition[0].where.id = employeeId;
      if (department) includeCondition[0].where.department = department;

      const attendance = await Attendance.findAll({
        where: whereCondition,
        include: includeCondition,
        order: [["date", "DESC"]],
      });

      // Calculate summary
      const summary = {
        totalDays: attendance.length,
        present: attendance.filter((a) => a.status === "present").length,
        absent: attendance.filter((a) => a.status === "absent").length,
        halfDay: attendance.filter((a) => a.status === "half_day").length,
        leave: attendance.filter((a) => a.status === "leave").length,
        totalWorkingHours: attendance.reduce(
          (sum, a) => sum + (a.totalHours || 0),
          0
        ),
        averageHoursPerDay:
          attendance.length > 0
            ? (
                attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) /
                attendance.length
              ).toFixed(2)
            : 0,
      };

      res.json({
        success: true,
        data: {
          records: attendance,
          summary,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching attendance report",
        error: error.message,
      });
    }
  }
}

module.exports = new Attendance_Management();