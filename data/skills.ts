import type { Skill } from "./types";

const skills: Skill[] = [
  // ─── Languages ──────────────────────────────────────────────────────────────
  {
    name: "TypeScript",
    category: "Languages",
    proofs: [
      {
        claim: "Primary language for feature work on Grubhub's 1M+ user platform.",
        outcome: "Type-safe React features shipped end-to-end — subscriptions, personalised offers, and a cross-platform auth migration.",
        url: "https://www.grubhub.com",
      },
    ],
  },
  {
    name: "JavaScript",
    category: "Languages",
    proofs: [
      {
        claim: "The foundation under every front-end and Node service I ship.",
        outcome: "Powers efera.ro, nutrichefdelivery.ro, and this CV site.",
        url: "https://efera.ro",
      },
    ],
  },
  {
    name: "Embedded C",
    category: "Languages",
    proofs: [
      {
        claim: "Wrote firmware for the core headlamp rendering module at Marelli and portable measurement meters at Hanna Instruments.",
        outcome: "Shipped to millions of production vehicles, plus commercially sold devices like the HI98703 turbidity meter.",
        url: "https://www.hannainst.com",
      },
    ],
  },

  {
    name: "Java",
    category: "Languages",
    proofs: [
      {
        claim: "Building the backend of reinvent — a career-change marketplace — with Java and Spring Boot.",
        outcome: "REST API, JPA persistence, security, and database migrations running on a modular monolith architecture.",
        url: "https://github.com/BelascuDorin/reinvent",
      },
    ],
  },

  // ─── Frameworks & Libraries ─────────────────────────────────────────────────
  {
    name: "React.js",
    category: "Frameworks & Libraries",
    proofs: [
      {
        claim: "Nine years of React across scale (Grubhub) and early-stage (urb.io) products.",
        outcome: "Owned consumer features end-to-end on a 1M+ user platform and led a full B2B platform rewrite.",
        url: "https://www.grubhub.com",
      },
    ],
  },
  {
    name: "Next.js",
    category: "Frameworks & Libraries",
    proofs: [
      {
        claim: "Build and ship production Next.js apps end to end.",
        outcome: "efera.ro (Next.js storefront on Shopify) and nutrichefdelivery.ro both run on Next.js; this CV site does too.",
        url: "https://efera.ro",
      },
    ],
  },
  {
    name: "Redux",
    category: "Frameworks & Libraries",
    proofs: [
      {
        claim: "State management for complex, data-heavy consumer flows on the Grubhub app.",
        outcome: "Kept subscription and personalised-offer state predictable across a large React codebase.",
        url: "https://www.grubhub.com",
      },
    ],
  },
  {
    name: "Node.js",
    category: "Frameworks & Libraries",
    proofs: [
      {
        claim: "Full-stack ownership of the server side on my cofounded products.",
        outcome: "Payments, webhooks, and analytics wired up from day one on nutrichefdelivery.ro.",
        url: "https://nutrichefdelivery.ro",
      },
    ],
  },

  {
    name: "Vue 3",
    category: "Frameworks & Libraries",
    proofs: [
      {
        claim: "Building the frontend of reinvent with Vue 3 and Nuxt 4.",
        outcome: "Server-rendered marketplace UI connecting career-changers with professionals in their target field.",
        url: "https://github.com/BelascuDorin/reinvent",
      },
    ],
  },
  {
    name: "Nuxt 4",
    category: "Frameworks & Libraries",
    proofs: [
      {
        claim: "Chose Nuxt 4 as the full-stack framework for reinvent to explore the Vue ecosystem at depth.",
        outcome: "File-based routing, server composables, and TypeScript across the entire frontend.",
        url: "https://github.com/BelascuDorin/reinvent",
      },
    ],
  },
  {
    name: "Spring Boot",
    category: "Frameworks & Libraries",
    proofs: [
      {
        claim: "Backend API for reinvent built with Spring Boot, Spring Security, Spring Data JPA, and Spring Modulith.",
        outcome: "Modular monolith architecture with JPA persistence, validation, and Flyway-managed migrations on PostgreSQL.",
        url: "https://github.com/BelascuDorin/reinvent",
      },
    ],
  },

  // ─── Tools & Platforms ──────────────────────────────────────────────────────
  {
    name: "Mapbox",
    category: "Tools & Platforms",
    proofs: [
      {
        claim: "Built map-heavy features end-to-end for urb.io's AI-powered district-heating platform.",
        outcome: "Network routing, area selection, heat-demand calculation, and ROI screens — sold to energy companies across Europe.",
        url: "https://urb.io",
      },
    ],
  },
  {
    name: "Braze",
    category: "Tools & Platforms",
    proofs: [
      {
        claim: "Migrated the Braze SDK to a breaking major version on the Grubhub app.",
        outcome: "Progressive rollout with Datadog observability and zero production incidents.",
        url: "https://www.grubhub.com",
      },
    ],
  },
  {
    name: "Datadog",
    category: "Tools & Platforms",
    proofs: [
      {
        claim: "Observability for feature rollouts on Grubhub — one of my top skills.",
        outcome: "Dashboards and monitors that made a breaking SDK migration safe to ship incrementally.",
        url: "https://www.grubhub.com",
      },
    ],
  },
  {
    name: "Stripe",
    category: "Tools & Platforms",
    proofs: [
      {
        claim: "Integrated Stripe payments from scratch on my cofounded products.",
        outcome: "nutrichefdelivery.ro reached ~1,000 orders; usercompass.tech connects feedback to Stripe revenue data.",
        url: "https://nutrichefdelivery.ro",
      },
    ],
  },

  {
    name: "PostgreSQL",
    category: "Tools & Platforms",
    proofs: [
      {
        claim: "PostgreSQL as the database for reinvent, with Flyway handling all schema migrations.",
        outcome: "Dockerised locally via Docker Compose; schema versioned from day one.",
        url: "https://github.com/BelascuDorin/reinvent",
      },
    ],
  },

  // ─── Practices ──────────────────────────────────────────────────────────────
  {
    name: "Modular Monolith (Spring Modulith)",
    category: "Practices",
    proofs: [
      {
        claim: "Chose a modular monolith architecture for reinvent using Spring Modulith over a microservices split.",
        outcome: "Strong module boundaries enforced at build time, with the option to extract services later without a big-bang rewrite.",
        url: "https://github.com/BelascuDorin/reinvent",
      },
    ],
  },
  {
    name: "AI-Assisted Development",
    category: "Practices",
    proofs: [
      {
        claim: "Use Claude and AI-driven development daily to move fast without cutting corners.",
        outcome: "Both this CV site and my side projects are built with a Claude Code-driven workflow.",
        url: "https://www.claude.com/product/claude-code",
      },
      {
        claim: "Ship products with a BMAD AI-agent architecture in brownfield and greenfield contexts.",
        outcome: "usercompass.tech and nutrichefdelivery.ro shipped end-to-end by a 3-person team using agent workflows.",
        url: "https://usercompass.tech",
      },
    ],
  },
  {
    name: "Team Leadership",
    category: "Practices",
    proofs: [
      {
        claim: "Led engineering teams at urb.io and Marelli.",
        outcome: "Doubled the urb.io team from 2 to 4 through hiring and onboarding; led 6 developers on Marelli's core headlamp module.",
        url: "https://urb.io",
      },
    ],
  },
];

export default skills;
