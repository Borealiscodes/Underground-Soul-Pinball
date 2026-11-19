> ### 🏗️ UNDER CONSTRUCTION — UNDERTALE-INSPIRED PACIFIST PINBALL & LEITMOTIF MUSIC-BOX STUDIO (PRE-ALPHA)
> **Status:** Active Architectural Scaffolding & Balanced Pinball Physics Prototyping • Zero-Float `Q16.16` • Zero Dependencies  
> 
> **Project Scope:** A heartwarming, mechanically well-balanced tribute to Toby Fox's *Undertale*—combining authentic multi-zone pinball table geometry (`Ledger 1`), Pacifist **`ACT → MERCY → SPARE`** encounter mechanics, crisp monochrome-and-gold Underground aesthetics, and a warm, low-pass filtered **Felt-Piano & Celeste Music-Box WebAudio synthesizer** (`Ledger 2`) built around a shared 6-note SOUL leitmotif.

# ❤️ Underground Soul Pinball — Balanced Pacifist Pinball & Gentle Leitmotif Tribute

**An interactive, zero-dependency pinball machine inspired by *Undertale*'s Pacifist Route and Toby Fox's leitmotif-driven music—guide a crimson SOUL orb across four Underground realms, hit `A – C – T` drop targets and slingshots to fill the Mercy Meter (`0% → 100%`), SPARE each guardian, and listen to four gentle felt-piano and music-box arrangements woven from a single 6-note SOUL theme.**

[![License: MIT](https://shields.io)](LICENSE)
[![Status: Pre-Alpha Scaffolding](https://shields.io)](#-build-roadmap-v01--v10)
[![Physics: Balanced Q16.16 Table](https://shields.io)](#-balanced-multi-zone-pinball-engineering)
[![Audio: Filtered Music-Box Leitmotifs](https://shields.io)](#-gentle-felt-piano--music-box-soundtrack-ledger-2)

---

## 🛠️ Balanced Multi-Zone Pinball Engineering (`Ledger 1`)

Learned directly from the lessons of our earlier campy pinball specimen ([`Moulin-Rouge-8Bit-Pinball`](https://github.com)), `Underground-Soul-Pinball` implements **true arcade pinball geometry** on a `480 × 620 px` playfield:

* **Skill-Based Flipper Gap (`36 px` Gap vs. `18 px` SOUL Orb):** The Left Flipper (`x = 148 → 222`) and Right Flipper (`x = 332 → 258`) leave an exact **`36 px` center gap** (\(2.0\times\) the `18 px` SOUL diameter). Mistimed flips genuinely drain down the center, while crisp timing lets you aim left-orbit, center-encounter, or right-target shots.
* **Inlanes, Outlanes & `12 s` Ball Save:** Dedicated **Left & Right Return Inlanes** feed the SOUL smoothly onto your flippers, flanked by risky **Outer Drain Outlanes** protected by an automatic **`12-second` Ball Save** after every plunger launch.
* **Triangular Slingshot Kickers:** Angled rebound kickers just above each flipper snap the SOUL briskly across the lower playfield.
* **Pacifist `A – C – T` Drop Targets & `SPARE` Encounter Bumper:** Striking the three **`A – C – T`** drop targets (`+25%` Mercy each) and the **Waterfall Orbit Loop** (`+25%` Mercy) fills the encounter's **Mercy Gauge to `100%`**, turning the central Guardian Bumper golden so you can **SPARE** the encounter and advance the story!

---

## 🎹 Gentle Felt-Piano & Music-Box Soundtrack (`Ledger 2`)

In tribute to Toby Fox's signature compositional craft, **all four tracks transform a single 6-note "SOUL Leitmotif" (`F4 – C5 – B♭4 – A4 – G4 – F4`)**—using pure `sine` + `triangle` oscillators routed through a warm **`1,050 Hz` low-pass `BiquadFilterNode`** (zero harsh unfiltered square waves!):

| Realm & Narrative Beat | Encounter & Pacifist Objective | Gentle Leitmotif Track (`Ledger 2`) |
| :--- | :--- | :--- |
| **Act I: The Ruins**<br>*(Hearth & Butterscotch Lanes)* | Complete **`A – C – T`** targets + Mercy `100%` to **SPARE** the *Caretaker of the Ruins* (`1,500+ pts`). | **Track 1 — *Ruins Hearth Lullaby* (`84 BPM`, 3/4 Waltz):** Tender music-box melody over warm felt-piano waltz chords. |
| **Act II: Snowdin Forest**<br>*(Skeletal Slingshots & Cozy Lanterns)* | Chain slingshot rebounds & orbit shots to **SPARE** the *Sentry Brothers* (`4,000+ pts`). | **Track 2 — *Snowdin Lantern Waltz* (`104 BPM`):** Playful, gentle music-box counterpoint with soft triangle pizzicato bass. |
| **Act III: Waterfall & Echo Flowers**<br>*(Glowing Cavern & Wishing Stars)* | Illuminate the Echo Flower bumpers & Starlight Ramp to **SPARE** the *Undying Guard* (`7,500+ pts`). | **Track 3 — *Echo Flower Reflection* (`76 BPM`):** Spacious, shimmering music-box arpeggios echoing the SOUL leitmotif. |
| **Act IV: The Barrier & True Pacifist Finale**<br>*(SOUL Resonance)* | All targets award **`2×` Determination**; **SPARE** the *Dreamer at the Barrier* (`11,000+ pts`) to mint a **`SHA-256` Pacifist Receipt**. | **Track 4 — *SOUL Resonance (True Pacifist Reprise)* (`92 BPM`):** Full-voiced felt-piano & celeste reprise of the 6-note SOUL theme. |

---

## 📁 Repository Scaffolding

```text
Underground-Soul-Pinball/
├── index.html                                    # Underground pinball cabinet, ACT/MERCY HUD & touch flippers
├── style.css                                     # Undertale-inspired obsidian, crisp white border, SAVE gold & SOUL red
├── package.json                                  # Zero-dependency ESM manifest (`npm test` -> `node --test`)
├── LICENSE                                       # MIT License
├── README.md                                     # Balanced pinball geometry, Pacifist mechanics & leitmotif guide
├── docs/
│   └── undertale-pinball-and-leitmotif-guide.md  # Guide to balanced flipper geometry & Toby Fox leitmotif synthesis
├── tiles/
│   └── bill-nye-undertale-pinball-explainer.md   # Altitude A7 plain-language explainer of flipper gaps & low-pass filters
├── src/
│   ├── core.js                                   # Zero-float Q16.16 fixed-point math & synchronous SHA-256 SOUL receipt
│   ├── underground-acts-data.js                  # 4 Underground Realms, guardian encounters, Mercy rules & track metadata
│   ├── soul-pinball-kernel.js                    # Balanced Q16.16 physics: 36px flipper gap, slingshots, inlanes, ACT targets
│   ├── gentle-musicbox-audio.js                  # Low-pass filtered Felt-Piano & Music-Box WebAudio synth (4 Tracks)
│   ├── underground-renderer.js                   # Crisp Undertale-styled table: SOUL heart ball, ACT targets & SAVE stars
│   └── soul-pinball-app.js                       # 60 Hz physics loop, Left/Right flipper controls, Ball Save & Jukebox
└── test/
    └── soul-pinball-kernel.test.mjs              # Built-in `node --test` suite verifying 36px drain gap, ACT->SPARE & SHA-256
```

---

## 🛠️ Build Roadmap (`v0.1` → `v1.0`)

* **`v0.1` (Balanced `Q16.16` Table Geometry & Flipper Kernel):** Implement the `36 px` flipper gap, Left/Right inlanes and outlanes, triangular slingshots, and `12 s` Ball Save (`Ledger 1`).
* **`v0.2` (Pacifist `ACT → MERCY → SPARE` Encounter Loop):** Wire the three `A – C – T` drop targets, Waterfall Orbit loop, and golden `SPARE` Guardian Bumper (`Ledger 1`).
* **`v0.3` (Low-Pass Filtered Felt-Piano & Music-Box Synthesizer):** Build the 4-track `BiquadFilterNode` WebAudio engine weaving the 6-note SOUL leitmotif (`Ledger 2`).
* **`v1.0` (Underground Canvas Renderer, Playbill Receipts & Verification):** Render the crimson SOUL orb, SAVE stars, `SHA-256` Pacifist receipts, and `node --test` verification.

---

## 🤝 Provenance & License

* **Tribute & Inspiration:** Created as an affectionate, non-commercial fan tribute to Toby Fox's *Undertale* (2015) and built on the deterministic `Q16.16` substrate from [`Borealiscodes/ndh-game-dev-kit`](https://github.com).
* **Author & License:** Borealis Serenity Hedling (`NDH-RESEARCH-PILOT` • County Dublin, Ireland) • MIT License • `Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>`.
