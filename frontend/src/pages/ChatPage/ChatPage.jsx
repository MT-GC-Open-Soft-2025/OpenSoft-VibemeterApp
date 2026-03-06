import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import './ChatPage.css';
import { useChat } from '../../hooks/useChat';
import { IconMenu, IconLock } from '../../components/icons/icons';
import ChatSidebar from './ChatSidebar';
import AgentPicker from './AgentPicker';
import MessageList from './MessageList';
import InputBar from './InputBar';

const ChatPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatHistoryRef = useRef(null);

  const chat = useChat();

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chat.chatMessages, chat.isBotTyping]);

  /* ── Modal content ─────────────────────────────────────── */
  const renderModal = () => {
    if (chat.modal.type === 'error') {
      return (
        <>
          <Modal.Header closeButton><Modal.Title>Something went wrong</Modal.Title></Modal.Header>
          <Modal.Body><p className="text-muted mb-0">{chat.modal.message}</p></Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={chat.closeModal}>Close</Button></Modal.Footer>
        </>
      );
    }
    if (chat.modal.type === 'endChat') {
      return (
        <>
          <Modal.Header closeButton>
            <Modal.Title>{chat.pendingNewChat ? 'End chat & start new?' : 'End this chat?'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted mb-4">
              {chat.pendingNewChat
                ? 'You have an active conversation. Please end it before starting a new one. Rate your experience below (optional).'
                : 'This will close your current conversation. You can still read it from history afterwards.'}
            </p>
            <p className="fw-semibold text-dark mb-2">Rate your experience</p>
            <div className="cp-star-row" role="radiogroup" aria-label="Chat rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`cp-star ${star <= (chat.hoverRating || chat.rating) ? 'cp-star-lit' : ''}`}
                  onMouseEnter={() => chat.setHoverRating(star)}
                  onMouseLeave={() => chat.setHoverRating(0)}
                  onClick={() => chat.setRating(star)}
                  aria-label={`${star} star`}
                >★</button>
              ))}
            </div>
            {chat.modalLoading && <p className="text-muted mt-3 text-center small">Ending chat…</p>}
          </Modal.Body>
          <Modal.Footer className="gap-2">
            <Button variant="secondary" onClick={chat.closeModal} disabled={chat.modalLoading}>Cancel</Button>
            <Button variant="outline-danger" onClick={() => chat.submitEndChat(0)} disabled={chat.modalLoading}>
              Skip &amp; End
            </Button>
            <Button
              variant="primary"
              onClick={() => chat.submitEndChat(chat.rating)}
              disabled={chat.modalLoading || chat.rating === 0}
            >
              {chat.pendingNewChat ? 'End & Start New' : 'Submit & End'}
            </Button>
          </Modal.Footer>
        </>
      );
    }
    return null;
  };

  return (
    <div className="cp-root">
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        convids={chat.convids}
        activeConvId={chat.activeConvId}
        viewingConvId={chat.viewingConvId}
        onNewChat={chat.handleNewChatClick}
        onHistoryClick={chat.handleHistoryClick}
        onNavigateHome={() => navigate('/user')}
        getSessionLabel={chat.getSessionLabel}
      />

      <main className="cp-main">
        {/* Topbar */}
        <header className="cp-topbar">
          <div className="cp-topbar-left">
            {!sidebarOpen && (
              <button className="cp-icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <IconMenu />
              </button>
            )}
            <div>
              <span className="cp-topbar-title">
                {chat.displayedAgent?.display_name || (chat.viewingConvId ? 'WellBee Chat' : 'Choose Your Agent')}
              </span>
              {chat.displayedAgent?.agent_id && (
                <div className="cp-agent-subtitle">{chat.displayedAgent.agent_id}</div>
              )}
            </div>
          </div>
          <div className="cp-topbar-right">
            {chat.activeConvId && chat.viewingConvId !== chat.activeConvId && (
              <button className="cp-back-current-btn" onClick={chat.handleBackToCurrentChat}>
                ↩ Current Chat
              </button>
            )}
            {chat.chatStarted && chat.activeConvId && chat.viewingConvId === chat.activeConvId && (
              <button className="cp-end-btn" onClick={chat.handleEndChat}>End Chat</button>
            )}
            <div className="cp-status-row">
              <span className="cp-status-dot" />
              <span className="cp-status-label">
                {chat.displayedAgent?.display_name
                  ? `${chat.displayedAgent.display_name} online`
                  : 'online'}
              </span>
            </div>
          </div>
        </header>

        {/* Read-only banner */}
        {chat.viewingConvId && chat.viewingConvId !== chat.activeConvId && chat.chatStarted && (
          <div className="cp-readonly-banner">
            <IconLock />
            <span>Read-only — this is a past conversation.</span>
            {chat.activeConvId && (
              <button className="cp-readonly-back-btn" onClick={chat.handleBackToCurrentChat}>
                Go to current chat →
              </button>
            )}
          </div>
        )}

        {/* Messages or agent picker */}
        {!chat.chatStarted ? (
          <AgentPicker
            availableAgents={chat.availableAgents}
            selectedAgentId={chat.selectedAgentId}
            onSelectAgent={chat.setSelectedAgentId}
            onStart={chat.startNewChat}
          />
        ) : (
          <MessageList
            messages={chat.chatMessages}
            isBotTyping={chat.isBotTyping}
            displayedAgent={chat.displayedAgent}
            chatHistoryRef={chatHistoryRef}
          />
        )}

        {/* Input */}
        <InputBar
          inputValue={chat.inputValue}
          setInputValue={chat.setInputValue}
          onSend={chat.handleSend}
          onStop={chat.handleStopStreaming}
          isBotTyping={chat.isBotTyping}
          streamAbortRef={chat.streamAbortRef}
          isReadonly={chat.isReadonly}
          chatStarted={chat.chatStarted}
          displayedAgent={chat.displayedAgent}
          isActive={!!chat.activeConvId}
        />

        <Modal show={chat.modal.type !== null} onHide={chat.closeModal} centered>
          {renderModal()}
        </Modal>
      </main>
    </div>
  );
};

export default ChatPage;
