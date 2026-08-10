import type { NowData } from "./types";

/**
 * Only the hand-authored part of the Now Section. Active employment and side
 * projects are derived from the Engagements whose end date is "Present", so
 * nothing about current work is authored twice.
 */
const now: NowData = {
  selfDevelopment: {
    description: "Currently focused on:",
    items: [
      "Reading Domain-Driven Design by Eric Evans",
      "Learning Java Spring on Udemy",
      "Putting both into practice in reinvent — Spring Boot backend, Nuxt frontend",
    ],
  },
};

export default now;
