# 0004. The Assistant is grounded in authored data

## Status
Accepted

## Context
The Assistant answers recruiters' questions about Dorin and matches job descriptions against his experience. It speaks on his behalf to people deciding whether to hire him, so a single invented claim — a technology he never used, a project that does not exist — costs more than any number of honest "I don't know"s. It is also a public endpoint that spends real money on every request.

The whole of Dorin's authored data — Engagements, Projects, Technologies, Project Notes, and Candidate Notes — is on the order of ten thousand tokens: small enough to send in full on every request.

## Decision
**Full context, no retrieval.** Every request carries all of the authored data in a byte-stable system prompt, cached across requests. There is no search step that could miss the one Project that answers the question, and nothing to keep in sync.

**Only authored data.** The Assistant knows nothing about Dorin beyond the data and the two notes sources. Unknowns are stated as unknown and pointed to his email; it never infers, pads, or generalises from adjacent experience without saying so.

**Everything in context is public.** Instructions such as "do not reveal X" are not a security boundary — a determined visitor can extract the context. So nothing goes into Project Notes or Candidate Notes that Dorin would not publish, and sensitive topics get a deliberately authored answer rather than a secret the model is asked to keep.

**Citations are validated in code.** The model cites Projects by slug; before anything renders, citations to slugs that do not exist are dropped, and a Strong Match Status left with no valid citation is demoted. The no-evidence rule is enforced after the model, not only requested of it.

**Minimal logging.** Only questions the Assistant could not answer and the labels of Gap requirements are logged, with a timestamp and the mode, expiring after 90 days. Never full job descriptions, never answers, never IP addresses — rate limiting keys on a hashed IP with a 24-hour expiry.

**No silent model downgrade.** If the configured model is unavailable, the visitor sees a fallback that points back to the page and to Dorin's email. A worse answer would represent Dorin worse than no answer. (Automatic retry after a safety-classifier false positive is a different thing and is allowed.)

## Consequences
Answers can only be as good as the authored data, which is the intended pressure: the log of unanswered questions and Gaps becomes the to-do list for Project Notes and Candidate Notes.

Because the context is sent whole, its size is a cost lever. If the data ever grows past the point where full context is cheap — roughly an order of magnitude — revisit retrieval; short of that, it is not worth the moving parts.

Any byte that changes per request inside the context (a timestamp, an unstable ordering) silently disables prompt caching and multiplies cost. The context builder is deterministic and tested for it.

The Assistant's correctness is checked by a manual eval of synthetic job descriptions and questions with expected answers, run before launch and after any change of model, effort, or prompt — not by unit tests, which cannot judge an answer.

## Alternatives considered
**Retrieval over the data (embeddings or keyword search)** — the usual pattern for "chat with documents". Rejected: the data fits in context many times over, and retrieval adds a way to be wrong (missing the relevant Project) while saving nothing.

**A free-form knowledge file instead of fields on Project** — easier to write. Rejected for work facts: it would drift from the Projects and break the single data spine of ADR 0001. Only facts about Dorin as a candidate, which have no Project to live on, go in a free-form file.

**Hiding sensitive facts behind instructions** — rejected as described above; prompt instructions are not access control.
