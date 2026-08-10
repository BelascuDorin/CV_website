import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTER,
  activeEngagements,
  filterProjects,
  isFilterActive,
  listProjects,
  mergeWorkFilterIntoQuery,
  parseWorkFilter,
  projectCountsByTechnology,
  serializeWorkFilter,
  technologyUsage,
} from "./selectors";
import type { Engagement, Technology } from "./types";

const TECHNOLOGIES: Technology[] = [
  { id: "react", name: "React.js", category: "Frameworks & Libraries" },
  { id: "java", name: "Java", category: "Languages" },
  { id: "datadog", name: "Datadog", category: "Tools & Platforms" },
];

const ENGAGEMENTS: Engagement[] = [
  {
    slug: "acme",
    company: "Acme",
    title: "Senior Engineer",
    kind: "Contract",
    startDate: "Apr 2024",
    endDate: "Present",
    projects: [
      {
        slug: "acme-checkout",
        name: "Checkout rewrite",
        description: "Rebuilt checkout.",
        outcomes: ["Converted better."],
        technologies: [
          { technologyId: "react", problem: "Shared UI across surfaces." },
          { technologyId: "datadog" },
        ],
      },
      {
        slug: "acme-api",
        name: "API consolidation",
        description: "Merged two APIs.",
        outcomes: [],
        technologies: [{ technologyId: "java" }],
      },
    ],
  },
  {
    slug: "side",
    company: "side.example",
    title: "Solo",
    kind: "Solo",
    startDate: "2025",
    endDate: "Present",
    projects: [
      {
        slug: "side-app",
        name: "Side app",
        description: "A side app.",
        outcomes: [],
        technologies: [{ technologyId: "react" }],
      },
    ],
  },
  {
    slug: "old-corp",
    company: "OldCorp",
    title: "Engineer",
    kind: "Employment",
    startDate: "2018",
    endDate: "2020",
    projects: [
      {
        slug: "old-thing",
        name: "Old thing",
        description: "Legacy work.",
        outcomes: [],
        technologies: [{ technologyId: "java" }],
      },
    ],
  },
];

describe("listProjects", () => {
  it("flattens every project in engagement order and keeps its engagement", () => {
    const placed = listProjects(ENGAGEMENTS);

    expect(placed.map((p) => p.project.slug)).toEqual([
      "acme-checkout",
      "acme-api",
      "side-app",
      "old-thing",
    ]);
    expect(placed[0].engagement.company).toBe("Acme");
    expect(placed[2].engagement.company).toBe("side.example");
  });
});

describe("projectCountsByTechnology", () => {
  it("counts how many projects reference each technology", () => {
    const counts = projectCountsByTechnology(ENGAGEMENTS);

    expect(counts.get("react")).toBe(2);
    expect(counts.get("java")).toBe(2);
    expect(counts.get("datadog")).toBe(1);
  });

  it("reports nothing for a technology no project uses", () => {
    expect(projectCountsByTechnology(ENGAGEMENTS).get("cobol")).toBeUndefined();
  });

  it("counts a project once even if a technology is listed twice", () => {
    const duplicated: Engagement[] = [
      {
        ...ENGAGEMENTS[0],
        projects: [
          {
            ...ENGAGEMENTS[0].projects[0],
            technologies: [{ technologyId: "react" }, { technologyId: "react" }],
          },
        ],
      },
    ];

    expect(projectCountsByTechnology(duplicated).get("react")).toBe(1);
  });
});

describe("filterProjects", () => {
  it("returns every project when no filter is applied", () => {
    expect(filterProjects(ENGAGEMENTS, EMPTY_FILTER)).toHaveLength(4);
  });

  it("matches projects using ANY of the selected technologies", () => {
    const result = filterProjects(ENGAGEMENTS, {
      technologyIds: ["react", "java"],
      kinds: [],
    });

    expect(result.map((p) => p.project.slug)).toEqual([
      "acme-checkout",
      "acme-api",
      "side-app",
      "old-thing",
    ]);
  });

  it("narrows to a single technology", () => {
    const result = filterProjects(ENGAGEMENTS, {
      technologyIds: ["datadog"],
      kinds: [],
    });

    expect(result.map((p) => p.project.slug)).toEqual(["acme-checkout"]);
  });

  it("matches engagements of ANY of the selected kinds", () => {
    const result = filterProjects(ENGAGEMENTS, {
      technologyIds: [],
      kinds: ["Solo", "Employment"],
    });

    expect(result.map((p) => p.project.slug)).toEqual(["side-app", "old-thing"]);
  });

  it("requires BOTH facets to match when technology and kind are combined", () => {
    const result = filterProjects(ENGAGEMENTS, {
      technologyIds: ["react"],
      kinds: ["Solo"],
    });

    expect(result.map((p) => p.project.slug)).toEqual(["side-app"]);
  });

  it("returns nothing when the facets cannot both be satisfied", () => {
    const result = filterProjects(ENGAGEMENTS, {
      technologyIds: ["datadog"],
      kinds: ["Solo"],
    });

    expect(result).toEqual([]);
  });
});

describe("parseWorkFilter", () => {
  it("reads a comma-separated technology list", () => {
    const filter = parseWorkFilter(
      new URLSearchParams("tech=react,java"),
      TECHNOLOGIES
    );

    expect(filter.technologyIds).toEqual(["react", "java"]);
    expect(filter.kinds).toEqual([]);
  });

  it("ignores technology ids that are not in the registry, so stale links still render", () => {
    const filter = parseWorkFilter(
      new URLSearchParams("tech=react,angular"),
      TECHNOLOGIES
    );

    expect(filter.technologyIds).toEqual(["react"]);
  });

  it("degrades an entirely unknown technology list to no filter", () => {
    const filter = parseWorkFilter(
      new URLSearchParams("tech=angular"),
      TECHNOLOGIES
    );

    expect(isFilterActive(filter)).toBe(false);
  });

  it("reads kinds case-insensitively and drops unknown ones", () => {
    const filter = parseWorkFilter(
      new URLSearchParams("kind=solo,cofounder,astronaut"),
      TECHNOLOGIES
    );

    expect(filter.kinds).toEqual(["Solo", "Cofounder"]);
  });

  it("returns an empty filter for an empty query string", () => {
    const filter = parseWorkFilter(new URLSearchParams(""), TECHNOLOGIES);

    expect(filter).toEqual(EMPTY_FILTER);
    expect(isFilterActive(filter)).toBe(false);
  });

  it("drops duplicates and blank entries", () => {
    const filter = parseWorkFilter(
      new URLSearchParams("tech=react,,react"),
      TECHNOLOGIES
    );

    expect(filter.technologyIds).toEqual(["react"]);
  });
});

describe("serializeWorkFilter", () => {
  it("serialises nothing for an empty filter, keeping the canonical URL clean", () => {
    expect(serializeWorkFilter(EMPTY_FILTER)).toBe("");
  });

  it("round-trips through parseWorkFilter", () => {
    const filter = { technologyIds: ["react", "java"], kinds: ["Solo" as const] };
    const query = serializeWorkFilter(filter);

    expect(parseWorkFilter(new URLSearchParams(query), TECHNOLOGIES)).toEqual(
      filter
    );
  });

  it("omits a facet that has no selections", () => {
    const query = serializeWorkFilter({ technologyIds: ["react"], kinds: [] });

    expect(query).toBe("tech=react");
  });

  it("keeps commas literal, so shared links read as advertised", () => {
    const query = serializeWorkFilter({
      technologyIds: ["java", "spring-boot"],
      kinds: ["Solo"],
    });

    expect(query).toBe("tech=java,spring-boot&kind=solo");
    expect(query).not.toContain("%2C");
  });
});

describe("mergeWorkFilterIntoQuery", () => {
  it("preserves unrelated query parameters", () => {
    const query = mergeWorkFilterIntoQuery("utm_source=linkedin", {
      technologyIds: ["react"],
      kinds: [],
    });

    expect(query).toBe("utm_source=linkedin&tech=react");
  });

  it("replaces rather than appends the filter's own parameters", () => {
    const query = mergeWorkFilterIntoQuery("tech=java&kind=solo&ref=cv", {
      technologyIds: ["react"],
      kinds: [],
    });

    expect(query).toBe("ref=cv&tech=react");
  });

  it("strips the filter parameters entirely when the filter is cleared", () => {
    expect(
      mergeWorkFilterIntoQuery("tech=java&utm_source=x", EMPTY_FILTER)
    ).toBe("utm_source=x");
  });

  it("returns an empty string when nothing is left", () => {
    expect(mergeWorkFilterIntoQuery("tech=java", EMPTY_FILTER)).toBe("");
  });
});

describe("isFilterActive", () => {
  it("is false only when both facets are empty", () => {
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
    expect(isFilterActive({ technologyIds: ["react"], kinds: [] })).toBe(true);
    expect(isFilterActive({ technologyIds: [], kinds: ["Solo"] })).toBe(true);
  });
});

describe("activeEngagements", () => {
  it("returns only present-day engagements of the given kinds", () => {
    expect(
      activeEngagements(ENGAGEMENTS, ["Contract", "Employment"]).map(
        (e) => e.slug
      )
    ).toEqual(["acme"]);
  });

  it("treats a past engagement as inactive even if its kind matches", () => {
    expect(activeEngagements(ENGAGEMENTS, ["Employment"])).toEqual([]);
  });
});

describe("technologyUsage", () => {
  it("finds the usage carrying the problem statement", () => {
    const project = ENGAGEMENTS[0].projects[0];

    expect(technologyUsage(project, "react")?.problem).toBe(
      "Shared UI across surfaces."
    );
  });

  it("returns the usage even when it has no problem statement", () => {
    const project = ENGAGEMENTS[0].projects[0];

    expect(technologyUsage(project, "datadog")).toEqual({
      technologyId: "datadog",
    });
  });

  it("returns undefined for a technology the project never used", () => {
    expect(technologyUsage(ENGAGEMENTS[0].projects[0], "java")).toBeUndefined();
  });
});
