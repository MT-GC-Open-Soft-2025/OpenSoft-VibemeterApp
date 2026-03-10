/**
 * WellBee – useChat hook
 * Extracts all chat state and logic from ChatPage.jsx.
 * Manages: conversation list, agent selection, message streaming, end-chat.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { getConvoids } from '../api/user';
import { endChat, getAgents, getChat, initiateChat, sendMessageToAgent } from '../api/chat';

/* ── localStorage helpers ─────────────────────────────────────── */
const AGENT_KEYS = [
  'activeAgentId', 'activeAgentName', 'activeAgentUrl',
  'activeAgentSessionId', 'activeAgentSessionToken',
  'activeAgentSendPath', 'activeAgentThemeKey', 'activeAgentAvatarKey',
];

function restoreActiveAgent() {
  const agentId = localStorage.getItem('activeAgentId');
  if (!agentId) return { agent: null, connection: null };
  return {
    agent: {
      agent_id: agentId,
      display_name: localStorage.getItem('activeAgentName') || 'WellBee Agent',
      avatar_key: localStorage.getItem('activeAgentAvatarKey') || 'default',
      theme_key: localStorage.getItem('activeAgentThemeKey') || 'default',
    },
    connection: {
      public_base_url: localStorage.getItem('activeAgentUrl') || '',
      agent_session_id: localStorage.getItem('activeAgentSessionId') || '',
      session_token: localStorage.getItem('activeAgentSessionToken') || '',
      send_path: localStorage.getItem('activeAgentSendPath') || '',
    },
  };
}

function persistActiveAgent(agent, connection) {
  localStorage.setItem('activeAgentId', agent.agent_id);
  localStorage.setItem('activeAgentName', agent.display_name);
  localStorage.setItem('activeAgentUrl', connection.public_base_url);
  localStorage.setItem('activeAgentSessionId', connection.agent_session_id);
  localStorage.setItem('activeAgentSessionToken', connection.session_token);
  localStorage.setItem('activeAgentSendPath', connection.send_path);
  localStorage.setItem('activeAgentThemeKey', agent.theme_key || 'default');
  localStorage.setItem('activeAgentAvatarKey', agent.avatar_key || 'default');
}

function clearActiveAgent() {
  AGENT_KEYS.forEach((k) => localStorage.removeItem(k));
}

/* ── Hook ─────────────────────────────────────────────────────── */
export function useChat() {
  const navigate = useNavigate();

  // Conversation list
  const [convids, setConvids] = useState([]);

  // Per-session metadata cache: { [convId]: { agentName, agentId } }
  const [sessionMeta, setSessionMeta] = useState({});

  // Available agents
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(
    () => localStorage.getItem('activeAgentId') || null
  );

  // Active vs. viewed conversation
  const [activeConvId, setActiveConvId] = useState(
    () => localStorage.getItem('uniqueId') || null
  );
  const [viewingConvId, setViewingConvId] = useState(
    () => localStorage.getItem('conversationId') || null
  );
  const [viewingMeta, setViewingMeta] = useState(null);

  // Agent state
  const initialAgent = restoreActiveAgent();
  const [activeAgent, setActiveAgent] = useState(initialAgent.agent);
  const [agentConnection, setAgentConnection] = useState(initialAgent.connection);

  // Messages
  const [chatMessages, setChatMessages] = useState([]);
  const [chatStarted, setChatStarted] = useState(false);

  // Input / streaming
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const streamAbortRef = useRef(null);

  // Modal
  const [modal, setModal] = useState({ type: null });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);
  const [pendingNewChat, setPendingNewChat] = useState(false);

  // Error
  const [error, setError] = useState(null);

  /* ── Derived ──────────────────────────────────────────────── */
  const isReadonly = viewingConvId !== activeConvId || !activeConvId;
  const displayedAgent = viewingConvId === activeConvId ? activeAgent : viewingMeta;

  /* ── Data fetching ────────────────────────────────────────── */
  const fetchConvids = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/'); return; }
      const res = await getConvoids();
      const all = res.convid_list || [];
      const cur = localStorage.getItem('uniqueId');
      const reordered = cur && all.includes(cur)
        ? [cur, ...all.filter((id) => id !== cur)]
        : all;
      setConvids(reordered);
    } catch {
      // no-op, network errors surfaced via modal on action
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

  /* ── Initialisation ───────────────────────────────────────── */
  useEffect(() => {
    fetchConvids();
    fetchAvailableAgents();
    const savedMessages = localStorage.getItem('chatMessages');
    const savedConvId = localStorage.getItem('conversationId');
    const savedUniqueId = localStorage.getItem('uniqueId');
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

  // Persist messages
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  /* ── Load a conversation from history ─────────────────────── */
  const loadConversation = async (convId) => {
    try {
      const res = await getChat(convId);
      const msgs = (res.chat || []).map((m) => ({ sender: m.sender, text: m.message }));
      setChatMessages(msgs);
      setChatStarted(true);
      setViewingConvId(convId);
      const meta = res.meta?.agent_name
        ? { agent_id: res.meta.agent_id, display_name: res.meta.agent_name, theme_key: res.meta.agent_persona || 'default' }
        : null;
      setViewingMeta(meta);
      if (meta) {
        setSessionMeta((prev) => ({
          ...prev,
          [convId]: { agentName: meta.display_name, agentId: meta.agent_id },
        }));
      }
      localStorage.setItem('conversationId', convId);
    } catch {
      setModal({ type: 'error', message: 'Failed to load chat. Please try again.' });
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

  /* ── New / End chat ───────────────────────────────────────── */
  const handleNewChatClick = () => {
    if (activeConvId) {
      setPendingNewChat(true);
      setRating(0);
      setHoverRating(0);
      setModal({ type: 'endChat' });
      return;
    }
    setChatStarted(false);
    setChatMessages([]);
    setViewingConvId(null);
  };

  const startNewChat = async () => {
    if (!selectedAgentId) {
      setModal({ type: 'error', message: 'Choose an agent before starting a chat.' });
      return;
    }
    const newId = nanoid(6);
    localStorage.setItem('uniqueId', newId);
    localStorage.setItem('conversationId', newId);
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
      setChatMessages([{ sender: 'bot', text: res.opener, timestamp: Date.now() }]);
      setSessionMeta((prev) => ({
        ...prev,
        [newId]: { agentName: res.agent.display_name, agentId: res.agent.agent_id },
      }));
      await fetchConvids();
    } catch {
      clearActiveAgent();
      setModal({ type: 'error', message: 'Failed to start a new chat.' });
    }
  };

  const handleEndChat = () => {
    setRating(0);
    setHoverRating(0);
    setPendingNewChat(false);
    setModal({ type: 'endChat' });
  };

  const submitEndChat = async (ratingValue) => {
    setModalLoading(true);
    const convId = activeConvId || localStorage.getItem('uniqueId');
    try {
      await endChat(convId, String(ratingValue));
    } catch {
      // ignore end-chat failures
    }
    setModalLoading(false);
    closeModal();
    localStorage.removeItem('uniqueId');
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('conversationId');
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

  /* ── Send message ─────────────────────────────────────────── */
  const handleSend = async () => {
    if (!inputValue.trim() || isReadonly || !agentConnection?.public_base_url) return;
    const text = inputValue;
    const now = Date.now();
    setChatMessages((prev) => [...prev, { sender: 'user', text, timestamp: now }]);
    setInputValue('');
    setIsBotTyping(true);
    if (streamAbortRef.current) streamAbortRef.current.abort();
    setChatMessages((prev) => [...prev, { sender: 'bot', text: '', timestamp: Date.now() }]);

    const controller = sendMessageToAgent({
      baseUrl: agentConnection.public_base_url,
      sendPath: agentConnection.send_path,
      sessionToken: agentConnection.session_token,
      message: text,
      onChunk: (chunk) => {
        setChatMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.sender === 'bot') {
            return [...prev.slice(0, -1), { ...last, text: last.text + chunk }];
          }
          return [...prev, { sender: 'bot', text: chunk }];
        });
      },
      onError: (err) => {
        setIsBotTyping(false);
        streamAbortRef.current = null;
        setChatMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.sender === 'bot' && !last.text) return prev.slice(0, -1);
          return prev;
        });
        if (err.name !== 'AbortError') {
          setModal({ type: 'error', message: 'Failed to send message to the selected agent.' });
        }
      },
      onDone: () => {
        setIsBotTyping(false);
        streamAbortRef.current = null;
      },
    });
    streamAbortRef.current = controller;
  };

  const handleStopStreaming = () => streamAbortRef.current?.abort();

  /* ── Modal helpers ────────────────────────────────────────── */
  const closeModal = () => setModal({ type: null });

  /* ── Session label helper ─────────────────────────────────── */
  const getSessionLabel = (convId, idx) => {
    if (convId === activeConvId) return 'Current Chat';
    const cached = sessionMeta[convId];
    if (cached?.agentName) return `Chat with ${cached.agentName}`;
    return `Session ${convids.length - idx}`;
  };

  return {
    // Data
    convids,
    sessionMeta,
    availableAgents,
    chatMessages,
    isBotTyping,
    chatStarted,
    displayedAgent,
    isReadonly,
    activeConvId,
    viewingConvId,

    // Agent selection
    selectedAgentId,
    setSelectedAgentId,

    // Input
    inputValue,
    setInputValue,
    handleSend,
    handleStopStreaming,
    streamAbortRef,

    // Navigation
    handleHistoryClick,
    handleBackToCurrentChat,
    handleNewChatClick,
    startNewChat,
    getSessionLabel,

    // End chat
    handleEndChat,
    submitEndChat,

    // Modal
    modal,
    closeModal,
    rating,
    setRating,
    hoverRating,
    setHoverRating,
    modalLoading,
    pendingNewChat,

    error,
  };
}
