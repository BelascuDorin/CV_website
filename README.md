# CV_website
Structures my experience and ongoing work

## How this was developed

Built with AI agents as the primary driver for architecture and decision-making. No code has been written yet — the project is intentionally spec-first.

### Step 1 — Domain modelling (`/grill-with-docs`)

A structured interview skill that stress-tests plans against a domain model before writing a line of code. All key decisions were resolved through a grilling session and captured in `CONTEXT.md` as a shared domain glossary.

Decisions locked in:
- **Stack**: Next.js (App Router) + Tailwind CSS, deployed on Vercel
- **Page order**: Hero → Now Section → Experience → Skills → Contact
- **Hero**: name, headshot, "Senior Product Engineer", "9+ years of experience in platform scaling and early-stage startups", plus a short About bio
- **Navigation**: sticky top nav with scroll-spy active-section highlighting
- **Skills**: accordion expand/collapse revealing Proof Cards inline
- **Experience**: vertical timeline with 2–3 impact bullets per role
- **Side projects**: Now Section only (no separate section)
- **Data layer**: typed static TypeScript files — no CMS, no backend

### Step 2 — PRD (`/to-prd`)

The grilling session output was synthesised into a full Product Requirements Document — 25 user stories, 8 modules, implementation decisions, and an explicit out-of-scope list. Published as [GitHub Issue #1](https://github.com/BelascuDorin/CV_website/issues/1) with the `ready-for-agent` label.

### Agent skills installed

Full build chain available in `.agents/skills/`:

| Skill | Purpose |
|---|---|
| `grill-with-docs` | Stress-test a plan and build the domain model |
| `grilling` | Relentless one-question-at-a-time interview |
| `domain-modeling` | Maintain `CONTEXT.md` and ADRs inline |
| `setup-matt-pocock-skills` | Configure issue tracker, triage labels, domain docs |
| `to-prd` | Synthesise context into a PRD and publish to GitHub Issues |
| `to-issues` | Break a PRD into vertical-slice GitHub issues |
| `implement` | Implement issues using TDD at agreed seams |
| `code-review` | Two-axis review: Standards + Spec, run as parallel sub-agents |

### Next step

Run `/to-issues` to break [Issue #1](https://github.com/BelascuDorin/CV_website/issues/1) into independently-grabbable implementation tickets.
