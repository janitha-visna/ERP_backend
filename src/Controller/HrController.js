const { Teacher, Attendance, Leave, User } = require("../models");
const { Op } = require("sequelize");

class HRController {
  // Create new employee (teacher)
  async createEmployee(req, res) {
    try {
      const teacherData = req.body;

      // Generate employee ID

      const employeeCount = await Teacher.count();
      teacherData.employeeId = `EMP${(employeeCount + 1)
        .toString()
        .padStart(4, "0")}`;

      const teacher = await Teacher.create(teacherData);

      res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: teacher,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating employee",
        error: error.message,
      });
    }
  }

  // Get all employees with pagination and search
  async getAllEmployees(req, res) {
    try {
      const { page = 1, limit = 10, search = "", department = "" } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};

      if (search) {
        whereCondition[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { employeeId: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (department) {
        whereCondition.department = department;
      }

      const { count, rows: teachers } = await Teacher.findAndCountAll({
        where: whereCondition,
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

      res.json({
        success: true,

        data: teachers,
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
        message: "Error fetching employees",
        error: error.message,
      });
    }
  }

  // Get employee by ID
  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;

      const teacher = await Teacher.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",

            attributes: ["email", "role", "isActive", "lastLogin"],
          },
        ],
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      res.json({
        success: true,
        data: teacher,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching employee",
        error: error.message,
      });
    }
  }

  // Update employee
  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      await teacher.update(updateData);

      res.json({
        success: true,
        message: "Employee updated successfully",
        data: teacher,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating employee",
        error: error.message,
      });
    }
  }

  // Mark attendance
  async markAttendance(req, res) {
    try {
      const { teacherId, date, checkIn, checkOut, status, notes } = req.body;

      let attendance = await Attendance.findOne({
        where: { teacherId, date },
      });

      if (attendance) {
        // Update existing attendance
        await attendance.update({
          checkIn: checkIn || attendance.checkIn,
          checkOut: checkOut || attendance.checkOut,
          status: status || attendance.status,
          notes: notes || attendance.notes,
        });
      } else {
        // Create new attendance record
        attendance = await Attendance.create({
          teacherId,
          date,
          checkIn,
          checkOut,

          status: status || "present",
          notes,
        });
      }

      // Calculate total hours if both check-in and check-out are provided
      if (checkIn && checkOut) {
        const diffMs = new Date(checkOut) - new Date(checkIn);
        attendance.totalHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
        await attendance.save();
      }

      res.json({
        success: true,
        message: "Attendance marked successfully",
        data: attendance,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error marking attendance",
        error: error.message,
      });
    }
  }

  // Apply for leave
  async applyLeave(req, res) {
    try {
      const leaveData = req.body;

      // Calculate total days
      const startDate = new Date(leaveData.startDate);
      const endDate = new Date(leaveData.endDate);
      const totalDays =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      leaveData.totalDays = totalDays;

      const leave = await Leave.create(leaveData);

      res.status(201).json({
        success: true,
        message: "Leave application submitted successfully",
        data: leave,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error applying for leave",
        error: error.message,
      });
    }
  }

  // Get HR dashboard statistics
  async getHRDashboard(req, res) {
    try {
      const totalEmployees = await Teacher.count({ where: { isActive: true } });

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

      // Recent employees (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const newHires = await Teacher.count({
        where: {
          joiningDate: {
            [Op.gte]: thirtyDaysAgo,
          },
        },
      });

      // Attendance summary for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const attendanceSummary = await Attendance.findAll({
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        where: {
          date: {
            [Op.like]: `${currentMonth}%`,
          },
        },
        group: ["status"],
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalEmployees,
            presentToday,

            pendingLeaves,
            newHires,
          },
          attendanceSummary,
          recentEmployees: await Teacher.findAll({
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
}

module.exports = new HRController();
