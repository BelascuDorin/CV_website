"use client";

import type { PlacedProject, WorkFilter } from "@/data/selectors";
import type { Technology } from "@/data/types";
import ProjectCard from "./ProjectCard";

interface FilteredViewProps {
  matches: PlacedProject[];
  technologies: Map<string, Technology>;
  filter: WorkFilter;
  onTechnologyClick: (technologyId: string) => void;
  onClear: () => void;
}

/**
 * The filtered state: engagement grouping drops away and matching projects show
 * as a flat list, each surfacing what the filtered technologies solved on it.
 * This is the state that answers "what is Dorin's React experience".
 */
export default function FilteredView({
  matches,
  technologies,
  filter,
  onTechnologyClick,
  onClear,
}: FilteredViewProps) {
  if (matches.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-10 text-center">
        <p className="font-semibold text-gray-900">
          Nothing matches that combination
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
          Every technology chip is backed by real projects, but not every pairing
          of them exists. Try removing one.
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-5 cursor-pointer rounded-full bg-slate-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Clear filters
        </button>
      </div>
    );
  }

  const selectedNames = filter.technologyIds
    .map((id) => technologies.get(id)?.name)
    .filter((name): name is string => name !== undefined);

  // Only promise the problem statements if at least one match actually carries
  // one — `problem` is optional, so a filter can legitimately surface none.
  const hasProblemStatements = matches.some(({ project }) =>
    project.technologies.some(
      (usage) =>
        usage.problem && filter.technologyIds.includes(usage.technologyId)
    )
  );

  return (
    <div className="mt-8">
      {selectedNames.length > 0 && (
        <p className="mb-4 text-sm text-gray-500">
          Where{" "}
          <span className="font-semibold text-gray-900">
            {selectedNames.join(", ")}
          </span>{" "}
          {hasProblemStatements
            ? "showed up, and what it solved each time."
            : "showed up."}
        </p>
      )}

      <ul className="space-y-3">
        {matches.map(({ project, engagement }) => (
          <li key={`${engagement.slug}-${project.slug}`}>
            <ProjectCard
              project={project}
              engagement={engagement}
              technologies={technologies}
              highlightedTechnologyIds={filter.technologyIds}
              onTechnologyClick={onTechnologyClick}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
