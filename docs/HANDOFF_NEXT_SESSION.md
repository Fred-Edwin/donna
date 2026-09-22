# Handoff — Phase 1, Slice B

Paste this as your opening message in the next session.

---

We're continuing work on Donna (personal AI assistant, monorepo at
`/home/fred/Projects/donna`). Read `CLAUDE.md` first — it has the reading
order and hard rules for this repo. Then read, in order:

1. `docs/DECISIONS.md` — **read the "Current phase" section and the two
   most recent 2026-09-22 log entries closely.** Phase 1 Slice A (DB
   wiring + real chat connection between `apps/web` and `apps/agent`) is
   done and confirmed working end-to-end. That log also documents several
   non-obvious fixes and decisions from that session — a migration-tracking
   collision between `packages/db` and `apps/web`'s separate Drizzle
   migrators, why the model provider is OpenRouter (not Vercel AI Gateway,
   despite what `ARCHITECTURE.md` says), and that the Chat SDK template's
   original scaffolding (artifacts system, multi-chat history, voting,
   model picker) was deliberately removed since none of it was ever part
   of Donna's actual design.
2. `docs/ARCHITECTURE.md` — technical source of truth. Note section 2 (data
   model) and section 3 (read/write boundaries) before touching any tool.
3. `docs/TOOLS_REGISTRY.md` — check this before writing any tool. Slice B's
   job is to take the `planned` entries under "Task / Project / Goal" from
   `planned` to `built`.
4. `docs/SKILLS_REGISTRY.md` — same idea for `morning_briefing.md`.
5. The plan file at `/home/fred/.claude/plans/squishy-watching-ritchie.md`
   — this is the full Phase 1 plan (all four slices, A–D) written during
   planning. Read Slice B's section specifically before starting.

## What to build this session (Slice B)

**Goal:** Fred can ask Donna (via chat) to create/edit goals, projects, and
tasks, and get a real morning briefing — not just talk, but actually read
and write the database through real tool calls.

1. Eight tools in `apps/agent/agent/tools/` (one file per tool, per eve's
   `defineTool()` convention — see `apps/agent/node_modules/eve/docs/
   tools/overview.mdx` if you haven't authored an eve tool before):
   `create-task.ts`, `update-task.ts`, `list-tasks.ts`, `create-project.ts`,
   `update-project-status.ts`, `create-goal.ts`, `update-goal.ts`,
   `link-task-to-goal.ts`. Each imports the Drizzle client directly from
   `@donna/db` (already a workspace dependency in `apps/agent`) — no `ctx.db`,
   tools just import it like normal code.
2. `apps/agent/agent/skills/morning_briefing.md` — v1 scope only: goals +
   tasks, no calendar or GitHub signal (that's Phase 2). Should call
   `list_tasks` and the goal tools, and reference `docs/INTERACTION_MODEL.md`
   for tone rather than inventing new tone rules inline.
3. Update `docs/TOOLS_REGISTRY.md` and `docs/SKILLS_REGISTRY.md` statuses
   in the same session, per `CLAUDE.md`'s hard rule — an unlisted tool
   doesn't exist as far as the next session is concerned.

**Out of scope for this slice:** no UI changes (`apps/web`'s dashboard/
goals/projects views are Slice C), no document ingestion (Slice D), no
calendar/GitHub/client-risk tooling (Phase 2).

## How to verify it works

Local dev database is already running in Docker (`donna-postgres`) —
confirm with `docker ps` before assuming you need to set it up again. Start
both apps (`cd apps/web && pnpm dev`, which auto-starts `apps/agent` via
`eve dev` through `withEve()`), open the browser, and exercise each tool
through real chat messages ("create a task called X due tomorrow," "what's
on my plate today," "give me my morning briefing"). Confirm the rows
actually land in Postgres — either a direct `docker exec donna-postgres
psql -U donna -d donna -c "..."` query, or a small script. **Do not use the
`postgres` MCP tool for this** — it's wired to an unrelated project's
database in this environment (see `DECISIONS.md`).

## Model provider note

`apps/agent/agent/agent.ts` uses OpenRouter (`deepseek/deepseek-v4.1-flash`)
via a direct `LanguageModel`, not a Gateway model string. If you add or
change the model, remember `modelContextWindowTokens` has to be set
explicitly on `defineAgent()` — omitting it makes the dev server refuse to
boot, not just warn.
