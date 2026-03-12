import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { mapBackendAgent, mapBackendAuditEvent, type Agent, type AuditEvent } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import * as adminApi from "@/api/admin";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const CHART_COLORS = ["hsl(263, 76%, 51%)", "hsl(199, 89%, 48%)", "hsl(38, 92%, 50%)", "hsl(142, 71%, 45%)"];

const statusIcon = (status: string) => {
  if (status === "active") return <CheckCircle className="h-4 w-4 text-success" />;
  if (status === "inactive") return <XCircle className="h-4 w-4 text-destructive" />;
  return <AlertTriangle className="h-4 w-4 text-warning" />;
};

const healthStatusIcon = (status: string) => {
  if (status === "healthy") return <CheckCircle className="h-4 w-4 text-success" />;
  if (status === "unhealthy") return <XCircle className="h-4 w-4 text-destructive" />;
  return <AlertTriangle className="h-4 w-4 text-warning" />;
};

interface FormData {
  display_name: string;
  description: string;
  persona_key: string;
  greeting_style: string;
  avatar_key: string;
  theme_key: string;
  status: string;
  base_url: string;
  public_base_url: string;
  slug: string;
}

const emptyForm: FormData = {
  display_name: "", description: "", persona_key: "anchor", greeting_style: "",
  avatar_key: "anchor", theme_key: "anchor", status: "active", base_url: "", public_base_url: "", slug: "",
};

const AgentManagement = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [healthCheckLoading, setHealthCheckLoading] = useState<string | null>(null);
  const [runtimeMetrics, setRuntimeMetrics] = useState<any>(null);

  const fetchAgents = async () => {
    try {
      const response = await adminApi.getAgentsAdmin();
      const agentList = response.agents || response;
      setAgents((Array.isArray(agentList) ? agentList : []).map(mapBackendAgent));
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchAgents();
      try {
        const metrics = await adminApi.getRuntimeMetrics();
        setRuntimeMetrics(metrics);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const fetchAuditHistory = async (agentId: string) => {
    try {
      const data = await adminApi.getAgentHistory(agentId);
      return (Array.isArray(data) ? data : []).map(mapBackendAuditEvent);
    } catch {
      return [];
    }
  };

  const loadAllAuditEvents = async () => {
    const allEvents: AuditEvent[] = [];
    for (const agent of agents) {
      const events = await fetchAuditHistory(agent.id);
      allEvents.push(...events);
    }
    allEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    setAuditEvents(allEvents);
  };

  const openEdit = (agent: Agent) => {
    setFormData({
      display_name: agent.name,
      description: agent.description,
      persona_key: agent.personaKey || "anchor",
      greeting_style: agent.personality,
      avatar_key: agent.personaKey || "anchor",
      theme_key: agent.personaKey || "anchor",
      status: agent.status,
      base_url: agent.baseUrl || "",
      public_base_url: agent.publicBaseUrl || "",
      slug: agent.slug || "",
    });
    setEditAgent(agent);
    setShowForm(true);
  };

  const openCreate = () => {
    setFormData(emptyForm);
    setEditAgent(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.display_name) {
      toast.error("Name is required");
      return;
    }
    try {
      if (editAgent) {
        await adminApi.updateAgent(editAgent.id, formData);
        toast.success(`${formData.display_name} updated successfully`);
      } else {
        await adminApi.createAgent(formData);
        toast.success(`${formData.display_name} created successfully`);
      }
      await fetchAgents();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save agent");
    }
  };

  const runHealthCheck = async (agentId: string) => {
    setHealthCheckLoading(agentId);
    try {
      await adminApi.runAgentHealthcheck(agentId);
      toast.success("Health check completed");
      await fetchAgents();
    } catch {
      toast.error("Health check failed");
    } finally {
      setHealthCheckLoading(null);
    }
  };

  const sessionData = agents.map((a) => ({ name: a.name, sessions: a.sessionsCount }));
  const ratingData = agents.map((a, i) => ({ name: a.name, value: a.avgRating, fill: CHART_COLORS[i % CHART_COLORS.length] }));

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">Agent Management</h1>
            <p className="text-muted-foreground">Manage AI counselor agents</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Agent</Button>
        </motion.div>

        <Tabs defaultValue="list" onValueChange={(v) => { if (v === "audit") loadAllAuditEvents(); }}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">Agents</TabsTrigger>
            <TabsTrigger value="health">Health Check</TabsTrigger>
            <TabsTrigger value="audit">Audit History</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6 space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : (
              agents.map((agent) => (
                <Card key={agent.id} className="border-0 shadow-lg">
                  <CardContent className="p-5 flex items-center gap-4">
                    <span className="text-3xl">{agent.avatar}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-heading font-bold">{agent.name}</p>
                        {statusIcon(agent.status)}
                        {agent.personaKey && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground capitalize">{agent.personaKey}</span>
                        )}
                      </div>
                      <p className="text-sm text-primary">{agent.personality}</p>
                      <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground hidden sm:block">
                      <p>{agent.sessionsCount} sessions</p>
                      <p>Health: {agent.healthStatus}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openEdit(agent)}>Edit</Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <span className="text-4xl block mb-3">{agent.avatar}</span>
                    <p className="font-heading font-bold mb-2">{agent.name}</p>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {healthStatusIcon(agent.healthStatus || "unknown")}
                      <span className="text-sm capitalize">{agent.healthStatus || "unknown"}</span>
                    </div>
                    {runtimeMetrics && runtimeMetrics[agent.id] && (
                      <div className="space-y-2 text-sm text-left">
                        <div className="flex justify-between"><span className="text-muted-foreground">Avg TTFB</span><span className="font-medium">{runtimeMetrics[agent.id].avg_ttfb_ms?.toFixed(0) || "N/A"}ms</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Avg Duration</span><span className="font-medium">{runtimeMetrics[agent.id].avg_duration_ms?.toFixed(0) || "N/A"}ms</span></div>
                      </div>
                    )}
                    <Button
                      variant="outline" size="sm" className="mt-4 w-full"
                      onClick={() => runHealthCheck(agent.id)}
                      disabled={healthCheckLoading === agent.id}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${healthCheckLoading === agent.id ? "animate-spin" : ""}`} />
                      {healthCheckLoading === agent.id ? "Checking..." : "Run Health Check"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Agent</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditEvents.length > 0 ? auditEvents.map((event) => (
                        <tr key={event.id} className="border-b border-border hover:bg-accent/20 transition-colors">
                          <td className="p-4 text-sm font-mono text-muted-foreground">{event.timestamp}</td>
                          <td className="p-4 text-sm font-medium">{event.action}</td>
                          <td className="p-4 text-sm">{event.agentName}</td>
                          <td className="p-4 text-sm">{event.user}</td>
                          <td className="p-4 text-sm text-muted-foreground">{event.details}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No audit events found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle className="text-lg font-heading">Sessions per Agent</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sessionData}>
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                      <Bar dataKey="sessions" fill="hsl(263, 76%, 51%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader><CardTitle className="text-lg font-heading">Average Rating per Agent</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={ratingData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {ratingData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">{editAgent ? "Edit Agent" : "Create Agent"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} placeholder="Agent name" />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="agent-slug" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Greeting Style</Label>
                <Input value={formData.greeting_style} onChange={(e) => setFormData({ ...formData, greeting_style: e.target.value })} placeholder="e.g., Cheerful & Supportive" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the agent..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draining">Draining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Persona Key</Label>
                  <Select value={formData.persona_key} onValueChange={(v) => setFormData({ ...formData, persona_key: v, avatar_key: v, theme_key: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anchor">Anchor</SelectItem>
                      <SelectItem value="spark">Spark</SelectItem>
                      <SelectItem value="sage">Sage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input value={formData.base_url} onChange={(e) => setFormData({ ...formData, base_url: e.target.value })} placeholder="http://agent-runtime:8101" />
              </div>
              <div className="space-y-2">
                <Label>Public Base URL</Label>
                <Input value={formData.public_base_url} onChange={(e) => setFormData({ ...formData, public_base_url: e.target.value })} placeholder="https://agent.wellbee.live" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editAgent ? "Save Changes" : "Create Agent"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default AgentManagement;
