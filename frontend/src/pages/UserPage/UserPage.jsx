import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell/AppShell';
import Badges from '@/components/Badges/Badges_user';
import Lottie from 'lottie-react';
import animationData from '@/Assets/Newanimation.json';
import Footer from '@/components/Footer/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

/* ── Quotes ──────────────────────────────────────────────────── */
const QUOTES = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Strive not to be a success, but rather to be of value.', author: 'Albert Einstein' },
  { text: 'Success is not final, failure is not fatal — it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It does not matter how slowly you go so long as you do not stop.', author: 'Confucius' },
  { text: 'Talent wins games, but teamwork and intelligence win championships.', author: 'Michael Jordan' },
  { text: 'Alone we can do so little; together we can do so much.', author: 'Helen Keller' },
  { text: 'The harder I work, the luckier I get.', author: 'Samuel Goldwyn' },
  { text: "Don't watch the clock; do what it does. Keep going.", author: 'Sam Levenson' },
  { text: 'Your positive action combined with positive thinking results in success.', author: 'Shiv Khera' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Great things are done by a series of small things brought together.', author: 'Vincent Van Gogh' },
];

/* ── Helpers ─────────────────────────────────────────────────── */
const getVibeInfo = (score) => {
  if (score >= 4.5) return { label: 'Thriving',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  emoji: '🌟', grad: 'linear-gradient(135deg,#10b981,#059669)' };
  if (score >= 3)   return { label: 'Steady',      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  emoji: '😊', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' };
  return              { label: 'Needs Care',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   emoji: '💙', grad: 'linear-gradient(135deg,#f97316,#ef4444)' };
};
const getVibeMessage = (score) => {
  if (score >= 4.5) return "You're absolutely crushing it today!";
  if (score >= 3)   return "Keep going — you're doing really well!";
  return "It's okay to take a break. We've got you. 💙";
};

const TIERS = [
  { label: 'Bronze',   pts: 100,  color: '#cd7f32', emoji: '🥉' },
  { label: 'Silver',   pts: 300,  color: '#9ca3af', emoji: '🥈' },
  { label: 'Gold',     pts: 600,  color: '#f59e0b', emoji: '🥇' },
  { label: 'Platinum', pts: 1000, color: '#6366f1', emoji: '💎' },
];
const getCurrentTier = (pts) => {
  let tier = null;
  TIERS.forEach(t => { if (pts >= t.pts) tier = t; });
  return tier;
};
const getNextTier = (pts) => TIERS.find(t => pts < t.pts) || null;

/* ── Component ───────────────────────────────────────────────── */
const UserPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const empId  = user?.emp_id || localStorage.getItem('empId') || '';
  const quote  = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  if (!user) {
    return (
      <AppShell title="Dashboard">
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  const vibeScore   = user.vibe_score ?? 0;
  const vibeInfo    = getVibeInfo(vibeScore);
  const vibeMsg     = getVibeMessage(vibeScore);
  const rewardPts   = user.reward_points ?? 0;
  const currentTier = getCurrentTier(rewardPts);
  const nextTier    = getNextTier(rewardPts);
  const nextPts     = nextTier ? nextTier.pts : (currentTier?.pts ?? 0);
  const prevPts     = currentTier ? currentTier.pts : 0;
  const tierPct     = nextTier
    ? Math.round(((rewardPts - prevPts) / (nextPts - prevPts)) * 100)
    : 100;
  const vibeDots    = Math.round((vibeScore / 5) * 10);

  const chatPrompt =
    vibeScore >= 4.5 ? "You're in great spirits! Let's catch up."
    : vibeScore >= 3  ? 'Just checking in — want to chat?'
                      : 'You seem down. WellBee is here for you.';

  return (
    <AppShell title="Dashboard">
      <div className="max-w-5xl mx-auto space-y-5 pb-36">

        {/* ── Hero banner ───────────────────────────────────── */}
        <div
          className="relative rounded-2xl px-6 py-5 text-white overflow-hidden flex items-center justify-between gap-4 flex-wrap"
          style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)', boxShadow: '0 8px 32px rgba(15,118,110,0.25)' }}
        >
          {/* decorative orbs */}
          <span className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
          <span className="pointer-events-none absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-white/[0.04]" />

          <div className="relative z-10">
            <span className="inline-block text-xs font-semibold bg-white/20 rounded-full px-3 py-1 mb-2 tracking-wider">
              Dashboard Overview
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">
              Welcome, <span className="bg-white/25 px-2 rounded-lg">{empId}</span>
            </h2>
            <p className="text-sm text-white/80 max-w-md">
              Empowering you at work — support, growth & motivation for every challenge.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="relative z-10 border-white/50 text-white bg-transparent hover:bg-white/15 hover:border-white gap-1.5"
            onClick={() => {
              const link = document.createElement('a');
              link.href = 'https://apps.who.int/iris/bitstream/handle/10665/42823/9241562579.pdf';
              link.download = 'Brochure.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Brochure
          </Button>
        </div>

        {/* ── Row 1: Vibe + Rewards ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Vibe card */}
          <Card className="border-t-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5" style={{ borderTopColor: vibeInfo.color }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: vibeInfo.bg }}>
                  {vibeInfo.emoji}
                </div>
                <Badge variant="outline" style={{ background: vibeInfo.bg, color: vibeInfo.color, borderColor: 'transparent' }} className="text-xs font-bold uppercase tracking-wider">
                  Vibe Check
                </Badge>
              </div>
              <CardTitle className="text-base mt-2">How are you feeling?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Score visual */}
              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md"
                  style={{ background: vibeInfo.grad }}
                >
                  {vibeInfo.emoji}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold leading-none tracking-tight" style={{ color: vibeInfo.color }}>
                      {vibeScore.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">/ 5.0</span>
                  </div>
                  <Badge variant="outline" className="w-fit text-[11px] font-bold uppercase tracking-wide"
                    style={{ background: vibeInfo.bg, color: vibeInfo.color, borderColor: 'transparent' }}>
                    {vibeInfo.label}
                  </Badge>
                </div>
              </div>

              {/* 10-dot bar */}
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-2 rounded-full transition-colors duration-700"
                    style={{ background: i < vibeDots ? vibeInfo.color : '#e2e8f0' }}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center italic">{vibeMsg}</p>
            </CardContent>
          </Card>

          {/* Rewards card */}
          <Card className="border-t-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5" style={{ borderTopColor: '#f59e0b' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-amber-50">
                  ⭐
                </div>
                <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border-transparent">
                  Rewards
                </Badge>
              </div>
              <CardTitle className="text-base mt-2">Your Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Points row */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-extrabold text-amber-500 leading-none">{rewardPts}</span>
                <span className="text-sm font-semibold text-muted-foreground">pts</span>
                {currentTier && (
                  <Badge className="ml-auto bg-amber-50 text-amber-600 border-transparent text-xs font-bold hover:bg-amber-50">
                    {currentTier.emoji} {currentTier.label}
                  </Badge>
                )}
              </div>

              {/* Tier progress */}
              {nextTier ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: currentTier?.color ?? '#94a3b8' }}>{currentTier?.label ?? 'Start'}</span>
                    <span className="text-muted-foreground">{nextTier.pts - rewardPts} pts to {nextTier.label} {nextTier.emoji}</span>
                    <span style={{ color: nextTier.color }}>{nextTier.label}</span>
                  </div>
                  <Progress value={tierPct} className="h-2" indicatorClassName="bg-gradient-to-r from-amber-400 to-orange-500" />
                </div>
              ) : (
                <p className="text-sm font-semibold text-amber-500">🎉 Platinum — the highest tier! Incredible.</p>
              )}

              {/* Tier pills */}
              <div className="flex gap-1.5 flex-wrap">
                {TIERS.map(t => (
                  <span
                    key={t.label}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                    style={{
                      borderColor: rewardPts >= t.pts ? t.color : '#e2e8f0',
                      background: rewardPts >= t.pts ? 'white' : '#f8fafc',
                      color: rewardPts >= t.pts ? '#1e293b' : '#94a3b8',
                      boxShadow: rewardPts >= t.pts ? `0 0 0 3px ${t.color}1a` : 'none',
                    }}
                  >
                    {t.emoji} {t.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Row 2: Badges + Quote ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Badges card */}
          <Card className="border-t-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5" style={{ borderTopColor: '#6366f1' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-indigo-50">🏆</div>
                <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border-transparent">Awards</Badge>
              </div>
              <CardTitle className="text-base mt-2">Your Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Achievements earned through hard work and dedication.</p>
              <Badges employeeId={empId} />
            </CardContent>
          </Card>

          {/* Quote card */}
          <Card className="border-t-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col" style={{ borderTopColor: '#a855f7' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-purple-50">✨</div>
                <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-600 border-transparent">Daily Spark</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              {/* Quote */}
              <div className="relative flex-1 rounded-xl p-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8f0ff, #fdf4ff)', borderLeft: '4px solid #a855f7' }}>
                <span className="absolute top-0 left-3 text-7xl font-black text-purple-400 opacity-10 leading-none select-none pointer-events-none">"</span>
                <p className="relative z-10 text-sm font-semibold italic text-purple-950 leading-relaxed pt-3">{quote.text}</p>
                <p className="relative z-10 text-xs font-bold text-purple-600 mt-2">— {quote.author}</p>
              </div>

              {/* Survey nudge */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex-wrap">
                <span className="text-xl flex-shrink-0">📝</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">Your voice matters</p>
                  <p className="text-xs text-slate-500">Takes under 2 minutes</p>
                </div>
                <Button size="sm" onClick={() => navigate('/surveyform')}
                  className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-sm text-xs">
                  Take Survey →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Footer — pb-20 accounts for the fixed chat bar height */}
      <div className="pb-20">
        <Footer />
      </div>

      {/* ── Fixed chat bar ────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 lg:left-[256px] right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_32px_rgba(0,0,0,0.06)]">
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-5 py-3 flex-wrap">
          <div className="flex-shrink-0">
            <Lottie animationData={animationData} loop style={{ width: 54, height: 46 }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">Talk to WellBee</p>
            <p className="text-xs text-slate-500 truncate">{chatPrompt}</p>
          </div>
          <div className="hidden sm:flex gap-1.5">
            {['Confidential', 'AI-Powered', '24/7'].map(f => (
              <span key={f} className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-[11px] font-semibold border border-slate-200">
                {f}
              </span>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/chat')}
            className="flex-shrink-0 gap-1.5 shadow-md"
            style={{ background: '#0f766e' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Open Chat
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default UserPage;
