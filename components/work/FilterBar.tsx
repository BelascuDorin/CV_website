"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
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

/** Where the mobile "Show results" button scrolls to. */
export const WORK_RESULTS_ID = "work-results";

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
  // Mobile only: the full chip list is a wall of buttons on a phone, so it
  // starts collapsed. On sm+ it is always shown and this state is ignored.
  const [isExpanded, setIsExpanded] = useState(false);
  // Everything applied, as removable pills for the collapsed mobile panel.
  const appliedPills = [
    ...technologies
      .filter((technology) => filter.technologyIds.includes(technology.id))
      .map((technology) => ({
        key: technology.id,
        label: technology.name,
        remove: () =>
          onChange({
            ...filter,
            technologyIds: toggle(filter.technologyIds, technology.id),
          }),
      })),
    ...KIND_ORDER.filter((kind) => filter.kinds.includes(kind)).map((kind) => ({
      key: kind,
      label: KIND_LABELS[kind],
      remove: () => onChange({ ...filter, kinds: toggle(filter.kinds, kind) }),
    })),
  ];

  const showResults = () => {
    // Collapse synchronously first, so the scroll targets where the results
    // will be once the panel has shrunk rather than where they are now.
    flushSync(() => setIsExpanded(false));
    document
      .getElementById(WORK_RESULTS_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      {/* Presets — one swipeable row on mobile, wrapping on sm+ */}
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 sm:hidden">
        Start here
      </span>
      <div className="-mx-4 mt-2 flex items-center gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:mt-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <span className="hidden text-xs font-semibold uppercase tracking-widest text-slate-500 sm:inline">
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
              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:py-1.5 ${
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

      {/* Mobile disclosure for the full filter list */}
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls="work-filter-options"
        onClick={() => setIsExpanded((value) => !value)}
        className="mt-4 flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 sm:hidden"
      >
        <span>
          Filter by technology
          {appliedPills.length > 0 && (
            <span className="ml-2 rounded-full bg-slate-600 px-2 py-0.5 text-xs text-white">
              {appliedPills.length}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {/* While collapsed on mobile, still show what is applied so it can be removed */}
      {!isExpanded && appliedPills.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5 sm:hidden">
          {appliedPills.map((pill) => (
            <li key={pill.key}>
              <button
                type="button"
                aria-label={`Remove ${pill.label} filter`}
                onClick={pill.remove}
                className="cursor-pointer rounded-full bg-slate-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                {pill.label} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        id="work-filter-options"
        className={isExpanded ? "block" : "hidden sm:block"}
      >
        {/* Technologies, doubling as the at-a-glance overview of what Dorin works with */}
        <div className="mt-5 space-y-4 border-t border-slate-200 pt-5 sm:space-y-3">
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
                <p className="shrink-0 text-xs font-semibold uppercase tracking-widest text-slate-400 sm:w-44">
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
                          className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-2.5 sm:py-1 ${
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
          <p className="shrink-0 text-xs font-semibold uppercase tracking-widest text-slate-400 sm:w-44">
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
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-2.5 sm:py-1 ${
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
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onChange(EMPTY_FILTER)}
                className="cursor-pointer text-xs font-semibold text-slate-600 underline hover:text-slate-900"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={showResults}
                className="cursor-pointer rounded-full bg-slate-600 px-4 py-2 text-xs font-semibold text-white sm:hidden"
              >
                Show results ↓
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
