function identifyProductFromRekognition(
    rekognitionResult
) {

    if (
        !rekognitionResult ||
        rekognitionResult.available !== true
    ) {
        return {
            identified: false,
            productName: "Product not confidently identified",
            category: "Visual Commerce Product",
            confidence: 0,
            visibleText: []
        };
    }

    const labels =
        Array.isArray(rekognitionResult.labels)
            ? rekognitionResult.labels
            : [];

    const text =
        Array.isArray(rekognitionResult.detectedText)
            ? rekognitionResult.detectedText
            : [];

    const reliableText =
        text
            .filter(item =>
                item &&
                item.text &&
                Number(item.confidence || 0) >= 70
            )
            .map(item => item.text.trim())
            .filter(Boolean);

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

    const specificCandidates =
        labels
            .filter(label =>
                label &&
                label.name &&
                !genericLabels.has(label.name)
            )
            .sort(
                (a, b) =>
                    Number(b.confidence || 0) -
                    Number(a.confidence || 0)
            );

    const topSpecific =
        specificCandidates[0];

    if (
        topSpecific &&
        Number(topSpecific.confidence || 0) >= 75
    ) {
        const confidence =
            Number(topSpecific.confidence || 0);

        const category =
            topSpecific.parents &&
            topSpecific.parents.length > 0
                ? topSpecific.parents[
                    topSpecific.parents.length - 1
                ]
                : topSpecific.name;

        return {
            identified: true,
            productName: topSpecific.name,
            category,
            confidence,
            visibleText: reliableText
        };
    }

    const fallbackLabel =
        labels
            .filter(label =>
                label &&
                label.name
            )
            .sort(
                (a, b) =>
                    Number(b.confidence || 0) -
                    Number(a.confidence || 0)
            )[0];

    if (fallbackLabel) {
        return {
            identified: true,
            productName:
                reliableText.length > 0
                    ? reliableText.slice(0, 2).join(" ")
                    : fallbackLabel.name,
            category:
                fallbackLabel.parents &&
                fallbackLabel.parents.length > 0
                    ? fallbackLabel.parents[
                        fallbackLabel.parents.length - 1
                    ]
                    : fallbackLabel.name,
            confidence:
                Number(fallbackLabel.confidence || 0),
            visibleText: reliableText
        };
    }

    if (reliableText.length > 0) {
        return {
            identified: true,
            productName:
                reliableText.slice(0, 2).join(" "),
            category:
                "Visual Commerce Product",
            confidence:
                Math.max(
                    ...text.map(
                        item =>
                            Number(item.confidence || 0)
                    ),
                    0
                ),
            visibleText: reliableText
        };
    }

    return {
        identified: false,
        productName:
            "Product not confidently identified",
        category:
            "Visual Commerce Product",
        confidence: 0,
        visibleText: []
    };
}

module.exports = {
    identifyProductFromRekognition
};

