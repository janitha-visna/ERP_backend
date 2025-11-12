const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config(); // Load .env first

const sequelize = require("./config/database"); // Sequelize instance

const app = express();

// ========== Middleware ==========
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ========== Import Models ==========
require("./models");

// ========== Database Connection ==========
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connection established successfully");
    return sequelize.sync({ alter: false }); // Use alter:false for production
  })
  .then(() => {
    console.log("✅ Database synchronized successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection or sync failed:", err.message);
  });

// ========== Routes ==========
app.use("/api/auth", require("./routes/AuthRoutes"));
app.use("/api/hr", require("./routes/HrRoutes"));
app.use("/api/finance", require("./routes/FinanceRoutes"));

// ========== Root Route ==========
app.get("/", (req, res) => {
  res.json({
    message: "ERP Education System API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
});

// ========== Health Check ==========
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "Connected",
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      database: "Disconnected",
      error: error.message,
    });
  }
});

// ========== Error Handling ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// ========== 404 Handler ==========
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ========== Server Startup ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log("📚 Available Routes:");
  console.log(" - GET /health");
  console.log(" - POST /api/auth/register");
  console.log(" - POST /api/auth/login");
  console.log(" - GET /api/auth/profile");
  console.log(" - GET /api/hr/dashboard");
  console.log(" - GET /api/finance/dashboard");
});

module.exports = app;
