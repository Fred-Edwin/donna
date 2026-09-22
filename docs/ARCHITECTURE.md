# ARCHITECTURE.md — Technical Source of Truth

This document defines *how* Donna is built. Where this document and code
disagree, this document wins — fix the code, or update this document and
log why in `DECISIONS.md`.

---

## 1. System shape

Two deployable applications in one monorepo, sharing a database and a schema
package. Not two separate repos — one Git history, one set of docs.

```
donna/
├── apps/
│   ├── web/              Next.js UI — Chat SDK + AI Elements
│   └── agent/             eve project — Donna's brain
├── packages/
│   └── db/                Shared Drizzle schema + DB client
├── docs/                  This documentation set
├── CLAUDE.md
├── package.json           Turborepo workspace root
└── turbo.json
```

### Why a monorepo

`apps/web` and `apps/agent` both need to agree on what a Task, Goal, Project,
or Client looks like. Putting the schema in `packages/db` and importing it
from both apps means there is exactly one definition of each shape. Two
separate repos would mean two copies of these types, drifting silently.

### The two apps, and how they relate

- **`apps/web`** — what Fred sees. Dashboard, goals view, projects/clients
  view, history view, and the chat/voice interface. A normal Next.js app.
- **`apps/agent`** — Donna's actual intelligence. An eve project:
  `instructions.md`, `tools/`, `skills/`, `schedules/`, `connections/`,
  `subagents/`. Deploys as its own Vercel project, exposing a session/stream
  HTTP API that `apps/web`'s chat interface talks to.

Both are separate running processes / separate Vercel deployments, but one
repo, one schema, one set of docs.

---

## 2. Data model & persistence

### Database: Postgres (Vercel Postgres / Neon)

**Decision, not a default.** Donna's core data — Goals, Projects, Tasks,
Clients, Sessions — is relational: a Task belongs to a Project, links to a
Goal, may link to a Client; Sessions reference all of the above for the
self-improvement loop. This is a relational-query problem ("all tasks linked
to this goal," "all overdue deliverables for this client"), not a
key-value/caching problem, which rules out Vercel KV as the primary store.

Chat SDK's own template ships with Postgres + Drizzle as its default chat
history store, so using Postgres for Donna's application data as well means
chat persistence and application data share one database — one less moving
part, one connection string, one migration history.

### ORM: Drizzle

Chosen because it's what Chat SDK's template already uses, and it plays well
with both a Next.js app (`apps/web`) and a plain Node/TypeScript tool file
(`apps/agent/agent/tools/*.ts`) without extra runtime overhead.

### Schema location

`packages/db/schema.ts` — the single definition of every table. Both apps
import from here. **Never redefine a table shape inline in either app.**

### Core tables (initial shape — expect this to grow; log additions in DECISIONS.md)

- **`goals`** — id, horizon (`long` | `short`), description, status,
  created_at, updated_at
- **`projects`** — id, name, client_id (nullable), status, created_at
- **`tasks`** — id, project_id, goal_id (nullable), priority, estimated_minutes,
  actual_minutes (nullable), status, scheduled_date, due_date, created_at
- **`clients`** — id, name, last_contact_date, risk_flag (boolean),
  created_at
- **`deliverables`** — id, client_id, description, due_date, status
- **`sessions`** — id, type (`morning_briefing` | `check_in` | `eod_summary`
  | `weekly_review`), date, summary_json, created_at
- **`github_activity_log`** — id, project_id, repo, commit_count, pr_count,
  window_start, window_end, fetched_at
- **`derailment_events`** — id, date, detected_at, signal_summary_json,
  fred_confirmed (boolean), recovery_action, resolved_at
- **`observations`** — id, content, source_type (`brain_dump` |
  `conversation` | `inference`), status (`new` | `reviewed` | `promoted` |
  `dismissed`), related_entity_type/related_entity_id (nullable, loose —
  not a foreign key), created_at. The catch-all for anything Donna notices
  that doesn't fit the other tables. See section 8 below and `DECISIONS.md`
  2026-09-22.

This is a first pass. Do not treat it as final or exhaustive — extend it as
real tools are built, and keep this list in sync with `schema.ts` itself.

---

## 3. Read/write boundaries

This is the rule that decides "does this go through the agent, or straight
to the database?"

- **`apps/web` reads the database directly** via `packages/db`, for all
  dashboard/goals/projects/clients/history views. No reason to route a
  read through the agent — it adds latency for no benefit.
- **`apps/web` writes directly to the database** for simple CRUD the user
  does by hand in the UI (e.g. manually editing a task's due date from the
  dashboard, adding a client by hand).
- **Writes go through the agent (`apps/agent`)** when they require
  reasoning, not just storage — e.g. "replan my day," anything that should
  trigger a skill (morning briefing, check-in, weekly review), or any write
  that should be cross-referenced against goals/calendar/GitHub before being
  committed.
- **When unsure:** if the action is "store what the user typed," it's a
  direct DB write from `apps/web`. If the action is "decide what should
  happen," it goes through the agent. Log any new pattern that doesn't
  fit cleanly into one of these in `DECISIONS.md`.

---

## 4. Connections (external services)

Eve's `connections/` folder handles OAuth/token lifecycle so tools never
touch raw credentials directly.

- **`connections/github.ts`** — read access to repos, commits, PRs. Backs
  the GitHub-aware progress tracking pillar.
- **`connections/calendar.ts`** — read/write access. Backs scheduling and
  conflict detection.

Both are scoped to what Donna needs (per the PRD's privacy note) — this
should be revisited explicitly before any future expansion (e.g. before
considering client-facing autonomous actions, per PRD section 12).

---

## 5. Voice pipeline

STT → eve (full agent turn, tools/skills/connections included) → TTS, using
AI SDK's speech primitives as a custom eve channel (`channels/voice.ts`).
Not eve's built-in Slack/Discord/web-chat channels — this is custom-built,
because a full agent turn (not a realtime speech-to-speech model) is
required so Donna's reasoning runs before she responds. See PRD section 8
for the rationale.

---

## 6. Derailment detection (4.8, v1)

The activity-signal layer (active app category, idle time) cannot be
observed by the cloud-side eve agent directly — it requires a small local
component running on Fred's machine that reports signals in. This is a
separate mini-project, not a tool living purely in `apps/agent`:

- A lightweight local daemon/script (exact implementation TBD — log the
  choice in `DECISIONS.md` once made) that periodically reports activity
  signals.
- Signals arrive via a tool call or webhook into `apps/agent`
  (`tools/get_activity_signal.ts` reads whatever was last reported, or the
  daemon pushes directly to an endpoint — decide and document when Phase 3
  starts).
- v2's deeper monitoring (screen-level, on Omarchy) is explicitly deferred;
  do not build toward it in v1's architecture in a way that assumes it's
  coming — keep the v1 signal layer self-contained.

---

## 7. Document ingestion & the observation table

Fred wants to hand Donna raw material — brain dumps, pasted documents,
notes — and have her infer Goals/Projects/Tasks/Clients from it, rather
than entering everything by hand. Two rules govern how this works:

- **Propose, then confirm — not silent autonomous writes.** Donna extracts
  candidate entities from the source text and stages them; Fred reviews and
  approves the batch before anything commits to Goal/Project/Task/Client.
  This is not a permanent restriction — it's the default until extraction
  quality is proven — but it's the MVP behavior. Reason: unstructured
  brain-dump text is exactly the input most likely to produce a hallucinated
  client or a duplicate goal under different wording, and those errors are
  expensive to clean up silently. See `DECISIONS.md` 2026-09-22.
- **Not everything fits the rigid schema, and that's fine.** When Donna
  reads a document and finds something that doesn't cleanly map to Goal/
  Project/Task/Client/Deliverable, she writes it to the `observations` table
  (section 2) rather than forcing a bad fit or dropping it. This is also
  where a self-improvement-driven realization ("I think I should be tracking
  X, which doesn't exist yet") gets logged — Donna can flag that she thinks
  a new pattern is needed, but she does not alter `packages/db/schema.ts`
  herself. A real schema change still goes through a session, gets reviewed,
  and gets logged in `DECISIONS.md`, per this project's hard rule. The
  `observations` table is the pressure-release valve that makes that
  boundary workable in practice — instead of Donna needing to either force
  everything into the existing shape or invent structure unilaterally, she
  has a bounded place to say "flagging this for Fred."

---

## 8. Deployment

- `apps/web` and `apps/agent` are each ordinary Vercel projects.
- `apps/agent`'s sandbox is Vercel Sandbox in production (swaps automatically
  from local Docker/microsandbox in dev — no code change required, per eve's
  design).
- Both apps read `packages/db` via a shared connection string (same Postgres
  instance, same environment variable across both Vercel projects).

---

## Changelog

Track major architectural shifts here with a date, or rely on
`DECISIONS.md` if the log is getting long — pick one and be consistent.

- **[date]** — Initial architecture defined (this document).
