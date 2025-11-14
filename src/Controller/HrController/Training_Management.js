const Training = require("../models/TrainingModel");
const TrainingParticipant = require("../models/TrainingParticipantModel");
const Teacher = require("../models/TeacherModel");


class Training_Management {
  async createTraining(req, res) {
    try {
      const trainingData = req.body;

      const training = await Training.create(trainingData);

      res.status(201).json({
        success: true,
        message: "Training created successfully",
        data: training,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating training",
        error: error.message,
      });
    }
  }

  async getTrainings(req, res) {
    try {
      const { page = 1, limit = 10, status, trainingType } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (status) whereCondition.status = status;
      if (trainingType) whereCondition.trainingType = trainingType;

      const { count, rows: trainings } = await Training.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: TrainingParticipant,
            as: "participants",
            include: [
              {
                model: Teacher,
                as: "employee",
                attributes: ["firstName", "lastName", "employeeId"],
              },
            ],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["startDate", "DESC"]],
      });

      res.json({
        success: true,
        data: trainings,
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
        message: "Error fetching trainings",
        error: error.message,
      });
    }
  }

  async registerForTraining(req, res) {
    try {
      const { trainingId, employeeId } = req.body;

      const existingRegistration = await TrainingParticipant.findOne({
        where: { trainingId, employeeId },
      });

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: "Employee already registered for this training",
        });
      }

      const registration = await TrainingParticipant.create({
        trainingId,
        employeeId,
        status: "registered",
      });

      res.status(201).json({
        success: true,
        message: "Registered for training successfully",
        data: registration,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error registering for training",
        error: error.message,
      });
    }
  }

  async updateTrainingAttendance(req, res) {
    try {
      const { id } = req.params;
      const { status, postTrainingScore, feedback, certificateIssued } =
        req.body;

      const participant = await TrainingParticipant.findByPk(id);
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: "Training participant not found",
        });
      }

      await participant.update({
        status,
        postTrainingScore,
        feedback,
        certificateIssued,
      });

      res.json({
        success: true,
        message: "Training attendance updated successfully",
        data: participant,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating training attendance",
        error: error.message,
      });
    }
  }
}

module.exports = new Training_Management();
