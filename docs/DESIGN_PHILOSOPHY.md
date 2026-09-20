# DESIGN_PHILOSOPHY.md — Donna's Visual Design System

This document is the settled source of truth for Donna's visual design —
tokens, component styling rules, and structural app-shell decisions. It
exists alongside `BUILD_PLAN.md` (Phase 0.5) and covers the *design*
counterpart to what `INTERACTION_MODEL.md` covers for tone/voice.

Where this document and the live Paper file disagree, treat this document
as the settled baseline and the Paper file as the current working state —
reconcile and update whichever is stale.

**Paper file:** [Donna — Design System & Screens](https://app.paper.design/file/01M2W00FQT3Z6NT7265YJRVWTZ)
— currently holds: "00 — Foundations" (tokens), "01 — Components" (buttons,
badges, cards, inputs), and the app shell (desktop + mobile) — see
`docs/SCREENS.md` for the full artboard list. The five core views (Daily
Dashboard content, Chat/Voice Panel content, Goals, Projects & Clients,
History/Review) and the escalation visual vocabulary are not yet built.

---

## 1. Core mood

**"Architectural drafting," expressed as discipline, not costume.**

The direction is not literal blueprint decoration — no crop marks, no
cyan-on-navy, no ruler/grid motifs applied as surface texture. It borrows
*behaviors* from technical drawing and from Vercel's Geist design system:
precision itself is the aesthetic. A well-drafted technical drawing is
beautiful because every line is load-bearing, not because it has ornamental
flourishes — every visual choice in Donna should meet that same bar.

This mood was arrived at after two false starts, worth naming so they aren't
repeated:
- An early pass leaned on Vessel/Evil-Rabbit-style "premium studio" instinct
  in the abstract, without grounding it in what those references actually
  do. Corrected by researching Geist's real principles (restrained
  typography, a real neutral scale, single-accent semantic color) instead of
  reasoning from vibes.
- A literal "blueprint costume" pass (torn-paper diagonals, rulers, mixed
  grids, grain-gradient shaders as background texture) was explored in real
  depth and produced genuinely interesting pieces, but was rolled back —
  see §5.

## 2. Color system

- **A real 10-step neutral scale**, not a handful of arbitrary grays:
  `--gray-50` (warm off-white ground, `#F7F5F0`) through `--gray-900`
  (graphite ink, `#171613`). Each step is tied to a UI role (surface,
  border, muted text, body text, high-contrast text), not picked ad hoc.
- **One accent family, not two competing options.** Early in this process
  two candidate blues ("plotter blue" vs. "ink blue") were treated as a
  choice — the correct resolution was recognizing they're two *steps* of one
  scale, not two options: `--blue-100` through `--blue-900`.
  - `--blue-500` (`#2851FF`) — the one "loud" primary-interactive moment per
    screen (buttons, links, active states).
  - `--blue-700` — pressed/active states.
  - `--blue-800` (`#14265E`) — quiet ink-accent for dense/inline contexts
    (chat bubbles, inline references) where 500 would be too loud.
  - `--blue-900` — max-contrast text-on-light / reversed-color moments.
  - Rule of thumb: one accent family, multiple jobs — never introduce a
    second hue family to solve a "needs to be quieter" problem.
- **Escalation states are real scales, not flat badges.** Each nudge tier
  (light / direct / callout) and derailment mode has its own small
  bg/border/text scale (`--rust-*`, `--red-*`), not a single flat color
  swatch — so badges have proper depth and legible contrast at every step.
- **Derailment is deliberately off the escalation ramp.** It uses the blue
  family, not a hotter rust/red, because `INTERACTION_MODEL.md` treats
  derailment as a different conversational branch (concern, not
  accountability) — the color needs to say that at a glance, not read as
  "tier 4."

## 3. Typography

- **Geist Sans** for content and headings; **Geist Mono elevated to a real
  structural role** — timestamps, IDs, counts, status labels are always set
  in mono, treated as technical annotation, never just "the code font."
- **Real negative letter-spacing at display sizes**
  (`--tracking-display: -0.045em`, `--tracking-heading: -0.03em`) so
  headlines feel compressed and engineered, not default browser tracking.
- Numeric/ID material (durations, dates, counts) should read as tabular and
  slightly muted relative to the label next to it — precision-as-texture,
  borrowed directly from Geist's own typographic discipline.

## 3.5. Gradient surface tokens

Paper's token system has no `gradient` type (color tokens there must be a
literal flat color) — so gradients can't be first-class Paper tokens the way
`--blue-500` can. They're documented here instead, as the real source of
truth, and applied as literal inline values on Paper nodes and as CSS custom
properties in code.

- **`--gradient-surface-dark`** — vertical (180deg), oklab interpolation,
  holds flat near-black-navy through the first ~57% before lightening to a
  lighter navy at the base:
  ```css
  --gradient-surface-dark: linear-gradient(
    in oklab 180deg,
    oklab(16.2% -0.012 -0.065) 0%,
    oklab(16.2% -0.012 -0.065) 57.27%,
    oklab(29.7% -0.005 -0.070) 100%
  );
  ```
  Current use: nav rail background (desktop + mobile), replacing a flat
  `--gray-900` fill. Named by *what it is* (a dark gradient surface
  treatment), not by its current single use, so it can be reused for other
  dark-surface moments (a modal, a dark card) without renaming.
  - **Active nav item on this surface:** `rgba(255,255,255,0.10)` fill +
    `2px solid var(--blue-500)` left border + `--gray-50` icon/text (not
    `--gray-800`, which doesn't contrast against this gradient).
  - **Avatar/accent circles on this surface:** brightened to
    `linear-gradient(in oklab 135deg, var(--blue-300) 0%, var(--blue-500) 100%)`
    (not `--blue-700 → --blue-900`, which blends into the dark rail).
  - **Implementation note:** when porting to `apps/web/app/globals.css`,
    add `--gradient-surface-dark` as a real custom property (not inside
    `@theme inline`, since Tailwind's theme mapping expects flat values) and
    reference it directly, e.g. `background-image: var(--gradient-surface-dark);`
    on the sidebar's dark variant.

## 4. Six component styling rules

These are locked and apply to every component and screen going forward.

1. **Hairline borders as primary structure.** Elevation is communicated
   mostly through 1px hairline borders and background-value steps, not soft
   blurred drop-shadows. A hard, zero-blur offset shadow
   (`--shadow-offset: 4px`) is reserved *only* for truly floating elements
   (modals, an open panel) — never for ordinary cards. Three elevation
   levels, used with intent: flush (no border) → bordered (normal surface)
   → floating (hard offset shadow). Which level a component sits at should
   mean something (e.g. today's active task vs. a muted future task), not
   be decorative.
2. **Asymmetric internal structure.** A small mono label sits tight to a
   card's top-left corner (like a drawing's title block: `PROJ-014 · ACME
   CORP`), with the primary content given more breathing room below it —
   not centered, evenly-padded content on all sides.
3. **Recurring signature mark: square/dot duality.** A small square =
   static/default status, a filled circle = active/live status, a hollow
   square = complete/done. This is the same logic behind pairing sharp
   rectilinear containers with exactly one fully-round accent element
   (the primary CTA button, a status dot) — sharp structure vs. one
   deliberate round accent, repeated at every scale from buttons down to
   the smallest status indicator. Never introduce a third geometric
   language (e.g. tick marks) alongside this pairing.
4. **Numeric material treatment.** Every timestamp, ID, duration, or count
   renders in Geist Mono, slightly muted in color relative to its label,
   never in default proportional Geist Sans.
5. **Elevation used with intent** (see rule 1) — restated because it's the
   rule most likely to be skipped under time pressure.
6. **Sharp, mechanical motion.** Duration 120–160ms, easing
   `cubic-bezier(0.2, 0, 0, 1)` — no spring bounce, no overshoot. Signature
   moments are documented as specific interaction rules, not generic fades:
   - Task complete: status mark snaps to hollow square, no scale-bounce.
   - Escalation tier appearing: hairline card slides in ~8px, no
     fade-and-scale.
   - Chat panel opening: hard-edged slide from the right, matching the
     offset-shadow language — not an ease-out fade.

## 5. Structural app-shell decisions

Settled earlier in the design process, independent of the visual system
above — these are layout/IA decisions, not styling:

- **Dashboard is home**, not chat. The landing view is the daily
  briefing/schedule/task list; chat is a secondary, always-reachable
  surface, not the front door. Reinforces "she already planned your day,"
  not "here's a chatbot with tabs."
- **Chat is a persistent side panel** (~380px, narrow utility width, not an
  even 50/50 split) on desktop — dashboard stays the dominant visual
  surface. On mobile, chat becomes a full-screen sheet (no room for a
  persistent side panel at phone width).
- **Visual identity is sharp/editorial, not literally Suits/Donna-Paulsen
  themed.** Personality lives in tone and copy per `INTERACTION_MODEL.md`,
  not in visual motifs referencing the show.
- **Desktop and mobile are designed in parallel**, not sequenced — the PWA
  is used across both from day one, per the PRD.

## 6. What we explicitly rolled back (not part of the settled baseline)

A significant background/texture exploration happened and produced real,
usable techniques — but was rolled back to reconsider from the clean
Foundations + Components baseline. Do not treat any of the following as
settled or reintroduce it without a fresh decision:

- Torn-paper diagonal planes, faceted diagonal dividers, ruler edges, mixed
  solid/dashed grid tiles, and Paper's native `GrainGradient`/`MeshGradient`
  shader components — all explored as *empty-state / low-content-only*
  background treatments, never intended to sit behind populated, data-dense
  screens.
- Key working lesson if this is revisited: build background elements as
  **native Paper primitives** (Frame/Rectangle, or Paper's built-in shader
  components) that can be selected, dragged, and resized directly in Paper
  — not as hand-written inline SVG with manually-computed coordinates.
  Hand-computed SVG geometry (line intersections, clip-path polygons,
  rotation angles) was slow, error-prone, and not editable by hand, and
  should be avoided in favor of Paper's own primitive/shader tooling.
- Also learned: `var(--token)` references do not resolve correctly inside
  raw SVG `stop-color`/gradient contexts in Paper's current engine — use
  literal hex values in any hand-written SVG gradient work.
- If revisited, decide *first* whether background texture is needed at all
  for populated screens, or should stay reserved strictly for empty/
  low-content states, before building anything.

---

## Changelog

- **2026-09-19** — Initial version, written after Foundations + Components
  were locked and the background-exploration artboards were rolled back.
- **2026-09-19** — Added §3.5 (gradient surface tokens) after the nav rail
  moved from a flat `--gray-900` fill to a dark navy gradient
  (`--gradient-surface-dark`), with adjusted active-state and accent colors
  to contrast against it. Documented here since Paper's token system has no
  gradient type — this doc is the real source of truth for the exact value.
