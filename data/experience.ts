import type { ExperienceEntry } from "./types";

const experience: ExperienceEntry[] = [
  // ─── Current roles (newest start date first) ─────────────────────────────

  {
    company: "Grubhub",
    title: "Senior Software Engineer (Contract)",
    startDate: "Apr 2024",
    endDate: "Present",
    bullets: [
      "Built the auto-trial subscription feature that generated 20,000+ sign-ups at a ~75% conversion rate, totalling ~$200k in monthly recurring revenue.",
      "Led the full redesign of a personalised offers carousel surfacing user-activity-based price reductions at tens of thousands of impressions per day.",
      "Migrated Braze SDK to a breaking major version with a progressive rollout, Datadog observability, and zero production incidents.",
    ],
  },

  {
    company: "nutrichefdelivery.ro",
    title: "Cofounder & CTO",
    startDate: "Mar 2025",
    endDate: "Present",
    bullets: [
      "Built the platform from scratch with Next.js, Stripe, and Sentry, reaching ~1,000 orders and 115 users in the first year.",
      "Scaled to ~30 daily orders through continuous UX iteration; integrated payments, error monitoring, and analytics from day one.",
    ],
  },

  // ─── Previous roles ───────────────────────────────────────────────────────

  {
    company: "Fortech · urb.io",
    title: "React Developer",
    startDate: "Apr 2021",
    endDate: "Mar 2024",
    bullets: [
      "Led a full platform rewrite following a product pivot, growing active enterprise clients from 3 to 10 and contributing to ~$50k in additional monthly revenue.",
      "Built map-heavy features end-to-end with Mapbox for an AI-powered district heating platform sold to energy companies across Europe.",
      "Doubled the engineering team from 2 to 4 by running hiring interviews and onboarding.",
    ],
  },

  {
    company: "Marelli",
    title: "Software Project Manager",
    startDate: "Sep 2020",
    endDate: "Apr 2021",
    bullets: [
      "Owned a full automotive software project end-to-end, synchronising dev, QA, and senior management while tracking delivery via Gantt charts.",
      "Specifically chosen for the PM role to bring technical context into project decisions.",
    ],
  },

  {
    company: "Marelli",
    title: "Lead Application Developer",
    startDate: "Feb 2020",
    endDate: "Aug 2020",
    bullets: [
      "Led a team of 6 developers on the core headlamp rendering module, responsible for all light output and innovative lighting features.",
      "Software shipped to production vehicles — the headlamp system reached millions of units on the road.",
    ],
  },

  {
    company: "Marelli",
    title: "Junior Software Developer",
    startDate: "Aug 2018",
    endDate: "Feb 2020",
    bullets: [
      "Worked in an agile team while mentoring a junior team member and taking partial ownership of planning and customer discussions.",
      "Progressed to lead developer role within 18 months based on performance.",
    ],
  },

  {
    company: "Hanna Instruments",
    title: "Embedded Software Developer (Part-time)",
    startDate: "Apr 2017",
    endDate: "Aug 2018",
    bullets: [
      "Developed embedded C firmware for portable chemical measurement meters, covering sensor reading, calibration logic, display firmware, and communication protocols.",
      "Software shipped as commercially sold products — including the HI98703 turbidity portable meter available worldwide.",
    ],
  },
];

export default experience;
