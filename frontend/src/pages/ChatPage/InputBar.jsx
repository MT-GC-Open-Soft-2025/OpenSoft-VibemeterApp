/**
 * InputBar — message input area with send/stop buttons.
 */
import React, { useEffect, useRef } from 'react';
import { IconSend, IconStop } from '../../components/icons/icons';

const GRADIENT = 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)';

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
  onBackToCurrentChat,
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
    <div className="flex-shrink-0 px-5 pb-4 pt-3 flex flex-col items-center gap-1.5 border-t border-[hsl(var(--border))] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
      {isReadonly && chatStarted ? (
        <div className="w-full max-w-[780px] px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-800 text-[0.83rem] text-center">
          This is a read-only conversation.{' '}
          {isActive && onBackToCurrentChat && (
            <button
              className="font-semibold text-teal-700 underline cursor-pointer bg-transparent border-none hover:text-sky-700"
              onClick={onBackToCurrentChat}
            >
              Go to current chat
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-end gap-2 w-full max-w-[780px] bg-slate-50 border border-[hsl(var(--border))] rounded-[18px] px-4 py-2.5 pl-[18px] transition-all focus-within:border-teal-500/45 focus-within:shadow-[0_0_0_3px_rgba(15,118,110,0.08)] focus-within:bg-white">
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-[hsl(var(--foreground))] text-[0.95rem] leading-[1.6] resize-none min-h-[24px] max-h-[180px] overflow-y-auto [scrollbar-width:thin] placeholder:text-slate-400"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isReadonly || !chatStarted}
            rows={1}
            aria-label="Message input"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isBotTyping && streamAbortRef?.current && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-red-50 border border-red-200 text-red-600 text-[0.78rem] font-semibold cursor-pointer transition-colors hover:bg-red-100 whitespace-nowrap"
                onClick={onStop}
                title="Stop generating"
              >
                <IconStop /> Stop
              </button>
            )}
            <button
              className={`w-[38px] h-[38px] rounded-[12px] border-none flex items-center justify-center cursor-pointer transition-all flex-shrink-0
                ${canSend
                  ? 'text-white hover:brightness-110 hover:scale-105'
                  : 'bg-[hsl(var(--border))] text-slate-400 cursor-not-allowed'
                }`}
              style={canSend ? { background: GRADIENT, boxShadow: '0 4px 14px rgba(15,118,110,0.35)' } : {}}
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send"
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}
      <p className="text-[0.72rem] text-slate-400 text-center m-0">
        WellBee agents can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};

export default InputBar;
