const express = require("express");

const router = express.Router();
const authController = require("../Controller/AuthController");
const authMiddleware = require("../middleware/AuthMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
