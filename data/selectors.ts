import type {
  Engagement,
  EngagementKind,
  Project,
  Technology,
  TechnologyUsage,
} from "./types";

/**
 * Every view on the site is a projection of the Engagement/Project list — see
 * docs/adr/0001-project-as-single-data-spine.md. These are those projections.
 */

const ENGAGEMENT_KINDS: EngagementKind[] = [
  "Contract",
  "Employment",
  "Cofounder",
  "Solo",
];

/** A Project together with the Engagement it belongs to. */
export interface PlacedProject {
  project: Project;
  engagement: Engagement;
}

/**
 * Selections within a facet are OR'd; the two facets are AND'd together.
 */
export interface WorkFilter {
  technologyIds: string[];
  kinds: EngagementKind[];
}

export const EMPTY_FILTER: WorkFilter = { technologyIds: [], kinds: [] };

export function isFilterActive(filter: WorkFilter): boolean {
  return filter.technologyIds.length > 0 || filter.kinds.length > 0;
}

export function listProjects(engagements: Engagement[]): PlacedProject[] {
  return engagements.flatMap((engagement) =>
    engagement.projects.map((project) => ({ project, engagement }))
  );
}

/** Powers the per-technology counts on the Filter Bar chips. */
export function projectCountsByTechnology(
  engagements: Engagement[]
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const { project } of listProjects(engagements)) {
    // A project counts once per technology however many times it lists it.
    const ids = new Set(project.technologies.map((t) => t.technologyId));
    for (const id of ids) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  return counts;
}

export function filterProjects(
  engagements: Engagement[],
  filter: WorkFilter
): PlacedProject[] {
  return listProjects(engagements).filter(({ project, engagement }) => {
    const matchesTechnology =
      filter.technologyIds.length === 0 ||
      project.technologies.some((usage) =>
        filter.technologyIds.includes(usage.technologyId)
      );

    const matchesKind =
      filter.kinds.length === 0 || filter.kinds.includes(engagement.kind);

    return matchesTechnology && matchesKind;
  });
}

export function technologyUsage(
  project: Project,
  technologyId: string
): TechnologyUsage | undefined {
  return project.technologies.find((t) => t.technologyId === technologyId);
}

/**
 * The sentinel an open-ended Engagement uses for its end date. Compare against
 * this rather than the literal, which a typo would silently defeat.
 */
export const PRESENT = "Present";

/** The Engagements the Now Section is built from. */
export function activeEngagements(
  engagements: Engagement[],
  kinds: EngagementKind[]
): Engagement[] {
  return engagements.filter(
    (engagement) =>
      engagement.endDate === PRESENT && kinds.includes(engagement.kind)
  );
}

// ─── URL state ───────────────────────────────────────────────────────────────

const TECH_PARAM = "tech";
const KIND_PARAM = "kind";

function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  if (!raw) return [];

  return [...new Set(raw.split(",").map((v) => v.trim()).filter(Boolean))];
}

/**
 * Unknown ids are dropped rather than treated as an error, so a link that
 * outlives a renamed technology degrades to the unfiltered page instead of a
 * broken one — see docs/adr/0003-filter-state-lives-in-the-url.md.
 */
export function parseWorkFilter(
  params: URLSearchParams,
  technologies: Technology[]
): WorkFilter {
  const knownTechnologyIds = new Set(technologies.map((t) => t.id));

  const technologyIds = readList(params, TECH_PARAM).filter((id) =>
    knownTechnologyIds.has(id)
  );

  const kinds = readList(params, KIND_PARAM)
    .map((value) =>
      ENGAGEMENT_KINDS.find((kind) => kind.toLowerCase() === value.toLowerCase())
    )
    .filter((kind): kind is EngagementKind => kind !== undefined);

  return { technologyIds, kinds };
}

/**
 * Empty facets are omitted so an unfiltered page keeps a bare canonical URL.
 *
 * Built by hand rather than with `URLSearchParams.toString()`, which
 * percent-encodes the separator and turns a link meant to read as
 * `?tech=java,spring-boot` into `?tech=java%2Cspring-boot`. Ids are constrained
 * to `[a-z0-9-]` (enforced in `integrity.test.ts`), so nothing here needs
 * escaping.
 */
export function serializeWorkFilter(filter: WorkFilter): string {
  const parts: string[] = [];

  if (filter.technologyIds.length > 0) {
    parts.push(`${TECH_PARAM}=${filter.technologyIds.join(",")}`);
  }
  if (filter.kinds.length > 0) {
    const kinds = filter.kinds.map((kind) => kind.toLowerCase()).join(",");
    parts.push(`${KIND_PARAM}=${kinds}`);
  }

  return parts.join("&");
}

/**
 * Rewrites only the filter's own parameters, leaving everything else in the
 * query string intact — a `utm_source` on a shared link must survive the visitor
 * clicking a chip.
 */
export function mergeWorkFilterIntoQuery(
  currentQuery: string,
  filter: WorkFilter
): string {
  const params = new URLSearchParams(currentQuery);
  params.delete(TECH_PARAM);
  params.delete(KIND_PARAM);

  const others = params.toString();
  const mine = serializeWorkFilter(filter);

  return [others, mine].filter(Boolean).join("&");
}
