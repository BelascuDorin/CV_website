export { default as hero } from "./hero";
export { default as now } from "./now";
export { default as engagements } from "./engagements";
export { default as technologies } from "./technologies";
export { default as presets } from "./presets";
export { default as education } from "./education";
export { default as contact } from "./contact";
export { default as candidateNotes } from "./candidateNotes";

export type {
  HeroData,
  NowData,
  SelfDevelopment,
  Engagement,
  EngagementKind,
  Project,
  Technology,
  TechnologyCategory,
  TechnologyUsage,
  EducationEntry,
  ContactData,
} from "./types";

export type { Preset } from "./presets";
export type { PlacedProject, WorkFilter } from "./selectors";
