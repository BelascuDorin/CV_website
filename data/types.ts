// ─── Hero ────────────────────────────────────────────────────────────────────

export interface HeroData {
  name: string;
  role: string;
  positioning: string;
  /** One string per paragraph. */
  bio: string[];
  /** Card under the headshot telling a first-time visitor what the site is for. */
  purpose: {
    title: string;
    description: string;
    points: string[];
  };
  headshotSrc: string;
}

// ─── Technologies ────────────────────────────────────────────────────────────

export type TechnologyCategory =
  | "Languages"
  | "Frameworks & Libraries"
  | "Tools & Platforms"
  | "Practices";

/**
 * A technology or practice, authored once in the registry. Projects reference it
 * by id, so it can never be spelled two ways or renamed in only one place.
 *
 * Ids are a public contract: they appear in shareable filter URLs (see
 * docs/adr/0003-filter-state-lives-in-the-url.md), so renaming one breaks links
 * that have already been sent to people.
 */
export interface Technology {
  id: string;
  name: string;
  category: TechnologyCategory;
}

/**
 * The link between a Project and one Technology — and the only place the
 * "what problem did this solve" sentence is authored.
 *
 * `problem` is optional on purpose: a Project lists every technology it used,
 * but only the ones where the choice was interesting earn a sentence.
 */
export interface TechnologyUsage {
  technologyId: string;
  problem?: string;
}

// ─── Engagements & Projects ──────────────────────────────────────────────────

/**
 * Distinguishes employment from self-directed work. Drives both the Now
 * Section's split (employment vs side projects) and the Work Section's second
 * filter facet.
 */
export type EngagementKind = "Contract" | "Employment" | "Cofounder" | "Solo";

/** One distinct piece of work, belonging to exactly one Engagement. */
export interface Project {
  slug: string;
  name: string;
  description: string;
  outcomes: string[];
  technologies: TechnologyUsage[];
  /** Omitted where the real dates are not known; never guessed. */
  startDate?: string;
  endDate?: string | "Present";
  url?: string;
  /**
   * Project Notes: the deeper story — scope, team, decisions, what went wrong —
   * read by the Assistant and never rendered. Public like everything the
   * Assistant reads, so never put anything here that could not be published.
   */
  notes?: string;
}

/**
 * Where Dorin was employed or self-employed for a period. Holds employment
 * facts and no description of the work itself — that lives on its Projects.
 */
export interface Engagement {
  slug: string;
  company: string;
  title: string;
  kind: EngagementKind;
  startDate: string;
  endDate: string | "Present";
  url?: string;
  projects: Project[];
}

// ─── Now Section ─────────────────────────────────────────────────────────────

/**
 * Only the hand-authored part of the Now Section. Active employment and side
 * projects are derived from the Engagements ending in "Present".
 */
export interface SelfDevelopment {
  description: string;
  items: string[];
}

export interface NowData {
  selfDevelopment: SelfDevelopment;
}

// ─── Education ─────────────────────────────────────────────────────────────────

export interface EducationEntry {
  institution: string;
  field: string;
  startYear: string;
  endYear: string;
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface ContactData {
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  cvPdfUrl: string;
}
