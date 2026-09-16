const cloudinary = require("../config/cloudinary");

function buildVisualAssets(publicId) {
    const cleanId = publicId.replace(/^\/+/, "");

    return {
        original: cloudinary.url(cleanId, {
            secure: true
        }),

        optimized: cloudinary.url(cleanId, {
            secure: true,
            quality: "auto",
            fetch_format: "auto"
        }),

        socialSquare: cloudinary.url(cleanId, {
            secure: true,
            transformation: [
                {
                    width: 1080,
                    height: 1080,
                    crop: "fill",
                    gravity: "auto",
                    quality: "auto",
                    fetch_format: "auto"
                }
            ]
        }),

        socialPortrait: cloudinary.url(cleanId, {
            secure: true,
            transformation: [
                {
                    width: 1080,
                    height: 1350,
                    crop: "fill",
                    gravity: "auto",
                    quality: "auto",
                    fetch_format: "auto"
                }
            ]
        }),

        story: cloudinary.url(cleanId, {
            secure: true,
            transformation: [
                {
                    width: 1080,
                    height: 1920,
                    crop: "fill",
                    gravity: "auto",
                    quality: "auto",
                    fetch_format: "auto"
                }
            ]
        }),

        websiteHero: cloudinary.url(cleanId, {
            secure: true,
            transformation: [
                {
                    width: 1600,
                    height: 900,
                    crop: "fill",
                    gravity: "auto",
                    quality: "auto",
                    fetch_format: "auto"
                }
            ]
        }),

        marketplace: cloudinary.url(cleanId, {
            secure: true,
            transformation: [
                {
                    width: 1200,
                    height: 1200,
                    crop: "fit",
                    background: "white",
                    quality: "auto",
                    fetch_format: "auto"
                }
            ]
        })
    };
}

module.exports = {
    buildVisualAssets
};
