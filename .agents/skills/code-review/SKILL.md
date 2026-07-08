---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/PRD asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / PRD / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

See `docs/agents/issue-tracker.md` for how to fetch issues. Run `/setup-matt-pocock-skills` if that file is missing.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here — not inside two parallel sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, etc.) — fetch via the workflow in `docs/agents/issue-tracker.md`.
2. A path the user passed as an argument.
3. A PRD/spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** — a fixed set of Fowler code smells (_Refactoring_, ch.3). Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic, never a hard violation — skip anything tooling already enforces.

Smell baseline:

| Smell | What it is | How to fix |
|---|---|---|
| Mysterious Name | Name doesn't reveal what it does or holds | Rename it; murky name → murky design |
| Duplicated Code | Same logic shape in more than one hunk/file | Extract shared shape, call from both |
| Feature Envy | Method reaches into another object's data more than its own | Move method onto the data it envies |
| Data Clumps | Same few fields keep travelling together | Bundle into one type |
| Primitive Obsession | Primitive standing in for a domain concept | Give the concept its own small type |
| Repeated Switches | Same switch/if-cascade on the same type recurs | Replace with polymorphism or one shared map |
| Shotgun Surgery | One logical change forces scattered edits across many files | Gather co-changing things into one module |
| Divergent Change | One file edited for several unrelated reasons | Split so each module changes for one reason |
| Speculative Generality | Abstraction/parameters added for needs the spec doesn't have | Delete it; inline back until a real need shows |
| Message Chains | Long `a.b().c().d()` navigation | Hide the walk behind one method on the first object |
| Middle Man | Class/function that mostly just delegates onward | Cut it, call the real target direct |
| Refused Bequest | Subclass ignores/overrides most of what it inherits | Drop inheritance, use composition |

### 4. Spawn both sub-agents in parallel

Send a single message with two `Agent` tool calls (use the general-purpose subagent for both).

**Standards sub-agent prompt** — include:
- The full diff command and commit list
- The list of standards-source files found in step 3, **plus the smell baseline pasted in full**
- Brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard: cite the standard (file + rule); (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** — include:
- The diff command and commit list
- The path or fetched contents of the spec
- Brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings — the two axes are deliberately separate.

End with a one-line summary: total findings per axis, and the worst issue within each axis (if any).

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.

## Chain

`grill-with-docs` → `to-prd` → `to-issues` → `implement` → **`code-review`**
