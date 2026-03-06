/**
 * InputBar — message input area with send/stop buttons.
 */
import React, { useEffect, useRef } from 'react';
import { IconSend, IconStop } from '../../components/icons/icons';

const InputBar = ({
  inputValue,
  setInputValue,
  onSend,
  onStop,
  isBotTyping,
  streamAbortRef,
  isReadonly,
  chatStarted,
  displayedAgent,
  isActive,
}) => {
  const inputRef = useRef(null);

  /* Auto-resize textarea */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 180)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const placeholder = displayedAgent?.display_name
    ? `Message ${displayedAgent.display_name}… (Shift+Enter for new line)`
    : 'Select an agent to begin';

  const canSend = inputValue.trim() && !isReadonly && chatStarted;

  return (
    <div className="cp-input-area">
      {isReadonly && chatStarted ? (
        <div className="cp-input-readonly-notice">
          This is a read-only conversation.{' '}
          {isActive && (
            <button className="cp-inline-link" onClick={() => {}}>
              Go to current chat
            </button>
          )}
        </div>
      ) : (
        <div className="cp-input-box">
          <textarea
            ref={inputRef}
            className="cp-input"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isReadonly || !chatStarted}
            rows={1}
            aria-label="Message input"
          />
          <div className="cp-input-actions">
            {isBotTyping && streamAbortRef?.current && (
              <button className="cp-stop-btn" onClick={onStop} title="Stop generating">
                <IconStop /> Stop
              </button>
            )}
            <button
              className={`cp-send-btn ${canSend ? 'cp-send-active' : 'cp-send-disabled'}`}
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send"
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}
      <p className="cp-disclaimer">
        WellBee agents can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};

export default InputBar;
