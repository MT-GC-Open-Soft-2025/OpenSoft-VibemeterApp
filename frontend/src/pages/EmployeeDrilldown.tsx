import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, TrendingUp, Award, ChevronDown, ChevronUp } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { mapBackendUser, type MockUser } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployeeDetail, getConversations, getConversation, getConversationSummary } from "@/api/admin";
import Markdown from "markdown-to-jsx";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

function getVibeLabel(score: number) {
  if (score >= 4) return { label: "Thriving", emoji: "😄", color: "text-success" };
  if (score >= 3) return { label: "Steady", emoji: "🙂", color: "text-primary" };
  if (score >= 2) return { label: "Coping", emoji: "😐", color: "text-warning" };
  return { label: "Needs Care", emoji: "😔", color: "text-destructive" };
}

const tiers = ["Bronze", "Silver", "Gold", "Platinum"];

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "hsl(142, 71%, 45%)",
  neutral: "hsl(199, 89%, 48%)",
  negative: "hsl(0, 72%, 51%)",
};

interface ConvSummary {
  id: string;
  date: string;
  agentName: string;
  sentiment: "positive" | "neutral" | "negative";
  topic: string;
  summary: string;
  feedback: string;
}

const EmployeeDrilldown = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<MockUser | null>(null);
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [expandedTranscript, setExpandedTranscript] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const empData = await getEmployeeDetail(id);
        setEmployee(mapBackendUser(empData));

        // Fetch conversations
        try {
          const convData = await getConversations(id);
          const convIds: string[] = Array.isArray(convData) ? convData.map((c: any) => c.convid || c) : (convData.convo_ids || []);

          // Fetch summaries for each conversation
          const summaries: ConvSummary[] = [];
          for (const convId of convIds.slice(0, 10)) {
            try {
              const summary = await getConversationSummary(id, typeof convId === "string" ? convId : convId.convid);
              summaries.push({
                id: typeof convId === "string" ? convId : convId.convid,
                date: summary.date || "",
                agentName: summary.agent_name || summary.agent_name_snapshot || "",
                sentiment: summary.last_sentiment || "neutral",
                topic: summary.active_topic || "",
                summary: summary.summary || summary.folded_summary || "No summary available.",
                feedback: summary.feedback || "",
              });
            } catch {
              summaries.push({
                id: typeof convId === "string" ? convId : convId.convid,
                date: "",
                agentName: "",
                sentiment: "neutral",
                topic: "",
                summary: "Summary unavailable.",
                feedback: "",
              });
            }
          }
          setConversations(summaries);
        } catch {
          setConversations([]);
        }
      } catch (err) {
        console.error("Failed to fetch employee:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const loadTranscript = async (convId: string) => {
    if (transcripts[convId]) {
      setExpandedTranscript(expandedTranscript === convId ? null : convId);
      return;
    }
    try {
      const data = await getConversation(id!, convId);
      setTranscripts((prev) => ({ ...prev, [convId]: data.messages || [] }));
      setExpandedTranscript(convId);
    } catch {
      setExpandedTranscript(expandedTranscript === convId ? null : convId);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-24" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-32" /></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!employee) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-muted-foreground">Employee not found.</p>
          <Link to="/admin"><Button variant="link">Back to Dashboard</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const vibe = getVibeLabel(employee.vibeScore);
  const tierProgress = ((tiers.indexOf(employee.rewardTier) + 1) / tiers.length) * 100;

  // Sentiment breakdown from conversations
  const sentimentData = Object.entries(
    conversations.reduce((acc, c) => {
      acc[c.sentiment] = (acc[c.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value, fill: SENTIMENT_COLORS[name] || "hsl(var(--muted))" }));

  // Topic breakdown
  const topicData = Object.entries(
    conversations.filter((c) => c.topic).reduce((acc, c) => {
      acc[c.topic] = (acc[c.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto p-6 max-w-5xl mx-auto space-y-6">
        <Link to="/admin">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
            {employee.avatar}
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">{employee.name}</h1>
            <p className="text-muted-foreground">{employee.employeeId} {employee.company ? `• ${employee.company}` : ""}</p>
          </div>
        </motion.div>

        {/* Top cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Vibe Score</p>
              <p className="text-4xl mb-1">{vibe.emoji}</p>
              <p className="text-3xl font-bold">{employee.vibeScore.toFixed(1)}</p>
              <p className={`font-heading font-bold ${vibe.color}`}>{vibe.label}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">Reward Tier</p>
              <p className="text-xl font-heading font-bold text-primary mb-3">{employee.rewardTier}</p>
              <Progress value={tierProgress} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">{employee.rewardPoints} points</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-3">Badges ({employee.badges.length})</p>
              <div className="flex flex-wrap gap-2">
                {employee.badges.length > 0 ? employee.badges.map((b) => (
                  <span key={b.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/50 text-sm">
                    {b.icon} {b.name}
                  </span>
                )) : (
                  <p className="text-sm text-muted-foreground">No badges earned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Leave Days", value: `${employee.leaveDaysUsed}/${employee.leaveDaysTotal}`, bg: "bg-primary/10", fg: "text-primary" },
            { icon: Clock, label: "Hours/Week", value: `${employee.workHoursThisWeek}h`, bg: "bg-success/10", fg: "text-success" },
            { icon: TrendingUp, label: "Performance", value: employee.performanceScore.toFixed(1), bg: "bg-warning/10", fg: "text-warning" },
            { icon: Award, label: "Reward Points", value: String(employee.rewardPoints), bg: "bg-accent", fg: "text-accent-foreground" },
          ].map((m) => (
            <Card key={m.label} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${m.bg}`}><m.icon className={`h-4 w-4 ${m.fg}`} /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-lg font-bold">{m.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sentiment & Topic Breakdown */}
        {conversations.length > 0 && (sentimentData.length > 0 || topicData.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {sentimentData.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle className="text-lg font-heading">Sentiment Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                        {sentimentData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-2">
                    {sentimentData.map((s) => (
                      <div key={s.name} className="flex items-center gap-1 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.fill }} />
                        <span className="capitalize">{s.name} ({s.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {topicData.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle className="text-lg font-heading">Topics Discussed</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topicData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(263, 76%, 51%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Conversations */}
        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="text-lg font-heading">Conversation Summaries</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {conversations.length > 0 ? conversations.map((conv) => (
              <div key={conv.id} className="p-4 rounded-xl bg-accent/20 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Session with {conv.agentName || "Agent"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      conv.sentiment === "positive" ? "bg-success/10 text-success" :
                      conv.sentiment === "negative" ? "bg-destructive/10 text-destructive" :
                      "bg-primary/10 text-primary"
                    }`}>{conv.sentiment}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{conv.date}</span>
                </div>
                <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
                  <Markdown>{conv.summary}</Markdown>
                </div>
                {conv.feedback && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm"><span className="font-medium">Employee feedback:</span> {conv.feedback}</p>
                  </div>
                )}
                {/* Transcript Viewer */}
                <div className="mt-3 pt-3 border-t border-border">
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => loadTranscript(conv.id)}
                  >
                    {expandedTranscript === conv.id ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                    {expandedTranscript === conv.id ? "Hide Transcript" : "View Transcript"}
                  </Button>
                  {expandedTranscript === conv.id && transcripts[conv.id] && (
                    <div className="mt-3 space-y-2 p-3 rounded-lg bg-card border border-border">
                      {transcripts[conv.id].map((msg: any, i: number) => (
                        <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                            msg.sender === "user"
                              ? "bg-primary/10 text-foreground"
                              : "bg-muted text-foreground"
                          }`}>
                            <p>{msg.message}</p>
                            {msg.timestamp && <p className="text-[10px] text-muted-foreground mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
                          </div>
                        </div>
                      ))}
                      {transcripts[conv.id].length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">No messages in this conversation</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <EmptyState emoji="📋" title="No conversations" description="This employee has no recorded conversations yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EmployeeDrilldown;
