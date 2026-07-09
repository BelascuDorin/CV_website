// ─── Hero ────────────────────────────────────────────────────────────────────

export interface HeroData {
  name: string;
  role: string;
  positioning: string;
  bio: string;
  headshotSrc: string;
}

// ─── Now Section ─────────────────────────────────────────────────────────────

export interface ActiveEmployment {
  company: string;
  role: string;
  description: string;
  startDate: string;
}

export interface SideProject {
  name: string;
  description: string;
  url?: string;
}

export interface SelfDevelopment {
  description: string;
  items: string[];
}

export interface NowData {
  employment: ActiveEmployment;
  sideProjects: SideProject[];
  selfDevelopment: SelfDevelopment;
}

// ─── Experience ───────────────────────────────────────────────────────────────

export interface ExperienceEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string | "Present";
  bullets: string[];
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export type SkillCategory =
  | "Languages"
  | "Frameworks & Libraries"
  | "Tools & Platforms"
  | "Practices";

export interface SkillProof {
  claim: string;
  outcome: string;
  url: string;
}

export interface Skill {
  name: string;
  category: SkillCategory;
  proofs: SkillProof[];
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface ContactData {
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  cvPdfUrl: string;
}
