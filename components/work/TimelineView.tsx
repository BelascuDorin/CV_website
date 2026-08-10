"use client";

import type { Engagement, Technology } from "@/data/types";
import ProjectCard from "./ProjectCard";

interface TimelineViewProps {
  engagements: Engagement[];
  technologies: Map<string, Technology>;
  onTechnologyClick: (technologyId: string) => void;
}

/**
 * The default, unfiltered state of the Work Section: engagements in authored
 * order with their projects beneath, so a visitor who touches no control still
 * reads a conventional CV experience section.
 */
export default function TimelineView({
  engagements,
  technologies,
  onTechnologyClick,
}: TimelineViewProps) {
  return (
    <ol className="relative mt-10 space-y-12 before:absolute before:top-2 before:bottom-2 before:left-0 before:w-px before:bg-slate-100">
      {engagements.map((engagement) => (
        <li key={engagement.slug} className="relative pl-8">
          {/* Timeline dot */}
          <span className="absolute top-1.5 left-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-slate-600 ring-2 ring-white" />

          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-lg leading-tight font-semibold text-gray-900">
                {engagement.url ? (
                  <a
                    href={engagement.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-slate-600"
                  >
                    {engagement.company} ↗
                  </a>
                ) : (
                  engagement.company
                )}
              </p>
              <p className="text-sm font-medium text-slate-600">
                {engagement.title}
              </p>
            </div>
            <p className="shrink-0 text-xs text-gray-400">
              {engagement.startDate} – {engagement.endDate}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {engagement.projects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                technologies={technologies}
                onTechnologyClick={onTechnologyClick}
              />
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
