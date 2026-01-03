import "../styles/dashboard.css";
import BottomNav from "../components/BottomNav";
import MobileOnly from "../components/MobileOnly";
import DailyTaskModal from "../components/DailyTaskModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";
import { useToast } from "../context/ToastContext";
import fireIcon from '../assets/icons/fire.png'



export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userName, setUserName] = useState(() => {
    const user = JSON.parse(localStorage.getItem("ticha_user") || "{}");
    return user.full_name || "Student";
  });
  const [streak, setStreak] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [recentSummaries, setRecentSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAiTip, setShowAiTip] = useState(true);
  const [studentLevel, setStudentLevel] = useState("ol");
  const [hasUploadedCourses, setHasUploadedCourses] = useState(true);
  const [showCoursePrompt, setShowCoursePrompt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paying, setPaying] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState(() => {
    const user = JSON.parse(localStorage.getItem("ticha_user") || "{}");
    return (
      user.avatar_url ||
      "https://ui-avatars.com/api/?name=Student&background=FFD600&color=000"
    );
  });

  const avatarChoices = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Anya",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Kiki",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Pepper",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost",
  ];

  const handleAvatarSelect = async (url) => {
    try {
      await apiFetch("/api/students/avatar", {
        method: "PATCH",
        body: JSON.stringify({ avatar_url: url }),
      });
      setUserAvatar(url);
      // Update local storage too
      const user = JSON.parse(localStorage.getItem("ticha_user") || "{}");
      user.avatar_url = url;
      localStorage.setItem("ticha_user", JSON.stringify(user));
      setShowAvatarModal(false);
      showToast("Avatar updated!", { type: "success" });
    } catch (err) {
      showToast("Failed to update avatar", { type: "error" });
    }
  };

  const quickActions = [
    { icon: {fireIcon}, label: "Daily Task", path: "/daily-task" },
    { icon: "📋", label: "Summaries", path: "/summaries" },
    { icon: "📅", label: "Timetable", path: "/timetable" },
    { icon: "✍️", label: "Practice", path: "/practice" },
  ];

  // recentSummaries now loaded from API

  // ...existing code... (streak card etc)

  const streakDays = ["S", "M", "T", "W", "TH", "F", "S"];
  const activeDays = [1, 1, 1, 1, 1, 1, 1]; // All active to match the design

  const location = useLocation();
  const showDailyTask = location.pathname === "/daily-task";

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch(`/api/dashboard`);
        if (!data) {
          setStreak(0);
          setNotifications(0);
          setRecentSummaries([]);
          return;
        }

        setStreak(data.streak || 0);
        setNotifications(data.notifications || 0);
        setRecentSummaries(data.recentSummaries || []);
        setStudentLevel(data.level || "ol");
        setHasUploadedCourses(data.hasUploadedCourses);

        if (data.level === "uni" && !data.hasUploadedCourses) {
          setShowCoursePrompt(true);
        }

        if (data.full_name) setUserName(data.full_name);
      } catch (err) {
        setError(err.message || "Error fetching dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [location.pathname]);

  // Hide AI tip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAiTip(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <MobileOnly>
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div
            className="dashboard-avatar"
            style={{ backgroundImage: `url(${userAvatar})` }}
            onClick={() => setShowAvatarModal(true)}
          ></div>
          <div className="dashboard-greeting">
            <p>Hello,</p>
            <h2>
              {userName} <span className="wave">👋</span>
            </h2>
          </div>

          <div className="dashboard-header-icons">
            <div className="dashboard-streak-badge">
              <span className="fire">{fireIcon}</span>
              <span className="streak-count">{streak}</span>
            </div>

            <div className="dashboard-notif">
              <span className="bell">🔔</span>
              <span className="notif-count">{notifications}</span>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="streak-card">
          <div className="streak-top">
            <div className="streak-icon">{fireIcon}</div>
            <div className="streak-info">
              <h3>{streak} DAYS STREAK!</h3>
              <p className="streak-subtitle">
                Keep up the good work, I see you
              </p>
            </div>
          </div>

          <div className="week">
            {streakDays.map((d, idx) => (
              <div
                key={`streak-${idx}`}
                className={`day ${activeDays[idx] ? "active" : "inactive"}`}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* AI Study Tip - Hidden after 10 seconds */}
        {showAiTip && (
          <div
            className="ai-tip-card"
            style={{
              background: "white",
              border: "4px solid black",
              boxShadow: "6px 6px 0 black",
              borderRadius: "16px",
              padding: "16px",
              margin: "0 20px 24px 20px",
              display: "flex",
              gap: "12px",
              alignItems: "center",
              animation: showAiTip
                ? "fadeIn 0.3s ease-in"
                : "fadeOut 0.5s ease-out",
            }}
          >
            <div style={{ fontSize: "24px" }}>💡</div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "900",
                  color: "#666",
                  textTransform: "uppercase",
                }}
              >
                AI Study Tip
              </div>
              <div style={{ fontSize: "14px", fontWeight: "700" }}>
                Try the "Feynman Technique": explain the concept to me as if I
                were a 5-year old.
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          {quickActions.map((action, i) => (
            <div key={`${action.label}-${i}`} className="quick-action">
              <div
                className="action-circle"
                onClick={() => navigate(action.path)}
                style={
                  i === 0
                    ? { backgroundColor: "#FFE082" }
                    : i === 1
                    ? { backgroundColor: "#B2FF59" }
                    : i === 2
                    ? { backgroundColor: "#BBDEFB" }
                    : { backgroundColor: "#F8BBD0" }
                }
              >
                <span className="action-icon">{action.icon}</span>
                {i === 0 && <span className="action-badge">3</span>}
              </div>
              <div className="action-label">{action.label}</div>
            </div>
          ))}
        </div>

        {/* Featured / Upgrade Plan */}
        <div className="featured" onClick={() => setShowPaymentModal(true)}>
          <div className="featured-content">
            <div className="featured-icon">🚀</div>
            <div>
              <p className="featured-label">Upgrade your plan</p>
              <h4>
                {studentLevel === "uni" ? "1000 XAF/Semester" : "2000 XAF/Year"}
              </h4>
            </div>
          </div>
          <span className="featured-arrow">→</span>
        </div>

        {/* Recent Summaries */}
        <div className="recent">
          <h4>Recent Summaries</h4>
          {loading && <p>Loading summaries…</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !recentSummaries.length && <p>No summaries yet</p>}
          {!loading && recentSummaries.length > 0 && (
            <div className="summaries-list">
              {recentSummaries.map((summary) => (
                <div
                  key={summary.id}
                  className="summary-card"
                  onClick={() => navigate(`/summary/${summary.id}`)}
                >
                  <p className="summary-category">{summary.category}</p>
                  <h5>{summary.title}</h5>
                </div>
              ))}
            </div>
          )}
        </div>

        <DailyTaskModal
          open={showDailyTask}
          onClose={() => navigate("/dashboard")}
        />

        {/* Course Upload Prompt Modal for Uni Students */}
        {showCoursePrompt && (
          <div className="modal-overlay">
            <div className="modal-content prompt-modal">
              <div className="prompt-icon">📚</div>
              <h3>University Student?</h3>
              <p>
                You haven't added your course list yet. Let TICHA help you
                organize your semester!
              </p>
              <button
                className="button-v1"
                style={{ background: "var(--yellow)", margin: "16px 0" }}
                onClick={() => navigate("/upload-courses")}
              >
                Upload Course List
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={() => setShowCoursePrompt(false)}
              >
                Later
              </button>
            </div>
          </div>
        )}

        {/* Avatar Selection Modal */}
        {showAvatarModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowAvatarModal(false)}
          >
            <div
              className="modal-content avatar-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Select Avatar</h3>
              <div className="avatar-grid">
                {avatarChoices.map((url, i) => (
                  <div
                    key={i}
                    className={`avatar-option ${
                      userAvatar === url ? "selected" : ""
                    }`}
                    onClick={() => handleAvatarSelect(url)}
                  >
                    <img src={url} alt={`Avatar ${i}`} />
                  </div>
                ))}
              </div>
              <button
                className="close-btn"
                onClick={() => setShowAvatarModal(false)}
                style={{
                  marginTop: 20,
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Nkwa Pay Modal */}
        {showPaymentModal && (
          <div className="modal-overlay">
            <div className="modal-content payment-modal">
              <h3>Upgrade to Pro 🚀</h3>
              <p>
                Get unlimited AI help and study plans for only{" "}
                <strong>
                  {studentLevel === "uni"
                    ? "1000 XAF/Semester"
                    : "2000 XAF/Year"}
                </strong>
                .
              </p>

              <div style={{ marginTop: 20 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  MOMO PHONE NUMBER
                </label>
                <input
                  type="tel"
                  placeholder="650000000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "3px solid black",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                />
              </div>

              <button
                className="button-v1"
                style={{
                  background: paying ? "#ccc" : "var(--green)",
                  margin: "24px 0 12px 0",
                  width: "100%",
                }}
                disabled={paying || !phoneNumber}
                onClick={async () => {
                  setPaying(true);
                  try {
                    const amount = studentLevel === "uni" ? 1000 : 2000;
                    const res = await apiFetch("/api/payments/collect", {
                      method: "POST",
                      body: JSON.stringify({ phoneNumber, amount }),
                    });
                    showToast(res.message, { type: "success" });
                    setShowPaymentModal(false);
                  } catch (err) {
                    showToast(err.message, { type: "error" });
                  } finally {
                    setPaying(false);
                  }
                }}
              >
                {paying
                  ? "WAITING FOR MOMO..."
                  : `PAY ${studentLevel === "uni" ? 1000 : 2000} XAF`}
              </button>

              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                }}
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </MobileOnly>
  );
}
