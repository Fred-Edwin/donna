# SKILLS_REGISTRY.md — Every Skill, Kept Current

A skill is a markdown playbook in `apps/agent/agent/skills/*.md`, loaded by
the model when relevant. Unlike a tool (does one thing), a skill describes
**how to reason through a situation**, usually by calling several tools in
sequence and applying judgment from `docs/INTERACTION_MODEL.md`.

**Rule for any session adding a skill:** check this table first, and check
`docs/INTERACTION_MODEL.md` before writing any tone/escalation logic — don't
re-derive it inside the skill file itself; reference it.

## Status key
- `planned` — named here, not yet built
- `built` — exists, working
- `needs review` — exists, may be stale

---

| Skill | Status | Triggered by | Tools it calls (expected) | What it does |
|---|---|---|---|---|
| `morning_briefing.md` | planned | `schedules/morning_briefing.ts`, daily | `list_tasks`, `get_calendar_events`, `check_client_risk`/logic, `create_calendar_block` | Pulls goals, tasks, calendar, client risks → produces the time-blocked plan (PRD 4.1, 5) |
| `check_in.md` | planned | `schedules/check_in.ts`, periodic | `list_tasks`, `get_github_activity`, `get_calendar_events` | Decides which escalation tier applies (PRD 4.6) using `INTERACTION_MODEL.md`'s escalation rules |
| `end_of_day_summary.md` | planned | `schedules/end_of_day.ts`, daily | `list_tasks`, `log_session_outcome` | Planned vs. actual, brief look-ahead (PRD 5) |
| `weekly_review.md` | planned | `schedules/weekly_review.ts`, weekly | `get_historical_accuracy`, `check_client_risk`/logic, goal tools | Zooms out: short-term progress vs. long-term goals; may call `self_improvement_review.md` |
| `self_improvement_review.md` | planned | called by `weekly_review.md` (not directly scheduled) | `get_historical_accuracy`, `log_session_outcome` | Recalibrates time estimates, nudge timing/tone based on what's worked (PRD 4.7) |
| `derailment_response.md` | planned | triggered by pattern detection, not a fixed schedule | `get_activity_signal`, `get_github_activity`, `list_tasks` | Distinct lower-key branch (PRD 4.8): detect pattern, shift tone, offer to replan the day |
| `client_risk_check.md` | planned (may absorb `check_client_risk` tool logic) | called by `morning_briefing.md`; possibly owned by the client subagent | client tools | Flags deliverables at risk, contact gaps (PRD 4.4) |

---

## Notes for future sessions

- `self_improvement_review.md` depends on real session history existing —
  don't build or test this meaningfully until Phase 1's core loop has run
  for at least a few real days. Building it early against fake data risks
  tuning it wrong.
- `derailment_response.md` is Phase 3 — it depends on the local activity
  daemon (see `ARCHITECTURE.md` section 6) existing first.
- If you find a skill needs tone/escalation judgment not covered by
  `INTERACTION_MODEL.md`, **add it there**, not inline in the skill file.
  Tone consistency across skills is the entire point of keeping it separate.
