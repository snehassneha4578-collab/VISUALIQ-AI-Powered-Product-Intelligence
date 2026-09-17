const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const uploadRoutes = require("./routes/upload");
const publishingRoutes = require("./integrations/publishing/publishingRoute");
const emailRoutes = require("./integrations/publishing/email/emailRoute");
const awsArticleRoutes = require("./integrations/publishing/aws/awsArticleRoute");
const cloudinary = require("./config/cloudinary");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "VISUALIQ backend is running"
  });
});

// ======================================================
// CLOUDINARY FRONTEND CONFIG
// ======================================================

app.get("/api/cloudinary-config", (req, res) => {
  res.json({
    success: true,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: "visualiq_products"
  });
});

// ======================================================
// CLOUDINARY CONNECTION TEST
// ======================================================

app.get("/api/cloudinary-test", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();

    console.log("CLOUDINARY PING SUCCESS");

    res.json({
      success: true,
      message: "Cloudinary connection works"
    });
  } catch (error) {
    console.error(
      "CLOUDINARY PING ERROR:",
      error.message
    );

    console.error(
      "HTTP CODE:",
      error.http_code
    );

    res.status(500).json({
      success: false,
      error: error.message,
      http_code: error.http_code
    });
  }
});

// ======================================================
// API ROUTES
// ======================================================

app.use("/api", uploadRoutes);

app.use(
  "/api/publishing",
  publishingRoutes
);

app.use(
  "/api/publishing/email",
  emailRoutes
);

// ======================================================
// AWS S3 ARTICLE PUBLISHING
// ======================================================

app.use(
  "/api/publishing/aws",
  awsArticleRoutes
);

// ======================================================
// SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    "VISUALIQ backend running on port " + PORT
  );
});