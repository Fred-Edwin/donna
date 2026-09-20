# Handoff — Goals View, Projects & Clients View, History/Review View

**Session type:** Phase 0.5 design (Paper.design mockups), continuing the
same pass that built the App Shell, Daily Dashboard, and Chat/Voice Panel.
This is a fresh session — read the docs below before opening Paper or
proposing anything. Don't re-derive decisions that are already made.

**Scope:** design the three remaining core views from `PRD.md` §7:
1. **Goals View** (primary target for this session)
2. **Projects & Clients View** (if time allows)
3. **History/Review View** (if time allows)

If you only get to one, make it Goals — it's next in `BUILD_PLAN.md`'s
sequence and the other two lean on patterns (list/detail, empty states)
that are easier to extend once Goals is settled.

---

## Read this first, in order

1. **`CLAUDE.md`** (repo root) — hard rules for this project. In
   particular: never invent a new data shape without checking
   `packages/db/schema.ts` first; log structural decisions in
   `DECISIONS.md` the same session; update docs before ending the session,
   not after.
2. **`docs/PRD.md`** §4.3 (Goal Management), §4.4 (Client Management),
   §4.7 (Self-Improvement Loop), and §7 (Key Views) — the functional
   requirements these three screens exist to satisfy.
3. **`docs/DESIGN_PHILOSOPHY.md`** — the settled visual system. Tokens,
   the six component styling rules (hairline borders, asymmetric card
   structure, square/dot signature mark, numeric-in-mono treatment, sharp
   motion). Everything you design must follow this, not reinterpret it.
4. **`docs/INTERACTION_MODEL.md`** — tone/escalation rules, needed if any
   of these views surface nudges or risk flags (Projects & Clients
   definitely will — client risk flags per PRD §4.4).
5. **`docs/SCREENS.md`** — read the *entire* file, not just the three
   sections for these views. The Daily Dashboard and Chat/Voice Panel
   entries show the level of detail expected (purpose, contents, section
   vocabulary, selection logic, states, motion spec) — match that bar.
   The three sections you're building (Goals View, Projects & Clients
   View, History/Review View) currently only have the PRD's original
   one-line-per-bullet sketch — treat that as a starting brief, not a
   finished spec. You'll need to ask Fred clarifying questions the same
   way earlier sessions did (see `DECISIONS.md` log entries below for
   examples of the kind of selection-logic/interaction questions that
   came up and had to be resolved before building).
6. **`docs/DECISIONS.md`** — read the "Current phase" section at the top,
   then skim the log (newest first). Pay particular attention to:
   - The 2026-09-19 entries on Daily Dashboard's card discipline ("cards
     used sparingly," flush/unboxed by default) — this almost certainly
     applies to Goals and Projects & Clients too, both of which are
     naturally list-shaped and could easily turn into "cards everywhere"
     if you don't actively resist it.
   - The 2026-09-20 entry on Chat/Voice Panel — shows the depth of
     interaction-logic decisions (state machines, transition rules,
     motion ranking) that got made, and the pattern of using
     AskUserQuestion-style clarifying questions before building rather
     than guessing.
7. **`packages/db/schema.ts`** — the real data model. Goals, Projects,
   Tasks, Clients, Deliverables all already exist as tables with real
   fields. Design against what's actually there — e.g. check whether
   Goals already has a `horizon` (long/short) field and what a Project's
   real status enum is, rather than inventing plausible-sounding ones.
   If a screen needs a field that doesn't exist, that's a real schema
   change to propose and log, not something to silently assume.

---

## What's already built (for visual/component reference)

Paper file: **"Donna — Design System & Screens"**
(`https://app.paper.design/file/01M2W00FQT3Z6NT7265YJRVWTZ`)

Relevant existing artboards to study before designing anything new:
- **"00 — Foundations"**, **"01 — Components"** — the token/component
  baseline.
- **"02" / "02b" / "03"** — App Shell, desktop, all nav states. Goals and
  Projects & Clients both have their own nav rail entries already built
  (see the rail in artboard "03" — "Goals" and "Projects & Clients" are
  already listed as nav items, just not built out as destinations yet).
- **"09" (+ "09b", "09c")** — Daily Dashboard, desktop. This is the
  richest reference for "how does a data-dense, card-sparing screen
  actually look" — study its two-column layout, the Activity Instrument
  footer pattern, and how Card F (High Priority) is the *only* heavily
  bordered element on the whole screen.
- **"10" (+ "10b", "10c")** — Daily Dashboard, mobile. Reference for how
  desktop layouts collapse to a single vertical stack, and where content
  gets reprioritized (not just reflowed) for mobile.
- **"11" series** (11, 11b, 11c, 11d, 11f, 11g, 11e, 12a) — Chat/Voice
  Panel, all states, desktop + mobile. Less directly relevant to
  Goals/Projects/History, but worth a glance for the escalation-tier
  visual reference (artboard "11e") since Projects & Clients will likely
  need to surface client risk flags using that same vocabulary.

Also reuse the codebase's scaffolded component set as the default
starting point, per the working pattern established for Chat/Voice Panel
— check `apps/web/components/ui/` and `apps/web/components/ai-elements/`
for anything that already has the right shape (list rows, detail panels,
badges, progress indicators) before designing from scratch. Fred's stated
preference: use existing scaffolded components by default; only deviate
where he flags something he wants changed.

---

## Working pattern Fred expects (established this session, apply the same way)

- **Ask before assuming.** When a screen's selection logic, empty state,
  or interaction model isn't obvious from the PRD, ask a clarifying
  question (this session used `AskUserQuestion` for things like the voice
  orb's layout, interactivity, and end-of-utterance behavior) rather than
  guessing and building. Fred will redirect if the framing is wrong — see
  the Chat/Voice Panel session's back-and-forth on caption visibility and
  full-takeover-vs-floating as an example of how that conversation went.
- **One artboard per screen/state.** Never edit a shared artboard in
  place to show a different state — duplicate it and build the state
  separately (established pattern since the very first Daily Dashboard
  session).
- **Real computed logic, not eyeballed placement.** If a layout needs
  real math (time axes, progress bars, proportional fills), build it with
  actual values, not an approximation. This was a hard correction earlier
  in the project (see the 2026-09-19 DECISIONS.md entry about the Week
  view's rejected first pass).
- **Confirm before rolling a change out to every artboard.** A recent
  correction: adding a visual treatment (a radial gradient behind the
  voice orb) got applied to all 8 orb-state artboards before Fred had
  seen or approved even one. He wants to review a single instance first,
  then approve before it's replicated. Apply this discipline here too —
  build one state of one screen, screenshot it, and let Fred react before
  duplicating the pattern across every other state/screen.
- **Update `docs/SCREENS.md` and `docs/DECISIONS.md` in the same
  session**, not after — this is a `CLAUDE.md` hard rule, not a
  suggestion. Write up each screen's purpose/contents/selection-logic/
  states/motion spec in `SCREENS.md` as you go (matching the Daily
  Dashboard and Chat/Voice Panel entries' depth), and log any structural
  decision (schema changes, interaction-model calls, rejected
  alternatives) in `DECISIONS.md`'s log, dated, with a one-line reason.
- **Desktop and mobile in parallel** for whichever screen you build, per
  the locked structural decision in `BUILD_PLAN.md` Phase 0.5 — the PWA
  is used across both from day one, not sequenced.

---

## Specific open questions for Goals View (starting point, not exhaustive)

`docs/SCREENS.md`'s current entry is thin — purpose, a 3-bullet contents
list, 2 states. Before building, you'll likely need real answers to:

- **Grouping/filtering by horizon** — PRD says "grouped or filterable by
  long/short." Which is it, or both? Does `packages/db/schema.ts`'s Goal
  table already have a `horizon` field to check?
- **Progress indicator** — what defines "progress" for a goal? Task
  completion percentage among linked tasks? Something else? Is this
  computed the same way Card G (Momentum Tile) computes plan-adherence
  streak on the Dashboard, or a different metric entirely?
- **Linked-task references** — does this view show *all* tasks linked to
  a goal (a real drill-down), or just a count/preview (like Card E on the
  Dashboard does)? If it's a full list, does it need its own detail state
  beyond "Populated"?
- **Relationship to Dashboard's Card E (Goal Context)** — Card E already
  shows today's tasks grouped by goal. Does Goals View duplicate that
  logic at a longer time horizon, or is it a genuinely different
  question ("what are my goals" vs. "what's linked to a goal today")?

Don't treat these as rhetorical — ask Fred directly before building, the
same way earlier sessions asked about card selection logic, escalation
layout, and voice interaction rules.

---

## Exit criteria for this session

Per `BUILD_PLAN.md`'s Phase 0.5 exit criteria, Phase 1 doesn't start until
Fred approves the app shell, all five core view mockups (both
breakpoints), and the escalation visual vocabulary. This session's job is
to get Goals View (and ideally Projects & Clients, History/Review) to that
approved state — or as close as time allows, clearly documenting what's
done vs. still open in `SCREENS.md` and `DECISIONS.md` before ending, the
same way this session's predecessor documented its own incomplete state at
handoff time.
