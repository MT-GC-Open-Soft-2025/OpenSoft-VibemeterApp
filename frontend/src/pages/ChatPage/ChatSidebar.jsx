/**
 * ChatSidebar — left nav panel with brand, new-chat button, and conversation list.
 */
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../Assets/animation.json';
import { IconMenu, IconPlus, IconMessage, IconHome, IconLock } from '../../components/icons/icons';

const GRADIENT = 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)';

const ChatSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  convids,
  activeConvId,
  viewingConvId,
  onNewChat,
  onHistoryClick,
  onNavigateHome,
  getSessionLabel,
}) => (
  <aside
    className="relative flex flex-col flex-shrink-0 h-screen overflow-hidden transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
    style={{
      width: sidebarOpen ? 264 : 60,
      background: GRADIENT,
      boxShadow: '4px 0 24px rgba(15,118,110,0.2)',
    }}
  >
    {/* Decorative blobs */}
    <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/[0.06]" />
    <div className="pointer-events-none absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-white/[0.04]" />

    <div className="relative z-10 flex flex-col h-full">

      {/* Brand row */}
      <div className={`flex items-center border-b border-white/15 min-h-[64px] flex-shrink-0 ${sidebarOpen ? 'px-3.5 py-3 gap-2.5' : 'px-2 py-3 justify-center'}`}>
        <div className="flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center overflow-hidden bg-white/18">
          <Lottie animationData={animationData} loop style={{ width: 36, height: 36 }} />
        </div>
        {sidebarOpen && (
          <div className="flex-1 min-w-0">
            <span className="block text-[0.95rem] font-bold text-white whitespace-nowrap tracking-tight leading-tight">WellBee</span>
            <span className="block text-[0.68rem] text-white/55 whitespace-nowrap leading-tight">Multi-Agent Chat</span>
          </div>
        )}
        <button
          className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-transparent border-none text-white/55 cursor-pointer transition-colors hover:bg-white/15 hover:text-white"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          <IconMenu />
        </button>
      </div>

      {/* New Chat button */}
      <div className={sidebarOpen ? 'px-3 pt-3 pb-1' : 'px-2 pt-3 pb-1'}>
        <button
          className={`flex items-center gap-2 border border-white/35 bg-white/12 text-white text-[0.85rem] font-semibold cursor-pointer rounded-xl transition-all hover:bg-white/22 hover:border-white/55 backdrop-blur-sm whitespace-nowrap overflow-hidden w-full
            ${sidebarOpen ? 'px-3.5 py-2.5 justify-start' : 'px-2.5 py-2.5 justify-center'}`}
          onClick={onNewChat}
          title="New Chat"
        >
          <IconPlus />
          {sidebarOpen && <span>New Chat</span>}
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 flex flex-col overflow-hidden px-2 pt-1">
        {sidebarOpen && convids.length > 0 && (
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/40 px-1.5 pt-2 pb-1.5">
            Conversations
          </span>
        )}
        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 py-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
          {convids.length === 0 && sidebarOpen && (
            <div className="flex flex-col items-center gap-2 py-8 px-3 text-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <IconMessage />
              </div>
              <span className="text-[0.78rem] text-white/45 leading-snug">No conversations yet.<br/>Start a new chat!</span>
            </div>
          )}
          {convids.map((convId, idx) => {
            const isActive  = convId === activeConvId;
            const isViewing = convId === viewingConvId;
            const label = getSessionLabel(convId, idx);
            return (
              <button
                key={convId}
                className={`flex items-center gap-2 py-2 rounded-[10px] border-none text-[0.83rem] font-medium cursor-pointer text-left w-full transition-all overflow-hidden
                  ${isViewing
                    ? 'bg-white/18 text-white'
                    : 'bg-transparent text-white/65 hover:bg-white/12 hover:text-white'
                  }
                  ${sidebarOpen ? 'px-2.5' : 'px-2 justify-center'}`}
                onClick={() => onHistoryClick(convId)}
                title={label}
              >
                {/* Icon */}
                <span className={`flex-shrink-0 flex items-center ${isActive ? 'text-emerald-300' : 'text-white/50'}`}>
                  <IconMessage />
                </span>

                {sidebarOpen && (
                  <span className={`flex-1 min-w-0 truncate ${isViewing ? 'font-semibold' : ''}`}>
                    {label}
                  </span>
                )}

                {/* Active pulse dot */}
                {isActive && sidebarOpen && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className={`pb-4 pt-2 border-t border-white/15 flex flex-col gap-0.5 flex-shrink-0 ${sidebarOpen ? 'px-2' : 'px-1.5'}`}>
        <button
          className={`flex items-center gap-2 py-2.5 rounded-[10px] border-none bg-transparent text-white/60 text-[0.83rem] font-medium cursor-pointer w-full transition-colors hover:bg-white/12 hover:text-white whitespace-nowrap overflow-hidden
            ${sidebarOpen ? 'px-2.5' : 'px-2 justify-center'}`}
          onClick={onNavigateHome}
          title="Dashboard"
        >
          <IconHome />
          {sidebarOpen && <span>Dashboard</span>}
        </button>
        {sidebarOpen && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[0.68rem] text-white/30 whitespace-nowrap overflow-hidden">
            <IconLock />
            <span>Private &amp; encrypted</span>
          </div>
        )}
      </div>

    </div>
  </aside>
);

export default ChatSidebar;
