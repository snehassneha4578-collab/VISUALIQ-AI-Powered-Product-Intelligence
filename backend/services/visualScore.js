const sharp = require("sharp");

function clamp(value, min = 0, max = 10) {
    return Math.max(min, Math.min(max, value));
}

function scoreRange(value, idealMin, idealMax, acceptableMin, acceptableMax) {
    if (value >= idealMin && value <= idealMax) {
        return 10;
    }

    if (value < idealMin) {
        if (value <= acceptableMin) return 4;

        return 4 + (
            (value - acceptableMin) /
            (idealMin - acceptableMin)
        ) * 6;
    }

    if (value >= acceptableMax) return 4;

    return 10 - (
        (value - idealMax) /
        (acceptableMax - idealMax)
    ) * 6;
}

async function calculateVisualScore(imageBuffer) {

    const image = sharp(imageBuffer);

    const metadata = await image.metadata();
    const stats = await image.stats();

    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const pixels = width * height;

    // ======================================================
    // 1. RESOLUTION
    // ======================================================

    let resolutionScore;

    if (pixels >= 8000000) {
        resolutionScore = 10;
    } else if (pixels >= 4000000) {
        resolutionScore = 9.5;
    } else if (pixels >= 2500000) {
        resolutionScore = 9;
    } else if (pixels >= 1500000) {
        resolutionScore = 8;
    } else if (pixels >= 750000) {
        resolutionScore = 7;
    } else if (pixels >= 400000) {
        resolutionScore = 6;
    } else {
        resolutionScore = 4;
    }

    // ======================================================
    // 2. COMPOSITION / ASPECT RATIO
    // ======================================================

    const ratio =
        width && height
            ? width / height
            : 1;

    let compositionScore;

    if (ratio >= 0.85 && ratio <= 1.25) {
        compositionScore = 10;
    } else if (ratio >= 0.75 && ratio <= 1.5) {
        compositionScore = 9;
    } else if (ratio >= 0.5 && ratio <= 2) {
        compositionScore = 8;
    } else {
        compositionScore = 6;
    }

    // ======================================================
    // 3. IMAGE STATISTICS
    // ======================================================

    const channels =
        stats.channels || [];

    let brightness = 128;
    let saturation = 128;

    if (channels.length >= 3) {

        brightness =
            channels.reduce(
                (sum, channel) =>
                    sum + channel.mean,
                0
            ) / channels.length;

        const rgbMeans =
            channels
                .slice(0, 3)
                .map(channel => channel.mean);

        const maxMean =
            Math.max(...rgbMeans);

        const minMean =
            Math.min(...rgbMeans);

        saturation =
            maxMean - minMean;
    }

    // ======================================================
    // 4. BRIGHTNESS
    // ======================================================

    const brightnessScore =
        clamp(
            scoreRange(
                brightness,
                85,
                175,
                35,
                235
            )
        );

    // ======================================================
    // 5. CONTRAST
    // ======================================================

    const contrast =
        channels.length > 0
            ? channels.reduce(
                (sum, channel) =>
                    sum + channel.stdev,
                0
            ) / channels.length
            : 30;

    let contrastScore;

    if (contrast >= 50 && contrast <= 85) {
        contrastScore = 10;
    } else if (contrast >= 40 && contrast <= 100) {
        contrastScore = 9;
    } else if (contrast >= 25) {
        contrastScore = 8;
    } else if (contrast >= 15) {
        contrastScore = 6;
    } else {
        contrastScore = 4;
    }

    // ======================================================
    // 6. COLOR PRESENCE
    // ======================================================

    let colorScore;

    if (saturation >= 50 && saturation <= 110) {
        colorScore = 10;
    } else if (saturation >= 40) {
        colorScore = 9;
    } else if (saturation >= 20) {
        colorScore = 8;
    } else {
        colorScore = 6;
    }

    // ======================================================
    // 7. VISUAL QUALITY
    // ======================================================

    const visualQuality =
        Number(
            (
                resolutionScore * 0.25 +
                compositionScore * 0.20 +
                brightnessScore * 0.20 +
                contrastScore * 0.20 +
                colorScore * 0.15
            ).toFixed(1)
        );

    // ======================================================
    // 8. BRAND POTENTIAL
    // ======================================================

    const brandPotential =
        Number(
            (
                compositionScore * 0.30 +
                brightnessScore * 0.20 +
                contrastScore * 0.20 +
                colorScore * 0.20 +
                resolutionScore * 0.10
            ).toFixed(1)
        );

    // ======================================================
    // 9. SOCIAL READINESS
    // ======================================================

    const socialReadiness =
        Number(
            (
                compositionScore * 0.30 +
                resolutionScore * 0.25 +
                brightnessScore * 0.20 +
                contrastScore * 0.15 +
                colorScore * 0.10
            ).toFixed(1)
        );

    // ======================================================
    // 10. COMMERCE READINESS
    // ======================================================

    const commerceReadiness =
        Number(
            (
                visualQuality * 0.40 +
                brandPotential * 0.25 +
                resolutionScore * 0.20 +
                compositionScore * 0.15
            ).toFixed(1)
        );

    // ======================================================
    // CONFIDENCE
    // ======================================================

    const averageSignals =
        (
            resolutionScore +
            compositionScore +
            brightnessScore +
            contrastScore +
            colorScore
        ) / 5;

    let confidence = "MEDIUM";

    if (averageSignals >= 9) {
        confidence = "HIGH";
    } else if (averageSignals < 6) {
        confidence = "LOW";
    }

    return {
        available: true,
        source: "VISUALIQ Visual Intelligence Engine",

        visualQuality,
        brandPotential,
        socialReadiness,
        commerceReadiness,

        resolutionScore:
            Number(resolutionScore.toFixed(1)),

        compositionScore:
            Number(compositionScore.toFixed(1)),

        brightnessScore:
            Number(brightnessScore.toFixed(1)),

        contrastScore:
            Number(contrastScore.toFixed(1)),

        colorScore:
            Number(colorScore.toFixed(1)),

        confidence
    };
}

module.exports = {
    calculateVisualScore
};
