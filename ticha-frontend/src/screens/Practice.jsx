import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/practice.css";
import BottomNav from "../components/BottomNav";
import MobileOnly from "../components/MobileOnly";
import { apiFetch } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function Practice() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [grading, setGrading] = useState(false);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelected(null);
    setShowFeedback(false);
    setFeedback(null);
    try {
      const data = await apiFetch("/api/practice/generate");
      setQuestion(data);
    } catch (err) {
      console.error("Fetch question error:", err);
      showToast(err.message || "Could not load practice question", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleOptionSelect = async (option) => {
    if (showFeedback || grading) return;

    setSelected(option);
    setGrading(true);

    try {
      const data = await apiFetch("/api/practice/answer", {
        method: "POST",
        body: JSON.stringify({
          selectedOption: option,
          question: question,
        }),
      });

      setFeedback(data);
      setShowFeedback(true);

      if (data.correct) {
        showToast("Correct! +10 XP", { type: "success" });
      } else {
        showToast("Keep learning! You'll get it next time.", { type: "info" });
      }
    } catch (err) {
      showToast("Grading failed", { type: "error" });
    } finally {
      setGrading(false);
    }
  };

  return (
    <MobileOnly>
      <div className="practice-screen">
        <div className="practice-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ←
          </button>
          <div style={{ fontWeight: 900 }}>AI PRACTICE</div>
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
              Generating a personalized quest for you...
            </p>
          </div>
        ) : question ? (
          <div className="practice-card">
            <div className="question-label">Question</div>
            <div className="question-text">{question.question}</div>

            <div className="options-list">
              {question.options.map((opt, idx) => {
                const isSelected = selected === opt;
                const isCorrect =
                  showFeedback && opt === question.correct_answer;
                const isWrong =
                  showFeedback && isSelected && !feedback?.correct;

                let className = "option-btn";
                if (isCorrect) className += " correct";
                else if (isWrong) className += " wrong";
                else if (isSelected) className += " selected";

                return (
                  <button
                    key={idx}
                    className={className}
                    onClick={() => handleOptionSelect(opt)}
                    disabled={showFeedback || grading}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {showFeedback && feedback && (
              <div className="feedback-area">
                <div className="feedback-title">
                  {feedback.correct ? "🌟 SMART MOVE!" : "🧠 LEARNING MOMENT"}
                </div>
                <div className="feedback-text">{feedback.explanation}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="practice-card">
            <p>No questions available. Try uploading some notes first!</p>
          </div>
        )}

        <div className="next-action">
          {showFeedback ? (
            <button
              className="button"
              style={{ background: "var(--green)" }}
              onClick={fetchQuestion}
            >
              NEXT QUESTION →
            </button>
          ) : (
            <div style={{ height: 60 }} />
          )}
        </div>

        <BottomNav />
      </div>
    </MobileOnly>
  );
}
