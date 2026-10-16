import * as data from "@/data";
import { isAssistantEnabled } from "./config";
import { assistantSourcesFrom, buildAssistantContext, knownProjectSlugs } from "./context";
import { createClaudeModel } from "./model";
import { createAssistantService, type AssistantService } from "./service";
import { createUpstashStore } from "./store";

let service: AssistantService | undefined;

/** The production wiring, built once per server instance. */
export function getAssistantService(): AssistantService {
  service ??= createAssistantService({
    enabled: isAssistantEnabled(),
    system: buildAssistantContext(assistantSourcesFrom(data)),
    knownSlugs: knownProjectSlugs(data.engagements),
    model: createClaudeModel(),
    store: createUpstashStore(),
    onError: (error) => console.error("[assistant]", error),
  });
  return service;
}
