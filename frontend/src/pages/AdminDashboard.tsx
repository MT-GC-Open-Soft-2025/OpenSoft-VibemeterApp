import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, TrendingUp, Users, AlertTriangle, ArrowUpDown } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { mapBackendUser, type MockUser, FEEDBACK_CATEGORIES } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllEmployees, getAggregateFeedback } from "@/api/admin";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(263, 76%, 51%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)",
  "hsl(199, 89%, 48%)", "hsl(340, 75%, 55%)",
];

type SortKey = "name-az" | "vibe-low" | "vibe-high" | "tier";

const sortEmployees = (list: MockUser[], sort: SortKey) => {
  const sorted = [...list];
  switch (sort) {
    case "name-az": return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "vibe-low": return sorted.sort((a, b) => a.vibeScore - b.vibeScore);
    case "vibe-high": return sorted.sort((a, b) => b.vibeScore - a.vibeScore);
    case "tier": {
      const order = ["Bronze", "Silver", "Gold", "Platinum"];
      return sorted.sort((a, b) => order.indexOf(a.rewardTier) - order.indexOf(b.rewardTier));
    }
    default: return sorted;
  }
};

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("vibe-low");
  const [employeeTab, setEmployeeTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<MockUser[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, fbData] = await Promise.all([
          getAllEmployees(),
          getAggregateFeedback().catch(() => null),
        ]);
        const mapped = (Array.isArray(empData) ? empData : []).filter((e: any) => e.role !== "admin").map(mapBackendUser);
        setEmployees(mapped);

        if (fbData) {
          // Map aggregate feedback data for charts
          if (fbData.monthly_data) setFeedbackData(fbData.monthly_data);
          if (fbData.distribution) {
            const dist = fbData.distribution;
            setPieData(
              Object.entries(dist).map(([name, value], i) => ({
                name,
                value,
                fill: CHART_COLORS[i % CHART_COLORS.length],
              }))
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const atRiskEmployees = employees.filter((e) => e.vibeScore < 2.5);
  const displayEmployees = employeeTab === "at-risk" ? atRiskEmployees : employees;

  const filteredEmployees = useMemo(() => {
    const filtered = displayEmployees.filter(
      (e) => e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
             e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return sortEmployees(filtered, sortKey);
  }, [searchQuery, sortKey, displayEmployees]);

  const avgVibeScore = employees.length > 0
    ? (employees.reduce((a, e) => a + e.vibeScore, 0) / employees.length).toFixed(1)
    : "0.0";

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-heading font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Organization wellness overview</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10"><Users className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{loading ? "..." : employees.length}</p>
                <p className="text-sm text-muted-foreground">Active Employees</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10"><TrendingUp className="h-6 w-6 text-success" /></div>
              <div>
                <p className="text-2xl font-bold">{loading ? "..." : avgVibeScore}</p>
                <p className="text-sm text-muted-foreground">Avg Vibe Score</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10"><AlertTriangle className="h-6 w-6 text-destructive" /></div>
              <div>
                <p className="text-2xl font-bold">{loading ? "..." : atRiskEmployees.length}</p>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {(feedbackData.length > 0 || pieData.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-6">
            {feedbackData.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">Feedback Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={feedbackData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis domain={[2, 5]} className="text-xs" />
                      <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                      {FEEDBACK_CATEGORIES.map((cat, i) => (
                        <Line key={cat} type="monotone" dataKey={cat} stroke={CHART_COLORS[i]} strokeWidth={2} dot={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            {pieData.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">Feedback Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Employee Search & List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
              <CardTitle className="text-lg font-heading">Employees</CardTitle>
              <Tabs value={employeeTab} onValueChange={setEmployeeTab}>
                <TabsList>
                  <TabsTrigger value="all">All ({employees.length})</TabsTrigger>
                  <TabsTrigger value="at-risk" className="gap-1">
                    <AlertTriangle className="h-3 w-3" /> At Risk ({atRiskEmployees.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex gap-3 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or employee ID..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <SelectTrigger className="w-48">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-az">Name A - Z</SelectItem>
                  <SelectItem value="vibe-low">Vibe Score Low</SelectItem>
                  <SelectItem value="vibe-high">Vibe Score High</SelectItem>
                  <SelectItem value="tier">Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => navigate(`/admin/employee/${emp.employeeId}`)}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-colors cursor-pointer ${
                      emp.vibeScore < 2.5 ? "bg-destructive/5 hover:bg-destructive/10 border border-destructive/20" : "hover:bg-accent/30"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {emp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{emp.name}</p>
                        {emp.vibeScore < 2.5 && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Needs Care</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{emp.employeeId} {emp.company ? `• ${emp.company}` : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${emp.vibeScore < 2.5 ? "text-destructive" : ""}`}>{emp.vibeScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">{emp.rewardTier}</p>
                    </div>
                  </div>
                ))}
                {filteredEmployees.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No employees found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
