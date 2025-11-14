const Recruitment = require("../models/RecruitmentModel");
const JobApplication = require("../models/JobApplicationModel");
const User = require("../models/UserModel");


class Recruitment_Management {
  async createJobOpening(req, res) {
    try {
      const jobData = req.body;
      jobData.createdBy = req.user.id;

      const job = await Recruitment.create(jobData);

      res.status(201).json({
        success: true,
        message: "Job opening created successfully",
        data: job,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating job opening",
        error: error.message,
      });
    }
  }

  async getJobOpenings(req, res) {
    try {
      const { page = 1, limit = 10, status, department } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (status) whereCondition.status = status;
      if (department) whereCondition.department = department;

      const { count, rows: jobs } = await Recruitment.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["email"],
          },
          {
            model: JobApplication,
            as: "applications",
            attributes: ["id", "status"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["createdAt", "DESC"]],
      });

      res.json({
        success: true,
        data: jobs,
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
        message: "Error fetching job openings",
        error: error.message,
      });
    }
  }

  async applyForJob(req, res) {
    try {
      const applicationData = req.body;
      applicationData.applicationDate = new Date();

      const application = await JobApplication.create(applicationData);

      res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: application,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error submitting application",
        error: error.message,
      });
    }
  }

  async getJobApplications(req, res) {
    try {
      const { page = 1, limit = 10, status, recruitmentId } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (status) whereCondition.status = status;
      if (recruitmentId) whereCondition.recruitmentId = recruitmentId;

      const { count, rows: applications } =
        await JobApplication.findAndCountAll({
          where: whereCondition,
          include: [
            {
              model: Recruitment,
              as: "job",
              attributes: ["id", "jobTitle", "department"],
            },
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
          order: [["applicationDate", "DESC"]],
        });

      res.json({
        success: true,
        data: applications,
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
        message: "Error fetching job applications",
        error: error.message,
      });
    }
  }

  async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, interviewDate, interviewNotes, rating } = req.body;

      const application = await JobApplication.findByPk(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      await application.update({
        status,
        interviewDate,
        interviewNotes,
        rating,
      });

      res.json({
        success: true,
        message: "Application status updated successfully",
        data: application,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating application status",
        error: error.message,
      });
    }
  }
}

module.exports = new Recruitment_Management();
