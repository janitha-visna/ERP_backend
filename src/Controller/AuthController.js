const jwt = require("jsonwebtoken");
const { User, Teacher } = require("../models");
const { Op } = require("sequelize");

class AuthController {
  async register(req, res) {
    try {
      const { email, password, role, teacherData } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        role: role || "teacher",
      });

      // Create teacher profile if role is teacher

      let teacher = null;
      if (role === "teacher" && teacherData) {
        teacher = await Teacher.create({
          ...teacherData,
          userId: user.id,
          employeeId: `EMP${Date.now()}`,
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          teacher,

          token,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error during registration",
        error: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: Teacher,
            as: "teacherProfile",
            attributes: ["id", "firstName", "lastName", "employeeId"],
          },
        ],
      });

      if (!user || !(await user.validatePassword(password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            teacherProfile: user.teacherProfile,
          },
          token,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error during login",
        error: error.message,
      });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: Teacher,
            as: "teacherProfile",
          },
        ],
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching profile",
        error: error.message,
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!(await user.validatePassword(currentPassword))) {
        return res.status(400).json({
          success: false,

          message: "Current password is incorrect",
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error changing password",
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();
