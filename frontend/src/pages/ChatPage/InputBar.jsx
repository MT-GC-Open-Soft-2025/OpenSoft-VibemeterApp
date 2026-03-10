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
    : chatStarted
      ? 'Type a message…'
      : 'Choose an agent above to get started';

  const canSend = !!(inputValue.trim() && !isReadonly && chatStarted && !isBotTyping);

  return (
    <div className="flex-shrink-0 px-5 pb-5 pt-3 flex flex-col items-center gap-2 border-t border-[hsl(var(--border))] bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">

      {isReadonly && chatStarted ? (
        <div className="w-full max-w-[800px] flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-[0.83rem]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="flex-shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Read-only conversation.</span>
          {isActive && onBackToCurrentChat && (
            <button
              className="ml-auto font-semibold text-teal-700 underline cursor-pointer bg-transparent border-none hover:text-sky-700 whitespace-nowrap"
              onClick={onBackToCurrentChat}
            >
              Return to current chat →
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-end gap-2.5 w-full max-w-[800px] bg-white border border-[hsl(var(--border))] rounded-2xl px-4 py-2.5 pl-5 transition-all shadow-[0_1px_4px_rgba(0,0,0,0.04)] focus-within:border-teal-400/60 focus-within:shadow-[0_0_0_3px_rgba(15,118,110,0.08),0_2px_8px_rgba(0,0,0,0.06)]">
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-[hsl(var(--foreground))] text-[0.93rem] leading-[1.6] resize-none min-h-[26px] max-h-[180px] overflow-y-auto [scrollbar-width:thin] placeholder:text-slate-400"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isReadonly || !chatStarted}
            rows={1}
            aria-label="Message input"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
            {isBotTyping && streamAbortRef?.current && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[0.78rem] font-semibold cursor-pointer transition-colors hover:bg-red-100 whitespace-nowrap"
                onClick={onStop}
                title="Stop generating"
              >
                <IconStop /> Stop
              </button>
            )}
            <button
              className={`w-[38px] h-[38px] rounded-[14px] border-none flex items-center justify-center cursor-pointer transition-all flex-shrink-0
                ${canSend
                  ? 'text-white hover:brightness-110 hover:scale-105 active:scale-95'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              style={canSend ? { background: GRADIENT, boxShadow: '0 4px 14px rgba(15,118,110,0.32)' } : {}}
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send"
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}

      <p className="text-[0.7rem] text-slate-400 text-center m-0">
        WellBee agents can make mistakes. Consider verifying important information.
      </p>
    </div>
  );
};

export default InputBar;
