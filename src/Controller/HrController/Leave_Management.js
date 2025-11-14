const AttendanceService = require("../../service/AttendanceService");
const LeaveService = require("../../service/LeaveService");

const Leave = require("../../models/LeaveModel");
const Teacher = require("../../models/TeacherModel");
const User = require("../../models/UserModel");
const { Op } = require("sequelize");

class Leave_Management {
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

  async getLeaveApplications(req, res) {
    try {
      const { page = 1, limit = 10, status, employeeId, leaveType } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (status) whereCondition.status = status;
      if (employeeId) whereCondition.teacherId = employeeId;
      if (leaveType) whereCondition.leaveType = leaveType;

      const { count, rows: leaves } = await Leave.findAndCountAll({
        where: whereCondition,
        include: [
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
          },
          {
            model: User,
            as: "approver",
            attributes: ["email"],
            required: false,
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: leaves,
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
        message: "Error fetching leave applications",
        error: error.message,
      });
    }
  }

  async updateLeaveStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const leave = await Leave.findByPk(id);
      if (!leave) {
        return res.status(404).json({
          success: false,
          message: "Leave application not found",
        });
      }

      const updateData = {
        status,
        approvedBy: req.user.id,
        approvedAt: new Date(),
      };

      if (status === "rejected" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      await leave.update(updateData);

      res.json({
        success: true,
        message: `Leave application ${status} successfully`,
        data: leave,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating leave status",
        error: error.message,
      });
    }
  }

  async getLeaveBalance(req, res) {
    try {
      const { employeeId } = req.params;
      const currentYear = new Date().getFullYear();

      const leaves = await Leave.findAll({
        where: {
          teacherId: employeeId,
          status: "approved",
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [
                  new Date(currentYear, 0, 1),
                  new Date(currentYear, 11, 31),
                ],
              },
            },
            {
              endDate: {
                [Op.between]: [
                  new Date(currentYear, 0, 1),
                  new Date(currentYear, 11, 31),
                ],
              },
            },
          ],
        },
      });

      const balance = {
        casual:
          12 -
          leaves
            .filter((l) => l.leaveType === "casual")
            .reduce((sum, l) => sum + l.totalDays, 0),
        sick:
          10 -
          leaves
            .filter((l) => l.leaveType === "sick")
            .reduce((sum, l) => sum + l.totalDays, 0),
        annual:
          21 -
          leaves
            .filter((l) => l.leaveType === "annual")
            .reduce((sum, l) => sum + l.totalDays, 0),
        maternity:
          84 -
          leaves
            .filter((l) => l.leaveType === "maternity")
            .reduce((sum, l) => sum + l.totalDays, 0),
        paternity:
          7 -
          leaves
            .filter((l) => l.leaveType === "paternity")
            .reduce((sum, l) => sum + l.totalDays, 0),
      };

      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error calculating leave balance",
        error: error.message,
      });
    }
  }
}
module.exports = new Leave_Management();
