import apiClient from "./client";

export async function signin(username, password) {
  const response = await apiClient.post("/auth/signin", { username, password });
  return response.data;
}
