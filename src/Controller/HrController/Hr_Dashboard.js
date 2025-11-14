const { Op, sequelize } = require("sequelize");
const Teacher = require("../../models/TeacherModel");
const Attendance = require("../../models/AttendanceModel");
const Leave = require("../../models/LeaveModel");
const Recruitment = require("../../models/RecruitmentModel");
const Payroll = require("../../models/PayrollModel");
const Training = require("../../models/TrainingModel");
const TrainingParticipant = require("../../models/TrainingParticipantModel");
const JobApplication = require("../../models/JobApplicationModel");
const PerformanceReview = require("../../models/PerformanceReviewModel");
const User = require("../../models/UserModel");


class Hr_Dashboard {
  async getHRDashboard(req, res) {
    try {
      const totalEmployees = await Teacher.count({ where: { isActive: true } });
      const newHires = await Teacher.count({
        where: {
          joiningDate: {
            [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          },
        },
      });

      const today = new Date().toISOString().split("T")[0];
      const presentToday = await Attendance.count({
        where: {
          date: today,
          status: "present",
        },
      });

      const pendingLeaves = await Leave.count({
        where: { status: "pending" },
      });

      const openPositions = await Recruitment.count({
        where: { status: "open" },
      });

      // Payroll statistics
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const monthlyPayroll = await Payroll.sum("netSalary", {
        where: {
          salaryMonth: currentMonth.toString().padStart(2, "0"),
          salaryYear: currentYear,
          paymentStatus: "paid",
        },
      });

      const pendingPayroll = await Payroll.count({
        where: {
          paymentStatus: "pending",
        },
      });

      // Department-wise employee count
      const departmentStats = await Teacher.findAll({
        attributes: [
          "department",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: { isActive: true },
        group: ["department"],
      });

      // Training statistics
      const upcomingTrainings = await Training.count({
        where: {
          startDate: {
            [Op.gte]: new Date(),
          },
        },
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalEmployees,
            presentToday,
            pendingLeaves,
            newHires,
            openPositions,
            monthlyPayroll: monthlyPayroll || 0,
            pendingPayroll,
            upcomingTrainings,
          },
          departmentStats,
          recentActivities: {
            newEmployees: await Teacher.findAll({
              limit: 5,
              order: [["createdAt", "DESC"]],
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["email"],
                },
              ],
            }),
            recentLeaves: await Leave.findAll({
              limit: 5,
              order: [["createdAt", "DESC"]],
              include: [
                {
                  model: Teacher,
                  as: "teacher",
                  attributes: ["firstName", "lastName"],
                },
              ],
            }),
            upcomingTrainings: await Training.findAll({
              where: {
                startDate: {
                  [Op.gte]: new Date(),
                },
              },
              limit: 5,
              order: [["startDate", "ASC"]],
            }),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching HR dashboard",
        error: error.message,
      });
    }
  }
  async getHRAnalytics(req, res) {
    try {
      const { period } = req.query; // monthly, quarterly, yearly

      // Employee turnover rate
      const totalEmployees = await Teacher.count();
      const terminatedEmployees = await Teacher.count({
        where: { isActive: false },
      });
      const turnoverRate =
        totalEmployees > 0 ? (terminatedEmployees / totalEmployees) * 100 : 0;

      // Attendance rate
      const currentMonth = new Date().toISOString().slice(0, 7);
      const totalAttendance = await Attendance.count({
        where: {
          date: {
            [Op.like]: `${currentMonth}%`,
          },
        },
      });
      const presentAttendance = await Attendance.count({
        where: {
          date: {
            [Op.like]: `${currentMonth}%`,
          },
          status: "present",
        },
      });
      const attendanceRate =
        totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

      // Training effectiveness
      const completedTrainings = await Training.count({
        where: { status: "completed" },
      });
      const trainingParticipants = await TrainingParticipant.count({
        where: { status: "completed" },
      });

      // Recruitment metrics
      const totalApplications = await JobApplication.count();
      const hiredApplications = await JobApplication.count({
        where: { status: "hired" },
      });
      const hiringSuccessRate =
        totalApplications > 0
          ? (hiredApplications / totalApplications) * 100
          : 0;

      res.json({
        success: true,
        data: {
          turnoverRate: turnoverRate.toFixed(2),
          attendanceRate: attendanceRate.toFixed(2),
          trainingEffectiveness: {
            completedTrainings,
            totalParticipants: trainingParticipants,
            averageParticipants:
              completedTrainings > 0
                ? (trainingParticipants / completedTrainings).toFixed(1)
                : 0,
          },
          recruitmentMetrics: {
            totalApplications,
            hiredCandidates: hiredApplications,
            successRate: hiringSuccessRate.toFixed(2),
          },
          departmentPerformance: await this.getDepartmentPerformance(),
          employeeSatisfaction: await this.getEmployeeSatisfactionMetrics(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching HR analytics",
        error: error.message,
      });
    }
  }

  async getDepartmentPerformance() {
    const departments = await Teacher.findAll({
      attributes: ["department"],
      group: ["department"],
      where: { isActive: true },
    });

    const performance = [];

    for (const dept of departments) {
      const employees = await Teacher.count({
        where: { department: dept.department, isActive: true },
      });

      const avgPerformance = await PerformanceReview.findOne({
        attributes: [
          [sequelize.fn("AVG", sequelize.col("overallRating")), "avgRating"],
        ],
        include: [
          {
            model: Teacher,
            as: "employee",
            where: { department: dept.department },
          },
        ],
        raw: true,
      });

      performance.push({
        department: dept.department,
        employeeCount: employees,
        averageRating: avgPerformance
          ? parseFloat(avgPerformance.avgRating).toFixed(2)
          : 0,
      });
    }

    return performance;
  }

  async getEmployeeSatisfactionMetrics() {
    // This would typically come from employee surveys
    // For now, we'll calculate based on performance reviews and attendance
    const recentReviews = await PerformanceReview.findAll({
      where: {
        reviewDate: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        },
      },
      attributes: ["overallRating"],
    });

    const avgRating =
      recentReviews.length > 0
        ? recentReviews.reduce(
            (sum, review) => sum + parseFloat(review.overallRating),
            0
          ) / recentReviews.length
        : 0;

    const attendanceRate = await Attendance.findOne({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")
          ),
          "present",
        ],
      ],
      where: {
        date: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      },
      raw: true,
    });

    const calculatedSatisfaction =
      attendanceRate && attendanceRate.total > 0
        ? (attendanceRate.present / attendanceRate.total) * 40 + avgRating * 12
        : 0;

    return {
      overallSatisfaction: Math.min(100, calculatedSatisfaction).toFixed(1),
      averageRating: avgRating.toFixed(2),
      basedOn: "performance_reviews_attendance",
    };
  }
}

module.exports = new Hr_Dashboard();
