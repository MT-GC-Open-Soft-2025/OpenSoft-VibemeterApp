/**
 * ChatSidebar — left nav panel with brand, new-chat button, and conversation list.
 */
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../Assets/animation.json';
import { IconMenu, IconPlus, IconMessage, IconHome, IconLock } from '../../components/icons/icons';

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
  <aside className={`cp-sidebar ${sidebarOpen ? 'cp-sidebar-open' : 'cp-sidebar-closed'}`}>
    {/* Brand row */}
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
      <button
        className="cp-toggle-btn"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        <IconMenu />
      </button>
    </div>

    {/* New Chat */}
    <button className="cp-new-btn" onClick={onNewChat} title="New Chat">
      <IconPlus />
      {sidebarOpen && <span>New Chat</span>}
    </button>

    {/* Conversations */}
    <div className="cp-conv-section">
      {sidebarOpen && <span className="cp-conv-label">Conversations</span>}
      <div className="cp-conv-list">
        {convids.length === 0 && sidebarOpen && (
          <div className="cp-conv-empty">No conversations yet</div>
        )}
        {convids.map((convId, idx) => {
          const isActive  = convId === activeConvId;
          const isViewing = convId === viewingConvId;
          return (
            <button
              key={convId}
              className={`cp-conv-item ${isViewing ? 'cp-conv-viewing' : ''} ${isActive ? 'cp-conv-active' : ''}`}
              onClick={() => onHistoryClick(convId)}
              title={getSessionLabel(convId, idx)}
            >
              <span className="cp-conv-ico"><IconMessage /></span>
              {sidebarOpen && (
                <span className="cp-conv-label-text">{getSessionLabel(convId, idx)}</span>
              )}
              {isActive && <span className="cp-live-dot" />}
            </button>
          );
        })}
      </div>
    </div>

    {/* Bottom */}
    <div className="cp-sidebar-bottom">
      <button className="cp-bottom-btn" onClick={onNavigateHome} title="Dashboard">
        <IconHome />
        {sidebarOpen && <span>Dashboard</span>}
      </button>
      {sidebarOpen && (
        <div className="cp-privacy-row">
          <IconLock />
          <span>Private &amp; encrypted</span>
        </div>
      )}
    </div>
  </aside>
);

export default ChatSidebar;
