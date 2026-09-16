function createArticle(payload) {
    return {
        title: payload.title || "",
        content: payload.content || "",
        excerpt: payload.excerpt || "",
        imageUrl: payload.imageUrl || null,
        tags: Array.isArray(payload.tags) ? payload.tags : [],
        status: "draft"
    };
}

module.exports = {
    createArticle
};
