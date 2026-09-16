function buildCommerceFallback(fileName, visualScore) {
  const name = String(fileName || "product")
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const productName =
    name && name.toLowerCase() !== "product"
      ? name.replace(/\b\w/g, (char) => char.toUpperCase())
      : "Product";

  const quality = visualScore?.visualQuality ?? 0;
  const brand = visualScore?.brandPotential ?? 0;
  const social = visualScore?.socialReadiness ?? 0;

  const keyFeatures = [
    "High-resolution product presentation",
    "Optimized for multi-channel commerce delivery",
    "Suitable for social and marketplace creative formats"
  ];

  const strengths = [];

  if (quality >= 7) {
    strengths.push("Strong visual quality for digital product presentation");
  }

  if (brand >= 7) {
    strengths.push("Good visual potential for consistent brand presentation");
  }

  if (social >= 7) {
    strengths.push("Strong readiness for social commerce formats");
  }

  if (!strengths.length) {
    strengths.push(
      "Product image provides a usable foundation for commerce optimization"
    );
  }

  const suggestedImprovements = [];

  if (quality < 8) {
    suggestedImprovements.push(
      "Improve lighting, sharpness, or composition for stronger product presentation"
    );
  }

  if (brand < 8) {
    suggestedImprovements.push(
      "Use a more consistent visual style to strengthen brand identity"
    );
  }

  if (social < 8) {
    suggestedImprovements.push(
      "Optimize framing and visual hierarchy for social-first content"
    );
  }

  if (!suggestedImprovements.length) {
    suggestedImprovements.push(
      "Maintain consistent visual quality across future campaign assets"
    );
  }

  return {
    available: true,
    source: "VISUALIQ Commerce Intelligence Fallback",
    mode: "deterministic",

    productName,

    category: "Commerce Product",

    description:
      `Visual commerce profile generated for ${productName} using the VISUALIQ Visual Intelligence Engine.`,

    keyFeatures,

    targetAudience:
      "Online shoppers and digital commerce audiences",

    visualAnalysis:
      `The product achieved ${quality.toFixed(
        1
      )}/10 visual quality, ${brand.toFixed(
        1
      )}/10 brand potential, and ${social.toFixed(
        1
      )}/10 social readiness.`,

    strengths,

    weaknesses: suggestedImprovements,

    uniqueSellingPoints: [
      "Commerce-ready visual asset generation",
      "Multi-channel image optimization",
      "Cloudinary-powered visual delivery"
    ],

    marketingInsights: [
      "Use consistent product imagery across social and commerce channels",
      "Prioritize strong visual presentation in product listings",
      "Reuse optimized assets across multiple campaign placements"
    ],

    suggestedImprovements,

    overallScore: Number(
      visualScore?.commerceReadiness ?? 0
    ),

    confidence: "MEDIUM"
  };
}

module.exports = {
  buildCommerceFallback
};