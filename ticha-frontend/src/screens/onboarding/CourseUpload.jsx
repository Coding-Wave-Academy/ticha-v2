import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import ProgressDots from "../../components/ProgressDots";
import { useToast } from "../../context/ToastContext";
import { apiFetch } from "../../utils/api";
import AuthTriggerModal from "../../components/AuthTriggerModal";

export default function CourseUpload() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGenerateSummary = async () => {
    // Auth Check
    const token = localStorage.getItem("ticha_token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (!content.trim() && !file) {
      showToast("Please enter content or upload a file", { type: "error" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("title", file?.name || "Course Material");
      formData.append("content", content); // Might be empty if file is present
      formData.append("subject", subject || "general");

      const data = await apiFetch("/api/materials/summary/generate", {
        method: "POST",
        body: formData,
      });

      setSummary(data.summary);
      setShowSummary(true);
      showToast("Summary generated!", { type: "success" });
    } catch (err) {
      console.error("Summary error:", err);
      showToast(err.message || "Error generating summary", { type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = async () => {
    setUploading(true);
    setTimeout(() => {
      localStorage.setItem(
        "ticha_onboarding",
        JSON.stringify({ courseFileUploaded: true })
      );
      setUploading(false);
      navigate("/auth");
    }, 500);
  };

  const handleSkip = () => {
    navigate("/auth");
  };

  if (showSummary && summary) {
    return (
      <div className="screen" style={{ flexDirection: "column" }}>
        <button
          onClick={() => setShowSummary(false)}
          style={{
            marginTop: 32,
            width: "15%",
            position: "absolute",
            top: 0,
            left: 15,
            backgroundColor: "#fff",
            boxShadow: "3px 3px 0px #000",
            borderRadius: "32px",
            padding: "12px",
            border: "2px solid #000",
            fontWeight: "bold",
            cursor: "pointer",
            minWidth: "50px",
          }}
        >
          ←
        </button>

        <h1 className="title" style={{ marginTop: 80, marginBottom: 24 }}>
          📚 AI SUMMARY
        </h1>

        <div
          style={{
            maxWidth: 600,
            width: "100%",
            background: "#fff",
            border: "3px solid #000",
            borderRadius: "12px",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <h3 style={{ fontSize: 16, marginTop: 0 }}>Overview</h3>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{summary.overview}</p>

          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 16 }}>Key Points</h3>
              <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
                {summary.keyPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {summary.example && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 16 }}>Example</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{summary.example}</p>
            </div>
          )}

          {summary.reviewQuestions && summary.reviewQuestions.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 16 }}>Review Questions</h3>
              <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
                {summary.reviewQuestions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          style={{
            maxWidth: 500,
            width: "100%",
            boxSizing: "border-box",
            marginTop: 24,
          }}
        >
          <button
            className="button"
            style={{
              background: "var(--green)",
              marginBottom: 12,
            }}
            onClick={handleContinue}
          >
            {uploading ? "..." : language === "fr" ? "CONTINUER" : "CONTINUE"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ flexDirection: "column" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: 32,
          width: "15%",
          position: "absolute",
          top: 0,
          left: 15,
          backgroundColor: "#fff",
          boxShadow: "3px 3px 0px #000",
          borderRadius: "32px",
          padding: "12px",
          border: "2px solid #000",
          fontWeight: "bold",
          cursor: "pointer",
          minWidth: "50px",
        }}
      >
        ←
      </button>

      <ProgressDots step={4} />

      <h1 className="title" style={{ marginTop: 24, fontSize: 24 }}>
        {language === "fr" ? "IMPORTE TES COURS" : "CENTRAL COURSE UPLOAD"}
      </h1>

      <p
        style={{
          fontSize: 14,
          marginBottom: 24,
          maxWidth: 600,
          textAlign: "center",
          marginTop: 0,
          padding: "0 20px",
        }}
      >
        {language === "fr"
          ? "Importe ton formulaire B ou ta liste de cours officielle. TICHA organisera tes études avec l'IA."
          : "Upload an image of your Form B or official course list. TICHA will organize your studies with AI."}
      </p>

      <div
        style={{
          border: "3px dashed #000",
          borderRadius: "12px",
          padding: "32px",
          textAlign: "center",
          marginBottom: 24,
          backgroundColor: file ? "#f0fff4" : "#fff",
          maxWidth: 500,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            display: "none",
          }}
          id="file-input"
        />
        <label
          htmlFor="file-input"
          style={{
            cursor: "pointer",
            display: "block",
            fontWeight: "bold",
          }}
        >
          {file ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 14, fontWeight: "bold" }}>
                {file.name}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
                {language === "fr" ? "Cliquez pour changer" : "Click to change"}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 14 }}>
                {language === "fr"
                  ? "Cliquez pour importer ou glissez un fichier"
                  : "Click to upload or drag a file"}
              </div>
            </>
          )}
        </label>
      </div>

      <div
        style={{
          maxWidth: 500,
          width: "100%",
          boxSizing: "border-box",
          marginTop: 24,
        }}
      >
        <button
          className={`button ${file && !uploading ? "pulse" : ""}`}
          style={{
            background: file && !uploading ? "var(--green)" : "#ccc",
            color: file && !uploading ? "#000" : "#777",
            marginBottom: 12,
          }}
          disabled={!file || uploading}
          onClick={handleGenerateSummary}
        >
          {uploading
            ? "🤖 ANALYZING COURSE LIST..."
            : language === "fr"
            ? "ANALYSER MA LISTE"
            : "ANALYZE COURSE LIST"}
        </button>

        <button
          className="button"
          style={{
            background: "white",
            border: "3px solid #000",
            color: "#000",
          }}
          onClick={handleSkip}
        >
          {language === "fr" ? "PASSER" : "SKIP"}
        </button>
      </div>

      <AuthTriggerModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
