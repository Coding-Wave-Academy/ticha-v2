import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../utils/api";

export default function DailyTaskModal({ open, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch("/api/daily/today");
        setTasks(data || []);
      } catch (err) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [open]);

  const generateAITasks = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/api/daily/generate-ai", {
        method: "POST",
      });

      setTasks(data.tasks || data);
      showToast("AI tasks generated!", { type: "success" });
    } catch (err) {
      setError(err.message || "Error");
      showToast(err.message || "Error generating tasks", { type: "error" });
    } finally {
      setAiLoading(false);
    }
  };

  if (!open) return null;

  const toggleComplete = async (taskId) => {
    // Start per-task spinner
    setTaskLoading((s) => ({ ...s, [taskId]: true }));

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    );
    try {
      const data = await apiFetch(`/api/daily/${taskId}/complete`, {
        method: "POST",
      });
      // Sync any returned fields
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...data.task } : t))
      );
      // show success toast
      if (showToast) showToast("Task completed", { type: "success" });
    } catch (err) {
      // revert
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: false } : t))
      );
      setError(err.message || "Error completing task");
      // show error toast
      if (showToast)
        showToast(err.message || "Error completing task", { type: "error" });
    } finally {
      setTaskLoading((s) => ({ ...s, [taskId]: false }));
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="daily-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Daily Tasks</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-sub">Tasks to keep you on track</p>

          {loading && <p>Loading…</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !tasks.length && <p>No tasks for today.</p>}

          <ul className="task-list">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="task-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: 1,
                  }}
                >
                  {taskLoading[t.id] ? (
                    <div className="task-spinner" aria-hidden="true" />
                  ) : (
                    <input
                      type="checkbox"
                      checked={Boolean(t.completed)}
                      onChange={() => !t.completed && toggleComplete(t.id)}
                    />
                  )}

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                      className="task-title"
                      style={{
                        textDecoration: t.completed ? "line-through" : "none",
                      }}
                    >
                      {t.title ||
                        (t.task_type
                          ? `${t.task_type.toUpperCase()}: ${t.subject}`
                          : "Task")}
                    </span>
                    {t.description && (
                      <span style={{ fontSize: 12, color: "#666" }}>
                        {t.description}
                      </span>
                    )}

                    <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
                      {t.estimated_minutes
                        ? `${t.estimated_minutes} min`
                        : null}
                      {t.knowledge_unit_id ? (
                        <button
                          className="btn ghost"
                          style={{
                            marginLeft: 12,
                            padding: "4px 8px",
                            fontSize: 12,
                          }}
                          onClick={() => {
                            navigate(`/knowledge/${t.knowledge_unit_id}`);
                            onClose();
                          }}
                        >
                          View unit
                        </button>
                      ) : null}
                    </div>
                  </div>
                </label>

                <div style={{ minWidth: 80, textAlign: "right" }}>
                  {t.completed ? (
                    <span style={{ fontWeight: 700 }}>Done</span>
                  ) : (
                    <span style={{ color: "#888" }}>{t.subject || ""}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="modal-actions">
            <button
              className="btn primary"
              onClick={generateAITasks}
              disabled={aiLoading}
              style={{ marginBottom: 8 }}
            >
              {aiLoading ? "🤖 Generating…" : "🤖 Generate AI Tasks"}
            </button>
            <button className="btn primary" onClick={onClose}>
              Start Day
            </button>
            <button className="btn ghost" onClick={onClose}>
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
