const Teacher = require("../../models/TeacherModel");
const SalaryStructure = require("../../models/FeeStructureModel"); // or your SalaryStructure model
const Payroll = require("../../models/PayrollModel");
const Attendance = require("../../models/AttendanceModel");
const Leave = require("../../models/LeaveModel");
const { Op } = require("sequelize");
const User = require("../../models/UserModel");

class Salary_Management {
  async createSalaryStructure(req, res) {
    try {
      const salaryData = req.body;

      // Calculate net salary
      const totalEarnings =
        salaryData.basicSalary +
        salaryData.houseRentAllowance +
        salaryData.travelAllowance +
        salaryData.medicalAllowance +
        salaryData.specialAllowance;

      const totalDeductions =
        salaryData.providentFund +
        salaryData.professionalTax +
        salaryData.incomeTax +
        salaryData.otherDeductions;

      salaryData.netSalary = totalEarnings - totalDeductions;

      const salaryStructure = await SalaryStructure.create(salaryData);

      res.status(201).json({
        success: true,
        message: "Salary structure created successfully",
        data: salaryStructure,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating salary structure",
        error: error.message,
      });
    }
  }

  async generatePayroll(req, res) {
    try {
      const { month, year } = req.body;

      const employees = await Teacher.findAll({
        where: { isActive: true },
        include: [
          {
            model: SalaryStructure,
            as: "salaryStructure",
            where: { isActive: true },
          },
        ],
      });

      const payrolls = [];

      for (const employee of employees) {
        // Calculate attendance-based adjustments
        const attendanceRecords = await Attendance.findAll({
          where: {
            teacherId: employee.id,
            date: {
              [Op.between]: [
                new Date(year, month - 1, 1),
                new Date(year, month, 0),
              ],
            },
          },
        });

        const leaveRecords = await Leave.findAll({
          where: {
            teacherId: employee.id,
            status: "approved",
            [Op.or]: [
              {
                startDate: {
                  [Op.between]: [
                    new Date(year, month - 1, 1),
                    new Date(year, month, 0),
                  ],
                },
              },
              {
                endDate: {
                  [Op.between]: [
                    new Date(year, month - 1, 1),
                    new Date(year, month, 0),
                  ],
                },
              },
            ],
          },
        });

        // Calculate adjustments
        const overtimeHours = attendanceRecords.reduce(
          (total, record) => total + record.overtimeMinutes / 60,
          0
        );

        const lateMinutes = attendanceRecords.reduce(
          (total, record) => total + record.lateMinutes,
          0
        );

        const unpaidLeaves = leaveRecords.filter(
          (leave) => leave.leaveType === "casual" || leave.leaveType === "sick"
        ).length;

        const salary = employee.salaryStructure;
        const overtimeRate = salary.basicSalary / (22 * 8); // Assuming 22 working days, 8 hours per day
        const lateDeductionRate = salary.basicSalary / (22 * 8 * 60); // Per minute
        const perDaySalary = salary.basicSalary / 22;

        const payrollData = {
          employeeId: employee.id,
          salaryMonth: month.toString().padStart(2, "0"),
          salaryYear: year,
          basicSalary: salary.basicSalary,
          allowances: {
            houseRent: salary.houseRentAllowance,
            travel: salary.travelAllowance,
            medical: salary.medicalAllowance,
            special: salary.specialAllowance,
          },
          deductions: {
            providentFund: salary.providentFund,
            professionalTax: salary.professionalTax,
            incomeTax: salary.incomeTax,
            other: salary.otherDeductions,
          },
          overtimeAmount: overtimeHours * overtimeRate,
          lateDeductions: lateMinutes * lateDeductionRate,
          leaveDeductions: unpaidLeaves * perDaySalary,
          bonus: 0, // Can be configured
        };

        // Calculate totals
        const totalEarnings =
          payrollData.basicSalary +
          Object.values(payrollData.allowances).reduce((a, b) => a + b, 0) +
          payrollData.overtimeAmount +
          payrollData.bonus;

        const totalDeductions =
          Object.values(payrollData.deductions).reduce((a, b) => a + b, 0) +
          payrollData.lateDeductions +
          payrollData.leaveDeductions;

        payrollData.totalEarnings = totalEarnings;
        payrollData.totalDeductions = totalDeductions;
        payrollData.netSalary = totalEarnings - totalDeductions;

        const payroll = await Payroll.create(payrollData);
        payrolls.push(payroll);
      }

      res.json({
        success: true,
        message: `Payroll generated for ${payrolls.length} employees`,
        data: payrolls,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error generating payroll",
        error: error.message,
      });
    }
  }

  async getPayrolls(req, res) {
    try {
      const { page = 1, limit = 10, month, year, employeeId } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (month) whereCondition.salaryMonth = month;
      if (year) whereCondition.salaryYear = year;
      if (employeeId) whereCondition.employeeId = employeeId;

      const { count, rows: payrolls } = await Payroll.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Teacher,
            as: "employee",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "employeeId",
              "department",
            ],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["salaryYear", "DESC"],
          ["salaryMonth", "DESC"],
        ],
      });

      res.json({
        success: true,
        data: payrolls,
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
        message: "Error fetching payrolls",
        error: error.message,
      });
    }
  }

  async processSalaryPayment(req, res) {
    try {
      const { payrollId, paymentMethod, paymentDate, transactionId } = req.body;

      const payroll = await Payroll.findByPk(payrollId);
      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll record not found",
        });
      }

      await payroll.update({
        paymentStatus: "paid",
        paymentMethod,
        paymentDate: paymentDate || new Date(),
        transactionId,
      });

      res.json({
        success: true,
        message: "Salary payment processed successfully",
        data: payroll,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error processing salary payment",
        error: error.message,
      });
    }
  }

  async getSalarySlip(req, res) {
    try {
      const { payrollId } = req.params;

      const payroll = await Payroll.findByPk(payrollId, {
        include: [
          {
            model: Teacher,
            as: "employee",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["email"],
              },
            ],
          },
        ],
      });

      if (!payroll) {
        return res.status(404).json({
          success: false,
          message: "Payroll record not found",
        });
      }

      res.json({
        success: true,
        data: payroll,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching salary slip",
        error: error.message,
      });
    }
  }
}

module.exports = new Salary_Management();
