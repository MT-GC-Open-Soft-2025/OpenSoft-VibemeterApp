import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/Button';

const GRADIENT = 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)';

const ChatPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
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
            <p className="text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Rate your experience</p>
            <div className="flex gap-2" role="radiogroup" aria-label="Chat rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  className={`bg-transparent border-none text-[2.2rem] cursor-pointer p-0 leading-none transition-all hover:scale-110 ${star <= (chat.hoverRating || chat.rating) ? 'text-amber-400' : 'text-slate-300'}`}
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
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-3 text-center">Ending chat…</p>
            )}
          </div>

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={chat.closeModal} disabled={chat.modalLoading}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => chat.submitEndChat(0)}
              disabled={chat.modalLoading}
            >
              Skip &amp; End
            </Button>
            <Button
              onClick={() => chat.submitEndChat(chat.rating)}
              disabled={chat.modalLoading || chat.rating === 0}
              style={{ background: GRADIENT }}
              className="text-white hover:brightness-110 border-none"
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-[hsl(var(--foreground))] font-[inherit]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
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

      <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-[64px] flex items-center justify-between px-5 border-b border-[hsl(var(--border))] flex-shrink-0 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className={`flex items-center justify-center w-8 h-8 rounded-lg bg-transparent border-none text-slate-400 cursor-pointer transition-colors hover:bg-slate-100 hover:text-slate-700 flex-shrink-0 ${sidebarOpen ? 'lg:hidden' : ''}`}
              onClick={() => setSidebarOpen(v => !v)}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <IconMenu />
            </button>
            {chat.displayedAgent ? (
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Agent avatar dot */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[0.8rem] font-extrabold flex-shrink-0"
                  style={{ background: GRADIENT }}
                >
                  {chat.displayedAgent.display_name?.[0] || 'W'}
                </div>
                <div className="min-w-0">
                  <div className="text-[0.95rem] font-semibold text-[hsl(var(--foreground))] leading-tight truncate">
                    {chat.displayedAgent.display_name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-[0.72rem] text-emerald-600 font-medium">Active now</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-[0.95rem] font-semibold text-[hsl(var(--foreground))]">
                {chat.viewingConvId ? 'WellBee Chat' : 'Choose Your Agent'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {chat.activeConvId && chat.viewingConvId !== chat.activeConvId && (
              <button
                className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-[0.8rem] font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-colors hover:bg-teal-100 whitespace-nowrap"
                onClick={chat.handleBackToCurrentChat}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 0 1 0 12h-3"/></svg>
                Back to chat
              </button>
            )}
            {chat.chatStarted && chat.activeConvId && chat.viewingConvId === chat.activeConvId && (
              <button
                className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-[0.8rem] font-semibold px-3.5 py-1.5 rounded-full cursor-pointer transition-colors hover:bg-red-100 whitespace-nowrap"
                onClick={chat.handleEndChat}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><path d="M18 6L6 18M6 6l12 12"/></svg>
                End Chat
              </button>
            )}
          </div>
        </header>

        {/* Read-only banner */}
        {chat.viewingConvId && chat.viewingConvId !== chat.activeConvId && chat.chatStarted && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-amber-50/70 border-b border-amber-200 text-amber-800 text-[0.82rem] font-medium flex-shrink-0">
            <IconLock />
            <span>Read-only — this is a past conversation.</span>
            {chat.activeConvId && (
              <button
                className="ml-auto bg-transparent border-none text-teal-700 text-[0.82rem] font-semibold cursor-pointer underline hover:text-sky-700"
                onClick={chat.handleBackToCurrentChat}
              >
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
          onBackToCurrentChat={chat.handleBackToCurrentChat}
        />

        {/* Dialog */}
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
