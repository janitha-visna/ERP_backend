const { Op } = require("sequelize");
const Invoice = require("../../models/InvoiceModel");
const Student = require("../../models/StudentModel");
const FeeStructure = require("../../models/FeeStructureModel");
const FinancialTransaction = require("../../models/FinancialTransactionModel");
const Payment = require("../../models/PaymentModel");

class Invoice_Management {
  async createInvoice(req, res) {
    try {
      const invoiceData = req.body;

      // Generate invoice number
      const invoiceCount = await Invoice.count();
      invoiceData.invoiceNumber = `INV-${new Date().getFullYear()}-${(
        invoiceCount + 1
      )
        .toString()
        .padStart(5, "0")}`;

      // Calculate totals
      if (invoiceData.items && Array.isArray(invoiceData.items)) {
        invoiceData.subtotal = invoiceData.items.reduce(
          (total, item) =>
            total + parseFloat(item.quantity) * parseFloat(item.unitPrice),
          0
        );

        invoiceData.totalAmount =
          invoiceData.subtotal -
          (invoiceData.discount || 0) +
          (invoiceData.taxAmount || 0);
        invoiceData.balanceDue = invoiceData.totalAmount;
      }

      const invoice = await Invoice.create(invoiceData);

      // Create financial transaction
      await FinancialTransaction.create({
        transactionCode: `TXN-${Date.now()}`,
        transactionDate: new Date(),
        transactionType: "revenue",
        category: "tuition_fee",
        amount: invoiceData.totalAmount,
        description: `Invoice ${invoiceData.invoiceNumber} for student`,
        paymentMethod: "pending",
        invoiceId: invoice.id,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        data: invoice,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error creating invoice",
        error: error.message,
      });
    }
  }

  async getInvoices(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        studentId,
        startDate,
        endDate,
      } = req.query;
      const offset = (page - 1) * limit;

      const whereCondition = {};
      if (status) whereCondition.status = status;
      if (studentId) whereCondition.studentId = studentId;
      if (startDate && endDate) {
        whereCondition.invoiceDate = {
          [Op.between]: [startDate, endDate],
        };
      }

      const { count, rows: invoices } = await Invoice.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Student,
            as: "student",
            attributes: ["id", "firstName", "lastName", "studentId", "grade"],
          },
          {
            model: FeeStructure,
            as: "feeStructure",
            attributes: ["id", "name", "academicYear"],
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["invoiceDate", "DESC"]],
      });

      res.json({
        success: true,
        data: invoices,
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
        message: "Error fetching invoices",
        error: error.message,
      });
    }
  }

  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: Student,
            as: "student",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "studentId",
              "grade",
              "parentName",
              "parentContact",
            ],
          },
          {
            model: FeeStructure,
            as: "feeStructure",
            attributes: ["id", "name", "academicYear", "feeComponents"],
          },
          {
            model: Payment,
            as: "payments",
            include: [
              {
                model: User,
                as: "collector",
                attributes: ["email"],
              },
            ],
          },
        ],
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found",
        });
      }

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching invoice",
        error: error.message,
      });
    }
  }
}


module.exports = new Invoice_Management();