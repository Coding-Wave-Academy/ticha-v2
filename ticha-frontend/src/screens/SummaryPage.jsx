import "../styles/summary.css";
import MobileOnly from "../components/MobileOnly";
import BottomNav from "../components/BottomNav";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function SummaryPage() {
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Flashcard states
  const [view, setView] = useState("summary"); // summary, flashcards
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fetchingCards, setFetchingCards] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await apiFetch("/api/materials/summaries/history");
      setHistory(data);

      if (id && data.length > 0) {
        const item = data.find((s) => s.id === id);
        if (item) {
          const content =
            typeof item.content === "string"
              ? JSON.parse(item.content)
              : item.content;
          setSummaryData(content);
        }
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Reset view when ID changes
    setView("summary");
    setFlashcards([]);
  }, [id]);

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
      setIsUploading(false);
      fetchHistory();
      navigate(`/summary/${data.id}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to generate summary.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadFlashcards = async () => {
    if (flashcards.length > 0) {
      setView("flashcards");
      return;
    }

    setFetchingCards(true);
    try {
      const data = await apiFetch(`/api/materials/${id}/flashcards`);
      setFlashcards(data);
      setView("flashcards");
      setCurrentCardIdx(0);
      setShowAnswer(false);
    } catch (err) {
      showToast("Failed to load flashcards", { type: "error" });
    } finally {
      setFetchingCards(false);
    }
  };

  const renderFlashcards = () => {
    if (flashcards.length === 0) return null;
    const card = flashcards[currentCardIdx];

    return (
      <div className="flashcards-view">
        <div className="flashcard-progress">
          Card {currentCardIdx + 1} of {flashcards.length}
        </div>

        <div
          className={`flashcard-item ${showAnswer ? "flipped" : ""}`}
          onClick={() => setShowAnswer(!showAnswer)}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="card-type">QUESTION</div>
              <p>{card.question}</p>
              <div className="tap-hint">Tap to flip 🔄</div>
            </div>
            <div className="flashcard-back">
              <div className="card-type">ANSWER</div>
              <p>{card.answer}</p>
              <div className="tap-hint">Tap to go back 🔄</div>
            </div>
          </div>
        </div>

        <div className="flashcard-controls">
          <button
            className="btn-card"
            disabled={currentCardIdx === 0}
            onClick={() => {
              setCurrentCardIdx(currentCardIdx - 1);
              setShowAnswer(false);
            }}
          >
            ← PREV
          </button>

          {currentCardIdx < flashcards.length - 1 ? (
            <button
              className="btn-card next"
              onClick={() => {
                setCurrentCardIdx(currentCardIdx + 1);
                setShowAnswer(false);
              }}
            >
              NEXT →
            </button>
          ) : (
            <button
              className="btn-card finish"
              onClick={() => setView("summary")}
            >
              FINISH ✨
            </button>
          )}
        </div>

        <button className="back-link" onClick={() => setView("summary")}>
          Back to Summary
        </button>
      </div>
    );
  };

  const loadSummary = (item) => {
    navigate(`/summary/${item.id}`);
    setIsUploading(false);
    setView("summary");
  };

  return (
    <MobileOnly>
      <div className="summary-page">
        <div className="summary-header">
          <button
            onClick={() => {
              if (view === "flashcards") {
                setView("summary");
              } else if (summaryData) {
                setSummaryData(null);
                navigate("/summaries");
              } else {
                navigate("/dashboard");
              }
            }}
            className="back-button-new"
          >
            ←
          </button>
          <h1>
            {isUploading && !summaryData
              ? "IMPORT NOTES"
              : view === "flashcards"
              ? "FLASHCARDS"
              : summaryData
              ? "SUMMARY"
              : "MY SUMMARIES"}
          </h1>
          <div style={{ width: 40 }} />
        </div>

        {!isUploading && !summaryData && (
          <div className="summary-history-list">
            {history.length === 0 ? (
              <div
                className="modern-card"
                style={{ textAlign: "center", padding: 40 }}
              >
                <span style={{ fontSize: 50 }}>📭</span>
                <h3>No summaries yet</h3>
                <p>Click the + button to start learning!</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="history-card"
                  onClick={() => loadSummary(item)}
                >
                  <div className="icon">📄</div>
                  <div className="info">
                    <h4>{item.title}</h4>
                    <p>
                      {item.category} •{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {isUploading && (
          <div className="upload-section modern-card">
            <div className="card-accent"></div>
            <div className="upload-content">
              <div className="upload-icon-wrapper">
                <span className="upload-emoji">📥</span>
              </div>
              <h2>Import Materials</h2>
              <p>
                Upload your notes, PDFs, or photos. Our AI will analyze them in
                seconds.
              </p>

              <label className="custom-file-upload">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="file-input-hidden"
                />
                <div className="upload-design">
                  <span className="design-icon">
                    {selectedFile ? "✅" : "📁"}
                  </span>
                  <span className="design-text">
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </span>
                </div>
              </label>

              {preview && (
                <div className="image-preview-premium">
                  <img src={preview} alt="Uploaded Notes" />
                  <button
                    className="remove-preview"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {selectedFile && !preview && (
                <div className="file-chip">
                  <span>📄 {selectedFile.name}</span>
                  <button
                    className="remove-file"
                    onClick={() => setSelectedFile(null)}
                  >
                    ×
                  </button>
                </div>
              )}

              <button
                className={`generate-btn ${
                  selectedFile && !loading ? "active" : ""
                }`}
                disabled={!selectedFile || loading}
                onClick={generateSummary}
              >
                {loading ? (
                  <div className="loader-wrapper">
                    <div className="mini-loader"></div>
                    <span>ANALYZING...</span>
                  </div>
                ) : (
                  <>
                    <span>GENERATE SUMMARY</span>
                    <span className="sparkle-icon">✨</span>
                  </>
                )}
              </button>

              <button
                className="cancel-btn"
                onClick={() => setIsUploading(false)}
                style={{
                  marginTop: 16,
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {summaryData && !isUploading && view === "summary" && (
          <>
            <div className="summary-actions">
              <button
                className="action-btn"
                disabled={fetchingCards}
                onClick={loadFlashcards}
              >
                {fetchingCards ? "⏳..." : "🎴 Flashcards"}
              </button>
              <button className="action-btn disabled">🧠 Mindmaps</button>
              <button
                className="action-btn"
                onClick={() => navigate("/practice")}
              >
                📝 Quiz Quest
              </button>
            </div>

            <div className="summary-results">
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

              <button
                className="button-v1"
                style={{
                  width: "100%",
                  marginTop: 20,
                  background: "black",
                  color: "white",
                }}
                onClick={() => {
                  setSummaryData(null);
                  navigate("/summaries");
                }}
              >
                VIEW ALL SUMMARIES
              </button>
            </div>
          </>
        )}

        {view === "flashcards" && renderFlashcards()}

        {!isUploading && !summaryData && (
          <div className="fab-button" onClick={() => setIsUploading(true)}>
            +
          </div>
        )}

        <div style={{ height: 120 }} />
        <BottomNav />
      </div>
    </MobileOnly>
  );
}
