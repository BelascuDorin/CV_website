"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import FilterBar, { WORK_RESULTS_ID } from "@/components/work/FilterBar";
import FilteredView from "@/components/work/FilteredView";
import TimelineView from "@/components/work/TimelineView";
import type { Preset } from "@/data/presets";
import {
  EMPTY_FILTER,
  filterProjects,
  isFilterActive,
  mergeWorkFilterIntoQuery,
  parseWorkFilter,
  projectCountsByTechnology,
  type WorkFilter,
} from "@/data/selectors";
import type { Engagement, Technology } from "@/data/types";

interface WorkSectionProps {
  engagements: Engagement[];
  technologies: Technology[];
  presets: Preset[];
}

export const WORK_SECTION_ID = "work";

/**
 * One section, two states — see docs/adr/0002-one-work-section-with-two-views.md.
 *
 * Filter state lives in the query string rather than in component state, so a
 * filtered view is a shareable link: /?tech=react — see
 * docs/adr/0003-filter-state-lives-in-the-url.md.
 *
 * The query string is read after mount rather than through `useSearchParams`,
 * which would opt this whole subtree out of prerendering and leave the site's
 * main content — and the `#work` anchor the navigation observes — absent from
 * the static HTML. The cost is that a shared filtered link paints the timeline
 * for one frame before the filter applies.
 */
export default function WorkSection({
  engagements,
  technologies,
  presets,
}: WorkSectionProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const readUrl = () => setSearch(window.location.search);

    readUrl();
    // Keeps the view honest if the visitor uses back/forward.
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, []);

  const technologyMap = useMemo(
    () => new Map(technologies.map((technology) => [technology.id, technology])),
    [technologies]
  );

  const counts = useMemo(
    () => projectCountsByTechnology(engagements),
    [engagements]
  );

  const filter = useMemo(
    () => parseWorkFilter(new URLSearchParams(search), technologies),
    [search, technologies]
  );

  const matches = useMemo(
    () => filterProjects(engagements, filter),
    [engagements, filter]
  );

  const applyFilter = useCallback((next: WorkFilter) => {
    // Merged rather than replaced, so a campaign parameter on the incoming link
    // is not dropped the moment the visitor clicks a chip.
    const query = mergeWorkFilterIntoQuery(window.location.search, next);

    // The hash is added only for a filtered URL, so a shared link lands on the
    // section rather than the top of the page, while the bare path stays clean.
    const href = isFilterActive(next)
      ? `${window.location.pathname}?${query}#${WORK_SECTION_ID}`
      : `${window.location.pathname}${query ? `?${query}` : ""}`;

    // replaceState rather than pushState: toggling six chips should not leave six
    // entries between the visitor and the page they arrived from.
    window.history.replaceState(null, "", href);
    setSearch(query ? `?${query}` : "");
  }, []);

  const isActive = isFilterActive(filter);

  const clear = useCallback(() => applyFilter(EMPTY_FILTER), [applyFilter]);

  const toggleTechnology = useCallback(
    (technologyId: string) => {
      applyFilter({
        ...filter,
        technologyIds: filter.technologyIds.includes(technologyId)
          ? filter.technologyIds.filter((id) => id !== technologyId)
          : [...filter.technologyIds, technologyId],
      });
    },
    [applyFilter, filter]
  );

  return (
    <section
      id={WORK_SECTION_ID}
      className="scroll-mt-24 border-t-2 border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8 sm:py-12">
        <SectionHeader label="Work" title="What I've built, and with what" />

        <p className="mt-4 max-w-2xl text-base text-gray-500">
          Every technology below is a filter. Pick one to see the projects it was
          used on and the problem it solved on each.
        </p>

        <FilterBar
          technologies={technologies}
          counts={counts}
          presets={presets}
          filter={filter}
          matchCount={matches.length}
          onChange={applyFilter}
        />

        <div id={WORK_RESULTS_ID} className="scroll-mt-24">
          {isActive ? (
            <FilteredView
              matches={matches}
              technologies={technologyMap}
              filter={filter}
              onTechnologyClick={toggleTechnology}
              onClear={clear}
            />
          ) : (
            <TimelineView
              engagements={engagements}
              technologies={technologyMap}
              onTechnologyClick={toggleTechnology}
            />
          )}
        </div>
      </div>
    </section>
  );
}
