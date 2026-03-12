import apiClient from "./client";

export async function getAllEmployees() {
  const response = await apiClient.get("/admin/get_details");
  return response.data;
}

export async function getEmployeeDetail(employeeId: string) {
  const response = await apiClient.get(`/admin/get_detail/${employeeId}`);
  return response.data;
}

export async function getConversations(employeeId: string) {
  const response = await apiClient.get(`/admin/get_conversations/${employeeId}`);
  return response.data;
}

export async function getConversation(employeeId: string, convoId: string) {
  const response = await apiClient.get(`/admin/get_conversation/${employeeId}/${convoId}`);
  return response.data;
}

export async function getConversationFeedback(empId: string, convoId: string) {
  const response = await apiClient.get(`/admin/get_conversationFeedback/${empId}/${convoId}`);
  return response.data;
}

export async function getConversationSummary(empId: string, convoId: string) {
  const response = await apiClient.get(`/admin/get_conversationSummary/${empId}/${convoId}`);
  return response.data;
}

export async function getAggregateFeedback() {
  const response = await apiClient.get("/admin/get_aggregate_feedback");
  return response.data;
}

export async function getAgentsAdmin() {
  const response = await apiClient.get("/admin/agents");
  return response.data;
}

export async function createAgent(payload: Record<string, any>) {
  const response = await apiClient.post("/admin/agents", payload);
  return response.data;
}

export async function updateAgent(agentId: string, payload: Record<string, any>) {
  const response = await apiClient.patch(`/admin/agents/${agentId}`, payload);
  return response.data;
}

export async function getAgentHistory(agentId: string) {
  const response = await apiClient.get(`/admin/agents/${agentId}/history`);
  return response.data;
}

export async function runAgentHealthcheck(agentId: string) {
  const response = await apiClient.post(`/admin/agents/${agentId}/healthcheck`);
  return response.data;
}

export async function getRuntimeMetrics() {
  const response = await apiClient.get("/admin/runtime-metrics");
  return response.data;
}
