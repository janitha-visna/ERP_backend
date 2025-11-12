const { User, Teacher } = require("../models");

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findByEmailWithTeacher(email) {
    return await User.findOne({
      where: { email },
      include: [{ model: Teacher, as: "teacherProfile" }],
    });
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  async createUser(data) {
    return await User.create({
      email: data.email,
      password: data.password,
      role: data.role || "teacher",
    });
  }

  async findProfile(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [{ model: Teacher, as: "teacherProfile" }],
    });
  }
}

module.exports = new UserRepository();
