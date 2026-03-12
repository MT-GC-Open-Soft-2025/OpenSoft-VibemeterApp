import apiClient, { baseUrl } from "./client";

export async function getAgents() {
  const response = await apiClient.get("/chat/agents");
  return response.data;
}

export async function initiateChat(convoId: string, agentId: string) {
  const response = await apiClient.post(`/chat/initiate_chat/${convoId}`, { agent_id: agentId });
  return response.data;
}

export async function sendMessage(convid: string, message: string) {
  const response = await apiClient.post("/chat/send", { convid, message });
  return response.data;
}

export function sendMessageStream(
  convid: string,
  message: string,
  onChunk: (text: string) => void,
  onError: (err: Error) => void,
  onDone?: () => void
): AbortController {
  const token = localStorage.getItem("token");
  const url = `${baseUrl}/chat/send_stream`;
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ convid, message }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(res.status === 401 ? "Unauthorized" : errBody || res.statusText);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) onChunk(data.text);
              if (data.error) onError(new Error(data.error));
              if (data.done && onDone) onDone();
            } catch {
              // skip malformed
            }
          }
        }
      }
      if (onDone) onDone();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        onError(err);
      }
    }
  })();

  return controller;
}

export function sendMessageStreamRedis(
  convid: string,
  message: string,
  onChunk: (text: string) => void,
  onError: (err: Error) => void,
  onDone?: () => void
): AbortController {
  const token = localStorage.getItem("token");
  const controller = new AbortController();

  (async () => {
    try {
      const startRes = await fetch(`${baseUrl}/chat/send_stream_redis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ convid, message }),
        signal: controller.signal,
      });

      if (!startRes.ok) {
        const errBody = await startRes.text();
        throw new Error(startRes.status === 401 ? "Unauthorized" : errBody || startRes.statusText);
      }

      const sseRes = await fetch(`${baseUrl}/chat/consume_stream/${convid}`, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "text/event-stream",
        },
        signal: controller.signal,
      });

      if (!sseRes.ok) {
        const errBody = await sseRes.text();
        throw new Error(sseRes.status === 401 ? "Unauthorized" : errBody || sseRes.statusText);
      }

      const reader = sseRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) onChunk(data.text);
              if (data.error) onError(new Error(data.error));
              if (data.done && onDone) onDone();
            } catch {
              // skip malformed
            }
          }
        }
      }
      if (onDone) onDone();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        onError(err);
      }
    }
  })();

  return controller;
}

export function sendMessageToAgent(opts: {
  baseUrl: string;
  sendPath: string;
  sessionToken: string;
  message: string;
  onChunk: (text: string) => void;
  onError: (err: Error) => void;
  onDone?: () => void;
}): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${opts.baseUrl}${opts.sendPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.sessionToken}`,
        },
        body: JSON.stringify({ message: opts.message }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || res.statusText);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) opts.onChunk(data.text);
            if (data.error) opts.onError(new Error(data.error));
            if (data.done && opts.onDone) opts.onDone();
          } catch {
            // ignore malformed
          }
        }
      }
      if (opts.onDone) opts.onDone();
    } catch (err: any) {
      if (err.name !== "AbortError") opts.onError(err);
    }
  })();

  return controller;
}

export async function getChat(convId: string) {
  const response = await apiClient.get(`/chat/chat/${convId}`);
  return response.data;
}

export async function getChatFeedback(convId: string) {
  const response = await apiClient.get(`/chat/chat_feedback/${convId}`);
  return response.data;
}

export async function getFeedbackQuestions() {
  const response = await apiClient.get("/chat/feedback");
  return response.data;
}

export async function endChat(convoId: string, feedback: string) {
  const response = await apiClient.post(`/chat/end_chat/${convoId}`, { feedback });
  return response.data;
}

export async function addFeedback(payload: Record<string, any>) {
  const response = await apiClient.post("/chat/add_feedback", payload);
  return response.data;
}
