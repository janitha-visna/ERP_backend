const User = require("./User");
const Teacher = require("./Teacher");
const Attendance = require("./Attendance");
const Leave = require("./Leave");
const FeeStructure = require("./FeeStructure");

// Define associations
User.hasOne(Teacher, { foreignKey: "userId", as: "teacherProfile" });
Teacher.belongsTo(User, { foreignKey: "userId", as: "user" });

Teacher.hasMany(Attendance, {
  foreignKey: "teacherId",
  as: "attendanceRecords",
});
Attendance.belongsTo(Teacher, { foreignKey: "teacherId", as: "teacher" });

Teacher.hasMany(Leave, { foreignKey: "teacherId", as: "leaves" });
Leave.belongsTo(Teacher, { foreignKey: "teacherId", as: "teacher" });

User.hasMany(FeeStructure, {
  foreignKey: "createdBy",
  as: "createdFeeStructures",
});
FeeStructure.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

module.exports = {
  User,
  Teacher,
  Attendance,
  Leave,
  FeeStructure,
};
