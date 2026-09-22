# TOOLS_REGISTRY.md — Every Tool, Kept Current

A tool is a single typed function in `apps/agent/agent/tools/*.ts` that the
model can call. Filename = tool name (eve convention).

**Rule for any session adding a tool:** check this table first. If something
close already exists, extend it rather than duplicating. Add your new tool
to this table in the same session you write it — an unlisted tool doesn't
exist as far as the next session is concerned.

## Status key
- `planned` — named here, not yet built
- `built` — exists, working
- `needs review` — exists, but behavior or schema may be out of date with
  this doc or with `packages/db/schema.ts`

---

## Task / Project / Goal

| Tool | Status | Input (rough) | What it does | Touches |
|---|---|---|---|---|
| `create_task` | planned | project_id, title, priority, estimated_minutes, goal_id? | Adds a task | `tasks` |
| `update_task` | planned | task_id, fields to change | Edits status/schedule/estimate | `tasks` |
| `list_tasks` | planned | filters: date, project_id, status | Query, used constantly by skills | `tasks` |
| `create_project` | planned | name, client_id? | New project | `projects` |
| `update_project_status` | planned | project_id, status | Mark stalling/active/done | `projects` |
| `create_goal` | planned | horizon, description | New long/short goal | `goals` |
| `update_goal` | planned | goal_id, fields | Edit a goal | `goals` |
| `link_task_to_goal` | planned | task_id, goal_id | Traceability requirement (PRD 4.3) | `tasks` |

## Calendar

| Tool | Status | Input (rough) | What it does | Touches |
|---|---|---|---|---|
| `get_calendar_events` | planned | date_range | Read events for planning | calendar connection |
| `create_calendar_block` | planned | start, end, title, task_id? | Write a time-block | calendar connection |
| `check_calendar_conflict` | planned | start, end | Verify before scheduling | calendar connection |

## GitHub

| Tool | Status | Input (rough) | What it does | Touches |
|---|---|---|---|---|
| `get_github_activity` | planned | repo, date_range | Commits/PRs as a progress signal | github connection, `github_activity_log` |
| `link_repo_to_project` | planned | project_id, repo | Enables cross-referencing | `projects` |

## Client

| Tool | Status | Input (rough) | What it does | Touches |
|---|---|---|---|---|
| `create_client` | planned | name | New client | `clients` |
| `update_client` | planned | client_id, fields | Edit client info | `clients` |
| `log_client_interaction` | planned | client_id, date, note? | Updates last_contact_date | `clients` |
| `check_client_risk` | planned (may fold into a skill instead) | client_id | Flags overdue deliverables/contact gaps | `clients`, `deliverables` |

## Document ingestion & observations

| Tool | Status | Input (rough) | What it does | Touches |
|---|---|---|---|---|
| `stage_ingested_entities` | planned | source_text, source_type | Reads raw text (brain dump, pasted doc), extracts candidate goals/projects/tasks/clients, and candidate observations for anything that doesn't fit those tables. Does NOT commit — returns a staged batch for Fred to review. | none (staging only, no write) |
| `commit_staged_entities` | planned | staged batch id/ids, approve/reject per item | Writes Fred-approved items from a staged batch into their real tables (or into `observations` for anything not promoted to a full entity) | `goals`, `projects`, `tasks`, `clients`, `observations` |
| `log_observation` | planned | content, source_type, related_entity_type?, related_entity_id? | Directly logs a note that doesn't fit the rigid schema — used in normal conversation, not just document ingestion (e.g. Donna notices a pattern worth flagging) | `observations` |
| `list_observations` | planned | status filter | Surfaces unreviewed/promoted observations, e.g. for a weekly review pass | `observations` |

## Self-improvement

| Tool | Status | Input (rough) | What it does | Touches |
|---|---|---|---|---|
| `log_session_outcome` | planned | session type, planned vs actual data | Records for the improvement loop | `sessions` |
| `get_historical_accuracy` | planned | metric, date_range | Pulls past estimate-vs-actual data | `sessions`, `tasks` |

## Derailment (Phase 3)

| Tool | Status | Input (rough) | What it does | Touches |
|---|---|---|---|---|
| `get_activity_signal` | planned | date/time window | Reads reported local activity signal | `derailment_events` |

---

## Notes for future sessions

- `check_client_risk` may end up as logic inside `skills/client_risk_check.md`
  rather than its own tool — decide when Phase 2 begins and update this
  table (don't leave both a tool and a skill claiming the same job).
- If a new tool's job overlaps >50% with an existing one, extend the
  existing tool's input schema rather than adding a near-duplicate.
- `stage_ingested_entities` / `commit_staged_entities` are deliberately split
  in two — extraction never writes directly. See `DECISIONS.md` 2026-09-22
  for why (unreviewed autonomous writes from unstructured text are the
  highest-risk case for hallucinated/duplicate entities). Revisit the
  propose-then-confirm default once extraction quality is proven in real
  use, but don't collapse the two tools into one without a deliberate
  decision logged here.
- `log_observation` is NOT how Donna proposes schema changes. She can flag
  that something doesn't fit and note it in `observations` — she cannot
  alter `packages/db/schema.ts` herself. A real schema change is still a
  human-session decision. See `ARCHITECTURE.md` section 7.
