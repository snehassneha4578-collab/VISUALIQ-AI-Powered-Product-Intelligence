const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const axios = require("axios");
const FormData = require("form-data");

const { analyzeImageWithRekognition } =
    require("../services/rekognitionVision");

const { identifyProductFromRekognition } =
    require("../services/productIdentification");
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

const mediaJobs = new Map();

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

            console.log(
                "=== VISUALIQ FAST UPLOAD START ==="
            );

            // --------------------------------------------------
            // 1. FAST LOCAL VISUAL SCORE
            // --------------------------------------------------

            const visualScore =
                await calculateVisualScore(
                    req.file.buffer
                );

            // --------------------------------------------------
            // 2. FAST DETERMINISTIC INTELLIGENCE
            // --------------------------------------------------

            const fallback =
                buildCommerceFallback(
                    req.file.originalname,
                    visualScore
                );

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
                        name:
                            productName,

                        productName:
                            productName,

                        category:
                            productCategory
                    },

                    visualScore?.overallScore ||
                    visualScore?.commerceReadiness ||
                    5
                );

            // --------------------------------------------------
            // 3. CREATE MEDIA BACKGROUND JOB
            // --------------------------------------------------

            const mediaJobId =
                crypto.randomUUID();

            mediaJobs.set(
                mediaJobId,
                {
                    status:
                        "processing",

                    s3Original:
                        null,

                    visualAssets:
                        null,

                    error:
                        null,

                    createdAt:
                        Date.now()
                }
            );

            // --------------------------------------------------
            // 4. BACKGROUND CLOUDINARY + S3
            // --------------------------------------------------

            setImmediate(async () => {

                try {

                    const form =
                        new FormData();

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

                    const s3Key =
                        "visualiq/originals/" +
                        Date.now() +
                        "-" +
                        (
                            req.file.originalname ||
                            "product.jpg"
                        ).replace(
                            /[^a-zA-Z0-9._-]/g,
                            "-"
                        );

                    const cloudinaryPromise =
                        axios.post(
                            `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
                            form,
                            {
                                headers:
                                    form.getHeaders(),

                                maxContentLength:
                                    Infinity,

                                maxBodyLength:
                                    Infinity
                            }
                        );

                    const s3Promise =
                        uploadToS3(
                            req.file.buffer,
                            s3Key,
                            req.file.mimetype ||
                            "image/jpeg"
                        );

                    const [
                        cloudinaryResponse,
                        s3Original
                    ] = await Promise.all([
                        cloudinaryPromise,
                        s3Promise
                    ]);

                    const uploadResult =
                        cloudinaryResponse.data;

                    const visualAssets =
                        buildVisualAssets(
                            uploadResult.public_id
                        );

                    mediaJobs.set(
                        mediaJobId,
                        {
                            status:
                                "complete",

                            s3Original,

                            visualAssets,

                            createdAt:
                                Date.now()
                        }
                    );

                    console.log(
                        "=== MEDIA BACKGROUND JOB COMPLETE ==="
                    );

                } catch (error) {

                    console.error(
                        "Background media error:",
                        error.message
                    );

                    mediaJobs.set(
                        mediaJobId,
                        {
                            status:
                                "error",

                            s3Original:
                                null,

                            visualAssets:
                                null,

                            error:
                                error.message,

                            createdAt:
                                Date.now()
                        }
                    );
                }
            });

            // --------------------------------------------------
            // 5. GEMINI BACKGROUND JOB
            // --------------------------------------------------

            const aiJobId =
                crypto.randomUUID();

            aiJobs.set(
                aiJobId,
                {
                    status:
                        "processing",

                    analysis:
                        null,

                    createdAt:
                        Date.now()
                }
            );

            analyzeProductImage(
                req.file.buffer,
                req.file.mimetype
            )
                .then(async (analysis) => {

                    if (
                        analysis &&
                        analysis.available === true
                    ) {

                        const aiProduct =
                            {
                                name:
                                    analysis.productName ||
                                    "Product",

                                productName:
                                    analysis.productName ||
                                    "Product",

                                category:
                                    analysis.category ||
                                    "general product"
                            };

                        const updatedDeepCommerce =
                            buildDeepCommerceIntelligence(
                                {
                                    ...aiProduct,
                                    aiAnalysis: analysis
                                },
                                visualScore
                            );

                        aiJobs.set(
                            aiJobId,
                            {
                                status:
                                    "complete",

                                analysis,

                                deepCommerceIntelligence:
                                    updatedDeepCommerce,

                                createdAt:
                                    Date.now()
                            }
                        );

                        console.log(
                            "=== GEMINI AI JOB COMPLETE ==="
                        );

                        console.log(
                            "GEMINI PRODUCT NAME:",
                            analysis.productName
                        );

                        console.log(
                            "GEMINI CATEGORY:",
                            analysis.category
                        );

                        return;
                    }

                    console.log(
                        "=== GEMINI UNAVAILABLE — USING AWS REKOGNITION ==="
                    );

                    try {

                        const rekognitionResult =
                            await analyzeImageWithRekognition(
                                req.file.buffer
                            );

                        const identity =
                            identifyProductFromRekognition(
                                rekognitionResult
                            );

                        const rekognitionAnalysis = {

                            available: true,

                            source:
                                "AWS Rekognition Vision",

                            productName:
                                identity.productName,

                            category:
                                identity.category,

                            description:
                                "VISUALIQ identified the visible product using AWS Rekognition computer vision.",

                            keyFeatures:
                                identity.visibleText || [],

                            visibleAttributes:
                                identity.visibleText || [],

                            targetAudience: {
                                primary:
                                    "Online shoppers",
                                secondary:
                                    "Digital commerce audiences",
                                purchaseMotivation:
                                    [
                                        "Product recognition",
                                        "Visual presentation"
                                    ]
                            },

                            brandPositioning: {
                                position:
                                    "Visual commerce product",
                                personality:
                                    [
                                        "Clear",
                                        "Product-focused"
                                    ],
                                perceivedTier:
                                    "Undetermined"
                            },

                            visualAnalysis: {
                                composition:
                                    "Analyzed from uploaded image",
                                lighting:
                                    "Analyzed from uploaded image",
                                background:
                                    "Analyzed from uploaded image",
                                framing:
                                    "Analyzed from uploaded image",
                                productVisibility:
                                    identity.identified
                                        ? "Product clearly detected"
                                        : "Product not confidently identified",
                                colorAnalysis:
                                    [],
                                overallVisualQuality:
                                    "Evaluated by VISUALIQ visual pipeline"
                            },

                            visualWeaknesses:
                                [],

                            visualStrengths:
                                identity.identified
                                    ? [
                                        "Product detected from actual image content"
                                    ]
                                    : [],

                            commerceAnalysis: {
                                marketplaceReadiness:
                                    0,
                                socialReadiness:
                                    0,
                                adReadiness:
                                    0,
                                mobileReadiness:
                                    0,
                                trustPotential:
                                    0,
                                conversionPotential:
                                    0
                            },

                            uniqueSellingPoints:
                                [],

                            marketingIntelligence: {
                                bestMarketingAngle:
                                    "Product-focused visual presentation",
                                campaignConcept:
                                    "Visual product discovery",
                                recommendedMessage:
                                    identity.productName,
                                callToAction:
                                    "Explore product",
                                contentIdeas:
                                    []
                            },

                            platformStrategy: {
                                instagram:
                                    "Use a clear product-focused visual",
                                marketplace:
                                    "Use the detected product identity",
                                website:
                                    "Use the image as a product visual",
                                shortVideo:
                                    "Use the product image as the opening frame"
                            },

                            commerceCopy: {
                                productTitle:
                                    identity.productName,
                                shortDescription:
                                    identity.productName,
                                bulletPoints:
                                    [],
                                socialCaption:
                                    identity.productName,
                                adHeadline:
                                    identity.productName,
                                adDescription:
                                    identity.productName
                            },

                            improvementRecommendations:
                                [],

                            visualDNA: {
                                mood:
                                    [],
                                style:
                                    [],
                                dominantColors:
                                    [],
                                brandKeywords:
                                    []
                            },

                            creativeStrategies:
                                [],

                            overallScore:
                                0,

                            identificationConfidence:
                                identity.confidence
                        };

                        const rekognitionProduct =
                            {
                                name:
                                    identity.productName,

                                productName:
                                    identity.productName,

                                category:
                                    identity.category
                            };

                        const rekognitionDeepCommerce =
                            buildDeepCommerceIntelligence(
                                rekognitionProduct,
                                visualScore
                            );

                        aiJobs.set(
                            aiJobId,
                            {
                                status:
                                    "complete",

                                analysis:
                                    rekognitionAnalysis,

                                deepCommerceIntelligence:
                                    rekognitionDeepCommerce,

                                createdAt:
                                    Date.now()
                            }
                        );

                        console.log(
                            "=== AWS REKOGNITION AI JOB COMPLETE ==="
                        );

                        console.log(
                            "IDENTIFIED PRODUCT:",
                            identity.productName
                        );

                        console.log(
                            "CONFIDENCE:",
                            identity.confidence
                        );

                    } catch (rekognitionError) {

                        console.error(
                            "AWS Rekognition fallback error:",
                            rekognitionError.message
                        );

                        aiJobs.set(
                            aiJobId,
                            {
                                status:
                                    "unavailable",

                                analysis:
                                    null,

                                createdAt:
                                    Date.now()
                            }
                        );
                    }
                })
                .catch(async (error) => {

                    console.error(
                        "Background Gemini error:",
                        error.message
                    );

                    console.log(
                        "=== GEMINI ERROR — USING AWS REKOGNITION ==="
                    );

                    try {

                        const rekognitionResult =
                            await analyzeImageWithRekognition(
                                req.file.buffer
                            );

                        const identity =
                            identifyProductFromRekognition(
                                rekognitionResult
                            );

                        const rekognitionAnalysis = {

                            available: true,

                            source:
                                "AWS Rekognition Vision",

                            productName:
                                identity.productName,

                            category:
                                identity.category,

                            description:
                                "VISUALIQ identified the visible product using AWS Rekognition computer vision.",

                            keyFeatures:
                                identity.visibleText || [],

                            overallScore:
                                0,

                            identificationConfidence:
                                identity.confidence
                        };

                        const rekognitionProduct =
                            {
                                name:
                                    identity.productName,

                                productName:
                                    identity.productName,

                                category:
                                    identity.category
                            };

                        const rekognitionDeepCommerce =
                            buildDeepCommerceIntelligence(
                                rekognitionProduct,
                                visualScore
                            );

                        aiJobs.set(
                            aiJobId,
                            {
                                status:
                                    "complete",

                                analysis:
                                    rekognitionAnalysis,

                                deepCommerceIntelligence:
                                    rekognitionDeepCommerce,

                                createdAt:
                                    Date.now()
                            }
                        );

                        console.log(
                            "=== AWS REKOGNITION FALLBACK COMPLETE ==="
                        );

                        console.log(
                            "IDENTIFIED PRODUCT:",
                            identity.productName
                        );

                    } catch (rekognitionError) {

                        console.error(
                            "Background Rekognition error:",
                            rekognitionError.message
                        );

                        aiJobs.set(
                            aiJobId,
                            {
                                status:
                                    "unavailable",

                                analysis:
                                    null,

                                createdAt:
                                    Date.now()
                            }
                        );
                    }
                });
            // --------------------------------------------------
            // 6. IMMEDIATE RESPONSE
            // --------------------------------------------------

            const processingTime =
                Date.now() -
                startTime;

            console.log(
                "VISUALIQ FAST RESPONSE:",
                processingTime,
                "ms"
            );

            return res.json({

                success:
                    true,

                fastResponse:
                    true,

                processingTime,

                aiJobId,

                aiStatus:
                    "processing",

                mediaJobId,

                mediaStatus:
                    "processing",

                product: {
                    name:
                        productName,

                    category:
                        productCategory
                },

                aiAnalysis:
                    fallback,

                s3Original:
                    null,

                deepCommerceIntelligence:
                    deepCommerce,

                visualScore,

                visualAssets:
                    null
            });

        } catch (error) {

            console.error(
                "VISUALIQ upload error:",
                error
            );

            return res.status(500).json({

                success:
                    false,

                error:
                    error.message ||
                    "Upload failed",

                http_code:
                    error.http_code ||
                    null,

                name:
                    error.name ||
                    null,

                cloudinary_error:
                    error.error ||
                    null
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

                success:
                    false,

                error:
                    "AI job not found"
            });
        }

        return res.json({

            success:
                true,

            status:
                job.status,

            analysis:
                job.analysis,

            deepCommerceIntelligence:
                job.deepCommerceIntelligence || null
        });
    }
);

// --------------------------------------------------
// MEDIA STATUS
// --------------------------------------------------

router.get(
    "/media-status/:jobId",
    (req, res) => {

        const job =
            mediaJobs.get(
                req.params.jobId
            );

        if (!job) {

            return res.status(404).json({

                success:
                    false,

                error:
                    "Media job not found"
            });
        }

        return res.json({

            success:
                true,

            status:
                job.status,

            s3Original:
                job.s3Original,

            visualAssets:
                job.visualAssets,

            error:
                job.error
        });
    }
);

module.exports = router;






