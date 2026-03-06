/**
 * MessageList — scrollable message history + typing indicator.
 */
import React, { useEffect, useRef } from 'react';
import Markdown from 'markdown-to-jsx';

const MessageList = ({ messages, isBotTyping, displayedAgent, chatHistoryRef }) => {
  return (
    <div className="cp-messages" ref={chatHistoryRef}>
      {messages.map((msg, idx) => {
        if (msg.sender === 'bot' && !msg.text.trim() && isBotTyping) return null;
        return (
          <div
            key={idx}
            className={`cp-msg-row ${msg.sender === 'bot' ? 'cp-msg-bot' : 'cp-msg-user'}`}
          >
            {msg.sender === 'bot' && (
              <div className="cp-avatar" aria-hidden="true">
                {displayedAgent?.display_name?.[0] || 'W'}
              </div>
            )}
            <div className={`cp-bubble ${msg.sender === 'bot' ? 'cp-bubble-bot' : 'cp-bubble-user'}`}>
              <Markdown>{msg.text}</Markdown>
            </div>
          </div>
        );
      })}

      {isBotTyping && (
        <div className="cp-msg-row cp-msg-bot">
          <div className="cp-avatar" aria-hidden="true">
            {displayedAgent?.display_name?.[0] || 'W'}
          </div>
          <div className="cp-bubble cp-bubble-bot cp-typing" aria-label="WellBee is typing">
            <span /><span /><span />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
