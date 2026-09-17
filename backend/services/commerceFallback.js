function buildCommerceFallback(fileName, visualScore) {

  const quality =
    visualScore?.visualQuality ?? 0;

  const brand =
    visualScore?.brandPotential ?? 0;

  const social =
    visualScore?.socialReadiness ?? 0;

  const commerce =
    visualScore?.commerceReadiness ?? 0;

  const keyFeatures = [
    "High-resolution product presentation",
    "Optimized for multi-channel commerce delivery",
    "Suitable for social and marketplace creative formats"
  ];

  const strengths = [];

  if (quality >= 7) {
    strengths.push(
      "Strong visual quality for digital product presentation"
    );
  }

  if (brand >= 7) {
    strengths.push(
      "Good visual potential for consistent brand presentation"
    );
  }

  if (social >= 7) {
    strengths.push(
      "Strong readiness for social commerce formats"
    );
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

    source:
      "VISUALIQ Commerce Intelligence Fallback",

    mode:
      "deterministic",

    // IMPORTANT:
    // The fallback does NOT identify the product from
    // the filename. Product identification belongs to
    // the vision AI layer.

    productName:
      "Product not confidently identified",

    category:
      "Visual Commerce Product",

    description:
      "VISUALIQ generated a commerce profile from the visible characteristics of the uploaded product image.",

    keyFeatures,

    targetAudience:
      "Online shoppers and digital commerce audiences",

    visualAnalysis:
      `The product image achieved ${quality.toFixed(
        1
      )}/10 visual quality, ${brand.toFixed(
        1
      )}/10 brand potential, and ${social.toFixed(
        1
      )}/10 social readiness.`,

    strengths,

    weaknesses:
      suggestedImprovements,

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

    overallScore:
      Number(commerce.toFixed(1)),

    confidence:
      "LOW"
  };
}

module.exports = {
  buildCommerceFallback
};
