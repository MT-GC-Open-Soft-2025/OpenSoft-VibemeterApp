import apiClient from "./client";

export async function getUserDetails() {
  const response = await apiClient.get("/user/getUserDetails");
  return response.data;
}

export async function getConvoids() {
  const response = await apiClient.get("/user/getConvoids");
  return response.data;
}
