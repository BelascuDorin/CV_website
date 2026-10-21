"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_ASK_TURNS,
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_QUESTION_CHARS,
} from "@/lib/assistant/config";
import type { ConversationTurn } from "@/lib/assistant/service";
import type { JobMatch, MatchStatus } from "@/lib/assistant/validate";
import { requestAnswer, requestJobMatch, type AssistantFailure } from "./api";
import type { AssistantMode, ProjectRef } from "./AssistantProvider";
import { showProject } from "./showProject";

const SUGGESTED_QUESTIONS = [
  "Has he led a team through a migration?",
  "What has he built with Next.js?",
  "Is he open to relocation?",
];

interface AssistantDrawerProps {
  isOpen: boolean;
  mode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
  /** Closes the drawer, then runs `then` once it has closed. */
  onClose: (then?: () => void) => void;
  projects: ProjectRef[];
  contactEmail: string;
}

interface AskMessage {
  role: "user" | "assistant";
  content: string;
  /** An answer that did not complete; excluded from the history sent back. */
  failed?: boolean;
}

// ─── Rendering answer text ───────────────────────────────────────────────────

/**
 * Renders model prose: blank-line paragraphs, "- " bullet lists, and `[[slug]]`
 * citations as links to the Project Card. The server has already removed
 * citations to unknown Projects; unknown ones are dropped here too.
 */
function AnswerText({
  text,
  projectNames,
  onCite,
}: {
  text: string;
  projectNames: Map<string, string>;
  onCite: (slug: string) => void;
}) {
  const inline = (line: string) =>
    line.split(/(\[\[[a-z0-9-]+\]\]|\*\*[^*\n]+\*\*)/g).map((part, i) => {
      const bold = part.match(/^\*\*([^*\n]+)\*\*$/)?.[1];
      if (bold) return <strong key={i} className="font-semibold text-gray-900">{bold}</strong>;
      const slug = part.match(/^\[\[([a-z0-9-]+)\]\]$/)?.[1];
      if (!slug) return <Fragment key={i}>{part}</Fragment>;
      const name = projectNames.get(slug);
      if (!name) return null;
      return <CitationLink key={i} name={name} onClick={() => onCite(slug)} />;
    });

  const blocks = text.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((line) => line.trim());
        if (lines.length > 0 && lines.every((line) => /^\s*[-•*]\s/.test(line))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((line, j) => (
                <li key={j}>{inline(line.replace(/^\s*[-•*]\s/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(block)}</p>;
      })}
    </div>
  );
}

function CitationLink({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-0.5 inline cursor-pointer rounded bg-slate-100 px-1.5 py-0.5 text-[0.85em] font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:bg-slate-200"
    >
      {name}
    </button>
  );
}

// ─── Failure messages ────────────────────────────────────────────────────────

function FailureNotice({
  failure,
  contactEmail,
  onBrowseWork,
}: {
  failure: AssistantFailure;
  contactEmail: string;
  onBrowseWork: () => void;
}) {
  if (failure.kind === "invalid-input") {
    return (
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{failure.message}</p>
    );
  }

  const minutes = failure.kind === "rate-limited"
    ? Math.max(1, Math.ceil(failure.retryAfterSeconds / 60))
    : 0;

  return (
    <div className="rounded-lg bg-slate-50 p-4 text-sm text-gray-700 ring-1 ring-slate-200">
      <p>
        {failure.kind === "rate-limited"
          ? `You've reached the Assistant's limit for now — try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`
          : "The Assistant is unavailable right now."}{" "}
        The Work section has everything it knows, and you can always reach Dorin
        directly.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBrowseWork}
          className="cursor-pointer rounded-full bg-slate-700 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Browse the Work section
        </button>
        <a
          href={`mailto:${contactEmail}`}
          className="rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-white"
        >
          Email Dorin
        </a>
      </div>
    </div>
  );
}

// ─── Job Match ───────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<MatchStatus, { label: string; className: string }> = {
  strong: { label: "Strong", className: "bg-emerald-100 text-emerald-800" },
  partial: { label: "Partial", className: "bg-amber-100 text-amber-800" },
  gap: { label: "Gap", className: "bg-slate-200 text-slate-700" },
};

function JobMatchResult({
  match,
  projectNames,
  contactEmail,
  onCite,
}: {
  match: JobMatch;
  projectNames: Map<string, string>;
  contactEmail: string;
  onCite: (slug: string) => void;
}) {
  return (
    <div className="space-y-5">
      <ul className="space-y-3">
        {match.requirements.map((r, i) => {
          const style = STATUS_STYLE[r.status];
          return (
            <li key={i} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-gray-900">{r.requirement}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${style.className}`}
                >
                  {style.label}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{r.evidence}</p>
              {r.projectSlugs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.projectSlugs.map((slug) =>
                    projectNames.has(slug) ? (
                      <CitationLink
                        key={slug}
                        name={projectNames.get(slug)!}
                        onClick={() => onCite(slug)}
                      />
                    ) : null
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="text-sm leading-relaxed text-gray-700">
        <AnswerText text={match.summary} projectNames={projectNames} onCite={onCite} />
      </div>

      <a
        href={`mailto:${contactEmail}`}
        className="inline-flex rounded-full bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Want to talk? Email Dorin
      </a>
    </div>
  );
}

// ─── Mobile viewport ─────────────────────────────────────────────────────────

/** Phones and tablets: no autofocus, so the keyboard doesn't cover the drawer on open. */
function isTouchDevice(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * The visible area while the drawer is open. On iOS the on-screen keyboard
 * shrinks only the visual viewport, so a full-height fixed panel would put its
 * input underneath the keyboard; sizing the panel to the visual viewport keeps
 * the input above it. (Android resizes the layout itself — see `viewport` in
 * app/layout.tsx.)
 */
function useVisualViewport(active: boolean) {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) return;
    const update = () => setBox({ top: viewport.offsetTop, height: viewport.height });
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      setBox(null);
    };
  }, [active]);

  return box;
}

// ─── Drawer ──────────────────────────────────────────────────────────────────

export default function AssistantDrawer({
  isOpen,
  mode,
  onModeChange,
  onClose,
  projects,
  contactEmail,
}: AssistantDrawerProps) {
  const projectNames = useMemo(
    () => new Map(projects.map((p) => [p.slug, p.name])),
    [projects]
  );

  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const answerEndRef = useRef<HTMLDivElement>(null);
  const matchResultRef = useRef<HTMLDivElement>(null);
  const viewport = useVisualViewport(isOpen);

  // Job Match state
  const [jobDescription, setJobDescription] = useState("");
  const [match, setMatch] = useState<JobMatch | null>(null);
  const [matchFailure, setMatchFailure] = useState<AssistantFailure | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Ask state
  const [messages, setMessages] = useState<AskMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [askFailure, setAskFailure] = useState<AssistantFailure | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  const questionsAsked = messages.filter((m) => m.role === "user" && !m.failed).length;
  const atTurnLimit = questionsAsked >= MAX_ASK_TURNS;

  // Escape closes; the page behind does not scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && !isTouchDevice()) inputRef.current?.focus();
  }, [isOpen, mode]);

  // On a phone the result starts below a tall form; bring it into view.
  useEffect(() => {
    if (match || matchFailure) {
      matchResultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [match, matchFailure]);

  useEffect(() => {
    answerEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  /** Citations close the drawer so the card is visible; state is kept for reopening. */
  function cite(slug: string) {
    onClose(() => showProject(slug));
  }

  function browseWork() {
    onClose(() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }));
  }

  /** Drops the on-screen keyboard after sending, so the answer has the screen. */
  function dismissKeyboard() {
    if (isTouchDevice()) (document.activeElement as HTMLElement | null)?.blur();
  }

  async function submitJobMatch(e: React.FormEvent) {
    e.preventDefault();
    if (isMatching || !jobDescription.trim()) return;
    dismissKeyboard();
    setIsMatching(true);
    setMatch(null);
    setMatchFailure(null);

    const result = await requestJobMatch(jobDescription);
    if (result.ok) setMatch(result.match);
    else setMatchFailure(result.failure);
    setIsMatching(false);
  }

  async function submitQuestion(text: string) {
    const content = text.trim();
    if (isAnswering || !content || atTurnLimit) return;

    // Failed exchanges are shown but never sent back, so roles keep alternating.
    const history: ConversationTurn[] = [];
    for (let i = 0; i < messages.length; i += 2) {
      const [asked, answer] = [messages[i], messages[i + 1]];
      if (asked && answer && !answer.failed && answer.content.trim()) {
        history.push({ role: "user", content: asked.content });
        history.push({ role: "assistant", content: answer.content });
      }
    }
    const conversation: ConversationTurn[] = [...history, { role: "user", content }];

    setQuestion("");
    dismissKeyboard();
    setAskFailure(null);
    setIsAnswering(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content },
      { role: "assistant", content: "" },
    ]);

    const appendToAnswer = (chunk: string) =>
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, content: last.content + chunk };
        return next;
      });

    const failure = await requestAnswer(conversation, appendToAnswer);
    if (failure) {
      setAskFailure(failure);
      // Kept on screen, but never sent back and not counted toward the limit.
      setMessages((prev) =>
        prev.map((message, i) => (i >= prev.length - 2 ? { ...message, failed: true } : message))
      );
    }
    setIsAnswering(false);
  }

  function resetConversation() {
    setMessages([]);
    setAskFailure(null);
    setQuestion("");
  }

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      style={viewport ? { top: viewport.top, height: viewport.height, bottom: "auto" } : undefined}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={() => onClose()}
        className={`absolute inset-0 bg-slate-900/30 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-title"
        inert={!isOpen}
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white transition-transform duration-300 ease-out sm:max-w-md ${
          // No shadow while closed, or it bleeds in from off-screen.
          isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 pr-2 pl-5 pt-[max(0.5rem,env(safe-area-inset-top))] sm:py-4 sm:pr-3">
          <div className="min-w-0">
            <h2 id="assistant-title" className="text-base font-bold text-gray-900 sm:text-lg">
              Assistant
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">Answers only from Dorin&apos;s CV.</p>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            aria-label="Close the Assistant"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-2xl leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        {/* Mode tabs */}
        <div
          role="tablist"
          className="grid grid-cols-2 gap-1 border-b border-slate-200 px-5 py-2 sm:flex"
        >
          {(
            [
              ["job-match", "Job Match"],
              ["ask", "Ask"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => onModeChange(value)}
              className={`cursor-pointer rounded-full px-3.5 py-2 text-sm font-medium transition-colors sm:py-1.5 ${
                mode === value
                  ? "bg-slate-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overscroll-contain overflow-y-auto px-5 py-4 sm:py-5">
          {mode === "job-match" ? (
            <div className="space-y-5">
              <form onSubmit={submitJobMatch} className="space-y-2">
                <label htmlFor="assistant-jd" className="block text-sm font-medium text-gray-700">
                  Paste a job description
                </label>
                <textarea
                  id="assistant-jd"
                  ref={(el) => {
                    if (mode === "job-match") inputRef.current = el;
                  }}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  maxLength={MAX_JOB_DESCRIPTION_CHARS}
                  rows={match ? 4 : 8}
                  placeholder="Requirements, responsibilities, nice-to-haves…"
                  className="w-full resize-y rounded-xl border border-slate-300 p-3 text-base text-gray-800 sm:text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-400">
                    {jobDescription.length.toLocaleString("en")} /{" "}
                    {MAX_JOB_DESCRIPTION_CHARS.toLocaleString("en")}
                  </span>
                  <button
                    type="submit"
                    disabled={isMatching || !jobDescription.trim()}
                    className="cursor-pointer rounded-full bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isMatching ? "Matching…" : match ? "Match again" : "Match against the CV"}
                  </button>
                </div>
              </form>

              {isMatching && (
                <p className="animate-pulse text-sm text-gray-500">
                  Reading the job description and checking each requirement against Dorin&apos;s
                  projects…
                </p>
              )}
              <div ref={matchResultRef} aria-hidden="true" />
              {matchFailure && (
                <FailureNotice
                  failure={matchFailure}
                  contactEmail={contactEmail}
                  onBrowseWork={browseWork}
                />
              )}
              {match && (
                <JobMatchResult
                  match={match}
                  projectNames={projectNames}
                  contactEmail={contactEmail}
                  onCite={cite}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4 text-sm leading-relaxed">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-gray-500">Ask anything about Dorin&apos;s experience, for example:</p>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => submitQuestion(q)}
                      className="block w-full cursor-pointer rounded-xl border border-slate-200 px-3.5 py-2.5 text-left text-gray-700 hover:border-slate-300 hover:bg-slate-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message, i) =>
                message.role === "user" ? (
                  <p
                    key={i}
                    className="ml-8 rounded-2xl rounded-br-sm bg-slate-600 px-3.5 py-2 text-white"
                  >
                    {message.content}
                  </p>
                ) : message.content ? (
                  <div key={i} className="mr-4 text-gray-700">
                    <AnswerText
                      text={message.content}
                      projectNames={projectNames}
                      onCite={cite}
                    />
                  </div>
                ) : isAnswering && i === messages.length - 1 ? (
                  <p key={i} className="animate-pulse text-gray-400">
                    Thinking…
                  </p>
                ) : null
              )}

              {askFailure && (
                <FailureNotice
                  failure={askFailure}
                  contactEmail={contactEmail}
                  onBrowseWork={browseWork}
                />
              )}
              <div ref={answerEndRef} />
            </div>
          )}
        </div>

        {/* Footer: Ask input and the disclosure */}
        <div className="border-t border-slate-200 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {mode === "ask" &&
            (atTurnLimit ? (
              <div className="mb-3 flex items-center justify-between gap-3 text-sm text-gray-600">
                <span>That&apos;s the limit for one conversation.</span>
                <button
                  type="button"
                  onClick={resetConversation}
                  className="cursor-pointer rounded-full px-3 py-1.5 font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                >
                  Start a new one
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitQuestion(question);
                }}
                className="mb-3 flex gap-2"
              >
                <input
                  ref={(el) => {
                    if (mode === "ask") inputRef.current = el;
                  }}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={MAX_QUESTION_CHARS}
                  placeholder="Ask about Dorin's experience…"
                  aria-label="Your question"
                  className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-2 text-base outline-none sm:text-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="submit"
                  disabled={isAnswering || !question.trim()}
                  className="cursor-pointer rounded-full bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ask
                </button>
              </form>
            ))}
          <p className="text-[11px] leading-snug text-gray-400 sm:text-xs">
            Questions the Assistant can&apos;t answer are logged anonymously so Dorin can
            improve it. Please don&apos;t paste personal information.
          </p>
        </div>
      </div>
    </div>
  );
}
