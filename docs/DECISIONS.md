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

**Phase 0 complete — Phase 1 starting.** `packages/db` is scaffolded with
Donna's domain schema (Goals/Projects/Tasks/Clients/Deliverables/Sessions/
GithubActivityLog/DerailmentEvents) and both apps depend on it as a
workspace package. Phase 1 (core planning loop): live CRUD for Goals/
Projects/Tasks in `apps/web`, agent tools to create/query them, morning
briefing skill, typed-only chat UI wired to the agent.

---

## Log

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
