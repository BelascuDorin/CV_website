import type { WorkFilter } from "./selectors";

/**
 * Named one-click filter states, so a visitor who will not build a filter still
 * sees the data more than one way — see
 * docs/adr/0002-one-work-section-with-two-views.md.
 *
 * A Preset is only a shortcut to a filter state and holds no content of its own.
 * Keep the list short and keep it honest: every preset must match at least two
 * projects, or it reads as padding.
 */
export interface Preset {
  slug: string;
  label: string;
  description: string;
  filter: WorkFilter;
}

const presets: Preset[] = [
  {
    slug: "frontend-at-scale",
    label: "Frontend at scale",
    description: "React work on products with real traffic behind them.",
    // Deliberately excludes `typescript`, which nearly every project uses and
    // would drag side projects into a preset that claims scale. Pairing React
    // with paid engagements is what makes the label true.
    filter: {
      technologyIds: ["react", "redux"],
      kinds: ["Contract", "Employment"],
    },
  },
  {
    slug: "backend-and-data",
    label: "Backend & data",
    description: "Server-side and persistence work.",
    filter: {
      technologyIds: ["java", "spring-boot", "postgresql", "nodejs"],
      kinds: [],
    },
  },
  {
    slug: "zero-to-one",
    label: "Zero to one",
    description: "Products built from nothing, as founder or sole owner.",
    filter: { technologyIds: [], kinds: ["Cofounder", "Solo"] },
  },
  {
    slug: "embedded",
    label: "Embedded & real-time",
    description: "Firmware shipped in physical products.",
    filter: { technologyIds: ["embedded-c"], kinds: [] },
  },
  {
    slug: "leading-people",
    label: "Leading people",
    description: "Work where the job included the team, not just the code.",
    filter: {
      technologyIds: ["team-leadership", "project-management"],
      kinds: [],
    },
  },
];

export default presets;
