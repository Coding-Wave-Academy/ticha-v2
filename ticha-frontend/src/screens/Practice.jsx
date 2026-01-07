import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/practice.css";
import BottomNav from "../components/BottomNav";
import MobileOnly from "../components/MobileOnly";
import { apiFetch } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function Practice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [view, setView] = useState("upload"); // upload, quiz, results
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [results, setResults] = useState([]);
  const [finalFeedback, setFinalFeedback] = useState(null);

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

  const startQuiz = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const data = await apiFetch("/api/practice/quiz/generate-from-file", {
        method: "POST",
        body: formData,
      });

      setQuizData(data);
      setCurrentIdx(0);
      setResults([]);
      setView("quiz");
    } catch (err) {
      showToast(err.message || "Failed to generate quiz from file", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (grading) return;

    setGrading(true);
    const question = quizData.questions[currentIdx];

    try {
      const res = await apiFetch("/api/practice/quiz/grade", {
        method: "POST",
        body: JSON.stringify({
          question,
          studentAnswer: answer,
        }),
      });

      const updatedResults = [
        ...results,
        { ...question, ...res, studentAnswer: answer },
      ];
      setResults(updatedResults);
      setAnswer("");

      if (currentIdx < quizData.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        generateFeedback(updatedResults);
      }
    } catch (err) {
      showToast("Error grading your answer", { type: "error" });
    } finally {
      setGrading(false);
    }
  };

  const generateFeedback = async (quizResults) => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/practice/quiz/feedback", {
        method: "POST",
        body: JSON.stringify({ results: quizResults }),
      });
      setFinalFeedback(data);
      setView("results");
    } catch (err) {
      showToast("Failed to generate feedback", { type: "error" });
      setView("upload");
    } finally {
      setLoading(false);
    }
  };

  const renderUpload = () => (
    <div
      className="upload-section modern-card"
      style={{ width: "100%", maxWidth: 500 }}
    >
      <div className="card-accent"></div>
      <div className="upload-content">
        <div className="upload-icon-wrapper">
          <span className="upload-emoji">📄</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-main)" }}>PAST QUESTIONS</h2>
        <p style={{ fontFamily: "var(--font-mono)" }}>
          Upload a photo or PDF of a past question paper. Our AI will turn it
          into an interactive quiz!
        </p>

        <label className="custom-file-upload">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            className="file-input-hidden"
          />
          <div className="upload-design">
            <span className="design-icon">{selectedFile ? "✅" : "📁"}</span>
            <span className="design-text">
              {selectedFile ? selectedFile.name : "Choose File"}
            </span>
          </div>
        </label>

        {preview && (
          <div className="image-preview-premium">
            <img
              src={preview}
              alt="Uploaded"
              style={{ width: "100%", borderRadius: 10 }}
            />
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
          className={`generate-btn ${selectedFile && !loading ? "active" : ""}`}
          style={{ width: "100%" }}
          disabled={!selectedFile || loading}
          onClick={startQuiz}
        >
          {loading ? (
            <div className="loader-wrapper">
              <div className="mini-loader"></div>
              <span>READING PAPER...</span>
            </div>
          ) : (
            <>
              <span>START LEARNING QUEST</span>
              <span className="sparkle-icon">✨</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const q = quizData.questions[currentIdx];
    const progress = ((currentIdx + 1) / quizData.questions.length) * 100;

    return (
      <div className="quiz-view" style={{ width: "100%", maxWidth: 500 }}>
        <div className="quiz-progress">
          <div
            className="quiz-progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="practice-card">
          <div className="question-label">
            Question {currentIdx + 1} of {quizData.questions.length}
          </div>
          <div className="question-text">{q.question}</div>

          {q.type === "mcq" ? (
            <div className="options-list">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`option-btn ${answer === opt ? "selected" : ""}`}
                  onClick={() => setAnswer(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="input-field"
              placeholder="Type your answer here..."
              style={{ fontFamily: "var(--font-mono)" }}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
            />
          )}

          <div style={{ marginTop: 24 }}>
            <button
              className={`button-v1 ${!answer || grading ? "disabled" : ""}`}
              style={{ width: "100%", background: "black", color: "white" }}
              disabled={!answer || grading}
              onClick={handleNext}
            >
              {grading
                ? "EVALUATING..."
                : currentIdx === quizData.questions.length - 1
                ? "FINISH QUEST"
                : "NEXT QUESTION →"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="results-screen">
      <div className="results-card">
        <div className="mastery-badge">
          {finalFeedback?.masteryLevel || "Learner"}
        </div>
        <h2 className="results-title">Great Job! 🎉</h2>
        <p className="results-summary">{finalFeedback?.summary}</p>

        <div className="feedback-section">
          <h4>
            <span>✓</span> Strengths
          </h4>
          <ul>
            {finalFeedback?.strengths?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="feedback-section no-border">
          <h4>
            <span className="focus-label">Focus</span> Areas
          </h4>
          <ul>
            {finalFeedback?.weaknesses?.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>

        <button
          className="button-v1"
          style={{ width: "100%", marginTop: 32, background: "var(--yellow)" }}
          onClick={() => {
            setView("upload");
            setSelectedFile(null);
            setPreview(null);
          }}
        >
          DONE
        </button>
      </div>
    </div>
  );

  return (
    <MobileOnly>
      <div className="practice-screen">
        <div className="practice-header">
          <button
            className="back-btn"
            onClick={() =>
              view === "upload" ? navigate("/dashboard") : setView("upload")
            }
          >
            ←
          </button>
          <div style={{ fontWeight: 900, textTransform: "uppercase" }}>
            {view === "quiz" ? "Learning Quest" : "Practice Zone"}
          </div>
          <div style={{ width: 40 }} />
        </div>

        {loading ? (
          <div
            className="practice-card"
            style={{ textAlign: "center", padding: "60px 20px" }}
          >
            <div
              className="float-icon"
              style={{ fontSize: 40, marginBottom: 16 }}
            >
              🤖
            </div>
            <p style={{ fontWeight: 800 }}>
              {view === "quiz"
                ? "Evaluating your response..."
                : "Setting up your quest..."}
            </p>
          </div>
        ) : (
          <>
            {view === "upload" && renderUpload()}
            {view === "quiz" && renderQuiz()}
            {view === "results" && renderResults()}
          </>
        )}

        <BottomNav />
      </div>
    </MobileOnly>
  );
}
