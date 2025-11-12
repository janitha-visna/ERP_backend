const { Attendance } = require("../models");

class AttendanceService {
  async markAttendance({
    teacherId,
    date,
    checkIn,
    checkOut,
    status = "present",
    notes,
  }) {
    let attendance = await Attendance.findOne({ where: { teacherId, date } });

    if (attendance) {
      await attendance.update({
        checkIn: checkIn || attendance.checkIn,
        checkOut: checkOut || attendance.checkOut,
        status: status || attendance.status,
        notes: notes || attendance.notes,
      });
    } else {
      attendance = await Attendance.create({
        teacherId,
        date,
        checkIn,
        checkOut,
        status,
        notes,
      });
    }

    if (checkIn && checkOut) {
      const diffMs = new Date(checkOut) - new Date(checkIn);
      attendance.totalHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
      await attendance.save();
    }

    return attendance;
  }

  async getMonthlySummary(month) {
    const { Op, fn, col } = require("sequelize");
    return await Attendance.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      where: { date: { [Op.like]: `${month}%` } },
      group: ["status"],
    });
  }
}

module.exports = new AttendanceService();
