import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [active, setActive] = useState("Dashboard");
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedFile(file);

    setImage({
      name: file.name,
      url: imageUrl,
      type: file.type,
    });

    setAnalysisResult(null);
  };

  const handleFileChange = (event) => {
    handleImage(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleImage(event.dataTransfer.files[0]);
  };

  const analyzeProduct = async () => {
    if (!selectedFile) {
      alert("Please upload a product image first.");
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("upload_preset", "visualiq_products");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/d6s5slnx/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Cloudinary upload failed."
        );
      }

      const optimizedUrl = data.secure_url.replace(
      "/upload/",
      "/upload/f_auto/q_auto/w_1200/"
    );

    const backgroundRemovedUrl = data.secure_url.replace(
      "/upload/",
      "/upload/e_background_removal/f_auto/q_auto/"
    );

    data.optimized_url = optimizedUrl;
    data.background_removed_url = backgroundRemovedUrl;

    data.marketplace_url = data.secure_url.replace(
      "/upload/",
      "/upload/f_auto/q_auto/c_fill,w_1200,h_1200/"
    );

    data.instagram_url = data.secure_url.replace(
      "/upload/",
      "/upload/f_auto/q_auto/c_fill,w_1080,h_1350/"
    );

    let readinessScore = 70;

    if (data.secure_url) readinessScore += 5;
    if (data.optimized_url) readinessScore += 10;
    if (data.background_removed_url) readinessScore += 10;
    if (data.marketplace_url && data.instagram_url && data.story_url) {
      readinessScore += 5;
    }

    data.readiness_score = Math.min(readinessScore, 100);
    data.story_url = data.secure_url.replace(
      "/upload/",
      "/upload/f_auto/q_auto/c_fill,w_1080,h_1920/"
    );

    setAnalysisResult({
        success: true,
        message: "Product uploaded to Cloudinary successfully.",
        cloudinary: data,
      });
    } catch (error) {
      console.error("VISUALIQ Cloudinary error:", error);

      alert(`Cloudinary upload failed: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">V</div>

          <div>
            <h1>VISUALIQ</h1>
            <span>Visual Commerce AI</span>
          </div>
        </div>

        <nav>
  <button
    className={active === "Dashboard" ? "nav-item active" : "nav-item"}
    onClick={() => setActive("Dashboard")}
  >
    <span className="nav-icon icon-dashboard"></span>
    Dashboard
  </button>

  <button
    className={active === "Visual Studio" ? "nav-item active" : "nav-item"}
    onClick={() => setActive("Visual Studio")}
  >
    <span className="nav-icon icon-studio"></span>
    Visual Studio
  </button>

  <button
    className={active === "Product IQ" ? "nav-item active" : "nav-item"}
    onClick={() => setActive("Product IQ")}
  >
    <span className="nav-icon icon-iq"></span>
    Product IQ
  </button>

  <button
    className={active === "Media Kit" ? "nav-item active" : "nav-item"}
    onClick={() => setActive("Media Kit")}
  >
    <span className="nav-icon icon-kit"></span>
    Media Kit
  </button>
</nav>

        <div className="sidebar-bottom">

          <div className="cloudinary-badge">
            <span className="status-dot"></span>

            Cloudinary Pipeline

            <strong>Active</strong>
          </div>

        </div>

      </aside>

      {/* MAIN */}
      <main className="main">

        {/* TOP BAR */}
        <header className="topbar">

          <div>

            <span className="eyebrow">
              AI VISUAL COMMERCE STUDIO
            </span>

            <h2>
              Turn products into{" "}
              <span>visual stories.</span>
            </h2>

          </div>

          <div className="top-actions">

            <button className="icon-btn">
              
            </button>

            <div className="avatar">
              SS
            </div>

          </div>

        </header>

        {/* HERO */}
        <section className="hero">

          <div className="hero-content">

            <div className="pill">

              <span className="pulse"></span>

              AI-powered product intelligence

            </div>

            <h3>
              One photo.
              <br />
              <span>Infinite possibilities.</span>
            </h3>

            <p>
              Upload an ordinary product image and transform it
              into professional, commerce-ready visual assets
              with AI and Cloudinary.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-btn"
                onClick={() =>
                  fileInputRef.current.click()
                }
              >
                 Start Creating
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  fileInputRef.current.click()
                }
              >
                Explore Studio
              </button>

            </div>

          </div>

          {/* HERO VISUAL */}
          <div className="visual-card">

            {image ? (

              <img
                src={image.url}
                alt="Uploaded product"
                className="hero-preview"
              />

            ) : (

              <div className="product-orb">

                <div className="orb-glow"></div>

                <div className="product-placeholder">

                  <div className="product-top"></div>

                  <div className="product-body"></div>

                  <div className="product-base"></div>

                </div>

              </div>

            )}

            <div className="floating-tag tag-one">
              <span></span>
              AI Enhanced
            </div>

            <div className="floating-tag tag-two">
              <span>OK</span>
              96% Ready
            </div>

          </div>

        </section>

        {/* WORKSPACE */}
        <section className="workspace">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                WORKSPACE
              </span>

              <h3>
                Bring your product to life
              </h3>

            </div>

            <span className="step">

              {analyzing
                ? "02 / Analyzing"
                : "01 / Upload"}

            </span>

          </div>

          {!image ? (

            <div
              className="upload-area"
              onDragOver={(event) =>
                event.preventDefault()
              }
              onDrop={handleDrop}
              onClick={() =>
                fileInputRef.current.click()
              }
            >

              <div className="upload-icon">
                UPLOAD
              </div>

              <h4>
                Drop your product image here
              </h4>

              <p>
                PNG, JPG or WEBP  -  We'll handle
                the rest with AI
              </p>

              <button
                className="upload-btn"
                onClick={(event) => {

                  event.stopPropagation();

                  fileInputRef.current.click();

                }}
              >
                Choose Product Image
              </button>

            </div>

          ) : (

            <div className="uploaded-card">

              <img
                src={image.url}
                alt="Product preview"
              />

              <div className="uploaded-info">

                <span className="success-label">
                  OK IMAGE READY
                </span>

                <h4>
                  {image.name}
                </h4>

                <p>
                  {analyzing
                    ? "VISUALIQ is sending your product to the AI backend..."
                    : "Your product image is ready for AI processing."}
                </p>

                <div className="processing-preview">

                  <span>01</span>
                  Upload complete

                  <span className="pipeline-arrow"></span>

                  <span>02</span>
                  AI Analysis

                  <span className="pipeline-arrow"></span>

                  <span>03</span>
                  Transform

                </div>

                {/* ANALYZE BUTTON */}
                <button
                  className="primary-btn"
                  onClick={analyzeProduct}
                  disabled={analyzing}
                >

                  {analyzing
                    ? " Analyzing..."
                    : " Analyze Product"}

                </button>

                {/* BACKEND RESULT */}
                {analysisResult && (

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "18px",
                      borderRadius: "16px",
                      background:
                        "rgba(255,255,255,0.06)",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                    }}
                  >

                    <div
                      style={{
                        fontWeight: "700",
                        marginBottom: "8px",
                      }}
                    >
                      CLOUDINARY ASSET READY
                    </div>

                    <div
                      style={{
                        fontSize: "14px",
                        opacity: 0.8,
                      }}
                    >
                      {analysisResult.message}

                      {analysisResult.cloudinary?.background_removed_url && (
                        <div className="before-after">
                          <div className="before-after-header">
                            <div>
                              <div className="before-after-label">
                                AI TRANSFORMATION
                              </div>
                              <h3>Before → After</h3>
                            </div>
                            <span>Cloudinary AI</span>
                          </div>

                          <div className="before-after-grid">
                            <div className="before-after-card">
                              <div className="before-after-tag">ORIGINAL</div>
                              <img
                                src={analysisResult.cloudinary.secure_url}
                                alt="Original product"
                              />
                            </div>

                            <div className="before-after-card">
                              <div className="before-after-tag">AI CUTOUT</div>
                              <img
                                src={analysisResult.cloudinary.background_removed_url}
                                alt="AI background removed product"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {analysisResult.cloudinary?.background_removed_url && (
                        <>
                          <div className="readiness-card">
                      <div>
                        <div className="readiness-label">
                          PRODUCT READINESS
                        </div>
                        <div className="readiness-subtitle">
                          Commerce asset quality
                        </div>
                      </div>

                      <div className="readiness-score">
                        {analysisResult.cloudinary?.readiness_score || 96}%
                      </div>
                    </div>

                    <div className="optimized-preview background-preview">
                          <div className="optimized-preview-label">
                            AI BACKGROUND REMOVED
                          </div>

                          <img
                            src={analysisResult.cloudinary.background_removed_url}
                            alt="AI background removed product"
                          />

                          <a
                            href={analysisResult.cloudinary.background_removed_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open background-removed asset
                          </a>
                        </div>
                        </>
                      )}

                      {analysisResult.cloudinary?.marketplace_url && (
                        <>
                          <div className="media-kit">
                          <div className="media-kit-header">
                            <div>
                              <div className="media-kit-label">
                                VISUAL COMMERCE KIT
                              </div>
                              <h3>Ready to launch</h3>
                              <p>
                                Your product has been transformed into
                                platform-ready visual assets.
                              </p>
                            </div>

                            <div className="media-kit-status">
                              READY
                            </div>
                          </div>

                          <div className="media-kit-summary">
                            <span>1 ORIGINAL</span>
                            <span>1 OPTIMIZED</span>
                            <span>1 AI CUTOUT</span>
                            <span>3 FORMATS</span>
                          </div>
                          </div>

                          <div className="commerce-formats">
                          <div className="commerce-title">
                            COMMERCE-READY FORMATS
                          </div>

                          <div className="media-kit-actions">
                          <a
                            href={analysisResult.cloudinary.marketplace_url}
                            target="_blank"
                            rel="noreferrer"
                            className="kit-button"
                          >
                            Download Marketplace
                          </a>

                          <a
                            href={analysisResult.cloudinary.instagram_url}
                            target="_blank"
                            rel="noreferrer"
                            className="kit-button"
                          >
                            Download Instagram
                          </a>

                          <a
                            href={analysisResult.cloudinary.story_url}
                            target="_blank"
                            rel="noreferrer"
                            className="kit-button"
                          >
                            Download Story
                          </a>
                        </div>

                        <div className="commerce-grid">
                            <div className="commerce-card">
                              <img
                                src={analysisResult.cloudinary.marketplace_url}
                                alt="Marketplace product"
                              />
                              <strong>Marketplace</strong>
                              <span>1200 × 1200</span>
                            </div>

                            <div className="commerce-card">
                              <img
                                src={analysisResult.cloudinary.instagram_url}
                                alt="Instagram product"
                              />
                              <strong>Instagram</strong>
                              <span>1080 × 1350</span>
                            </div>

                            <div className="commerce-card">
                              <img
                                src={analysisResult.cloudinary.story_url}
                                alt="Story product"
                              />
                              <strong>Story</strong>
                              <span>1080 × 1920</span>
                            </div>
                          </div>
                        </div>
                        </>
                      )}

                      {analysisResult.cloudinary?.optimized_url && (
                        <div className="optimized-preview">
                          <div className="optimized-preview-label">
                            CLOUDINARY OPTIMIZED
                          </div>

                          <img
                            src={analysisResult.cloudinary.optimized_url}
                            alt="Cloudinary optimized product"
                          />

                          <a
                            href={analysisResult.cloudinary.optimized_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open optimized asset
                          </a>
                        </div>
                      )}
                    </div>

                    {analysisResult.file && (

                      <div
                        style={{
                          marginTop: "10px",
                          fontSize: "13px",
                          opacity: 0.65,
                        }}
                      >

                        File:{" "}
                        {analysisResult.file.originalName}

                        <br />

                        Size:{" "}
                        {Math.round(
                          analysisResult.file.size /
                            1024
                        )}{" "}
                        KB

                        <br />

                        Type:{" "}
                        {analysisResult.file.type}

                      </div>

                    )}

                  </div>

                )}

              </div>

            </div>

          )}

          {/* HIDDEN FILE INPUT */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleFileChange}
          />

        </section>

        {/* PIPELINE */}
        <section className="pipeline">

          <div className="section-heading">

            <div>

              <span className="eyebrow">
                INTELLIGENT PIPELINE
              </span>

              <h3>
                From image to commerce-ready
              </h3>

            </div>

          </div>

          <div className="pipeline-grid">

            {/* ANALYZE */}
            <div className="pipeline-card">

              <span className="number">
                01
              </span>

              <div className="pipeline-icon">
                AI
              </div>

              <h4>
                Analyze
              </h4>

              <p>
                AI understands your product and
                visual attributes.
              </p>

            </div>

            <div className="connector">
              GO
            </div>

            {/* TRANSFORM */}
            <div className="pipeline-card">

              <span className="number">
                02
              </span>

              <div className="pipeline-icon">
                
              </div>

              <h4>
                Transform
              </h4>

              <p>
                Enhance, remove backgrounds and
                create new scenes.
              </p>

            </div>

            <div className="connector">
              GO
            </div>

            {/* OPTIMIZE */}
            <div className="pipeline-card">

              <span className="number">
                03
              </span>

              <div className="pipeline-icon">
                OPT
              </div>

              <h4>
                Optimize
              </h4>

              <p>
                Generate platform-ready formats
                and optimized media.
              </p>

            </div>

            <div className="connector">
              GO
            </div>

            {/* LAUNCH */}
            <div className="pipeline-card">

              <span className="number">
                04
              </span>

              <div className="pipeline-icon">
                OK
              </div>

              <h4>
                Launch
              </h4>

              <p>
                Get your complete visual commerce
                media kit.
              </p>

            </div>

          </div>

        </section>

        {/* FOOTER */}
        <footer>

          <span>
            VISUALIQ
          </span>

          <span>
            AI Product Intelligence  -  Cloudinary Media Engine
          </span>

        </footer>

      </main>

    </div>
  );
}

export default App;

























