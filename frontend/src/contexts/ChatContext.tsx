import { createContext, useContext, useState, type ReactNode } from "react";
import type { Agent, ChatMessage } from "@/lib/mock-data";

type ChatView = "pick" | "chat" | "history";

interface ChatState {
  view: ChatView;
  selectedAgent: Agent | null;
  messages: ChatMessage[];
  activeSessionId: string | null;
}

interface ChatContextType extends ChatState {
  setView: (v: ChatView) => void;
  setSelectedAgent: (a: Agent | null) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setActiveSessionId: (id: string | null) => void;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ChatView>("pick");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const resetChat = () => {
    setView("pick");
    setSelectedAgent(null);
    setMessages([]);
    setActiveSessionId(null);
  };

  return (
    <ChatContext.Provider value={{ view, setView, selectedAgent, setSelectedAgent, messages, setMessages, activeSessionId, setActiveSessionId, resetChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
