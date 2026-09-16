function buildDeepCommerceIntelligence(product, visualScore) {

    const name = product?.name || product?.productName || "Product";
    const category = (product?.category || "general product").toLowerCase();

    const score =
        typeof visualScore === "number"
            ? visualScore
            : Number(visualScore?.overallScore || 5);

    const normalized = Math.max(0, Math.min(10, score));

    let audience;
    let angle;
    let positioning;

    if (
        category.includes("watch") ||
        category.includes("jewelry") ||
        category.includes("accessory")
    ) {
        audience = {
            primary: "Style-conscious consumers",
            secondary: "Gift buyers and lifestyle shoppers",
            purchaseMotivation: [
                "Visual appeal",
                "Personal style",
                "Gift suitability"
            ]
        };

        angle = "Premium visual presentation and everyday style";

        positioning = {
            position: "Style-focused lifestyle product",
            personality: [
                "Elegant",
                "Modern",
                "Aspirational"
            ],
            perceivedTier: normalized >= 8 ? "Premium" : "Mid-market"
        };

    } else if (
        category.includes("shoe") ||
        category.includes("footwear")
    ) {
        audience = {
            primary: "Fashion and lifestyle shoppers",
            secondary: "Active consumers and online footwear buyers",
            purchaseMotivation: [
                "Style",
                "Visual appeal",
                "Everyday usability"
            ]
        };

        angle = "Style-led product discovery with strong visual presentation";

        positioning = {
            position: "Modern lifestyle footwear",
            personality: [
                "Contemporary",
                "Energetic",
                "Practical"
            ],
            perceivedTier: normalized >= 8 ? "Premium" : "Accessible"
        };

    } else if (
        category.includes("perfume") ||
        category.includes("fragrance") ||
        category.includes("cosmetic") ||
        category.includes("beauty")
    ) {
        audience = {
            primary: "Beauty and lifestyle consumers",
            secondary: "Gift buyers and premium-product shoppers",
            purchaseMotivation: [
                "Aesthetic appeal",
                "Self-expression",
                "Gift potential"
            ]
        };

        angle = "Aspirational visual storytelling and lifestyle appeal";

        positioning = {
            position: "Lifestyle and beauty-oriented product",
            personality: [
                "Elegant",
                "Aspirational",
                "Refined"
            ],
            perceivedTier: normalized >= 8 ? "Premium" : "Mid-market"
        };

    } else {
        audience = {
            primary: "Online shoppers",
            secondary: "Mobile-first commerce consumers",
            purchaseMotivation: [
                "Product appearance",
                "Convenience",
                "Visual confidence"
            ]
        };

        angle = "Clear visual presentation designed for confident online discovery";

        positioning = {
            position: "Digital commerce product",
            personality: [
                "Modern",
                "Accessible",
                "Practical"
            ],
            perceivedTier: normalized >= 8 ? "Premium" : "Mid-market"
        };
    }

    const strengths = [];

    if (normalized >= 7) {
        strengths.push("Strong overall visual commerce potential");
    }

    strengths.push("Product is clearly identifiable");
    strengths.push("Suitable for multi-channel visual delivery");

    if (normalized >= 8) {
        strengths.push("Strong potential for premium positioning");
    }

    const weaknesses = [];

    if (normalized < 7) {
        weaknesses.push("Visual presentation could be strengthened for stronger conversion potential");
    }

    if (normalized < 8) {
        weaknesses.push("Additional creative refinement could improve perceived product value");
    }

    weaknesses.push("Lifestyle context could strengthen emotional product storytelling");

    const improvementRecommendations = [
        "Create a stronger lifestyle-oriented hero composition",
        "Use consistent visual treatment across social and marketplace assets",
        "Strengthen product-focused messaging above the fold",
        "Test multiple creative angles before launching paid campaigns"
    ];

    const contentIdeas = [
        "Product-focused carousel",
        "Lifestyle product post",
        "Before-and-after creative optimization",
        "Short-form product showcase video"
    ];

    return {
        engine: "VISUALIQ Deep Commerce Intelligence",
        source: "Deterministic Visual Commerce Engine",
        available: true,

        product: {
            name,
            category
        },

        targetAudience: audience,

        brandPositioning: positioning,

        visualStrengths: strengths,

        visualWeaknesses: weaknesses,

        marketingIntelligence: {
            bestMarketingAngle: angle,
            campaignConcept:
                `Visual-first ${name} commerce campaign`,
            recommendedMessage:
                `Discover ${name} through a clear, polished and commerce-ready visual experience.`,
            callToAction: "Explore Product",
            contentIdeas
        },

        platformStrategy: {
            instagram:
                "Use visually strong square and portrait creatives with concise lifestyle-focused messaging.",
            marketplace:
                "Lead with the clearest product image and concise benefit-oriented copy.",
            website:
                "Use the optimized hero asset with strong product hierarchy and clear CTA.",
            shortVideo:
                "Show the product through a fast visual sequence highlighting appearance and key visible details."
        },

        commerceCopy: {
            productTitle: name,
            shortDescription:
                `A visually presented ${category} designed for modern digital commerce.`,
            bulletPoints: [
                "Clear product-focused presentation",
                "Multi-channel commerce-ready assets",
                "Optimized for digital discovery"
            ],
            socialCaption:
                `Discover ${name}. Designed to stand out across today's visual-first shopping experience.`,
            adHeadline:
                `Discover ${name}`,
            adDescription:
                "Bring the product into focus with a polished visual commerce experience."
        },

        improvementRecommendations,

        visualDNA: {
            mood: positioning.personality,
            style: [
                "Clean",
                "Commerce-focused",
                "Visual-first"
            ],
            dominantColors: [],
            brandKeywords: [
                "Visual Commerce",
                "Modern",
                "Product Discovery",
                "Digital Retail"
            ]
        },

        creativeStrategies: [
            {
                strategy: "Clean Product Focus",
                reason: "Maximize product visibility and reduce visual distraction.",
                score: Math.min(10, normalized + 0.8)
            },
            {
                strategy: "Lifestyle Storytelling",
                reason: "Add emotional context around the product.",
                score: Math.min(10, normalized + 0.4)
            },
            {
                strategy: "Social Discovery",
                reason: "Adapt the product for visual-first social browsing.",
                score: Math.min(10, normalized + 0.6)
            }
        ],

        overallScore: Number(normalized.toFixed(1))
    };
}

module.exports = {
    buildDeepCommerceIntelligence
};
