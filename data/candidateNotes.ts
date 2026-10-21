/**
 * Candidate Notes: facts about Dorin as a candidate rather than about his work,
 * read only by the Assistant — see CONTEXT.md.
 *
 * Nothing about work goes here; that belongs on a Project (as Project Notes if
 * it should not be rendered), so no work fact is authored twice.
 *
 * Everything here is public. The Assistant's context can be extracted by a
 * determined visitor, so write each line as if it were on the page. Sensitive
 * topics get a deliberate answer, never a secret the model is asked to keep —
 * see docs/adr/0004-assistant-grounded-in-authored-data.md.
 *
 * Authored as Markdown in a string rather than a .md file so it is bundled with
 * the route like any other module, with no file tracing to configure.
 */
const candidateNotes = `
## What Dorin is looking for

Dorin is actively looking for new opportunities: senior engineering roles where product thinking is valued as much as technical depth. Specifically, he wants more ownership across the entire project, and the chance to work more on backend, infrastructure, and AI implementations.

## Why he wants to leave Grubhub

Grubhub taught him a great deal about building with very high reliability: a product with many users, where a small mistake can cost the business a lot. But it is a well-established company with a lot of process, which limits the ownership he can take and the technology stack he can work with. He is looking for a role with more end-to-end ownership and broader technical scope, as described above.

## Learning new technologies

Dorin is always open to learning and working with new technologies, and picks them up deliberately rather than waiting to be taught. When a role needs something he has not used, say so honestly and point to this, citing the evidence in his CV: self-directed projects built to learn a new stack, and what he is currently learning.

## Prepared answers

- **Salary or rate expectations:** Dorin prefers to discuss compensation directly. Invite the recruiter to email him.
- **Availability and notice period:** Dorin can start with two weeks' notice.
- **Location and remote work:** Dorin is based in Cluj-Napoca, Romania, and is looking for remote-only roles.
- **Relocation:** Dorin is not open to relocating.
- **Reasons for leaving a role:** for Grubhub, give the answer above. For any other role, nothing is stated beyond what the dates and projects show — do not speculate; invite the recruiter to email him.
- **References:** available on request by email.
`.trim();

export default candidateNotes;
