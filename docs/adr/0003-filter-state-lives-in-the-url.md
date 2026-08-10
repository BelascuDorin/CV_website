# 0003. Filter state lives in the URL

## Status
Accepted

## Context
The strongest use of the filter is not a visitor exploring — it is Dorin sending a link. A React role gets `/?tech=react`, a backend role gets `/?tech=java,spring-boot,postgresql`, and the recipient lands on a page already answering their question instead of a general CV they have to search.

That only works if filter state is addressable. Held in component state, it is invisible from outside the page: no link can express it, the back button does not undo it, and a reload silently discards it.

## Decision
Selected Technologies are encoded in the query string (`?tech=react,java&kind=solo`) and read from it, and the URL is the single source of truth for filter state. Clearing all filters returns to the bare path so the canonical URL stays clean for indexing. Which Project Cards are expanded is deliberately *not* in the URL — it is transient and would make shared links noisy.

The query string is read after mount from `window.location`, **not** through `useSearchParams`. Next's `useSearchParams` opts its entire subtree out of prerendering, which was measured to remove the whole Work Section — the site's main content, and the `#work` anchor the Navigation's scroll-spy observes — from the static HTML. Filter changes are written with `history.replaceState`.

## Consequences
Every filter state is linkable and survives a reload. Dorin can prepare a targeted link per application, which is the practical payoff of the whole restructure. Reading the URL after mount keeps the unfiltered timeline server-rendered, so the section is indexable and present for a visitor before any JavaScript runs.

The cost is a one-frame flash: a shared filtered link paints the full timeline before the effect applies the filter. `replaceState` rather than `pushState` means the back button does *not* step back through filter changes — it leaves the page. That is deliberate; toggling six chips should not put six entries between the visitor and where they came from, but it does mean an accidental filter cannot be undone with Back, only with Clear.

Query parameter names are a public contract. Renaming `tech` or a technology id breaks links already sent to people, so registry ids are effectively permanent once shared — add a new id rather than rename one. Unknown ids are ignored rather than treated as an error, so a link that outlives a renamed technology degrades to the unfiltered page instead of a broken one.

Revisit only if the filter is dropped entirely; short of that, there is no cheaper way to make a filter state shareable.

## Alternatives considered
**Local component state** — simplest, keeps the whole page a server component with one small island. Rejected: it eliminates the one feature that makes filtering worth building, since nothing outside the page can point at a filtered state.

**Hash fragment (`#tech=react`)** — avoids server involvement entirely. Rejected: hashes already carry section anchors for the Navigation, and overloading them would make the two features fight over the same slot.

**A route per technology (`/tech/react`)** — statically generated, ideal for indexing. Rejected: it cannot express multi-technology selections without a combinatorial explosion of routes, and it breaks the single-page premise.
