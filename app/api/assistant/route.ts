import { isAssistantEnabled } from "@/lib/assistant/config";
import { getAssistantService } from "@/lib/assistant/server";
import type { ConversationTurn, Refusal } from "@/lib/assistant/service";
import { clientIdFromIp } from "@/lib/assistant/store";

/**
 * The Assistant's only server boundary: it holds the API key and translates
 * HTTP to and from the Assistant Service, which owns every decision.
 *
 *   POST { mode: "job-match", jobDescription }  → JSON { match }
 *   POST { mode: "ask", conversation }          → NDJSON stream of AskEvents
 *
 * Refusals come back as JSON { error, message?, retryAfterSeconds? } with a
 * matching status code.
 */

export const maxDuration = 60;

type Body =
  | { mode: "job-match"; jobDescription: string }
  | { mode: "ask"; conversation: ConversationTurn[] };

function clientId(request: Request): string {
  // Vercel sets these itself, so a visitor cannot spoof them to dodge the limit.
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return clientIdFromIp(ip);
}

function refusalResponse(refusal: Refusal): Response {
  switch (refusal.reason) {
    case "disabled":
      return new Response(null, { status: 404 });
    case "invalid-input":
      return Response.json({ error: "invalid-input", message: refusal.message }, { status: 400 });
    case "rate-limited":
      return Response.json(
        { error: "rate-limited", retryAfterSeconds: refusal.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(refusal.retryAfterSeconds) } }
      );
    case "unavailable":
      return Response.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request): Promise<Response> {
  // Checked before anything is constructed, so a disabled Assistant needs no
  // credentials at all.
  if (!isAssistantEnabled()) return new Response(null, { status: 404 });

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return refusalResponse({ ok: false, reason: "invalid-input", message: "Malformed request." });
  }

  const service = getAssistantService();

  if (body?.mode === "job-match" && typeof body.jobDescription === "string") {
    const result = await service.jobMatch(body.jobDescription, clientId(request));
    return result.ok ? Response.json({ match: result.match }) : refusalResponse(result);
  }

  if (body?.mode === "ask" && Array.isArray(body.conversation)) {
    const result = await service.ask(body.conversation, clientId(request));
    if (!result.ok) return refusalResponse(result);

    const encoder = new TextEncoder();
    const events = result.events;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        for await (const event of events) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return refusalResponse({ ok: false, reason: "invalid-input", message: "Malformed request." });
}
