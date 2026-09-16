const sharp = require("sharp");

async function calculateVisualScore(imageBuffer) {
    const image = sharp(imageBuffer);

    const metadata = await image.metadata();
    const stats = await image.stats();

    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const pixels = width * height;

    // Resolution score
    let resolutionScore = 0;

    if (pixels >= 4000000) resolutionScore = 10;
    else if (pixels >= 2000000) resolutionScore = 9;
    else if (pixels >= 1000000) resolutionScore = 8;
    else if (pixels >= 500000) resolutionScore = 7;
    else if (pixels >= 250000) resolutionScore = 6;
    else resolutionScore = 4;

    // Aspect ratio suitability
    const ratio = width && height ? width / height : 1;

    let compositionScore = 7;

    if (ratio >= 0.75 && ratio <= 1.5) {
        compositionScore = 9;
    } else if (ratio >= 0.5 && ratio <= 2) {
        compositionScore = 8;
    } else {
        compositionScore = 6;
    }

    // Image channel statistics
    const channels = stats.channels || [];

    let brightness = 128;
    let saturation = 128;

    if (channels.length >= 3) {
        brightness =
            channels.reduce((sum, channel) => sum + channel.mean, 0) /
            channels.length;

        const rgbMeans = channels.slice(0, 3).map(channel => channel.mean);
        const maxMean = Math.max(...rgbMeans);
        const minMean = Math.min(...rgbMeans);

        saturation = maxMean - minMean;
    }

    // Brightness score
    let brightnessScore = 7;

    if (brightness >= 70 && brightness <= 200) {
        brightnessScore = 9;
    } else if (brightness >= 45 && brightness <= 225) {
        brightnessScore = 7;
    } else {
        brightnessScore = 5;
    }

    // Contrast / visual separation
    const contrast =
        channels.length > 0
            ? channels.reduce((sum, channel) => sum + channel.stdev, 0) /
              channels.length
            : 30;

    let contrastScore = 7;

    if (contrast >= 45) {
        contrastScore = 9;
    } else if (contrast >= 25) {
        contrastScore = 8;
    } else if (contrast >= 15) {
        contrastScore = 6;
    } else {
        contrastScore = 4;
    }

    // Color presence
    let colorScore = 7;

    if (saturation >= 45) {
        colorScore = 9;
    } else if (saturation >= 20) {
        colorScore = 8;
    } else {
        colorScore = 6;
    }

    const visualQuality = Number(
        (
            resolutionScore * 0.25 +
            compositionScore * 0.20 +
            brightnessScore * 0.20 +
            contrastScore * 0.20 +
            colorScore * 0.15
        ).toFixed(1)
    );

    const brandPotential = Number(
        (
            compositionScore * 0.30 +
            brightnessScore * 0.20 +
            contrastScore * 0.20 +
            colorScore * 0.20 +
            resolutionScore * 0.10
        ).toFixed(1)
    );

    const socialReadiness = Number(
        (
            compositionScore * 0.30 +
            resolutionScore * 0.25 +
            brightnessScore * 0.20 +
            contrastScore * 0.15 +
            colorScore * 0.10
        ).toFixed(1)
    );

    const commerceReadiness = Number(
        (
            visualQuality * 0.40 +
            brandPotential * 0.25 +
            resolutionScore * 0.20 +
            compositionScore * 0.15
        ).toFixed(1)
    );

    return {
        available: true,
        source: "VISUALIQ Visual Intelligence Engine",
        visualQuality,
        brandPotential,
        socialReadiness,
        commerceReadiness,
        resolutionScore,
        compositionScore,
        brightnessScore,
        contrastScore,
        colorScore,
        confidence: "MEDIUM"
    };
}

module.exports = {
    calculateVisualScore
};
