import type { Engagement } from "./types";

/**
 * The single source of truth for everything Dorin has built and everywhere he
 * has worked — see docs/adr/0001-project-as-single-data-spine.md.
 *
 * Array order is display order in the Timeline View. It is authored rather than
 * sorted, because several engagements run concurrently and pure reverse
 * chronology would bury the current main role beneath side projects. The order
 * is: active employment, then active self-directed work, then past roles
 * reverse-chronologically.
 *
 * Project-level dates are supported by the type but left off where the real
 * dates aren't known — the Work Section falls back to the engagement's range.
 * Never guess them.
 */
const engagements: Engagement[] = [
  // ─── Active ───────────────────────────────────────────────────────────────

  {
    slug: "grubhub",
    company: "Grubhub",
    title: "Senior Software Engineer (Contract)",
    kind: "Contract",
    startDate: "Apr 2024",
    endDate: "Present",
    url: "https://www.grubhub.com",
    projects: [
      {
        slug: "auto-trial-subscriptions",
        name: "Auto-trial subscriptions",
        description:
          "Built the auto-trial subscription feature end to end on a 1M+ user platform — eligibility, enrolment, and the trial-to-paid transition.",
        outcomes: [
          "20,000+ sign-ups at a ~75% conversion rate.",
          "~$200k in monthly recurring revenue.",
        ],
        technologies: [
          {
            technologyId: "typescript",
            problem:
              "Kept an eligibility-and-enrolment flow safe to change in a large codebase where the data feeding it was often unreliable.",
          },
          {
            technologyId: "react",
            problem:
              "Composed the trial flow from the components the rest of the app already used, so an entirely new purchase path did not arrive looking like a separate product.",
          },
          {
            technologyId: "redux",
            problem:
              "Kept subscription state predictable across a flow spanning several screens and a payment step.",
          },
          { technologyId: "progressive-rollout" },
          {
            technologyId: "testcafe",
            problem:
              "End-to-end cover on the purchase path, because a broken subscription flow is invisible to unit tests and expensive in production.",
          },
          {
            technologyId: "react-testing-library",
            problem:
              "Covered the eligibility branches at component level, where the combinations are cheap to enumerate.",
          },
        ],
      },
      {
        slug: "personalised-offers-carousel",
        name: "Personalised offers carousel",
        description:
          "Led the full redesign of the carousel surfacing price reductions based on a user's own activity.",
        outcomes: ["Tens of thousands of impressions per day."],
        technologies: [
          { technologyId: "typescript" },
          { technologyId: "react" },
          { technologyId: "redux" },
          { technologyId: "testcafe" },
          { technologyId: "react-testing-library" },
        ],
      },
      {
        slug: "braze-sdk-migration",
        name: "Braze SDK major-version migration",
        description:
          "Migrated the Braze SDK across a breaking major version on the consumer app.",
        outcomes: ["Zero production incidents."],
        technologies: [
          {
            technologyId: "braze",
            problem:
              "Upgrade the messaging SDK across a breaking major version without dropping campaign delivery.",
          },
          {
            technologyId: "datadog",
            problem:
              "Made the migration safe to ship incrementally — dashboards and monitors proved each rollout stage healthy before the next one opened.",
          },
          {
            technologyId: "progressive-rollout",
            problem:
              "Turned an all-or-nothing SDK upgrade into a staged rollout that could be halted at any point.",
          },
        ],
      },
      {
        slug: "lwa-auth-migration",
        name: "Login with Amazon migration",
        description:
          "Owned the cross-platform Login with Amazon migration end to end across web, iOS, and Android.",
        outcomes: ["Shipped on all three platforms with no break in sign-in."],
        technologies: [
          { technologyId: "typescript" },
          { technologyId: "react" },
        ],
      },
    ],
  },

  {
    slug: "nutrichefdelivery",
    company: "nutrichefdelivery.ro",
    title: "Cofounder & CTO",
    kind: "Cofounder",
    startDate: "Mar 2025",
    endDate: "Present",
    url: "https://nutrichefdelivery.ro",
    projects: [
      {
        slug: "nutrichef-platform",
        name: "Meal-delivery platform",
        description:
          "Built the product from scratch — storefront, ordering, payments, and the tooling the kitchen runs on.",
        outcomes: [
          "~1,000 orders and 115 users in the first year.",
          "Scaled to ~30 daily orders through continuous UX iteration.",
        ],
        technologies: [
          {
            technologyId: "nextjs",
            problem:
              "One framework for a storefront that had to be fast on mobile and indexable, with the ordering logic server-side in the same codebase.",
          },
          { technologyId: "react" },
          { technologyId: "typescript" },
          {
            technologyId: "nodejs",
            problem:
              "Payments, webhooks, and analytics wired up server-side from day one rather than bolted on later.",
          },
          {
            technologyId: "stripe",
            problem:
              "Take card payments and handle repeat orders without building and securing a payment stack.",
          },
          {
            technologyId: "sentry",
            problem:
              "Catch checkout errors in production before a customer had to report them.",
          },
          { technologyId: "ai-integration" },
          {
            technologyId: "ai-assisted-development",
            problem:
              "Shipped a production product end to end with a 3-person team, using a BMAD agent architecture.",
          },
        ],
      },
    ],
  },

  {
    // TODO(dorin): confirm the real start date — placeholder, not researched.
    slug: "efera",
    company: "efera.ro",
    title: "Owner, end-to-end IT solution",
    kind: "Solo",
    startDate: "2025",
    endDate: "Present",
    url: "https://efera.ro",
    projects: [
      {
        slug: "efera-storefront",
        name: "Storefront on Shopify",
        description:
          "Sole owner of the end-to-end IT solution — a Next.js storefront in front of Shopify.",
        outcomes: ["Running as the live storefront."],
        technologies: [
          { technologyId: "nextjs" },
          { technologyId: "react" },
          { technologyId: "javascript" },
          {
            technologyId: "shopify",
            problem:
              "Kept catalogue, checkout, and payments on a platform the business can run without me, while owning the storefront experience in Next.js.",
          },
        ],
      },
    ],
  },

  {
    slug: "personal-projects",
    company: "Personal projects",
    title: "Self-directed",
    kind: "Solo",
    startDate: "2025",
    endDate: "Present",
    projects: [
      {
        slug: "reinvent",
        name: "reinvent — career-change marketplace",
        description:
          "A full-stack side project connecting career-changers with people already working in the field they want to move into. Built to learn Java, Spring, and the Vue ecosystem at depth rather than reach for familiar tools.",
        outcomes: [
          "Modular monolith with a REST API, JPA persistence, security, and versioned migrations.",
        ],
        url: "https://github.com/BelascuDorin/reinvent",
        technologies: [
          {
            technologyId: "java",
            problem:
              "Picked deliberately rather than reaching for Node: the backend roles worth targeting are on the JVM, and reading about a language is not the same as shipping in it.",
          },
          {
            technologyId: "spring-boot",
            problem:
              "One opinionated backend stack covering the API, security, persistence, and migrations, so the learning went into architecture rather than wiring.",
          },
          {
            technologyId: "postgresql",
            problem:
              "Relational from the start — the marketplace's core is people, fields, and bookings, which is all joins and nothing document-shaped.",
          },
          {
            technologyId: "flyway",
            problem:
              "Versioned the schema from the first commit, so no migration was ever run by hand.",
          },
          {
            technologyId: "docker",
            problem:
              "Ran Postgres locally via Docker Compose so the development database matched the production shape.",
          },
          { technologyId: "vue" },
          {
            technologyId: "nuxt",
            problem:
              "Deliberately learned a second frontend ecosystem properly — file-based routing, server composables, and TypeScript throughout — instead of defaulting to React.",
          },
          { technologyId: "typescript" },
          {
            technologyId: "modular-monolith",
            problem:
              "Spring Modulith enforces module boundaries at build time, so services can be extracted later without a big-bang rewrite.",
          },
          { technologyId: "ai-assisted-development" },
        ],
      },
      {
        slug: "cv-website",
        name: "This site",
        description:
          "The site you are reading, with an Assistant that matches job descriptions against this CV and answers questions about my experience — built spec-first, with the domain model and decisions written before any code.",
        outcomes: [
          "Domain model in CONTEXT.md and decisions in docs/adr/ precede the implementation.",
          "Job descriptions are matched requirement by requirement, citing real Projects and showing gaps honestly.",
        ],
        url: "https://github.com/BelascuDorin/CV_website",
        notes:
          "The Assistant sends the whole authored CV as cached context on every request instead of using retrieval, because the data is about ten thousand tokens and retrieval would only add a way to miss the relevant project. The model cites projects by slug, and the server drops any citation to a project that does not exist before it renders, so the no-invention rule is enforced in code rather than only asked of the model. Cost and abuse are bounded by a prepaid credit ceiling, per-IP rate limits, input caps, and a kill switch; an outage shows a fallback pointing back to the page rather than silently switching to a weaker model. Quality is checked with a manual eval of synthetic job descriptions and questions with expected answers.",
        technologies: [
          { technologyId: "nextjs" },
          { technologyId: "react" },
          { technologyId: "typescript" },
          { technologyId: "tailwind" },
          { technologyId: "nodejs" },
          {
            technologyId: "zod",
            problem:
              "One schema both constrains the model's Job Match output and validates it before anything renders.",
          },
          {
            technologyId: "vitest",
            problem:
              "Integrity tests keep the single data spine honest, and the Assistant is tested end to end with fakes, so the suite never spends API credit.",
          },
          { technologyId: "vercel" },
          {
            technologyId: "claude-code",
            problem:
              "Drove architecture and implementation from a written domain model, so every decision was recorded and reviewable before code existed.",
          },
          { technologyId: "ai-assisted-development" },
          {
            technologyId: "claude-api",
            problem:
              "Answers only from authored CV data; every cited Project is checked against the real data before it renders.",
          },
          {
            technologyId: "upstash-redis",
            problem:
              "One store for per-IP rate limiting and an anonymous log of questions the Assistant couldn't answer.",
          },
          {
            technologyId: "ai-integration",
            problem:
              "Fails safely: hard spend cap, a kill switch, and a fallback that sends visitors back to the page.",
          },
        ],
      },
    ],
  },

  // ─── Past ─────────────────────────────────────────────────────────────────

  {
    slug: "usercompass",
    company: "usercompass.tech",
    title: "Cofounder",
    kind: "Cofounder",
    startDate: "Jan 2025",
    endDate: "2026",
    url: "https://usercompass.tech",
    projects: [
      {
        slug: "usercompass-saas",
        name: "Churn-reduction SaaS",
        description:
          "Co-built a product that connects product feedback to revenue data, so churn signals arrive with a value attached.",
        outcomes: ["Taken from idea to production by a 3-person team."],
        technologies: [
          { technologyId: "nextjs" },
          { technologyId: "react" },
          { technologyId: "typescript" },
          {
            technologyId: "stripe",
            problem:
              "Joined qualitative feedback to real subscription revenue, so churn risk could be ranked by the money behind it.",
          },
          { technologyId: "ai-assisted-development" },
        ],
      },
    ],
  },

  {
    slug: "fortech-urbio",
    company: "Fortech · urb.io",
    title: "React Developer",
    kind: "Employment",
    startDate: "Apr 2021",
    endDate: "Mar 2024",
    url: "https://urb.io",
    projects: [
      {
        slug: "urbio-platform-rewrite",
        name: "Platform rewrite after a product pivot",
        description:
          "Led a full rewrite of the platform when the product pivoted, and grew the team to deliver it.",
        outcomes: [
          "Active enterprise clients grew from 3 to 10.",
          "~$50k in additional monthly revenue.",
        ],
        technologies: [
          {
            technologyId: "react",
            problem:
              "Rebuilt the platform as composable components, so the next product change would not require another rewrite.",
          },
          { technologyId: "nextjs" },
          { technologyId: "redux-toolkit" },
          { technologyId: "typescript" },
          {
            technologyId: "javascript",
            problem:
              "The platform was plain JavaScript; the rewrite moved it to TypeScript file by file rather than stopping delivery to convert it first.",
          },
          {
            technologyId: "team-leadership",
            problem:
              "Doubled the engineering team from 2 to 4 by running the hiring interviews and onboarding, because the rewrite could not land with two people.",
          },
        ],
      },
      {
        slug: "urbio-heat-network",
        name: "District-heating network features",
        description:
          "Built the map-heavy features end to end for an AI-powered district-heating platform sold to energy companies across Europe.",
        outcomes: [
          "Network routing, area selection, heat-demand calculation, and ROI screens.",
        ],
        technologies: [
          {
            technologyId: "mapbox",
            problem:
              "Let energy planners draw and route heat networks over real geography, with demand and return on investment computed from what they drew.",
          },
          { technologyId: "react" },
          { technologyId: "nextjs" },
          { technologyId: "redux-toolkit" },
          { technologyId: "javascript" },
        ],
      },
    ],
  },

  {
    slug: "marelli-pm",
    company: "Marelli",
    title: "Software Project Manager",
    kind: "Employment",
    startDate: "Sep 2020",
    endDate: "Apr 2021",
    projects: [
      {
        slug: "marelli-project-delivery",
        name: "Automotive software project delivery",
        description:
          "Owned an automotive software project end to end, synchronising development, QA, and senior management.",
        outcomes: [
          "Chosen for the role specifically to bring technical context into project decisions.",
        ],
        technologies: [
          {
            technologyId: "project-management",
            problem:
              "Kept a multi-team automotive delivery on a fixed customer date, tracked through Gantt planning, without losing the engineering detail behind each decision.",
          },
        ],
      },
    ],
  },

  {
    slug: "marelli-lead",
    company: "Marelli",
    title: "Lead Application Developer",
    kind: "Employment",
    startDate: "Feb 2020",
    endDate: "Aug 2020",
    projects: [
      {
        slug: "marelli-headlamp-core",
        name: "Core headlamp rendering module",
        description:
          "Led the module responsible for all light output and the innovative lighting features of the headlamp system.",
        outcomes: [
          "Led a team of 6 developers.",
          "Shipped to production vehicles — the system reached millions of units on the road.",
        ],
        technologies: [
          {
            technologyId: "embedded-c",
            problem:
              "Rendered light output in firmware under real-time and safety constraints, where a defect ships inside a car and cannot be patched remotely.",
          },
          { technologyId: "team-leadership" },
        ],
      },
    ],
  },

  {
    slug: "marelli-junior",
    company: "Marelli",
    title: "Junior Software Developer",
    kind: "Employment",
    startDate: "Aug 2018",
    endDate: "Feb 2020",
    projects: [
      {
        slug: "marelli-headlamp-features",
        name: "Headlamp module features",
        description:
          "Feature work on the headlamp module in an agile team, taking partial ownership of planning and customer discussions.",
        outcomes: [
          "Mentored a junior team member.",
          "Progressed to lead developer within 18 months.",
        ],
        technologies: [{ technologyId: "embedded-c" }],
      },
    ],
  },

  {
    slug: "hanna-instruments",
    company: "Hanna Instruments",
    title: "Embedded Software Developer (Part-time)",
    kind: "Employment",
    startDate: "Apr 2017",
    endDate: "Aug 2018",
    url: "https://www.hannainst.com",
    projects: [
      {
        slug: "hanna-meter-firmware",
        name: "Portable measurement meter firmware",
        description:
          "Firmware for portable chemical measurement meters — sensor reading, calibration logic, display, and communication protocols.",
        outcomes: [
          "Shipped as commercially sold products, including the HI98703 turbidity meter, available worldwide.",
        ],
        technologies: [
          {
            technologyId: "embedded-c",
            problem:
              "Turned raw sensor readings into calibrated measurements a lab could trust, on a battery-powered device with only a few kilobytes to work in.",
          },
        ],
      },
    ],
  },
];

export default engagements;
