function identifyProductFromRekognition(
    rekognitionResult
) {

    if (
        !rekognitionResult ||
        rekognitionResult.available !== true
    ) {
        return {
            identified: false,
            productName:
                "Product not confidently identified",
            category:
                "Visual Commerce Product",
            confidence: 0
        };
    }

    const labels =
        Array.isArray(
            rekognitionResult.labels
        )
            ? rekognitionResult.labels
            : [];

    const text =
        Array.isArray(
            rekognitionResult.detectedText
        )
            ? rekognitionResult.detectedText
            : [];

    // Generic labels describe a broad category,
    // not the actual product identity.
    const genericLabels = new Set([
        "Product",
        "Object",
        "Thing",
        "Electronics",
        "Technology",
        "Device",
        "Accessory",
        "Mobile Phone",
        "Phone",
        "Computer",
        "Machine",
        "Equipment",
        "Appliance",
        "Gadget"
    ]);

    // First remove labels that cannot identify
    // a specific product.
    const specificCandidates =
        labels
            .filter(label =>
                label &&
                label.name &&
                !genericLabels.has(
                    label.name
                )
            )
            .sort(
                (a, b) =>
                    (b.confidence || 0) -
                    (a.confidence || 0)
            );

    const topSpecific =
        specificCandidates[0];

    // If Rekognition found a specific product,
    // prefer it even if a generic category has
    // slightly higher confidence.
    if (
        topSpecific &&
        Number(
            topSpecific.confidence || 0
        ) >= 75
    ) {

        const confidence =
            Number(
                topSpecific.confidence || 0
            );

        const category =
            topSpecific.parents &&
            topSpecific.parents.length > 0
                ? topSpecific.parents[
                    topSpecific.parents.length - 1
                ]
                : "Visual Commerce Product";

        const reliableText =
            text
                .filter(item =>
                    item &&
                    item.text &&
                    Number(
                        item.confidence || 0
                    ) >= 70
                )
                .map(
                    item => item.text
                );

        return {
            identified: true,

            productName:
                topSpecific.name,

            category,

            confidence,

            visibleText:
                reliableText
        };
    }

    // If no specific label exists, use the best
    // available label as a cautious category-level
    // identification.
    const fallbackLabel =
        labels
            .filter(label =>
                label &&
                label.name
            )
            .sort(
                (a, b) =>
                    (b.confidence || 0) -
                    (a.confidence || 0)
            )[0];

    if (
        !fallbackLabel ||
        Number(
            fallbackLabel.confidence || 0
        ) < 75
    ) {
        return {
            identified: false,

            productName:
                "Product not confidently identified",

            category:
                fallbackLabel?.name ||
                "Visual Commerce Product",

            confidence:
                Number(
                    fallbackLabel?.confidence ||
                    0
                )
        };
    }

    const reliableText =
        text
            .filter(item =>
                item &&
                item.text &&
                Number(
                    item.confidence || 0
                ) >= 70
            )
            .map(
                item => item.text
            );

    return {
        identified: true,

        productName:
            fallbackLabel.name,

        category:
            fallbackLabel.parents &&
            fallbackLabel.parents.length > 0
                ? fallbackLabel.parents[
                    fallbackLabel.parents.length - 1
                ]
                : fallbackLabel.name,

        confidence:
            Number(
                fallbackLabel.confidence || 0
            ),

        visibleText:
            reliableText
    };
}

module.exports = {
    identifyProductFromRekognition
};
