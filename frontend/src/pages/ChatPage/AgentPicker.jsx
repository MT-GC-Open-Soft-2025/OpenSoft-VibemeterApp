/**
 * AgentPicker — welcome screen displayed when no chat is active.
 * Shows agent cards + start button.
 */
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../Assets/animation.json';

const GRADIENT = 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)';

/* Maps agent name keywords to emoji + color theme */
const AGENT_THEMES = [
  { key: ['spark'],   emoji: '⚡', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  { key: ['calm','zen','peace'],  emoji: '🌿', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { key: ['focus','clarity'],     emoji: '🎯', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
  { key: ['mind','think','brain'],emoji: '🧠', color: '#0369a1', bg: '#eff6ff', border: '#bfdbfe' },
  { key: ['energy','boost','fire'],emoji:'🔥', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  { key: ['joy','happy','cheer'], emoji: '😊', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { key: ['balance','harmony'],   emoji: '⚖️', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { key: ['sleep','rest'],        emoji: '🌙', color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  { key: ['breath','breathe'],    emoji: '🫁', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  { key: ['move','active','fit'], emoji: '🏃', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
];

const DEFAULT_THEME = { emoji: '💬', color: '#0f766e', bg: '#f0fdfa', border: '#99f6e4' };

function getAgentTheme(name = '') {
  const lower = name.toLowerCase();
  for (const theme of AGENT_THEMES) {
    if (theme.key.some((k) => lower.includes(k))) return theme;
  }
  return DEFAULT_THEME;
}

const AgentPicker = ({ availableAgents, selectedAgentId, onSelectAgent, onStart }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto bg-slate-50/60">

    {/* Hero */}
    <div className="flex flex-col items-center mb-8">
      <div className="mb-4" style={{ filter: 'drop-shadow(0 0 28px rgba(15,118,110,0.2))' }}>
        <Lottie animationData={animationData} loop style={{ width: 88, height: 88 }} />
      </div>
      <h2 className="text-[clamp(1.35rem,3vw,1.85rem)] font-extrabold text-[hsl(var(--foreground))] text-center mb-2 tracking-tight">
        Who do you want to talk to?
      </h2>
      <p className="text-[0.92rem] text-[hsl(var(--muted-foreground))] text-center leading-[1.65] max-w-[400px]">
        Each agent is a different vibe — pick the one that fits your mood right now.
      </p>
    </div>

    {/* Agent cards */}
    <div
      className="grid gap-3.5 mb-7 w-full"
      style={{ maxWidth: 820, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
    >
      {availableAgents.map((agent) => {
        const isSelected = selectedAgentId === agent.agent_id;
        const theme = getAgentTheme(agent.display_name);
        return (
          <button
            key={agent.agent_id}
            onClick={() => onSelectAgent(agent.agent_id)}
            className={`relative text-left rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer overflow-hidden group
              ${isSelected
                ? 'shadow-[0_0_0_3px_rgba(15,118,110,0.15),0_8px_28px_rgba(15,118,110,0.14)]'
                : 'bg-white hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]'
              }`}
            style={{
              borderColor: isSelected ? theme.color : '#e2e8f0',
              backgroundColor: isSelected ? theme.bg : 'white',
            }}
          >
            {/* Emoji avatar */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[1.35rem] mb-3 transition-transform duration-200 group-hover:scale-110"
              style={{ background: isSelected ? theme.bg : '#f8fafc', border: `1.5px solid ${theme.border}` }}
            >
              {theme.emoji}
            </div>

            <span className="block text-[1rem] font-bold mb-1.5 transition-colors"
              style={{ color: isSelected ? theme.color : 'hsl(var(--foreground))' }}>
              {agent.display_name}
            </span>
            <span className="block text-[0.85rem] text-[hsl(var(--muted-foreground))] leading-[1.5]">
              {agent.description}
            </span>

            {/* Selected checkmark */}
            {isSelected && (
              <div
                className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: theme.color }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="11" height="11">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>

    {availableAgents.length === 0 && (
      <p className="text-[0.92rem] text-[hsl(var(--muted-foreground))] mb-6">
        No agents available right now. Please try again later.
      </p>
    )}

    {/* Start button */}
    <button
      onClick={onStart}
      disabled={!selectedAgentId || availableAgents.length === 0}
      className="flex items-center gap-2 px-8 py-3.5 rounded-full border-none text-white text-[0.95rem] font-bold cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
      style={{ background: GRADIENT, boxShadow: selectedAgentId ? '0 6px 24px rgba(15,118,110,0.32)' : 'none' }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
        <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Start conversation
    </button>

    <p className="mt-4 text-[0.72rem] text-slate-400 text-center">
      Your conversation is private and encrypted
    </p>
  </div>
);

export default AgentPicker;
