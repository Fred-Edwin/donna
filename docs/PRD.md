# PRD: Donna — Fred's Personal AI Assistant

**Status:** Draft v1
**Owner:** Fred
**Last updated:** September 2026

---

## 1. Overview & Vision

### The problem

Fred is a software engineer who loves building. He is not good at, and does not want to spend his limited attention on, managing his own time, projects, calendar, and goals. Without a system managing these things for him, work piles up silently, deadlines slip, and he becomes unreliable to clients — not because he lacks skill, but because nothing is actively watching the gap between what he intends to do and what he actually does.

### The mission

Donna exists to **own and protect Fred's time**. She is not a to-do list app with a chat interface bolted on — she is an active, opinionated operator who plans Fred's days, watches his progress, tells him what matters, and pushes back when he's drifting. Her job is to make sure that the only thing Fred has to think about is building. Everything else — scheduling, prioritization, tracking, follow-through, client-facing reliability — is hers.

### Character reference

Donna is modeled on Donna Paulsen (*Suits*) — not as a cosmetic personality skin, but as a functional spec. Her defining traits translate directly into product behavior:

| Trait | Product translation |
|---|---|
| Extreme proactiveness & anticipation | Surfaces problems and prepares plans *before* Fred asks |
| High emotional intelligence | Reads Fred's state (not just his task list) and adjusts tone accordingly |
| Courageous authenticity | Pushes back and calls out avoidance patterns — she is not a yes-man |
| Fierce loyalty & protection | Actively guards Fred's calendar and priorities against overcommitment and noise |
| Composure & wit | Stays steady, confident, and dryly witty — never panicked, never robotic |

Section 6 (Interaction Model) expands each of these into concrete behaviors.

---

## 2. Goals & Success Metrics

### Goals

- Fred starts every working day with a clear, realistic plan he didn't have to build himself.
- Fred is proactively pulled back on track when he drifts, before it becomes a crisis.
- Fred's long-term goals stay visible and connected to his daily work, instead of getting drowned out by daily noise.
- Fred is more reliable to clients because client-related commitments are actively tracked, not held in his head.
- Donna gets measurably better at helping Fred specifically, over time.

### Success metrics (directional, MVP)

- **Plan adherence:** % of daily planned tasks completed or consciously rescheduled (not silently dropped).
- **Overdue reduction:** trend of overdue tasks/projects over time (should trend down).
- **Check-in engagement:** Fred responds to check-ins rather than ignoring them (a leading indicator of whether nudges feel useful vs. annoying).
- **Client reliability:** no missed client commitments/deadlines that Donna had visibility into.
- **Goal alignment:** % of daily tasks traceable to an active short- or long-term goal (i.e., Fred isn't just busy, he's on-strategy).

### Explicit non-goals (MVP)

- Donna is not a multi-user product. She is built for Fred, not as a SaaS.
- Donna does not autonomously message or negotiate with Fred's clients on his behalf in MVP (she tracks and reminds; she doesn't act externally yet).
- Donna does not attempt full autonomous calendar-booking with third parties in MVP.

---

## 3. User & Usage Context

- **User:** Fred, single user, software engineer, builds client and personal projects.
- **Primary touchpoints:**
  - Morning ritual (briefing, plan generation)
  - Ad hoc check-ins throughout the day (task updates, nudges)
  - Evening summary
  - Weekly review
  - Anytime access via voice (push-to-talk) or typing, for questions, updates, or venting scope changes ("this project just got bigger")
- **Device context:** PWA, used across desktop and mobile, installed to home screen, notifications enabled.

---

## 4. Core Feature Set (MVP — all five pillars included)

### 4.1 Time Management & Daily Scheduling

Donna owns Fred's daily schedule. Each morning she generates a time-blocked plan for the day based on: active goals, task priority/urgency, calendar commitments, and realistic time estimates (refined over time via the self-improvement loop, 4.7).

- Time-blocks tasks against Fred's actual calendar (doesn't schedule over meetings).
- Reserves protected "deep work" blocks for building, since that's explicitly the time Fred wants freed up.
- Re-negotiates the schedule in real time when things slip (see 4.6).

### 4.2 Project & Task Management

- Maintains a live model of all active projects and their tasks.
- Breaks projects into actionable tasks (with Fred's input/approval, not silently).
- Flags projects that are stalling (no related activity, no GitHub commits, tasks pushed repeatedly).
- Surfaces a single prioritized task list daily rather than an overwhelming full backlog.

### 4.3 Goal Management (long-term ↔ short-term)

- Maintains explicit long-term goals (e.g., quarterly/yearly) and short-term goals (weekly/daily).
- Every daily task list is explicitly traceable back to a goal — Donna should be able to answer "why am I doing this today?" at any time.
- Weekly review (4.5) checks short-term progress against long-term goals and re-adjusts.

### 4.4 Client Management

- Tracks clients as first-class entities: active commitments, deadlines, last contact date, outstanding deliverables.
- Flags when a client hasn't been contacted in a defined window, or when a deliverable is at risk.
- Surfaces client-related items in the morning briefing when they're time-sensitive.
- MVP scope: tracking, flagging, and reminding — not autonomous client-facing communication (see non-goals).

### 4.5 GitHub-Aware Progress Tracking

- Reads Fred's GitHub activity (commits, PRs, issue activity) as a proxy signal for real progress.
- Cross-references activity against the day's/week's planned tasks — notices when planned work and actual commits diverge.
- Uses this signal in check-ins ("No commits on Project X in three days — still the priority, or did something change?") rather than relying solely on Fred's self-reported status.

### 4.6 Proactive Check-ins & Nudges

- Aggressively proactive, per Fred's preference, but designed with an **escalation model** so it doesn't feel like nagging from message one:
  1. Light, easy-to-dismiss nudge if Fred goes quiet or a task is at risk.
  2. Direct check-in with a specific question if the pattern continues.
  3. Firmer, named-pattern callout if avoidance is repeated ("This is the fourth day this has moved.").
- Check-ins pull from GitHub signal, calendar state, and task status — not just elapsed time.
- Fred can update his task list/schedule at any point; Donna reacts to those updates in later check-ins.

### 4.7 Self-Improvement Loop

- Donna is not static. She tracks planned-vs-actual outcomes (task duration estimates, completion rates, which nudges Fred actually responds to).
- A recurring self-review process (tied to the weekly ritual, section 5) adjusts her future behavior: e.g., recalibrating time estimates, adjusting nudge timing/tone based on what's worked.
- This is implemented as an explicit, inspectable process (a skill Donna runs on a schedule) — not a vague "the AI learns" claim.

### 4.8 Energy & Derailment Recovery

Fred's productivity is not flat — some days are genuinely strong, others get derailed early and the rest of the day is lost. This is not primarily a scheduling problem; it's a **recovery problem**: nothing currently interrupts the slide once a day goes off track. This feature gives Donna a distinct, lower-key mode for catching and recovering from these days, separate from her normal accountability nudges (4.6).

**MVP (v1) — activity-signal based detection:**
- Donna does not watch Fred's screen in v1. Instead, she uses lightweight, structured **activity signals** from his machine:
  - Active application / app-category (e.g., editor vs. browser vs. idle) — not screen content
  - Idle time (no input for a defined threshold)
  - Cross-referenced with GitHub activity (4.5) and calendar state
- A detectable pattern (e.g., active morning → sudden extended idle, or no commits/activity for hours against a normally active day) triggers a **different conversational branch** than a normal nudge:
  - Tone shifts from accountability ("this moved again") to a check-in ("something feel off today?")
  - If confirmed, Donna offers to immediately **replan the rest of the day**: drop to a single realistic priority, push everything else without penalty or guilt-tracking
- These derailment events are logged (day of week, time, preceding context where known, how Fred recovered) and feed into the weekly review and self-improvement loop (4.7), so Donna can eventually recognize recurring patterns (e.g., "Wednesdays tend to be harder," "post-client-call afternoons are often lost") and start proactively building lighter buffer time around them.

**v2 — deeper system-level monitoring (explicitly deferred, not MVP):**
- Fred works on Omarchy (an agent-native Linux distribution) and is comfortable with deeper monitoring, given his projects are public and not sensitive.
- v2 scope may extend to fuller activity/context monitoring beyond app-category and idle time — up to and including screen-level visibility — to give Donna a richer signal for detecting derailment and understanding work context.
- This is explicitly **not** an MVP feature. It is deferred pending clear guardrails, specifically:
  - **Explicit on/off control** — Fred can see and toggle exactly when Donna's deeper monitoring is active, rather than it running silently and always-on.
  - **Visibility/audit** — a log of when elevated access was active and what was captured, so monitoring itself is inspectable, not a black box.
  - **Least-privilege default** — even in v2, deeper access is additive to the v1 signal layer, not a replacement; Donna should use the lightest signal that answers the question before reaching for more.
  - **Revisit before any future expansion** — if this data ever feeds anything client-facing or leaves Fred's own review loop, the privacy posture needs to be reassessed at that point.

---

## 5. Daily & Weekly Rituals

### Morning briefing

- Summarizes where Fred stands on long-term and short-term goals.
- Presents the day's prioritized task list and time-blocked schedule.
- Flags any client or deadline risks.
- Closes with genuine encouragement — brief, not performative.

### Daytime check-ins

- Triggered by schedule (periodic) and by signal (task overdue, GitHub inactivity, calendar conflict).
- Escalation model per 4.6.

### End-of-day summary

- What got done vs. planned.
- What moved and why (if known).
- Brief look ahead to tomorrow.

### Weekly review

- Zooms out from daily noise to check short-term goal progress against long-term goals.
- Runs the self-improvement review (4.7).
- Surfaces any client relationships needing attention.

---

## 6. Interaction Model

### Personality, translated into behavior

- **Proactive & anticipatory:** surfaces the next day's draft plan the evening before; flags risks before Fred notices them himself.
- **Emotionally intelligent:** adapts tone to Fred's apparent state — low activity + terse responses reads differently than a normal day, and Donna should soften rather than pile on. Consistent good progress gets specific, real acknowledgment, not generic praise.
- **Courageously authentic:** allowed to challenge Fred directly on avoidance patterns rather than just logging them silently.
- **Loyal & protective:** default posture is guarding Fred's time — pushes back on adding new commitments that threaten existing priorities, rather than just recording them.
- **Composed & witty:** tone stays level and dryly confident even when the news isn't good. Never panicked, never scolding, never a generic cheerful bot voice.

### Voice vs. typing

- **Voice (push-to-talk):** primary mode for quick, conversational interaction — morning briefing playback, quick status updates, asking Donna a question hands-free. Implemented as speech-to-text → Eve agent turn → text-to-speech (not full realtime speech-to-speech), so Donna's full reasoning/tool use runs normally before she responds (see section 8 for rationale).
- **Typing:** always available, used for anything requiring precision (editing a task list in detail, pasting project notes, longer scope changes).

### Notifications & nudges

- Delivered via PWA push notifications.
- Escalation model (4.6) governs frequency/tone — avoids notification fatigue while staying "aggressively proactive" as specified.

---

## 7. Platform & UI/UX

### Decision: PWA on Next.js

- Chosen over a plain web app or native mobile app because it uniquely satisfies Fred's actual constraints: full UI/UX control, reuse of existing Next.js/PWA skills, and push notifications for proactive nudging — without the overhead of a second native codebase.
- Built on Chat SDK (Next.js-based) as the application foundation, customized entirely to Donna's own design system — not a generic chatbot skin.

### UI/UX ownership

- Fred owns the UI/UX design of Donna's interface. This PRD defines *what* she needs to show and *when*, not the visual design itself.

### Key views (functional requirements, not final design)

- **Daily dashboard:** today's schedule, task list, goal context, client flags.
- **Chat/voice interface:** conversational surface for briefings, check-ins, ad hoc questions — supports both typed and push-to-talk voice input, with spoken playback of responses.
- **Goals view:** long-term and short-term goals, with visible linkage to current tasks.
- **Projects & clients view:** status of active projects and client commitments.
- **History/review view:** past days/weeks, planned-vs-actual outcomes (feeds the self-improvement loop).

---

## 8. Technical Architecture

### Stack

| Layer | Tool | Role |
|---|---|---|
| Agent brain | **Eve** | Core of Donna — instructions, skills, tools, connections, schedules, subagents |
| Model routing | **AI Gateway** | Model-agnostic routing, fallbacks, usage/cost visibility |
| LLM plumbing | **AI SDK** | Underlies Eve; also provides speech transcription/generation primitives |
| Interface (typing) | **Chat SDK** | Next.js-based dashboard/chat foundation, persistence, auth |
| Interface (voice) | **AI Gateway Speech (STT/TTS)** as an Eve channel | Push-to-talk voice input/output |
| Delivery | **PWA** | Installable, supports push notifications for nudges |

### Why STT+TTS over realtime speech-to-speech

Donna's value is running real logic (checking goals, tasks, GitHub, calendar) before she responds. Realtime speech-to-speech models optimize for natural conversational flow, not for pausing mid-response to query data. The STT → Eve (full agent turn, tools/skills/connections included) → TTS pipeline lets Donna's full reasoning run normally; she simply speaks the result instead of Fred reading it.

### Eve building blocks mapped to Donna's features

- **`instructions.md`** — Donna's core identity and personality (section 6).
- **`skills/`** — reusable playbooks: morning briefing generation, weekly review/self-improvement, goal-to-task linkage logic, nudge escalation logic.
- **`tools/`** — typed functions: create/update task, update schedule, log client interaction, query GitHub activity, query calendar.
- **`connections/`** — GitHub, calendar (auth handled by Eve, no manual token management).
- **`schedules/`** — morning briefing trigger, periodic check-in triggers, end-of-day summary trigger, weekly review trigger.
- **`subagents/`** — candidate for a dedicated client-tracking subagent, isolated from the main planning loop.
- **`channels/`** — web/PWA chat channel, plus a voice channel (STT/TTS) added without altering the rest of Donna's brain.

### Data model (high-level sketch)

- **Goals:** id, horizon (long/short), description, status, linked tasks.
- **Projects:** id, name, client (optional), status, tasks.
- **Tasks:** id, project, goal link, priority, estimated time, actual time, status, due/scheduled date.
- **Clients:** id, name, active commitments, last contact date, deliverables, risk flags.
- **Sessions/history:** daily plans, check-in logs, end-of-day summaries — feeds the weekly review and self-improvement loop.
- **GitHub signal log:** commit/PR activity, cross-referenced against tasks/projects.

---

## 9. Data & Integrations

- **GitHub:** read access to repos/commits/PRs as a progress signal (via Eve connection).
- **Calendar:** read/write access for scheduling and conflict detection.
- **Memory:** persistent store of Fred's patterns (time estimate accuracy, response patterns to nudges, goal history) — this is what enables the self-improvement loop, not a vague "AI learns" claim.

Privacy note: GitHub and calendar access are scoped to what Donna needs (activity signals, scheduling) and this should be revisited explicitly if scope expands (e.g., before ever considering client-facing autonomous actions).

---

## 10. MVP Scope Definition

**In scope for MVP (per explicit instruction — no deferral):**
- Time management & daily scheduling (4.1)
- Project & task management (4.2)
- Goal management (4.3)
- Client management — tracking/flagging/reminding (4.4)
- GitHub-aware progress tracking (4.5)
- Proactive check-ins & nudges (4.6)
- Self-improvement loop (4.7)
- Energy & derailment recovery — activity-signal based (app-category + idle time), not screen-level (4.8)
- Morning briefing, check-ins, end-of-day summary, weekly review (section 5)
- PWA delivery with push notifications
- Voice (push-to-talk STT/TTS) and typing

**Explicitly out of scope for MVP:**
- Multi-user support
- Autonomous client-facing communication (Donna doesn't message clients directly on Fred's behalf)
- Autonomous third-party calendar negotiation/booking
- Native mobile app
- Deep system-level/screen monitoring for derailment detection (deferred to v2, pending guardrails — see 4.8)

---

## 11. Risks & Open Questions

- **Nudge fatigue:** "aggressively proactive" is a deliberate choice, but the escalation model needs real tuning against Fred's actual response patterns — this is itself part of the self-improvement loop's job.
- **iOS PWA push notifications:** iOS supports web push for installed PWAs (iOS 16.4+), but behavior/reliability should be verified against the current iOS version at build time, since nudging depends on this working consistently.
- **Data privacy/scope:** GitHub and calendar access should be scoped minimally and revisited before any future expansion toward client-facing autonomy.
- **Scope creep risk:** five pillars in MVP is ambitious for a single-person build; sequencing *within* the MVP (which pillar gets built first) will matter even though none are deferred to a v2.
- **Voice latency:** STT → Eve → TTS pipeline adds latency vs. realtime speech models; needs real-world testing to confirm it still feels conversational enough for push-to-talk use.

---

## 12. Future Roadmap (post-MVP)

- Autonomous, approved client communication (e.g., Donna drafts and sends status updates with Fred's sign-off, eventually more autonomously).
- Expanded messaging surfaces (Slack/Telegram/WhatsApp channels via Eve, reusing existing channel pattern).
- **Deeper system-level monitoring on Omarchy** (v2, see 4.8) — extending beyond app-category/idle signals toward richer context (potentially screen-level) for derailment detection, gated behind explicit on/off control and an audit log of when elevated access was active.
- Realtime speech-to-speech mode, once the tool-use-mid-conversation trade-off is better solved.
- Native mobile app, if PWA notification/reliability limits become a real constraint.