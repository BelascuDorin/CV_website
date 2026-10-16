import {
  MAX_ASK_TURNS,
  MAX_ASSISTANT_TURN_CHARS,
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_QUESTION_CHARS,
} from "./config";
import {
  CitationFilter,
  gapLabels,
  validateJobMatch,
  type JobMatch,
} from "./validate";

/**
 * The Assistant's one backend seam. Every request runs the same gauntlet, in
 * order, so nothing expensive happens before something cheap has said no:
 *
 *   enabled → input caps → rate limit → model → validation → logging
 *
 * The model and the store are injected, so the whole service is testable with
 * fakes and no API spend. The route handler only translates HTTP.
 */

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

/** The Claude call, behind an interface the tests can fake. */
export interface AssistantModel {
  /** Returns the parsed JSON the model produced, unvalidated. */
  jobMatch(system: string, jobDescription: string): Promise<unknown>;
  /** Streams answer text. */
  ask(system: string, conversation: ConversationTurn[]): AsyncIterable<string>;
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export type LogEntry =
  | { mode: "ask"; question: string }
  | { mode: "job-match"; gaps: string[] };

export interface AssistantStore {
  checkRateLimit(clientId: string): Promise<RateLimitResult>;
  log(entry: LogEntry): Promise<void>;
}

export type Refusal =
  | { ok: false; reason: "disabled" }
  | { ok: false; reason: "invalid-input"; message: string }
  | { ok: false; reason: "rate-limited"; retryAfterSeconds: number }
  | { ok: false; reason: "unavailable" };

export type JobMatchResult = { ok: true; match: JobMatch } | Refusal;

export type AskEvent = { type: "text"; text: string } | { type: "error" };
export type AskResult = { ok: true; events: AsyncIterable<AskEvent> } | Refusal;

export interface AssistantServiceOptions {
  enabled: boolean;
  system: string;
  knownSlugs: Set<string>;
  model: AssistantModel;
  store: AssistantStore;
  /** Reports failures that the visitor only sees as the fallback. */
  onError?: (error: unknown) => void;
}

export function createAssistantService(options: AssistantServiceOptions) {
  const { enabled, system, knownSlugs, model, store } = options;
  const reportError = options.onError ?? (() => {});

  /** Logging must never cost the visitor their answer. */
  async function safeLog(entry: LogEntry) {
    try {
      await store.log(entry);
    } catch (error) {
      reportError(error);
    }
  }

  /**
   * Fails closed: if the limiter cannot be reached the request is refused,
   * because an unlimited paid endpoint is worse than a briefly unavailable one.
   */
  async function admit(clientId: string): Promise<Refusal | null> {
    let result: RateLimitResult;
    try {
      result = await store.checkRateLimit(clientId);
    } catch (error) {
      reportError(error);
      return { ok: false, reason: "unavailable" };
    }
    return result.allowed
      ? null
      : { ok: false, reason: "rate-limited", retryAfterSeconds: result.retryAfterSeconds };
  }

  async function jobMatch(
    jobDescription: string,
    clientId: string
  ): Promise<JobMatchResult> {
    if (!enabled) return { ok: false, reason: "disabled" };

    const text = jobDescription.trim();
    if (text.length === 0) {
      return { ok: false, reason: "invalid-input", message: "Paste a job description first." };
    }
    if (text.length > MAX_JOB_DESCRIPTION_CHARS) {
      return {
        ok: false,
        reason: "invalid-input",
        message: `That job description is too long — please keep it under ${MAX_JOB_DESCRIPTION_CHARS.toLocaleString("en")} characters.`,
      };
    }

    const refused = await admit(clientId);
    if (refused) return refused;

    let match: JobMatch | null;
    try {
      match = validateJobMatch(await model.jobMatch(system, text), knownSlugs);
    } catch (error) {
      reportError(error);
      return { ok: false, reason: "unavailable" };
    }
    if (!match) return { ok: false, reason: "unavailable" };

    const gaps = gapLabels(match);
    if (gaps.length > 0) await safeLog({ mode: "job-match", gaps });

    return { ok: true, match };
  }

  async function ask(
    conversation: ConversationTurn[],
    clientId: string
  ): Promise<AskResult> {
    if (!enabled) return { ok: false, reason: "disabled" };

    const invalid = checkConversation(conversation);
    if (invalid) return { ok: false, reason: "invalid-input", message: invalid };

    const refused = await admit(clientId);
    if (refused) return refused;

    const question = conversation[conversation.length - 1].content.trim();
    const turns = conversation.map((turn) => ({
      role: turn.role,
      content: turn.content.trim(),
    }));

    async function* events(): AsyncIterable<AskEvent> {
      const filter = new CitationFilter(knownSlugs);
      try {
        for await (const chunk of model.ask(system, turns)) {
          const text = filter.push(chunk);
          if (text) yield { type: "text", text };
        }
        const rest = filter.flush();
        if (rest) yield { type: "text", text: rest };
      } catch (error) {
        reportError(error);
        yield { type: "error" };
        return;
      }

      if (filter.answeredWithoutEvidence) {
        await safeLog({ mode: "ask", question });
      }
    }

    return { ok: true, events: events() };
  }

  return { jobMatch, ask };
}

export type AssistantService = ReturnType<typeof createAssistantService>;

function checkConversation(conversation: ConversationTurn[]): string | null {
  if (!Array.isArray(conversation) || conversation.length === 0) {
    return "Ask a question first.";
  }

  for (const [i, turn] of conversation.entries()) {
    const expected = i % 2 === 0 ? "user" : "assistant";
    if (turn?.role !== expected || typeof turn.content !== "string") {
      return "That conversation could not be read — please start a new one.";
    }
  }

  const last = conversation[conversation.length - 1];
  if (last.role !== "user") {
    return "That conversation could not be read — please start a new one.";
  }

  const questions = conversation.filter((turn) => turn.role === "user");
  if (questions.length > MAX_ASK_TURNS) {
    return `This conversation has reached its ${MAX_ASK_TURNS}-question limit — please start a new one.`;
  }
  if (questions.some((turn) => turn.content.trim().length === 0)) {
    return "Ask a question first.";
  }
  if (questions.some((turn) => turn.content.length > MAX_QUESTION_CHARS)) {
    return `Please keep questions under ${MAX_QUESTION_CHARS} characters.`;
  }
  if (
    conversation.some(
      (turn) =>
        turn.role === "assistant" && turn.content.length > MAX_ASSISTANT_TURN_CHARS
    )
  ) {
    return "That conversation could not be read — please start a new one.";
  }

  return null;
}
