# BUILD_PLAN.md — Phased Build Plan

This document sequences Donna's build. It assumes all development is
agentic-driven (Claude Code / agent sessions doing the actual implementation
work), and each phase should be broken into agent-session-sized steps when
that phase starts — this doc stays at the milestone level.

Read `CLAUDE.md` first for the reading order and hard rules (schema changes,
tool/skill registries, doc updates) — they apply throughout every phase
below, not just at the start.

---

## Phase 0.5 — Design (Paper.design)

**Goal:** lock the aesthetic direction and screen layouts before writing any
real UI code, using Fred's existing Chat SDK component set as the design
system.

**Structural decisions (locked — see `DECISIONS.md` 2026-09-19 design-kickoff
entry):**
- **Dashboard is home.** Landing view is the daily briefing/schedule/task
  list, not chat. Reinforces "she already planned your day," not "here's a
  chatbot with tabs."
- **Chat is a persistent side panel**, not a separate full-screen tab —
  reachable from every view, not switched into. This replaces Chat SDK's
  current `app/(chat)` full-page pattern with a panel component alongside
  the dashboard content.
- **Visual identity: sharp & editorial, no literal Suits/Donna Paulsen
  theming.** Personality lives in tone/copy/interaction
  (`INTERACTION_MODEL.md`), not visual motifs. Think premium internal ops
  tool — confident, high-contrast, well-typeset — not a themed skin.
- **Desktop and mobile mocked in parallel**, not sequenced, since the PWA
  is used across both from day one.

**Work:**
- Extract the component set already scaffolded in `apps/web` (Chat SDK's
  shipped components — see `components/ai-elements/` and `components/ui/`)
  as the base Paper designs work from — not a from-scratch design system.
- Design the app shell first (dashboard canvas + persistent chat panel,
  desktop and mobile) before individual view content — this is the
  structural piece every other mockup depends on.
- Mock up the key views named in `PRD.md` section 7, against that shell:
  - Daily dashboard (schedule, task list, goal context, client flags)
  - Chat/voice panel (typed + push-to-talk, spoken playback affordance)
  - Goals view
  - Projects & clients view
  - History/review view (planned-vs-actual)
- Design a small **escalation visual vocabulary** (light nudge / direct
  check-in / named-pattern callout, per `INTERACTION_MODEL.md`'s three
  tiers, plus the distinct derailment-mode branch) — a shared set of
  badge/banner/inline states, not one-off styling per screen. Severity
  should read visually without ever looking alarmed (composure is a hard
  rule in `INTERACTION_MODEL.md`).
- Iterate with Fred on aesthetic direction — this is the intended checkpoint
  for catching design problems before they're expensive to fix in code.

**Exit criteria:** Fred approves the app shell, the five view mockups (both
breakpoints), and the escalation visual vocabulary. Phase 1's UI work builds
to match what's approved here, not to a fresh interpretation of the PRD.

---

## Phase 1 — Core Loop

**Goal:** Fred can talk to Donna and she manages real tasks and goals.

- Wire `packages/db` into both `apps/web` and `apps/agent` (scaffolded,
  currently unused by either).
- Build `apps/web` CRUD UI for Goals/Projects/Tasks/Clients, matching the
  approved Phase 0.5 mockups. Direct DB reads/writes per `ARCHITECTURE.md`
  section 3 (no agent involvement for simple CRUD).
- Build core agent tools: `create_task`, `update_task`, `list_tasks`,
  `create_project`, `update_project_status`, `create_goal`, `update_goal`,
  `link_task_to_goal` (see `TOOLS_REGISTRY.md`).
- Build `morning_briefing` skill v1 — goals + tasks only, no calendar or
  GitHub signal yet (those arrive in Phase 2).
- Wire typed chat (no voice yet) to the agent.
- **Document ingestion (added 2026-09-22 — see `DECISIONS.md`):** build
  `stage_ingested_entities` / `commit_staged_entities` tools and the
  `ingest_document.md` skill so Fred can hand Donna raw documents/brain
  dumps and have her infer goals/projects/tasks/clients from them, plus the
  `observations` table + `log_observation`/`list_observations` tools as the
  catch-all for anything that doesn't fit the rigid schema. Default
  behavior is propose-then-confirm — Donna stages what she extracted, Fred
  reviews and approves before it commits — not silent autonomous writes.
  See `ARCHITECTURE.md` section 7 and `TOOLS_REGISTRY.md`.

**Exit criteria:** Fred can create/edit goals, projects, and tasks by hand in
the dashboard, or ask Donna to do it via chat, and get a real morning
briefing built from real data. Fred can also paste a document or brain dump
into chat and have Donna propose a set of goals/projects/tasks/clients (plus
observations for anything that doesn't fit) for Fred to review and commit.

---

## Phase 2 — Signal Integration

**Goal:** Donna is aware of the outside world — calendar, GitHub, clients —
not just the task list Fred typed in.

- Calendar connection + tools (`get_calendar_events`, `create_calendar_block`,
  `check_calendar_conflict`).
- GitHub connection + tools (`get_github_activity`, `link_repo_to_project`).
- Client tools (`create_client`, `update_client`, `log_client_interaction`,
  `check_client_risk`) and deliverable risk flagging.
- Full escalation-model check-ins (`check_in` skill, three tiers per
  `INTERACTION_MODEL.md`).
- `end_of_day_summary` skill.

**Exit criteria:** Donna's morning briefing and check-ins reference real
calendar state and real GitHub activity, not just self-reported task status.
This is also where the lightweight eval harness for tone/escalation judgment
should start (see Cross-cutting, below) — there's now real signal to test
against.

---

## Phase 3 — Self-Improvement (Postgres-only memory)

**Goal:** Donna recalibrates her own behavior from real usage history.

**Memory architecture decision (settled — see `DECISIONS.md`):** Postgres
only. No separate markdown or freeform memory store. The existing schema
(`sessions`, `tasks.estimated_minutes`/`actual_minutes`, `derailment_events`)
already models this domain relationally — self-improvement is queries over
that data, not a hand-maintained memory file. If a genuinely unstructured
memory need shows up later, add a targeted exception then; don't pre-build
a second system for a need that hasn't appeared.

- `log_session_outcome`, `get_historical_accuracy` tools.
- `weekly_review` and `self_improvement_review` skills — recalibrate time
  estimates and nudge timing/tone from real planned-vs-actual data.
- `self_improvement_review` also surfaces unreviewed `observations` (see
  Phase 1 addition, `ARCHITECTURE.md` section 7) — rows Donna logged
  because they didn't fit Goal/Project/Task/Client. This is how a real
  pattern ("Fred keeps mentioning X, maybe this needs real tracking") gets
  surfaced to Fred as a candidate schema change. Donna proposes; a human
  session still makes and logs the actual schema decision.

**Dependency:** this phase needs real session history to exist and be
meaningful. Don't start it until Phase 1/2's core loop has been in daily use
for at least a few real days — tuning against synthetic data risks tuning it
wrong (per `SKILLS_REGISTRY.md`'s existing note).

**Exit criteria:** the weekly review produces a real recalibration (e.g. "you
underestimate design tasks by ~40%, adjusting future estimates") sourced from
an actual query, inspectable in the database, not asserted by the model.

---

## Phase 4 — New Surfaces

**Goal:** Donna extends beyond typed chat — voice, push notifications, and
derailment recovery.

- Voice channel: STT → agent (full reasoning turn) → TTS, per
  `ARCHITECTURE.md` section 5.
- PWA push notifications for nudges/briefings.
- Derailment detection (PRD 4.8, v1 — activity-signal only, not
  screen-level): local activity daemon + `get_activity_signal` tool +
  `derailment_response` skill, per `ARCHITECTURE.md` section 6.

**Exit criteria:** all PRD MVP scope (section 10) is built and running.

---

## Cross-cutting (ongoing through every phase)

- **Docs stay current.** Any new tool, skill, schema change, or structural
  decision gets logged in the relevant registry/doc in the same session it's
  built, per `CLAUDE.md`'s hard rules. An undocumented tool doesn't exist for
  the next session.
- **Judgment eval harness.** Once check-ins exist (Phase 2), maintain a small
  set of scripted "day scenarios" (quiet day, missed deadline, derailment
  day, good progress) to sanity-check Donna's tone/escalation choices before
  they reach Fred for real. This tests judgment, which unit tests on tools
  don't cover.
- **Phase gates are about real usage, not just code being written.** Phase 3
  in particular cannot be meaningfully built on fake data — treat "has this
  run for real" as part of the exit criteria, not just "is the code merged."
