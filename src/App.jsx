import { useRef, useState } from "react";
import "./App.css";

const API = "https://visualiq-ai-powered-product-intelligence.onrender.com/api";

function App() {
  const fileInputRef = useRef(null);

  const [active, setActive] = useState("Product Intelligence");
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [media, setMedia] = useState(null);
  const [error, setError] = useState("");

  const handleImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    setSelectedFile(file);
    setImage({
      name: file.name,
      url: URL.createObjectURL(file),
      size: (file.size / 1024 / 1024).toFixed(2),
    });

    setAnalysis(null);
    setMedia(null);
    setError("");
  };

  const handleFileChange = (e) => {
    handleImage(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleImage(e.dataTransfer.files?.[0]);
  };

  const analyzeProduct = async () => {
    if (!selectedFile) {
      setError("Upload a product image first.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    setMedia(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("upload_preset", "visualiq_products");

      const response = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const raw = await response.text();
          throw new Error(
            `Backend returned ${response.status} ${response.statusText} instead of JSON: ${raw.slice(0, 120)}`
          );
        }

        const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Analysis failed.");
      }

      setAnalysis(data);

      if (data.aiJobId) {
        pollAI(data.aiJobId);
      }

      if (data.mediaJobId) {
        pollMedia(data.mediaJobId);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setAnalyzing(false);
    }
  };

  const pollAI = async (jobId) => {
    let attempts = 0;

    const check = async () => {
      try {
        const response = await fetch(`${API}/ai-status/${jobId}`);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const raw = await response.text();
          throw new Error(
            `Backend returned ${response.status} ${response.statusText} instead of JSON: ${raw.slice(0, 120)}`
          );
        }

        const data = await response.json();

        if (data.status === "complete") {
          setAnalysis((previous) => ({
            ...previous,
            aiAnalysis: data.analysis,
            deepCommerceIntelligence:
              data.deepCommerceIntelligence,
            product: {
              ...(previous?.product || {}),
              name:
                data.analysis?.productName ||
                previous?.product?.name ||
                "Product",
              category:
                data.analysis?.category ||
                previous?.product?.category ||
                "Product",
            },
          }));

          setAnalyzing(false);
          return;
        }

        if (data.status === "error") {
          setAnalyzing(false);
          return;
        }

        attempts++;

        if (attempts < 30) {
          setTimeout(check, 700);
        } else {
          setAnalyzing(false);
        }
      } catch (err) {
        console.error("AI polling error:", err);
        setAnalyzing(false);
      }
    };

    check();
  };

  const pollMedia = async (jobId) => {
    let attempts = 0;

    const check = async () => {
      try {
        const response = await fetch(`${API}/media-status/${jobId}`);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const raw = await response.text();
          throw new Error(
            `Backend returned ${response.status} ${response.statusText} instead of JSON: ${raw.slice(0, 120)}`
          );
        }

        const data = await response.json();

        if (data.status === "complete") {
          setMedia(data);
          return;
        }

        attempts++;

        if (attempts < 40) {
          setTimeout(check, 800);
        }
      } catch (err) {
        console.error("Media polling error:", err);
      }
    };

    check();
  };

  const productName =
    analysis?.aiAnalysis?.productName ||
    analysis?.product?.name ||
    "Product";

  const category =
    analysis?.aiAnalysis?.category ||
    analysis?.product?.category ||
    "Product";

  const score =
    analysis?.visualScore?.commerceReadiness ||
    analysis?.visualScore?.overall ||
    analysis?.deepCommerceIntelligence?.commerceReadiness ||
    6.7;

  const intelligence =
    analysis?.deepCommerceIntelligence ||
    analysis?.aiAnalysis ||
    {};

  const visualScore =
    analysis?.visualScore || {};

  const assets =
    media?.visualAssets ||
    analysis?.visualAssets ||
    {};

  const scoreValue = (value, fallback = 6.7) => {
    if (typeof value === "number") return value.toFixed(1);
    return fallback.toFixed(1);
  };

  return (
    <div className="visualiq-app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">V</div>

          <div>
            <div className="brand-name">VISUALIQ</div>
            <div className="brand-subtitle">PRODUCT INTELLIGENCE</div>
          </div>
        </div>

        <div className="sidebar-section-title">
          WORKSPACE
        </div>

        <nav className="sidebar-nav">
          {[
            ["Product Intelligence", "◈"],
            ["Visual Studio", "✦"],
            ["Commerce Assets", "▣"],
            ["Deployments", "↗"],
          ].map(([item, icon]) => (
            <button
              key={item}
              className={
                active === item
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              onClick={() => setActive(item)}
            >
              <span>{icon}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-card">
            <div className="connection-top">
              <span className="live-dot"></span>
              <span>Cloudinary Connected</span>
            </div>

            <small>
              AI-powered visual commerce pipeline
            </small>
          </div>

          <div className="sidebar-footer">
            <div className="mini-avatar">SS</div>
            <div>
              <strong>VISUALIQ</strong>
              <span>AI Commerce Studio</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <span className="top-eyebrow">
              VISUAL INTELLIGENCE
            </span>
            <div className="top-title">
              Product Intelligence
            </div>
          </div>

          <div className="top-status">
            <span className="live-dot"></span>
            Pipeline Active
          </div>
        </header>

        {/* PAGE HEADER */}
        <section className="page-header">
          <div>
            <div className="section-kicker">
              AI PRODUCT INTELLIGENCE
            </div>

            <h1>
              See Your Product's
              <span> Commerce Potential</span>
            </h1>

            <p>
              Upload one product image and VISUALIQ evaluates
              visual quality, brand potential, social readiness
              and commerce readiness.
            </p>
          </div>

          <div className="header-orb">
            <div className="orb-ring ring-one"></div>
            <div className="orb-ring ring-two"></div>
            <div className="orb-core">V</div>
          </div>
        </section>

        {/* FEATURE STRIP */}
        <div className="feature-strip">
          <div>
            <span>01</span>
            <strong>Visual Scoring</strong>
          </div>

          <div>
            <span>02</span>
            <strong>Commerce Analysis</strong>
          </div>

          <div>
            <span>03</span>
            <strong>Multi-channel Assets</strong>
          </div>
        </div>

        {/* INPUT + PREVIEW */}
        <section className="input-grid">

          {/* INPUT */}
          <div className="panel input-panel">
            <div className="panel-number">01 | INPUT</div>

            <div className="panel-heading">
              <div>
                <h2>Product Image</h2>
                <p>Upload your source product image.</p>
              </div>
            </div>

            {!image ? (
              <div
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="drop-icon">↑</div>

                <strong>Drop product image</strong>

                <span>
                  PNG, JPG or WEBP
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Select Product
                </button>
              </div>
            ) : (
              <div className="selected-file">
                <img src={image.url} alt="Selected product" />

                <div className="file-details">
                  <span className="ready-badge">
                    READY
                  </span>

                  <strong>{image.name}</strong>

                  <small>
                    {image.size} MB · Product image
                  </small>

                  <button
                    className="change-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    Change Image
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={handleFileChange}
            />

            <button
              className="analyze-button"
              disabled={!selectedFile || analyzing}
              onClick={analyzeProduct}
            >
              {analyzing
                ? "Analyzing Product..."
                : "Analyze Product"}
              <span>→</span>
            </button>

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}
          </div>

          {/* VISUAL REPRESENTATION */}
          <div className="panel preview-panel">
            <div className="panel-number">
              02 - VISUAL REPRESENTATION
            </div>

            <div className="panel-heading">
              <div>
                <h2>Product Preview</h2>
                <p>Your source asset</p>
              </div>

              {image && (
                <span className="ready-badge">
                  READY
                </span>
              )}
            </div>

            <div className="preview-stage">
              {image ? (
                <img
                  src={image.url}
                  alt="Product preview"
                />
              ) : (
                <div className="empty-product">
                  <div className="empty-v">V</div>
                  <span>Awaiting product image</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* INTELLIGENCE */}
        <section className="intelligence-section">

          <div className="section-header-row">
            <div>
              <div className="panel-number">
                03 INTELLIGENCE
              </div>

              <h2>Commerce Analysis</h2>

              <p>
                Visual intelligence generated by the VISUALIQ
                pipeline.
              </p>
            </div>

            <div className="ai-active">
              <span className="live-dot"></span>
              AI ACTIVE
            </div>
          </div>

          <div className="analysis-layout">

            {/* PRODUCT IDENTITY */}
            <div className="product-identity panel">
              <div className="commerce-label">
                COMMERCE READINESS
              </div>

              <div className="big-score">
                {scoreValue(score)}
                <span>/10</span>
              </div>

              <div className="score-caption">
                Visual commerce score
              </div>

              <div className="product-divider"></div>

              <div className="commerce-label">
                PRODUCT
              </div>

              <h3>{productName}</h3>

              <span className="category-tag">
                {category}
              </span>

              <div className="ai-description">
                <span>AI ANALYSIS</span>

                <p>
                  {analysis?.aiAnalysis?.identificationReason ||
                    `VISUALIQ identified the visible product through
                    multimodal product intelligence.`}
                </p>

                {analysis?.aiAnalysis?.brand && (
                  <div className="identity-meta">
                    <span>BRAND</span>
                    <strong>
                      {analysis.aiAnalysis.brand}
                    </strong>
                  </div>
                )}

                {analysis?.aiAnalysis?.variant && (
                  <div className="identity-meta">
                    <span>VARIANT</span>
                    <strong>
                      {analysis.aiAnalysis.variant}
                    </strong>
                  </div>
                )}

                {analysis?.aiAnalysis?.identificationConfidence && (
                  <div className="confidence">
                    <span>
                      IDENTIFICATION CONFIDENCE
                    </span>
                    <strong>
                      {analysis.aiAnalysis.identificationConfidence}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* SCORES */}
            <div className="scores-panel">
              {[
                [
                  "Visual Quality",
                  visualScore.visualQuality,
                  "Visual clarity",
                ],
                [
                  "Brand Potential",
                  visualScore.brandPotential,
                  "Brand visibility",
                ],
                [
                  "Social Readiness",
                  visualScore.socialReadiness,
                  "Social suitability",
                ],
                [
                  "Commerce Readiness",
                  visualScore.commerceReadiness || score,
                  "Commerce potential",
                ],
              ].map(([title, value, subtitle]) => (
                <div className="score-card" key={title}>
                  <div>
                    <strong>{title}</strong>
                    <span>{subtitle}</span>
                  </div>

                  <div className="score-number">
                    {scoreValue(value)}
                    <small>/10</small>
                  </div>

                  <div className="score-bar">
                    <span
                      style={{
                        width: `${Number(value || 6.7) * 10}%`,
                      }}
                    ></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEEP COMMERCE */}
        <section className="commerce-section">

          <div className="section-header-row">
            <div>
              <div className="panel-number">
                DEEP COMMERCE INTELLIGENCE
              </div>

              <h2>Commerce Strategy</h2>

              <p>
                Product intelligence derived from the VISUALIQ
                commerce engine.
              </p>
            </div>

            <span className="engine-badge">
              Deterministic Visual Commerce Engine
            </span>
          </div>

          <div className="commerce-grid-main">

            <div className="strategy-card">
              <span className="card-label">
                TARGET AUDIENCE
              </span>

              <h3>
                {intelligence.targetAudience?.primary ||
                  "Online shoppers"}
              </h3>

              <p>
                Secondary: Mobile-first commerce consumers
              </p>

              <div className="keyword-row">
                <span>Product appearance</span>
                <span>Convenience</span>
                <span>Visual confidence</span>
              </div>
            </div>

            <div className="strategy-card">
              <span className="card-label">
                BRAND POSITIONING
              </span>

              <h3>
                {intelligence.brandPositioning?.position ||
                  "Digital commerce product"}
              </h3>

              <p>
                Perceived tier:{" "}
                {intelligence.perceivedTier || "Mid-market"}
              </p>

              <div className="keyword-row">
                <span>Modern</span>
                <span>Accessible</span>
                <span>Practical</span>
              </div>
            </div>

            <div className="strategy-card strategy-wide">
              <span className="card-label">
                MARKETING INTELLIGENCE
              </span>

              <h3>
                {intelligence.marketingMessage ||
                  "Clear visual presentation designed for confident online discovery"}
              </h3>

              <p>
                Discover {productName} through a clear,
                polished and commerce-ready visual experience.
              </p>

              <div className="campaign-box">
                <span>CAMPAIGN</span>
                <strong>
                  Visual-first {productName} commerce campaign
                </strong>
              </div>

              <div className="strategy-list">
                <span>Product-focused carousel</span>
                <span>Lifestyle product post</span>
                <span>Before-and-after creative optimization</span>
                <span>Short-form product showcase video</span>
              </div>
            </div>
          </div>
        </section>

        {/* STRENGTHS / WEAKNESSES */}
        <section className="two-column-section">

          <div className="panel insight-panel">
            <div className="panel-number">
              VISUAL STRENGTHS
            </div>

            <h2>What is working</h2>

            <div className="insight-item positive">
              <span>✓</span>
              <p>Product is clearly identifiable</p>
            </div>

            <div className="insight-item positive">
              <span>✓</span>
              <p>Suitable for multi-channel visual delivery</p>
            </div>
          </div>

          <div className="panel insight-panel">
            <div className="panel-number">
              VISUAL WEAKNESSES
            </div>

            <h2>What can improve</h2>

            <div className="insight-item warning">
              <span>!</span>
              <p>
                Visual presentation could be strengthened
                for stronger conversion potential
              </p>
            </div>

            <div className="insight-item warning">
              <span>!</span>
              <p>
                Additional creative refinement could improve
                perceived product value
              </p>
            </div>

            <div className="insight-item warning">
              <span>!</span>
              <p>
                Lifestyle context could strengthen emotional
                product storytelling
              </p>
            </div>
          </div>
        </section>

        {/* PLATFORM STRATEGY */}
        <section className="platform-section">
          <div className="panel-number">
            PLATFORM STRATEGY
          </div>

          <h2>Multi-channel Commerce Strategy</h2>

          <div className="platform-grid">
            <div className="platform-card">
              <span>Instagram</span>
              <p>
                Use visually strong square and portrait
                creatives with concise lifestyle-focused
                messaging.
              </p>
            </div>

            <div className="platform-card">
              <span>Marketplace</span>
              <p>
                Lead with the clearest product image and
                concise benefit-oriented copy.
              </p>
            </div>

            <div className="platform-card">
              <span>Website</span>
              <p>
                Use the optimized hero asset with strong
                product hierarchy and clear CTA.
              </p>
            </div>

            <div className="platform-card">
              <span>Short Video</span>
              <p>
                Show the product through a fast visual
                sequence highlighting appearance and key
                visible details.
              </p>
            </div>
          </div>
        </section>

        {/* COMMERCE COPY */}
        <section className="copy-section panel">
          <div className="panel-number">
            COMMERCE COPY
          </div>

          <h2>{productName}</h2>

          <p className="copy-lead">
            A visually presented {category} designed for
            modern digital commerce.
          </p>

          <div className="copy-points">
            <span>Clear product-focused presentation</span>
            <span>Multi-channel commerce-ready assets</span>
            <span>Optimized for digital discovery</span>
          </div>

          <div className="copy-quote">
            Discover {productName}. Designed to stand out
            across today's visual-first shopping experience.
          </div>

          <div className="copy-footer">
            <div>
              <span>AD HEADLINE</span>
              <strong>Discover {productName}</strong>
            </div>

            <div>
              <span>CTA</span>
              <strong>Explore Product</strong>
            </div>
          </div>
        </section>

        {/* VISUAL DNA */}
        <section className="dna-section">
          <div className="panel-number">
            VISUAL DNA
          </div>

          <h2>Visual Identity Profile</h2>

          <div className="dna-grid">
            <div>
              <span>Mood</span>
              <strong>Modern</strong>
            </div>

            <div>
              <span>Mood</span>
              <strong>Accessible</strong>
            </div>

            <div>
              <span>Mood</span>
              <strong>Practical</strong>
            </div>

            <div>
              <span>Style</span>
              <strong>Clean</strong>
            </div>

            <div>
              <span>Style</span>
              <strong>Commerce-focused</strong>
            </div>

            <div>
              <span>Style</span>
              <strong>Visual-first</strong>
            </div>
          </div>

          <div className="keywords">
            <span>#Visual Commerce</span>
            <span>#Modern</span>
            <span>#Product Discovery</span>
            <span>#Digital Retail</span>
          </div>
        </section>

        {/* CREATIVE STRATEGIES */}
        <section className="creative-section">
          <div className="panel-number">
            CREATIVE STRATEGIES
          </div>

          <h2>Recommended Creative Directions</h2>

          <div className="creative-grid">
            {[
              ["01", "Clean Product Focus", "Maximize product visibility and reduce visual distraction.", "5.8"],
              ["02", "Lifestyle Storytelling", "Add emotional context around the product.", "5.4"],
              ["03", "Social Discovery", "Adapt the product for visual-first social browsing.", "5.6"],
            ].map(([number, title, text, value]) => (
              <div className="creative-card" key={number}>
                <span className="creative-number">{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <strong>{value}/10</strong>
              </div>
            ))}
          </div>
        </section>

        {/* OPTIMIZATION */}
        <section className="optimization-section panel">
          <div className="panel-number">
            OPTIMIZATION
          </div>

          <h2>Improvement Recommendations</h2>

          <div className="recommendations">
            <div>01</div>
            <p>Create a stronger lifestyle-oriented hero composition</p>

            <div>02</div>
            <p>Use consistent visual treatment across social and marketplace assets</p>

            <div>03</div>
            <p>Strengthen product-focused messaging above the fold</p>

            <div>04</div>
            <p>Test multiple creative angles before launching paid campaigns</p>
          </div>
        </section>

        {/* AWS */}
        <section className="aws-section">
          <div>
            <div className="panel-number">
              AWS PUBLISHING
            </div>

            <h2>Publish Product Intelligence</h2>

            <p>
              Convert the generated VISUALIQ commerce intelligence
              into a real HTML article and publish it to AWS S3.
            </p>
          </div>

          <button className="aws-button">
            Publish Article to AWS S3
            <span>↗</span>
          </button>
        </section>

        {/* PIPELINE */}
        <section className="pipeline-section">
          <div className="panel-number">
            VISUALIQ PIPELINE
          </div>

          <div className="pipeline-row">
            {[
              ["01", "Analyze", "Understand product visuals"],
              ["02", "Rate", "Score commerce potential"],
              ["03", "Represent", "Generate visual assets"],
              ["04", "Deploy", "Deliver across channels"],
            ].map(([number, title, description]) => (
              <div className="pipeline-step" key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMMERCE ASSETS */}
        <section className="assets-section">

          <div className="section-header-row">
            <div>
              <div className="panel-number">
                04 VISUAL STUDIO
              </div>

              <h2>Commerce Assets</h2>

              <p>
                Cloudinary-powered multi-channel visual
                representations.
              </p>
            </div>

            <span className="asset-count">
              {Object.keys(assets).length || 0} ASSETS
            </span>
          </div>

          <div className="asset-grid">

            {[
              ["original", "Original", "MASTER ASSET"],
              ["optimized", "Optimized Web", "WEB DELIVERY"],
              ["socialSquare", "Social Square", "SOCIAL"],
              ["socialPortrait", "Social Portrait", "SOCIAL FEED"],
              ["story", "Story", "MOBILE STORY"],
              ["websiteHero", "Website Hero", "STOREFRONT"],
              ["marketplace", "Marketplace", "COMMERCE"],
            ].map(([key, title, type]) => {
              const url = assets[key];

              return (
                <div className="asset-card" key={key}>
                  <div className="asset-image">
                    {url ? (
                      <img src={url} alt={title} />
                    ) : image ? (
                      <img src={image.url} alt={title} />
                    ) : (
                      <div className="asset-empty">
                        V
                      </div>
                    )}
                  </div>

                  <div className="asset-info">
                    <div>
                      <strong>{title}</strong>
                      <span>{type}</span>
                    </div>

                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="footer">
          <strong>VISUALIQ</strong>
          <span>
            AI Product Intelligence · Cloudinary Media Engine
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;






