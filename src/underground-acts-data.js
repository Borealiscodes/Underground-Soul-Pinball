/**
 * src/underground-acts-data.js — Four Underground Realms, Pacifist Guardians & Gentle Leitmotif Metadata
 *
 * Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>
 */

export const UNDERGROUND_REALMS = [
  {
    id: 1,
    slug: "the-ruins",
    title: "Act I: The Ruins (Hearth & Butterscotch Lanes)",
    guardianName: "Caretaker of the Ruins",
    story:
      "A warm hearth glows behind ancient violet pillars. Strike the three [A] [C] [T] drop targets or shoot the upper Waterfall Orbit to raise Mercy to 100%, then tap the golden Guardian Bumper to SPARE!",
    trackIndex: 0,
    trackName: "Track 1: Ruins Hearth Lullaby (84 BPM Waltz)",
    accentColor: "#c084fc",
    scoreMultiplier: 1,
  },
  {
    id: 2,
    slug: "snowdin-forest",
    title: "Act II: Snowdin Forest (Skeletal Slingshots)",
    guardianName: "The Sentry Brothers",
    story:
      "Cozy lantern light dances across snowy pines. Use the lower slingshots to bank shots into the [A] [C] [T] targets, reach 100% Mercy, and SPARE the Sentry Brothers!",
    trackIndex: 1,
    trackName: "Track 2: Snowdin Lantern Waltz (104 BPM)",
    accentColor: "#38bdf8",
    scoreMultiplier: 1,
  },
  {
    id: 3,
    slug: "waterfall-echo",
    title: "Act III: Waterfall & Echo Flowers (Wishing Cavern)",
    guardianName: "Captain of the Guard",
    story:
      "Glowing Echo Flowers repeat quiet wishes across subterranean streams. Fill the Mercy Meter to 100% and SPARE the Captain to unlock the path to the Barrier!",
    trackIndex: 2,
    trackName: "Track 3: Echo Flower Reflection (76 BPM)",
    accentColor: "#34d399",
    scoreMultiplier: 2,
  },
  {
    id: 4,
    slug: "true-pacifist-barrier",
    title: "Act IV: The Barrier & True Pacifist Finale",
    guardianName: "Dreamer at the Barrier",
    story:
      "Your SOUL resonates with everyone you spared along the way! Fill Mercy to 100% and strike the golden Guardian Bumper one final time to shatter the Barrier and mint your Pacifist Receipt!",
    trackIndex: 3,
    trackName: "Track 4: SOUL Resonance — True Pacifist Reprise (92 BPM)",
    accentColor: "#fde047",
    scoreMultiplier: 2,
  },
];

export const ACT_TARGETS = [
  { id: "act-a", label: "A", x: 112, y: 175, r: 16 },
  { id: "act-c", label: "C", x: 220, y: 122, r: 16 },
  { id: "act-t", label: "T", x: 328, y: 175, r: 16 },
];

export const HEARTH_BUMPERS = [
  { id: "left-pillar", label: "HOPE", x: 155, y: 245, r: 22, points: 150 },
  { id: "right-pillar", label: "KIND", x: 285, y: 245, r: 22, points: 150 },
];
