/**
 * MessageList — scrollable message history + typing indicator.
 */
import React from 'react';
import Markdown from 'markdown-to-jsx';

const GRADIENT = 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const MessageList = ({ messages, isBotTyping, displayedAgent, chatHistoryRef }) => {
  return (
    <div
      ref={chatHistoryRef}
      className="flex-1 overflow-y-auto flex flex-col py-6 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.1)_transparent]"
    >
      {messages.map((msg, idx) => {
        if (msg.sender === 'bot' && !msg.text.trim() && isBotTyping) return null;
        const isBot = msg.sender === 'bot';

        /* Group: suppress avatar/time if same sender as previous */
        const prev = messages[idx - 1];
        const isFirst = !prev || prev.sender !== msg.sender;

        return (
          <div
            key={idx}
            className={`flex items-end gap-2.5 px-6 md:px-10 max-w-[860px] w-full mx-auto box-border
              ${isBot ? 'flex-row' : 'flex-row-reverse'}
              ${isFirst ? 'mt-4' : 'mt-1'}
            `}
          >
            {/* Bot avatar — only on first in a group */}
            {isBot && (
              <div className={`flex-shrink-0 mb-1 ${isFirst ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[0.75rem] font-extrabold"
                  aria-hidden={!isFirst}
                  style={{ background: GRADIENT, boxShadow: '0 2px 8px rgba(15,118,110,0.28)' }}
                >
                  {displayedAgent?.display_name?.[0] || 'W'}
                </div>
              </div>
            )}

            <div className={`flex flex-col gap-0.5 max-w-[min(600px,80%)] ${isBot ? 'items-start' : 'items-end'}`}>
              {/* Agent name label on first bot message in group */}
              {isBot && isFirst && displayedAgent?.display_name && (
                <span className="text-[0.7rem] font-semibold text-slate-500 px-1 mb-0.5">
                  {displayedAgent.display_name}
                </span>
              )}

              {/* Bubble */}
              <div
                className={`px-[1.1rem] py-[0.75rem] rounded-2xl text-[0.93rem] leading-[1.7] break-words
                  [&_p]:my-0 [&_p]:mb-2 [&_p:last-child]:mb-0
                  [&_code]:bg-slate-50 [&_code]:text-teal-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-[0.86em] [&_code]:border [&_code]:border-slate-200
                  [&_pre]:bg-slate-50 [&_pre]:border [&_pre]:border-slate-200 [&_pre]:rounded-xl [&_pre]:p-3.5 [&_pre]:overflow-x-auto [&_pre]:my-2.5 [&_pre]:text-[0.86em]
                  [&_ul]:pl-5 [&_ul]:my-1.5 [&_ol]:pl-5 [&_ol]:my-1.5 [&_li]:mb-1
                  [&_strong]:font-semibold [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm
                  ${isBot
                    ? 'bg-white text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-[0_1px_8px_rgba(0,0,0,0.06)] rounded-bl-[6px]'
                    : 'text-white rounded-br-[6px] shadow-[0_3px_14px_rgba(15,118,110,0.22)]'
                  }`}
                style={!isBot ? { background: GRADIENT } : {}}
              >
                <Markdown>{msg.text}</Markdown>
              </div>

              {/* Timestamp */}
              {msg.timestamp && (
                <span className="text-[0.65rem] text-slate-400 px-1 mt-0.5">
                  {formatTime(msg.timestamp)}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isBotTyping && (
        <div className="flex items-end gap-2.5 px-6 md:px-10 max-w-[860px] w-full mx-auto mt-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[0.75rem] font-extrabold mb-1"
            aria-hidden="true"
            style={{ background: GRADIENT, boxShadow: '0 2px 8px rgba(15,118,110,0.28)' }}
          >
            {displayedAgent?.display_name?.[0] || 'W'}
          </div>
          <div>
            {displayedAgent?.display_name && (
              <span className="block text-[0.7rem] font-semibold text-slate-500 px-1 mb-0.5">
                {displayedAgent.display_name}
              </span>
            )}
            <div
              className="flex items-center gap-[5px] px-[1.1rem] py-[0.75rem] rounded-2xl rounded-bl-[6px] bg-white border border-[hsl(var(--border))] shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
              aria-label="Agent is typing"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="inline-block w-[6px] h-[6px] rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.16}s`, animationDuration: '1.2s' }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom padding so content isn't flush to input */}
      <div className="h-4 flex-shrink-0" />
    </div>
  );
};

export default MessageList;
