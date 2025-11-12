const AuthService = require("../service/AuthService");
const ApiResponse = require("../utils/ApiResponse");

class AuthController {
  async register(req, res) {
    try {
      const result = await AuthService.createUser(req.body);
      return ApiResponse.success(
        res,
        "User registered successfully",
        result,
        201
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async login(req, res) {
    try {
      const result = await AuthService.login(req.body.email, req.body.password);
      // You might want to add password verification here
      return ApiResponse.success(res, "Login successful", result);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getProfile(req, res) {
    try {
      const result = await AuthService.findProfile(req.user.id);
      return ApiResponse.success(res, "Profile fetched successfully", result);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      return ApiResponse.success(res, "Password changed successfully");
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
}

module.exports = new AuthController();
