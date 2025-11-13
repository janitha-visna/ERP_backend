const express = require("express");
const router = express.Router();
const financeController = require("../Controller/FinanceController");
const authMiddleware = require("../middleware/AuthMiddleware");
const roleMiddleware = require("../middleware/RoleMiddleware");

// Apply authentication to all Finance routes
router.use(authMiddleware);

// Fee structure management
router.post(
  "/fee-structures",
  roleMiddleware(["admin", "finance_staff"]),
  financeController.createFeeStructure
);
router.get("/fee-structures", financeController.getFeeStructures);
router.put(
  "/fee-structures/:id",
  roleMiddleware(["admin", "finance_staff"]),
  financeController.updateFeeStructure
);

// Dashboard
router.get("/dashboard", financeController.getFinanceDashboard);

module.exports = router;
