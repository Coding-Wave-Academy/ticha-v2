import "../styles/summary.css";
import MobileOnly from "../components/MobileOnly";
import BottomNav from "../components/BottomNav";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { useToast } from "../context/ToastContext";
import ProgressDots from "../components/ProgressDots"; // Optional visual

export default function SummaryPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null); // No preview for PDF
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await apiFetch("/api/materials/summaries/history");
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateSummary = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setSummaryData(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const data = await apiFetch("/api/materials/summary/generate", {
        method: "POST",
        body: formData,
      });

      setSummaryData(data.summary);
      showToast("Summary generated successfully!", { type: "success" });
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error(err);
      showToast("Failed to generate summary.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = (item) => {
    try {
      const content =
        typeof item.content === "string"
          ? JSON.parse(item.content)
          : item.content;
      setSummaryData(content);
      setShowHistory(false);
      showToast(`Loaded: ${item.title}`, { type: "info" });
    } catch (e) {
      showToast("Error loading summary", { type: "error" });
    }
  };

  return (
    <MobileOnly>
      <div className="summary-page">
        <div className="summary-header">
          <button onClick={() => navigate(-1)} className="back-button-new">
            ←
          </button>
          <h1>AI SUMMARIZER</h1>
          <button
            className="menu-button"
            onClick={() => setShowHistory(!showHistory)}
          >
            ⋮
          </button>
        </div>

        {showHistory && (
          <div
            className="history-overlay"
            onClick={() => setShowHistory(false)}
          >
            <div
              className="history-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="history-header">
                <h3>Previous Summaries</h3>
                <button onClick={() => setShowHistory(false)}>×</button>
              </div>
              <div className="history-list">
                {history.length === 0 && (
                  <p style={{ padding: 20, textAlign: "center" }}>
                    No history yet
                  </p>
                )}
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="history-item"
                    onClick={() => loadSummary(item)}
                  >
                    <div className="history-icon">📄</div>
                    <div className="history-info">
                      <div className="history-title">{item.title}</div>
                      <div className="history-meta">
                        {item.category} •{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="upload-section">
          <h2>Upload Notes, PDF, or Image</h2>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            className="file-input"
          />

          {preview && !summaryData && (
            <div className="image-preview">
              <img src={preview} alt="Uploaded Notes" />
            </div>
          )}

          {selectedFile && !preview && (
            <div style={{ marginTop: 10, fontWeight: "bold" }}>
              📄 {selectedFile.name}
            </div>
          )}

          <button
            className="button"
            style={{
              marginTop: 16,
              background: selectedFile && !loading ? "var(--green)" : "#ccc",
            }}
            disabled={!selectedFile || loading}
            onClick={generateSummary}
          >
            {loading ? "ANALYZING..." : "GENERATE SUMMARY"}
          </button>
        </div>

        {summaryData && (
          <div className="summary-actions">
            <button
              className="action-btn"
              onClick={() =>
                navigate("/practice", { state: { type: "flashcards" } })
              }
            >
              🎴 Flashcards
            </button>
            <button
              className="action-btn"
              onClick={() =>
                navigate("/practice", { state: { type: "mindmap" } })
              }
            >
              🧠 Mindmaps
            </button>
            <button
              className="action-btn"
              onClick={() => navigate("/practice", { state: { type: "quiz" } })}
            >
              📝 Practice Quiz
            </button>
          </div>
        )}

        {summaryData && (
          <div className="summary-results" style={{ marginTop: 24 }}>
            <div className="summary-section highlight">
              <h2>Overview</h2>
              <p>{summaryData.overview}</p>
            </div>

            {summaryData.takeaway && (
              <div className="takeaway-box">
                <strong>Quick Takeaway:</strong> {summaryData.takeaway}
              </div>
            )}

            {summaryData.keyPoints?.length > 0 && (
              <div className="summary-section">
                <h2>Key Points</h2>
                <ul>
                  {summaryData.keyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {summaryData.wowFact && (
              <div className="wow-section">
                <div className="wow-badge">AHA! MOMENT</div>
                <p>{summaryData.wowFact}</p>
              </div>
            )}

            {summaryData.example && (
              <div
                className="summary-section"
                style={{ background: "#f0fff4" }}
              >
                <h2>Practical Example</h2>
                <p>{summaryData.example}</p>
              </div>
            )}

            {summaryData.reviewQuestions?.length > 0 && (
              <div className="summary-section">
                <h2>Review Questions</h2>
                <ul>
                  {summaryData.reviewQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div style={{ height: 80 }} />
        <BottomNav />
      </div>
    </MobileOnly>
  );
}
