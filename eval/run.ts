/**
 * The Assistant eval. Spends real money — run it deliberately with `yarn eval`,
 * before launch and after any change of model, effort, or prompt. Never part of
 * `yarn test`.
 *
 * Runs every case through the real Assistant Service (real context, model, and
 * validator; a fake store with no rate limit), grades Job Matches in code and
 * Ask answers with a cheap model, and reports the measured cost.
 *
 *   yarn eval            all cases
 *   yarn eval kotlin     only cases whose id contains "kotlin"
 */
import { mkdirSync, writeFileSync } from "fs";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import * as data from "@/data";
import { EFFORT, MODEL } from "@/lib/assistant/config";
import { buildAssistantContext, knownProjectSlugs } from "@/lib/assistant/context";
import { createClaudeModel } from "@/lib/assistant/model";
import { createAssistantService, type LogEntry } from "@/lib/assistant/service";
import { askCases, jobMatchCases } from "./cases";

const GRADER_MODEL = "claude-haiku-5-5";

/** $ per million tokens. Check against current pricing if the model changes. */
const PRICES: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
};

interface UsageLike {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

const spend: Record<string, number> = {};
function record(model: string, usage: UsageLike) {
  const price = PRICES[model];
  const dollars =
    (usage.input_tokens * price.input +
      usage.output_tokens * price.output +
      (usage.cache_read_input_tokens ?? 0) * price.cacheRead +
      (usage.cache_creation_input_tokens ?? 0) * price.cacheWrite) /
    1_000_000;
  spend[model] = (spend[model] ?? 0) + dollars;
}

const client = new Anthropic();
const logged: LogEntry[] = [];

const service = createAssistantService({
  enabled: true,
  system: buildAssistantContext({
    hero: data.hero,
    engagements: data.engagements,
    technologies: data.technologies,
    now: data.now,
    education: data.education,
    contact: data.contact,
    candidateNotes: data.candidateNotes,
  }),
  knownSlugs: knownProjectSlugs(data.engagements),
  model: createClaudeModel({ client, onUsage: (usage) => record(MODEL, usage) }),
  store: {
    checkRateLimit: async () => ({ allowed: true }),
    log: async (entry) => {
      logged.push(entry);
    },
  },
  onError: (error) => console.error("  model error:", error),
});

const GradeSchema = z.object({
  checks: z.array(z.object({ check: z.string(), pass: z.boolean(), reason: z.string() })),
});

async function grade(question: string, answer: string, checklist: string[]) {
  const response = await client.messages.parse({
    model: GRADER_MODEL,
    max_tokens: 2_000,
    output_config: { effort: "low", format: zodOutputFormat(GradeSchema) },
    messages: [
      {
        role: "user",
        content: `You are grading an answer from an assistant on a candidate's CV website. Judge each check strictly against the answer text only.

<question>${question}</question>
<answer>${answer}</answer>
<checks>
${checklist.map((c, i) => `${i + 1}. ${c}`).join("\n")}
</checks>

Return one result per check, in order.`,
      },
    ],
  });
  record(GRADER_MODEL, response.usage);
  return response.parsed_output?.checks ?? checklist.map((check) => ({ check, pass: false, reason: "grader returned nothing" }));
}

/** Wrapped in a function: the project is CommonJS, which has no top-level await. */
async function main() {
  const filter = process.argv[2] ?? "";
  const results: unknown[] = [];
  let passed = 0;
  let total = 0;

  function mark(ok: boolean) {
    total++;
    if (ok) passed++;
    return ok ? "✓" : "✗";
  }

  console.log(`Assistant eval — ${MODEL} at effort "${EFFORT}"\n`);

  console.log("── Job Match ──");
  for (const testCase of jobMatchCases.filter((c) => c.id.includes(filter))) {
    const result = await service.jobMatch(testCase.jobDescription, "eval");
    console.log(`\n${testCase.id}`);
    if (!result.ok) {
      console.log(`  ${mark(false)} no match returned (${result.reason})`);
      results.push({ id: testCase.id, ok: false, result });
      continue;
    }

    const checks = testCase.expect.map((expectation) => {
      const found = result.match.requirements.find((r) => expectation.label.test(r.requirement));
      const ok = !!found && expectation.allowed.includes(found.status);
      console.log(
        `  ${mark(ok)} ${expectation.label} → ${found ? `${found.status} ("${found.requirement}")` : "not extracted"}` +
          (ok ? "" : `  expected ${expectation.allowed.join(" or ")}`)
      );
      return { label: String(expectation.label), allowed: expectation.allowed, found, ok };
    });
    results.push({ id: testCase.id, match: result.match, checks });
  }

  console.log("\n── Ask ──");
  for (const testCase of askCases.filter((c) => c.id.includes(filter))) {
    const before = logged.length;
    const result = await service.ask([{ role: "user", content: testCase.question }], "eval");
    console.log(`\n${testCase.id}: "${testCase.question}"`);
    if (!result.ok) {
      console.log(`  ${mark(false)} refused (${result.reason})`);
      results.push({ id: testCase.id, ok: false, result });
      continue;
    }

    let answer = "";
    let failed = false;
    for await (const event of result.events) {
      if (event.type === "text") answer += event.text;
      else failed = true;
    }
    if (failed) console.log(`  ${mark(false)} stream ended in an error`);

    const wasUnanswered = logged.length > before;
    const codeChecks: { check: string; pass: boolean }[] = [];
    if (testCase.expectUnanswered !== undefined) {
      codeChecks.push({
        check: testCase.expectUnanswered ? "marked as unanswered" : "not marked as unanswered",
        pass: wasUnanswered === testCase.expectUnanswered,
      });
    }
    for (const forbidden of testCase.mustNotContain ?? []) {
      codeChecks.push({ check: `does not contain "${forbidden}"`, pass: !answer.includes(forbidden) });
    }

    const graded = await grade(testCase.question, answer, testCase.checklist);
    for (const check of codeChecks) console.log(`  ${mark(check.pass)} ${check.check}`);
    for (const check of graded) {
      console.log(`  ${mark(check.pass)} ${check.check}${check.pass ? "" : `  — ${check.reason}`}`);
    }
    results.push({ id: testCase.id, answer, wasUnanswered, codeChecks, graded });
  }

  const cost = Object.values(spend).reduce((a, b) => a + b, 0);
  console.log(`\n${passed}/${total} checks passed`);
  console.log(
    `Cost: $${cost.toFixed(3)} (${Object.entries(spend)
      .map(([model, dollars]) => `${model} $${dollars.toFixed(3)}`)
      .join(", ")})`
  );

  mkdirSync("eval/results", { recursive: true });
  const file = `eval/results/${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  writeFileSync(file, JSON.stringify({ model: MODEL, effort: EFFORT, passed, total, cost, results }, null, 2));
  console.log(`Full results: ${file}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
