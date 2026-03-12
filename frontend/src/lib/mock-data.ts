// ── User Type (frontend representation) ──
export interface MockUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  company: string;
  role: "employee" | "admin";
  avatar: string;
  vibeScore: number;
  rewardPoints: number;
  rewardTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  badges: Badge[];
  leaveDaysUsed: number;
  leaveDaysTotal: number;
  workHoursThisWeek: number;
  performanceScore: number;
  chatStreak: number;
  lastSurveyDate: string | null;
  surveysCompleted: number;
  vibeHistory: { date: string; score: number }[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

// ── Map backend employee to frontend user ──
function computeRewardTier(points: number): "Bronze" | "Silver" | "Gold" | "Platinum" {
  if (points >= 800) return "Platinum";
  if (points >= 500) return "Gold";
  if (points >= 200) return "Silver";
  return "Bronze";
}

const BADGE_ICONS: Record<string, string> = {
  "First Chat": "💬",
  "Survey Star": "⭐",
  "Streak 7": "🔥",
  "Mindful": "🧘",
  "Wellness Guru": "🌟",
  "Team Player": "🤝",
};

export function mapBackendUser(data: any): MockUser {
  const empId = data.emp_id || data.employeeId || "";
  const rewardPoints = data.reward_points ?? 0;
  const awardList: string[] = data.award_list ?? [];
  const badges: Badge[] = awardList.map((name: string, i: number) => ({
    id: `b-${i}`,
    name,
    icon: BADGE_ICONS[name] || "🏆",
    earnedAt: "",
  }));

  return {
    id: empId,
    employeeId: empId,
    name: data.name || empId,
    email: data.email || "",
    company: data.company || "",
    role: data.role || "employee",
    avatar: (data.name ? data.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2) : empId.slice(0, 2)).toUpperCase(),
    vibeScore: data.vibe_score ?? 0,
    rewardPoints,
    rewardTier: computeRewardTier(rewardPoints),
    badges,
    leaveDaysUsed: data.leave_days ?? 0,
    leaveDaysTotal: data.leave_days_total ?? 18,
    workHoursThisWeek: data.total_work_hours ?? 0,
    performanceScore: data.weighted_performance ?? 0,
    chatStreak: data.chat_streak ?? 0,
    lastSurveyDate: data.last_survey_date ?? null,
    surveysCompleted: data.surveys_completed ?? 0,
    vibeHistory: data.vibe_history ?? [],
  };
}

export const COMPANIES = ["Deloitte", "Accenture", "Infosys", "TCS", "Wipro"];

// ── AI Agents ──
export interface Agent {
  id: string;
  name: string;
  personality: string;
  description: string;
  avatar: string;
  color: string;
  status: "active" | "inactive" | "maintenance";
  personaKey?: "anchor" | "spark" | "sage";
  baseUrl?: string;
  publicBaseUrl?: string;
  createdAt: string;
  sessionsCount: number;
  avgRating: number;
  healthStatus?: string;
  slug?: string;
}

const AGENT_AVATARS: Record<string, string> = {
  anchor: "🌈",
  spark: "⚡",
  sage: "🦉",
};

const AGENT_COLORS: Record<string, string> = {
  anchor: "hsl(263, 76%, 51%)",
  spark: "hsl(38, 92%, 50%)",
  sage: "hsl(199, 89%, 48%)",
};

const AGENT_PERSONALITIES: Record<string, string> = {
  anchor: "Cheerful & Supportive",
  spark: "Energetic & Motivational",
  sage: "Calm & Wise",
};

export function mapBackendAgent(data: any): Agent {
  const personaKey = data.persona_key || "anchor";
  return {
    id: data.agent_id || data.id || "",
    name: data.display_name || data.name || "",
    personality: data.greeting_style || AGENT_PERSONALITIES[personaKey] || "Supportive",
    description: data.description || "",
    avatar: AGENT_AVATARS[data.avatar_key || personaKey] || "🤖",
    color: AGENT_COLORS[data.theme_key || personaKey] || "hsl(263, 76%, 51%)",
    status: data.status || "active",
    personaKey: personaKey as "anchor" | "spark" | "sage",
    baseUrl: data.base_url || "",
    publicBaseUrl: data.public_base_url || "",
    createdAt: data.created_at || "",
    sessionsCount: data.sessions_count ?? 0,
    avgRating: data.avg_rating ?? 0,
    healthStatus: data.health_status || "unknown",
    slug: data.slug || "",
  };
}

// ── Chat Types ──
export interface ChatSession {
  id: string;
  agentId: string;
  agentName: string;
  date: string;
  preview: string;
  rating?: number;
  sentiment?: "positive" | "neutral" | "negative";
  topic?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ── Survey Questions ──
export const SURVEY_QUESTIONS = [
  "I felt heard and understood during the conversation.",
  "The AI counselor provided helpful and relevant advice.",
  "I feel better after this chat session.",
  "I would recommend this platform to a colleague.",
  "The overall experience met my expectations.",
];

// ── Motivational Quotes ──
export const MOTIVATIONAL_QUOTES = [
  { text: "The greatest wealth is health.", author: "Virgil" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Your calm mind is the ultimate weapon against your challenges.", author: "Bryant McGill" },
  { text: "Happiness is the highest form of health.", author: "Dalai Lama" },
  { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde" },
];

// ── Admin Charts (feedback categories) ──
export const FEEDBACK_CATEGORIES = [
  "Current Project", "Mentor Interaction", "Leaves System", "Vibemeter App", "Work Area Setup"
] as const;

// ── Audit Events ──
export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  agentId: string;
  agentName: string;
  user: string;
  details: string;
}

export function mapBackendAuditEvent(data: any): AuditEvent {
  return {
    id: data.event_id || data.id || "",
    timestamp: data.timestamp || "",
    action: data.event_type || "",
    agentId: data.agent_id || "",
    agentName: data.agent_name || data.agent_id || "",
    user: data.changed_by || "System",
    details: data.notes || data.changed_fields?.join(", ") || "",
  };
}
