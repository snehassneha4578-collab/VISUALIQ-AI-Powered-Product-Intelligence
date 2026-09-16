import React, { useRef, useState } from "react";
import "./UploadProduct.css";

const API_URL = "https://tales-chair-examining-sit.trycloudflare.com";

const assetConfig = [
  {
    key: "original",
    name: "Original",
    platform: "MASTER ASSET",
    size: "1960 × 1960"
  },
  {
    key: "optimized",
    name: "Optimized Web",
    platform: "WEB DELIVERY",
    size: "AUTO"
  },
  {
    key: "socialSquare",
    name: "Social Square",
    platform: "SOCIAL",
    size: "1080 × 1080"
  },
  {
    key: "socialPortrait",
    name: "Social Portrait",
    platform: "SOCIAL FEED",
    size: "1080 × 1350"
  },
  {
    key: "story",
    name: "Story",
    platform: "MOBILE STORY",
    size: "1080 × 1920"
  },
  {
    key: "websiteHero",
    name: "Website Hero",
    platform: "STOREFRONT",
    size: "1600 × 900"
  },
  {
    key: "marketplace",
    name: "Marketplace",
    platform: "COMMERCE",
    size: "1200 × 1200"
  }
];

function UploadProduct() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setAiProcessing(false);
  };

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const pollAIResult = async (jobId) => {
    if (!jobId) return;

    setAiProcessing(true);

    const maxAttempts = 20;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `${API_URL}/api/ai-status/${jobId}`
        );

        if (!response.ok) {
          throw new Error("AI status request failed.");
        }

        const data = await response.json();

        if (data.status === "complete" && data.analysis) {
          setResult((currentResult) => {
            if (!currentResult) return currentResult;

            return {
              ...currentResult,
              aiAnalysis: {
                ...data.analysis,
                available: true
              },
              aiStatus: "complete"
            };
          });

          setAiProcessing(false);

          console.log(
            "VISUALIQ: Gemini AI analysis received."
          );

          return;
        }

        if (data.status === "unavailable") {
          setAiProcessing(false);

          console.log(
            "VISUALIQ: Gemini unavailable. Visual Engine retained."
          );

          return;
        }
      } catch (statusError) {
        console.error(
          "VISUALIQ AI status error:",
          statusError
        );

        setAiProcessing(false);
        return;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );
    }

    setAiProcessing(false);

    console.log(
      "VISUALIQ: AI polling timeout. Visual Engine retained."
    );
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please upload a product image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setAiProcessing(false);

    try {
      const formData = new FormData();

      formData.append("product", file);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Product processing failed."
        );
      }

      setResult(data);

      setLoading(false);

      setTimeout(() => {
        document
          .getElementById("intelligence-section")
          ?.scrollIntoView({
            behavior: "smooth"
          });
      }, 100);

      if (data.aiJobId) {
        pollAIResult(data.aiJobId);
      }
    } catch (uploadError) {
      console.error(
        "VISUALIQ upload error:",
        uploadError
      );

      setError(
        uploadError.message ||
          "Unable to connect to the VISUALIQ backend."
      );

      setLoading(false);
      setAiProcessing(false);
    }
  };

  const analysis = result?.aiAnalysis;
  const visualScore = result?.visualScore;
  const visualAssets = result?.visualAssets;

  /*
   * NEW:
   * Deep Commerce Intelligence returned by backend.
   *
   * This is deterministic fallback intelligence when
   * Gemini is unavailable, and can later be replaced/
   * supplemented by real Gemini intelligence.
   */
  const deepCommerce =
    result?.deepCommerceIntelligence;

  const isFallback =
    analysis?.source ===
    "VISUALIQ Commerce Intelligence Fallback";

  const aiAvailable =
    analysis?.available === true && !isFallback;

  const analysisMode = aiAvailable
    ? "AI ACTIVE"
    : isFallback
      ? aiProcessing
        ? "AI PROCESSING"
        : "VISUAL ENGINE"
      : "READY";

  const commerceScore =
    visualScore?.commerceReadiness ??
    analysis?.overallScore ??
    deepCommerce?.overallScore ??
    0;

  const productName =
    analysis?.productName ||
    deepCommerce?.product?.name ||
    "Product";

  const category =
    analysis?.category ||
    deepCommerce?.product?.category ||
    "Commerce Product";

  const description =
    analysis?.description ||
    deepCommerce?.commerceCopy?.shortDescription ||
    "Upload a product image to generate commerce intelligence.";

  const metrics = [
    {
      label: "Visual Quality",
      value: visualScore?.visualQuality,
      icon: "✦",
      className: "purple"
    },
    {
      label: "Brand Potential",
      value: visualScore?.brandPotential,
      icon: "◆",
      className: "pink"
    },
    {
      label: "Social Readiness",
      value: visualScore?.socialReadiness,
      icon: "◎",
      className: "cyan"
    },
    {
      label: "Commerce Readiness",
      value: visualScore?.commerceReadiness,
      icon: "◈",
      className: "blue"
    }
  ];

  const audience =
    deepCommerce?.targetAudience;

  const positioning =
    deepCommerce?.brandPositioning;

  const marketing =
    deepCommerce?.marketingIntelligence;

  const platformStrategy =
    deepCommerce?.platformStrategy;

  const commerceCopy =
    deepCommerce?.commerceCopy;

  const visualDNA =
    deepCommerce?.visualDNA;

  const creativeStrategies =
    deepCommerce?.creativeStrategies;

  const visualStrengths =
    deepCommerce?.visualStrengths || [];

  const visualWeaknesses =
    deepCommerce?.visualWeaknesses || [];

  const improvementRecommendations =
    deepCommerce?.improvementRecommendations || [];

  return (
    <div className="visualiq-dashboard">

      {/* SIDEBAR */}

      <aside className="visualiq-sidebar">

        <div className="brand">

          <div className="brand-mark">
            V
          </div>

          <div>

            <div className="brand-name">
              VISUALIQ
            </div>

            <div className="brand-subtitle">
              PRODUCT INTELLIGENCE
            </div>

          </div>

        </div>

        <nav className="sidebar-nav">

          <div className="nav-item active">
            <span>◈</span>
            Product Intelligence
          </div>

          <div className="nav-item">
            <span>✦</span>
            Visual Studio
          </div>

          <div className="nav-item">
            <span>◉</span>
            Commerce Assets
          </div>

          <div className="nav-item">
            <span>↗</span>
            Deployments
          </div>

        </nav>

        <div className="sidebar-status">

          <div className="status-title">
            VISUAL INTELLIGENCE
          </div>

          <div className="status-row">
            <span className="status-dot"></span>
            Cloudinary Connected
          </div>

          <p>
            AI-powered visual commerce pipeline
          </p>

        </div>

      </aside>


      {/* MAIN */}

      <main className="visualiq-main">

        {/* TOP BAR */}

        <header className="topbar">

          <div>

            <div className="eyebrow">
              ☁ CLOUDINARY VISUAL COMMERCE
            </div>

            <h1>
              Product Intelligence
            </h1>

            <p>
              Transform one product image into
              commerce-ready intelligence and assets.
            </p>

          </div>

          <div className="pipeline-status">
            <span></span>
            Pipeline Active
          </div>

        </header>


        {/* HERO */}

        <section className="hero-card">

          <div className="hero-content">

            <div className="hero-badge">
              ✦ AI PRODUCT INTELLIGENCE
            </div>

            <h2>
              See Your Product's
              <span> Commerce Potential</span>
            </h2>

            <p>
              Upload one product image and VISUALIQ
              evaluates visual quality, brand potential,
              social readiness and commerce readiness.
            </p>

            <div className="hero-features">

              <div>
                <span>✦</span>
                Visual Scoring
              </div>

              <div>
                <span>◈</span>
                Commerce Analysis
              </div>

              <div>
                <span>◎</span>
                Multi-channel Assets
              </div>

            </div>

          </div>

          <div className="hero-orb">

            <div className="orb-inner">
              V
            </div>

          </div>

        </section>


        {/* UPLOAD WORKSPACE */}

        <section className="workspace-grid">

          {/* UPLOAD */}

          <div
            className="upload-card"
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
          >

            <div className="section-label">
              01 — INPUT
            </div>

            <h3>
              Product Image
            </h3>

            <p className="section-description">
              Upload your source product image.
            </p>

            <div className="upload-zone">

              {!file ? (
                <>

                  <div className="upload-icon">
                    ↑
                  </div>

                  <h4>
                    Drop your product image here
                  </h4>

                  <p>
                    PNG, JPG or WEBP
                  </p>

                  <button
                    type="button"
                    className="upload-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    Choose Product Image
                  </button>

                </>
              ) : (
                <>

                  <div className="selected-image-wrap">

                    <img
                      src={preview}
                      alt="Selected product"
                    />

                  </div>

                  <div className="selected-file">

                    <strong>
                      {file.name}
                    </strong>

                    <span>
                      {(file.size / 1024 / 1024).toFixed(2)}
                      {" "}MB
                    </span>

                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    Change Image
                  </button>

                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                hidden
              />

            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="button"
              className="analyze-button"
              onClick={handleUpload}
              disabled={!file || loading}
            >
              {loading
                ? "Processing Product..."
                : "Analyze Product →"}
            </button>

          </div>


          {/* PREVIEW */}

          <div className="preview-card">

            <div className="section-label">
              02 — VISUAL REPRESENTATION
            </div>

            <div className="preview-header">

              <div>

                <h3>
                  Product Preview
                </h3>

                <p className="section-description">
                  Your source asset
                </p>

              </div>

              {file && (
                <span className="ready-badge">
                  READY
                </span>
              )}

            </div>

            <div className="large-preview">

              {preview ? (
                <img
                  src={preview}
                  alt="Product preview"
                />
              ) : (
                <div className="empty-preview">

                  <span>
                    V
                  </span>

                  <p>
                    Product image preview
                  </p>

                </div>
              )}

            </div>

          </div>

        </section>


        {/* INTELLIGENCE */}

        <section
          id="intelligence-section"
          className="intelligence-section"
        >

          <div className="section-label">
            03 — INTELLIGENCE
          </div>

          <div className="intelligence-header">

            <div>

              <h2>
                Commerce Analysis
              </h2>

              <p>
                Visual intelligence generated by
                the VISUALIQ pipeline.
              </p>

            </div>

            <div className="mode-badge">

              <span></span>

              {analysisMode}

            </div>

          </div>


          <div className="intelligence-grid">

            {/* SCORE */}

            <div className="score-card">

              <div className="score-title">
                COMMERCE READINESS
              </div>

              <div className="score-ring">

                <div className="score-value">

                  {result
                    ? Number(commerceScore).toFixed(1)
                    : "—"}

                  <small>
                    /10
                  </small>

                </div>

              </div>

              <div className="score-caption">

                {result
                  ? "Visual commerce score"
                  : "Analyze your product to generate the score"}

              </div>

            </div>


            {/* PRODUCT INFO */}

            <div className="product-info-card">

              <div className="product-info-top">

                <div>

                  <span className="mini-label">
                    PRODUCT
                  </span>

                  <h3>
                    {result
                      ? productName
                      : "Waiting for analysis"}
                  </h3>

                  <span className="category">

                    {result
                      ? category
                      : "Commerce Product"}

                  </span>

                </div>

                {result && (
                  <div className="analysis-status">

                    {aiAvailable
                      ? "AI ANALYSIS"
                      : aiProcessing
                        ? "AI PROCESSING"
                        : "VISUAL ENGINE"}

                  </div>
                )}

              </div>

              <p className="product-description">
                {description}
              </p>

              {!result && (
                <div className="waiting-box">

                  <span>
                    ✦
                  </span>

                  Analyze your product to generate
                  the real visual commerce report.

                </div>
              )}

              {result &&
                analysis?.keyFeatures &&
                analysis.keyFeatures.length > 0 && (
                  <div className="features-list">

                    {analysis.keyFeatures
                      .slice(0, 3)
                      .map((feature, index) => (

                        <div
                          key={index}
                          className="feature-row"
                        >

                          <span>
                            ✓
                          </span>

                          {feature}

                        </div>

                      ))}

                  </div>
                )}

              {/* Deterministic intelligence features */}

              {result &&
                !analysis?.keyFeatures &&
                deepCommerce?.commerceCopy?.bulletPoints && (

                  <div className="features-list">

                    {deepCommerce.commerceCopy.bulletPoints
                      .slice(0, 3)
                      .map((feature, index) => (

                        <div
                          key={index}
                          className="feature-row"
                        >

                          <span>
                            ✓
                          </span>

                          {feature}

                        </div>

                      ))}

                  </div>

                )}

            </div>

          </div>


          {/* METRICS */}

          <div className="metrics-grid">

            {metrics.map((metric) => (

              <div
                key={metric.label}
                className={`metric-card ${metric.className}`}
              >

                <div className="metric-icon">
                  {metric.icon}
                </div>

                <div className="metric-name">
                  {metric.label}
                </div>

                <div className="metric-value">

                  {metric.value !== undefined
                    ? `${metric.value.toFixed(1)}/10`
                    : "—"}

                </div>

              </div>

            ))}

          </div>


          {/* =====================================================
              DEEP COMMERCE INTELLIGENCE
             ===================================================== */}

          {result && deepCommerce && (

            <section
              style={{
                marginTop: "32px"
              }}
            >

              <div className="section-label">
                DEEP COMMERCE INTELLIGENCE
              </div>

              <div
                className="intelligence-header"
                style={{
                  marginTop: "8px"
                }}
              >

                <div>

                  <h2>
                    Commerce Strategy
                  </h2>

                  <p>
                    Product intelligence derived from the
                    VISUALIQ commerce engine.
                  </p>

                </div>

                <div className="mode-badge">

                  <span></span>

                  {deepCommerce.source ||
                    "VISUALIQ ENGINE"}

                </div>

              </div>


              {/* AUDIENCE + POSITIONING */}

              <div
                className="intelligence-grid"
                style={{
                  marginTop: "20px"
                }}
              >

                {/* TARGET AUDIENCE */}

                <div className="product-info-card">

                  <div className="mini-label">
                    TARGET AUDIENCE
                  </div>

                  <h3>
                    {audience?.primary ||
                      "Online Shoppers"}
                  </h3>

                  <p className="product-description">

                    Secondary:
                    {" "}
                    {audience?.secondary ||
                      "Digital commerce consumers"}

                  </p>

                  {audience?.purchaseMotivation?.length > 0 && (

                    <div className="features-list">

                      {audience.purchaseMotivation.map(
                        (item, index) => (

                          <div
                            className="feature-row"
                            key={index}
                          >

                            <span>
                              ✓
                            </span>

                            {item}

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>


                {/* BRAND POSITIONING */}

                <div className="product-info-card">

                  <div className="mini-label">
                    BRAND POSITIONING
                  </div>

                  <h3>
                    {positioning?.position ||
                      "Digital Commerce Product"}
                  </h3>

                  <p className="product-description">

                    Perceived tier:
                    {" "}
                    {positioning?.perceivedTier ||
                      "Mid-market"}

                  </p>

                  {positioning?.personality?.length > 0 && (

                    <div className="features-list">

                      {positioning.personality.map(
                        (item, index) => (

                          <div
                            className="feature-row"
                            key={index}
                          >

                            <span>
                              ◆
                            </span>

                            {item}

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              </div>


              {/* MARKETING INTELLIGENCE */}

              {marketing && (

                <div
                  className="product-info-card"
                  style={{
                    marginTop: "20px"
                  }}
                >

                  <div className="mini-label">
                    MARKETING INTELLIGENCE
                  </div>

                  <h3>
                    {marketing.bestMarketingAngle}
                  </h3>

                  <p className="product-description">

                    {marketing.recommendedMessage}

                  </p>

                  <div
                    className="features-list"
                    style={{
                      marginTop: "18px"
                    }}
                  >

                    <div className="feature-row">

                      <span>
                        ✦
                      </span>

                      Campaign:
                      {" "}
                      {marketing.campaignConcept}

                    </div>

                    <div className="feature-row">

                      <span>
                        →
                      </span>

                      CTA:
                      {" "}
                      {marketing.callToAction}

                    </div>

                  </div>

                  {marketing.contentIdeas?.length > 0 && (

                    <div
                      className="features-list"
                      style={{
                        marginTop: "10px"
                      }}
                    >

                      {marketing.contentIdeas.map(
                        (idea, index) => (

                          <div
                            className="feature-row"
                            key={index}
                          >

                            <span>
                              ◎
                            </span>

                            {idea}

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}


              {/* STRENGTHS + WEAKNESSES */}

              <div
                className="intelligence-grid"
                style={{
                  marginTop: "20px"
                }}
              >

                {/* STRENGTHS */}

                <div className="product-info-card">

                  <div className="mini-label">
                    VISUAL STRENGTHS
                  </div>

                  <h3>
                    What is working
                  </h3>

                  <div className="features-list">

                    {visualStrengths.map(
                      (item, index) => (

                        <div
                          className="feature-row"
                          key={index}
                        >

                          <span>
                            ✓
                          </span>

                          {item}

                        </div>

                      )
                    )}

                  </div>

                </div>


                {/* WEAKNESSES */}

                <div className="product-info-card">

                  <div className="mini-label">
                    VISUAL WEAKNESSES
                  </div>

                  <h3>
                    What can improve
                  </h3>

                  <div className="features-list">

                    {visualWeaknesses.map(
                      (item, index) => (

                        <div
                          className="feature-row"
                          key={index}
                        >

                          <span>
                            !
                          </span>

                          {item}

                        </div>

                      )
                    )}

                  </div>

                </div>

              </div>


              {/* PLATFORM STRATEGY */}

              {platformStrategy && (

                <div
                  className="product-info-card"
                  style={{
                    marginTop: "20px"
                  }}
                >

                  <div className="mini-label">
                    PLATFORM STRATEGY
                  </div>

                  <h3>
                    Multi-channel Commerce Strategy
                  </h3>

                  <div
                    className="features-list"
                    style={{
                      marginTop: "18px"
                    }}
                  >

                    <div className="feature-row">

                      <span>
                        ◎
                      </span>

                      <strong>
                        Instagram:
                      </strong>
                      {" "}
                      {platformStrategy.instagram}

                    </div>

                    <div className="feature-row">

                      <span>
                        ◈
                      </span>

                      <strong>
                        Marketplace:
                      </strong>
                      {" "}
                      {platformStrategy.marketplace}

                    </div>

                    <div className="feature-row">

                      <span>
                        ✦
                      </span>

                      <strong>
                        Website:
                      </strong>
                      {" "}
                      {platformStrategy.website}

                    </div>

                    <div className="feature-row">

                      <span>
                        ▶
                      </span>

                      <strong>
                        Short Video:
                      </strong>
                      {" "}
                      {platformStrategy.shortVideo}

                    </div>

                  </div>

                </div>

              )}


              {/* COMMERCE COPY */}

              {commerceCopy && (

                <div
                  className="product-info-card"
                  style={{
                    marginTop: "20px"
                  }}
                >

                  <div className="mini-label">
                    COMMERCE COPY
                  </div>

                  <h3>
                    {commerceCopy.productTitle}
                  </h3>

                  <p className="product-description">
                    {commerceCopy.shortDescription}
                  </p>

                  {commerceCopy.bulletPoints?.length > 0 && (

                    <div className="features-list">

                      {commerceCopy.bulletPoints.map(
                        (item, index) => (

                          <div
                            className="feature-row"
                            key={index}
                          >

                            <span>
                              ✓
                            </span>

                            {item}

                          </div>

                        )
                      )}

                    </div>

                  )}

                  <div
                    className="waiting-box"
                    style={{
                      marginTop: "16px"
                    }}
                  >

                    <span>
                      ✦
                    </span>

                    {commerceCopy.socialCaption}

                  </div>

                  <div
                    className="features-list"
                    style={{
                      marginTop: "12px"
                    }}
                  >

                    <div className="feature-row">

                      <span>
                        →
                      </span>

                      Ad Headline:
                      {" "}
                      {commerceCopy.adHeadline}

                    </div>

                    <div className="feature-row">

                      <span>
                        →
                      </span>

                      {commerceCopy.adDescription}

                    </div>

                  </div>

                </div>

              )}


              {/* VISUAL DNA */}

              {visualDNA && (

                <div
                  className="intelligence-grid"
                  style={{
                    marginTop: "20px"
                  }}
                >

                  <div className="product-info-card">

                    <div className="mini-label">
                      VISUAL DNA
                    </div>

                    <h3>
                      Visual Identity Profile
                    </h3>

                    {visualDNA.mood?.length > 0 && (

                      <div className="features-list">

                        {visualDNA.mood.map(
                          (item, index) => (

                            <div
                              className="feature-row"
                              key={index}
                            >

                              <span>
                                ◆
                              </span>

                              Mood:
                              {" "}
                              {item}

                            </div>

                          )
                        )}

                      </div>

                    )}

                    {visualDNA.style?.length > 0 && (

                      <div className="features-list">

                        {visualDNA.style.map(
                          (item, index) => (

                            <div
                              className="feature-row"
                              key={index}
                            >

                              <span>
                                ✦
                              </span>

                              Style:
                              {" "}
                              {item}

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>


                  <div className="product-info-card">

                    <div className="mini-label">
                      BRAND KEYWORDS
                    </div>

                    <h3>
                      Commerce Identity
                    </h3>

                    <div className="features-list">

                      {visualDNA.brandKeywords?.map(
                        (item, index) => (

                          <div
                            className="feature-row"
                            key={index}
                          >

                            <span>
                              #
                            </span>

                            {item}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </div>

              )}


              {/* CREATIVE STRATEGIES */}

              {creativeStrategies?.length > 0 && (

                <div
                  className="product-info-card"
                  style={{
                    marginTop: "20px"
                  }}
                >

                  <div className="mini-label">
                    CREATIVE STRATEGIES
                  </div>

                  <h3>
                    Recommended Creative Directions
                  </h3>

                  <div className="features-list">

                    {creativeStrategies.map(
                      (strategy, index) => (

                        <div
                          className="feature-row"
                          key={index}
                        >

                          <span>
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <strong>
                            {strategy.strategy}
                          </strong>

                          {" — "}

                          {strategy.reason}

                          {" "}

                          <strong>
                            {Number(strategy.score).toFixed(1)}/10
                          </strong>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* IMPROVEMENT RECOMMENDATIONS */}

              {improvementRecommendations.length > 0 && (

                <div
                  className="product-info-card"
                  style={{
                    marginTop: "20px"
                  }}
                >

                  <div className="mini-label">
                    OPTIMIZATION
                  </div>

                  <h3>
                    Improvement Recommendations
                  </h3>

                  <div className="features-list">

                    {improvementRecommendations.map(
                      (item, index) => (

                        <div
                          className="feature-row"
                          key={index}
                        >

                          <span>
                            →
                          </span>

                          {item}

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            </section>

          )}

        </section>


        {/* PIPELINE */}

        <section className="pipeline-section">

          <div className="section-label">
            VISUALIQ PIPELINE
          </div>

          <div className="pipeline-grid">

            <div className="pipeline-step">

              <div className="pipeline-number">
                01
              </div>

              <div>

                <strong>
                  Analyze
                </strong>

                <span>
                  Understand product visuals
                </span>

              </div>

            </div>

            <div className="pipeline-step">

              <div className="pipeline-number">
                02
              </div>

              <div>

                <strong>
                  Rate
                </strong>

                <span>
                  Score commerce potential
                </span>

              </div>

            </div>

            <div className="pipeline-step">

              <div className="pipeline-number">
                03
              </div>

              <div>

                <strong>
                  Represent
                </strong>

                <span>
                  Generate visual assets
                </span>

              </div>

            </div>

            <div className="pipeline-step">

              <div className="pipeline-number">
                04
              </div>

              <div>

                <strong>
                  Deploy
                </strong>

                <span>
                  Deliver across channels
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ASSETS */}

        {result && visualAssets && (

          <section className="assets-section">

            <div className="section-label">
              04 — VISUAL STUDIO
            </div>

            <div className="intelligence-header">

              <div>

                <h2>
                  Commerce Assets
                </h2>

                <p>
                  Cloudinary-powered multi-channel
                  visual representations.
                </p>

              </div>

            </div>

            <div className="assets-grid">

              {assetConfig.map((asset) => (

                visualAssets[asset.key] && (

                  <div
                    className="asset-card"
                    key={asset.key}
                  >

                    <div className="asset-image">

                      <img
                        src={visualAssets[asset.key]}
                        alt={asset.name}
                      />

                    </div>

                    <div className="asset-info">

                      <div>

                        <strong>
                          {asset.name}
                        </strong>

                        <span>
                          {asset.platform}
                        </span>

                      </div>

                      <small>
                        {asset.size}
                      </small>

                    </div>

                  </div>

                )

              ))}

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default UploadProduct;
