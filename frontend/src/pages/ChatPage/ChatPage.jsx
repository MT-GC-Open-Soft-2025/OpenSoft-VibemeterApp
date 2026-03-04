import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatPage.css";
import Lottie from "lottie-react";
import animationData from "../../Assets/animation.json";
import { nanoid } from "nanoid";
import Markdown from "markdown-to-jsx";
import { getConvoids } from "../../api/user";
import { endChat, getAgents, getChat, initiateChat, sendMessageToAgent } from "../../api/chat";

const ACTIVE_AGENT_STORAGE_KEYS = [
  "activeAgentId",
  "activeAgentName",
  "activeAgentUrl",
  "activeAgentSessionId",
  "activeAgentSessionToken",
  "activeAgentSendPath",
  "activeAgentThemeKey",
  "activeAgentAvatarKey",
];

const IcoPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cp-ico">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcoHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cp-ico">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IcoMsg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cp-ico">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IcoSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IcoStop = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);
const IcoLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IcoMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const restoreActiveAgent = () => {
  const agentId = localStorage.getItem("activeAgentId");
  if (!agentId) return { agent: null, connection: null };
  return {
    agent: {
      agent_id: agentId,
      display_name: localStorage.getItem("activeAgentName") || "WellBee Agent",
      avatar_key: localStorage.getItem("activeAgentAvatarKey") || "default",
      theme_key: localStorage.getItem("activeAgentThemeKey") || "default",
    },
    connection: {
      public_base_url: localStorage.getItem("activeAgentUrl") || "",
      agent_session_id: localStorage.getItem("activeAgentSessionId") || "",
      session_token: localStorage.getItem("activeAgentSessionToken") || "",
      send_path: localStorage.getItem("activeAgentSendPath") || "",
    },
  };
};

const persistActiveAgent = (agent, connection) => {
  localStorage.setItem("activeAgentId", agent.agent_id);
  localStorage.setItem("activeAgentName", agent.display_name);
  localStorage.setItem("activeAgentUrl", connection.public_base_url);
  localStorage.setItem("activeAgentSessionId", connection.agent_session_id);
  localStorage.setItem("activeAgentSessionToken", connection.session_token);
  localStorage.setItem("activeAgentSendPath", connection.send_path);
  localStorage.setItem("activeAgentThemeKey", agent.theme_key || "default");
  localStorage.setItem("activeAgentAvatarKey", agent.avatar_key || "default");
};

const clearActiveAgent = () => {
  ACTIVE_AGENT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

const initialActive = restoreActiveAgent();

const ChatPage = () => {
  const navigate = useNavigate();
  const [convids, setConvids] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(
    () => localStorage.getItem("activeAgentId") || null
  );
  const [activeConvId, setActiveConvId] = useState(() => localStorage.getItem("uniqueId") || null);
  const [viewingConvId, setViewingConvId] = useState(
    () => localStorage.getItem("conversationId") || null
  );
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal] = useState({ type: null });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);
  const [pendingNewChat, setPendingNewChat] = useState(false);
  const [activeAgent, setActiveAgent] = useState(initialActive.agent);
  const [agentConnection, setAgentConnection] = useState(initialActive.connection);
  const [viewingMeta, setViewingMeta] = useState(null);
  const streamAbortRef = useRef(null);
  const chatHistoryRef = useRef(null);
  const inputRef = useRef(null);

  const closeModal = () => setModal({ type: null });
  const isReadonly = viewingConvId !== activeConvId || !activeConvId;
  const displayedAgent = viewingConvId === activeConvId ? activeAgent : viewingMeta;

  const fetchConvids = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const res = await getConvoids();
      const all = res.convid_list || [];
      const cur = localStorage.getItem("uniqueId");
      const reordered = cur && all.includes(cur) ? [cur, ...all.filter((id) => id !== cur)] : all;
      setConvids(reordered);
    } catch {
      // no-op
    }
  }, [navigate]);

  const fetchAvailableAgents = useCallback(async () => {
    try {
      const res = await getAgents();
      setAvailableAgents(res.agents || []);
      if (!selectedAgentId && res.agents?.length) {
        setSelectedAgentId(res.agents[0].agent_id);
      }
    } catch {
      setAvailableAgents([]);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    fetchConvids();
    fetchAvailableAgents();
    const savedMessages = localStorage.getItem("chatMessages");
    const savedConvId = localStorage.getItem("conversationId");
    const savedUniqueId = localStorage.getItem("uniqueId");
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      if (parsed.length > 0) {
        setChatMessages(parsed);
        setChatStarted(true);
      }
    }
    if (savedConvId) setViewingConvId(savedConvId);
    if (savedUniqueId) setActiveConvId(savedUniqueId);
  }, [fetchConvids, fetchAvailableAgents]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages, isBotTyping]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
    }
  }, [inputValue]);

  const loadConversation = async (convId) => {
    try {
      const res = await getChat(convId);
      const msgs = (res.chat || []).map((m) => ({ sender: m.sender, text: m.message }));
      setChatMessages(msgs);
      setChatStarted(true);
      setViewingConvId(convId);
      setViewingMeta(
        res.meta?.agent_name
          ? {
              agent_id: res.meta.agent_id,
              display_name: res.meta.agent_name,
              theme_key: res.meta.agent_persona || "default",
            }
          : null
      );
      localStorage.setItem("conversationId", convId);
    } catch {
      setModal({ type: "error", message: "Failed to load chat. Please try again." });
    }
  };

  const handleHistoryClick = (convId) => {
    if (convId === viewingConvId) return;
    loadConversation(convId);
  };

  const handleBackToCurrentChat = async () => {
    if (!activeConvId) return;
    setViewingMeta(activeAgent);
    await loadConversation(activeConvId);
  };

  const handleNewChatClick = () => {
    if (activeConvId) {
      setPendingNewChat(true);
      setRating(0);
      setHoverRating(0);
      setModal({ type: "endChat" });
      return;
    }
    setChatStarted(false);
    setChatMessages([]);
    setViewingConvId(null);
  };

  const startNewChat = async () => {
    if (!selectedAgentId) {
      setModal({ type: "error", message: "Choose an agent before starting a chat." });
      return;
    }
    const newId = nanoid(6);
    localStorage.setItem("uniqueId", newId);
    localStorage.setItem("conversationId", newId);
    setActiveConvId(newId);
    setViewingConvId(newId);
    setChatMessages([]);
    setChatStarted(true);
    setPendingNewChat(false);
    try {
      const res = await initiateChat(newId, selectedAgentId);
      setActiveAgent(res.agent);
      setAgentConnection(res.connection);
      setViewingMeta(res.agent);
      persistActiveAgent(res.agent, res.connection);
      setChatMessages([{ sender: "bot", text: res.opener }]);
      await fetchConvids();
    } catch {
      clearActiveAgent();
      setModal({ type: "error", message: "Failed to start a new chat." });
    }
  };

  const handleEndChat = () => {
    setRating(0);
    setHoverRating(0);
    setPendingNewChat(false);
    setModal({ type: "endChat" });
  };

  const submitEndChat = async (ratingValue) => {
    setModalLoading(true);
    const convId = activeConvId || localStorage.getItem("uniqueId");
    try {
      await endChat(convId, String(ratingValue));
    } catch {
      // ignore end-chat failures after user action
    }
    setModalLoading(false);
    closeModal();
    localStorage.removeItem("uniqueId");
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("conversationId");
    clearActiveAgent();
    setActiveAgent(null);
    setAgentConnection(null);
    setActiveConvId(null);
    setChatMessages([]);
    setChatStarted(false);
    setViewingConvId(null);
    setViewingMeta(null);
    await fetchConvids();
    if (pendingNewChat) await startNewChat();
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isReadonly || !agentConnection?.public_base_url) return;
    const text = inputValue;
    setChatMessages((prev) => [...prev, { sender: "user", text }]);
    setInputValue("");
    setIsBotTyping(true);
    if (streamAbortRef.current) streamAbortRef.current.abort();
    setChatMessages((prev) => [...prev, { sender: "bot", text: "" }]);
    const controller = sendMessageToAgent({
      baseUrl: agentConnection.public_base_url,
      sendPath: agentConnection.send_path,
      sessionToken: agentConnection.session_token,
      message: text,
      onChunk: (chunk) => {
        setChatMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.sender === "bot") {
            return [...prev.slice(0, -1), { ...last, text: last.text + chunk }];
          }
          return [...prev, { sender: "bot", text: chunk }];
        });
      },
      onError: (err) => {
        setIsBotTyping(false);
        streamAbortRef.current = null;
        setChatMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.sender === "bot" && !last.text) return prev.slice(0, -1);
          return prev;
        });
        if (err.name !== "AbortError") {
          setModal({ type: "error", message: "Failed to send message to the selected agent." });
        }
      },
      onDone: () => {
        setIsBotTyping(false);
        streamAbortRef.current = null;
      },
    });
    streamAbortRef.current = controller;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSessionLabel = (convId, idx) => {
    if (convId === activeConvId) return "Current Chat";
    return `Session ${convids.length - idx}`;
  };

  const renderModal = () => {
    if (modal.type === "error") {
      return (
        <>
          <Modal.Header closeButton><Modal.Title>Something went wrong</Modal.Title></Modal.Header>
          <Modal.Body><p className="text-muted mb-0">{modal.message}</p></Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={closeModal}>Close</Button></Modal.Footer>
        </>
      );
    }
    if (modal.type === "endChat") {
      return (
        <>
          <Modal.Header closeButton>
            <Modal.Title>{pendingNewChat ? "End chat & start new?" : "End this chat?"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted mb-4">
              {pendingNewChat
                ? "You have an active conversation. Please end it before starting a new one. Rate your experience below (optional)."
                : "This will close your current conversation. You can still read it from history afterwards."}
            </p>
            <p className="fw-semibold text-dark mb-2">Rate your experience</p>
            <div className="cp-star-row" role="radiogroup" aria-label="Chat rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`cp-star ${star <= (hoverRating || rating) ? "cp-star-lit" : ""}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
            {modalLoading && <p className="text-muted mt-3 text-center small">Ending chat…</p>}
          </Modal.Body>
          <Modal.Footer className="gap-2">
            <Button variant="secondary" onClick={closeModal} disabled={modalLoading}>Cancel</Button>
            <Button variant="outline-danger" onClick={() => submitEndChat(0)} disabled={modalLoading}>Skip &amp; End</Button>
            <Button variant="primary" onClick={() => submitEndChat(rating)} disabled={modalLoading || rating === 0}>
              {pendingNewChat ? "End & Start New" : "Submit & End"}
            </Button>
          </Modal.Footer>
        </>
      );
    }
    return null;
  };

  return (
    <div className="cp-root">
      <aside className={`cp-sidebar ${sidebarOpen ? "cp-sidebar-open" : "cp-sidebar-closed"}`}>
        <div className="cp-brand-row">
          <div className="cp-brand-avatar">
            <Lottie animationData={animationData} loop style={{ width: 36, height: 36 }} />
          </div>
          {sidebarOpen && (
            <div className="cp-brand-text">
              <span className="cp-brand-name">WellBee</span>
              <span className="cp-brand-sub">Multi-Agent Chat</span>
            </div>
          )}
          <button className="cp-toggle-btn" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle sidebar">
            <IcoMenu />
          </button>
        </div>

        <button className="cp-new-btn" onClick={handleNewChatClick} title="New Chat">
          <IcoPlus />
          {sidebarOpen && <span>New Chat</span>}
        </button>

        <div className="cp-conv-section">
          {sidebarOpen && <span className="cp-conv-label">Conversations</span>}
          <div className="cp-conv-list">
            {convids.length === 0 && sidebarOpen && (
              <div className="cp-conv-empty">No conversations yet</div>
            )}
            {convids.map((convId, idx) => {
              const isActive = convId === activeConvId;
              const isViewing = convId === viewingConvId;
              return (
                <button
                  key={convId}
                  className={`cp-conv-item ${isViewing ? "cp-conv-viewing" : ""} ${isActive ? "cp-conv-active" : ""}`}
                  onClick={() => handleHistoryClick(convId)}
                  title={getSessionLabel(convId, idx)}
                >
                  <span className="cp-conv-ico"><IcoMsg /></span>
                  {sidebarOpen && <span className="cp-conv-label-text">{getSessionLabel(convId, idx)}</span>}
                  {isActive && <span className="cp-live-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="cp-sidebar-bottom">
          <button className="cp-bottom-btn" onClick={() => navigate("/user")} title="Dashboard">
            <IcoHome />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          {sidebarOpen && (
            <div className="cp-privacy-row">
              <IcoLock />
              <span>Private &amp; encrypted</span>
            </div>
          )}
        </div>
      </aside>

      <main className="cp-main">
        <header className="cp-topbar">
          <div className="cp-topbar-left">
            {!sidebarOpen && (
              <button className="cp-icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <IcoMenu />
              </button>
            )}
            <div>
              <span className="cp-topbar-title">
                {displayedAgent?.display_name || (viewingConvId ? "WellBee Chat" : "Choose Your Agent")}
              </span>
              {displayedAgent?.agent_id && (
                <div className="cp-agent-subtitle">{displayedAgent.agent_id}</div>
              )}
            </div>
          </div>
          <div className="cp-topbar-right">
            {activeConvId && viewingConvId !== activeConvId && (
              <button className="cp-back-current-btn" onClick={handleBackToCurrentChat}>
                ↩ Current Chat
              </button>
            )}
            {chatStarted && activeConvId && viewingConvId === activeConvId && (
              <button className="cp-end-btn" onClick={handleEndChat}>End Chat</button>
            )}
            <div className="cp-status-row">
              <span className="cp-status-dot" />
              <span className="cp-status-label">
                {displayedAgent?.display_name ? `${displayedAgent.display_name} online` : "online"}
              </span>
            </div>
          </div>
        </header>

        {viewingConvId && viewingConvId !== activeConvId && chatStarted && (
          <div className="cp-readonly-banner">
            <IcoLock />
            <span>Read-only — this is a past conversation.</span>
            {activeConvId && (
              <button className="cp-readonly-back-btn" onClick={handleBackToCurrentChat}>
                Go to current chat →
              </button>
            )}
          </div>
        )}

        <div className="cp-messages" ref={chatHistoryRef}>
          {!chatStarted ? (
            <div className="cp-welcome">
              <div className="cp-welcome-lottie">
                <Lottie animationData={animationData} loop style={{ width: 120, height: 120 }} />
              </div>
              <h2 className="cp-welcome-title">Pick the agent you want to talk to</h2>
              <p className="cp-welcome-sub">Each channel supports the same goals, but they open the conversation with a different style.</p>
              <div className="cp-agent-grid">
                {availableAgents.map((agent) => (
                  <button
                    key={agent.agent_id}
                    className={`cp-agent-card ${selectedAgentId === agent.agent_id ? "cp-agent-card-active" : ""}`}
                    onClick={() => setSelectedAgentId(agent.agent_id)}
                  >
                    <span className="cp-agent-card-name">{agent.display_name}</span>
                    <span className="cp-agent-card-desc">{agent.description}</span>
                  </button>
                ))}
              </div>
              {availableAgents.length === 0 && (
                <div className="cp-agent-empty">No agents are available right now.</div>
              )}
              <button
                className="cp-start-btn"
                onClick={startNewChat}
                disabled={!selectedAgentId || availableAgents.length === 0}
              >
                <IcoPlus /> Start a conversation
              </button>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, idx) => {
                if (msg.sender === "bot" && !msg.text.trim() && isBotTyping) return null;
                return (
                  <div key={idx} className={`cp-msg-row ${msg.sender === "bot" ? "cp-msg-bot" : "cp-msg-user"}`}>
                    {msg.sender === "bot" && <div className="cp-avatar">{displayedAgent?.display_name?.[0] || "W"}</div>}
                    <div className={`cp-bubble ${msg.sender === "bot" ? "cp-bubble-bot" : "cp-bubble-user"}`}>
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                );
              })}
              {isBotTyping && (
                <div className="cp-msg-row cp-msg-bot">
                  <div className="cp-avatar">{displayedAgent?.display_name?.[0] || "W"}</div>
                  <div className="cp-bubble cp-bubble-bot cp-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="cp-input-area">
          {isReadonly && chatStarted ? (
            <div className="cp-input-readonly-notice">
              This is a read-only conversation.{" "}
              {activeConvId && (
                <button className="cp-inline-link" onClick={handleBackToCurrentChat}>
                  Go to current chat
                </button>
              )}
            </div>
          ) : (
            <div className="cp-input-box">
              <textarea
                ref={inputRef}
                className="cp-input"
                placeholder={displayedAgent?.display_name ? `Message ${displayedAgent.display_name}… (Shift+Enter for new line)` : "Select an agent to begin"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isReadonly || !chatStarted}
                rows={1}
                aria-label="Message input"
              />
              <div className="cp-input-actions">
                {isBotTyping && streamAbortRef.current && (
                  <button className="cp-stop-btn" onClick={() => streamAbortRef.current?.abort()} title="Stop generating">
                    <IcoStop /> Stop
                  </button>
                )}
                <button
                  className={`cp-send-btn ${(!inputValue.trim() || isReadonly || !chatStarted) ? "cp-send-disabled" : "cp-send-active"}`}
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isReadonly || !chatStarted}
                  aria-label="Send"
                >
                  <IcoSend />
                </button>
              </div>
            </div>
          )}
          <p className="cp-disclaimer">WellBee agents can make mistakes. Consider checking important information.</p>
        </div>

        <Modal show={modal.type !== null} onHide={closeModal} centered>
          {renderModal()}
        </Modal>
      </main>
    </div>
  );
};

export default ChatPage;
