const express = require("express");
const multer = require("multer");
const crypto = require("crypto");


const { analyzeProductImage } =
    require("../services/productAI");

const { buildVisualAssets } =
    require("../services/visualAssets");

const { calculateVisualScore } =
    require("../services/visualScore");

const { buildCommerceFallback } =
    require("../services/commerceFallback");

const {
    buildDeepCommerceIntelligence
} = require("../services/deepCommerceIntelligence");

const {
    uploadToS3
} = require("../services/s3Upload");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const aiJobs = new Map();

router.post(
    "/upload",
    upload.single("image"),
    async (req, res) => {

        const startTime = Date.now();

        try {

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "No image uploaded"
                });
            }

            console.log("=== VISUALIQ UPLOAD START ===");

            // --------------------------------------------------
            // 1. CLOUDINARY UPLOAD
            // --------------------------------------------------

            const axios = require("axios");
            const FormData = require("form-data");

            const form = new FormData();

            form.append(
                "file",
                req.file.buffer,
                {
                    filename:
                        req.file.originalname ||
                        "product.jpg",
                    contentType:
                        req.file.mimetype ||
                        "image/jpeg"
                }
            );

            form.append(
                "upload_preset",
                "visualiq_products"
            );

            const cloudinaryResponse =
                await axios.post(
                    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
                    form,
                    {
                        headers: form.getHeaders(),
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    }
                );

            const uploadResult =
    cloudinaryResponse.data;

const s3Key =
    "visualiq/originals/" +
    Date.now() +
    "-" +
    (req.file.originalname || "product.jpg")
        .replace(/[^a-zA-Z0-9._-]/g, "-");

const s3Original =
    await uploadToS3(
        req.file.buffer,
        s3Key,
        req.file.mimetype || "image/jpeg"
    );

            console.log(
                "Cloudinary upload complete:",
                uploadResult.public_id
            );

            // --------------------------------------------------
            // 2. VISUAL ASSETS
            // --------------------------------------------------

            const visualAssets =
                buildVisualAssets(
                    uploadResult.public_id
                );

            // --------------------------------------------------
            // 3. VISUAL SCORE
            // --------------------------------------------------

            const visualScore =
                await calculateVisualScore(
                    req.file.buffer
                );

            // --------------------------------------------------
            // 4. EXISTING FAST FALLBACK
            // --------------------------------------------------

            const fallback =
                buildCommerceFallback(req.file.originalname, visualScore);

            // --------------------------------------------------
            // 5. DEEP COMMERCE INTELLIGENCE
            // --------------------------------------------------

            const productName =
                fallback?.product ||
                fallback?.productName ||
                "Product";

            const productCategory =
                fallback?.category ||
                productName;

            const deepCommerce =
                buildDeepCommerceIntelligence(
                    {
                        name: productName,
                        productName: productName,
                        category: productCategory
                    },
                    visualScore?.overallScore ||
                    visualScore?.commerceReadiness ||
                    5
                );

            // --------------------------------------------------
            // 6. GEMINI BACKGROUND JOB
            // --------------------------------------------------

            const aiJobId =
                crypto.randomUUID();

            aiJobs.set(
                aiJobId,
                {
                    status: "processing",
                    analysis: null,
                    createdAt: Date.now()
                }
            );

            analyzeProductImage(
                req.file.buffer,
                req.file.mimetype
            )
                .then((analysis) => {

                    if (
                        analysis &&
                        analysis.available === true
                    ) {

                        aiJobs.set(
                            aiJobId,
                            {
                                status: "complete",
                                analysis,
                                createdAt: Date.now()
                            }
                        );

                        console.log(
                            "=== GEMINI AI JOB COMPLETE ==="
                        );

                    } else {

                        aiJobs.set(
                            aiJobId,
                            {
                                status: "unavailable",
                                analysis: null,
                                createdAt: Date.now()
                            }
                        );

                        console.log(
                            "=== GEMINI AI JOB UNAVAILABLE ==="
                        );
                    }
                })
                .catch((error) => {

                    console.error(
                        "Background Gemini error:",
                        error.message
                    );

                    aiJobs.set(
                        aiJobId,
                        {
                            status: "unavailable",
                            analysis: null,
                            createdAt: Date.now()
                        }
                    );
                });

            // --------------------------------------------------
            // 7. FAST RESPONSE
            // --------------------------------------------------

            const processingTime =
                Date.now() - startTime;

            console.log(
                "VISUALIQ upload completed in",
                processingTime,
                "ms"
            );

            return res.json({

                success: true,

                fastResponse: true,

                processingTime,

                aiJobId,

                aiStatus: "processing",

                product: {
                    name: productName,
                    category: productCategory
                },

                aiAnalysis: fallback,
                s3Original,
                deepCommerceIntelligence:
                    deepCommerce,

                visualScore,

                visualAssets
            });

        } catch (error) {

            console.error(
                "VISUALIQ upload error:",
                error
            );

            return res.status(500).json({
                success: false,
                error: error.message || "Upload failed",
                http_code: error.http_code || null,
                name: error.name || null,
                cloudinary_error: error.error || null
            });
        }
    }
);

// --------------------------------------------------
// GEMINI STATUS
// --------------------------------------------------

router.get(
    "/ai-status/:jobId",
    (req, res) => {

        const job =
            aiJobs.get(
                req.params.jobId
            );

        if (!job) {
            return res.status(404).json({
                success: false,
                error: "AI job not found"
            });
        }

        return res.json({
            success: true,
            status: job.status,
            analysis: job.analysis
        });
    }
);

module.exports = router;









