// ChatInterface.js
import React, { useState } from 'react';
import './ChatInterface.css';

const dummyConversations = [
  { id: 'conv-1', title: 'Alex - Check In' },
  { id: 'conv-2', title: 'Jamie - Mood Tracker' },
];

const initialMessages = {
  'conv-1': [],
  'conv-2': [],
};

const ChatInterface = ({ selectedChat = null }) => {
  const [activeChat, setActiveChat] = useState(selectedChat);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [botVisible, setBotVisible] = useState(true);

  const startBotConversation = () => {
    const botId = 'conv-1';
    if (!messages[botId].length) {
      setMessages(prev => ({
        ...prev,
        [botId]: [{ from: 'bot', text: 'Hey there! How can I support your mental wellness today? 💬' }]
      }));
    }
    setActiveChat(botId);
    setBotVisible(false);
  };

  const handleSend = () => {
    if (!input.trim() || !activeChat) return;
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...prev[activeChat], { from: 'user', text: input.trim() }]
    }));
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h5 className="text-white fw-bold mb-4">🧑 Employee Chats</h5>
        {dummyConversations.map(chat => (
          <div
            key={chat.id}
            className={`chat-thread ${activeChat === chat.id ? 'active' : ''}`}
            onClick={() => setActiveChat(chat.id)}
          >
            {chat.title}
          </div>
        ))}
      </div>

      <div className="chat-window">
        {botVisible ? (
          <div className="bot-start-wrapper">
            <div className="bot-card" onClick={startBotConversation}>
              <img src="/bot-avatar.png" alt="bot" className="bot-avatar" />
              <div>
                <h5>MindBot 🤖</h5>
                <p className="text-muted">Click to begin a mental wellness chat</p>
              </div>
            </div>
          </div>
        ) : (
          activeChat ? (
            <>
              <div className="chat-messages">
                {messages[activeChat]?.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-row ${msg.from === 'user' ? 'right' : 'left'}`}
                  >
                    <img
                      src={msg.from === 'bot' ? '/bot-avatar.png' : '/user-avatar.png'}
                      alt="avatar"
                      className="avatar"
                    />
                    <div className={`chat-bubble ${msg.from === 'user' ? 'user' : 'bot'}`}>{msg.text}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="btn btn-primary" onClick={handleSend}>Send</button>
              </div>
            </>
          ) : (
            <div className="chat-empty">👈 Select or start a conversation!</div>
          )
        )}
      </div>
    </div>
  );
};

export default ChatInterface;