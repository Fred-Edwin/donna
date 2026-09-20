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

**Contains:**
- Goal list, grouped or filterable by horizon (long/short)
- Progress indicator per goal
- Linked-task references (which current tasks serve this goal)

**States:**
- Populated
- Empty (no goals set yet)

**Paper artboard:** *(not yet built)*

---

### 4. Projects & Clients View

**Purpose:** status of active projects and client commitments. Kept
separate from Goals because projects/clients are concrete deliverables with
deadlines and external parties, not aspirational targets.

**Contains:**
- Project list/board (status, linked client if any)
- Client risk flags (last-contact date, deliverable-due risk — PRD §4.4)
- Detail view for a single project or client (drill-down)

**States:**
- Populated list/board
- Project/client detail (drill-down)
- Empty (no active projects/clients yet)

**Paper artboard:** *(not yet built)*

---

### 5. History/Review View

**Purpose:** the feedback surface for the self-improvement loop (PRD §4.7).
Lowest-frequency use, most data-dense screen — shows planned-vs-actual
outcomes so Donna's recalibration is inspectable, not asserted.

**Contains:**
- List of past days/weeks
- Planned-vs-actual comparison (tasks, time estimates)
- Weekly review summary (goal progress check, recalibration notes)

**States:**
- Populated
- Empty (no history yet — early in product use)

**Paper artboard:** *(not yet built)*

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
  treatment (badge scales) is in `DESIGN_PHILOSOPHY.md` §2.
- **Derailment mode** — a distinct conversational branch (PRD §4.8), not a
  4th escalation tier. Appears inside Chat Panel and as a Dashboard
  replan-offer state.
- **Empty states** — each core view has one (noted above). Decide per-view
  whether a shared empty-state pattern works or each needs bespoke content.

---

## Open gaps — not yet scoped, need a decision

These are not in the PRD's view list at all. Flagging them here so they're
decided deliberately rather than forgotten:

- **Onboarding / first-run setup** — connecting GitHub, connecting calendar,
  entering initial goals/projects. No screen currently owns this. Open
  question: dedicated onboarding screens, or handled conversationally
  through the Chat Panel?
- **Settings** — notification preferences, connection management (GitHub/
  calendar), escalation sensitivity tuning. Not mentioned anywhere in PRD
  §7. Needs a home before Phase 4 (push notifications) if not sooner.
- **Push notification templates** — not a screen, but a real design
  artifact (lock-screen/banner appearance) needed for PRD's nudge delivery
  (§4.6, §6). Easy to forget until Phase 4.

---

## Changelog

- **2026-09-19** — Initial version, consolidating PRD §7's brief view list
  into full purpose/contents/states, and flagging onboarding/settings/
  notifications as undecided gaps.
