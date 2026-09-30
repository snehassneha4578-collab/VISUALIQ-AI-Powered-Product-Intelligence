const sharp = require("sharp");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function analyzeProductImage(imageBuffer, mimeType) {

    const prompt = `
You are VISUALIQ, an advanced AI Visual Commerce Intelligence Engine.

Your PRIMARY TASK is PRODUCT IDENTIFICATION.

Analyze the ACTUAL IMAGE carefully and identify the most specific product identity that can be visually supported.

PRODUCT IDENTIFICATION PRIORITY:
1. Read all visible packaging text.
2. Read brand names.
3. Read product names.
4. Read variant names.
5. Read model names, model numbers, edition names, sizes, flavors, colors, or other identifying text when clearly visible.
6. Use logos and distinctive packaging together with visible text.
7. Combine brand + product name when both are clearly visible.
8. Prefer a specific product name over a generic object/category.
9. NEVER use the filename to identify the product.
10. NEVER invent a product name.
11. NEVER infer an exact product variant when the image does not visually support it.
12. If the exact product is clearly identifiable from visible evidence, return that exact product name.
13. If only the brand is identifiable, return the brand plus the most specific visually supported product description.
14. If only the product type is identifiable, return the product type.
15. If the product cannot be reliably identified, return "Unable to determine precisely".

IMPORTANT EXAMPLES:

Example 1:
If the image visibly shows Britannia Good Day packaging:
productName = "Good Day"
brand = "Britannia"
category = "Biscuits"

Do NOT return:
"Food"
"Biscuits"
"Snack"

Example 2:
If the image visibly shows a Montblanc product with readable product/model text:
productName = the specific visible Montblanc product name/model.

Do NOT return:
"Bottle"
"Perfume"
"Luxury Bottle"

Example 3:
If an image clearly shows an Apple iPhone with visible model information:
productName = the specific visually supported iPhone model.

Example 4:
If a Nike shoe image clearly shows a readable model name:
productName = that specific model.

IMPORTANT:
The productName must represent the PRODUCT, not merely the physical object.

For example:
Wrong: "Bottle"
Better: "Montblanc Explorer"
Wrong: "Food"
Better: "Good Day"
Wrong: "Shoe"
Better: "Nike Air Max"

However, NEVER guess an exact product name when visual evidence does not support it.

IDENTIFICATION PRIORITY:
1. First inspect the image carefully for all visible brand names, logos, product labels, model names, product-line names, packaging text, and distinctive identifying text.
2. If a visible brand name is clearly readable, include it in productName and brand. If a visible model or product-line name is also readable, use the most specific supported product name.
3. Do NOT use a generic name such as "Bottle", "Shoe", "Phone", "Watch", "Bag", or "Perfume" when a clearly visible brand or product name provides a more specific identification.
4. Preserve capitalization and spelling of clearly visible brand/product text as closely as possible.
5. Only use a generic product type when no sufficiently readable identifying text or branding is visible.

IDENTIFICATION CONFIDENCE:
Use:
"High" = exact product identity is clearly supported by visible text/branding/model information.
"Medium" = product identity is reasonably supported but some identifying information is incomplete.
"Low" = only general product type or limited brand information can be established.

IDENTIFICATION REASON:
Briefly state what visible evidence supports the identification, such as packaging text, logo, model name, label, or distinctive visual details.

Return ONLY valid JSON.

Use exactly this structure:

{
  "available": true,
  "productName": "",
  "brand": "",
  "category": "",
  "subCategory": "",
  "variant": "",
  "identificationConfidence": "",
  "identificationReason": "",
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
- Analyze the actual image.
- Never use the filename.
- Exact visible product name is more important than generic category.
- Brand and product name are different fields.
- Read visible text carefully.
- Do not fabricate facts.
- Do not invent specifications.
- Do not invent brand information.
- Do not invent product features that cannot be visually supported.
- Keep productName concise.
- Keep identificationReason concise.
- All scores must be between 0 and 10.
- Return JSON only.
- No markdown.
- No explanation outside JSON.
`;

    try {

        console.log("=== VISUALIQ PRODUCT IDENTIFICATION START ===");

        const geminiStart = Date.now();

        const response = await Promise.race([

            ai.models.generateContent({
                model: "gemini-3.1-flash-lite",

                config: {
                    responseMimeType: "application/json",
                    temperature: 0.1
                },

                contents: [
                    {
                        inlineData: {
                            data: (await sharp(imageBuffer).resize({ width: 1280, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer()).toString("base64"),
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
                    12000
                )
            )
        ]);

        console.log(
            "GEMINI PROCESSING TIME:",
            ((Date.now() - geminiStart) / 1000).toFixed(2),
            "seconds"
        );

        const text = response.text.trim();

        let result;

        try {
            result = JSON.parse(text);
        } catch {
            const cleaned = text
                .replace(/^```json\\s*/i, "")
                .replace(/^```\\s*/i, "")
                .replace(/\\s*```$/i, "")
                .trim();

            result = JSON.parse(cleaned);
        }

        if (result.brand && /^(smartphone|phone|mobile phone|smartphone with .* display|iphone)$/i.test(String(result.productName || "").trim())) {
            result.productName = result.brand + " iPhone";
        }

        if (!result.productName) {
            result.productName = "Unable to determine precisely";
        }

        if (!result.identificationConfidence) {
            result.identificationConfidence = "Low";
        }

        if (!result.identificationReason) {
            result.identificationReason =
                "The image does not provide enough reliable visual evidence for an exact product identity.";
        }

        result.available = true;

        console.log("=== VISUALIQ PRODUCT IDENTIFICATION COMPLETE ===");
        console.log("PRODUCT:", result.productName);
        console.log("BRAND:", result.brand || "Not identified");
        console.log("CONFIDENCE:", result.identificationConfidence);

        return result;

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
                "VISUALIQ Visual Intelligence Engine is using its fallback vision system.",

            overallScore: null
        };
    }
}

module.exports = {
    analyzeProductImage
};






