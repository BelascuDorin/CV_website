import type { AskEvent, ConversationTurn } from "@/lib/assistant/service";
import type { JobMatch } from "@/lib/assistant/validate";

/** Why a request produced no answer, in the terms the drawer renders. */
export type AssistantFailure =
  | { kind: "unavailable" }
  | { kind: "rate-limited"; retryAfterSeconds: number }
  | { kind: "invalid-input"; message: string };

const ENDPOINT = "/api/assistant";

async function failureFrom(response: Response): Promise<AssistantFailure> {
  try {
    const body = await response.json();
    if (body?.error === "rate-limited") {
      return { kind: "rate-limited", retryAfterSeconds: Number(body.retryAfterSeconds) || 60 };
    }
    if (body?.error === "invalid-input" && typeof body.message === "string") {
      return { kind: "invalid-input", message: body.message };
    }
  } catch {
    // Not JSON — fall through.
  }
  return { kind: "unavailable" };
}

export async function requestJobMatch(
  jobDescription: string
): Promise<{ ok: true; match: JobMatch } | { ok: false; failure: AssistantFailure }> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "job-match", jobDescription }),
    });
    if (!response.ok) return { ok: false, failure: await failureFrom(response) };
    const body = await response.json();
    return { ok: true, match: body.match };
  } catch {
    return { ok: false, failure: { kind: "unavailable" } };
  }
}

/**
 * Streams an Ask answer, calling `onText` per chunk. Resolves with a failure
 * if the request was refused or the stream ended in an error.
 */
export async function requestAnswer(
  conversation: ConversationTurn[],
  onText: (text: string) => void
): Promise<AssistantFailure | null> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "ask", conversation }),
    });
    if (!response.ok || !response.body) return await failureFrom(response);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line) as AskEvent;
        if (event.type === "error") return { kind: "unavailable" };
        onText(event.text);
      }
    }
    return null;
  } catch {
    return { kind: "unavailable" };
  }
}
