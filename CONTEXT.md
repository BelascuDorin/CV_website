# CV Website

A personal portfolio and career-tracking site for Belascu Dorin — a single scrolling page designed for recruiters, built with Next.js and deployed on Vercel.

**Page order**: Hero → Now Section → Work Section → Education → Contact

## Language

**Hero**:
The opening section of the page. Displays Dorin's name, headshot, role descriptor ("Senior Product Engineer"), and positioning line ("9+ years of experience in platform scaling and early-stage startups"), followed by a 2–3 sentence About bio (personal narrative: background, what drives Dorin, what he's looking for). Its sole job is to orient a recruiter in under 3 seconds and make them want to scroll. Contains no interactive elements beyond the Contact links.
_Avoid_: Banner, header, intro, above-the-fold

**About**:
A 2–3 sentence personal narrative embedded inside the Hero section, directly below the role descriptor. Core message: full-stack engineer with a product mindset — cares about the outcome, not just the output. Not a standalone page section.
_Placeholder_: "Full-stack engineer with 9+ years building products at scale and in early-stage startups. I care about outcomes, not just output — from architecture decisions to the last pixel. Currently open to senior engineering roles where product thinking is as valued as technical depth."
_Avoid_: Bio section, summary section, personal statement

**Navigation**:
A sticky top navigation bar with anchor links to each page section (Hero, Now, Work, Education, Contact). Remains visible as the user scrolls. Helps recruiters jump directly to the section most relevant to them.
_Avoid_: Header nav, menu, sidebar nav

**Now Section**:
The section of the site showing what Dorin is actively doing at this moment. Contains three sub-areas: active employment, active side projects, and self-development. Employment and side projects are derived — they are the Engagements whose end date is "Present" — so nothing about current work is authored twice. Only self-development (books, courses, technologies being deliberately acquired) is hand-authored here.
_Avoid_: In progress, current work, active projects

**Work Section**:
The single section covering everything Dorin has built and everywhere he has worked. Replaces the former Experience and Skills sections, which showed the same facts twice in different shapes. Has one set of data and two states: Timeline View by default, Filtered View once a filter is applied. Contains the Filter Bar at its top.
_Avoid_: Experience, Skills, portfolio, work history

**Timeline View**:
The default state of the Work Section, with no filter applied. Engagements each showing company, title, dates, and their Projects beneath. Reads like a conventional CV experience section, so a recruiter who never touches a control still gets what they came for. Order is authored, not sorted: active employment, then active self-directed work, then past roles reverse-chronologically. Several engagements run concurrently, and strict reverse chronology would bury the current main role beneath side projects.
_Avoid_: Default view, unfiltered, list view, reverse-chronological

**Filtered View**:
The state of the Work Section once one or more filters are applied. Engagement grouping drops away and matching Projects are shown as a flat list, each surfacing the problem the filtered Technology solved on that Project. This is the state that answers "what is Dorin's React experience".
_Avoid_: Search results, query results, project grid

**Filter Bar**:
The control at the top of the Work Section. Lists every Technology as a toggleable chip grouped by category, each with the number of Projects that used it, plus Presets and the Engagement Kind facet. It also serves as the site's technology overview — the former Skills section is absorbed into it, rather than existing separately. Selecting multiple values within one facet matches Projects using **any** of them; combining the two facets requires **both**.
_Avoid_: Search bar, query builder, facet panel, toolbar

**Preset**:
A named one-click filter state offered in the Filter Bar (e.g. "Frontend at scale", "Zero-to-one products", "Backend & data"). Exists so that a visitor who will not build a filter still sees the data more than one way. A Preset is only a shortcut to a filter state — it holds no content of its own.
_Avoid_: Saved search, view, tab, lens

**Project Card**:
The UI element that displays one Project — name, dates, description, outcomes, and its Technology chips. Expands inline to reveal the per-Technology problem statements. Replaces the Proof Card.
_Avoid_: Proof Card, modal, popup, detail page

**Engagement**:
Where Dorin was employed or self-employed for a period — company, title, start and end date. The chronological unit of the career, and the only place employment facts are authored. An Engagement holds Projects but describes no work itself.
_Avoid_: Job, position, role, experience entry, company

**Engagement Kind**:
What kind of arrangement an Engagement was: Contract, Employment, Cofounder, or Solo. Load-bearing in two places — it splits the Now Section into active employment (Contract, Employment) and side projects (Cofounder, Solo), and it is the Filter Bar's second facet, labelled "Setting" in the UI. Not a seniority level and not a job title.
_Avoid_: Type, category, employment type, context

**Project**:
One distinct piece of work, belonging to exactly one Engagement (e.g. "Auto-trial subscriptions" under Grubhub, "Mapbox heat-network features" under urb.io). Carries its own name, short description, dates, outcomes, and its Technology Usages. The single source of truth for the site — the Timeline View, the Filtered View, the Filter Bar's technology counts, and the Now Section's side projects are all projections of the Engagement/Project list, so no fact about Dorin's work is authored twice. A whole company is not a Project; an Engagement with one deliverable has exactly one Project.
_Avoid_: Feature, initiative, work item, side project, case study

**Technology**:
A technology or practice Dorin has used (e.g. React.js, Datadog, Team Leadership). Authored once in a registry as an id, a display name, and a category — Languages, Frameworks & Libraries, Tools & Platforms, or Practices. Projects reference Technologies by id, so a Technology is never spelled two ways and can never be renamed in one place and not another. A Technology carries no evidence of its own; its evidence is the set of Projects that reference it.
_Avoid_: Skill, competency, expertise, tool, tag

**Technology Usage**:
The link between a Project and one Technology, and the only place the phrase "what problem this solved" is authored — a single sentence, on this Project, in this Technology's terms (e.g. Datadog on the Braze migration: "made a breaking SDK change safe to roll out incrementally"). Optional: a Project lists every Technology it used, but only the ones where the choice was interesting carry a sentence. Not a general description of the Technology and not a description of the Project.
_Avoid_: Skill Proof, claim, proof, evidence, rationale

**Contact**:
The set of links and actions available to reach Dorin: email (dorin.belascu@gmail.com), LinkedIn, GitHub, and a downloadable PDF CV.
_Avoid_: Footer links, social links
