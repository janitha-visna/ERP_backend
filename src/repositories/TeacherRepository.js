const { Teacher } = require("../models");

class TeacherRepository {
  async create(data) {
    return await Teacher.create(data);
  }
}

module.exports = new TeacherRepository();
