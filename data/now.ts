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
      "Learning to become an AI engineer, with Claude as my guide",
    ],
  },
};

export default now;
