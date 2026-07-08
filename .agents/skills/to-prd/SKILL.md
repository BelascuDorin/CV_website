---
name: to-prd
description: Turn the current conversation context into a PRD and submit it as a GitHub issue. Use when user wants to create a PRD from the current context.
disable-model-invocation: true
---

# to-prd

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT interview the user — just synthesize what you already know.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already.

2. Sketch out the major modules you will need to build or modify to complete the implementation. Actively look for opportunities to extract deep modules that can be tested in isolation.

   A **deep module** is one which encapsulates a lot of functionality in a simple, testable interface which rarely changes. Prefer existing seams over new ones, and the highest seam possible — ideally just one across the whole change.

3. Check with the user that these modules match their expectations. Check with the user which modules they want tests written for.

4. Write the PRD using the template below and submit it as a GitHub issue with the `ready-for-agent` label.

## PRD Template

```markdown
## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format:

1. As a [role], I want [capability], so that [benefit].

This list should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets — they may become outdated quickly.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.
```

## Publishing

After writing the PRD, submit it as a GitHub issue (see `docs/agents/issue-tracker.md`) and apply the `ready-for-agent` label (see `docs/agents/triage-labels.md`).

## Chain

`grill-with-docs` → **`to-prd`** → `to-issues` → `implement` → `code-review`

Reach for `to-prd` once a change has been talked through and the domain language is settled. If alignment isn't done yet, run `grill-with-docs` first.
