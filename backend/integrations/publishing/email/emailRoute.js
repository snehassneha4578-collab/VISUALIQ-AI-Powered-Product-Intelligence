const express = require("express");
const { sendArticleEmail } = require("./resendService");

const router = express.Router();

router.post("/send", async (req, res) => {
    try {
        const {
            to,
            title,
            content,
            excerpt
        } = req.body;

        if (!to || !title || !content) {
            return res.status(400).json({
                success: false,
                error: "Recipient, title, and content are required"
            });
        }

        const html = `
            <article>
                <h1>${title}</h1>
                ${excerpt ? `<p>${excerpt}</p>` : ""}
                <div>${content}</div>
            </article>
        `;

        const result = await sendArticleEmail({
            to,
            subject: title,
            html
        });

        res.json({
            success: true,
            message: "VISUALIQ article sent successfully",
            email: result
        });

    } catch (error) {
        console.error("Article email error:", error);

        res.status(500).json({
            success: false,
            error: error.message || "Failed to send article"
        });
    }
});

module.exports = router;
