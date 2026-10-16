import { z } from "zod";
import { NO_EVIDENCE_MARKER } from "./context";

/**
 * The no-evidence rule, enforced after the model rather than only asked of it —
 * see docs/adr/0004-assistant-grounded-in-authored-data.md. Nothing the model
 * says about a Project reaches the screen unless that Project exists.
 */

// ─── Job Match ───────────────────────────────────────────────────────────────

export const MATCH_STATUSES = ["strong", "partial", "gap"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

/** The shape the model is asked to produce. Also sent to the API as the output schema. */
export const JobMatchOutputSchema = z.object({
  requirements: z.array(
    z.object({
      requirement: z.string(),
      status: z.enum(MATCH_STATUSES),
      evidence: z.string(),
      projectSlugs: z.array(z.string()),
    })
  ),
  summary: z.string(),
});

export interface MatchedRequirement {
  requirement: string;
  status: MatchStatus;
  evidence: string;
  projectSlugs: string[];
}

export interface JobMatch {
  requirements: MatchedRequirement[];
  summary: string;
}

/** Replaces the model's evidence when its only support turned out not to exist. */
export const DEMOTED_EVIDENCE = "No evidence of this in Dorin's CV.";

/**
 * Parses the model's Job Match and makes it safe to render:
 * - citations to unknown Project slugs are dropped;
 * - a Strong or Partial left with no valid citation becomes a Gap, with its
 *   evidence replaced — the original sentence was describing something that
 *   does not exist;
 * - a Gap never carries citations.
 *
 * Returns null when the output is not a Job Match at all, so the caller shows
 * the fallback rather than a half-rendered result.
 */
export function validateJobMatch(
  raw: unknown,
  knownSlugs: Set<string>
): JobMatch | null {
  const parsed = JobMatchOutputSchema.safeParse(raw);
  if (!parsed.success) return null;

  const requirements = parsed.data.requirements
    .filter((r) => r.requirement.trim().length > 0)
    .map((r): MatchedRequirement => {
      const slugs = [...new Set(r.projectSlugs)].filter((slug) =>
        knownSlugs.has(slug)
      );

      if (r.status === "gap") {
        return { ...r, projectSlugs: [] };
      }
      if (slugs.length === 0) {
        return {
          requirement: r.requirement,
          status: "gap",
          evidence: DEMOTED_EVIDENCE,
          projectSlugs: [],
        };
      }
      return { ...r, projectSlugs: slugs };
    });

  if (requirements.length === 0) return null;

  return {
    requirements,
    summary: stripUnknownCitations(parsed.data.summary, knownSlugs),
  };
}

/** The labels logged for a Job Match — never the job description itself. */
export function gapLabels(match: JobMatch): string[] {
  return match.requirements
    .filter((r) => r.status === "gap")
    .map((r) => r.requirement);
}

// ─── Inline citations ────────────────────────────────────────────────────────

const CITATION = /\[\[([^\]\n]*)\]\]/g;

/** Removes `[[slug]]` markers whose slug is not a real Project, and the no-evidence marker. */
export function stripUnknownCitations(
  text: string,
  knownSlugs: Set<string>
): string {
  return text.replace(CITATION, (marker, slug: string) =>
    knownSlugs.has(slug) ? marker : ""
  );
}

/**
 * Longest stretch held back while waiting for a `[[` to close. Real markers are
 * short; anything longer is ordinary text that happens to contain brackets.
 */
const MAX_PENDING_MARKER = 80;

/**
 * Validates inline citations in a streamed Ask answer. Text is passed through
 * as it arrives, except that a possible marker is held back until it closes, so
 * an invented slug is removed before the visitor ever sees it.
 *
 * Also detects the no-evidence marker, which is stripped from the output and
 * reported so the question can be logged as unanswered.
 */
export class CitationFilter {
  private pending = "";
  private noEvidence = false;

  constructor(private readonly knownSlugs: Set<string>) {}

  /** Feeds a chunk from the model; returns the text safe to emit now. */
  push(chunk: string): string {
    this.pending += chunk;

    // Everything before the last unclosed "[[" (or a trailing "[") is final.
    let holdFrom = this.pending.length;
    const open = this.pending.lastIndexOf("[[");
    if (open !== -1 && this.pending.indexOf("]]", open) === -1) {
      holdFrom = open;
    } else if (this.pending.endsWith("[")) {
      holdFrom = this.pending.length - 1;
    }

    if (this.pending.length - holdFrom > MAX_PENDING_MARKER) {
      holdFrom = this.pending.length;
    }

    const ready = this.pending.slice(0, holdFrom);
    this.pending = this.pending.slice(holdFrom);
    return this.clean(ready);
  }

  /** Emits whatever is still held back once the stream ends. */
  flush(): string {
    const rest = this.pending;
    this.pending = "";
    return this.clean(rest);
  }

  /** Whether the model marked its answer as not grounded in the data. */
  get answeredWithoutEvidence(): boolean {
    return this.noEvidence;
  }

  private clean(text: string): string {
    if (text.includes(NO_EVIDENCE_MARKER)) {
      this.noEvidence = true;
      text = text.split(NO_EVIDENCE_MARKER).join("");
    }
    return stripUnknownCitations(text, this.knownSlugs);
  }
}
