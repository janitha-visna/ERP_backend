const { Leave } = require("../models");

class LeaveService {
  async applyLeave(data) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    data.totalDays =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    return await Leave.create(data);
  }

  async countPendingLeaves() {
    return await Leave.count({ where: { status: "pending" } });
  }
}

module.exports = new LeaveService();
