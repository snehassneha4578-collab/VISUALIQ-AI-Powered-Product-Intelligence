const fs = require("fs");

const {
    analyzeImageWithRekognition
} = require("./services/rekognitionVision");

async function test() {

    const imagePath =
        process.argv[2];

    if (!imagePath) {
        console.error(
            "Please provide an image path."
        );
        process.exit(1);
    }

    const imageBuffer =
        fs.readFileSync(imagePath);

    console.log(
        "=== VISUALIQ REKOGNITION TEST START ==="
    );

    const result =
        await analyzeImageWithRekognition(
            imageBuffer
        );

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

    console.log(
        "=== VISUALIQ REKOGNITION TEST COMPLETE ==="
    );
}

test().catch(error => {

    console.error(
        "=== REKOGNITION TEST FAILED ==="
    );

    console.error(
        error
    );

    process.exit(1);
});
