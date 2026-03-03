import apiClient from "./client";

export async function initiateChat(convoId) {
  const response = await apiClient.post(`/chat/initiate_chat/${convoId}`, {});
  return response.data;
}

export async function sendMessage(convid, message) {
  const response = await apiClient.post("/chat/send", { convid, message });
  return response.data;
}

export async function getChat(convId) {
  const response = await apiClient.get(`/chat/chat/${convId}`);
  return response.data;
}

export async function getChatFeedback(convId) {
  const response = await apiClient.get(`/chat/chat_feedback/${convId}`);
  return response.data;
}

export async function getFeedbackQuestions() {
  const response = await apiClient.get("/chat/feedback");
  return response.data;
}

export async function endChat(convoId, feedback) {
  const response = await apiClient.post(`/chat/end_chat/${convoId}`, { feedback });
  return response.data;
}

export async function addFeedback(payload) {
  const response = await apiClient.post("/chat/add_feedback", payload);
  return response.data;
}
