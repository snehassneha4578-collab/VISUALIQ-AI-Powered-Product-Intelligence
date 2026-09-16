const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendArticleEmail({
    to,
    subject,
    html
}) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not configured");
    }

    if (!to || !subject || !html) {
        throw new Error("Email recipient, subject, and content are required");
    }

    const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to,
        subject,
        html
    });

    if (error) {
        throw new Error(error.message || "Resend email failed");
    }

    return {
        success: true,
        provider: "resend",
        emailId: data?.id || null
    };
}

module.exports = {
    sendArticleEmail
};
