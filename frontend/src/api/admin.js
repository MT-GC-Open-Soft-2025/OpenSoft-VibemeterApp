import apiClient from "./client";

export async function getAllEmployees() {
  const response = await apiClient.get("/admin/get_details");
  return response.data;
}

export async function getEmployeeDetail(employeeId) {
  const response = await apiClient.get(`/admin/get_detail/${employeeId}`);
  return response.data;
}

export async function getConversations(employeeId) {
  const response = await apiClient.get(`/admin/get_conversations/${employeeId}`);
  return response.data;
}

export async function getConversation(employeeId, convoId) {
  const response = await apiClient.get(`/admin/get_conversation/${employeeId}/${convoId}`);
  return response.data;
}

export async function getConversationFeedback(empId, convoId) {
  const response = await apiClient.get(`/admin/get_conversationFeedback/${empId}/${convoId}`);
  return response.data;
}

export async function getConversationSummary(empId, convoId) {
  const response = await apiClient.get(`/admin/get_conversationSummary/${empId}/${convoId}`);
  return response.data;
}

export async function getAggregateFeedback() {
  const response = await apiClient.get("/admin/get_aggregate_feedback");
  return response.data;
}
