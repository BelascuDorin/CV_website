import { describe, expect, it } from "vitest";
import * as data from "@/data";
import { listProjects } from "@/data/selectors";
import { assistantSourcesFrom, buildAssistantContext, knownProjectSlugs } from "./context";

const SOURCES = assistantSourcesFrom(data);

describe("buildAssistantContext", () => {
  const context = buildAssistantContext(SOURCES);

  it("is byte-identical across calls, so prompt caching hits", () => {
    expect(buildAssistantContext(SOURCES)).toBe(context);
  });

  it("does not depend on the clock", () => {
    const realNow = Date.now;
    Date.now = () => 0;
    try {
      expect(buildAssistantContext(SOURCES)).toBe(context);
    } finally {
      Date.now = realNow;
    }
  });

  it("includes every Project, cited by its slug", () => {
    for (const { project } of listProjects(data.engagements)) {
      expect(context, project.slug).toContain(`[[${project.slug}]]`);
    }
  });

  it("includes Project Notes", () => {
    const withNotes = listProjects(data.engagements).filter(({ project }) => project.notes);
    expect(withNotes.length).toBeGreaterThan(0);
    for (const { project } of withNotes) {
      expect(context, project.slug).toContain(project.notes!);
    }
  });

  it("includes Candidate Notes", () => {
    expect(context).toContain(data.candidateNotes.trim());
  });

  it("includes every Technology Usage problem statement", () => {
    for (const { project } of listProjects(data.engagements)) {
      for (const usage of project.technologies) {
        if (usage.problem) expect(context).toContain(usage.problem);
      }
    }
  });

  it("names technologies by display name, not id", () => {
    expect(context).toContain("- React.js");
  });
});

describe("knownProjectSlugs", () => {
  it("lists every Project slug", () => {
    const slugs = knownProjectSlugs(data.engagements);
    expect(slugs.size).toBe(listProjects(data.engagements).length);
    expect(slugs.has("cv-website")).toBe(true);
  });
});
