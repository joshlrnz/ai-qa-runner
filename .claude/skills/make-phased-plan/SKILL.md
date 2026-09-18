---
name: make-phased-plan
description: Break any non-trivial implementation task into small, end-to-end testable phases with a hard approval gate on every phase, saved as a Markdown file in ./plans/. Use when the user asks to plan a feature/fix/refactor, "make a phased plan", "break this into phases/steps", "plan this out", or any multi-step build that needs review at each boundary. For PRD-driven planning use prd-to-plan instead.
---

# Make a Phased Plan

Turn a task into a phased implementation plan the user reviews and approves one phase at a time. This is general-purpose — a bug fix, a feature, a refactor — not tied to a PRD.

## Non-negotiable rules

1. **Hard stop after every phase.** Do NOT write code for the next phase until the user explicitly approves the current one. Not "finish one then continue" — a real pause for review at each boundary.
2. **Small, individually-verifiable phases.** Prefer many thin phases over a few thick ones. When in doubt, split.
3. **Each phase is an end-to-end testable slice**, not an inert micro-step. A phase should be something the user can actually run/verify on its own — not "add a type" then "add a field."
4. **Never commit.** The user commits their own work. Never run `git commit` (or `git push`) as part of executing a phase.
5. **Literal wording, simple technical English.** The plan says exactly what will be built: name the model, the field, the query, the page, the button. Write short declarative sentences ("Add a `cancelled` boolean to `Requisition`. The list page gets a status filter."). No abstractions ("enhance the experience", "robust handling", "seamless integration"), no filler adjectives, no marketing verbs. If a sentence doesn't tell the reviewer what code will exist afterwards, cut it or rewrite it.

## Process

### 1. Understand the task

Explore the codebase enough to know the current patterns, integration layers, and constraints. Read the nearest `CLAUDE.md`. Don't plan against assumptions — verify.

### 2. Identify durable decisions

Note the high-level choices unlikely to change across phases (routes, schema shape, key models, service boundaries, permission/`companyId` scoping). These go in the plan header so every phase inherits them.

### 3. Sketch the architecture (when the task warrants it)

For work that introduces a new subsystem, a new data model, a cross-layer flow, or a choice between genuinely different designs, add an **Architecture** section to the plan file — after the durable decisions, immediately before the phases, so a reviewer reads the design right before the work that implements it. Skip it for bug fixes, small refactors, and single-layer changes where the shape is obvious; an architecture section on a trivial task is noise.

When included, it covers:

- **System breakdown** — the main pieces (models, services, routers, UI surfaces) and how data flows between them. A short indented/ASCII diagram or a nested list, not prose paragraphs.
- **Tradeoffs** — for each decision with a real alternative, name the option chosen, the option rejected, and the one reason that decided it (e.g. "atomic server-side convert transaction over client-chained create→mark: partial-failure leaves orphaned POs"). One line each; no essays.
- **Integration points** — which existing services/patterns are reused vs. extended vs. deliberately not touched, so reviewers see the blast radius.

Durable decisions then record the *outcomes*; the architecture section records the *why*. Don't duplicate — a decision explained in the tradeoffs list appears in durable decisions as a one-liner.

### 4. Draft the phases

Slice the work into thin, testable phases. Each phase:

- Delivers a narrow but complete, verifiable path — the user can run or check it.
- States literally what gets built (rule 5): the concrete models, queries, mutations, pages, components, and behaviors that will exist when the phase is done. Only leave a name unspecified when an earlier phase's outcome genuinely decides it.
- States how to verify it (typecheck, test, manual step) and an explicit **Gate** blocking next-phase code until approval.

### 5. Write the plan file

Create `./plans/` if missing. Write `./plans/<kebab-task-name>.md` using the template below. The plan file is always the output of this skill — never stop to ask whether to write it.

### 6. Execute phase by phase

Implement **one phase at a time**. At the end of each phase: run its verification, report the result plainly (including failures), then STOP and wait for the user's explicit go-ahead. Do not start the next phase's code on your own momentum. Do not commit.

## Plan template

```md
# Plan: <Task Name>

> Goal: <one-line what this delivers>

## Durable decisions
- **Routes/Schema/Models**: ...
- **Scoping/permissions**: companyId + deleted:false, authPermission where relevant
- (add/remove as needed)

## Architecture (only when the task warrants it — see step 3)

### System breakdown
<pieces + data flow, diagram or nested list>

### Tradeoffs
- **<decision>**: <chosen> over <rejected> — <the one deciding reason>

### Integration points
- Reuses: ... / Extends: ... / Deliberately untouched: ...

> Rule: no code for the next phase until the user explicitly approves the current one. The user commits their own work — do not commit.

---

## Phase 1: <Title>
**Goal**: <what this slice delivers end-to-end>

### What to build
Literal list of what will exist after this phase — named models/queries/pages and their behavior, in plain declarative sentences.

### Verify
- [ ] <how to run/check this phase — typecheck, test, manual step>

### Gate
Do NOT write Phase 2 code until the user explicitly approves this phase.

---

## Phase 2: <Title>
...
```

## Get the details first

Use the `grill-me` skill (`/grill-me`) to grill the user and pull out the details needed for the plan — the ambiguities, the decision branches, the constraints they haven't said out loud. Don't guess at anything grilling could settle.

When the task warrants an Architecture section (step 3), the grilling must cover the architecture too, not just requirements:

- **Design alternatives** — where two genuinely different shapes exist (new model vs. extend existing, atomic transaction vs. chained calls, derived vs. stored state, shared service vs. local copy), present both with their costs and make the user pick. Their pick becomes a tradeoff line.
- **System boundaries** — what's in scope vs. deliberately untouched (legacy models, other tenants' behavior, adjacent features), so the Integration points section reflects decisions, not assumptions.
- **Blast radius** — which existing services/constants the work will extend or refactor, and whether existing callers may change behavior. Any "zero behavior change" claim should be a confirmed answer, not an inference.
