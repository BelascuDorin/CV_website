import { describe, expect, it, vi } from "vitest";
import { MAX_ASK_TURNS, MAX_JOB_DESCRIPTION_CHARS, MAX_QUESTION_CHARS } from "./config";
import {
  createAssistantService,
  type AskEvent,
  type AssistantModel,
  type AssistantStore,
  type ConversationTurn,
  type LogEntry,
} from "./service";

const KNOWN = new Set(["auto-trial-subscriptions", "reinvent"]);
const JOB_DESCRIPTION = "Senior React engineer. Must know Kotlin.";

const MATCH = {
  requirements: [
    {
      requirement: "React",
      status: "strong",
      evidence: "Trial flow in React.",
      projectSlugs: ["auto-trial-subscriptions"],
    },
    { requirement: "Kotlin", status: "gap", evidence: "No Kotlin.", projectSlugs: [] },
  ],
  summary: "Strong on React; no Kotlin.",
};

function fakeModel(overrides: Partial<AssistantModel> = {}): AssistantModel {
  return {
    jobMatch: vi.fn(async () => MATCH),
    ask: vi.fn(async function* () {
      yield "Yes — see [[reinvent]].";
    }),
    ...overrides,
  };
}

function fakeStore(overrides: Partial<AssistantStore> = {}) {
  const logged: LogEntry[] = [];
  const store: AssistantStore = {
    checkRateLimit: vi.fn(async () => ({ allowed: true as const })),
    log: vi.fn(async (entry: LogEntry) => {
      logged.push(entry);
    }),
    ...overrides,
  };
  return { store, logged };
}

function service(
  options: {
    enabled?: boolean;
    model?: AssistantModel;
    store?: AssistantStore;
  } = {}
) {
  return createAssistantService({
    enabled: options.enabled ?? true,
    system: "SYSTEM",
    knownSlugs: KNOWN,
    model: options.model ?? fakeModel(),
    store: options.store ?? fakeStore().store,
  });
}

async function collect(events: AsyncIterable<AskEvent>): Promise<AskEvent[]> {
  const all: AskEvent[] = [];
  for await (const event of events) all.push(event);
  return all;
}

function question(content: string): ConversationTurn[] {
  return [{ role: "user", content }];
}

describe("jobMatch", () => {
  it("returns the validated match", async () => {
    const result = await service().jobMatch(JOB_DESCRIPTION, "client");
    expect(result).toEqual({ ok: true, match: MATCH });
  });

  it("does nothing when disabled", async () => {
    const model = fakeModel();
    const { store } = fakeStore();
    const result = await service({ enabled: false, model, store }).jobMatch(
      JOB_DESCRIPTION,
      "client"
    );
    expect(result).toEqual({ ok: false, reason: "disabled" });
    expect(store.checkRateLimit).not.toHaveBeenCalled();
    expect(model.jobMatch).not.toHaveBeenCalled();
  });

  it("rejects an over-length job description before the rate limit or the model", async () => {
    const model = fakeModel();
    const { store } = fakeStore();
    const result = await service({ model, store }).jobMatch(
      "x".repeat(MAX_JOB_DESCRIPTION_CHARS + 1),
      "client"
    );
    expect(result).toMatchObject({ ok: false, reason: "invalid-input" });
    expect(store.checkRateLimit).not.toHaveBeenCalled();
    expect(model.jobMatch).not.toHaveBeenCalled();
  });

  it("rejects an empty job description", async () => {
    const result = await service().jobMatch("   ", "client");
    expect(result).toMatchObject({ ok: false, reason: "invalid-input" });
  });

  it("refuses a rate-limited client before calling the model", async () => {
    const model = fakeModel();
    const { store } = fakeStore({
      checkRateLimit: vi.fn(async () => ({ allowed: false as const, retryAfterSeconds: 120 })),
    });
    const result = await service({ model, store }).jobMatch(JOB_DESCRIPTION, "client");
    expect(result).toEqual({ ok: false, reason: "rate-limited", retryAfterSeconds: 120 });
    expect(model.jobMatch).not.toHaveBeenCalled();
  });

  it("fails closed when the rate limiter is unreachable", async () => {
    const model = fakeModel();
    const { store } = fakeStore({
      checkRateLimit: vi.fn(async () => {
        throw new Error("redis down");
      }),
    });
    const result = await service({ model, store }).jobMatch(JOB_DESCRIPTION, "client");
    expect(result).toEqual({ ok: false, reason: "unavailable" });
    expect(model.jobMatch).not.toHaveBeenCalled();
  });

  it("logs Gap labels and never the job description", async () => {
    const { store, logged } = fakeStore();
    await service({ store }).jobMatch(JOB_DESCRIPTION, "client");
    expect(logged).toEqual([{ mode: "job-match", gaps: ["Kotlin"] }]);
    expect(JSON.stringify(logged)).not.toContain(JOB_DESCRIPTION);
  });

  it("logs nothing when there are no Gaps", async () => {
    const { store, logged } = fakeStore();
    const model = fakeModel({
      jobMatch: vi.fn(async () => ({ ...MATCH, requirements: [MATCH.requirements[0]] })),
    });
    await service({ model, store }).jobMatch(JOB_DESCRIPTION, "client");
    expect(logged).toEqual([]);
  });

  it("returns unavailable when the model fails, with no retry", async () => {
    const model = fakeModel({
      jobMatch: vi.fn(async () => {
        throw new Error("overloaded");
      }),
    });
    const result = await service({ model }).jobMatch(JOB_DESCRIPTION, "client");
    expect(result).toEqual({ ok: false, reason: "unavailable" });
    expect(model.jobMatch).toHaveBeenCalledTimes(1);
  });

  it("returns unavailable when the model's output is not a Job Match", async () => {
    const model = fakeModel({ jobMatch: vi.fn(async () => ({ nonsense: true })) });
    const result = await service({ model }).jobMatch(JOB_DESCRIPTION, "client");
    expect(result).toEqual({ ok: false, reason: "unavailable" });
  });

  it("still answers when logging fails", async () => {
    const { store } = fakeStore({
      log: vi.fn(async () => {
        throw new Error("redis down");
      }),
    });
    const result = await service({ store }).jobMatch(JOB_DESCRIPTION, "client");
    expect(result.ok).toBe(true);
  });
});

describe("ask", () => {
  it("streams the answer with valid citations", async () => {
    const result = await service().ask(question("Has he used Java?"), "client");
    if (!result.ok) throw new Error("expected ok");
    expect(await collect(result.events)).toEqual([
      { type: "text", text: "Yes — see [[reinvent]]." },
    ]);
  });

  it("strips invented citations from the stream", async () => {
    const model = fakeModel({
      ask: async function* () {
        yield "See [[kotlin-";
        yield "rewrite]] and [[reinvent]].";
      },
    });
    const result = await service({ model }).ask(question("Kotlin?"), "client");
    if (!result.ok) throw new Error("expected ok");
    const text = (await collect(result.events))
      .map((e) => (e.type === "text" ? e.text : ""))
      .join("");
    expect(text).toBe("See  and [[reinvent]].");
  });

  it("logs a question the model could not answer from the data", async () => {
    const { store, logged } = fakeStore();
    const model = fakeModel({
      ask: async function* () {
        yield "There is no evidence of Kafka. [[?]]";
      },
    });
    const result = await service({ model, store }).ask(question("Kafka?"), "client");
    if (!result.ok) throw new Error("expected ok");
    await collect(result.events);
    expect(logged).toEqual([{ mode: "ask", question: "Kafka?" }]);
  });

  it("does not log an answered question", async () => {
    const { store, logged } = fakeStore();
    const result = await service({ store }).ask(question("Java?"), "client");
    if (!result.ok) throw new Error("expected ok");
    await collect(result.events);
    expect(logged).toEqual([]);
  });

  it("ends the stream with an error event when the model fails", async () => {
    const model = fakeModel({
      ask: async function* () {
        yield "Partial ";
        throw new Error("overloaded");
      },
    });
    const result = await service({ model }).ask(question("Java?"), "client");
    if (!result.ok) throw new Error("expected ok");
    expect(await collect(result.events)).toEqual([
      { type: "text", text: "Partial " },
      { type: "error" },
    ]);
  });

  it("rejects an over-length question before the rate limit", async () => {
    const { store } = fakeStore();
    const result = await service({ store }).ask(
      question("x".repeat(MAX_QUESTION_CHARS + 1)),
      "client"
    );
    expect(result).toMatchObject({ ok: false, reason: "invalid-input" });
    expect(store.checkRateLimit).not.toHaveBeenCalled();
  });

  it(`rejects a conversation past ${MAX_ASK_TURNS} questions`, async () => {
    const conversation: ConversationTurn[] = [];
    for (let i = 0; i <= MAX_ASK_TURNS; i++) {
      if (i > 0) conversation.push({ role: "assistant", content: "Answer." });
      conversation.push({ role: "user", content: `Question ${i}` });
    }
    const result = await service().ask(conversation, "client");
    expect(result).toMatchObject({ ok: false, reason: "invalid-input" });
  });

  it.each([
    ["empty", []],
    ["ending on an assistant turn", [{ role: "user", content: "Hi" }, { role: "assistant", content: "Hello" }]],
    ["starting with an assistant turn", [{ role: "assistant", content: "Hi" }, { role: "user", content: "Q" }]],
    ["with an oversized assistant turn", [
      { role: "user", content: "Q" },
      { role: "assistant", content: "x".repeat(10_000) },
      { role: "user", content: "Q2" },
    ]],
  ])("rejects a conversation %s", async (_label, conversation) => {
    const result = await service().ask(conversation as ConversationTurn[], "client");
    expect(result).toMatchObject({ ok: false, reason: "invalid-input" });
  });

  it("does nothing when disabled", async () => {
    const model = fakeModel();
    const result = await service({ enabled: false, model }).ask(question("Java?"), "client");
    expect(result).toEqual({ ok: false, reason: "disabled" });
    expect(model.ask).not.toHaveBeenCalled();
  });
});
