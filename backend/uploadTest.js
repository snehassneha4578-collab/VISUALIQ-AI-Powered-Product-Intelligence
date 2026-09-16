const express = require("express");
const cloudinary = require("./config/cloudinary");

const app = express();

app.get("/api/upload-test", async (req, res) => {
  try {
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "visualiq/test",
          resource_type: "image"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(png);
    });

    res.json({
      success: true,
      message: "Direct Cloudinary image upload works",
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error("DIRECT UPLOAD TEST ERROR:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      http_code: error.http_code
    });
  }
});

app.listen(5001, () => {
  console.log("Upload test server running on port 5001");
});
