/**
 * The Assistant's tunable settings, in one place. Model and effort are settings,
 * not architecture — change them here, then rerun `yarn eval` before shipping.
 */

export const MODEL = "claude-opus-5-5";

/** Set explicitly: Opus 5.5 defaults to "medium". */
export const EFFORT = "low" as const;

export const MAX_JOB_DESCRIPTION_CHARS = 15_000;
export const MAX_QUESTION_CHARS = 500;
/** Visitor turns per Ask conversation. */
export const MAX_ASK_TURNS = 6;
/**
 * Earlier assistant turns are sent back by the client, so they are capped too —
 * otherwise a fake "assistant" message is a way to smuggle in a long prompt.
 */
export const MAX_ASSISTANT_TURN_CHARS = 4_000;

export const RATE_LIMIT_PER_HOUR = 10;
export const RATE_LIMIT_PER_DAY = 30;

export const LOG_RETENTION_SECONDS = 90 * 24 * 60 * 60;

/**
 * The kill switch. Off unless explicitly "true", so a missing variable can never
 * expose a paid endpoint. Vercel applies env changes on redeploy.
 */
export function isAssistantEnabled(): boolean {
  return process.env.ASSISTANT_ENABLED === "true";
}
