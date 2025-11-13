const UserRepository = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


class AuthService {
  async findByEmail(email) {
    return await UserRepository.findByEmail(email);
  }

  async findByEmailWithTeacher(email) {
    return await UserRepository.findByEmailWithTeacher(email);
  }

  async findById(id) {
    return await UserRepository.findById(id);
  }

  async createUser(data) {
    return await UserRepository.createUser(data);
  }

  async findProfile(id) {
    return await UserRepository.findProfile(id);
  }

  async updateLastLogin(id) {
    const user = await UserRepository.findById(id);
    user.lastLogin = new Date();
    await user.save();
  }

  // New login method
  async login(email, password) {
    const user = await this.findByEmailWithTeacher(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Update last login
    await this.updateLastLogin(user);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        teacherProfile: user.teacherProfile,
      },
      token,
    };
  }

  // Updated change password method
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }

  async updateLastLogin(user) {
    user.lastLogin = new Date();
    await user.save();
  }
}

module.exports = new AuthService();
