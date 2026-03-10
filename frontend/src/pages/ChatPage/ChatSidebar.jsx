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
      width: sidebarOpen ? 260 : 60,
      background: GRADIENT,
      boxShadow: '4px 0 24px rgba(15,118,110,0.18)',
    }}
  >
    {/* Decorative circles */}
    <div
      className="pointer-events-none absolute rounded-full"
      style={{ top: -80, right: -60, width: 220, height: 220, background: 'rgba(255,255,255,0.07)' }}
    />
    <div
      className="pointer-events-none absolute rounded-full"
      style={{ bottom: -100, left: -40, width: 260, height: 260, background: 'rgba(255,255,255,0.05)' }}
    />

    {/* All children above decorative circles */}
    <div className="relative z-10 flex flex-col h-full">

      {/* Brand row */}
      <div className="flex items-center gap-2.5 px-3 py-3.5 border-b border-white/15 min-h-[60px] flex-shrink-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center overflow-hidden bg-white/18">
          <Lottie animationData={animationData} loop style={{ width: 36, height: 36 }} />
        </div>
        {sidebarOpen && (
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-[0.95rem] font-bold text-white whitespace-nowrap tracking-tight">WellBee</span>
            <span className="text-[0.68rem] text-white/60 whitespace-nowrap">Multi-Agent Chat</span>
          </div>
        )}
        <button
          className="flex-shrink-0 flex items-center justify-center p-1.5 rounded-lg bg-transparent border-none text-white/65 cursor-pointer transition-colors hover:bg-white/15 hover:text-white ml-auto"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          <IconMenu />
        </button>
      </div>

      {/* New Chat */}
      <button
        className={`flex items-center gap-2.5 border border-white/35 bg-white/12 text-white text-[0.88rem] font-semibold cursor-pointer rounded-xl transition-colors hover:bg-white/22 hover:border-white/55 flex-shrink-0 backdrop-blur-sm whitespace-nowrap overflow-hidden ${sidebarOpen ? 'mx-2.5 my-3 px-3.5 py-2.5' : 'mx-2 mt-3 mb-2 px-2.5 py-2.5 justify-center'}`}
        onClick={onNewChat}
        title="New Chat"
      >
        <IconPlus />
        {sidebarOpen && <span>New Chat</span>}
      </button>

      {/* Conversations */}
      <div className="flex-1 flex flex-col overflow-hidden px-1.5">
        {sidebarOpen && (
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.09em] text-white/45 px-2 pt-2.5 pb-1">
            Conversations
          </span>
        )}
        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 py-0.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
          {convids.length === 0 && sidebarOpen && (
            <div className="text-[0.78rem] text-white/40 px-2.5 py-3 text-center">No conversations yet</div>
          )}
          {convids.map((convId, idx) => {
            const isActive  = convId === activeConvId;
            const isViewing = convId === viewingConvId;
            return (
              <button
                key={convId}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] border-none text-[0.85rem] font-medium cursor-pointer text-left w-full transition-all overflow-hidden relative
                  ${isViewing ? 'bg-white/16 text-white' : 'bg-transparent text-white/70 hover:bg-white/15 hover:text-white hover:translate-x-0.5'}
                  ${!sidebarOpen ? 'justify-center px-2' : ''}`}
                onClick={() => onHistoryClick(convId)}
                title={getSessionLabel(convId, idx)}
              >
                <span className="flex-shrink-0 flex items-center opacity-80"><IconMessage /></span>
                {sidebarOpen && (
                  <span className={`flex-1 min-w-0 truncate ${isActive ? 'text-white font-bold' : ''}`}>
                    {getSessionLabel(convId, idx)}
                  </span>
                )}
                {isActive && (
                  <span className="w-[7px] h-[7px] rounded-full bg-emerald-300 flex-shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-1.5 pb-3.5 pt-2 border-t border-white/15 flex flex-col gap-0.5 flex-shrink-0">
        <button
          className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] border-none bg-transparent text-white/65 text-[0.85rem] font-medium cursor-pointer w-full transition-colors hover:bg-white/12 hover:text-white whitespace-nowrap overflow-hidden ${!sidebarOpen ? 'justify-center' : ''}`}
          onClick={onNavigateHome}
          title="Dashboard"
        >
          <IconHome />
          {sidebarOpen && <span>Dashboard</span>}
        </button>
        {sidebarOpen && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[0.7rem] text-white/30 whitespace-nowrap overflow-hidden">
            <IconLock />
            <span>Private &amp; encrypted</span>
          </div>
        )}
      </div>

    </div>
  </aside>
);

export default ChatSidebar;
