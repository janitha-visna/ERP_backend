const PerformanceReview = require("../../models/PerformanceReviewModel");
const Teacher = require("../../models/TeacherModel");
const User = require("../../models/UserModel");


class Performance_Management {
  async createPerformanceReview(req, res) {
    try {
      const reviewData = req.body;
      reviewData.reviewerId = req.user.id;

      // Calculate overall rating
      const {
        technicalSkills,
        communication,
        teamwork,
        productivity,
        attendance,
      } = reviewData;
      reviewData.overallRating =
        (technicalSkills +
          communication +
          teamwork +
          productivity +
          attendance) /
        5;

      const review = await PerformanceReview.create(reviewData);

      res.status(201).json({
        success: true,
        message: "Performance review created successfully",
        data: review,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating performance review",
        error: error.message,
      });
    }
  }

  async getPerformanceReviews(req, res) {
    try {
      const { page = 1, limit = 10, employeeId, reviewPeriod } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (employeeId) whereCondition.employeeId = employeeId;
      if (reviewPeriod) whereCondition.reviewPeriod = reviewPeriod;

      const { count, rows: reviews } = await PerformanceReview.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Teacher,
            as: "employee",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "employeeId",
              "department",
            ],
          },
          {
            model: User,
            as: "reviewer",
            attributes: ["email"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["reviewDate", "DESC"]],
      });

      res.json({
        success: true,
        data: reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching performance reviews",
        error: error.message,
      });
    }
  }

  async acknowledgeReview(req, res) {
    try {
      const { id } = req.params;
      const { employeeComments } = req.body;

      const review = await PerformanceReview.findByPk(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Performance review not found",
        });
      }

      await review.update({
        status: "acknowledged",
        employeeComments,
      });

      res.json({
        success: true,
        message: "Performance review acknowledged",
        data: review,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error acknowledging review",
        error: error.message,
      });
    }
  }
}
module.exports = new Performance_Management();
