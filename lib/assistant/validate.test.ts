import { describe, expect, it } from "vitest";
import {
  CitationFilter,
  DEMOTED_EVIDENCE,
  gapLabels,
  stripUnknownCitations,
  validateJobMatch,
} from "./validate";

const KNOWN = new Set(["auto-trial-subscriptions", "reinvent"]);

function requirement(overrides: Record<string, unknown> = {}) {
  return {
    requirement: "React",
    status: "strong",
    evidence: "Built the trial flow in React.",
    projectSlugs: ["auto-trial-subscriptions"],
    ...overrides,
  };
}

describe("validateJobMatch", () => {
  it("passes a well-formed match through unchanged", () => {
    const raw = { requirements: [requirement()], summary: "Good fit." };
    expect(validateJobMatch(raw, KNOWN)).toEqual(raw);
  });

  it("drops citations to Projects that do not exist", () => {
    const match = validateJobMatch(
      {
        requirements: [
          requirement({ projectSlugs: ["auto-trial-subscriptions", "made-up-project"] }),
        ],
        summary: "",
      },
      KNOWN
    );
    expect(match!.requirements[0].projectSlugs).toEqual(["auto-trial-subscriptions"]);
  });

  it("demotes a Strong whose only citations are invented to a Gap", () => {
    const match = validateJobMatch(
      {
        requirements: [
          requirement({ evidence: "Led the Kotlin rewrite.", projectSlugs: ["kotlin-rewrite"] }),
        ],
        summary: "",
      },
      KNOWN
    );
    expect(match!.requirements[0]).toEqual({
      requirement: "React",
      status: "gap",
      evidence: DEMOTED_EVIDENCE,
      projectSlugs: [],
    });
  });

  it("demotes a Partial with no citations to a Gap", () => {
    const match = validateJobMatch(
      { requirements: [requirement({ status: "partial", projectSlugs: [] })], summary: "" },
      KNOWN
    );
    expect(match!.requirements[0].status).toBe("gap");
  });

  it("never lets a Gap carry citations", () => {
    const match = validateJobMatch(
      {
        requirements: [
          requirement({
            requirement: "Kotlin",
            status: "gap",
            evidence: "No Kotlin; Java in reinvent is adjacent.",
            projectSlugs: ["reinvent"],
          }),
        ],
        summary: "",
      },
      KNOWN
    );
    expect(match!.requirements[0]).toMatchObject({
      status: "gap",
      evidence: "No Kotlin; Java in reinvent is adjacent.",
      projectSlugs: [],
    });
  });

  it("removes duplicate citations", () => {
    const match = validateJobMatch(
      {
        requirements: [
          requirement({ projectSlugs: ["reinvent", "reinvent"] }),
        ],
        summary: "",
      },
      KNOWN
    );
    expect(match!.requirements[0].projectSlugs).toEqual(["reinvent"]);
  });

  it("strips invented citations from the summary", () => {
    const match = validateJobMatch(
      {
        requirements: [requirement()],
        summary: "See [[auto-trial-subscriptions]] and [[made-up-project]].",
      },
      KNOWN
    );
    expect(match!.summary).toBe("See [[auto-trial-subscriptions]] and .");
  });

  it.each([
    ["null", null],
    ["a string", "not json"],
    ["a missing summary", { requirements: [requirement()] }],
    ["an unknown status", { requirements: [requirement({ status: "excellent" })], summary: "" }],
    ["no requirements", { requirements: [], summary: "Nothing." }],
    ["only blank requirements", { requirements: [requirement({ requirement: "  " })], summary: "" }],
  ])("returns null for %s", (_label, raw) => {
    expect(validateJobMatch(raw, KNOWN)).toBeNull();
  });
});

describe("gapLabels", () => {
  it("lists only the Gap requirements, including demoted ones", () => {
    const match = validateJobMatch(
      {
        requirements: [
          requirement({ requirement: "React" }),
          requirement({ requirement: "Kotlin", status: "gap", projectSlugs: [] }),
          requirement({ requirement: "AWS", projectSlugs: ["invented"] }),
        ],
        summary: "",
      },
      KNOWN
    )!;
    expect(gapLabels(match)).toEqual(["Kotlin", "AWS"]);
  });
});

describe("stripUnknownCitations", () => {
  it("keeps real citations and removes invented ones", () => {
    expect(stripUnknownCitations("[[reinvent]] and [[nope]]", KNOWN)).toBe(
      "[[reinvent]] and "
    );
  });

  it("leaves single brackets alone", () => {
    expect(stripUnknownCitations("an array [1, 2]", KNOWN)).toBe("an array [1, 2]");
  });
});

describe("CitationFilter", () => {
  function run(chunks: string[]) {
    const filter = new CitationFilter(KNOWN);
    const out = chunks.map((chunk) => filter.push(chunk)).join("") + filter.flush();
    return { out, noEvidence: filter.answeredWithoutEvidence };
  }

  it("passes plain text straight through", () => {
    const filter = new CitationFilter(KNOWN);
    expect(filter.push("Dorin built ")).toBe("Dorin built ");
  });

  it("keeps a real citation split across chunks", () => {
    expect(run(["See [[rein", "vent]] for Java."]).out).toBe("See [[reinvent]] for Java.");
  });

  it("removes an invented citation split across chunks before it is emitted", () => {
    const filter = new CitationFilter(KNOWN);
    const first = filter.push("See [[kotlin-");
    expect(first).toBe("See ");
    expect(filter.push("rewrite]] here.") + filter.flush()).toBe(" here.");
  });

  it("holds back a lone trailing bracket until it is known not to open a marker", () => {
    expect(run(["Value [", "1] and [", "[reinvent]]"]).out).toBe(
      "Value [1] and [[reinvent]]"
    );
  });

  it("detects and strips the no-evidence marker", () => {
    const result = run(["There is no evidence of Kotlin. ", "[[", "?]]"]);
    expect(result.out).toBe("There is no evidence of Kotlin. ");
    expect(result.noEvidence).toBe(true);
  });

  it("does not report no-evidence for a grounded answer", () => {
    expect(run(["Yes, see [[reinvent]]."]).noEvidence).toBe(false);
  });

  it("releases an unclosed bracket run that is too long to be a marker", () => {
    const long = "[[" + "x".repeat(100);
    expect(run([long, " end"]).out).toBe(long + " end");
  });

  it("flushes an unclosed marker at the end of the stream as plain text", () => {
    expect(run(["Trailing [[rein"]).out).toBe("Trailing [[rein");
  });
});
