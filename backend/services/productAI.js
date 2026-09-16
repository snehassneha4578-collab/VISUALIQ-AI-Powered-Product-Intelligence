const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash"
});

async function analyzeProductImage(imageBuffer, mimeType) {

    const prompt = `
You are VISUALIQ, an advanced AI Visual Commerce Intelligence Engine.

Analyze the product shown in the image using ONLY visible evidence.

Do not invent:
- specifications
- prices
- certifications
- materials
- brand claims
- technical features
- product facts that cannot be visually supported

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

1. overallScore must be between 0 and 10.
2. All commerce scores must be between 0 and 10.
3. Creative strategy scores must be between 0 and 10.
4. Keep arrays concise and useful.
5. Do not fabricate facts.
6. If the brand is not visible, do not invent a brand name.
7. If exact specifications are not visible, do not claim them.
8. Analyze the actual image.
9. Visual weaknesses must be specific to the image.
10. Marketing angle must match the visible product.
11. Commerce copy must avoid unsupported factual claims.
12. Platform strategies must be specific to the visible product.
13. Return JSON only.
14. No markdown.
15. No explanation outside JSON.
`;

    try {

        console.log("=== VISUALIQ DEEP AI ANALYSIS START ===");

        const result = await Promise.race([

            model.generateContent([
                {
                    inlineData: {
                        data: imageBuffer.toString("base64"),
                        mimeType: mimeType
                    }
                },
                prompt
            ]),

            new Promise((_, reject) =>
                setTimeout(
                    () => reject(new Error("AI_TIMEOUT")),
                    12000
                )
            )

        ]);

        const text = result.response.text().trim();

        console.log("=== VISUALIQ DEEP AI ANALYSIS COMPLETE ===");

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
                "Gemini analysis is temporarily unavailable.",

            retryMessage:
                "VISUALIQ Visual Intelligence Engine is being used instead.",

            overallScore: null
        };
    }
}

module.exports = {
    analyzeProductImage
};
