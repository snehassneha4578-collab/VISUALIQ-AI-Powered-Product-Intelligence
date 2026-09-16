require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }
  },
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "VISUALIQ AI backend is running",
  });
});

app.post("/api/upload", upload.single("productImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No product image uploaded.",
      });
    }

    const cloudinaryResult = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "visualiq/products",
        resource_type: "image",
      }
    );

    res.json({
      success: true,
      message: "Product uploaded to Cloudinary successfully.",
      file: {
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      },
      cloudinary: {
        publicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        format: cloudinaryResult.format,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    res.status(500).json({
      success: false,
      message: `Cloudinary upload failed: ${error.message}`,
    });
  }
});

app.use("/uploads", express.static(uploadDir));

app.use((err, req, res, next) => {
  console.error(err);

  res.status(400).json({
    success: false,
    message: err.message || "Something went wrong.",
  });
});

app.listen(PORT, () => {
  console.log(`VISUALIQ backend running at http://localhost:${PORT}`);
});
