import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { EFFORT, MODEL } from "./config";
import type { AssistantModel, ConversationTurn } from "./service";
import { JobMatchOutputSchema } from "./validate";

/**
 * The Claude call. Uses the beta Messages endpoint only for server-side refusal
 * fallbacks: a safety-classifier false positive on an unusual job description
 * is retried by the API instead of failing. That is not an outage fallback —
 * if the model is down, the visitor gets the fallback message, never a weaker
 * model (docs/adr/0004-assistant-grounded-in-authored-data.md).
 */

const FALLBACK_BETA = "server-side-fallback-2026-07-01";

/** Comfortably above a 10-requirement Job Match plus thinking at low effort. */
const JOB_MATCH_MAX_TOKENS = 8_000;
const ASK_MAX_TOKENS = 4_000;

class RefusalError extends Error {
  constructor() {
    super("The model declined the request");
  }
}

export interface ClaudeModelOptions {
  client?: Anthropic;
  /** Called with each response's token usage — the eval uses it to report cost. */
  onUsage?: (usage: Anthropic.Beta.BetaUsage) => void;
}

export function createClaudeModel(options: ClaudeModelOptions = {}): AssistantModel {
  const client = options.client ?? new Anthropic();
  const onUsage = options.onUsage ?? (() => {});

  /**
   * The system prompt is identical on every request, so it is cached: after the
   * first request, the CV costs a tenth of its uncached price.
   */
  function systemBlocks(system: string) {
    return [
      {
        type: "text" as const,
        text: system,
        cache_control: { type: "ephemeral" as const },
      },
    ];
  }

  async function jobMatch(system: string, jobDescription: string): Promise<unknown> {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: JOB_MATCH_MAX_TOKENS,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      system: systemBlocks(system),
      output_config: {
        effort: EFFORT,
        format: betaZodOutputFormat(JobMatchOutputSchema),
      },
      messages: [
        {
          role: "user",
          content: `Job Match mode. Analyse this job description against Dorin's CV.\n\n<job_description>\n${jobDescription}\n</job_description>`,
        },
      ],
    });

    const message = await stream.finalMessage();
    onUsage(message.usage);
    if (message.stop_reason === "refusal") throw new RefusalError();

    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
    // Unvalidated on purpose: the answer validator owns what counts as valid.
    return JSON.parse(text);
  }

  async function* ask(
    system: string,
    conversation: ConversationTurn[]
  ): AsyncIterable<string> {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: ASK_MAX_TOKENS,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      system: systemBlocks(system),
      output_config: { effort: EFFORT },
      messages: conversation.map((turn, i) =>
        i === 0 && turn.role === "user"
          ? { role: "user" as const, content: `Ask mode.\n\n${turn.content}` }
          : { role: turn.role, content: turn.content }
      ),
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }

    const message = await stream.finalMessage();
    onUsage(message.usage);
    if (message.stop_reason === "refusal") throw new RefusalError();
  }

  return { jobMatch, ask };
}
