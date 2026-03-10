import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';
import { useChat } from '@/hooks/useChat';
import { IconMenu, IconLock } from '@/components/icons/icons';
import ChatSidebar from './ChatSidebar';
import AgentPicker from './AgentPicker';
import MessageList from './MessageList';
import InputBar from './InputBar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ChatPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatHistoryRef = useRef(null);

  const chat = useChat();

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chat.chatMessages, chat.isBotTyping]);

  /* ── Modal content ─────────────────────────────────────── */
  const renderDialogContent = () => {
    if (chat.modal.type === 'error') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Something went wrong</DialogTitle>
            <DialogDescription>{chat.modal.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={chat.closeModal}>Close</Button>
          </DialogFooter>
        </>
      );
    }

    if (chat.modal.type === 'endChat') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>{chat.pendingNewChat ? 'End chat & start new?' : 'End this chat?'}</DialogTitle>
            <DialogDescription>
              {chat.pendingNewChat
                ? 'You have an active conversation. Please end it before starting a new one. Rate your experience below (optional).'
                : 'This will close your current conversation. You can still read it from history afterwards.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm font-semibold text-foreground mb-3">Rate your experience</p>
            <div className="cp-star-row" role="radiogroup" aria-label="Chat rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`cp-star ${star <= (chat.hoverRating || chat.rating) ? 'cp-star-lit' : ''}`}
                  onMouseEnter={() => chat.setHoverRating(star)}
                  onMouseLeave={() => chat.setHoverRating(0)}
                  onClick={() => chat.setRating(star)}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
            {chat.modalLoading && (
              <p className="text-sm text-muted-foreground mt-3 text-center">Ending chat…</p>
            )}
          </div>

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={chat.closeModal} disabled={chat.modalLoading}>
              Cancel
            </Button>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => chat.submitEndChat(0)} disabled={chat.modalLoading}>
              Skip &amp; End
            </Button>
            <Button
              onClick={() => chat.submitEndChat(chat.rating)}
              disabled={chat.modalLoading || chat.rating === 0}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
            >
              {chat.pendingNewChat ? 'End & Start New' : 'Submit & End'}
            </Button>
          </DialogFooter>
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

        {/* Dialog (replaces Bootstrap Modal) */}
        <Dialog open={chat.modal.type !== null} onOpenChange={(open) => !open && chat.closeModal()}>
          <DialogContent className="sm:max-w-md">
            {renderDialogContent()}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ChatPage;
