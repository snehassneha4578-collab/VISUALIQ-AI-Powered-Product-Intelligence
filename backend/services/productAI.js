const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function analyzeProductImage(imageBuffer, mimeType) {

    const prompt = `
You are VISUALIQ, an advanced AI Visual Commerce Intelligence Engine.

Analyze the ACTUAL PRODUCT IMAGE.

Your most important task is to identify what product is visibly shown.

IMPORTANT PRODUCT IDENTIFICATION RULES:

1. Identify the product from the image itself, NOT from the filename.
2. The filename must NEVER influence productName.
3. If a recognizable brand is visibly present, you may include it.
4. If the exact model is not visually verifiable, use a general product name.
5. If the product cannot be identified with reasonable confidence, use:
   "Product not confidently identified"
6. Never invent a product identity.
7. Never invent specifications, prices, certifications, materials, technical features, health claims, or brand claims.
8. Base all conclusions only on visible evidence.
9. Do not assume hidden product specifications.
10. If text, logo, or branding is visible in the image, use it only when it is actually readable.
11. If the image clearly shows a recognizable product category such as perfume, smartwatch, shoe, phone, laptop, camera, headphones, bag, bottle, cosmetic product, etc., identify the visible product accurately.
12. If the exact brand or model cannot be verified, use the safest accurate general product name.

Return ONLY valid JSON.

Use exactly this structure:

{
  "available": true,
  "productName": "",
  "category": "",
  "subCategory": "",
  "description": "",
  "keyFeatures": [],
  "visibleAttributes": [],
  "targetAudience": {
    "primary": "",
    "secondary": "",
    "purchaseMotivation": []
  },
  "brandPositioning": {
    "position": "",
    "personality": [],
    "perceivedTier": ""
  },
  "visualAnalysis": {
    "composition": "",
    "lighting": "",
    "background": "",
    "framing": "",
    "productVisibility": "",
    "colorAnalysis": [],
    "overallVisualQuality": ""
  },
  "visualWeaknesses": [],
  "visualStrengths": [],
  "commerceAnalysis": {
    "marketplaceReadiness": 0,
    "socialReadiness": 0,
    "adReadiness": 0,
    "mobileReadiness": 0,
    "trustPotential": 0,
    "conversionPotential": 0
  },
  "uniqueSellingPoints": [],
  "marketingIntelligence": {
    "bestMarketingAngle": "",
    "campaignConcept": "",
    "recommendedMessage": "",
    "callToAction": "",
    "contentIdeas": []
  },
  "platformStrategy": {
    "instagram": "",
    "marketplace": "",
    "website": "",
    "shortVideo": ""
  },
  "commerceCopy": {
    "productTitle": "",
    "shortDescription": "",
    "bulletPoints": [],
    "socialCaption": "",
    "adHeadline": "",
    "adDescription": ""
  },
  "improvementRecommendations": [],
  "visualDNA": {
    "mood": [],
    "style": [],
    "dominantColors": [],
    "brandKeywords": []
  },
  "creativeStrategies": [
    {
      "strategy": "",
      "reason": "",
      "score": 0
    }
  ],
  "overallScore": 0
}

RULES:

- overallScore must be between 0 and 10.
- All commerce scores must be between 0 and 10.
- Creative strategy scores must be between 0 and 10.
- Keep arrays concise and useful.
- Analyze the actual image.
- Do not use the filename to identify the product.
- Do not fabricate facts.
- Do not invent specifications.
- Do not invent brand information.
- Do not invent product features that cannot be visually supported.
- Return JSON only.
- No markdown.
- No explanation outside JSON.
`;

    try {

        console.log(
            "=== VISUALIQ DEEP AI ANALYSIS START ==="
        );

        const response = await Promise.race([

            ai.models.generateContent({
                model: "gemini-3.1-flash-lite",

                contents: [
                    {
                        inlineData: {
                            data: imageBuffer.toString("base64"),
                            mimeType: mimeType
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            }),

            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("AI_TIMEOUT")),
                    30000
                )
            )

        ]);

        const text =
            response.text.trim();

        console.log(
            "=== VISUALIQ DEEP AI ANALYSIS COMPLETE ==="
        );

        try {

            return JSON.parse(text);

        } catch {

            const cleaned = text
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();

            return JSON.parse(cleaned);
        }

    } catch (error) {

        console.error(
            "Gemini analysis unavailable:",
            error.message
        );

        return {
            available: false,

            status:
                error.message === "AI_TIMEOUT"
                    ? "timeout"
                    : "unavailable",

            message:
                "Gemini image analysis is temporarily unavailable.",

            retryMessage:
                "VISUALIQ Visual Intelligence Engine is being used instead.",

            overallScore: null
        };
    }
}

module.exports = {
    analyzeProductImage
};