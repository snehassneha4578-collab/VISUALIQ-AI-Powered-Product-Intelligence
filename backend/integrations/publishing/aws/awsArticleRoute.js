const express = require("express");

const {
    publishArticleToS3
} = require("./awsArticlePublisher");

const router = express.Router();

// ======================================================
// AWS S3 ARTICLE PUBLISH
// ======================================================

router.post("/publish", async (req, res) => {
    try {
        const {
            slug,
            title,
            content
        } = req.body;

        // Validate request
        if (!slug || !title || !content) {
            return res.status(400).json({
                success: false,
                error:
                    "Slug, title and content are required"
            });
        }

        // Publish article to AWS S3
        const result =
            await publishArticleToS3({
                slug,
                title,
                content
            });

        return res.json({
            success: true,
            message:
                "VISUALIQ article published to AWS S3",
            article: result
        });

    } catch (error) {

        console.error(
            "AWS article publishing error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                error.message ||
                "AWS article publishing failed"
        });
    }
});

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;