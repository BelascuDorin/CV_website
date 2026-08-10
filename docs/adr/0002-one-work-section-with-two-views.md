# 0002. One Work Section with two views, not an Experience section and a Skills section

## Status
Accepted

## Context
The page had an Experience section (chronological, company-led) and a Skills section (technology-led, accordion of proofs). With Projects as the single data spine (see 0001), both are projections of one list — keeping them apart would remove the duplication from the data layer and reinstate it in the view layer, where the reader now meets the same project twice and has to work out that it is the same project.

The brief asked for a Projects overview as well, which would have been a third section over the same data.

Against merging: recruiters scan for a heading that says "Experience", spend well under a minute, and are not going to operate a control to find out where someone worked. A section whose first impression is a filter UI risks failing exactly the visitor the site exists for.

## Decision
One Work Section, containing a Filter Bar and one list with two states.

Unfiltered, it renders the Timeline View: Engagements in reverse-chronological order, each with its Projects nested beneath. This is what loads, it needs no interaction, and it reads as a conventional CV experience section.

Filtered, Engagement grouping drops away and matching Projects render as a flat list, each surfacing the problem the filtered Technology solved on it. This is the state that answers "what is Dorin's React experience".

The former Skills section is absorbed into the Filter Bar: technology chips grouped by category, each showing how many Projects used it. That doubles as the at-a-glance technology overview, so no separate section is needed to list what Dorin knows.

## Consequences
A visitor who never clicks anything still gets a normal CV. A visitor with a specific question gets a direct answer without leaving the section, and the answer is evidence rather than a self-assessment — every technology chip is backed by the count of projects behind it.

The Work Section becomes the most complex component on an otherwise static site, and it needs client-side state, so it is the one place a rendering bug can hide the entire work history. Nesting Projects under Engagements makes the Timeline View taller than the old bullet list, so the density has to be managed — collapsed projects by default, expanding to their Technology Usages. Honest per-project dates are now required, where a single date range per company used to be enough.

Revisit if analytics ever show visitors leaving from the Work Section without interacting, which would mean the timeline is not carrying its half of the job.

## Alternatives considered
**Keep Experience and Skills as separate sections, both derived** — rejected: the same project is then presented twice to the reader, and the Skills section's job (evidence for a technology) is done better by filtering the real project list than by a parallel accordion.

**A generic filter builder** — field/operator/value rows, arbitrary combinations, as the brief's "complex generic filtering area" suggested. Rejected: nobody assembles a query on a CV site. With roughly fifteen projects and twenty technologies, the useful questions are few and can be enumerated. Presets deliver the same "see the data in useful ways" outcome with nothing to learn, and technology chips cover the open-ended case. The genuine cost of a builder is that it makes the site look like a tool to be operated rather than a case to be read.

**Separate route per project** — rejected for now: it breaks the single-scrolling-page premise the site is built on, and with descriptions this short there is not enough content to justify a page. Inline expansion carries it.
