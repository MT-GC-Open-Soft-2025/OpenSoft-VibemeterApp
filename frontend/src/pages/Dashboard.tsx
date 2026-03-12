import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ClipboardList, RefreshCw, Flame, Calendar, Clock, TrendingUp, Award, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MOTIVATIONAL_QUOTES } from "@/lib/mock-data";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/EmptyState";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

function getVibeLabel(score: number) {
  if (score >= 4) return { label: "Thriving", emoji: "😄", color: "text-success" };
  if (score >= 3) return { label: "Steady", emoji: "🙂", color: "text-primary" };
  if (score >= 2) return { label: "Coping", emoji: "😐", color: "text-warning" };
  return { label: "Needs Care", emoji: "😔", color: "text-destructive" };
}

function getRewardProgress(tier: string) {
  const tiers = ["Bronze", "Silver", "Gold", "Platinum"];
  const idx = tiers.indexOf(tier);
  return ((idx + 1) / tiers.length) * 100;
}

const tierColors: Record<string, string> = {
  Bronze: "text-warning",
  Silver: "text-muted-foreground",
  Gold: "text-warning",
  Platinum: "text-primary",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [showOnboarding, setShowOnboarding] = useState(() => !sessionStorage.getItem("wellbee_onboarded"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const quote = MOTIVATIONAL_QUOTES[quoteIdx];
  const vibe = useMemo(() => getVibeLabel(user?.vibeScore ?? 0), [user?.vibeScore]);

  if (!user) return null;

  const dismissOnboarding = () => {
    sessionStorage.setItem("wellbee_onboarded", "true");
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {showOnboarding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-lg bg-primary/5 border-l-4 border-l-primary">
              <CardContent className="p-5 flex items-start gap-4">
                <span className="text-3xl">🌿</span>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-lg mb-1">Welcome to WellBee!</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    WellBee is your personal wellness companion. Chat with AI counselors, track your wellbeing score, earn badges, and complete surveys.
                  </p>
                  <Link to="/chat"><Button size="sm">Start your first chat</Button></Link>
                </div>
                <Button variant="ghost" size="icon" onClick={dismissOnboarding} className="shrink-0"><X className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-heading font-bold">Welcome back, {user.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Here's your wellness snapshot</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: Flame, label: "Chat Streak", value: String(user.chatStreak), bg: "bg-destructive/10", fg: "text-destructive", delay: 0.05 },
            { icon: Calendar, label: "Leave Days", value: `${user.leaveDaysUsed}/${user.leaveDaysTotal}`, bg: "bg-primary/10", fg: "text-primary", delay: 0.1 },
            { icon: Clock, label: "Hours/Week", value: `${user.workHoursThisWeek}h`, bg: "bg-success/10", fg: "text-success", delay: 0.15 },
            { icon: TrendingUp, label: "Performance", value: user.performanceScore.toFixed(1), bg: "bg-warning/10", fg: "text-warning", delay: 0.2 },
            { icon: Award, label: "Reward Pts", value: String(user.rewardPoints), bg: "bg-accent", fg: "text-accent-foreground", delay: 0.25 },
          ].map((stat) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stat.delay }}>
              <Card className="border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-4 w-4 ${stat.fg}`} /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full border-0 shadow-lg">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-heading">Vibe Score</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center pt-2">
                <div className="relative w-28 h-28 mb-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" className="stroke-muted" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" className="stroke-primary" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(user.vibeScore / 5) * 264} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl">{vibe.emoji}</span>
                    <span className="text-xl font-bold">{user.vibeScore.toFixed(1)}</span>
                  </div>
                </div>
                <span className={`text-base font-heading font-bold ${vibe.color} mb-2`}>{vibe.label}</span>
                {user.vibeHistory.length > 0 && (
                  <div className="w-full h-16 mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={user.vibeHistory}>
                        <defs>
                          <linearGradient id="vibeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(263, 76%, 51%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(263, 76%, 51%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <YAxis domain={[0, 5]} hide />
                        <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", fontSize: "12px" }} formatter={(v: number) => [v.toFixed(1), "Score"]} labelFormatter={(l) => l} />
                        <Area type="monotone" dataKey="score" stroke="hsl(263, 76%, 51%)" strokeWidth={2} fill="url(#vibeGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full border-0 shadow-lg bg-accent/30">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-lg font-heading">Daily Inspiration</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setQuoteIdx((quoteIdx + 1) % MOTIVATIONAL_QUOTES.length)}><RefreshCw className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent className="flex flex-col justify-center min-h-[120px]">
                <p className="text-lg italic text-foreground">"{quote.text}"</p>
                <p className="text-sm text-muted-foreground mt-2">— {quote.author}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="h-full border-0 shadow-lg">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-heading">Reward Tier</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <span className={`text-3xl font-heading font-bold ${tierColors[user.rewardTier]}`}>{user.rewardTier}</span>
                  <p className="text-sm text-muted-foreground mt-1">{user.rewardPoints} points</p>
                </div>
                <Progress value={getRewardProgress(user.rewardTier)} className="h-3 mb-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Bronze</span><span>Silver</span><span>Gold</span><span>Platinum</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle className="text-lg font-heading">Award Badges</CardTitle></CardHeader>
            <CardContent>
              {user.badges.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {user.badges.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                      <span className="text-3xl mb-2">{badge.icon}</span>
                      <span className="text-sm font-medium text-center">{badge.name}</span>
                      {badge.earnedAt && <span className="text-xs text-muted-foreground">{badge.earnedAt}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState emoji="🏆" title="No badges yet" description="Start chatting and completing surveys to earn your first badge!" actionLabel="Start a Chat" actionUrl="/chat" />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/chat"><Button size="lg" className="w-full text-base h-14 shadow-lg"><MessageCircle className="mr-2 h-5 w-5" /> Start a Chat</Button></Link>
          <Link to="/survey"><Button variant="outline" size="lg" className="w-full text-base h-14 shadow-lg"><ClipboardList className="mr-2 h-5 w-5" /> Take a Survey</Button></Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
