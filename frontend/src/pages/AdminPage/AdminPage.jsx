import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/AppShell/AppShell';
import Footer from '@/components/Footer/Footer';
import PerformanceGraph from '@/components/Admin_page _components/Admin_performance_rewards/PerformanceGraph';
import Rewards from '@/components/Admin_page _components/Admin_performance_rewards/Rewards';
import Badges from '@/components/Badges/Badges';
import EmotionZoneChart from './EmotionZone';
import EmotionZoneChart2 from './EmotionZone2';
import EmojiMeter from '@/components/Admin_page _components/Admin_performance_rewards/EmojiMeter';
import { useAdminData } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllEmployees, getEmployeeDetail } from '@/api/admin';
import user1 from '@/Assets/user.png';

/* ── Inline employee search (replaces old SearchBar) ─────────── */
const EmployeeSearch = ({ onSelect }) => {
  const [term, setTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    getAllEmployees()
      .then(r => {
        const list = r.employees || [];
        setEmployees(list.map(e => (typeof e === 'string' ? e : e.emp_id)));
      })
      .catch(() => setEmployees([]));
  }, []);

  const validate = (v) => /^EMP\d{4}$/.test(v);

  const handleChange = (e) => {
    const v = e.target.value.toUpperCase();
    setTerm(v);
    setError('');
    if (!v) { setOpen(false); return; }
    if (!validate(v) && v.length >= 7) { setError('Use format EMPXXXX'); setOpen(false); return; }
    setOpen(employees.filter(emp => emp.startsWith(v)).length > 0);
  };

  const handleSearch = async () => {
    if (!validate(term)) { setError('Use format EMPXXXX'); return; }
    setLoading(true);
    try {
      const res = await getEmployeeDetail(term);
      if (res && Object.keys(res).length > 0) {
        onSelect(term);
        setTerm('');
        setOpen(false);
      } else {
        setError('Employee not found.');
      }
    } catch {
      setError('Employee not found or no permission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <Input
            value={term}
            onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search EMPXXXX…"
            className="pl-9 text-sm"
          />
          {open && (
            <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {employees.filter(emp => emp.startsWith(term)).map(emp => (
                <li
                  key={emp}
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-700 font-medium"
                  onClick={() => { setTerm(emp); setOpen(false); }}
                >
                  {emp}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button onClick={handleSearch} disabled={loading} size="sm" className="bg-[hsl(var(--primary))]">
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

/* ── AdminPage ───────────────────────────────────────────────── */
const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [activeTab, setActiveTab] = useState('employees');

  const admin = useAdminData(activeTab === 'agents');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'agents') admin.loadRuntimeMetrics?.();
  };

  const handleGetFeedback = () => {
    if (!selectedEmployee) return;
    localStorage.setItem('selectedEmployee', selectedEmployee);
    navigate('/feedback');
  };

  return (
    <AppShell title="Admin Dashboard">
      <div className="max-w-7xl mx-auto space-y-5 pb-8">

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* ── Tab controls + search ──────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-foreground">Admin Dashboard</h2>
              <p className="text-sm text-muted-foreground">Overview of employee performance, moods, and feedback.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === 'employees' && (
                <EmployeeSearch onSelect={(id) => setSelectedEmployee(id)} />
              )}
              {selectedEmployee && activeTab === 'employees' && (
                <Button variant="outline" size="sm" onClick={() => setSelectedEmployee('')}>
                  ← Back
                </Button>
              )}
              <TabsList>
                <TabsTrigger value="employees">Employees</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* ── EMPLOYEES TAB ──────────────────────────────── */}
          <TabsContent value="employees" className="mt-0">
            {selectedEmployee ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Profile card */}
                <Card className="shadow-sm">
                  <CardContent className="flex flex-col items-center text-center gap-4 pt-6">
                    <img src={user1} alt="Employee" className="w-20 h-20 rounded-full shadow-md object-cover" />
                    <div>
                      <p className="font-bold text-foreground text-sm">Employee ID</p>
                      <p className="text-base font-extrabold text-[hsl(var(--primary))]">{selectedEmployee}</p>
                    </div>
                    <Badge className="bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-transparent hover:bg-[hsl(var(--primary))]/10">
                      Active Member
                    </Badge>
                    <div className="w-full">
                      <Badges employeeId={selectedEmployee} />
                    </div>
                    <Button className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90" onClick={handleGetFeedback}>
                      View Feedback
                    </Button>
                  </CardContent>
                </Card>

                {/* Performance section */}
                <div className="xl:col-span-2 flex flex-col gap-5">
                  <Card className="shadow-sm">
                    <CardContent className="pt-5">
                      <EmojiMeter employeeId={selectedEmployee} />
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm flex-1">
                    <CardContent className="pt-5">
                      <PerformanceGraph employeeId={selectedEmployee} />
                    </CardContent>
                  </Card>
                </div>

                {/* Rewards */}
                <div className="xl:col-span-3">
                  <Card className="shadow-sm">
                    <CardContent className="pt-5">
                      <Rewards employeeId={selectedEmployee} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <Card className="shadow-sm"><CardContent className="pt-5"><EmotionZoneChart /></CardContent></Card>
                <Card className="shadow-sm"><CardContent className="pt-5"><EmotionZoneChart2 /></CardContent></Card>
              </div>
            )}
          </TabsContent>

          {/* ── AGENTS TAB ─────────────────────────────────── */}
          <TabsContent value="agents" className="mt-0">
            <div className="grid grid-cols-1 xl:grid-cols-7 gap-5">

              {/* Agent table */}
              <div className="xl:col-span-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Registered Agents</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">Manage personas, locations, and health status.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={admin.resetForm}>
                        + New Agent
                      </Button>
                    </div>
                    {admin.agentMessage && (
                      <div className="mt-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md">{admin.agentMessage}</div>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="text-xs font-semibold">Name</TableHead>
                            <TableHead className="text-xs font-semibold">Persona</TableHead>
                            <TableHead className="text-xs font-semibold">Status</TableHead>
                            <TableHead className="text-xs font-semibold">Health</TableHead>
                            <TableHead className="w-28" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {admin.agents.map(agent => (
                            <TableRow key={agent.agent_id} className="hover:bg-slate-50/50">
                              <TableCell className="font-medium text-sm">{agent.display_name}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{agent.persona_key}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {agent.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                                  agent.health_status === 'healthy' ? 'text-emerald-600' : 'text-amber-600'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    agent.health_status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`} />
                                  {agent.health_status || '—'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => admin.openEditAgent(agent)}>Edit</Button>
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[hsl(var(--primary))]" onClick={() => admin.triggerHealthcheck(agent.agent_id)}>Check</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {admin.agents.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground py-10 text-sm">
                                No agents configured yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column: form + history */}
              <div className="xl:col-span-3 flex flex-col gap-5">

                {/* Create / Edit form */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{admin.editingAgentId ? 'Edit Agent' : 'Create Agent'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(admin.agentForm).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">{key.replaceAll('_', ' ')}</Label>
                        {key === 'status' || key === 'persona_key' ? (
                          <Select value={value} onValueChange={(v) => admin.updateField(key, v)}>
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(key === 'status'
                                ? ['active', 'inactive', 'draining']
                                : ['anchor', 'spark', 'sage']
                              ).map(opt => (
                                <SelectItem key={opt} value={opt} className="text-sm capitalize">{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={value}
                            onChange={e => admin.updateField(key, e.target.value)}
                            className="h-8 text-sm"
                          />
                        )}
                      </div>
                    ))}
                    <Button className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 mt-2" onClick={admin.submitAgentForm}>
                      {admin.editingAgentId ? 'Save Changes' : 'Create Agent'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Location history */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Lifecycle History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {admin.selectedAgentId ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {admin.agentHistory.map(event => (
                          <div key={event.event_id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                            <p className="text-xs font-semibold text-foreground">{event.event_type}</p>
                            <p className="text-[11px] text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                            {event.changed_fields?.length > 0 && (
                              <p className="text-[11px] text-slate-500 mt-1">Changed: {event.changed_fields.join(', ')}</p>
                            )}
                          </div>
                        ))}
                        {admin.agentHistory.length === 0 && (
                          <p className="text-sm text-muted-foreground">No events recorded yet.</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Select an agent to view its history.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Runtime Metrics */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Runtime Metrics</CardTitle>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={admin.loadRuntimeMetrics}>
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {admin.runtimeMetrics === null ? (
                      <p className="text-sm text-muted-foreground">Loading metrics…</p>
                    ) : !admin.runtimeMetrics.available ? (
                      <p className="text-sm text-muted-foreground">Redis not available — metrics unavailable.</p>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary stat cards */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-center">
                            <p className="text-[11px] text-muted-foreground">Avg TTFB</p>
                            <p className="text-base font-bold text-foreground">{admin.runtimeMetrics.avg_ttfb_ms} ms</p>
                          </div>
                          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-center">
                            <p className="text-[11px] text-muted-foreground">Avg Duration</p>
                            <p className="text-base font-bold text-foreground">{admin.runtimeMetrics.avg_duration_ms} ms</p>
                          </div>
                          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-center">
                            <p className="text-[11px] text-muted-foreground">Recent Streams</p>
                            <p className="text-base font-bold text-foreground">{admin.runtimeMetrics.recent_count}</p>
                          </div>
                        </div>
                        {/* Recent streams table */}
                        {admin.runtimeMetrics.streams.length > 0 && (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                  <TableHead className="text-xs font-semibold">Conversation ID</TableHead>
                                  <TableHead className="text-xs font-semibold">TTFB (ms)</TableHead>
                                  <TableHead className="text-xs font-semibold">Duration (ms)</TableHead>
                                  <TableHead className="text-xs font-semibold">Chunks</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {admin.runtimeMetrics.streams.map(s => (
                                  <TableRow key={s.convid} className="hover:bg-slate-50/50">
                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                      {s.convid.length > 16 ? `…${s.convid.slice(-16)}` : s.convid}
                                    </TableCell>
                                    <TableCell className="text-xs">{s.ttfb_ms}</TableCell>
                                    <TableCell className="text-xs">{s.duration_ms}</TableCell>
                                    <TableCell className="text-xs">{s.chunk_count}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                        {admin.runtimeMetrics.streams.length === 0 && (
                          <p className="text-sm text-muted-foreground">No stream metrics recorded yet.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
      <Footer />
    </AppShell>
  );
};

export default AdminPage;
