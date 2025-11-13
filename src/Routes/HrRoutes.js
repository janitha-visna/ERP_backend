const express = require("express");
const router = express.Router();
const hrController = require("../Controller/HrController");
const authMiddleware = require("../middleware/AuthMiddleware");
const roleMiddleware = require("../middleware/RoleMiddleware");

// Apply authentication to all HR routes
router.use(authMiddleware);

// Employee management
router.post(
  "/employees",
  roleMiddleware(["admin", "hr_staff"]),
  hrController.createEmployee
);
router.get("/employees", hrController.getAllEmployees);
router.get("/employees/:id", hrController.getEmployeeById);
router.put(
  "/employees/:id",
  roleMiddleware(["admin", "hr_staff"]),
  hrController.updateEmployee
);

// Attendance management
router.post(
  "/attendance",
  roleMiddleware(["admin", "hr_staff"]),
  hrController.markAttendance
);

// Leave management
router.post("/leaves", hrController.applyLeave);

// Dashboard
router.get("/dashboard", hrController.getHRDashboard);

module.exports = router;
