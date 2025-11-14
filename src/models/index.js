const User = require("../models/UserModel");
const Teacher = require("../models/TeacherModel");
const Student = require("../models/StudentModel");
const Attendance = require("../models/AttendanceModel");
const Leave = require("../models/LeaveModel");
const FeeStructure = require("../models/FeeStructureModel");
const SalaryStructure = require("../models/SalaryStructureModel");
const Payroll = require("../models/PayrollModel");
const Expense = require("../models/ExpenseModel");
const Recruitment = require("../models/RecruitmentModel");
const JobApplication = require("../models/JobApplicationModel");
const PerformanceReview = require("../models/PerformanceReviewModel");
const Training = require("../models/TrainingModel");
const TrainingParticipant = require("../models/TrainingParticipantModel");
const Budget = require("../models/BudgetModel");
const Invoice = require("../models/InvoiceModel");
const Payment = require("../models/PaymentModel");
const Asset = require("../models/AssetModel");
const Tax = require("../models/TaxModel");
const FinancialTransaction = require("../models/FinancialTransactionModel");
const ChartOfAccount = require("../models/ChartOfAccountModel");

// ========== HR ASSOCIATIONS ==========
User.hasOne(Teacher, { foreignKey: "userId", as: "teacherProfile" });
Teacher.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasOne(Student, { foreignKey: "userId", as: "studentProfile" });
Student.belongsTo(User, { foreignKey: "userId", as: "user" });

Teacher.hasMany(Attendance, {
  foreignKey: "teacherId",
  as: "attendanceRecords",
});
Attendance.belongsTo(Teacher, { foreignKey: "teacherId", as: "teacher" });

Teacher.hasMany(Leave, { foreignKey: "teacherId", as: "leaves" });
Leave.belongsTo(Teacher, { foreignKey: "teacherId", as: "teacher" });

User.hasMany(Leave, { foreignKey: "approvedBy", as: "approvedLeaves" });
Leave.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });

Teacher.hasOne(SalaryStructure, {
  foreignKey: "employeeId",
  as: "salaryStructure",
});
SalaryStructure.belongsTo(Teacher, {
  foreignKey: "employeeId",
  as: "employee",
});

Teacher.hasMany(Payroll, { foreignKey: "employeeId", as: "payrolls" });
Payroll.belongsTo(Teacher, { foreignKey: "employeeId", as: "employee" });

User.hasMany(Recruitment, {
  foreignKey: "createdBy",
  as: "createdJobOpenings",
});
Recruitment.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

Recruitment.hasMany(JobApplication, {
  foreignKey: "recruitmentId",
  as: "applications",
});
JobApplication.belongsTo(Recruitment, {
  foreignKey: "recruitmentId",
  as: "job",
});

Teacher.hasMany(PerformanceReview, {
  foreignKey: "employeeId",
  as: "performanceReviews",
});
PerformanceReview.belongsTo(Teacher, {
  foreignKey: "employeeId",
  as: "employee",
});

User.hasMany(PerformanceReview, {
  foreignKey: "reviewerId",
  as: "conductedReviews",
});
PerformanceReview.belongsTo(User, { foreignKey: "reviewerId", as: "reviewer" });

Training.hasMany(TrainingParticipant, {
  foreignKey: "trainingId",
  as: "participants",
});
TrainingParticipant.belongsTo(Training, {
  foreignKey: "trainingId",
  as: "training",
});

Teacher.hasMany(TrainingParticipant, {
  foreignKey: "employeeId",
  as: "trainingParticipations",
});
TrainingParticipant.belongsTo(Teacher, {
  foreignKey: "employeeId",
  as: "employee",
});

// ========== FINANCE ASSOCIATIONS ==========
User.hasMany(FeeStructure, {
  foreignKey: "createdBy",
  as: "createdFeeStructures",
});
FeeStructure.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.hasMany(Expense, { foreignKey: "approvedBy", as: "approvedExpenses" });
Expense.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });

User.hasMany(Budget, { foreignKey: "createdBy", as: "createdBudgets" });
Budget.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

User.hasMany(Budget, { foreignKey: "approvedBy", as: "approvedBudgets" });
Budget.belongsTo(User, { foreignKey: "approvedBy", as: "approver" });

FeeStructure.hasMany(Invoice, { foreignKey: "feeStructureId", as: "invoices" });
Invoice.belongsTo(FeeStructure, {
  foreignKey: "feeStructureId",
  as: "feeStructure",
});

Student.hasMany(Invoice, { foreignKey: "studentId", as: "invoices" });
Invoice.belongsTo(Student, { foreignKey: "studentId", as: "student" });

Invoice.hasMany(Payment, { foreignKey: "invoiceId", as: "payments" });
Payment.belongsTo(Invoice, { foreignKey: "invoiceId", as: "invoice" });

Student.hasMany(Payment, { foreignKey: "studentId", as: "payments" });
Payment.belongsTo(Student, { foreignKey: "studentId", as: "student" });

User.hasMany(Payment, { foreignKey: "collectedBy", as: "collectedPayments" });
Payment.belongsTo(User, { foreignKey: "collectedBy", as: "collector" });

Teacher.hasMany(Asset, { foreignKey: "assignedTo", as: "assignedAssets" });
Asset.belongsTo(Teacher, {
  foreignKey: "assignedTo",
  as: "assignedToEmployee",
});

User.hasMany(Tax, { foreignKey: "createdBy", as: "createdTaxes" });
Tax.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

Budget.hasMany(FinancialTransaction, {
  foreignKey: "budgetId",
  as: "transactions",
});
FinancialTransaction.belongsTo(Budget, {
  foreignKey: "budgetId",
  as: "budget",
});

Invoice.hasMany(FinancialTransaction, {
  foreignKey: "invoiceId",
  as: "transactions",
});
FinancialTransaction.belongsTo(Invoice, {
  foreignKey: "invoiceId",
  as: "invoice",
});

Expense.hasMany(FinancialTransaction, {
  foreignKey: "expenseId",
  as: "transactions",
});
FinancialTransaction.belongsTo(Expense, {
  foreignKey: "expenseId",
  as: "expense",
});

User.hasMany(FinancialTransaction, {
  foreignKey: "createdBy",
  as: "createdTransactions",
});
FinancialTransaction.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
});

ChartOfAccount.hasMany(FinancialTransaction, {
  foreignKey: "accountId",
  as: "transactions",
});
FinancialTransaction.belongsTo(ChartOfAccount, {
  foreignKey: "accountId",
  as: "account",
});

ChartOfAccount.hasMany(ChartOfAccount, {
  foreignKey: "parentAccount",
  as: "subAccounts",
});
ChartOfAccount.belongsTo(ChartOfAccount, {
  foreignKey: "parentAccount",
  as: "parent",
});

module.exports = {
  User,
  Teacher,
  Student,
  Attendance,
  Leave,
  FeeStructure,
  SalaryStructure,
  Payroll,
  Expense,
  Recruitment,
  JobApplication,
  PerformanceReview,
  Training,
  TrainingParticipant,
  Budget,
  Invoice,
  Payment,
  Asset,
  Tax,
  FinancialTransaction,
  ChartOfAccount,
};
