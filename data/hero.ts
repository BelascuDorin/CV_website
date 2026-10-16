import type { HeroData } from "./types";

const hero: HeroData = {
  name: "Dorin Belascu",
  role: "Senior Product Engineer",
  positioning: "9+ years, high ownership across scale and early-stage products",
  bio: [
    "Senior Product Engineer with 9+ years across React, Next.js, and TypeScript. I started in embedded C at Marelli, shipping firmware to millions of production vehicles, which grounded me in reliability, clean architecture, and why maintainability matters.",
    "At Grubhub I take full ownership of features end-to-end on a 1M+ user platform: ambiguous requirements, unreliable data, brittle APIs and all. I use Claude and AI-driven development daily to move fast without cutting corners, and I cofound products on the side with full-stack ownership from idea to production using AI-agent architectures like BMAD.",
    "I own what I build, push back when something won't scale, and ship things that actually work.",
  ],
  purpose: {
    title: "What is this site for",
    description:
      "A fuller, accurate picture of my experience than a two-page CV can give.",
    points: [
      "Every role broken down into the projects I actually shipped",
      "Each project lists the technologies it used, and why",
      "Filter by a technology to see exactly where I've used it",
    ],
  },
  headshotSrc: "/headshot-dolomites.jpeg",
};

export default hero;
