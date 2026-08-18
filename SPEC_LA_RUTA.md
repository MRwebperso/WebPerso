# «La Ruta» — prototype spec v2

**Route:** `/la-ruta/` · **Status:** not built · **Supersedes:** `/la-travessa/` (v1, built, to be deleted)
**Spec revision:** v2.1 — recalibrated for Claude Opus 5 (see §0)

A gamified CV in the spirit of [rleonardi.com](http://www.rleonardi.com/), staged as a Sega
OutRun road trip, drawn in hand-inked cartoon illustration. Scroll drives a car across Europe;
each arrival cuts to the same desk where the same man works, older, with different tools and
surrounded by different landscapes.

Written in English to match the v1 brief. **Code comments stay Catalan** — repo convention,
don't break it.

---

## 0. Working agreement

The rest of this document is domain: what to build and why. This section is about how to run
it, and it exists because v2.1 is written for Opus 5 rather than for the model v1 was written
for. Every item below is here because Opus 5 behaves differently from its predecessors in a
way that costs something on a job this size.

**The spec is the whole task, on purpose.** It is given up front rather than revealed across
turns because that is where Opus 5 does its best work — a complete specification it can run
against. Read all of it before starting.

**Effort.** `xhigh` for the build; this is agentic multi-file coding, which is what that
setting is for. Leave thinking on. If cost or latency becomes a problem, step effort down
rather than disabling thinking — thinking off on this model can put a tool call into visible
text where it silently never runs, which in a long build is expensive to notice.

**Scope.** Deliver what §3–§13 ask for, at the scope they intend. Make routine judgment calls
yourself and check in only where two readings of a passage would lead to materially different
work. If something here looks wrong, say so in a sentence and carry on with it as written
rather than quietly narrowing, widening or transforming it. Finish the whole thing — a stage
that renders but has no case reader is not done. Stop short of changes clearly outside what
this asks for; §12 is the hard edge and §14 is the fence.

**Latitude.** Where this spec states a goal and not a method, the method is yours. §4 and §8
say what the result has to *read* like, not how to draw it, and that is deliberate: pinning
the method there would cost more than it buys. Where a method *is* named — the scroll engine
in §9.2, the asset contract in §8, the road algorithm in §9.1 — it is because the alternative
was tried in v1 and failed, and the reason is written down next to it.

**Verification.** Don't add verification passes, self-review steps, or a subagent to check
your own work. §13 is the bar. Hit it and say so plainly; if something doesn't hit it, say
that instead. The one place a specific technique is named is the Appendix, and that is an
environment limitation, not a process.

**Subagents.** Delegate only for genuinely independent, sizeable tracks — a wide read across
`src/components/travessa/` to inventory what survives, say. Not for work you can finish in a
handful of tool calls, and not to double-check output. One is usually enough; keep counts low.

**Talking to me.** One sentence before the first tool call saying what you're about to do.
Brief updates when you find something load-bearing or change direction — not one per file.
When a stage lands, lead with the outcome. Match the length of anything you write to disk to
what it needs: cover the substance, skip the filler sections and the summary of the summary.

---

## 1. Why v2

v1 (`/la-travessa/`) got the ambition and the engine right and the *subject* wrong. It built
the whole animation on **altitude** — a cartographic ridge with contour lines, an elevation
gauge in metres, a walker climbing from sea level to 1,800 m.

The problem is not that it was badly made. It is that altitude is not a hiring signal. No
recruiter reads a mountain profile and learns anything about whether to interview someone. The
axis was beautiful and irrelevant.

So the altitude axis goes, entirely: no metres, no contour lines, no elevation gauge, no level
curves, no ridge, and no reduced version of any of it. §11 lists the specific symbols.

What v1 proved and v2 keeps: the scroll engine (§9), the case reader, the text mode, and the
ambition level. What v1 also proved: **art generated from formulas looks like art generated
from formulas.** See §8.

---

## 2. The pitch

> You scroll. A man gets into an old Mercedes in a village in the Cévennes in 1987 and drives
> south. Road signs go past: ESPAÑA, then PORTUGAL — each border sign is a language he picks
> up. The car pulls over. Cut to a room: he is at a desk, writing by hand, and around him is
> the Alentejo. Scroll again, a newer car is back on the road heading to CATALONIA. By the
> last stage the desk is the same desk, but he is older, there are six languages on the wall,
> and he is working with an AI.

Two alternating scene types — **DRIVE** and **DESK** — for six stages, 1987 → 2026.
Travel carries **languages and territory**. Desks carry **work, tools and projects**.

---

## 3. Non-negotiables

These are the things that make it a hiring instrument rather than a toy. Where they conflict
with anything in §5–§7, they win.

1. **A recruiter who will not play must still get the CV.** A persistent, always-visible
   control switches to a complete text mode. Nothing exists only in the game.
2. **The piece is itself the portfolio.** It has to demonstrate front-end craft — smooth,
   no dependencies, no jank, keyboard-operable, works on a phone. A gamified CV that stutters
   argues against you.
3. **Everything shown is derived from real data** already in the repo (§10). No invented
   milestones, no invented projects, no fabricated skills.
4. **The live site stays untouched.** `/la-ruta/` is an isolated route with a scoped palette.
   See §12 for the file boundary and one active hazard.

---

## 4. Art direction

This is the hardest part of the brief and the part most likely to go wrong. Two references
pull in opposite directions and the resolution is not a compromise, it is a specific union.

This section states the constraints and the intent. It does not tell you how to draw, and that
is on purpose — the execution is yours.

### 4.1 The drawing style — from the reference image

The reference is a cartoon cat, upside down, in a blue coat with a leather satchel. **Take the
style, not the subject.** The character is a man (§7), never an animal.

- **Line:** black ink contour, organic and slightly wobbly. *Not* vector-perfect, *not*
  uniform-weight. The line has pressure variation and it overshoots at corners.
- **Shading:** dense parallel **hatching and cross-hatching**, following the direction of the
  form. This is the signature. No gradients, no soft shadows, no blur, no drop shadows, ever.
- **Colour:** flat fills, limited palette, deliberately **slightly off-register** from the line
  — as in cheap offset printing. Colour does not obey the outline exactly.
- **Ground:** warm cream paper, visible as the base of everything.
- **Proportions:** cartoon. Large head, large eyes with small pupils, small hands, expressive
  posture over anatomical accuracy.
- **Lineage:** European ink-and-wash press and children's-book illustration, 1960s–80s. That
  is a family to sit inside, not a specific thing to copy.

### 4.2 The arcade reference — from OutRun

Take **staging and furniture**, not pixels.

- Low horizon, road converging to a vanishing point, road stripes scrolling toward the viewer.
- Big sun on the horizon at sunset stages.
- Roadside billboards and signs popping in from the vanishing point and scaling up.
- Speed lines, a horizon that banks on curves.
- Arcade HUD furniture: stage name banners, checkpoint flashes, a progress bar shaped like a
  route map.
- Attract screen before the first scroll.

### 4.3 The union

**Draw OutRun in ink.** The road is a hatched road. The sun is a hatched disc. The palms are
inked palms. The whole canvas gets a paper-grain and hatch overlay so that even
procedurally-drawn geometry reads as printed.

**No pixel art and no pixel font.** Not because pixels are bad, but because pixel art is the
default move for "gamified CV" and it is the reason most of them look alike — and a pixel font
sitting next to hatched illustration reads as two projects glued together. The arcade
nostalgia comes from staging, palette, HUD furniture and sound instead. This is the one visual
call I'm fairly sure about, but it is still a call; §15 D3 is where to argue with it.

### 4.4 Before you build stage 1

Everything above constrains the ingredients. How ink and arcade actually resolve on screen is
still open, and it is the decision that sets the tone for all six stages.

So: propose **three distinct visual directions** for stage 1 before implementing any of them.
Each as a short block — what the horizon does, how the hatching reads at speed, what the HUD
furniture appears to be made of, and one line of why. Then I pick one and you build only that.
Don't build all three, and don't build one and describe the others.

### 4.5 Palette

Scoped to the route. `src/styles/tokens.css` belongs to the live site — read it, define these
on the page root instead.

| Role | Value | Notes |
|---|---|---|
| Paper | `#faf8f4` | reuse `--paper`, it already matches the reference ground |
| Ink | `#16171a` | reuse `--ink` |
| Orange | `~#E8703A` | the character's warmth, the sun, sunset bands |
| Blue | `~#3A5FA0` | his coat, motorway signs, night sky |
| Deep blue | `#2F4F5E` | reuse `--accent`, shadow and dusk |
| Red | `#c1272d` | reuse `--mark-rule`. Sparingly: the car, warning signs, the mark |
| Green | `~#2E7D4F` | country-entry signs only |

Per-stage the palette **shifts temperature** but never leaves this set: Portugal warm and
bleached, Barcelona high-contrast Mediterranean, Alps cold and pale, forests dark and cool,
Vallespir back to warm.

---

## 5. Structure — the stage list

Six stages. Each is `DRIVE → DESK`, except stage 1 which opens on the attract screen.
Stages map 1:1 to the six milestones in `src/data/timeline.ts`, so the count is fixed at six —
adding or removing one would break that derivation.

| # | Milestone | Year | DRIVE — road and landscape | DESK — room and work |
|---|---|---|---|---|
| 1 | `cevenes` | 1987 | *Attract screen.* Village in the Cévennes, mid-mountain. He gets into the car. | School desk. **Writing by hand.** Window: Cévennes hills. |
| 2 | `portugal` | 1996 | **France → Spain → Portugal.** Leaving French hills, across the Spanish meseta (flat, ochre, sparse), into Alentejo cork oaks, ending on the Atlantic at sunset — the OutRun money shot. | Student desk, Évora/Lisboa. **Writing, books, economics.** Window: Alentejo plain. |
| 3 | `europa` | 2006 | **The Europe montage.** *(Optional — see §15 D2.)* A drive that arrives nowhere: motorway gantries, city names flashing past, rain, night. Ends back at the same desk with more on it. | Working desk. **Computer + telephone.** Partnership files, grant paperwork. Window: a generic European city. |
| 4 | `barcelona` | 2008 | **→ Spain → Barcelona.** Iberian interior into the Mediterranean coast, palms, sea on the right. | Study desk. **Computer, thesis, research.** Window: Barcelona rooftops. |
| 5 | `pandemia` | 2020 | **→ Alps → northern forests.** Climbing, pines, snow peaks, then dark conifer forest. Cold palette, empty roads. | Remote desk. **Phone and video calls.** Field notebook, camera. Window: Alpine valley, then forest. |
| 6 | `vallespir` | 2023→ | **→ Pyrenees → Prats de Molló.** Foothills, the border post, home. | Today's desk. **AI, multi-screen, radio link.** Window: Alt Vallespir, the frontier visible. |

**The desk is the same desk.** Same shape, same angle, same framing every stage — it is the
continuity device. What changes: what is on it, what is through the window, and who is sitting
at it. A returning visitor should recognise the table instantly.

### Transitions

Arcade, explicit, cheap: as the car pulls over, a banner wipes across —
`STAGE 2 · LISBOA · 1996` — then cut to the room. On leaving a desk, `CHECKPOINT` flashes and
the car pulls out.

---

## 6. Road signs carry the languages

This is the mechanic that makes travel informative rather than decorative, and it is
**fully derived from existing data**.

`src/data/timeline.ts` gives each milestone `langs: Record<LangKey, 0 | 1 | 2>` where
`LangKey = 'fr' | 'pt' | 'ca' | 'es' | 'en' | 'de'` and the state is
`0` absent · `1` acquired · `2` working language.

**Derivation rule.** For drive *n*, diff `milestones[n-1].langs` against `milestones[n].langs`.
Every language whose state changed gets a sign on that drive:

| Transition | Sign |
|---|---|
| `0 → 1` acquired | **Green country-entry sign**, EU style — you cross a border and gain a language |
| `1 → 2` or `0 → 2` promoted to working | **Blue motorway gantry** — bigger, overhead, unmissable |

Signs approach from the vanishing point and scale up, OutRun-style. Each carries the language
name in `timeline.ts`'s own copy (`langNames`) plus the state label (`stateLabels`).

**The HUD keeps them.** Collected languages accumulate in a permanent inventory strip — six
slots, filling up across the drive. That is the gamification that actually serves HR: at any
moment the visitor can see how many languages, and at what level, without reading anything.

---

## 7. The character

An **elegant young man wearing glasses**, in the §4.1 ink style. Glasses in every stage — they
are the constant, like the desk.

**The haircut is the era marker.** It changes every stage and it is how the visitor reads time
passing without a date being shown.

| Stage | Age | Hair | Dress |
|---|---|---|---|
| 1987 | child | bowl cut | school clothes |
| 1996 | student | long, unkempt | shirt, no jacket |
| 2006 | late 20s | short, tidy | jacket |
| 2008 | 30s | short | shirtsleeves |
| 2020 | 40s | grown out, beard — pandemic hair, everyone gets the joke | knitwear |
| 2023 | 40s | neat again, shorter | jacket |

**Poses.** Keep the frame count low — this is ink illustration, not animation.

- *Driving:* head and shoulders above the car door, 3/4 from behind-right. 2 frames (idle,
  glance at a sign).
- *At the desk:* 3 poses per stage — sitting/settling, working (the stage's verb: writing /
  typing / on the phone / prompting), looking up at the viewer.
- *Getting in and out of the car:* 2 frames, reused across all stages.

That is roughly **6 driving heads + 18 desk poses + 2 shared car poses** — a budget, not a
quota. It is the real production cost of this project and it should be understood before any
code is written. If the piece works with fewer, fewer is better.

---

## 8. The asset problem

**The goal: everything on screen reads as printed, not as plotted.** That is the whole
constraint, and it is the one thing v1 failed.

v1 drew everything from formulas: sine-summed terrain, generated hatch patterns, isometric
furniture from a projection function. It was mathematically clean and it looked like a diagram,
because that is what formulas produce. A formula cannot draw a hand, a face, a coat with
weight, or a hatched shadow that follows a form. Every attempt to fake it produced something
that reads as "generated", which for a portfolio piece is worse than nothing.

What follows from that:

1. **The character, the car, the desk furniture and the roadside props are authored art.**
   Drawn by hand — by you, or commissioned — then traced or exported. If you find another way
   to get figurative art past the reading test, I'll take it; the test is the constraint, not
   the technique. What I won't take is half-good generated drawings left in as if finished.
2. **The code accepts dropped-in art from day one.** Named asset slots, a manifest, and
   placeholder art that is *obviously* placeholder — flat grey silhouettes with the slot name
   printed on them, so nothing ambiguous can survive to review.
3. **Procedural is fine for: road geometry, stripe scrolling, sky bands, sign shapes, the paper
   and hatch overlay, HUD furniture.** These are graphic, not figurative.

### Asset contract

This one is a contract, and it is fixed before anything gets drawn.

- **Format:** SVG for desk scenes and signs (crisp, clickable, small). PNG sprite sheets with
  transparency for driving sprites and the character (canvas-blitted).
- **Sprite sheets:** power-of-two, one row per pose set, uniform cell size, JSON manifest with
  `{name, x, y, w, h, anchorX, anchorY}`.
- **Resolution:** author at 2× the largest on-screen size. Character at the desk fills roughly
  1/3 of a 1280×720 frame → author at ~960 px tall.
- **Naming:** `char/<stage>/<pose>.png`, `prop/<id>.svg`, `sign/<lang>-<state>.svg`,
  `road/<stage>/<layer>.png`.
- **Loading:** per stage, lazily. Stage 1 art is the only thing in the critical path.
- **Line weight:** author at a single nominal weight and let scale do the rest — no
  hand-tuning per size.

---

## 9. Technical architecture

### 9.1 Rendering — hybrid, on purpose

| Scene | Technology | Why |
|---|---|---|
| **DRIVE** | **Canvas 2D** | Pseudo-3D road is a per-scanline loop and the stripes animate every frame. SVG DOM churn at that rate is the wrong tool. |
| **DESK** | **Inline SVG** | Static-ish, needs click targets on objects, crisp ink line, keyboard-reachable. |
| **HUD, banners, text** | **HTML/CSS** | Pixel-fixed, accessible, selectable, no coordinate mapping. |

Being able to defend "canvas for the road, SVG for the room, HTML for the interface, and here
is why" is itself a hiring signal. Say it in the page's own copy if there is a colophon.

**Road algorithm:** standard pseudo-3D projection — segment list, camera depth, per-scanline
`x` centre and width, sprites as scaled billboards sorted back-to-front. Reference
implementations: Lou's Pseudo-3D Page, jakesgordon/javascript-racer. This is well-trodden and
not worth reinventing.

**Ink overlay:** a tiled paper-grain + hatch texture over the canvas, `mix-blend-mode: multiply`
at low opacity. This is what makes procedural geometry sit in the same world as hand-drawn art.
Get it working early — it changes every other art decision.

### 9.2 The scroll engine — carry over from v1

`src/pages/la-travessa.astro` contains a scroll engine that was **numerically verified to hold
a fixed frame through a fast scroll**: pinned element top stayed at exactly 0 across 21 instant
jumps, fixed HUD drifted 0.4 px. It works; port it rather than redesigning it. The six rules
below are each there because the obvious alternative failed:

1. **Cache section geometry.** Measure `offsetTop`/`offsetHeight` once, on resize and on load.
   Per frame read only `window.scrollY` — never `getBoundingClientRect()` on a moving element,
   because that puts the paint a frame behind the composited sticky pane.
2. **Frame-rate-independent smoothing:** `current += (target - current) * (1 - Math.exp(-dt / τ))`
   with `τ ≈ 78 ms`. Not a fixed per-frame fraction.
3. **Drive the step from both rAF and the `scroll` event.** If the browser parks rAF (background
   tab, hidden pane), scroll alone keeps it moving and the large `dt` makes it snap. This is
   also what makes it testable in a hidden preview pane.
4. **`overflow-x: clip`, never `hidden`,** on `html`/`body`. `hidden` turns the root into its
   own scroll container and undermines `position: sticky`.
5. **Override `scroll-behavior: auto`** on this route — `base.css` sets `smooth` globally, which
   layers a second easing with its own clock under yours.
6. **Keyframed progress with holds.** A stage timeline of travel and hold segments, holds
   drifting slowly rather than freezing — a genuinely frozen screen across several hundred
   pixels of scroll reads as a bug, not a pause.

### 9.3 Autoplay

An **attract/autoplay button** in the HUD that scrolls the page for you at a fixed rate. Very
arcade, cheap to build, and it lets a recruiter watch the whole thing without touching
anything. Pauses on any manual scroll.

### 9.4 Sound — optional, off by default

If included: engine hum that pitches with speed, a chime per language sign, typewriter/keyboard
per desk. **Muted by default, one obvious toggle, state remembered.** Never autoplay audio.

---

## 10. Data model

### 10.1 Read-only sources — already in the repo

- **`src/data/timeline.ts`** — the six milestones (`id`, `year`, `zones`, `langs`) and their
  CA/FR copy. This is the spine of the stage list and the source of the road signs.
  ⚠️ **See §12 — another session may be editing this file. Read it, never write it.**
- **`src/content/cases/*.json`** + **`src/content.config.ts`** + **`src/data/cases.ts`** — the
  six projects: `order`, `kind`, `year`, `langs`, and per language `title`, `summary`,
  `context`, `role`, `period`, `territory`, `deliverables[]`, `chapters[3]`.
- **`src/data/case-kinds.ts`** — the five `CaseKind` values.

### 10.2 New — the stage model

One new data module, `src/data/ruta.ts`. Roughly:

```
Stage        = { id, milestoneIndex, year, placeName, drive: Drive | null, desk: Desk }
Drive        = { countries[], roadTheme, skyTheme, propSet, signs[] }   // signs derived, §6
Desk         = { room, windowScene, characterVariant, workVerb, objects[], caseIds[] }
CharacterVariant = { hair, dress, age }
```

Sketch, not a schema — shape it to what the renderer actually needs.

**Where the projects go.** Each of the six cases sits on the desk of its era as a clickable
object — `movokeur` (2013) and `grecs-oacu` (2020) on stage 5's desk, the 2023 and 2026 ones on
stage 6's. Clicking opens the case reader (§11). Cases keep their **reading order** (`order`)
in the text mode and get placed by **year** on the desks. Both, as in v1.

Stage 6's desk carries four cases and will crowd. One fix is putting some on the wall as pinned
posters rather than on the tabletop; if you find a better one, take it.

---

## 11. Reuse inventory — file by file

### Keep as-is (move and rename only)

| File | Becomes | Note |
|---|---|---|
| `src/components/travessa/TravessaList.astro` | `src/components/ruta/CvMode.astro` | The complete text mode. **A deliverable, not a fallback.** Already renders six eras with cases nested by era. |
| `src/components/travessa/CaseInset.astro` | `src/components/ruta/CaseReader.astro` | Case reader. All six panels in the DOM, toggled by `hidden`, three chapters each. Pattern is sound. |

### Keep the pattern, rewrite the body

| Source | What survives |
|---|---|
| `src/pages/la-travessa.astro` | The entire scroll engine (§9.2), the mode toggle with `localStorage` persistence, the pre-paint inline script that picks the default mode, the case-reader open/close with scroll lock and focus return (focus the **button**, not the backdrop `div` — both carry `data-inset-close`). |
| `src/data/travessa.ts` | The **keyframe timeline** shape: a stop list of travel/hold segments with eased interpolation and drifting holds. The collision-spreading logic for placing multiple items that share a year. `shortTitle()`. |
| `src/components/travessa/DeskScene.astro` | The **isometric helpers**: `iso(x, y, z)`, the two wall-plane projectors `wallZ`/`wallX`, `box()`, `trace()`. Genuinely reusable for laying out the room even if every surface is then hand-drawn. Also the accumulate-never-remove object model (`data-from` / `data-until`) — it worked and it tested clean. |
| `src/components/travessa/Stave.astro` | The three-state language vocabulary (absent / acquired / working) → becomes the HUD inventory, not a stave. |

### Delete outright

Everything altitude. `elevationAt`, `baseElevation`, the `CONTROLS` table, contour lines, form
lines, level rules, the metre gauge, the walker, `ridgeMassD`, `backdropD`, the frontier posts
as world geometry, `ZONE_LIFT`, and **`src/components/travessa/Ridge.astro`** entirely.

Once `/la-ruta/` reaches parity, **delete `src/pages/la-travessa.astro` and
`src/components/travessa/`** so the repo does not carry two prototypes.

---

## 12. Boundary and one live hazard

**The live site stays untouched.** New route, new components directory, scoped palette.

⚠️ **A parallel Claude session is working in this repository.** During v1, `src/data/timeline.ts`
and `src/components/home/TimelineFigure.astro` were both modified by another session while work
was in progress. In v1 I wrongly reverted one of them.

**Rule:** pre-existing uncommitted changes in `git status` are not yours to clean up. Read
`timeline.ts`, never write it. If a file you need has drifted, adapt to it and say so — no
`git checkout --` on anything.

**Known open item, inherited:** `/la-travessa/` is listed in `sitemap-0.xml` despite carrying
`noindex, nofollow`. `/la-ruta/` will inherit the same. Fixing it means adding a `filter` to
the sitemap integration in `astro.config.mjs` — an existing file, so ask before touching it.

---

## 13. Acceptance criteria

This is the bar. A build that misses these is not done; §0 says what to do about that.

**Performance**
- Sustained 60 fps through every drive on a 2020-class laptop, with a dev-only frame-time
  counter shipped so the number is visible.
- No frame over 32 ms during a fast scroll.
- First stage transfers under 500 KB gzipped, art included. Later stages lazy-loaded.
- Largest Contentful Paint under 2.5 s on throttled 4G.

**Anchoring** — carried over from v1, where it passed
- The fixed HUD and any pinned frame move 0 px through 20 instant scroll jumps.

**Reach**
- Zero horizontal scroll at 375 px, in both modes.
- Holds at 1280 px and at 1920 px.
- ≤ 60 rem and `prefers-reduced-motion: reduce` default to the text mode.
- With JavaScript disabled, the text mode renders complete.

**Readability**
- Text mode reachable in one click from any point in the game.
- Every fact in the game exists in the text mode. Nothing is game-only.
- Case reader is focus-trapped, `Escape` closes, focus returns to the opener.
- A recruiter can extract: six eras, six languages with levels, six projects with role and
  deliverables — in under 60 seconds, without scrolling through the game.

**Craft**
- No runtime dependencies. Astro + TypeScript + canvas + SVG only.
- `npm run check` clean. `npm run build` clean.

---

## 14. Not in v0

The fence, and it is the scope boundary §0 refers to. No CMS wiring. No OAuth. No contact form.
No changes to the live one-page. No French — but see D1, this is now a live risk rather than a
deferral. No real AI integration (the AI on the last desk is drawn, not wired). No multiplayer,
no score, no leaderboard — the arcade framing is visual, the piece is not actually a game you
can lose.

---

## 15. Open decisions

Each has a default so nothing blocks. **Take the default, note the call in one line, and keep
going** — except D1, which changes the scope of the work and is worth asking about first if you
think the default is wrong.

**D1 · Language. ⚠️ The one that actually matters — ask before diverging.**
v1 was Catalan-only, deliberately. But this piece exists to convince an **employer**, and the
employers are French and Catalan. A Catalan-only gamified CV is a smaller argument than it
should be. Copy volume is genuinely large now — stage names, sign text, HUD, banners, plus the
existing case and timeline copy which is *already bilingual in the repo*.
*Default:* build Catalan-only, but structure every new string through `src/i18n/` from the
first line so French is a data addition and not a refactor.

**D2 · Is stage 3 (2006 Europe) a drive or only a desk?**
He was based in Portugal and travelling constantly — there is no single destination. The
montage drive is more fun and arguably truer; cutting it gives five drives and a tighter piece.
*Default:* build it, mark it cuttable.

**D3 · Pixel font, yes or no?**
§4.3 argues no — the ink style is the differentiation and pixel type fights it. But a pixel
font delivers the teenage-arcade recognition instantly and unmistakably.
*Default:* no pixel font. Arcade energy from staging, palette and HUD furniture. Overrule me
if you want the immediate hit.

**D4 · Who draws the character?**
§7 needs roughly 26 authored poses and §8 says they have to survive the reading test. You,
commissioned, or a reduced scope (fewer poses, more reuse across stages)?
*Default:* build against obvious placeholders, decide in parallel.

**D5 · Name and route.**
`/la-ruta/` is the working title. Alternatives: `/outrun-1987/`, `/el-viatge/`, `/grand-tour/`.
*Default:* `/la-ruta/`, page title `LA RUTA · 1987 ▸ 2026`.

**D6 · Sound?**
*Default:* skip in v0, leave the hook in the HUD.

---

## Appendix · Repo facts for a fresh context

**Path:** `C:\Users\samsu\Claude\Projects\web-perso` · **Branch:** `main` · Windows, PowerShell
primary, Bash available.

**Stack:** Astro 5.18 · TypeScript strict · `@astrojs/vercel` · `@astrojs/sitemap`.
**No UI framework** — no React, no Vue. Keep it that way.

**Fonts:** `@fontsource-variable/newsreader` (serif — display and body),
`@fontsource-variable/ibm-plex-sans` (UI, labels, figures). Both already installed.

**Styles:** `src/styles/tokens.css` (design tokens — colour, type scale, spacing, motion),
`src/styles/base.css` (reset, layout primitives, reveal-on-scroll, view transitions).
**Both belong to the live site. Read them, scope over them, don't edit them.**

**Routing:** `trailingSlash: 'always'` — `/la-ruta` 404s, `/la-ruta/` works. Bilingual routes
live under `src/pages/ca/` and `src/pages/fr/`; the prototype sits at the root, outside i18n.

**Commands**

```bash
npm run dev
```

```bash
npm run check
```

```bash
npm run build
```

**Environment limitation, not a process.** The Browser preview pane here frequently cannot
composite frames, so screenshots come back empty. Reading state numerically via the JS tool —
transforms, bounding rects, element state — is the only channel that works, which is also why
§13's anchoring criterion is phrased as a number rather than a look. Timers are throttled when
the pane is hidden, so test scripts should be short and drive state changes from `scroll`
events rather than waiting on `setTimeout`.

**The six milestones** (`src/data/timeline.ts`, ids are stable):
`cevenes` 1987 · `portugal` 1996 · `europa` 2006 · `barcelona` 2008 · `pandemia` 2020 ·
`vallespir` 2023→

**The six cases** (`src/content/cases/`, `order` is reading order, `year` is placement):
`agencia-atractivitat` 1/2023 · `mar-i-muntanya` 2/2026 · `que-fas` 3/2026 ·
`banys-d-arles` 4/2023 · `grecs-oacu` 5/2020 · `movokeur` 6/2013
