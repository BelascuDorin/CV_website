# CV_website
Structures my experience and ongoing work — a single scrolling page built spec-first with AI agents.

**Live:** deployed on Vercel (connect repo to see URL) · **Stack:** Next.js 16 (App Router) + Tailwind CSS + TypeScript

---

## Current state

Page order: **Hero → Now → Work → Education → Contact**.

### The data model

Everything on the page is a projection of one list. `Engagement → Project → Technology Usage` is the only place work is authored; the timeline, the filter, the technology counts, and the Now Section's side projects are all derived from it. See [`CONTEXT.md`](CONTEXT.md) for the vocabulary and [`docs/adr/`](docs/adr/) for why.

| Concept | Meaning | Source file |
|---|---|---|
| **Engagement** | Where Dorin worked — company, title, dates. Describes no work itself. | `data/engagements.ts` |
| **Project** | One distinct piece of work under an Engagement. | `data/engagements.ts` |
| **Technology** | A technology or practice, authored once with an id and category. | `data/technologies.ts` |
| **Technology Usage** | A Project's use of a Technology, plus the problem it solved there. | `data/engagements.ts` |
| **Preset** | A named one-click filter state. | `data/presets.ts` |
| Derived views | Filtering, counts, active-engagement lookups — all pure functions. | `data/selectors.ts` |

### What's built

| Section | Source file |
|---|---|
| Sticky Navigation + scroll-spy | `components/Navigation.tsx` |
| Hero (photo, name, role, bio) | `components/sections/Hero.tsx` |
| Now Section — employment and side projects **derived** from active Engagements | `components/sections/NowSection.tsx` |
| Work Section — Filter Bar + Timeline View / Filtered View | `components/sections/WorkSection.tsx`, `components/work/` |
| Education | `components/sections/EducationSection.tsx` |
| Contact (email, LinkedIn, GitHub, PDF download) | `components/sections/ContactSection.tsx` |
| SEO metadata + OpenGraph | `app/layout.tsx` |

### Filtering

The Work Section reads its filter from the query string, so any filtered view is a shareable link:

- `/?tech=react` — every project that used React, and what it solved on each
- `/?tech=java,spring-boot,postgresql` — matches a project using **any** of them
- `/?tech=react&kind=solo` — requires **both** facets

Technology ids in `data/technologies.ts` are a public contract once a link has been sent. Add a new id rather than renaming an existing one; unknown ids are ignored so old links still render.

### Commands

```bash
yarn dev         # dev server
yarn test        # vitest — selector logic + data integrity
yarn typecheck   # tsc --noEmit
yarn lint        # eslint
yarn build       # production build
```

`data/integrity.test.ts` is the guard on the registry-by-id design: a technology id that does not resolve is skipped at render time rather than erroring, so the test suite is what catches a typo, an unreferenced technology, or a preset that matches nothing.

### Open items

1. **Per-project dates** — `Project.startDate` / `endDate` are supported but unset; the Work Section falls back to the engagement's range. Fill them in where the real dates are known.
2. **`data/engagements.ts`** — the `efera.ro` start date is a flagged placeholder (`TODO(dorin)`).
3. **Marelli / Hanna projects** — decomposed into one project each from the old CV bullets; confirm the project names match reality.
4. **Presets** — `data/presets.ts` currently guesses at the roles being targeted; align with actual applications.
5. **Mobile nav** — still overflows on small screens; needs a collapsed treatment.

---

## How this was developed

Built with AI agents as the primary driver for architecture and decision-making. Every decision was spec-first — no code was written before the domain model and PRD were complete.

### Step 1 — Domain modelling (`/grill-with-docs`)

A structured interview skill stress-tests plans against a domain model before writing a line of code. All key decisions were resolved through a grilling session and captured in `CONTEXT.md`.

Decisions locked in: Next.js + Tailwind, single scrolling page, Hero → Now → Experience → Skills → Contact, sticky scroll-spy nav, accordion Proof Cards, vertical timeline Experience, light mode only, typed static data layer.

### Step 2 — PRD (`/to-prd`)

The grilling output was synthesised into a full PRD — 25 user stories, 8 modules, explicit out-of-scope list. Published as [Issue #1](https://github.com/BelascuDorin/CV_website/issues/1) with the `ready-for-agent` label.

### Step 3 — Vertical slices (`/to-issues`)

The PRD was broken into 8 independently-grabbable issues ([#2](https://github.com/BelascuDorin/CV_website/issues/2)–[#9](https://github.com/BelascuDorin/CV_website/issues/9)) using tracer-bullet vertical slices.

### Step 4 — Implementation (`/implement`)

All 8 issues implemented sequentially then all sections in parallel. Each commit closes its issue.

### Step 5 — Code review (`/code-review`)

Two-axis review (Standards + Spec) run against the full diff.

> The steps above describe the original build. Its page order (Hero → Now → Experience → Skills → Contact) and its `Skill → Skill Proof` model were superseded by the restructure below.

### Round two — restructure around Projects (`/grill-with-docs`, `/implement`)

A second grilling session established that the data layer was authoring the same facts up to three times — the same Grubhub work appeared as an experience bullet and again inside four separate Skill Proofs — and that adding a projects overview plus technology filtering would have made it five copies.

The interview resolved to a single spine and produced three ADRs:

| ADR | Decision |
|---|---|
| [0001](docs/adr/0001-project-as-single-data-spine.md) | `Engagement → Project → Technology Usage` is the only place work is authored; every view is a projection |
| [0002](docs/adr/0002-one-work-section-with-two-views.md) | One Work Section with a Timeline View and a Filtered View, replacing the Experience and Skills sections |
| [0003](docs/adr/0003-filter-state-lives-in-the-url.md) | Filter state lives in the query string, so a filtered view is a shareable link |

`data/experience.ts` and `data/skills.ts` were deleted. Vitest was added for the two seams worth testing: the pure selector logic and the integrity of the authored data.

### Agent skills installed

Full build chain in `.agents/skills/`:

| Skill | Purpose |
|---|---|
| `grill-with-docs` | Stress-test a plan and build the domain model |
| `grilling` | Relentless one-question-at-a-time interview |
| `domain-modeling` | Maintain `CONTEXT.md` and ADRs inline |
| `setup-matt-pocock-skills` | Configure issue tracker, triage labels, domain docs |
| `to-prd` | Synthesise context into a PRD and publish to GitHub Issues |
| `to-issues` | Break a PRD into vertical-slice GitHub issues |
| `implement` | Implement issues with TDD at agreed seams |
| `code-review` | Two-axis review: Standards + Spec, run as parallel sub-agents |
