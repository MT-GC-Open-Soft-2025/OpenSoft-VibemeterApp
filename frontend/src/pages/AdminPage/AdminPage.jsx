import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminPage.css";
import Footer from "../../components/Footer/Footer";
import PerformanceGraph from "../../components/Admin_page _components/Admin_performance_rewards/PerformanceGraph";
import Rewards from "../../components/Admin_page _components/Admin_performance_rewards/Rewards";
import Badges from "../../components/Badges/Badges";
import EmotionZoneChart from "./EmotionZone";
import EmotionZoneChart2 from "./EmotionZone2";
import Sidebar from "../../components/Admin_page _components/Admin_sidebar/Adminpagesidebar";
import Navbar from "../../components/Search-bar/SearchBar";
import Feedbacknavbar from "../../components/Feedback_navbar/Feedbacknavbar2";
import user1 from "../../Assets/user.png";
import EmojiMeter from "../../components/Admin_page _components/Admin_performance_rewards/EmojiMeter.jsx";
import {
  createAgent,
  getAgentHistory,
  getAgentsAdmin,
  runAgentHealthcheck,
  updateAgent,
} from "../../api/admin";

const EMPTY_AGENT_FORM = {
  display_name: "",
  slug: "",
  description: "",
  persona_key: "anchor",
  greeting_style: "",
  avatar_key: "default",
  theme_key: "default",
  base_url: "",
  public_base_url: "",
  status: "active",
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [activeSection, setActiveSection] = useState("employees");
  const [agents, setAgents] = useState([]);
  const [agentHistory, setAgentHistory] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [agentForm, setAgentForm] = useState(EMPTY_AGENT_FORM);
  const [editingAgentId, setEditingAgentId] = useState(null);
  const [agentMessage, setAgentMessage] = useState("");

  const handlegetfeedback = () => {
    if (!selectedEmployee) return;
    localStorage.setItem("selectedEmployee", selectedEmployee);
    navigate("/feedback");
  };

  const handlegetBack = () => {
    window.location.reload();
  };

  const loadAgents = async () => {
    try {
      const res = await getAgentsAdmin();
      setAgents(res.agents || []);
    } catch {
      setAgentMessage("Failed to load agents.");
    }
  };

  useEffect(() => {
    if (activeSection === "agents") {
      loadAgents();
    }
  }, [activeSection]);

  const openEditAgent = async (agent) => {
    setEditingAgentId(agent.agent_id);
    setSelectedAgentId(agent.agent_id);
    setAgentForm({
      display_name: agent.display_name,
      slug: agent.slug,
      description: agent.description,
      persona_key: agent.persona_key,
      greeting_style: agent.greeting_style,
      avatar_key: agent.avatar_key,
      theme_key: agent.theme_key,
      base_url: agent.base_url,
      public_base_url: agent.public_base_url,
      status: agent.status,
    });
    const res = await getAgentHistory(agent.agent_id);
    setAgentHistory(res.history || []);
  };

  const submitAgentForm = async () => {
    setAgentMessage("");
    try {
      if (editingAgentId) {
        await updateAgent(editingAgentId, agentForm);
        setAgentMessage("Agent updated.");
      } else {
        await createAgent(agentForm);
        setAgentMessage("Agent created.");
      }
      setAgentForm(EMPTY_AGENT_FORM);
      setEditingAgentId(null);
      await loadAgents();
    } catch (error) {
      setAgentMessage(error?.response?.data?.detail || "Unable to save agent.");
    }
  };

  const triggerHealthcheck = async (agentId) => {
    try {
      await runAgentHealthcheck(agentId);
      setAgentMessage("Healthcheck completed.");
      await loadAgents();
      if (selectedAgentId === agentId) {
        const res = await getAgentHistory(agentId);
        setAgentHistory(res.history || []);
      }
    } catch {
      setAgentMessage("Healthcheck failed.");
    }
  };

  return (
    <>
      <Feedbacknavbar title="Admin Page" />
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-main-content p-4 w-100" style={{ backgroundColor: "var(--wb-bg-main, #f8f9fa)", boxSizing: "border-box" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Navbar setSelectedEmployee={setSelectedEmployee} />
            <div className="d-flex gap-2">
              <button
                className={`btn rounded-pill px-4 py-2 fw-semibold ${activeSection === "employees" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setActiveSection("employees")}
              >
                Employees
              </button>
              <button
                className={`btn rounded-pill px-4 py-2 fw-semibold ${activeSection === "agents" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setActiveSection("agents")}
              >
                Agents
              </button>
              {selectedEmployee && activeSection === "employees" && (
                <button className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold" onClick={handlegetBack}>
                  Back
                </button>
              )}
            </div>
          </div>

          {activeSection === "employees" ? (
            <>
              <div className="text-container text-start mb-4 mt-2">
                <h3 className="fw-bold mb-1" style={{ color: "var(--wb-text-main, #212529)" }}>Admin Dashboard</h3>
                <p className="text-muted">Overview of employee performance, moods, and feedback.</p>
              </div>

              {selectedEmployee ? (
                <div className="row g-4 mt-2">
                  <div className="col-12 col-xl-4 d-flex">
                    <div className="card w-100 border-0 shadow-sm p-4 admin-bento-card">
                      <div className="profile-container d-flex flex-column align-items-center mb-4 text-center">
                        <img src={user1} alt="User Icon" className="profile-icon mb-3 shadow-sm" style={{ width: "100px", height: "100px" }} />
                        <h5 className="profile-user mb-1">Employee ID: {selectedEmployee}</h5>
                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mt-2">Active Member</span>
                      </div>
                      <div className="flex-grow-1">
                        <Badges employeeId={selectedEmployee} />
                      </div>
                      <button className="btn btn-primary w-100 mt-4 shadow-sm rounded-pill py-2 fw-semibold" onClick={handlegetfeedback}>
                        Get Feedback
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-xl-8 d-flex flex-column gap-4">
                    <div className="card border-0 shadow-sm p-4 admin-bento-card">
                      <EmojiMeter employeeId={selectedEmployee} />
                    </div>
                    <div className="card border-0 shadow-sm p-4 admin-bento-card flex-grow-1">
                      <PerformanceGraph employeeId={selectedEmployee} />
                    </div>
                  </div>

                  <div className="col-12 mt-4">
                    <div className="card border-0 shadow-sm p-4 admin-bento-card">
                      <Rewards employeeId={selectedEmployee} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="charts">
                    <EmotionZoneChart />
                  </div>
                  <div className="charts">
                    <EmotionZoneChart2 />
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="row g-4 mt-2">
              <div className="col-12 col-xl-7">
                <div className="card border-0 shadow-sm p-4 admin-bento-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="fw-bold mb-1">Registered Agents</h4>
                      <p className="text-muted mb-0">Manage locations, personas, and health status for each runtime.</p>
                    </div>
                    <button
                      className="btn btn-outline-primary rounded-pill px-4"
                      onClick={() => {
                        setEditingAgentId(null);
                        setSelectedAgentId(null);
                        setAgentHistory([]);
                        setAgentForm(EMPTY_AGENT_FORM);
                      }}
                    >
                      New Agent
                    </button>
                  </div>
                  {agentMessage && <div className="alert alert-secondary py-2">{agentMessage}</div>}
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Persona</th>
                          <th>Status</th>
                          <th>Public URL</th>
                          <th>Health</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {agents.map((agent) => (
                          <tr key={agent.agent_id}>
                            <td>{agent.display_name}</td>
                            <td>{agent.persona_key}</td>
                            <td><span className="badge text-bg-light">{agent.status}</span></td>
                            <td>{agent.public_base_url}</td>
                            <td>{agent.health_status}</td>
                            <td className="text-end d-flex gap-2 justify-content-end">
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => openEditAgent(agent)}>Edit</button>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => triggerHealthcheck(agent.agent_id)}>Healthcheck</button>
                            </td>
                          </tr>
                        ))}
                        {agents.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-4">No agents configured.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-5 d-flex flex-column gap-4">
                <div className="card border-0 shadow-sm p-4 admin-bento-card">
                  <h4 className="fw-bold mb-3">{editingAgentId ? "Edit Agent" : "Create Agent"}</h4>
                  <div className="row g-3">
                    {Object.entries(agentForm).map(([key, value]) => (
                      <div className="col-12" key={key}>
                        <label className="form-label text-capitalize">{key.replaceAll("_", " ")}</label>
                        {key === "status" || key === "persona_key" ? (
                          <select
                            className="form-select"
                            value={value}
                            onChange={(e) => setAgentForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          >
                            {key === "status"
                              ? ["active", "inactive", "draining"].map((option) => <option key={option} value={option}>{option}</option>)
                              : ["anchor", "spark", "sage"].map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        ) : (
                          <input
                            className="form-control"
                            value={value}
                            onChange={(e) => setAgentForm((prev) => ({ ...prev, [key]: e.target.value }))}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-primary mt-4 rounded-pill" onClick={submitAgentForm}>
                    {editingAgentId ? "Save Agent" : "Create Agent"}
                  </button>
                </div>

                <div className="card border-0 shadow-sm p-4 admin-bento-card">
                  <h4 className="fw-bold mb-3">Location History</h4>
                  {selectedAgentId ? (
                    <div className="d-flex flex-column gap-3">
                      {agentHistory.map((event) => (
                        <div key={event.event_id} className="border rounded-4 p-3 bg-light">
                          <div className="fw-semibold">{event.event_type}</div>
                          <div className="small text-muted">{new Date(event.timestamp).toLocaleString()}</div>
                          <div className="small mt-1">Changed fields: {event.changed_fields.join(", ") || "None"}</div>
                          <div className="small">Base URL: {event.new_base_url || "-"}</div>
                          <div className="small">Public URL: {event.new_public_base_url || "-"}</div>
                          <div className="small">Status: {event.new_status || "-"}</div>
                        </div>
                      ))}
                      {agentHistory.length === 0 && <div className="text-muted">No lifecycle events recorded yet.</div>}
                    </div>
                  ) : (
                    <div className="text-muted">Select an agent to inspect its lifecycle history.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPage;
