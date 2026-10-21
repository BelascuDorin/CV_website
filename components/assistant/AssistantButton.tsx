"use client";

import { useAssistant } from "./AssistantProvider";

interface AssistantButtonProps {
  /**
   * "nav" sits in the Navigation from `sm` up; below that the Navigation is
   * already full, so "floating" takes over as the reachable-anywhere entry point.
   */
  variant: "hero" | "nav" | "floating";
}

/** An entry point to the Assistant. Renders nothing while it is disabled. */
export default function AssistantButton({ variant }: AssistantButtonProps) {
  const assistant = useAssistant();
  if (!assistant) return null;

  if (variant === "nav") {
    return (
      <button
        type="button"
        onClick={() => assistant.open()}
        className="ml-2 hidden shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors hover:bg-slate-100 sm:inline-block"
      >
        Assistant
      </button>
    );
  }

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={() => assistant.open()}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 cursor-pointer rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-900 sm:hidden"
      >
        Assistant
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => assistant.open("job-match")}
      className="group mt-7 flex w-full max-w-xl cursor-pointer items-center justify-between gap-4 rounded-2xl bg-slate-800 px-5 py-4 text-left text-white shadow-md transition-colors hover:bg-slate-900"
    >
      <span>
        <span className="block font-semibold">
          Paste a job description — see how I match
        </span>
        <span className="mt-0.5 block text-sm text-slate-300">
          Requirement by requirement, citing real projects and showing gaps honestly.
        </span>
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 text-xl transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </button>
  );
}
