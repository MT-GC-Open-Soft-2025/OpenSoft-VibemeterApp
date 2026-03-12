import apiClient from "./client";

export async function signin(username: string, password: string) {
  const response = await apiClient.post("/auth/signin", { username, password });
  return response.data;
}
