/**
 * Brings a cited Project Card into view and highlights it, so an Assistant
 * answer always leads back to the evidence on the page.
 *
 * If an active Work Section filter hides the card, the filter is cleared first —
 * a citation must never point at nothing.
 */

export const CLEAR_WORK_FILTER_EVENT = "assistant:clear-work-filter";

const HIGHLIGHT = ["ring-2", "ring-slate-500", "ring-offset-4"];
const HIGHLIGHT_MS = 2500;

export function projectCardId(slug: string): string {
  return `project-${slug}`;
}

function highlight(card: HTMLElement) {
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.classList.add(...HIGHLIGHT);
  window.setTimeout(() => card.classList.remove(...HIGHLIGHT), HIGHLIGHT_MS);
}

export function showProject(slug: string) {
  const find = () => document.getElementById(projectCardId(slug));

  const card = find();
  if (card) {
    highlight(card);
    return;
  }

  window.dispatchEvent(new Event(CLEAR_WORK_FILTER_EVENT));
  // Two frames: one for React to commit the unfiltered view, one for layout.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const shown = find();
      if (shown) highlight(shown);
    })
  );
}
