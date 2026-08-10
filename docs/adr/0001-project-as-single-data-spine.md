# 0001. Project as the single data spine

## Status
Accepted

## Context
The data layer authored the same facts up to three times. The Grubhub auto-trial work appeared as a bullet in `data/experience.ts` and again inside the TypeScript, React.js, Redux, and Datadog entries of `data/skills.ts`. urb.io appeared in `experience.ts` and under both Mapbox and Team Leadership. reinvent appeared in five separate Skill Proofs. The side projects in `data/now.ts` restated what `experience.ts` already said.

Every restatement was hand-written prose, so the copies drifted: the same project had a different outcome number depending on which section you read it in. Adding the requested Projects overview and technology filtering would have made this a fourth and fifth copy, and filtering in particular cannot work on prose that is written once per section.

## Decision
`Engagement → Project → Technology Usage` is the only place work is authored. An Engagement holds employment facts (company, title, dates) and no description. A Project holds one piece of work — description, dates, outcomes — and references Technologies by id from a registry, optionally attaching one sentence per Technology about the problem it solved.

Every view is a projection of that list. The Timeline View groups Projects by Engagement. The Filtered View selects Projects by Technology. The Filter Bar's per-technology counts are computed. The Now Section's side projects are the Engagements ending in "Present". `data/skills.ts` is deleted; nothing is authored per section.

## Consequences
A fact is corrected in one place and every view follows. Technology filtering becomes a query over structured data rather than a text search over prose. A new Project is one record, and it appears everywhere it belongs without further editing.

Per-section copy control is gone: the same sentence must serve the timeline and the filtered list, so it has to be written to work in both. Section components can no longer be read in isolation — understanding what the Skills area shows means understanding a `groupBy` over Projects. A one-line data change can shift several parts of the page at once, which makes visual review slightly harder than editing a literal list.

Revisit if the site ever needs genuinely audience-specific copy for the same project — a recruiter-facing line and an engineer-facing line — because that is a real requirement this structure refuses to express.

## Alternatives considered
**Three linked lists** — keep `experience.ts` and `skills.ts` as authored, add `projects.ts`, cross-link by id. Rejected: it preserves the duplication that caused the drift, and cross-links have to be maintained by hand with nothing to catch a stale one.

**Technology as the spine** — keep `Skill → Proof` and enrich the proof with project name, problem, and dates. Rejected: producing the Projects overview then means reassembling each project from proofs scattered across several Skills, and one project's identity would live in as many places as it has technologies.

**One Project per company** — Grubhub as a single Project with a tech list. Rejected: it makes Technology Usage meaningless. "Datadog provided observability at Grubhub" carries no information, where "Datadog made a breaking SDK migration safe to roll out incrementally" is the whole point of the field.
