import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Star, History, Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { mapBackendAgent, type Agent, type ChatMessage, type ChatSession } from "@/lib/mock-data";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import * as chatApi from "@/api/chat";
import { getConvoids } from "@/api/user";
import Markdown from "markdown-to-jsx";

function getRecommendedAgent(vibeScore: number, agents: Agent[]): string | null {
  if (agents.length === 0) return null;
  const spark = agents.find((a) => a.personaKey === "spark");
  const sage = agents.find((a) => a.personaKey === "sage");
  const anchor = agents.find((a) => a.personaKey === "anchor");
  if (vibeScore < 2 && spark) return spark.id;
  if (vibeScore < 3 && sage) return sage.id;
  if (anchor) return anchor.id;
  return agents[0]?.id || null;
}

const Chat = () => {
  const { view, setView, selectedAgent, setSelectedAgent, messages, setMessages, activeSessionId, setActiveSessionId, resetChat } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [pastSessions, setPastSessions] = useState<ChatSession[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [convoId, setConvoId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const recommendedAgentId = user ? getRecommendedAgent(user.vibeScore, agents) : null;

  // Fetch agents on mount
  useEffect(() => {
    chatApi.getAgents().then((data: any[]) => {
      const mapped = data.filter((a: any) => a.status === "active").map(mapBackendAgent);
      setAgents(mapped);
    }).catch((err) => {
      console.error("Failed to fetch agents:", err);
    }).finally(() => setLoadingAgents(false));
  }, []);

  // Fetch past sessions
  useEffect(() => {
    getConvoids().then((data: any) => {
      const convIds: string[] = data.convo_ids || data || [];
      const sessions: ChatSession[] = convIds.map((id: string) => ({
        id,
        agentId: "",
        agentName: "",
        date: "",
        preview: id,
      }));
      setPastSessions(sessions);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const startChat = useCallback(async (agent: Agent) => {
    setSelectedAgent(agent);
    const newConvoId = nanoid(12);
    setConvoId(newConvoId);
    setActiveSessionId(null);
    setView("chat");

    try {
      const result = await chatApi.initiateChat(newConvoId, agent.id);
      // If agent runtime returns a greeting, use it
      const greeting = result?.initial_message || result?.greeting || `Hi there! I'm ${agent.name} — ${agent.personality.toLowerCase()}. How are you feeling today?`;
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } catch (err) {
      console.error("Failed to initiate chat:", err);
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `Hi there! I'm ${agent.name} — ${agent.personality.toLowerCase()}. How are you feeling today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  }, [setSelectedAgent, setActiveSessionId, setView, setMessages]);

  const loadPastSession = useCallback(async (sessionId: string) => {
    try {
      const data = await chatApi.getChat(sessionId);
      const chatMessages: ChatMessage[] = (data.messages || []).map((m: any, i: number) => ({
        id: `msg-${i}`,
        role: m.sender === "user" ? "user" : "assistant",
        content: m.message,
        timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      }));
      const agentName = data.agent_name_snapshot || "";
      const agent = agents.find((a) => a.name === agentName || a.id === data.agent_id);
      setSelectedAgent(agent || { id: "", name: agentName, personality: "", description: "", avatar: "🤖", color: "", status: "active", createdAt: "", sessionsCount: 0, avgRating: 0 });
      setMessages(chatMessages);
      setActiveSessionId(sessionId);
      setConvoId(sessionId);
      setView("history");
    } catch (err) {
      console.error("Failed to load session:", err);
      toast.error("Failed to load conversation");
    }
  }, [agents, setSelectedAgent, setMessages, setActiveSessionId, setView]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedAgent || !convoId) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    const msgText = input.trim();
    setInput("");
    setIsTyping(true);

    // Create placeholder for streaming response
    const botMsgId = `b-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: botMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);

    // Use streaming
    abortRef.current = chatApi.sendMessageStream(
      convoId,
      msgText,
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) => m.id === botMsgId ? { ...m, content: m.content + chunk } : m)
        );
      },
      (err) => {
        console.error("Stream error:", err);
        setMessages((prev) =>
          prev.map((m) => m.id === botMsgId ? { ...m, content: m.content || "Sorry, I encountered an error. Please try again." } : m)
        );
        setIsTyping(false);
      },
      () => {
        setIsTyping(false);
      }
    );
  }, [input, selectedAgent, convoId, setMessages]);

  const handleEndChat = useCallback(async () => {
    if (convoId) {
      try {
        await chatApi.endChat(convoId, feedback);
        if (rating > 0) {
          const empId = localStorage.getItem("empId") || "";
          await chatApi.addFeedback({
            emp_id: empId,
            conv_id: convoId,
            Q1: rating, Q2: rating, Q3: rating, Q4: rating, Q5: rating,
          });
        }
      } catch (err) {
        console.error("Failed to end chat:", err);
      }
    }
    toast.success("Thank you for your feedback! Session saved.");
    setShowEndModal(false);
    if (abortRef.current) abortRef.current.abort();
    resetChat();
    setConvoId(null);
    setRating(0);
    setFeedback("");
  }, [convoId, feedback, rating, resetChat]);

  const SessionList = () => (
    <div className="space-y-2">
      {pastSessions.length > 0 ? pastSessions.map((session) => (
        <div
          key={session.id}
          onClick={() => loadPastSession(session.id)}
          className={`p-3 rounded-lg transition-colors cursor-pointer ${activeSessionId === session.id ? "bg-primary/10 border border-primary/30" : "bg-accent/30 hover:bg-accent/50"}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{session.agentName || "Chat"}</span>
            <span className="text-xs text-muted-foreground">{session.date}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{session.preview}</p>
        </div>
      )) : (
        <EmptyState emoji="💬" title="No past sessions" description="Start your first chat to see history here." />
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="h-[calc(100vh-3.5rem)] flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-72 border-r border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-wide">Past Sessions</h3>
            {(view === "chat" || view === "history") && (
              <Button variant="ghost" size="icon" onClick={() => { if (abortRef.current) abortRef.current.abort(); resetChat(); setConvoId(null); }} title="New Chat">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-auto"><SessionList /></div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {view === "pick" ? (
              <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-4xl w-full">
                  <div className="lg:hidden mb-4 flex justify-end">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm"><History className="h-4 w-4 mr-2" /> Past Sessions</Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-80">
                        <SheetHeader><SheetTitle className="font-heading">Past Sessions</SheetTitle></SheetHeader>
                        <div className="mt-4"><SessionList /></div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-heading font-bold mb-2">Choose Your Counselor</h2>
                    <p className="text-muted-foreground">Each counselor has a unique style. Pick the one that feels right for you.</p>
                  </div>
                  {loadingAgents ? (
                    <div className="grid sm:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
                    </div>
                  ) : agents.length > 0 ? (
                    <div className="grid sm:grid-cols-3 gap-6">
                      {agents.map((agent) => (
                        <motion.div key={agent.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
                          <Card
                            className={`border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full relative ${recommendedAgentId === agent.id ? "ring-2 ring-primary" : ""}`}
                            onClick={() => startChat(agent)}
                          >
                            {recommendedAgentId === agent.id && (
                              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                                Recommended for you
                              </Badge>
                            )}
                            <CardContent className="p-6 text-center">
                              <div className="text-5xl mb-4">{agent.avatar}</div>
                              <h3 className="text-xl font-heading font-bold mb-1">{agent.name}</h3>
                              <p className="text-sm text-primary font-medium mb-3">{agent.personality}</p>
                              <p className="text-sm text-muted-foreground">{agent.description}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState emoji="🤖" title="No agents available" description="No AI counselors are currently active. Please check back later." />
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
                  {view === "history" ? (
                    <Button variant="ghost" size="icon" onClick={() => { resetChat(); setConvoId(null); }}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => setShowEndModal(true)}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <span className="text-2xl">{selectedAgent?.avatar}</span>
                  <div>
                    <p className="font-heading font-bold">{selectedAgent?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {view === "history" ? "Read-only transcript" : selectedAgent?.personality}
                    </p>
                  </div>
                  <div className="flex-1" />
                  <div className="lg:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon"><History className="h-4 w-4" /></Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-80">
                        <SheetHeader><SheetTitle className="font-heading">Past Sessions</SheetTitle></SheetHeader>
                        <div className="mt-4"><SessionList /></div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  {view === "chat" && (
                    <Button variant="outline" size="sm" onClick={() => setShowEndModal(true)}>End Chat</Button>
                  )}
                  {view === "history" && (
                    <Button variant="outline" size="sm" onClick={() => { resetChat(); setConvoId(null); }}>
                      <Plus className="h-4 w-4 mr-1" /> New Chat
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card shadow-md border border-border rounded-bl-sm"
                      }`}>
                        {msg.role === "assistant" ? (
                          <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                            <Markdown>{msg.content || "..."}</Markdown>
                          </div>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                        <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && messages[messages.length - 1]?.content === "" && null}
                  {isTyping && messages[messages.length - 1]?.content !== "" && (
                    <div className="flex justify-start">
                      <div className="bg-card shadow-md border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-soft" />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-soft" style={{ animationDelay: "0.3s" }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-soft" style={{ animationDelay: "0.6s" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                {view === "chat" && (
                  <div className="p-4 border-t border-border bg-card">
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                      <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." className="flex-1" disabled={isTyping} />
                      <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* End Chat Modal */}
        <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Rate Your Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">How was your chat with {selectedAgent?.name}?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                    <Star className={`h-8 w-8 ${star <= rating ? "fill-warning text-warning" : "text-muted"}`} />
                  </button>
                ))}
              </div>
              <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Any additional feedback? (optional)" rows={3} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEndModal(false)}>Continue Chat</Button>
              <Button onClick={handleEndChat}>Submit & End</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Chat;
