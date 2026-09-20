# DECISIONS.md — Decision Log

A running, append-only log of structural choices not already fixed in the
PRD — plus the current phase status. Every entry: date, decision, one-line
reason. Newest at the top. Never delete an old entry, even if later reversed
— add a new entry that supersedes it and say so.

Any session that makes a structural call not already covered by
`ARCHITECTURE.md`, `TOOLS_REGISTRY.md`, `SKILLS_REGISTRY.md`, or
`INTERACTION_MODEL.md` should add an entry here **in the same session**.

---

## Current phase

**Phase 0.5 (design) in progress.** `packages/db` is scaffolded with
Donna's domain schema (Goals/Projects/Tasks/Clients/Deliverables/Sessions/
GithubActivityLog/DerailmentEvents/StateLog/SleepLog/MealLog) and both apps
depend on it as a workspace package, but neither imports from it yet. Per
`BUILD_PLAN.md`, Phase 1 does not start until Phase 0.5's mockups are
approved.

**Daily Dashboard is done for this pass** — desktop (Today/Week/Month) and
mobile (Today/Week/Month), 6 artboards total, in the Paper file "Donna —
Design System & Screens": "09" (desktop Today), "09b" (desktop Week), "09c"
(desktop Month), "10" (mobile Today), "10b" (mobile Week), "10c" (mobile
Month). See the 2026-09-19 entries below for the section vocabulary
(A–H3), selection logic for Cards E/F, motion spec, and category/schema
decisions (StateLog, SleepLog, MealLog) made while building it.

**Chat/Voice Panel is done for this pass** — desktop + mobile, 7 states
each (empty, listening, thinking, speaking, error, plus the escalation-tier
reference and the orb-over-transcript overlay variant), all in the same
Paper file. See the 2026-09-20 entries below for the voice architecture
(one shared transcript, one orb object across states), the escalation
vocabulary reference, and open follow-ups (shader color/motion tuning,
real-build wiring).

**Not yet designed** (remaining Phase 0.5 scope, per `BUILD_PLAN.md`):
Goals view, Projects & Clients view, History/Review view. The escalation
visual vocabulary has an initial reference pass (see 2026-09-19 entry
below) but hasn't been extended beyond the Chat Panel's inline examples —
see `docs/SCREENS.md` for each remaining view's purpose/contents/states
spec. Phase 1 (core planning loop) does not start until all of Phase 0.5's
mockups are approved, per `BUILD_PLAN.md`'s exit criteria.

---

## Log

- **2026-09-20** — Chat/Voice Panel designed end-to-end (Phase 0.5): 7
  desktop artboards ("11" empty, "11c" listening, "11f" thinking, "11d"
  speaking, "11g" error, "11e" escalation-tier reference, "12a" orb-over-
  transcript overlay) plus mobile equivalents for empty/listening/thinking/
  speaking/error. Key structural calls: (1) **voice and typed messages
  share one transcript** — STT output becomes a `role: user` message, the
  text Donna's TTS speaks becomes `role: assistant`, identical to typing;
  there is no separate "dictation mode." (2) **One shared voice orb**
  (built from Fred's own `@paper-design/shaders-react` `MeshGradient`
  exploration, not the initially-considered `orb-ui` npm package — Fred
  preferred designing it directly in Paper) represents listening/thinking/
  speaking as one object whose motion differs per state; colors stay
  consistent across states per Fred's explicit preference — color tuning
  and per-state motion parameters (speed/distortion/swirl) are deferred to
  implementation, since Paper's MCP tools can't set the shader's custom
  props (only size/position), only Paper's own UI can. (3) **Orb floats
  over a dimmed (~35% opacity) transcript**, never a full-takeover layout —
  full takeover was considered and explicitly rejected as working against
  the shared-transcript decision (see AskUserQuestion answer this
  session). (4) **Orb is tappable** (not just the mic button): tap while
  listening ends the turn early; tap while speaking stops playback and
  transitions straight to listening — this is Donna's barge-in behavior,
  framed as "stop and listen now" rather than a true mid-sentence
  interruption, since STT → full agent turn → TTS (PRD §8) isn't realtime
  speech-to-speech. Real realtime speech-to-speech was discussed and
  explicitly deferred (already listed as future roadmap in `PRD.md` §12);
  cost/architecture tradeoff explained to Fred, not re-opened as a design
  question this session. (5) **Voice turn auto-resolves** — no explicit
  "done" control; orb fades once Donna finishes speaking and the
  transcript scrolls back into view, since the exchange is already in the
  thread as ordinary bubbles. (6) **End-of-utterance is explicit
  push-to-talk** (tap mic again to finish), not silence/VAD auto-detection.
  (7) **Caption stays visible by default** during speaking (not
  audio-only/hidden-until-tapped) — confirmed against a concrete usage
  scenario Fred walked through (hands-free spoken exchange, but still
  wants it to land as normal chat bubbles afterward). Also fixed during
  this session: dashboard scrim (the dimmed background behind the chat
  panel) was initially built from a thin composited slice of dashboard
  content reused from the app-shell artboard; Fred caught that it should
  instead show the fully populated "09 — Daily Dashboard (Desktop)"
  artboard for a more convincing translucency effect — rebuilt across all
  affected artboards. Reason: Fred wants Chat/Voice fully speced before
  moving to the remaining views; voice architecture in particular needed
  real decisions (not guesses) since it touches the STT/agent/TTS pipeline
  from `PRD.md` §8 directly. Affects: `docs/SCREENS.md` (Chat/Voice Panel
  section rewritten with full states/architecture/interaction spec);
  Phase 1 agent/voice-channel implementation should build to this spec;
  `orb-ui` (npm, MIT-licensed) remains a viable real-build option if the
  hand-rolled shader approach proves harder to wire to live STT/TTS state
  than expected — noted but not chosen.

- **2026-09-19** — Daily Dashboard mobile breakpoint built: three artboards
  ("10 — Daily Dashboard (Mobile)", "10b — Week View (Mobile)", "10c —
  Month View (Mobile)"), each 375px wide, duplicating the desktop's
  "duplicate shell, swap only Card D" pattern. All sections (B–H) reflow
  into a single vertical stack rather than desktop's two-column + footer
  grid — Card F (High Priority) is promoted higher in the stack than its
  desktop rail position, front-loading anything urgent per Donna's
  protective personality, since mobile has no separate always-visible
  rail. Card H's GitHub and Sleep & Meals halves stack vertically instead
  of sitting side by side, each keeping its own header/stat. Week view's
  7-lane side-by-side desktop layout does not fit 335px, so mobile uses a
  **vertical day-by-day agenda** instead — one full-width row per weekday
  with compact colored blocks — chosen over a horizontal-scroll variant
  of the desktop grid, which was rejected as a worse mobile pattern for
  at-a-glance info. Month view reuses the desktop's chosen dot-grid
  content pattern (not the rejected event-chip alternative), scaled down
  (smaller cells/marks, single-letter weekday header) rather than
  redesigned. Reason: Fred asked for an outline and approval before
  building, then approved proceeding; this follows the same
  each-screen/state-gets-its-own-artboard discipline established for
  desktop. Also fixed, worth noting for future Paper sessions: a
  `write_html replace` on a flex-grow body container can silently detach
  it from its parent (leaving `parentId: null`) while its later
  `insert-children` calls keep succeeding into the orphaned node — content
  built correctly but never rendered. Recovered by creating a fresh
  container and moving the valid content children into it rather than
  trying to reattach the orphaned parent. Affects: `docs/SCREENS.md`
  (Daily Dashboard entry should note the mobile artboards once the mobile
  breakpoint stabilizes further).

- **2026-09-19** — Daily Dashboard's schedule toggle (Card D) now has all
  three states built in Paper, each as its own dedicated artboard (per the
  earlier decision to give every screen/state its own artboard rather than
  editing shared ones in place): "09 — Daily Dashboard (Desktop)" (Today,
  canonical), "09b — Daily Dashboard, Week View (Desktop)", "09c — Daily
  Dashboard, Month View (Desktop)". Week view uses real time-axis math (9A–
  6P mapped to pixel position/height, not eyeballed placement) with visible
  day-column dividers and per-block time+title labels — an earlier
  abstract "just show density" version was rejected as conveying no real
  information. Three schedule-block categories are now defined: **Deep
  work** (solid `--blue-800` fill, flat not gradient — gradient was tried
  and reverted per Fred's preference for something more subtle), **Meeting**
  (solid `--gray-400` fill), **Personal/buffer** (dashed outline, no fill —
  deliberately kept off the rust/red escalation ramp, consistent with how
  derailment recovery is already treated, since this is protective/optional
  time, not committed work or an alert). For Month view, two content
  patterns were built and compared side by side: compact category dots
  (no text, "shape of the month" at a glance) vs. Google-Calendar-style
  event-title chips per cell. **Fred picked the dots version** — the
  event-chip artboard ("09d") was built for comparison and then deleted
  per his instruction once the choice was made, so 09c is the sole
  canonical Month view going forward. Clicking a Month day cell is
  specified (not yet built) to jump to the Today view for that date, reusing
  the existing detailed timeline rather than inventing a third detail
  pattern. Reason: each of these needed a real decision rather than a
  guess — Fred corrected an early Week-view attempt that stacked a second
  state under the first Today rows in the same artboard (would have visually
  merged two screen states), and separately corrected an eyeballed,
  non-functional first pass at the Week grid before the real time-math
  version was built. Affects: `docs/SCREENS.md` (Daily Dashboard entry
  should be extended with the Week/Month specifics once this settles
  further); `packages/db/schema.ts` has no `category` field on `task` yet
  for Deep work/Meeting/Personal — still cosmetic-only in Paper, needs a
  real schema decision before Phase 1 builds the actual calendar.

- **2026-09-19** — Defined the Daily Dashboard's motion/interaction spec
  and rewrote its `SCREENS.md` entry to match the screen as actually built
  this session (section vocabulary A–H3, layout, selection logic for Cards
  E/F, states) — the prior entry was written before any of that existed
  and had gone stale. Two interaction calls worth flagging: (1) checking
  off a task (D2a) **animates the row out** after a short delay (~600ms)
  rather than leaving it in place struck through — a classic to-do-list
  clear, chosen over "stays visible" because Fred confirmed he wants the
  satisfying-completion moment over an always-visible full-day view; (2)
  **one shared segmented-toggle pattern** (active pill slides, 140ms) is
  used identically for all three toggles on this screen (Today/Week/Month,
  GitHub's 30D/90D/1Y, Sleep & Meals' 7D/30D) rather than giving each a
  distinguishable feel, to keep the interaction learned once. The sleep
  gauge's arc-sweep-on-first-load (~400ms) is the one deliberate exception
  to the system's fast 120–160ms base timing. Reason: Paper can't hold real
  motion, so `SCREENS.md` is the authoritative record until real components
  exist; Fred asked for this explicitly this session. Affects:
  `docs/SCREENS.md` (Daily Dashboard section, rewritten); future Phase 1
  component implementation should build to this spec rather than inventing
  transition timing ad hoc.

- **2026-09-19** — Added personal health tracking (sleep, meals) as two new
  tables in `packages/db/schema.ts`: `SleepLog` (date, hours, targetHours —
  default 6) and `MealLog` (one row per logged meal, with an optional
  description). Both are self-reported through chat only, same as
  `StateLog` — no dedicated manual-entry UI. Unlike `StateLog`, these are
  **not** visually disguised: Fred confirmed sleep/meals aren't sensitive
  the way mood is, so they render as plainly labeled instrument rows on the
  Daily Dashboard's Activity section (Card H), not hidden in an unlabeled
  row. Visualization settled as target-vs-actual, not raw counts: sleep
  renders as a segmented bar filled to actual hours with a hairline tick at
  the target (continuous quantity → bar), meals renders as N small unit
  squares filled left-to-right as logged against a target of 3/day
  (discrete count → unit squares) — deliberately different mark types
  because the two data shapes aren't the same kind of quantity. This fills
  the third column of the Activity Instrument (previously considered for a
  per-project GitHub repo breakdown, which was dropped in favor of
  non-project personal data per Fred's steer this session). Reason: Fred
  wants to track sleep/meals in addition to mood/states, with the same
  "not obviously a health tracker to onlookers" instinct applied
  selectively (states stays hidden, sleep/meals don't need to be). Affects:
  `docs/PRD.md` (no current pillar covers personal health tracking at all —
  same gap already flagged for States in the earlier entry; worth a
  combined short addition near §4.8 rather than two separate patches);
  `docs/SCREENS.md` (Daily Dashboard content section needs the Activity
  Instrument's three-part structure — GitHub grid, states row, sleep/meals
  column — written up once finalized in Paper).

- **2026-09-19** — Refined two Daily Dashboard cards after reviewing the
  first mockup (see dashboard vocabulary: Card E = Goal Context Card, Card F
  = High Priority). **Card F renamed** from "Client Risk" to "High
  Priority" and its scope broadened: it now surfaces the single most urgent
  item across client risk flags (PRD §4.4 — deliverable due soon, or no
  contact in the configured window) AND high-priority tasks that are
  overdue or due today — not client risk alone. Tie-break rule: if both a
  client risk and an urgent task exist, client risk wins (client-facing
  commitments carry reputational cost per PRD's client-reliability goal);
  otherwise soonest due date wins. Shows a quiet "nothing urgent" state
  when neither applies, rather than being hidden, per the escalation
  model's preference for calm visibility over silent omission. **Card E**
  clarified: it does not curate an independent "goal of the day" — it
  derives directly from today's scheduled tasks' `goalId` links, grouped
  by goal, each with a task count; tasks with no `goalId` are silently
  excluded from the card (not flagged) to keep its one job — goal
  traceability per PRD §4.3 — from blending into backlog hygiene. When
  today's tasks span multiple goals, all linked goals are stacked in the
  card rather than picking just one. Reason: Fred asked for the selection
  logic behind both cards before continuing design, since the visual mock
  had been showing single hardcoded examples that don't reflect how
  multiple real goals/risks would actually resolve. Affects: `docs/SCREENS.md`
  (Daily Dashboard content section should reference this logic once
  written up formally); Phase 1 tool design for whichever tool computes
  Card F's "most urgent item" query.

- **2026-09-19** — Daily Dashboard content design settled (Phase 0.5): added
  a `StateLog` table (`packages/db/schema.ts`) — `level`
  (`dip`|`baseline`|`peak`), `note`, `loggedAt` — to back a self-reported
  personal-state tracker ("my states"), logged via chat with Donna only, no
  dedicated UI control. On the dashboard it appears as a second, unlabeled
  row directly beneath the GitHub activity heatmap, using the same square-
  grid glyph language rather than a labeled chart: hollow square = baseline,
  filled square = peak, dot = dip. No legend or label is shown anywhere in
  the UI — intentionally illegible to anyone but Fred. Also settled: the
  dashboard's day-shape readout (planned/deep-work/meeting hours) stays a
  plain mono text strip, not a stacked-bar chart — rejected the chart after
  concluding it added decoration, not information, for a single day's
  3-category split; a chart earns its place only where it reveals a pattern
  text can't (e.g. a future weekly trend view), not by default. Considered
  and explicitly declined a system-wide "no pie/donut/radial charts" rule —
  staying with bar/segmented-bar and the square heatmap for now because
  nothing yet needs a circular chart, not because circular charts are
  banned; revisit per-screen if a real case appears. Reason: Fred wants the
  dashboard to feel geometric/architectural/editorial and precise, and wants
  a private state-tracking signal that reads as "more instrument," not as an
  obvious mood tracker, to anyone else looking at the screen. Affects:
  `packages/db/schema.ts` (StateLog table, done), `docs/SCREENS.md` (Daily
  Dashboard content section should reference the states row once built),
  `docs/PRD.md` (no pillar currently names self-reported state tracking —
  worth a short addition near 4.8 Energy & Derailment Recovery if this
  becomes more than a dashboard easter egg).

- **2026-09-19** — Built and locked the app shell in Paper (artboards
  02–08): desktop nav rail (expanded/collapsed/chat-open states), mobile
  dashboard + full-screen chat sheet + swipe-open nav drawer. Structural
  calls made along the way: nav rail uses a dark navy gradient
  (`--gradient-surface-dark`, see separate entry below) instead of flat
  `--gray-900`; chat-closed state uses "rail icon only" (no persistent
  edge affordance) per Fred's pick from 3 variations; mobile drops the
  bottom tab bar in favor of a sidebar-style swipe-open drawer (same nav
  content as desktop) since a tab bar caps out around 4-5 items and more
  nav destinations are expected; mobile drawer opens via edge-swipe only,
  no visible trigger icon, by design; footer user-nav rows get a one-tap
  sign-out icon alongside the existing dropdown chevron (chevron dropped
  on mobile specifically, since swipe already handles drawer open/close
  and a one-item dropdown wasn't worth the extra tap target). Reason: this
  is the app-shell milestone from `BUILD_PLAN.md` Phase 0.5, which the plan
  requires to be approved before individual view mockups start. Affects:
  `SCREENS.md` (new App shell section listing all 7 artboards),
  `DESIGN_PHILOSOPHY.md` (Paper file description updated). Next: the five
  core view mockups (Daily Dashboard content, Chat/Voice Panel content,
  Goals, Projects & Clients, History/Review) and the escalation visual
  vocabulary are still unbuilt — Phase 0.5 is not yet exit-criteria-complete.
- **2026-09-19** — Nav rail background moved from flat `--gray-900` to a
  new gradient token, `--gradient-surface-dark` (vertical, oklab
  interpolation, dark navy). Active nav-item styling changed from
  `--gray-800` fill to `rgba(255,255,255,0.10)` + `--blue-500` left border,
  and accent circles (user avatar) brightened from `--blue-700→900` to
  `--blue-300→500`, since the old values didn't contrast against the new
  gradient. Reason: Fred wanted a more distinct, less flat nav surface;
  iterated directly in Paper until the gradient read well, then needed the
  dependent colors re-tuned to still contrast against it. Documented in
  `DESIGN_PHILOSOPHY.md` §3.5 rather than as a Paper token, since Paper's
  token system has no `gradient` type — flat colors only. Affects:
  `DESIGN_PHILOSOPHY.md` (new §3.5); Phase 1 will need to add
  `--gradient-surface-dark` as a literal CSS custom property in
  `apps/web/app/globals.css` (not inside `@theme inline`, which expects flat
  values) when the real sidebar component is built.
- **2026-09-19** — Wrote `docs/SCREENS.md`, consolidating the five core
  views from `PRD.md` §7 (Daily Dashboard, Chat/Voice Panel, Goals,
  Projects & Clients, History/Review) into full purpose/contents/states,
  and flagging three undecided gaps not covered by the PRD's view list at
  all: onboarding/first-run setup, a Settings screen, and push notification
  templates. Reason: the PRD's view list was intentionally minimal
  ("functional requirements, not final design") and design work needs a
  fuller reference to check screens against as they're built, plus a place
  to track which screens still need a decision rather than being silently
  skipped. Affects: `BUILD_PLAN.md` Phase 0.5 (design work should follow
  this screen list); the onboarding/settings/notifications gaps need a
  decision before Phase 4 at the latest.
- **2026-09-19** — Wrote `docs/DESIGN_PHILOSOPHY.md`, the settled baseline
  for Donna's visual design system (tokens, six component styling rules,
  app-shell structural decisions), after locking two Paper artboards
  ("00 — Foundations", "01 — Components") and rolling back a separate
  background/texture exploration (torn-paper diagonals, rulers, mixed grids,
  gradient shaders) to keep the settled baseline clean. Reason: needed a
  durable, session-independent record of the design direction before
  continuing in a fresh session — Paper's live file is the working surface,
  but this doc is the reconciled source of truth when they disagree.
  Affects: `BUILD_PLAN.md` Phase 0.5 (this doc is now its companion
  reference); next design session should read this doc first.

- **2026-09-19** — Design-phase (0.5) kickoff: settled the app shell's
  structure ahead of Paper mockups. (1) **Dashboard is home**, not chat —
  the landing view is the daily briefing/schedule/task list; chat is a
  secondary surface, not the front door. (2) **Chat is a persistent side
  panel**, not a separate full-screen tab — Donna should be reachable from
  any view, not switched into. (3) **Visual identity is sharp/editorial,
  not literally Suits-themed** — personality comes through in copy/tone and
  interaction (per `INTERACTION_MODEL.md`), not visual motifs referencing
  the show. (4) **Mockups cover desktop and mobile breakpoints in parallel**,
  not sequenced, since the PWA is used across both from day one. Reason:
  Fred confirmed all four via direct questions this session; these decisions
  shape every Phase 0.5 mockup and Phase 1 layout, so they needed to be
  locked before opening Paper rather than decided screen-by-screen. Affects:
  `BUILD_PLAN.md` (Phase 0.5 scope, now more concrete), future Paper file
  structure, `apps/web`'s eventual layout/routing (dashboard route becomes
  `/`, chat becomes a panel component rather than `app/(chat)`'s current
  full-page pattern).
- **2026-09-19** — Adopted `docs/BUILD_PLAN.md` as the phased build sequence:
  Phase 0.5 (design in Paper.design, using Chat SDK's existing component set,
  before any real UI code) → Phase 1 (core loop) → Phase 2 (signal
  integration: calendar/GitHub/clients/check-ins) → Phase 3 (self-improvement)
  → Phase 4 (voice/push/derailment). This supersedes the phase sequencing
  sketched in this file's earlier entry ("Phase sequencing decided...") by
  inserting a design phase before Phase 1 and splitting the old "Phase 2"
  into signal integration vs. self-improvement, since self-improvement
  depends on real session history existing first. Reason: Fred wants
  aesthetic direction locked via mockups before real UI code is written, to
  catch design problems while they're still cheap to change. Affects:
  `BUILD_PLAN.md` (new), `SKILLS_REGISTRY.md`/`TOOLS_REGISTRY.md` (unchanged
  in content, just now sequenced by this plan).
- **2026-09-19** — Settled Donna's memory architecture as **Postgres only** —
  no separate markdown or freeform memory store for the self-improvement
  loop (PRD 4.7/section 9). The existing schema (`sessions`,
  `tasks.estimated_minutes`/`actual_minutes`, `derailment_events`) already
  models this domain relationally; "qualitative" patterns (e.g. "Fred
  responds better to direct check-ins") are aggregate queries over this data,
  not freeform prose, so a hand-maintained memory file would just be a
  second, driftable copy of what SQL can compute fresh every time. Reason:
  avoids a sync problem between two memory systems and matches the project's
  own stance that an out-of-date doc is worse than no doc. Affects:
  `BUILD_PLAN.md` (Phase 3), `ARCHITECTURE.md` section 2/9 (no schema change
  needed — existing tables already support this).
- **2026-09-19** — Scaffolded `packages/db` as a real workspace package
  (`@donna/db`): `schema.ts` defines the eight domain tables sketched in
  `ARCHITECTURE.md` section 2 (Client, Goal, Project, Task, Deliverable,
  Session, GithubActivityLog, DerailmentEvent), plus a Drizzle client
  (`index.ts`), migration config, and an initial generated migration
  (`migrations/0000_sticky_squadron_sinister.sql`, not yet applied to any
  live database). Both `apps/web` and `apps/agent` now list `@donna/db` as
  a `workspace:*` dependency, but neither imports from it yet — CRUD UI and
  agent tools are Phase 1 work. The Chat SDK's own tables
  (`apps/web/lib/db/schema.ts`: User, Chat, Message_v2, Vote_v2, Document,
  Suggestion, Stream) remain separate and unmerged, since they're
  chat-persistence concerns, not Donna's application data. Reason: closes
  out the one unfinished piece of Phase 0 — the shared schema package
  `ARCHITECTURE.md` already described but that didn't exist in code.
  Affects: none (code now matches the existing `ARCHITECTURE.md` section 2).
- **[date]** — Chose Vercel Postgres + Drizzle as the persistence layer for
  all application data (Goals/Projects/Tasks/Clients/Sessions), shared via
  `packages/db` between `apps/web` and `apps/agent`. Reason: relational data
  with real joins (task→goal, task→project→client), and it matches Chat
  SDK's own default stack, so chat history and application data can share
  one database.
- **[date]** — Chose to let `apps/web` read the database directly rather
  than routing all reads through the agent. Reason: dashboard/goals/
  projects/clients views are read-heavy and don't need agent reasoning;
  routing them through the agent would add latency for no benefit. See
  `ARCHITECTURE.md` section 3 for the full read/write boundary rule.
- **[date]** — Confirmed monorepo structure (Turborepo, `apps/web` +
  `apps/agent` + `packages/db`) over separate repos. Reason: both apps must
  agree on data shape; a shared schema package in one repo is the only way
  to guarantee that without manual sync.
- **[date]** — Phase sequencing decided: Phase 1 (core loop) → Phase 2
  (reliability/memory: self-improvement, full escalation, client subagent)
  → Phase 3 (new surfaces: voice, derailment detection, push notifications).
  Reason: self-improvement loop needs real session history to exist first;
  voice and derailment detection are additive surfaces that shouldn't block
  or complicate the core loop's build.

---

## Template for new entries

```
- **[date]** — [what was decided]. Reason: [why, one or two lines].
  Affects: [which doc(s) to also update, if any].
```
