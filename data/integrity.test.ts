import { describe, expect, it } from "vitest";
import candidateNotes from "./candidateNotes";
import engagements from "./engagements";
import presets from "./presets";
import technologies from "./technologies";
import { filterProjects, listProjects, projectCountsByTechnology } from "./selectors";

/**
 * The registry-by-id design has one silent failure mode: an id that does not
 * resolve is skipped at render time rather than erroring, so a typo quietly
 * removes a chip. These tests are the thing that catches it.
 */

const technologyIds = new Set(technologies.map((t) => t.id));

describe("technology registry", () => {
  it("has no duplicate ids", () => {
    expect(technologyIds.size).toBe(technologies.length);
  });

  it("has no duplicate display names", () => {
    const names = new Set(technologies.map((t) => t.name));
    expect(names.size).toBe(technologies.length);
  });

  it("uses url-safe ids, since they are a public contract in filter links", () => {
    for (const technology of technologies) {
      expect(technology.id, technology.name).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("contains no technology that no project references", () => {
    const counts = projectCountsByTechnology(engagements);
    const unreferenced = technologies
      .filter((t) => !counts.has(t.id))
      .map((t) => t.id);

    expect(unreferenced).toEqual([]);
  });
});

describe("engagements", () => {
  it("has unique engagement slugs", () => {
    const slugs = engagements.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique project slugs across all engagements", () => {
    const slugs = listProjects(engagements).map((p) => p.project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every engagement at least one project, since engagements describe no work themselves", () => {
    const empty = engagements.filter((e) => e.projects.length === 0);
    expect(empty.map((e) => e.slug)).toEqual([]);
  });

  it("references only technologies that exist in the registry", () => {
    const unknown = listProjects(engagements).flatMap(({ project }) =>
      project.technologies
        .map((usage) => usage.technologyId)
        .filter((id) => !technologyIds.has(id))
        .map((id) => `${project.slug} → ${id}`)
    );

    expect(unknown).toEqual([]);
  });

  it("never lists the same technology twice on one project", () => {
    const duplicated = listProjects(engagements)
      .filter(({ project }) => {
        const ids = project.technologies.map((u) => u.technologyId);
        return new Set(ids).size !== ids.length;
      })
      .map(({ project }) => project.slug);

    expect(duplicated).toEqual([]);
  });

  it("gives every project a description", () => {
    for (const { project } of listProjects(engagements)) {
      expect(project.description.length, project.slug).toBeGreaterThan(0);
    }
  });
});

describe("presets", () => {
  it("has unique slugs", () => {
    const slugs = presets.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("references only technologies that exist in the registry", () => {
    const unknown = presets.flatMap((preset) =>
      preset.filter.technologyIds
        .filter((id) => !technologyIds.has(id))
        .map((id) => `${preset.slug} → ${id}`)
    );

    expect(unknown).toEqual([]);
  });

  it("matches at least two projects each, so none reads as padding", () => {
    for (const preset of presets) {
      expect(
        filterProjects(engagements, preset.filter).length,
        preset.slug
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("matches fewer than half the projects, so none is a no-op dressed as a lens", () => {
    const total = listProjects(engagements).length;

    for (const preset of presets) {
      expect(
        filterProjects(engagements, preset.filter).length,
        preset.slug
      ).toBeLessThan(total / 2);
    }
  });
});

describe("problem statements", () => {
  const withProblem = new Set(
    listProjects(engagements).flatMap(({ project }) =>
      project.technologies
        .filter((usage) => usage.problem)
        .map((usage) => usage.technologyId)
    )
  );

  /**
   * `problem` is optional by design, but a technology the visitor is most likely
   * to filter on must explain itself somewhere — otherwise the Filtered View
   * promises "what it solved" and delivers a bare list.
   */
  it("exist for every technology used on three or more projects", () => {
    const counts = projectCountsByTechnology(engagements);
    const silent = [...counts.entries()]
      .filter(([id, count]) => count >= 3 && !withProblem.has(id))
      .map(([id]) => id);

    expect(silent).toEqual([]);
  });

  it("exist for every technology a preset filters on", () => {
    const silent = presets.flatMap((preset) =>
      preset.filter.technologyIds
        .filter((id) => !withProblem.has(id))
        .map((id) => `${preset.slug} → ${id}`)
    );

    expect(silent).toEqual([]);
  });
});

describe("assistant sources", () => {
  it("has non-empty Candidate Notes", () => {
    expect(candidateNotes.trim().length).toBeGreaterThan(0);
  });

  it("gives every Project Notes field real content when present", () => {
    const blank = listProjects(engagements)
      .filter(({ project }) => project.notes !== undefined)
      .filter(({ project }) => project.notes!.trim().length === 0)
      .map(({ project }) => project.slug);

    expect(blank).toEqual([]);
  });
});
