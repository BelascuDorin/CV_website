import type { Technology } from "./types";

/**
 * The technology registry. Every technology Dorin has used, authored once.
 *
 * Ids appear in shareable filter URLs, so treat them as permanent once a link
 * has been sent — add a new id rather than renaming an existing one. Display
 * names and categories are free to change.
 *
 * A technology belongs here only if at least one Project in `engagements.ts`
 * references it; an unreferenced entry would show a chip with a count of zero.
 */
const technologies: Technology[] = [
  // ─── Languages ──────────────────────────────────────────────────────────────
  { id: "typescript", name: "TypeScript", category: "Languages" },
  { id: "javascript", name: "JavaScript", category: "Languages" },
  { id: "java", name: "Java", category: "Languages" },
  { id: "embedded-c", name: "Embedded C", category: "Languages" },

  // ─── Frameworks & Libraries ─────────────────────────────────────────────────
  { id: "react", name: "React.js", category: "Frameworks & Libraries" },
  { id: "nextjs", name: "Next.js", category: "Frameworks & Libraries" },
  { id: "redux", name: "Redux", category: "Frameworks & Libraries" },
  { id: "redux-toolkit", name: "Redux Toolkit", category: "Frameworks & Libraries" },
  { id: "nodejs", name: "Node.js", category: "Frameworks & Libraries" },
  { id: "vue", name: "Vue 3", category: "Frameworks & Libraries" },
  { id: "nuxt", name: "Nuxt 4", category: "Frameworks & Libraries" },
  { id: "spring-boot", name: "Spring Boot", category: "Frameworks & Libraries" },
  { id: "tailwind", name: "Tailwind CSS", category: "Frameworks & Libraries" },

  // ─── Tools & Platforms ──────────────────────────────────────────────────────
  { id: "mapbox", name: "Mapbox", category: "Tools & Platforms" },
  { id: "braze", name: "Braze", category: "Tools & Platforms" },
  { id: "datadog", name: "Datadog", category: "Tools & Platforms" },
  { id: "stripe", name: "Stripe", category: "Tools & Platforms" },
  { id: "sentry", name: "Sentry", category: "Tools & Platforms" },
  { id: "postgresql", name: "PostgreSQL", category: "Tools & Platforms" },
  { id: "flyway", name: "Flyway", category: "Tools & Platforms" },
  { id: "docker", name: "Docker", category: "Tools & Platforms" },
  { id: "shopify", name: "Shopify", category: "Tools & Platforms" },
  { id: "testcafe", name: "TestCafe", category: "Tools & Platforms" },
  {
    id: "react-testing-library",
    name: "React Testing Library",
    category: "Tools & Platforms",
  },
  { id: "claude-code", name: "Claude Code", category: "Tools & Platforms" },
  { id: "claude-api", name: "Claude API", category: "Tools & Platforms" },
  { id: "upstash-redis", name: "Upstash Redis", category: "Tools & Platforms" },

  // ─── Practices ──────────────────────────────────────────────────────────────
  { id: "team-leadership", name: "Team Leadership", category: "Practices" },
  {
    id: "progressive-rollout",
    name: "Progressive Rollout",
    category: "Practices",
  },
  {
    id: "modular-monolith",
    name: "Modular Monolith",
    category: "Practices",
  },
  {
    id: "ai-assisted-development",
    name: "AI-Assisted Development",
    category: "Practices",
  },
  { id: "ai-integration", name: "AI Integration", category: "Practices" },
  {
    id: "project-management",
    name: "Project Management",
    category: "Practices",
  },
];

export default technologies;
