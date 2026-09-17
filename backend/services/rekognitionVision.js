const sharp = require("sharp");

const {
    RekognitionClient,
    DetectLabelsCommand,
    DetectTextCommand
} = require("@aws-sdk/client-rekognition");

require("dotenv").config();

const rekognition = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function analyzeImageWithRekognition(
    imageBuffer
) {

    // Convert any supported input image
    // into JPEG for Rekognition.
    const rekognitionImage =
        await sharp(imageBuffer)
            .jpeg({
                quality: 90
            })
            .toBuffer();

    const [labelsResult, textResult] =
        await Promise.all([

            rekognition.send(
                new DetectLabelsCommand({
                    Image: {
                        Bytes: rekognitionImage
                    },
                    MaxLabels: 20,
                    MinConfidence: 60
                })
            ),

            rekognition.send(
                new DetectTextCommand({
                    Image: {
                        Bytes: rekognitionImage
                    }
                })
            )

        ]);

    const labels =
        (labelsResult.Labels || [])
            .map(label => ({
                name: label.Name,

                confidence: Number(
                    (label.Confidence || 0)
                        .toFixed(2)
                ),

                parents:
                    (label.Parents || [])
                        .map(
                            parent =>
                                parent.Name
                        )
            }));

    const detectedText =
        (textResult.TextDetections || [])
            .filter(
                item =>
                    item.Type === "LINE" &&
                    item.DetectedText
            )
            .map(item => ({
                text:
                    item.DetectedText,

                confidence: Number(
                    (item.Confidence || 0)
                        .toFixed(2)
                )
            }));

    return {

        available: true,

        labels,

        detectedText

    };
}

module.exports = {
    analyzeImageWithRekognition
};
