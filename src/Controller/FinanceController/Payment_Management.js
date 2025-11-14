const { Op } = require("sequelize");
const Payment = require("../../models/PaymentModel");
const Invoice = require("../../models/InvoiceModel");
const Student = require("../../models/StudentModel");
const User = require("../../models/UserModel");
const FinancialTransaction = require("../../models/FinancialTransactionModel");

class Payment_Management {
  async processPayment(req, res) {
    try {
      const paymentData = req.body;
      paymentData.collectedBy = req.user.id;

      // Generate payment number
      const paymentCount = await Payment.count();
      paymentData.paymentNumber = `PAY-${new Date().getFullYear()}-${(
        paymentCount + 1
      )
        .toString()
        .padStart(5, "0")}`;

      const payment = await Payment.create(paymentData);

      // Update invoice balance
      const invoice = await Invoice.findByPk(paymentData.invoiceId);
      if (invoice) {
        const newPaidAmount =
          parseFloat(invoice.paidAmount) + parseFloat(paymentData.amount);
        const newBalanceDue = parseFloat(invoice.totalAmount) - newPaidAmount;

        let newStatus = invoice.status;
        if (newBalanceDue <= 0) {
          newStatus = "paid";
        } else if (newPaidAmount > 0) {
          newStatus = "partial";
        }

        await invoice.update({
          paidAmount: newPaidAmount,
          balanceDue: newBalanceDue,
          status: newStatus,
        });
      }

      // Update financial transaction
      await FinancialTransaction.create({
        transactionCode: `TXN-${Date.now()}`,
        transactionDate: new Date(),
        transactionType: "revenue",
        category: "tuition_fee",
        amount: paymentData.amount,
        description: `Payment received for invoice ${invoice.invoiceNumber}`,
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        invoiceId: paymentData.invoiceId,
        status: "completed",
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Payment processed successfully",
        data: payment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error processing payment",
        error: error.message,
      });
    }
  }

  async getPayments(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentMethod,
        startDate,
        endDate,
      } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (status) whereCondition.status = status;
      if (paymentMethod) whereCondition.paymentMethod = paymentMethod;
      if (startDate && endDate) {
        whereCondition.paymentDate = {
          [Op.between]: [startDate, endDate],
        };
      }

      const { count, rows: payments } = await Payment.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Invoice,
            as: "invoice",
            attributes: ["invoiceNumber", "totalAmount"],
          },
          {
            model: Student,
            as: "student",
            attributes: ["firstName", "lastName", "studentId"],
          },
          {
            model: User,
            as: "collector",
            attributes: ["email"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["paymentDate", "DESC"]],
      });

      res.json({
        success: true,
        data: payments,
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
        message: "Error fetching payments",
        error: error.message,
      });
    }
  }

  async generateReceipt(req, res) {
    try {
      const { paymentId } = req.params;

      const payment = await Payment.findByPk(paymentId, {
        include: [
          {
            model: Invoice,
            as: "invoice",
            include: [
              {
                model: Student,
                as: "student",
                attributes: ["firstName", "lastName", "studentId", "grade"],
              },
            ],
          },
          {
            model: User,
            as: "collector",
            attributes: ["email"],
          },
        ],
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      const receipt = {
        receiptNumber: `RCP-${payment.paymentNumber}`,
        paymentDate: payment.paymentDate,
        studentName: `${payment.invoice.student.firstName} 
    ${payment.invoice.student.lastName}`,
        studentId: payment.invoice.student.studentId,
        grade: payment.invoice.student.grade,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber,
        collectedBy: payment.collector.email,
        invoiceNumber: payment.invoice.invoiceNumber,
      };

      res.json({
        success: true,
        data: receipt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error generating receipt",
        error: error.message,
      });
    }
  }
}

module.exports = new Payment_Management();