"use client";

import type { Preset } from "@/data/presets";
import { EMPTY_FILTER, isFilterActive, type WorkFilter } from "@/data/selectors";
import type {
  EngagementKind,
  Technology,
  TechnologyCategory,
} from "@/data/types";

interface FilterBarProps {
  technologies: Technology[];
  /** Project count per technology id — a chip with no evidence behind it is hidden. */
  counts: Map<string, number>;
  presets: Preset[];
  filter: WorkFilter;
  matchCount: number;
  onChange: (filter: WorkFilter) => void;
}

const CATEGORY_ORDER: TechnologyCategory[] = [
  "Languages",
  "Frameworks & Libraries",
  "Tools & Platforms",
  "Practices",
];

const KIND_ORDER: EngagementKind[] = [
  "Contract",
  "Employment",
  "Cofounder",
  "Solo",
];

const KIND_LABELS: Record<EngagementKind, string> = {
  Contract: "Contract",
  Employment: "Employed",
  Cofounder: "Cofounded",
  Solo: "Solo-built",
};

/** Order-insensitive comparison, so a preset stays highlighted however it was built up. */
function sameSelection(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;

  const sortedB = [...b].sort();
  return [...a].sort().every((value, i) => value === sortedB[i]);
}

function sameFilter(a: WorkFilter, b: WorkFilter): boolean {
  return (
    sameSelection(a.technologyIds, b.technologyIds) &&
    sameSelection(a.kinds, b.kinds)
  );
}

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}

export default function FilterBar({
  technologies,
  counts,
  presets,
  filter,
  matchCount,
  onChange,
}: FilterBarProps) {
  const isActive = isFilterActive(filter);

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Start here
        </span>
        {presets.map((preset) => {
          const isSelected = sameFilter(filter, preset.filter);

          return (
            <button
              key={preset.slug}
              type="button"
              title={preset.description}
              aria-pressed={isSelected}
              onClick={() => onChange(isSelected ? EMPTY_FILTER : preset.filter)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                isSelected
                  ? "bg-slate-600 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Technologies, doubling as the at-a-glance overview of what Dorin works with */}
      <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
        {CATEGORY_ORDER.map((category) => {
          const inCategory = technologies.filter(
            (technology) =>
              technology.category === category && counts.has(technology.id)
          );
          if (inCategory.length === 0) return null;

          return (
            <div
              key={category}
              className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3"
            >
              <p className="w-44 shrink-0 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {category}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {inCategory.map((technology) => {
                  const isSelected = filter.technologyIds.includes(
                    technology.id
                  );

                  return (
                    <li key={technology.id}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          onChange({
                            ...filter,
                            technologyIds: toggle(
                              filter.technologyIds,
                              technology.id
                            ),
                          })
                        }
                        className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-slate-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        {technology.name}
                        <span
                          className={`ml-1.5 tabular-nums ${
                            isSelected ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {counts.get(technology.id)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Engagement kind */}
      <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-200 pt-5 sm:flex-row sm:items-baseline sm:gap-3">
        <p className="w-44 shrink-0 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Setting
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {KIND_ORDER.map((kind) => {
            const isSelected = filter.kinds.includes(kind);

            return (
              <li key={kind}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    onChange({ ...filter, kinds: toggle(filter.kinds, kind) })
                  }
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-slate-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {KIND_LABELS[kind]}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/*
        The live region stays mounted whether or not a filter is active. Mounting
        it together with its first message means screen readers never announce
        that first result count, which is the one that matters most.
      */}
      <div
        aria-live="polite"
        className={`flex flex-wrap items-center justify-between gap-3 border-slate-200 ${
          isActive ? "mt-5 border-t pt-4" : ""
        }`}
      >
        {isActive && (
          <>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-gray-900">{matchCount}</span>{" "}
              {matchCount === 1 ? "project" : "projects"} match
            </p>
            <button
              type="button"
              onClick={() => onChange(EMPTY_FILTER)}
              className="cursor-pointer text-xs font-semibold text-slate-600 underline hover:text-slate-900"
            >
              Clear filters
            </button>
          </>
        )}
      </div>
    </div>
  );
}
