import { motion } from "framer-motion";
import { User, Briefcase, Calendar, Clock, Star, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const tiers = ["Bronze", "Silver", "Gold", "Platinum"];

const Profile = () => {
  const { user } = useAuth();
  if (!user) return null;

  const tierProgress = ((tiers.indexOf(user.rewardTier) + 1) / tiers.length) * 100;

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-heading font-bold">My Profile</h1>
          <p className="text-muted-foreground">Your account details and stats</p>
        </motion.div>

        {/* Personal Info */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                {user.avatar}
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{user.employeeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="font-medium">{user.company}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Leave Balance</p>
                <p className="text-lg font-bold">{user.leaveDaysTotal - user.leaveDaysUsed} / {user.leaveDaysTotal}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10"><Clock className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Hours This Week</p>
                <p className="text-lg font-bold">{user.workHoursThisWeek}h</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10"><Star className="h-5 w-5 text-warning" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Performance</p>
                <p className="text-lg font-bold">{user.performanceScore.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent"><Award className="h-5 w-5 text-accent-foreground" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Reward Points</p>
                <p className="text-lg font-bold">{user.rewardPoints}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reward Tier */}
        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="text-lg font-heading">Reward Tier</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-heading font-bold text-primary mb-3">{user.rewardTier}</p>
            <Progress value={tierProgress} className="h-3 mb-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {tiers.map((t) => <span key={t}>{t}</span>)}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="border-0 shadow-lg">
          <CardHeader><CardTitle className="text-lg font-heading">Badges Earned</CardTitle></CardHeader>
          <CardContent>
            {user.badges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {user.badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center p-4 rounded-xl bg-accent/30">
                    <span className="text-3xl mb-2">{badge.icon}</span>
                    <span className="text-sm font-medium text-center">{badge.name}</span>
                    <span className="text-xs text-muted-foreground">{badge.earnedAt}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No badges earned yet. Start chatting to earn badges!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
