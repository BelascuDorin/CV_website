import type { NowData } from "./types";

const now: NowData = {
  employment: {
    company: "Grubhub",
    role: "Senior Software Engineer (Contract)",
    description: "Building consumer-facing features across the Grubhub app — from personalised offers and subscriptions to cross-platform authentication migrations.",
    startDate: "Apr 2024",
  },
  sideProjects: [
    {
      name: "efera.ro",
      description: "Sole owner of the end-to-end IT solution — a Next.js storefront on top of Shopify.",
      url: "https://efera.ro",
    },
    {
      name: "nutrichefdelivery.ro",
      description: "Cofounder & CTO — a Next.js meal-delivery platform on Stripe + Sentry, scaled to ~30 daily orders.",
      url: "https://nutrichefdelivery.ro",
    },
    {
      name: "usercompass.tech",
      description: "Cofounder — a churn-reduction SaaS connecting product feedback to Stripe revenue data, shipped with a BMAD agent architecture.",
      url: "https://usercompass.tech",
    },
  ],
  selfDevelopment: {
    description: "Currently focused on:",
    items: [
      "Reading Domain-Driven Design by Eric Evans",
      "Learning Java Spring on Udemy",
      "Building reinvent — a full-stack side project (Spring Boot + Nuxt) to put it all into practice",
    ],
  },
};

export default now;
