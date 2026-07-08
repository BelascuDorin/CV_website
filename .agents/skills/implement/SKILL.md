---
name: implement
description: Implement a piece of work based on a PRD or set of issues. Use when the user wants to build out a feature, start implementing from a ticket, or says to implement a plan.
disable-model-invocation: true
---

Implement the work described by the user in the PRD or issues.

Use `/tdd` where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use `/code-review` to review the work.

Commit your work to the current branch.

## Chain

`grill-with-docs` → `to-prd` → `to-issues` → **`implement`** → `code-review`
