/**
 * MessageList — scrollable message history + typing indicator.
 */
import React from 'react';
import Markdown from 'markdown-to-jsx';

const GRADIENT = 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)';

const MessageList = ({ messages, isBotTyping, displayedAgent, chatHistoryRef }) => {
  return (
    <div
      ref={chatHistoryRef}
      className="flex-1 overflow-y-auto flex flex-col py-8 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.1)_transparent]"
    >
      {messages.map((msg, idx) => {
        if (msg.sender === 'bot' && !msg.text.trim() && isBotTyping) return null;
        const isBot = msg.sender === 'bot';
        return (
          <div
            key={idx}
            className={`flex items-start gap-3 px-8 py-4 max-w-[900px] w-full mx-auto box-border ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
          >
            {isBot && (
              <div
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-extrabold"
                aria-hidden="true"
                style={{ background: GRADIENT, boxShadow: '0 2px 10px rgba(15,118,110,0.3)' }}
              >
                {displayedAgent?.display_name?.[0] || 'W'}
              </div>
            )}
            <div
              className={`max-w-[min(640px,80%)] px-[1.15rem] py-[0.8rem] rounded-[18px] text-[0.95rem] leading-[1.7] break-words
                [&_p]:my-0 [&_p]:mb-2 [&_p:last-child]:mb-0
                [&_code]:bg-slate-50 [&_code]:text-teal-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.87em] [&_code]:border [&_code]:border-slate-200
                [&_pre]:bg-slate-50 [&_pre]:border [&_pre]:border-slate-200 [&_pre]:rounded-xl [&_pre]:p-3.5 [&_pre]:overflow-x-auto [&_pre]:my-2.5 [&_pre]:text-[0.87em]
                [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:pl-5 [&_ol]:my-1.5 [&_li]:mb-1
                ${isBot
                  ? 'bg-white text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-[0_2px_12px_rgba(0,0,0,0.06)] rounded-bl-[4px]'
                  : 'text-white rounded-br-[4px] shadow-[0_4px_16px_rgba(15,118,110,0.25)]'
                }`}
              style={!isBot ? { background: GRADIENT } : {}}
            >
              <Markdown>{msg.text}</Markdown>
            </div>
          </div>
        );
      })}

      {isBotTyping && (
        <div className="flex items-start gap-3 px-8 py-4 max-w-[900px] w-full mx-auto">
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-extrabold"
            aria-hidden="true"
            style={{ background: GRADIENT, boxShadow: '0 2px 10px rgba(15,118,110,0.3)' }}
          >
            {displayedAgent?.display_name?.[0] || 'W'}
          </div>
          <div
            className="flex items-center gap-[5px] px-[1.15rem] py-[0.85rem] rounded-[18px] rounded-bl-[4px] bg-white border border-[hsl(var(--border))] shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            aria-label="WellBee is typing"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block w-[7px] h-[7px] rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: `${i * 0.18}s`, animationDuration: '1.4s' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
