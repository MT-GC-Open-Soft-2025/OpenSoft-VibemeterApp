import React, { useState, useMemo } from "react";
/* Bootstrap imported once in App.js */
import "./UserPage.css";
import { useNavigate } from "react-router-dom";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar2.jsx";
import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
import Badges from "../../components/Badges/Badges_user.jsx";
import Swal from "sweetalert2";
import Lottie from "lottie-react";
import animationData from "../../Assets/Newanimation.json";
import Footer from "../../components/Footer/Footer.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

/* ── Motivational quotes ────────────────────────────────────────── */
const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "Success is not final, failure is not fatal — it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It does not matter how slowly you go so long as you do not stop.", author: "Confucius" },
  { text: "Talent wins games, but teamwork and intelligence win championships.", author: "Michael Jordan" },
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Your positive action combined with positive thinking results in success.", author: "Shiv Khera" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
];

/* ── SVG icon helpers ───────────────────────────────────────────── */
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);
const IconAward = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

/* ── Vibe helpers ───────────────────────────────────────────────── */
const getVibeInfo = (score) => {
  if (score >= 4.5) return { label: "Thriving",  color: "#10b981", bg: "rgba(16,185,129,0.1)",  emoji: "🌟", grad: "linear-gradient(135deg,#10b981,#059669)" };
  if (score >= 3)   return { label: "Steady",    color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  emoji: "😊", grad: "linear-gradient(135deg,#3b82f6,#6366f1)" };
  return              { label: "Needs Care", color: "#ef4444", bg: "rgba(239,68,68,0.1)",   emoji: "💙", grad: "linear-gradient(135deg,#f97316,#ef4444)" };
};
const getVibeMessage = (score) => {
  if (score >= 4.5) return "You're absolutely crushing it today!";
  if (score >= 3)   return "Keep going — you're doing really well!";
  return "It's okay to take a break. We've got you. 💙";
};

/* ── Tier helpers ───────────────────────────────────────────────── */
const TIERS = [
  { label: "Bronze", pts: 100,  color: "#cd7f32", emoji: "🥉" },
  { label: "Silver", pts: 300,  color: "#9ca3af", emoji: "🥈" },
  { label: "Gold",   pts: 600,  color: "#f59e0b", emoji: "🥇" },
  { label: "Platinum", pts: 1000, color: "#6366f1", emoji: "💎" },
];
const getCurrentTier = (pts) => {
  let tier = null;
  TIERS.forEach(t => { if (pts >= t.pts) tier = t; });
  return tier;
};
const getNextTier = (pts) => TIERS.find(t => pts < t.pts) || null;

const UserPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const empId = user?.emp_id || localStorage.getItem("empId") || "";
  const quote  = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const handleGoToChat = () => navigate("/chat");
  const handleFeedback  = () => navigate("/surveyform");

  const handleLogout = () => {
    Swal.fire({
      title: "Log out?",
      text: "You'll need to sign in again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f766e",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Stay",
    }).then((result) => {
      if (result.isConfirmed) { logout(); navigate("/login"); }
    });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "https://apps.who.int/iris/bitstream/handle/10665/42823/9241562579.pdf";
    link.download = "Brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <div className="up-loading-screen">
        <div className="up-spinner" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  const vibeScore = user.vibe_score ?? 0;
  const vibeInfo  = getVibeInfo(vibeScore);
  const vibeMsg   = getVibeMessage(vibeScore);
  const rewardPts = user.reward_points ?? 0;
  const currentTier = getCurrentTier(rewardPts);
  const nextTier    = getNextTier(rewardPts);
  const nextPts     = nextTier ? nextTier.pts : (currentTier?.pts ?? 0);
  const prevPts     = currentTier ? currentTier.pts : 0;
  const tierPct     = nextTier
    ? Math.round(((rewardPts - prevPts) / (nextPts - prevPts)) * 100)
    : 100;

  const chatPrompt =
    vibeScore >= 4.5 ? "You're in great spirits! Let's catch up."
    : vibeScore >= 3  ? "Just checking in — want to chat?"
                      : "You seem down. WellBee is here for you.";

  /* 10-dot vibe bar: filled count based on score */
  const viveDots = Math.round((vibeScore / 5) * 10);

  return (
    <div className="up-wrapper">
      <Feedbacknavbar title="Dashboard" className="navbar1" />

      <div className="up-layout">
        <Sidebar />

        <main className="up-main">

          {/* ── HERO ─────────────────────────────────────────── */}
          <section className="up-hero">
            <div className="up-hero-left">
              <span className="up-hero-eyebrow">Dashboard Overview</span>
              <h1 className="up-hero-name">Welcome, <span>{empId}</span></h1>
              <p className="up-hero-sub">Empowering you at work — support, growth & motivation for every challenge.</p>
            </div>
            <div className="up-hero-actions">
              <button className="up-btn-outline" onClick={handleDownload}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Brochure
              </button>
            </div>
          </section>

          {/* ── ROW 1: VIBE + REWARDS ────────────────────────── */}
          <div className="up-grid up-grid-2">

            {/* ── VIBE CARD ─────────────────────────── */}
            <div className="up-card up-card-vibe" style={{ "--vibe-color": vibeInfo.color, "--vibe-bg": vibeInfo.bg, "--vibe-grad": vibeInfo.grad }}>
              <div className="up-card-icon-row">
                <div className="up-card-icon" style={{ background: vibeInfo.bg, color: vibeInfo.color }}>
                  <span style={{ fontSize: 22 }}>{vibeInfo.emoji}</span>
                </div>
                <span className="up-card-badge" style={{ background: vibeInfo.bg, color: vibeInfo.color }}>Vibe Check</span>
              </div>
              <h3 className="up-card-title">How are you feeling?</h3>

              {/* Hex badge + score */}
              <div className="up-vibe-visual">
                <div className="up-vibe-hex" style={{ "--vibe-color": vibeInfo.color, "--vibe-grad": vibeInfo.grad }}>
                  <span className="up-vibe-hex-emoji">{vibeInfo.emoji}</span>
                </div>
                <div className="up-vibe-score-block">
                  <div className="up-vibe-score" style={{ color: vibeInfo.color }}>{vibeScore.toFixed(1)}</div>
                  <div className="up-vibe-score-denom">/ 5.0</div>
                  <div className="up-vibe-label-pill" style={{ background: vibeInfo.bg, color: vibeInfo.color }}>
                    {vibeInfo.label}
                  </div>
                </div>
              </div>

              {/* 10-segment dot bar */}
              <div className="up-vibe-bar">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="up-vibe-seg"
                    style={{ background: i < viveDots ? vibeInfo.color : "#e2e8f0" }}
                  />
                ))}
              </div>

              <p className="up-card-footnote">{vibeMsg}</p>
            </div>

            {/* ── REWARDS CARD ─────────────────────── */}
            <div className="up-card up-card-rewards">
              <div className="up-card-icon-row">
                <div className="up-card-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                  <IconStar />
                </div>
                <span className="up-card-badge" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>Rewards</span>
              </div>
              <h3 className="up-card-title">Your Rewards</h3>

              {/* Big points */}
              <div className="up-rewards-pts-row">
                <span className="up-rewards-num">{rewardPts}</span>
                <span className="up-rewards-unit">pts</span>
                {currentTier && (
                  <span className="up-rewards-tier-badge" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                    {currentTier.emoji} {currentTier.label}
                  </span>
                )}
              </div>

              {/* Progress to next tier */}
              {nextTier && (
                <div className="up-tier-progress">
                  <div className="up-tier-progress-labels">
                    <span style={{ color: currentTier?.color ?? "#94a3b8" }}>{currentTier?.label ?? "Start"}</span>
                    <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{nextTier.pts - rewardPts} pts to {nextTier.label} {nextTier.emoji}</span>
                    <span style={{ color: nextTier.color }}>{nextTier.label}</span>
                  </div>
                  <div className="up-tier-bar-track">
                    <div className="up-tier-bar-fill" style={{ width: `${tierPct}%`, background: vibeInfo.color === "#10b981" ? "linear-gradient(90deg,#f59e0b,#f97316)" : "linear-gradient(90deg,#f59e0b,#f97316)" }} />
                  </div>
                </div>
              )}
              {!nextTier && (
                <p className="up-card-body" style={{ color: "#f59e0b" }}>🎉 You've reached the highest tier — Platinum! Incredible.</p>
              )}

              {/* Tier pills */}
              <div className="up-rewards-tiers">
                {TIERS.map((t) => (
                  <div key={t.label} className={`up-tier ${rewardPts >= t.pts ? "up-tier-active" : ""}`} style={{ "--tier-color": t.color }}>
                    <span>{t.emoji}</span> {t.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ROW 2: AWARDS + QUOTE ────────────────────────── */}
          <div className="up-grid up-grid-2">

            {/* ── AWARDS / BADGES ──────────────────── */}
            <div className="up-card up-card-awards">
              <div className="up-card-icon-row">
                <div className="up-card-icon" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                  <IconAward />
                </div>
                <span className="up-card-badge" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>Awards</span>
              </div>
              <h3 className="up-card-title">Your Badges</h3>
              <p className="up-card-body">Achievements you've earned through hard work and dedication.</p>
              <div className="up-badges-wrap">
                <Badges employeeId={empId} />
              </div>
            </div>

            {/* ── QUOTE OF THE DAY ─────────────────── */}
            <div className="up-card up-card-quote">
              <div className="up-card-icon-row">
                <div className="up-card-icon" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
                  <span style={{ fontSize: 22 }}>✨</span>
                </div>
                <span className="up-card-badge" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>Daily Spark</span>
              </div>
              <div className="up-quote-body">
                <div className="up-quote-marks">"</div>
                <p className="up-quote-text">{quote.text}</p>
                <p className="up-quote-author">— {quote.author}</p>
              </div>

              {/* Survey nudge inside quote card */}
              <div className="up-survey-nudge">
                <div className="up-survey-nudge-left">
                  <span style={{ fontSize: 22 }}>📝</span>
                  <div>
                    <div className="up-survey-nudge-title">Your voice matters</div>
                    <div className="up-survey-nudge-sub">Takes under 2 minutes</div>
                  </div>
                </div>
                <button className="up-btn-primary up-btn-purple up-survey-nudge-btn" onClick={handleFeedback}>
                  Take Survey →
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>

      <Footer />

      {/* ── FIXED CHAT BAR (stays at bottom even on scroll) ── */}
      <div className="up-chat-fixed">
        <div className="up-chat-fixed-inner">
          <div className="up-chat-fixed-lottie">
            <Lottie animationData={animationData} loop style={{ width: 64, height: 54 }} />
          </div>
          <div className="up-chat-fixed-text">
            <h4 className="up-chat-fixed-title">Talk to WellBee</h4>
            <p className="up-chat-fixed-sub">{chatPrompt}</p>
          </div>
          <div className="up-chat-fixed-pills">
            {["Confidential", "AI-Powered", "24/7"].map((f) => (
              <span key={f} className="up-chat-fixed-pill">{f}</span>
            ))}
          </div>
          <button className="up-chat-fixed-btn" onClick={handleGoToChat}>
            <IconChat />
            Open Chat
          </button>
        </div>
      </div>

    </div>
  );
};

export default UserPage;
