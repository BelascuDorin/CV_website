"use client";

import { useState } from "react";
import { projectCardId } from "@/components/assistant/showProject";
import type { Engagement, Project, Technology } from "@/data/types";

interface ProjectCardProps {
  project: Project;
  /** Shown as the project's provenance in the Filtered View, hidden in the Timeline View. */
  engagement?: Engagement;
  technologies: Map<string, Technology>;
  /**
   * Technology ids currently filtered on. Their chips are emphasised and their
   * problem statements are shown without the card needing to be expanded.
   */
  highlightedTechnologyIds?: string[];
  onTechnologyClick?: (technologyId: string) => void;
}

function dateRange(project: Project, engagement?: Engagement): string | null {
  if (project.startDate) {
    return `${project.startDate} – ${project.endDate ?? "Present"}`;
  }
  if (engagement) {
    return `${engagement.startDate} – ${engagement.endDate}`;
  }
  return null;
}

export default function ProjectCard({
  project,
  engagement,
  technologies,
  highlightedTechnologyIds = [],
  onTechnologyClick,
}: ProjectCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const highlighted = new Set(highlightedTechnologyIds);

  const usages = project.technologies.filter((usage) =>
    technologies.has(usage.technologyId)
  );
  const explained = usages.filter((usage) => usage.problem);

  // Shown up front when the visitor filtered by them; otherwise behind the toggle.
  const surfaced = explained.filter((usage) =>
    highlighted.has(usage.technologyId)
  );
  const behindToggle = explained.filter(
    (usage) => !highlighted.has(usage.technologyId)
  );

  const range = dateRange(project, engagement);

  return (
    // The id is what Assistant citations scroll to.
    <div
      id={projectCardId(project.slug)}
      className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="font-semibold leading-tight text-gray-900">
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-slate-600"
              >
                {project.name} ↗
              </a>
            ) : (
              project.name
            )}
          </p>
          {engagement && (
            <p className="mt-0.5 text-sm font-medium text-slate-600">
              {engagement.company} · {engagement.title}
            </p>
          )}
        </div>
        {range && <p className="shrink-0 text-xs text-gray-400">{range}</p>}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {project.description}
      </p>

      {project.outcomes.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {project.outcomes.map((outcome) => (
            <li
              key={outcome}
              className="flex gap-2 text-sm leading-relaxed text-gray-700"
            >
              <span className="mt-0.5 shrink-0 text-slate-300">•</span>
              {outcome}
            </li>
          ))}
        </ul>
      )}

      {usages.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {usages.map((usage) => {
            const technology = technologies.get(usage.technologyId)!;
            const isHighlighted = highlighted.has(usage.technologyId);

            return (
              <li key={usage.technologyId}>
                <button
                  type="button"
                  onClick={() => onTechnologyClick?.(usage.technologyId)}
                  aria-label={`Filter by ${technology.name}`}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    isHighlighted
                      ? "bg-slate-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {technology.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Problem statements for the technologies the visitor filtered on. */}
      {surfaced.length > 0 && (
        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {surfaced.map((usage) => (
            <div key={usage.technologyId}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {technologies.get(usage.technologyId)!.name} here
              </dt>
              <dd className="mt-0.5 text-sm leading-relaxed text-gray-600">
                {usage.problem}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {behindToggle.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            {isOpen
              ? "Hide what each choice solved"
              : `What ${behindToggle.length} of these choices solved`}
            <span
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {/* Rendered whether or not it is open, so the problem statements are in
              the HTML for crawlers and in-page search rather than only after a
              click. Collapsed with a grid row rather than a fixed max-height,
              which would clip the longer entries. */}
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <dl className="overflow-hidden">
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                {behindToggle.map((usage) => (
                  <div key={usage.technologyId}>
                    <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      {technologies.get(usage.technologyId)!.name}
                    </dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-gray-600">
                      {usage.problem}
                    </dd>
                  </div>
                ))}
              </div>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
