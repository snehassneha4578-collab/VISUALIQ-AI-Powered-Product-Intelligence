const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../../config/aws");

function createSlug(text) {
    return String(text || "product")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "product";
}

async function publishArticleToS3({
    slug,
    title,
    content,
    productName
}) {
    if (!title || !content) {
        throw new Error(
            "Article title and content are required"
        );
    }

    // Use the final AI-identified product name
    // when generating the AWS article key.
    const finalProductName =
        productName ||
        title ||
        "product";

    const productSlug =
        createSlug(finalProductName);

    const finalSlug =
        slug
            ? createSlug(slug)
            : productSlug;

    const key =
        `visualiq-articles/${finalSlug}-${Date.now()}.html`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
    <article>
        <h1>${title}</h1>
        ${content}
    </article>
</body>
</html>
`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: html,
        ContentType: "text/html; charset=utf-8"
    });

    const result =
        await s3.send(command);

    return {
        success: true,
        provider: "aws-s3",
        bucket:
            process.env.AWS_S3_BUCKET,
        key,
        productName:
            finalProductName,
        etag:
            result.ETag || null
    };
}

module.exports = {
    publishArticleToS3
};
