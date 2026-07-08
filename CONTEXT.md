# CV Website

A personal portfolio and career-tracking site for Belascu Dorin — a single scrolling page designed for recruiters, built with Next.js and deployed on Vercel.

**Page order**: Hero → Now Section → Experience → Skills → Contact

## Language

**Hero**:
The opening section of the page. Displays Dorin's name, headshot, role descriptor ("Senior Product Engineer"), and positioning line ("9+ years of experience in platform scaling and early-stage startups"), followed by a 2–3 sentence About bio (personal narrative: background, what drives Dorin, what he's looking for). Its sole job is to orient a recruiter in under 3 seconds and make them want to scroll. Contains no interactive elements beyond the Contact links.
_Avoid_: Banner, header, intro, above-the-fold

**About**:
A 2–3 sentence personal narrative embedded inside the Hero section, directly below the role descriptor. Core message: full-stack engineer with a product mindset — cares about the outcome, not just the output. Not a standalone page section.
_Placeholder_: "Full-stack engineer with 9+ years building products at scale and in early-stage startups. I care about outcomes, not just output — from architecture decisions to the last pixel. Currently open to senior engineering roles where product thinking is as valued as technical depth."
_Avoid_: Bio section, summary section, personal statement

**Navigation**:
A sticky top navigation bar with anchor links to each page section (Hero, Now, Experience, Skills, Contact). Remains visible as the user scrolls. Helps recruiters jump directly to the section most relevant to them.
_Avoid_: Header nav, menu, sidebar nav

**Now Section**:
The section of the site showing what Dorin is actively doing at this moment. Updated manually. Contains three sub-areas: active employment (currently: Grubhub contract), active side projects (currently: nutrichefdelivery.ro — placeholder for further details), and self-development (currently learning — placeholder for books, courses, or technologies being deliberately acquired).
_Avoid_: In progress, current work, active projects

**Experience**:
The chronological record of past and present professional roles. Sourced from the CV/LinkedIn. Displayed as a vertical timeline — each entry shows company, title, dates, and 2–3 impact bullet points. Distinct from the Now Section in that it covers the full history, not just active roles.
_Avoid_: Work history, career, background

**Skill**:
A specific technology or practice Dorin is proficient in (e.g. React.js, Datadog, TypeScript). Grouped into categories: Languages, Frameworks & Libraries, Tools & Platforms, Practices.
_Avoid_: Competency, expertise, tool

**Skill Proof**:
A structured evidence entry attached to a Skill — a one-line claim, a measurable outcome, and a URL to the project or company where it was applied. Each Skill may have one or more Skill Proofs.
_Avoid_: Example, case study, project proof, evidence

**Proof Card**:
The UI element that displays a Skill Proof. Revealed by clicking/expanding a Skill in the Skills section (accordion interaction — the Proof Cards expand inline beneath the Skill). Contains: the Skill name, the claim, the outcome, and the URL.
_Avoid_: Modal, popup, detail view, carousel slide

**Contact**:
The set of links and actions available to reach Dorin: email (dorin.belascu@gmail.com), LinkedIn, GitHub, and a downloadable PDF CV.
_Avoid_: Footer links, social links
