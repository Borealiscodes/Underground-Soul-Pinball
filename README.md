> ### ✅ RELEASE v1.0.0 — BALANCED PACIFIST PINBALL & LEITMOTIF TRIBUTE VERIFIED (`3/3` PASSING)
> **Status:** `v1.0.0` Live & Verified • Zero-Float `Q16.16` • True `36 px` Flipper Drain Gap • Pacifist `ACT → MERCY → SPARE` • Filtered Felt-Piano & Music-Box Leitmotifs  
> 
> **Release Note (Nov 2026):** A mechanically balanced, zero-dependency pinball tribute to Toby Fox's *Undertale*—uniting the human story of **creating under physical and material constraint** (`docs/`) with deterministic `Q16.16` multi-zone pinball physics (`Ledger 1`) and a gentle, low-pass filtered Felt-Piano & Celeste Music-Box WebAudio synthesizer (`Ledger 2`). *(Note: The procedural 24-step WebAudio music-box arrangements are intentionally minimal and softly looping rather than a full multi-minute score.)*

# ❤️ Underground Soul Pinball — Determination Under Constraint & Pacifist Pinball Tribute

**An interactive, zero-dependency pinball tribute to *Undertale* and Toby Fox—honoring how solo development, chronic wrist pain, and creative limitation gave rise to one of indie gaming's most compassionate stories, translated into a balanced `Q16.16` Pacifist pinball machine where you spare guardians instead of destroying them.**

[![License: MIT](https://shields.io)](LICENSE)
[![Status: v1.0.0 Verified](https://shields.io)](#-quickstart--verification)
[![Physics: Balanced Q16.16 Table](https://shields.io)](#-technical-craft-balanced-multi-zone-pinball-physics-ledger-1)
[![Audio: Filtered Music-Box Leitmotifs](https://shields.io)](#-four-underground-realms--gentle-soul-leitmotifs-ledger-2)

---

## 📖 Companion Essay & Explainer Tile

* **Human & Historical Essay (APA 7th Ed.):** [`docs/undertale-creation-adversity-and-creative-outlet.md`](docs/undertale-creation-adversity-and-creative-outlet.md) — *Determination Under Constraint: The Making of Undertale, Creative Adversity, and Art as a Restorative Outlet*.
* **Plain-Language Explainer Tile:** [`tiles/bill-nye-undertale-pinball-explainer.md`](tiles/bill-nye-undertale-pinball-explainer.md) — Altitude `A7` plain-language walkthrough of leitmotif economy, low-pass filtering, and skill-based flipper gaps.

---

## 🌱 The Human Element: Creation as an Outlet Under Adversity

Before *Undertale* reached millions of players in September 2015, it began as a scrappy, largely solo project built in GameMaker: Studio while Toby Fox lived in *Homestuck* creator Andrew Hussie's basement—backed by a modest June 2013 Kickstarter campaign (`$51,124` raised on a `$5,000` goal). Throughout *Undertale* and *Deltarune*, Fox also spoke openly about severe **chronic wrist and hand pain (repetitive strain injury)** that restricted marathon typing and piano sessions, requiring voice-to-text tools and compact compositional workflows.

That lived constraint shaped two defining human triumphs at the heart of this tribute:
1. **The Emotional Economy of the Leitmotif:** Rather than writing 100 unrelated tracks, a single 6-note melody transforms across changing tempos and harmonies—turning limitation into memory, continuity, and warmth.
2. **Agency & Kindness in a Bounded World:** When physical pain or external pressure narrows everyday life, a small, self-contained digital canvas becomes a restorative outlet where rules are transparent and empathy (`ACT → MERCY → SPARE`) is rewarded over force.

---

## 🛠️ Technical Craft: Balanced Multi-Zone Pinball Physics (`Ledger 1`)

Designed as a direct engineering upgrade over our earlier campy pinball specimen ([`Moulin-Rouge-8Bit-Pinball`](https://github.com)), `Underground-Soul-Pinball` implements true arcade table geometry on a `480 × 620 px` playfield in signed 32-bit `Q16.16` integer math:

* **Skill-Based Flipper Gap (`36 px` Gap vs. `18 px` SOUL Orb):** Left Flipper (`x = 134 → 202`) and Right Flipper (`x = 306 → 238`) leave an exact **`36 px` center drain gap** (\(2.0\times\) the `18 px` crimson SOUL diameter). Mistimed flips drain down the center, while crisp timing lets you aim left-orbit, center-guardian, or right-target shots.
* **Return Inlanes, Drain Outlanes & `12 s` Ball Save:** Dedicated **Left & Right Return Inlanes** funnel the SOUL smoothly onto your flippers, flanked by risky **Outer Drain Outlanes** protected by an automatic **`12-second` Ball Save** on every plunger launch.
* **Cooldown-Damped Slingshot Kickers:** Triangular **Snowdin Slingshots** include a `35-tick` per-side cooldown so rebounds feed cleanly down to the flippers without infinite horizontal ping-pong loops.
* **Pacifist `ACT → MERCY → SPARE` Loop:** Hitting the **`[A]` `[C]` `[T]`** drop targets (`+25%` Mercy each) and the **Waterfall Orbit Loop** (`+25%` Mercy) fills the **Mercy Meter to `100%`**, turning the central Guardian Bumper golden so you can **SPARE** each encounter and advance the story.

---

## 🎹 Four Underground Realms & Gentle SOUL Leitmotifs (`Ledger 2`)

Every track uses pure `sine` + `triangle` oscillators routed through a warm **`580 Hz – 860 Hz` low-pass `BiquadFilterNode`**—transforming the same 6-note **SOUL Leitmotif (`F4 – C5 – B♭4 – A4 – G4 – F4`)** at a slow, unhurried **`58–68 BPM`** lullaby pace:

| Realm & Narrative Beat | Encounter & Pacifist Objective | Gentle Leitmotif Track (`Ledger 2`) |
| :--- | :--- | :--- |
| **Act I: The Ruins**<br>*(Hearth & Butterscotch Lanes)* | Fill Mercy (`[A]` `[C]` `[T]` + Orbit) to `100%` and **SPARE** the *Caretaker of the Ruins*. | **Track 1 — *Ruins Hearth Lullaby* (`~58 BPM` Waltz):** Tender celeste music-box melody over warm felt-piano chords. |
| **Act II: Snowdin Forest**<br>*(Skeletal Slingshots & Lanterns)* | Bank slingshot rebounds into `[A]` `[C]` `[T]` targets and **SPARE** the *Sentry Brothers*. | **Track 2 — *Snowdin Lantern Waltz* (`~66 BPM`):** Gentle music-box counterpoint with soft triangle pizzicato bass. |
| **Act III: Waterfall & Echo Flowers**<br>*(Wishing Cavern)* | Earn **`2×` Mercy/Score** bonuses and **SPARE** the *Captain of the Guard*. | **Track 3 — *Echo Flower Reflection* (`~52 BPM`):** Spacious, reflective music-box arpeggios echoing the SOUL theme. |
| **Act IV: The Barrier & True Pacifist Finale**<br>*(SOUL Resonance)* | **SPARE** the *Dreamer at the Barrier* to shatter the Barrier and mint a **`SHA-256` SAVE Receipt**. | **Track 4 — *SOUL Resonance (True Pacifist Reprise)* (`~61 BPM`):** Full-voiced felt-piano & celeste reprise of the 6-note SOUL leitmotif. |

---

## 📁 Repository Structure

```text
Underground-Soul-Pinball/
├── index.html                                    # Underground pinball cabinet, ACT/MERCY HUD & touch flippers
├── style.css                                     # Undertale-inspired obsidian, crisp white border, SAVE gold & SOUL red
├── package.json                                  # Zero-dependency ESM manifest (`npm test` -> `node --test`)
├── LICENSE                                       # MIT License
├── README.md                                     # Human story, balanced pinball physics & leitmotif overview
├── docs/
│   └── undertale-creation-adversity-and-creative-outlet.md  # Essay on Undertale's creation under adversity & creative resilience
├── tiles/
│   └── bill-nye-undertale-pinball-explainer.md   # Altitude A7 plain-language explainer of leitmotifs, filters & flipper gaps
├── src/
│   ├── core.js                                   # Zero-float Q16.16 fixed-point math & synchronous SHA-256 SAVE receipt
│   ├── underground-acts-data.js                  # 4 Underground Realms, guardian encounters, Mercy rules & track metadata
│   ├── soul-pinball-kernel.js                    # Balanced Q16.16 physics: 36px flipper gap, slingshots, inlanes, ACT targets
│   ├── gentle-musicbox-audio.js                  # Low-pass filtered Felt-Piano & Music-Box WebAudio synth (4 Tracks)
│   ├── underground-renderer.js                   # Crisp Undertale-styled table: SOUL heart ball, ACT targets & SAVE stars
│   └── soul-pinball-app.js                       # 60 Hz physics loop, Left/Right flipper controls, Ball Save & Jukebox
└── test/
    └── soul-pinball-kernel.test.mjs              # Built-in `node --test` suite verifying 36px drain gap, ACT->SPARE & SHA-256
```

---

## 🚀 Quickstart & Verification

```bash
# 1. Run deterministic 36px drain gap, ACT->SPARE & SHA-256 receipt tests (3/3 passing)
node --test test/soul-pinball-kernel.test.mjs

# 2. Launch locally over IPv4 in browser
python3 -m http.server 8085 --bind 127.0.0.1
```

Open **`http://127.0.0.1:8085`**, tap **`Sound: Muted`** for the gentle felt-piano & music-box SOUL leitmotif, fire the plunger (`✦ PLUNGER` or `Spacebar`), flip with `A` / `D` or the touch buttons, light **`[A]` `[C]` `[T]`** to reach `100%` Mercy, and **SPARE** every guardian.

---

## 🤝 Provenance & License

* **Tribute & Lineage:** Created as an affectionate, non-commercial fan tribute to Toby Fox's *Undertale* (2015) and built on the deterministic `Q16.16` substrate from [`Borealiscodes/ndh-game-dev-kit`](https://github.com).
* **Author & License:** Borealis Serenity Hedling (`NDH-RESEARCH-PILOT` • County Dublin, Ireland) • MIT License • `Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>`.
