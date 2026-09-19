# CLAUDE.md — Start Here

This file is the front door for any AI agent (Claude Code or otherwise) working
in this repository. Read this first, every session, before writing any code.

## What this project is

Donna is a personal AI assistant, built for a single user (Fred), on Vercel's
agent stack (eve, AI SDK, AI Gateway, Sandbox, Workflows, Chat SDK, AI Elements).
Full product context lives in `docs/PRD.md` — read it if you need to understand
*why* a feature exists, not just *how* to build it.

## Reading order for a new session

1. **This file** — orientation.
2. **`docs/PRD.md`** — the product spec. What Donna is for, her five core
   pillars, her personality, MVP scope.
3. **`docs/ARCHITECTURE.md`** — the technical source of truth. Data model,
   persistence layer, monorepo layout, connections. Read this before writing
   any code that touches data.
4. **`docs/INTERACTION_MODEL.md`** — Donna's personality and tone rules,
   pulled out of the PRD because every skill needs it. Read this before
   writing or editing any `skills/*.md` file.
5. **`docs/TOOLS_REGISTRY.md`** — every tool that currently exists. **Check
   this before writing a new tool.** If something close already exists,
   extend or reuse it rather than duplicating.
6. **`docs/SKILLS_REGISTRY.md`** — every skill that currently exists. Same
   rule: check before writing a new one.
7. **`docs/DECISIONS.md`** — a running log of structural decisions and why
   they were made. Check this before overriding an existing pattern.

## Hard rules

- **Never invent a new data shape.** All data model types live in
  `packages/db/schema.ts`. If a task needs a field that doesn't exist yet,
  extend the schema there, in a way that doesn't break existing tools — and
  log the change in `docs/DECISIONS.md` with a one-line reason.
- **Never duplicate a tool or skill.** Search `TOOLS_REGISTRY.md` and
  `SKILLS_REGISTRY.md` first. If you build a new one, add it to the relevant
  registry in the same commit/session — an undocumented tool doesn't exist
  as far as the next session is concerned.
- **The UI (`apps/web`) reads the database directly** via `packages/db`. It
  does not need to go through the agent for reads. Writes that should trigger
  agent reasoning (e.g. "replan my day") go through the agent; simple CRUD
  the user does by hand in the dashboard can write directly to the DB via
  `packages/db`. If you're unsure which a given feature is, check
  `ARCHITECTURE.md`'s "Read/write boundaries" section before deciding, and
  log the call in `DECISIONS.md` if it's a new pattern.
- **Tone and escalation logic lives in `INTERACTION_MODEL.md`, not per-skill.**
  If a skill needs to decide how firmly to nudge Fred, it should reference
  the escalation model there rather than re-deriving its own rules.
- **Don't defer documentation.** If you build something not covered by an
  existing doc, update the doc in the same session. These docs are the
  source of truth precisely because they're kept current — an out-of-date
  doc is worse than no doc, because the next session will trust it.

## Current phase

Check `docs/DECISIONS.md` for the most recent entry — it should say which
phase (0/1/2/3, per the PRD's phase breakdown) is currently active and what's
in progress. Don't start Phase 2 work while Phase 1 tools are still unstable.
