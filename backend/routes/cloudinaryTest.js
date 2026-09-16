const express = require("express");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.get("/cloudinary-test", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    console.log("CLOUDINARY PING SUCCESS:", result);
    res.json({ success: true, message: "Cloudinary connection works" });
  } catch (error) {
    console.error("CLOUDINARY PING ERROR:", error.message);
    console.error("HTTP CODE:", error.http_code);
    res.status(500).json({
      success: false,
      error: error.message,
      http_code: error.http_code
    });
  }
});

module.exports = router;
