import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "../styles/chat.css";
import BottomNav from "../components/BottomNav";
import MobileOnly from "../components/MobileOnly";
import { useToast } from "../context/ToastContext";
import { apiFetch } from "../utils/api";
import tichaIcon from "../assets/AiLogo.png";

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:32',message:'Chat init start',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const initChat = async () => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:35',message:'Fetching sessions',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        const sessionList = await apiFetch("/api/ai/sessions");
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:37',message:'Sessions loaded',data:{sessionCount:sessionList.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setSessions(sessionList);

        if (sessionList.length > 0) {
          // Auto-load most recent session
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:40',message:'Switching to first session',data:{sessionId:sessionList[0].id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          switchSession(sessionList[0].id);
        } else {
          // No sessions yet, wait for first message to create one
          // or we could auto-create one:
          const newSess = await createChatSession("Initial Chat");
          setCurrentSessionId(newSess.id);
        }
      } catch (err) {
        console.error("Init chat error:", err);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:48',message:'Init chat error',data:{errorMessage:err.message,errorName:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }
    };
    initChat();

    // Load ElevenLabs ConvAI widget script
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:68',message:'Loading ElevenLabs script',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Check if script already exists
    let script = document.querySelector('script[src*="elevenlabs.io"]');
    
    if (!script) {
      script = document.createElement("script");
      script.src = "https://elevenlabs.io/convai-widget/index.js";
      script.async = true;
      script.type = "text/javascript";
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:76',message:'Creating new script element',data:{src:script.src},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      script.onload = () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:79',message:'Script onload fired',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        // Wait for custom element to be defined
        const checkCustomElement = () => {
          // #region agent log
          const isDefined = customElements.get('elevenlabs-convai') !== undefined;
          fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:82',message:'Checking custom element',data:{isDefined,customElementsAvailable:typeof customElements !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          if (isDefined) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:85',message:'Custom element defined, setting ready',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            setElevenLabsReady(true);
          } else {
            setTimeout(checkCustomElement, 100);
          }
        };
        setTimeout(checkCustomElement, 100);
      };
      
      script.onerror = (err) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:93',message:'Script load error',data:{error:err?.message || 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        console.error('Failed to load ElevenLabs script:', err);
      };
      
      document.head.appendChild(script);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:99',message:'Script appended to head',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } else {
      // Script already exists, check if custom element is defined
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:102',message:'Script already exists',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      if (customElements.get('elevenlabs-convai')) {
        setElevenLabsReady(true);
      }
    }

    return () => {
      // Don't remove script on cleanup - keep it loaded for better UX
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:110',message:'Component cleanup (script kept)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    };
  }, []);

  const createChatSession = async (title = "New Chat") => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:65',message:'createChatSession entry',data:{title},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    try {
      const session = await apiFetch("/api/ai/sessions", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:71',message:'Session created',data:{sessionId:session.id,title:session.title},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setSessions([session, ...sessions]);
      setCurrentSessionId(session.id);
      setMessages([]);
      return session;
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:76',message:'createChatSession error',data:{errorMessage:err.message,errorName:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      showToast("Failed to create session", { type: "error" });
    }
  };

  const switchSession = async (sessionId) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:80',message:'switchSession entry',data:{sessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    setLoading(true);
    setCurrentSessionId(sessionId);
    setShowSessions(false);
    try {
      const history = await apiFetch(`/api/ai/sessions/${sessionId}`);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:86',message:'Session history loaded',data:{sessionId,messageCount:history.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setMessages(
        history.map((m) => ({
          role: m.role === "student" ? "user" : "assistant",
          content: m.content,
          id: m.id,
        }))
      );
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:94',message:'switchSession error',data:{sessionId,errorMessage:err.message,errorName:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      showToast("Failed to load history", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText = null) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:100',message:'sendMessage entry',data:{messageText,hasInput:!!input.trim(),currentSessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const msgToSend = messageText || input.trim();
    if (!msgToSend) return;

    setInput("");

    // If no session exists, create one first
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:109',message:'Creating session before send',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:121',message:'Sending chat message',data:{messageLength:msgToSend.length,sessionId:activeSessionId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const data = await apiFetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: msgToSend,
          sessionId: activeSessionId,
        }),
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:129',message:'Chat response received',data:{hasReply:!!data.reply,hasResponse:!!data.response,dataKeys:Object.keys(data)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:141',message:'sendMessage error',data:{errorMessage:err.message,errorName:err.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
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

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [elevenLabsReady, setElevenLabsReady] = useState(false);

  const startVoiceQuest = () => {
    setShowVoiceModal(true);
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
          <span className="chat-screen-title">Personalized Chat</span>
        </div>

        <div className="chat-header">
          <button
            className="header-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ←
          </button>
          <div className="chat-branding">
            <div className="bot-avatar">
              <img src={tichaIcon} alt="" style={{ width: 32 }} />
            </div>
            <span className="bot-name">Ticha AI</span>
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
                Hello! I'm your study assistant. How can I help with your
                lessons today?
              </p>
              <div className="quick-suggestions">
                <button
                  className="suggest-btn"
                  onClick={() =>
                    sendMessage(
                      "Explain the current topic in the curriculum step-by-step"
                    )
                  }
                >
                  📖 Explain Curriculum
                </button>
                <button
                  className="suggest-btn voice-special"
                  onClick={startVoiceQuest}
                >
                  🎤 Know Me Better (Voice)
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-timestamp">Today, {formatTime()}</div>
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  {msg.role === "assistant" && (
                    <div className="message-avatar">
                      <img src={tichaIcon} alt="" style={{ width: 32 }} />
                    </div>
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
              <div className="message-avatar">
                <img src={tichaIcon} alt="" style={{ width: 32 }} />
              </div>
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

        {showVoiceModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowVoiceModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              className="voice-modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "transparent",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <button
                onClick={() => setShowVoiceModal(false)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "#fff",
                  border: "2px solid #000",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  fontSize: "20px",
                  cursor: "pointer",
                  zIndex: 10000,
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>

              {/* ElevenLabs Widget */}
              {elevenLabsReady ? (
                // #region agent log
                (() => {
                  fetch('http://127.0.0.1:7242/ingest/598c0515-9456-49ad-822a-da02ac7c7787',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Chat.jsx:474',message:'Rendering ElevenLabs widget',data:{elevenLabsReady},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                  return null;
                })()
                // #endregion
              ) : null}
              {elevenLabsReady && (
                <elevenlabs-convai agent-id="agent_3801ke5xsd5cfb883mbmfqa4apa0"></elevenlabs-convai>
              )}
              {!elevenLabsReady && (
                <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
                  Loading voice assistant...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MobileOnly>
  );
}
