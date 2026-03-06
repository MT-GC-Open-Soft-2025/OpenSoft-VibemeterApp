import apiClient from "./client";
import baseUrl from "../Config";

export async function getAgents() {
  const response = await apiClient.get("/chat/agents");
  return response.data;
}

export async function initiateChat(convoId, agentId) {
  const response = await apiClient.post(`/chat/initiate_chat/${convoId}`, { agent_id: agentId });
  return response.data;
}

export async function sendMessage(convid, message) {
  const response = await apiClient.post("/chat/send", { convid, message });
  return response.data;
}

/**
 * Send a message and stream the AI response via SSE.
 * @param {string} convid - Conversation ID
 * @param {string} message - User message
 * @param {function(string): void} onChunk - Called with each text chunk as it arrives
 * @param {function(Error): void} onError - Called on error
 * @param {function(): void} [onDone] - Called when stream completes successfully
 * @returns {AbortController} Controller to abort the request
 */
export function sendMessageStream(convid, message, onChunk, onError, onDone) {
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

      const reader = res.body.getReader();
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
    } catch (err) {
      if (err.name !== "AbortError") {
        onError(err);
      }
    }
  })();

  return controller;
}

/**
 * Send a message and stream the AI response via Redis Streams–backed SSE.
 * Identical signature to sendMessageStream — switch with one import change.
 *
 * The backend POST starts the AI producer as a background task, then issues a
 * 303 redirect to GET /chat/consume_stream/:convid.  fetch follows the redirect
 * transparently, so the response body here is the live SSE stream from Redis.
 *
 * Requires REDIS_URL to be configured on the backend (returns an onError call otherwise).
 *
 * @param {string} convid
 * @param {string} message
 * @param {function(string): void} onChunk
 * @param {function(Error): void} onError
 * @param {function(): void} [onDone]
 * @returns {AbortController}
 */
export function sendMessageStreamRedis(convid, message, onChunk, onError, onDone) {
  const token = localStorage.getItem("token");
  const url = `${baseUrl}/chat/send_stream_redis`;
  const controller = new AbortController();

  (async () => {
    try {
      // POST starts the producer; the server 303-redirects to the SSE consumer.
      // fetch follows the redirect automatically — res.body is the SSE stream.
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ convid, message }),
        signal: controller.signal,
        redirect: "follow",
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(res.status === 401 ? "Unauthorized" : errBody || res.statusText);
      }

      const reader = res.body.getReader();
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
    } catch (err) {
      if (err.name !== "AbortError") {
        onError(err);
      }
    }
  })();

  return controller;
}

export function sendMessageToAgent({
  baseUrl: agentBaseUrl,
  sendPath,
  sessionToken,
  message,
  onChunk,
  onError,
  onDone,
}) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${agentBaseUrl}${sendPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || res.statusText);
      }

      const reader = res.body.getReader();
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
            if (data.text) onChunk(data.text);
            if (data.error) onError(new Error(data.error));
            if (data.done && onDone) onDone();
          } catch {
            // ignore malformed event
          }
        }
      }

      if (onDone) onDone();
    } catch (err) {
      if (err.name !== "AbortError") onError(err);
    }
  })();

  return controller;
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
