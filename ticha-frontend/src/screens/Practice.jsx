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

  const [view, setView] = useState("list"); // list, quiz, results
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [results, setResults] = useState([]);
  const [finalFeedback, setFinalFeedback] = useState(null);

  // Fetch materials for the list view
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/materials");
      setMaterials(data);
    } catch (err) {
      showToast("Failed to load materials", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const startQuiz = async (materialId) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/practice/quiz/${materialId}/generate`);
      setQuizData(data);
      setCurrentIdx(0);
      setResults([]);
      setView("quiz");
    } catch (err) {
      showToast("Failed to generate quiz", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (grading) return;

    setGrading(true);
    const question = quizData.questions[currentIdx];

    try {
      // For MCQ, answer is already set via option click
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
        // Quiz finished
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
      setView("list");
    } finally {
      setLoading(false);
    }
  };

  const renderList = () => (
    <div className="practice-list">
      {materials.length === 0 ? (
        <div className="practice-card" style={{ textAlign: "center" }}>
          <span style={{ fontSize: 40 }}>📚</span>
          <p>
            No study materials yet. Upload some notes in the "Summaries" tab
            first!
          </p>
          <button className="button-v1" onClick={() => navigate("/summaries")}>
            GO TO SUMMARIES
          </button>
        </div>
      ) : (
        materials.map((m) => (
          <div
            key={m.id}
            className="history-card"
            onClick={() => startQuiz(m.id)}
          >
            <div className="icon">📝</div>
            <div className="info">
              <h4>{m.title}</h4>
              <p>{m.subject} • Click to start quiz</p>
            </div>
          </div>
        ))
      )}
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
                ? "GRADING..."
                : currentIdx === quizData.questions.length - 1
                ? "FINISH QUIZ"
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
        <h2 style={{ fontWeight: 900, fontSize: 28, margin: "0 0 12px 0" }}>
          Great Job! 🎉
        </h2>
        <p style={{ color: "#666", lineHeight: 1.5, marginBottom: 20 }}>
          {finalFeedback?.summary}
        </p>

        <div className="feedback-section">
          <h4>
            <span style={{ color: "var(--green)" }}>✓</span> Strengths
          </h4>
          <ul>
            {finalFeedback?.strengths?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="feedback-section" style={{ border: "none" }}>
          <h4>
            <span style={{ color: "#ff5252" }}>Focus</span> Areas
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
            setView("list");
            fetchMaterials();
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
              view === "list" ? navigate("/dashboard") : setView("list")
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
            {view === "list" && renderList()}
            {view === "quiz" && renderQuiz()}
            {view === "results" && renderResults()}
          </>
        )}

        <BottomNav />
      </div>
    </MobileOnly>
  );
}
