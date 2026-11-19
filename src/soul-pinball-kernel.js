/**
 * src/soul-pinball-kernel.js — Balanced Q16.16 Multi-Zone Pinball Physics & Pacifist ACT->MERCY->SPARE Kernel (Ledger 1)
 * Features:
 *   - 480x620 table with 436px playfield + 44px plunger lane
 *   - True skill-based 36px center flipper gap (Left tip x=202, Right tip x=238) vs. 18px SOUL orb (r=9)
 *   - Left/Right return inlanes (x=66..106 and x=334..374) & risky outer drain outlanes (x=24..62 and x=378..416)
 *   - 12-second Ball Save timer on plunger launch
 *   - Triangular Slingshot Kickers above flippers
 *   - [A] [C] [T] Drop Targets (+25% Mercy each) + Upper Orbit Rollover (+25% Mercy) -> Golden SPARE Guardian Bumper
 *
 * Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>
 */

import { toQ16, fromQ16, qAdd, qMul, sha256Hex } from "./core.js";
import { UNDERGROUND_REALMS, ACT_TARGETS, HEARTH_BUMPERS } from "./underground-acts-data.js";

export const TABLE_W = 480;
export const TABLE_H = 620;
export const PLAYFIELD_RIGHT = 434; // x = 434..468 is the plunger lane

// Balanced Flipper Geometry: pivotX=134 (+68 => tip=202) and pivotX=306 (-68 => tip=238) -> 36px center drain gap!
export const LEFT_FLIPPER = { pivotX: 134, pivotY: 540, length: 68 };
export const RIGHT_FLIPPER = { pivotX: 306, pivotY: 540, length: 68 };

export const GUARDIAN_BUMPER = { x: 220, y: 205, r: 30 };

export function createSoulPinballState() {
  return {
    tick: 0,
    realmIndex: 0,
    realmDef: UNDERGROUND_REALMS.at(0),
    score: 0,
    sparedCount: 0,
    mercyPercent: 0, // 0 .. 100
    ballsRemaining: 3,
    ballSaveTicks: 0, // 720 ticks = 12 seconds at 60 Hz
    orbitCooldownTicks: 0,
    soul: {
      xQ16: toQ16(451),
      yQ16: toQ16(545),
      vxQ16: 0,
      vyQ16: 0,
      radius: 9, // 18px diameter vs. 36px flipper gap
      inPlungerLane: true,
    },
    leftFlipperActive: false,
    rightFlipperActive: false,
    leftFlipperTicks: 0,
    rightFlipperTicks: 0,
    actTargets: ACT_TARGETS.map((t) => ({ ...t, lit: false, flashTicks: 0 })),
    bumpers: HEARTH_BUMPERS.map((b) => ({ ...b, flashTicks: 0 })),
    guardianFlashTicks: 0,
    leftSlingFlash: 0,
    rightSlingFlash: 0,
    saveStars: [],
    lastEvent: "Pull Plunger (Space / Launch) to send your SOUL into The Ruins!",
    sfxQueue: [], // ["PLUNGER", "FLIPPER", "ACT_HIT", "BUMPER", "SLING", "SPARE", "BALL_SAVE", "DRAIN"]
  };
}

export function setFlipperState(state, side, active) {
  if (side === "LEFT") {
    const justPressed = active && !state.leftFlipperActive;
    return {
      ...state,
      leftFlipperActive: active,
      leftFlipperTicks: justPressed ? 10 : state.leftFlipperTicks,
      sfxQueue: justPressed ? [...state.sfxQueue, "FLIPPER"] : state.sfxQueue,
    };
  }
  const justPressed = active && !state.rightFlipperActive;
  return {
    ...state,
    rightFlipperActive: active,
    rightFlipperTicks: justPressed ? 10 : state.rightFlipperTicks,
    sfxQueue: justPressed ? [...state.sfxQueue, "FLIPPER"] : state.sfxQueue,
  };
}

export function launchSoulPlunger(state) {
  if (!state.ballInPlunger && !state.soul.inPlungerLane) return state;
  return {
    ...state,
    ballSaveTicks: 720, // 12 seconds of Ball Save protection
    soul: {
      ...state.soul,
      vxQ16: toQ16(-85),
      vyQ16: toQ16(-860),
      inPlungerLane: false,
    },
    lastEvent: "Stay determined! Ball Save active (12s) — hit [A] [C] [T] targets!",
    sfxQueue: [...state.sfxQueue, "PLUNGER"],
  };
}

function advanceRealmOnSpare(state) {
  const nextSpared = state.sparedCount + 1;
  const nextIdx = Math.min(UNDERGROUND_REALMS.length - 1, state.realmIndex + 1);
  const nextRealm = UNDERGROUND_REALMS.at(nextIdx);
  const spareBonus = 1000 * state.realmDef.scoreMultiplier;

  const stars = Array.from({ length: 18 }, (_, i) => ({
    x: 65 + ((i * 41) % 310),
    y: 80 + ((i * 29) % 210),
    vy: 1.0 + (i % 3) * 0.35,
    life: 130,
  }));

  return {
    ...state,
    realmIndex: nextIdx,
    realmDef: nextRealm,
    score: state.score + spareBonus,
    sparedCount: nextSpared,
    mercyPercent: 0,
    actTargets: ACT_TARGETS.map((t) => ({ ...t, lit: false, flashTicks: 0 })),
    guardianFlashTicks: 24,
    saveStars: [...state.saveStars, ...stars],
    lastEvent:
      "YOU SPARED " +
      state.realmDef.guardianName.toUpperCase() +
      "! (+" +
      spareBonus +
      " pts) → Entering " +
      nextRealm.title,
    sfxQueue: [...state.sfxQueue, "SPARE"],
  };
}

export function stepSoulPinballFrame(state) {
  const tick = state.tick + 1;
  let sfxQueue = [];

  const ballSaveTicks = Math.max(0, state.ballSaveTicks - 1);
  const orbitCooldownTicks = Math.max(0, state.orbitCooldownTicks - 1);
  const leftFlipperTicks = Math.max(0, state.leftFlipperTicks - 1);
  const rightFlipperTicks = Math.max(0, state.rightFlipperTicks - 1);
  const guardianFlashTicks = Math.max(0, state.guardianFlashTicks - 1);
  const leftSlingFlash = Math.max(0, state.leftSlingFlash - 1);
  const rightSlingFlash = Math.max(0, state.rightSlingFlash - 1);

  let nextTargets = state.actTargets.map((t) => ({
    ...t,
    flashTicks: Math.max(0, t.flashTicks - 1),
  }));
  let nextBumpers = state.bumpers.map((b) => ({
    ...b,
    flashTicks: Math.max(0, b.flashTicks - 1),
  }));
  const nextStars = state.saveStars
    .map((s) => ({ ...s, y: s.y + s.vy, life: s.life - 1 }))
    .filter((s) => s.life > 0);

  if (state.soul.inPlungerLane) {
    return {
      ...state,
      tick,
      ballSaveTicks,
      orbitCooldownTicks,
      leftFlipperTicks,
      rightFlipperTicks,
      guardianFlashTicks,
      leftSlingFlash,
      rightSlingFlash,
      actTargets: nextTargets,
      bumpers: nextBumpers,
      saveStars: nextStars,
      sfxQueue,
    };
  }

  const dtQ16 = toQ16(1.0 / 60.0);
  const gravQ16 = toQ16(415.0);
  const airDampQ16 = toQ16(0.996);

  const vx = qMul(state.soul.vxQ16, airDampQ16);
  const vy = qMul(qAdd(state.soul.vyQ16, qMul(gravQ16, dtQ16)), airDampQ16);

  let fx = fromQ16(qAdd(state.soul.xQ16, qMul(vx, dtQ16)));
  let fy = fromQ16(qAdd(state.soul.yQ16, qMul(vy, dtQ16)));
  let fvx = fromQ16(vx);
  let fvy = fromQ16(vy);
  const r = state.soul.radius;

  let score = state.score;
  let mercyPercent = state.mercyPercent;
  let lastEvent = state.lastEvent;
  let nextOrbitCd = orbitCooldownTicks;
  let nextLeftSling = leftSlingFlash;
  let nextRightSling = rightSlingFlash;

  // 1. Top Curved Arch & Side Cabinet Walls
  if (fy < 42 + r) {
    fy = 42 + r;
    fvy = Math.abs(fvy) * 0.78;
    if (fx > 360) fvx -= 155;
    // Upper Waterfall Orbit Loop Rollover (+25% Mercy)
    if (fx >= 165 && fx <= 275 && nextOrbitCd === 0) {
      nextOrbitCd = 90;
      mercyPercent = Math.min(100, mercyPercent + 25);
      score += 200 * state.realmDef.scoreMultiplier;
      lastEvent = "Waterfall Orbit Loop! +25% Mercy (" + mercyPercent + "%)";
      sfxQueue.push("ACT_HIT");
    }
  }
  if (fx < 24 + r) {
    fx = 24 + r;
    fvx = Math.abs(fvx) * 0.82;
  }
  if (fx > PLAYFIELD_RIGHT - r && fy > 135) {
    fx = PLAYFIELD_RIGHT - r;
    fvx = -Math.abs(fvx) * 0.82;
  } else if (fx > TABLE_W - 16 - r) {
    fx = TABLE_W - 16 - r;
    fvx = -Math.abs(fvx) * 0.82;
  }

  // 2. Return Inlanes vs. Outer Drain Outlanes (y = 435..545)
  // Divider walls at x = 62 (Left) and x = 378 (Right) separate Outlanes (drain) from Inlanes (feed flippers)
  if (fy > 435 && fy < 548) {
    // Left divider wall at x = 62
    if (Math.abs(fx - 62) < r + 2) {
      if (fx >= 62) {
        fx = 62 + r + 2;
        fvx = Math.abs(fvx) * 0.65 + 45;
      } else {
        fx = 62 - r - 2;
        fvx = -Math.abs(fvx) * 0.65;
      }
    }
    // Right divider wall at x = 378
    if (Math.abs(fx - 378) < r + 2) {
      if (fx <= 378) {
        fx = 378 - r - 2;
        fvx = -Math.abs(fvx) * 0.65 - 45;
      } else {
        fx = 378 + r + 2;
        fvx = Math.abs(fvx) * 0.65;
      }
    }
    // Inlane funnels guiding ball smoothly to Left (134) & Right (306) flipper pivots
    if (fx > 64 && fx < LEFT_FLIPPER.pivotX && fy > 495) {
      fvx += 24;
    } else if (fx > RIGHT_FLIPPER.pivotX && fx < 376 && fy > 495) {
      fvx -= 24;
    }
  }

  // 3. Left & Right Triangular Slingshot Kickers (above inlanes)
  const checkSlingshot = (cx, cy, dirX, isLeft) => {
    const dx = fx - cx;
    const dy = fy - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < r + 20 && dist > 0.01) {
      fx = cx + (dx / dist) * (r + 22);
      fy = cy + (dy / dist) * (r + 22);
      fvx = dirX * 340;
      fvy = -310;
      score += 75 * state.realmDef.scoreMultiplier;
      lastEvent = (isLeft ? "Left" : "Right") + " Snowdin Slingshot! +75 pts";
      sfxQueue.push("SLING");
      if (isLeft) nextLeftSling = 10;
      else nextRightSling = 10;
    }
  };
  checkSlingshot(96, 445, 1, true);
  checkSlingshot(344, 445, -1, false);

  // 4. [A] [C] [T] Pacifist Drop Targets (+25% Mercy each)
  nextTargets = nextTargets.map((t) => {
    const dx = fx - t.x;
    const dy = fy - t.y;
    const dist = Math.hypot(dx, dy);
    if (dist < t.r + r && dist > 0.001) {
      const nx = dx / dist;
      const ny = dy / dist;
      fx = t.x + nx * (t.r + r + 1);
      fy = t.y + ny * (t.r + r + 1);
      const spd = Math.max(330, Math.hypot(fvx, fvy) * 1.05);
      fvx = nx * spd;
      fvy = ny * spd;

      const mercyGain = t.lit ? 10 : 25;
      mercyPercent = Math.min(100, mercyPercent + mercyGain);
      const pts = 250 * state.realmDef.scoreMultiplier;
      score += pts;
      lastEvent =
        "ACT [" +
        t.label +
        "] Target! +" +
        pts +
        " pts • Mercy: " +
        mercyPercent +
        "%" +
        (mercyPercent >= 100 ? " (SPARE READY!)" : "");
      sfxQueue.push("ACT_HIT");
      return { ...t, lit: true, flashTicks: 14 };
    }
    return t;
  });

  // 5. Hearth & Kindness Bumpers
  nextBumpers = nextBumpers.map((b) => {
    const dx = fx - b.x;
    const dy = fy - b.y;
    const dist = Math.hypot(dx, dy);
saveStars: nextStars,
lastEvent: drainMsg,
sfxQueue: [...sfxQueue, "DRAIN"],
};
}
const baseNext = {
...state,
tick,
score,
mercyPercent,
ballSaveTicks,
orbitCooldownTicks: nextOrbitCd,
leftFlipperTicks,
rightFlipperTicks,
guardianFlashTicks,
leftSlingFlash: nextLeftSling,
rightSlingFlash: nextRightSling,
soul: {
...state.soul,
xQ16: toQ16(fx),
yQ16: toQ16(fy),
vxQ16: toQ16(fvx),
vyQ16: toQ16(fvy),
},
actTargets: nextTargets,
bumpers: nextBumpers,
saveStars: nextStars,
lastEvent,
sfxQueue,
};
return sparedNow ? advanceRealmOnSpare(baseNext) : baseNext;
}
export function buildPacifistReceipt(state) {
const payload = {
schema: "ndh.underground.soul.pinball.v1",
realmReached: state.realmIndex + 1,
realmSlug: state.realmDef.slug,
guardiansSpared: state.sparedCount,
score: state.score,
mercyPercent: state.mercyPercent,
activeLeitmotif: state.realmDef.trackName,
};
return {
...payload,
sha256: sha256Hex(JSON.stringify(payload)),
};
}
