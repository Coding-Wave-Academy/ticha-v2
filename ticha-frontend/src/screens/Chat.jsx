import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "../styles/chat.css";
import BottomNav from "../components/BottomNav";
import MobileOnly from "../components/MobileOnly";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../utils/api";

export default function Chat() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial load
  useEffect(() => {
    const initChat = async () => {
      try {
        const sessionList = await apiFetch("/api/ai/sessions");
        setSessions(sessionList);

        if (sessionList.length > 0) {
          // Auto-load most recent session
          switchSession(sessionList[0].id);
        } else {
          // No sessions yet, wait for first message to create one
          // or we could auto-create one:
          // const newSess = await createChatSession("Initial Chat");
          // setCurrentSessionId(newSess.id);
        }
      } catch (err) {
        console.error("Init chat error:", err);
      }
    };
    initChat();
  }, []);

  const createChatSession = async (title = "New Chat") => {
    try {
      const session = await apiFetch("/api/ai/sessions", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setSessions([session, ...sessions]);
      setCurrentSessionId(session.id);
      setMessages([]);
      return session;
    } catch (err) {
      showToast("Failed to create session", { type: "error" });
    }
  };

  const switchSession = async (sessionId) => {
    setLoading(true);
    setCurrentSessionId(sessionId);
    setShowSessions(false);
    try {
      const history = await apiFetch(`/api/ai/sessions/${sessionId}`);
      setMessages(
        history.map((m) => ({
          role: m.role === "student" ? "user" : "assistant",
          content: m.content,
          id: m.id,
        }))
      );
    } catch (err) {
      showToast("Failed to load history", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText = null) => {
    const msgToSend = messageText || input.trim();
    if (!msgToSend) return;

    setInput("");

    // If no session exists, create one first
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      const sess = await createChatSession(msgToSend.substring(0, 20) + "...");
      if (!sess) return; // Stop if session creation failed
      activeSessionId = sess.id;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: msgToSend, id: Date.now() },
    ]);

    setLoading(true);
    try {
      const data = await apiFetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: msgToSend,
          sessionId: activeSessionId,
        }),
      });

      const reply = data.reply || data.response || JSON.stringify(data);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          id: Date.now() + 1,
          actions: ["Yes, give me one", "Show me an example"],
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      showToast(`Error: ${err.message}`, { type: "error", duration: 4000 });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleActionClick = (action) => {
    sendMessage(action);
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <MobileOnly>
      <div className="chat-screen">
        <div className="chat-top-header">
          <span className="chat-screen-title">Chat Screen</span>
        </div>

        <div className="chat-header">
          <button
            className="header-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ←
          </button>
          <div className="chat-branding">
            <div className="bot-avatar">🤖</div>
            <span className="bot-name">EduBot AI</span>
          </div>
          <button
            className="header-menu-btn"
            onClick={() => setShowSessions(!showSessions)}
          >
            ⋮
          </button>
        </div>

        {showSessions && (
          <div
            className="session-overlay"
            onClick={() => setShowSessions(false)}
          >
            <div
              className="session-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="session-header">
                <h3>Chat History</h3>
                <button
                  className="new-chat-btn"
                  onClick={() => createChatSession()}
                >
                  + New Chat
                </button>
              </div>
              <div className="session-list">
                {sessions.length === 0 && (
                  <p style={{ fontSize: 12, textAlign: "center", padding: 20 }}>
                    No past sessions
                  </p>
                )}
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className={`session-item ${
                      currentSessionId === sess.id ? "active" : ""
                    }`}
                    onClick={() => switchSession(sess.id)}
                  >
                    <span>{sess.title || "Untitled Chat"}</span>
                    <span className="session-date">
                      {new Date(sess.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <p className="chat-emoji">🧠</p>
              <p>
                Hello! I'm your AI study assistant. How can I help with your
                lessons today?
              </p>
            </div>
          ) : (
            <>
              <div className="chat-timestamp">Today, {formatTime()}</div>
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  {msg.role === "assistant" && (
                    <div className="message-avatar">🤖</div>
                  )}
                  <div className="message-bubble">
                    <div className="message-content">
                      {msg.role === "assistant" ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.actions && (
                      <div className="action-buttons">
                        {msg.actions.map((action, idx) => (
                          <button
                            key={idx}
                            className="action-btn"
                            onClick={() => handleActionClick(action)}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="message-avatar user-avatar">👤</div>
                  )}
                </div>
              ))}
            </>
          )}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble">
                <div className="message-content">
                  <span className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <button className="input-plus-btn" aria-label="Add attachment">
            +
          </button>
          <input
            type="text"
            className="chat-input"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            className="input-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>

        <BottomNav />
      </div>
    </MobileOnly>
  );
}
