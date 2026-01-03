import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import "../styles/knowledge-unit.css";

export default function KnowledgeUnit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [unit, setUnit] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    const fetchUnit = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("ticha_token");
        const res = await fetch(`/api/knowledge/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
          throw new Error(errorData.message || "Failed to fetch knowledge unit");
        }
        const data = await res.json();
        setUnit(data);
      } catch (err) {
        setError(err.message || "Error");
        showToast(err.message || "Error loading knowledge unit", { type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [id, showToast]);

  const fetchAIExplanation = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem("ticha_token");
      const res = await fetch(`/api/knowledge/${id}/explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text().catch(() => "");
        throw new Error(`Unexpected response: ${text ? text.substring(0, 120) : "no body"}`);
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to generate explanation");
      }

      const data = await res.json();
      setAiExplanation(data);
      setShowAI(true);
      showToast("AI explanation generated!", { type: "success" });
    } catch (err) {
      console.error("AI explanation error:", err);
      showToast(`Error: ${err.message}`, { type: "error" });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="screen"><div className="card">Loading…</div></div>;
  if (error) return <div className="screen"><div className="card error-card">{error}</div></div>;
  if (!unit) return null;

  return (
    <div className="knowledge-unit-screen">
      <div className="knowledge-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>{unit.concept_title}</h1>
      </div>

      <div className="knowledge-content">
        <div className="unit-section">
          <h2>Explanation</h2>
          <p>{unit.explanation}</p>
        </div>

        {unit.examples && (
          <div className="unit-section">
            <h2>Examples</h2>
            <div className="examples-box">{unit.examples}</div>
          </div>
        )}

        <div className="unit-section meta">
          <div className="difficulty-badge">
            <strong>Difficulty:</strong> {unit.difficulty || "Medium"}
          </div>
        </div>

        {/* AI-Generated Explanation Section */}
        <div className="ai-section">
          <button
            className="ai-generate-btn"
            onClick={fetchAIExplanation}
            disabled={aiLoading}
          >
            {aiLoading ? "🤖 Generating…" : "🤖 Get Accurate Explanation"}
          </button>

          {showAI && aiExplanation && (
            <div className="ai-explanation">
              <div className="ai-header">AI Tutor's Explanation</div>

              {aiExplanation.explanation && (
                <div className="ai-subsection">
                  <h3>Simple Explanation</h3>
                  <p>{aiExplanation.explanation}</p>
                </div>
              )}

              {aiExplanation.example && (
                <div className="ai-subsection">
                  <h3>Real-World Example</h3>
                  <p>{aiExplanation.example}</p>
                </div>
              )}

              {aiExplanation.keyTakeaway && (
                <div className="ai-subsection key">
                  <h3>💡 Key Takeaway</h3>
                  <p>{aiExplanation.keyTakeaway}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .knowledge-unit-screen {
          padding-bottom: 80px;
        }
      `}</style>
    </div>
  );
}