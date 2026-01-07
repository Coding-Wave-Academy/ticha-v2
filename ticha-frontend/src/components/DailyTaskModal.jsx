import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../utils/api";

export default function DailyTaskModal({ open, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
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

          {!loading && !tasks.length && (
            <div
              className="empty-tasks-state"
              style={{ textAlign: "center", padding: "20px 0" }}
            >
              <span style={{ fontSize: 40 }}>🏜️</span>
              <p style={{ fontWeight: 800 }}>No personalized tasks yet!</p>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.4 }}>
                Upload your notes or take a quiz so TCICHA can build your
                specific study plan.
              </p>
              <button
                className="button-v1"
                style={{
                  background: "var(--yellow)",
                  marginTop: 16,
                  width: "100%",
                }}
                onClick={() => {
                  navigate("/summaries");
                  onClose();
                }}
              >
                UPLOAD MATERIALS
              </button>
            </div>
          )}

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
            <button className="btn primary" onClick={onClose}>
              {tasks.length > 0 ? "Start Day" : "Got it"}
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
