import * as data from "@/data";
import { isAssistantEnabled } from "./config";
import { buildAssistantContext, knownProjectSlugs } from "./context";
import { createClaudeModel } from "./model";
import { createAssistantService, type AssistantService } from "./service";
import { createUpstashStore } from "./store";

let service: AssistantService | undefined;

/** The production wiring, built once per server instance. */
export function getAssistantService(): AssistantService {
  service ??= createAssistantService({
    enabled: isAssistantEnabled(),
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
    model: createClaudeModel(),
    store: createUpstashStore(),
    onError: (error) => console.error("[assistant]", error),
  });
  return service;
}
