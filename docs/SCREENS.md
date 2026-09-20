# SCREENS.md — Donna's Screen Inventory

This document is the canonical list of screens/views for Donna's UI, their
purpose, contents, and required states. It exists because `PRD.md` §7 names
the five core views only briefly ("functional requirements, not final
design") — this doc is where that gets expanded into something design work
can actually follow.

Read `DESIGN_PHILOSOPHY.md` for *how* things should look and
`INTERACTION_MODEL.md` for tone — this doc is about *what* each screen is
for and what it must contain, not its visual treatment.

When Paper mockups are built for a screen, note the Paper artboard name
next to it below so this stays a live index, not just a plan.

---

## Core views (from PRD §7)

### 1. Daily Dashboard — home screen

**Purpose:** the first thing Fred sees. Answers "what does Donna think I
should do today, and is anything at risk?" This is the screen that carries
the product's core promise — Donna already planned the day, Fred didn't
have to.

**Section vocabulary** (used consistently in design feedback and here):

| Label | Section |
|---|---|
| A | Briefing Header (part of the app shell, not this screen's own content) |
| B | Day-Shape Strip — segmented bar (deep work / meeting / open time), gradient fill per segment |
| C | Status Chip Row — plain, unboxed mark + label + count (no fill/border) |
| D | Today's Schedule — Today/Week/Month toggle; D1 = Timeline Row (deep-work rows get a blue left-border accent) |
| D2 | Tasks — task list; D2a = Task Row (checkbox + strikethrough-on-complete) |
| E | Goal Context — flush/unboxed, today's scheduled tasks grouped by linked goal |
| F | High Priority — the one bordered/accented card in the rail; surfaces the most urgent of (client risk flags OR overdue/due-today high-priority tasks), client risk wins ties |
| G | Momentum Tile — plan-adherence streak, sits in the Header Row beside B |
| H | Activity Instrument — full-width footer, split into a GitHub half and a Sleep & Meals half, each with its own stat + range toggle |
| H1 | GitHub Row — density grid (commit activity), fills its half's width |
| H2 | States Row — same grid language as H1, directly beneath it, deliberately unlabeled (self-reported personal state tracking; see `DECISIONS.md`) |
| H3 | Sleep & Meals — Sleep as a radial gauge (actual vs. target, the one round accent in this card); Meals as small unit squares (filled = logged, per target of 3/day) |

**Layout:** two-column body (Primary Column ~744px / Secondary Rail, hairline
divider between them) below a full-width Header Row (B + G), with H breaking
out to full width below both columns — not confined to the rail. See
`DECISIONS.md` 2026-09-19 entries for the reasoning behind this structure
(cards used sparingly — only F and H's internal grid cells are bordered;
everything else is flush/unboxed per Fred's steer against "cards
everywhere").

**Selection logic (not just visual — see `DECISIONS.md` for full reasoning):**
- **E** derives from today's scheduled tasks' `goalId` links, grouped per
  goal with a task count; unlinked tasks are silently excluded.
- **F** picks the single most urgent item across client risk flags and
  urgent tasks; ties go to client risk; shows a quiet "nothing urgent"
  state rather than being hidden when neither applies.
- **D** is agent-authored (the `morning_briefing` skill and its
  re-negotiation logic), not manually edited on the dashboard — Fred can
  still request changes via chat, which is also agent-mediated.

**States:**
- Populated (normal day)
- Empty (nothing planned yet — first run, or a genuinely clear day)
- Escalation overlay (a task carrying a tier-1/2/3 nudge badge — not a
  separate screen, a state of this one)

**Motion & interaction spec** (Paper is static; this is the authoritative
record until real components exist). Base timing for everything below is
120–160ms, `cubic-bezier(0.2, 0, 0, 1)`, no spring/bounce/overshoot, per
`DESIGN_PHILOSOPHY.md` §4 rule 6 — call-outs below are only the
exceptions or specifics worth naming:
- **B (Day-Shape Strip):** on data change, segments resize in place
  (width-only transition, 160ms) — no fade/refill flash.
- **D toggle (Today/Week/Month) and H toggles (30D/90D/1Y, 7D/30D):** one
  shared segmented-control pattern used everywhere on this screen — the
  active-state pill slides to its new position (140ms), never a cross-fade
  between static states. Learned once, applies identically to all three
  toggles on this screen.
- **D content swap** (Today → Week → Month): sharp horizontal slide in the
  toggle's direction (160ms) — reinforces moving along a timeline, not a
  generic content change.
- **D1 deep-work row:** on hover, the blue left-border thickens slightly
  (2px→3px) as the only hover affordance — no background fill change,
  keeps hairline discipline.
- **D2a task checkbox (the one satisfying-completion moment on this
  screen):** tap fills the checkbox instantly (no transition on the fill
  itself), strikethrough draws left-to-right over ~180ms while the label
  simultaneously fades to muted gray, then the row collapses/animates out
  after a short delay (~600ms total) rather than staying in place — a
  classic to-do-list clear, confirmed over the "stays visible, struck
  through" alternative.
- **F (High Priority):** on appearing or updating, the card slides in ~8px
  from the right — this is the one place on the dashboard where the
  system-wide escalation-appearance rule directly applies.
- **H1/H2 grid on range change:** cells cross-fade (not resize, since cell
  count changes with range), 140ms.
- **H3 sleep gauge:** the arc sweeps from 0 to the actual value on first
  load only, not on every re-render — ~400ms, eased. This is the one
  deliberate exception to the fast base timing, since it's a gauge drawing
  itself in, not a UI state changing.
- **Column divider:** no motion — called out explicitly so it isn't added
  "for consistency" later; a static structural element never needs
  animation.

**Paper artboard:** "09 — Daily Dashboard (Desktop)" — built and iterated
this session. Mobile breakpoint and the Month calendar sub-view are still
outstanding (see `BUILD_PLAN.md` Phase 0.5 exit criteria).

---

### 2. Chat/Voice Panel — conversational surface

**Purpose:** where Fred talks to Donna directly — briefings, check-ins, ad
hoc questions, scope changes ("this project just got bigger"). Persistent
side panel on desktop (~380px, dashboard stays dominant), full-screen sheet
on mobile.

**Contains:**
- Typed message thread
- Composer (text input + push-to-talk mic)
- Spoken-response playback affordance

**States:**
- Idle / empty (panel open, no conversation yet)
- Populated conversation
- Push-to-talk active/listening
- Thinking (agent turn running, between listening and speaking)
- Speaking (spoken-response playback)
- Error (mic permission denied, STT failure, network drop)

**Voice architecture — one transcript, not a separate mode:** voice and
typed messages write into the same message thread. STT output becomes a
`role: user` message; the text Donna's TTS speaks becomes a `role:
assistant` message — identical to typing, just a different input/output
modality. There is no separate "dictation mode" or parallel voice UI;
a voice turn is a transient overlay state on top of the same scrolling
conversation.

**Voice orb:** a single shared visual object (Paper: `@paper-design/
shaders-react` `MeshGradient`, Donna's blue palette; real build: likely
`orb-ui` or the same shaders-react package directly, fed by the STT/agent/
TTS pipeline's real state) represents listening, thinking, and speaking —
one object whose *motion* changes per state, not three different UI
patterns. Colors stay consistent across states per Fred's steer; only
speed differs. **Relative speed ranking, tuned directly in Paper on the
mobile artboards (11c/11d/11f/11g) and carried to desktop:** error is
fully static (no motion at all — an error isn't "live," so the orb
shouldn't read as active) < thinking (slowest active motion — a quiet,
working feel) < listening (a bit faster than thinking, but still calm —
Donna's receiving, not exerting) < speaking (fastest — the most energetic
state, since this is Donna actively communicating). This mirrors
`orb-ui`'s real state model (idle/connecting/listening/thinking/speaking/
error), so the design and the eventual implementation's state machine line
up directly. A radial-gradient glow behind the orb was tried and rejected
— at a visible-enough intensity it read as a hard blob/drop-shadow rather
than ambient light, and conflicted with the flat/hairline-only elevation
language in `DESIGN_PHILOSOPHY.md` §4; the orb stays a flat shape with no
glow treatment.

**Orb layout — floats over a dimmed transcript, not full takeover.**
Decided against a full-takeover voice layout (orb replacing the message
area entirely) because it works against the "one continuous conversation"
architecture above — full takeover would visually reintroduce the
separate-mode feeling the unified-transcript decision explicitly rejects.
The orb sits in the lower portion of the panel; recent messages stay
visible above it, dimmed (~35% opacity), so voice reads as a moment inside
the conversation, not a break from it.

**Orb interactivity:** the orb itself is tappable, not just decorative —
tapping it while listening ends the voice turn early; tapping it while
Donna is speaking stops playback and immediately transitions to listening
(this is Donna's "barge-in" behavior — since the STT → agent turn → TTS
pipeline isn't true realtime speech-to-speech, per PRD §8, there's no
mid-sentence pause-and-resume; a barge-in is "stop talking, listen now,"
not a live interruption of her reasoning). The mic button remains the
primary control for starting a turn.

**Voice turn exit:** auto-resolves, no explicit "done" control. Once
Donna finishes speaking, the orb shrinks/fades out and the transcript
scrolls back into full view on its own — both the thing Fred said (from
STT) and Donna's reply (the same text her TTS spoke) are already in the
thread as ordinary chat bubbles, since they were written to the same
conversation the whole time.

**End-of-utterance:** push-to-talk stays fully explicit — tap the mic to
start listening, tap it again to signal "I'm done," which triggers the
listening → thinking transition. No silence/VAD auto-detection in this
design; avoids cutting Fred off mid-thought or misfiring on pauses.

**Caption visibility during speaking:** visible by default, not
audio-only. The caption text stays on screen the whole time Donna talks
(not hidden-until-tapped) — useful in quiet offices, noisy environments,
or when Fred wants to scan ahead rather than wait for audio to finish.
Confirmed against a real usage scenario (Fred wants a hands-free spoken
exchange but still expects the full thing to land as ordinary chat
bubbles afterward) — caption-visible-by-default doesn't conflict with
that, since the caption is optional to read, not required.

**Paper artboard:** "12a — Chat Panel, Voice Orb Over Transcript
(Desktop)" (orb overlay pattern, listening state shown) plus dedicated
"11c — Chat Panel, Listening" / "11d — Chat Panel, Spoken Playback"
artboards (desktop + mobile) showing the orb full-panel for each state in
isolation. Thinking and error states, and the mobile orb updates, still in
progress this session.

---

### 3. Goals View

**Purpose:** long-term (quarterly/yearly) and short-term (weekly/daily)
goals, with visible linkage down to the tasks serving them. This is the
screen that answers "why am I doing this today?" — a capability the PRD
requires Donna to have at any time (§4.3).

**Architecture — Desktop Master-Detail Split Cockpit:**
On desktop (1440px), the Goals View unifies the Goals Directory and Goal
Detail into a single split-pane view divided by a dark hairline:
- **Left Column (~440px, Master):** Goals Ledger with horizon filtering
  (All / Long / Short), status marks (square/dot duality), and quick velocity
  bars. Selecting a goal highlights it and dynamically updates the right column.
- **Right Column (Flex: 1, Detail Cockpit):** Deep operating cockpit for the
  selected goal, negating the need for a separate standalone desktop detail
  page. Contains:
  1. *Header & Target Deadline:* Goal ID, full description, days remaining.
  2. *Donna's Remarks:* Dedicated AI review module with pacing assessment,
     blocker analysis, and actionable advice in Donna's authentic voice.
  3. *Tasks & Hard Deadlines:* Directly linked active/completed tasks with
     project badges, priority indicators, and explicit due dates.
  4. *Connected Projects & GitHub Signal:* Live commit stream and repo health
     linked to this goal's projects.

**Mobile Architecture:**
Because 375px cannot fit a two-column master-detail layout, mobile splits
into two dedicated screens:
1. `14 — Goals Directory (Mobile)`: Vertical master list with horizon filter.
2. `14b — Goal Detail View (Mobile)`: Full-screen cockpit opened on tap.

**States:**
- Populated Master-Detail (Desktop, artboard "13 — Goals Directory (Desktop)")
- Mobile Populated Directory (artboard "14")
- Mobile Detail Cockpit (artboard "14b")
- Universal Skeleton Loading & Error Boundaries (artboard "15")

**Paper artboards (completed this session):**
- "13 — Goals Directory (Desktop)" — Master-Detail Split Cockpit. Left 440px ledger: horizon filter (ALL/LONG/SHORT), goal rows with status marks (filled dot = active, hollow rust square = stalled, hollow square = completed), velocity bars (7-day task completion count), and the `+ DRAFT` pill button. Right cockpit: G-01 selected, showing Module 1 (header vitals: PROGRESS `74%`, TASKS CLOSED `12/18`, LINKED PROJECTS `3`, LAST ACTIVITY), Module 2 (Donna's Read with pacing signal `+3 DAYS AHEAD`, honest prose, `NO BLOCKERS / 2 TASKS UNSCHEDULED` chips), Module 3 (3 tasks by urgency + `VIEW ALL TASKS →` link + `SHOWING 3 OF 18 TASKS` count), Module 4 (linked projects + 7-day GitHub commit grids; stalled project gets rust border treatment). Right cockpit is `overflow-y: auto` — fully scrollable.
- "13b — Goal Tasks, Full List (Desktop)" — Full task workbench for a selected goal. Back-link breadcrumb to goal cockpit. Filter bar: OPEN/DONE/ALL segmented toggle, PRIORITY / PROJECT / DUE DATE dropdown filters, active filter chip (`PRIORITY: HIGH × `), SORT BY control. Task table with columns: TASK, PROJECT, PRIORITY, EST., DUE DATE (sorted, with arrow indicator), STATUS. Open tasks first (TODO, IN PROG, BLOCKED states all shown), then a `CLOSED · 12 TASKS` section divider, then completed rows (60% opacity + strikethrough). `NO DATE · UNSET` shown in rust for unscheduled tasks — surfaces Donna's "2 TASKS UNSCHEDULED" warning from the cockpit.
- "14 — Goals Directory (Mobile)" — 375px single-column list. Status bar, `Goals` heading + `+ DRAFT` pill, ALL/LONG/SHORT horizon tabs, goal rows identical in structure to desktop ledger but full-width with chevron affordance indicating tap-to-detail navigation. No persistent nav chrome — matches "06 — App Shell (Mobile, Dashboard)"'s edge-swipe-drawer-only pattern; an earlier pass had added a bottom HOME/GOALS/PROJECTS/CHAT tab bar here, which was removed on 2026-09-20 as a correction (see `DECISIONS.md`) since it contradicted the locked no-bottom-nav decision.
- "14b — Goal Detail View (Mobile)" — Full-screen cockpit on 375px. `← GOALS` back link, ID row, 18px goal headline, TARGET countdown, 3-column vitals strip (PROGRESS / TASKS / LAST ACTIVE — condensed from desktop's 4). Donna's Read module (compressed prose). Tasks with deadlines (2 shown, `VIEW ALL TASKS →` link, `SHOWING 2 OF 18`). Linked Projects section (donna-web active, donna-infra stalled with rust treatment). No persistent nav chrome (bottom tab bar removed 2026-09-20, same correction as "14").
- "15 — System States: Skeletons & Error Templates" — Reference artboard. Three skeleton patterns: goal list row, cockpit header vitals, Donna's Read module — all using `--gray-100`/`--gray-50` step fills, hairlines preserved, no shimmer. Three error patterns: inline module error ("ANALYSIS UNAVAILABLE" — Donna's Read failed, data safe, retry link), full-screen error boundary ("SOMETHING WENT WRONG" with RETRY pill + GO TO DASHBOARD secondary, error code + timestamp in mono), empty state ("NO GOALS YET" + `+ DRAFT A GOAL` CTA). All errors use graphite neutrals (`--gray-700`), never red — per `INTERACTION_MODEL.md` composure rule.

---

### 4. Projects & Clients View

**Purpose:** status of active projects and client commitments. Kept
separate from Goals because projects/clients are concrete deliverables with
deadlines and external parties, not aspirational targets.

**Architecture — Desktop Master-Detail Split Cockpit:**
On desktop (1440px), the Projects & Clients View uses the unified master-detail
split cockpit established in the Goals View:
- **Left Column (440px, Ledger):** Segmented tab toggle (`PROJECTS` / `CLIENTS`),
  filter chips, and list rows with status dots (blue = active, hollow rust = stalled,
  hollow square = completed), commit velocity bars, client tags, and weekly activity.
  At-risk client alerts are highlighted with rust indicators.
- **Right Column (Flex: 1, Operating Cockpit):** Deep contextual workbench for
  the selected project or client:
  1. *Project Cockpit (artboard "16"):* Header vitals (open tasks, closed this week,
     7d commits, open PRs, last push), GitHub 7-day commit density signal, Donna's
     Read analysis card (pacing, branch status, stale PR alerts), linked open tasks
     with priority/due-date badges, and linked Goal progress card.
  2. *Client Detail Drilldown (artboard "16b"):* Header with risk status, primary
     contact, last-contact date, next deliverable countdown; Donna's Relationship
     Health card; Deliverables milestone table; linked active/stalled projects.

**Mobile Architecture:**
Mobile (375px) adapts the view into dedicated, focused screens:
- `17 — Projects & Clients (Mobile)`: Single-column list with tab switcher,
  client risk badges, project velocity bars. No persistent nav chrome
  (edge-swipe drawer only, per the locked mobile nav decision).
- `17b — Project Detail View (Mobile)`: Full-screen project drilldown with back
  navigation, header vitals, GitHub 7d stream, Donna's Read, and linked tasks.
- `17c — Client Detail View (Mobile)`: Full-screen client relationship cockpit with
  back navigation, header vitals, Donna's Read, deliverables stack, invoices &
  contracts vault, KRA PIN tax dossier, and stakeholder touchpoint timeline.

**States:**
- Populated Project Master-Detail (Desktop, artboard "16")
- Populated Client Detail Drill-down (Desktop, artboard "16b")
- Mobile Populated Directory (artboard "17")
- Mobile Project Detail (artboard "17b")
- Mobile Client Detail (artboard "17c")
- Universal Skeletons, Errors & Empty States (artboard "18")

**Paper artboards (completed this session):**
- "16 — Projects & Clients (Desktop)" — Master-Detail split cockpit. Left ledger: `PROJECTS` / `CLIENTS` segmented switcher, project rows with status marks, client tags, and 7-day activity bars. Right cockpit: `donna-web` selected showing header vitals, 7-day GitHub commit density grid, Donna's Read AI briefing with stale PR callouts, open tasks workbench, and linked goal summary card.
- "16b — Client Detail View (Desktop)" — Dedicated client relationship cockpit for `Acme Corp` (at-risk client). Left nav rail context maintained (gradient runs full page height via `align-self: stretch`, not a fixed 960px); back breadcrumb; vitals (active projects, open deliverables, last contact 18d ago, next due Oct 1) demoted to mono/18px so they don't compete with the "Acme Corp" headline; Donna's Relationship Health card given hero weight (larger body copy, extra bottom margin) as the intended entry point; Deliverables list with risk badges; linked client projects. Flush/unboxed throughout (no per-section cards) with a **dark** (`var(--gray-900)`) vertical hairline dividing the primary column from the Legal & Tax Dossier / Stakeholders / Touchpoint Log rail, and matching dark horizontal hairlines between those three rail sections — corrected 2026-09-20 from an initial pass (built in a separate session) that used bordered white cards throughout, invented badge-pill colors, and light `--gray-200`-weight dividers; see `DECISIONS.md` for the full correction list. Artboard height is `fit-content` (1038px resolved), not clipped at a fixed 960px.
- "17 — Projects & Clients (Mobile)" — 375px single-column layout. Tab switcher, project cards with health marks, commit velocity bars, client tags, and chevron navigation affordance. No persistent nav chrome (bottom tab bar removed 2026-09-20 as a correction).
- "17b — Project Detail View (Mobile)" — 375px drilldown screen. Header vitals, GitHub 7-day activity bar, Donna's Read assessment card, and open tasks list. No persistent nav chrome (same 2026-09-20 correction).
- "17c — Client Detail View (Mobile)" — 375px mobile client cockpit. Header vitals, Donna's Read, deliverables stack, invoices & contracts vault, KRA PIN tax dossier, and stakeholder touchpoint timeline. Flush/unboxed sections (same card cleanup as "16b"); `height: fit-content` so the Primary Stakeholder section (previously clipped at a fixed 960px) is fully visible; no persistent nav chrome (bottom tab bar removed 2026-09-20).
- "18 — System States: Projects & Clients" — Reference artboard. Skeleton loading templates (project row, cockpit header, deliverable row); inline client risk alert banner; empty states for "No Projects Yet" and "No Clients Yet" with distinct CTAs; visual specification notes for risk derivation.

---

### 5. History/Review View

**Purpose:** the feedback surface for the self-improvement loop (PRD §4.7).
Answers "what did that day actually look like?" for any date, not just
recent ones — a day archive, not just a scrolling log.

**Architecture — Desktop Master-Detail Cockpit:** same pattern as Goals/
Projects. **Left Ledger (440px):** a mini month calendar (any day clickable,
not just the current week) with a dot per logged day — dot color signals
derailment (rust) vs. normal (blue) — plus a scrollable week-list below it
showing the week containing the selected day, each row's planned/actual/
variance at a glance. **Right Cockpit:** full reconstruction of the selected
day — (1) header vitals (planned/actual/variance/tasks/derailment status)
plus a single day-shape bar with an actual-finish marker tick (not two
stacked bars — see Decisions), (2) Donna's actual contemporaneous
end-of-day note (or derailment check-in note, tone shifts per
`INTERACTION_MODEL.md`) — not a synthesized weekly summary, (3) task diff
table (planned vs. actual per task, status vocabulary: DONE / DONE, OVER /
MOVED → date / DROPPED / BLOCKED), (4) GitHub activity that day, (5) sleep/
meals/state instrument row, matching the Dashboard's Card H visual language.

**Mobile Architecture:** two dedicated screens, same pattern as Goals/
Projects — a directory (calendar + week list) and a full-screen day-detail
sheet. Mobile's task table becomes stacked card rows (task name, then a
compact planned/actual/status line) rather than a 4-column table, which
doesn't fit at 375px.

**States:**
- Populated Master-Detail (Desktop, artboard "19" — routine day example)
- Derailment-day example (Desktop, artboard "19b" — same shell, Donna's tone
  shifts to concern, GitHub activity drops off, task list shows the actual
  pattern)
- Mobile Populated Directory (artboard "20")
- Mobile Day Detail (artboard "20b")

**Paper artboards (completed 2026-09-20):**
- "19 — History/Review (Desktop)" — routine day (Sep 20/"today"). Ledger:
  month calendar + week list. Cockpit: all 5 modules described above.
- "19b — History/Review, Derailment Day (Desktop)" — Sep 15 selected,
  demonstrating the derailment branch end-to-end: header shows `DERAILMENT:
  CONFIRMED`, Donna's Read module retitled "DERAILMENT CHECK-IN" with
  concern-toned copy, GitHub activity front-loaded then quiet after 11am,
  personal-state mark shows a dip.
- "20 — History Directory (Mobile)" / "20b — History Day Detail (Mobile)".

---

## App shell (built — Paper artboards 02–08)

Not one of the five core views itself, but the structural frame every view
sits inside. Built this session, locked per `DESIGN_PHILOSOPHY.md`:

- **02 — App Shell (Desktop)** — expanded nav rail, dashboard, chat closed.
- **02b — App Shell (Desktop, Rail Collapsed)** — icon-only 64px rail.
- **03 — App Shell (Desktop, Chat Open)** — 380px chat panel slid in, scrim
  over dashboard + rail.
- **04 — Chat Closed, Variations** — comparison artboard (kept for
  reference); Option B ("rail icon only, no edge element") is the one
  actually used in 02/02b.
- **05 — Header Divider, Variations** — comparison artboard (kept for
  reference); Option A ("thicker full-width line") is the one locked into
  the dashboard header.
- **06 — App Shell (Mobile, Dashboard)** — compact single-row header, no
  persistent nav chrome (nav lives in a swipe-open drawer, see 08).
- **07 — App Shell (Mobile, Chat Sheet)** — full-screen chat sheet,
  dismiss via chevron.
- **08 — App Shell (Mobile, Nav Drawer Open)** — left-edge overlay drawer,
  opens via edge-swipe only (no persistent trigger icon), scrim over
  dashboard.

**Paper artboard:** all of the above, file linked in `DESIGN_PHILOSOPHY.md`.

---

## Cross-cutting states (not separate screens)

These carry real tone/visual rules but live *inside* the views above rather
than existing as their own screen:

- **Escalation states** (nudge tiers 1–3) — appear inside the Dashboard and
  Chat Panel. Tone/escalation logic lives in `INTERACTION_MODEL.md`; visual
  treatment (badge scales) is in `DESIGN_PHILOSOPHY.md` §2. Full standalone
  reference built 2026-09-20: **"21 — Escalation Vocabulary (Reference)"** —
  all 3 tiers + derailment side by side (shape/color/copy-weight
  progression), using the file's existing `--color-nudge-*`/
  `--color-derailment` tokens for the first time. Dashboard Card F (High
  Priority) was checked against it — found using ad hoc black-border
  styling with no relation to the vocabulary; a tier-3 treatment was tried
  and then explicitly reverted per Fred's call (didn't look good in
  practice) — Card F keeps its original unbordered look. Chat Panel's
  message bubbles were redesigned same session (not escalation-specific,
  but touches the same artboard family): real left/right two-sided chat
  bubbles (both speakers filled — Fred blue, Donna warm gray — asymmetric
  rounded corners, tight same-speaker grouping) replacing the old flat
  full-width message blocks. New artboard: **"11h — Chat Panel, Populated
  Conversation (Desktop)"**.
- **Derailment mode** — a distinct conversational branch (PRD §4.8), not a
  4th escalation tier. Appears inside Chat Panel and as a Dashboard
  replan-offer state.
- **Empty states** — each core view has one (noted above). Decide per-view
  whether a shared empty-state pattern works or each needs bespoke content.

---

## Login (built 2026-09-20 — replaces Onboarding)

**Purpose:** authentication gate, decided against onboarding entirely —
single-tenant product (Fred only), so no account creation or first-run
wizard. GitHub/calendar connections happen conversationally through chat
when first needed, not a dedicated setup flow. Given the login page is also
the first thing anyone outside Fred would see (e.g. showing the product to
others), it doubles as a showcase: split layout, product screenshot +
feature copy on one side, a minimal name/password form in a bordered card
on the other.

**Paper artboards:**
- "22 — Login (Desktop)" — dark showcase panel (headline, 3 feature
  callouts, tilted/floating Dashboard screenshot) + light form panel with
  the login card.
- "22c — Login (Mobile)" — condensed dark brand/headline band, then the
  same card treatment for the form, feature callouts below.

## Push Notifications (designed 2026-09-20)

Not a screen — lock-screen/banner delivery for the PRD's nudge tiers
(§4.6, §6) so Donna can reach Fred when the app is closed. Content/tone
mirrors the Escalation Vocabulary (see below); the OS fixes the app icon
per-app, so tier distinction is carried through wording/weight only, not
icon color (an earlier draft tried per-tier icon colors — not feasible on
real iOS/Android notifications, reverted).

**Paper artboard:** "23 — Push Notifications (Reference)" — 4 lock-screen
mockups (tier 1/2/3 + derailment), matching artboard 21's copy.

## Settings — deliberately cut (2026-09-20)

Considered for connection management, escalation sensitivity tuning, and
notification preferences (per the original open-gap note below), but Fred
decided none of it needs a screen — single-tenant product, so this config
is managed directly in code/DB rather than through UI. No Paper artboard;
revisit only if a concrete need for user-facing settings UI appears later.

---

## Changelog

- **2026-09-20** — History/Review View fully designed (Phase 0.5) — the
  last of the five core views. Four artboards: "19"/"19b" (desktop
  master-detail, routine + derailment day examples), "20"/"20b" (mobile
  directory + day detail). Also this session: three hairline tokens added
  (`--hairline-main`, `--hairline-sec`, `--hairline-row`) plus
  `--border-card` and `--hairline-on-dark`, applied file-wide per Fred's
  request (scoped to existing raw-hex stragglers, not the pre-existing
  `--gray-200`/`--gray-900` usages elsewhere, which stay a separate future
  pass); Escalation Vocabulary standalone reference built ("21"); Chat
  Panel message bubbles redesigned to real two-sided bubbles ("11h"); Login
  page designed for both breakpoints ("22", "22c") replacing Onboarding,
  including a bordered form card treatment; Push notification reference
  built ("23"); Settings scope explicitly cut (no screens, code/DB only).
  See `DECISIONS.md` 2026-09-20 entries for full reasoning per item.
- **2026-09-20** — Projects & Clients View fully designed (Phase 0.5). Six artboards completed: "16" (desktop master-detail cockpit), "16b" (desktop high-density client detail view), "17" (mobile directory), "17b" (mobile project detail), "17c" (mobile client detail), "18" (skeletons, error alert, empty states). Key design decisions: (1) Master-detail split cockpit on desktop; (2) Redesigned 16b Client Detail into high-density 2-column cockpit (68% primary / 32% dossier) with KRA PIN / Tax ID, legal entity, registration number, billing address, payment terms, stakeholder directory, touchpoint log, and invoices/contracts vault; (3) Added dedicated mobile Client Detail View ("17c") matching the full desktop dossier on 375px; (4) Restrained rust color strictly to surgical risk tags (<3% surface area); (5) Backed by schema extensions for Client (`taxPin`, `legalName`, `billingAddress`, `paymentTerms`, `currency`, `primaryContactName`, `primaryContactEmail`, `primaryContactPhone`) and new `ClientDocument` table.
- **2026-09-20** — Goals View fully designed (Phase 0.5). Five artboards completed: "13" (desktop master-detail cockpit), "13b" (goal tasks full list with filters), "14" (mobile directory), "14b" (mobile detail), "15" (skeleton + error templates). Key design decisions: (1) cockpit task module shows 3 tasks max + `VIEW ALL TASKS →` to 13b, keeping cockpit as situational awareness rather than task manager; (2) no global cross-column header — master ledger heading + nav rail active state provide sufficient context; (3) right cockpit scrollable (`overflow-y: auto`); (4) `goal.targetDate` and `goal.progressPct` added to schema. See `DECISIONS.md` 2026-09-20 entry for full audit log.
- **2026-09-19** — Initial version, consolidating PRD §7's brief view list
  into full purpose/contents/states, and flagging onboarding/settings/
  notifications as undecided gaps.
