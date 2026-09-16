function createEmailPayload(article, recipient) {
    if (!recipient) {
        throw new Error("Recipient email is required");
    }

    if (!article?.title || !article?.content) {
        throw new Error("Article title and content are required");
    }

    return {
        to: recipient,
        subject: article.title,
        text: article.content,
        html: `
            <article>
                <h1>${article.title}</h1>
                ${article.excerpt ? `<p>${article.excerpt}</p>` : ""}
                <div>${article.content}</div>
            </article>
        `
    };
}

module.exports = {
    createEmailPayload
};
