/**
 * AgentPicker — welcome screen displayed when no chat is active.
 * Shows agent cards + start button.
 */
import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../Assets/animation.json';
import { IconPlus } from '../../components/icons/icons';

const AgentPicker = ({ availableAgents, selectedAgentId, onSelectAgent, onStart }) => (
  <div className="cp-welcome">
    <div className="cp-welcome-lottie">
      <Lottie animationData={animationData} loop style={{ width: 100, height: 100 }} />
    </div>
    <h2 className="cp-welcome-title">Pick the agent you want to talk to</h2>
    <p className="cp-welcome-sub">
      Each channel supports the same goals, but they open the conversation with a different style.
    </p>

    <div className="cp-agent-grid">
      {availableAgents.map((agent) => (
        <button
          key={agent.agent_id}
          className={`cp-agent-card ${selectedAgentId === agent.agent_id ? 'cp-agent-card-active' : ''}`}
          onClick={() => onSelectAgent(agent.agent_id)}
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
      onClick={onStart}
      disabled={!selectedAgentId || availableAgents.length === 0}
    >
      <IconPlus style={{ width: 16, height: 16 }} /> Start a conversation
    </button>
  </div>
);

export default AgentPicker;
