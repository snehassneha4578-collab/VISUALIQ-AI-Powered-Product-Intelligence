const express = require("express");
const { createArticle } = require("./publishingEngine");

const router = express.Router();

router.post("/draft", (req, res) => {
    try {
        const article = createArticle(req.body);

        if (!article.title || !article.content) {
            return res.status(400).json({
                success: false,
                error: "Article title and content are required"
            });
        }

        res.json({
            success: true,
            message: "VISUALIQ article draft created",
            article
        });
    } catch (error) {
        console.error("Publishing draft error:", error);

        res.status(500).json({
            success: false,
            error: "Failed to create article draft"
        });
    }
});

module.exports = router;
