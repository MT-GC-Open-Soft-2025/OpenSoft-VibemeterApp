/**
 * AgentPicker — welcome screen displayed when no chat is active.
 * Shows agent cards + start button.
 */
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../Assets/animation.json';
import { IconPlus } from '../../components/icons/icons';

const GRADIENT = 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)';

const AgentPicker = ({ availableAgents, selectedAgentId, onSelectAgent, onStart }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
    <div className="mb-6" style={{ filter: 'drop-shadow(0 0 32px rgba(15,118,110,0.18))' }}>
      <Lottie animationData={animationData} loop style={{ width: 100, height: 100 }} />
    </div>

    <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold text-[hsl(var(--foreground))] text-center mb-3 tracking-tight">
      Pick the agent you want to talk to
    </h2>
    <p className="text-[0.95rem] text-[hsl(var(--muted-foreground))] text-center leading-[1.7] mb-8 max-w-[420px]">
      Each channel supports the same goals, but they open the conversation with a different style.
    </p>

    <div
      className="grid gap-4 mb-6 w-full"
      style={{
        maxWidth: 840,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}
    >
      {availableAgents.map((agent) => {
        const isSelected = selectedAgentId === agent.agent_id;
        return (
          <button
            key={agent.agent_id}
            onClick={() => onSelectAgent(agent.agent_id)}
            className={`relative text-left rounded-[20px] p-6 min-h-[140px] border transition-all duration-200 cursor-pointer overflow-hidden
              ${isSelected
                ? 'border-[hsl(var(--primary))] shadow-[0_0_0_4px_hsl(var(--primary)/0.1),0_12px_30px_hsl(var(--primary)/0.12)]'
                : 'border-[hsl(var(--border))] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,118,110,0.08)] hover:border-[hsl(var(--primary)/0.3)]'
              }`}
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-[20px] transition-all duration-200"
              style={{ background: isSelected ? GRADIENT : 'hsl(var(--border))' }}
            />
            <span className="block text-[1.05rem] font-bold text-[hsl(var(--foreground))] mb-2.5">
              {agent.display_name}
            </span>
            <span className="block text-[0.92rem] text-[hsl(var(--muted-foreground))] leading-[1.5]">
              {agent.description}
            </span>
          </button>
        );
      })}
    </div>

    {availableAgents.length === 0 && (
      <p className="text-[0.95rem] text-[hsl(var(--muted-foreground))] mb-5">
        No agents are available right now.
      </p>
    )}

    <button
      onClick={onStart}
      disabled={!selectedAgentId || availableAgents.length === 0}
      className="flex items-center gap-2 px-8 py-3.5 rounded-full border-none text-white text-[0.95rem] font-bold cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 hover:-translate-y-0.5"
      style={{
        background: GRADIENT,
        boxShadow: '0 6px 24px rgba(15,118,110,0.3)',
      }}
    >
      <IconPlus style={{ width: 16, height: 16 }} />
      Start a conversation
    </button>
  </div>
);

export default AgentPicker;
