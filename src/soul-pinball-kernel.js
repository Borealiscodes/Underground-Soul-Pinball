import { toQ16, fromQ16, qAdd, qMul, sha256Hex } from "./core.js";
import { UNDERGROUND_REALMS, ACT_TARGETS, HEARTH_BUMPERS } from "./underground-acts-data.js";

export const TABLE_W = 480;
export const TABLE_H = 620;
export const PLAYFIELD_RIGHT = 434;

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
    mercyPercent: 0,
    ballsRemaining: 3,
    ballSaveTicks: 0,
    orbitCooldownTicks: 0,
    soul: {
      xQ16: toQ16(451),
      yQ16: toQ16(545),
      vxQ16: 0,
      vyQ16: 0,
      radius: 9,
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
    sfxQueue: [],
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
  if (!state.soul.inPlungerLane) return state;
  return {
    ...state,
    ballSaveTicks: 720,
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

  if (fy < 42 + r) {
    fy = 42 + r;
    fvy = Math.abs(fvy) * 0.78;
    if (fx > 360) fvx -= 155;
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

  if (fy > 435 && fy < 548) {
    if (Math.abs(fx - 62) < r + 2) {
      if (fx >= 62) {
        fx = 62 + r + 2;
        fvx = Math.abs(fvx) * 0.65 + 45;
      } else {
        fx = 62 - r - 2;
        fvx = -Math.abs(fvx) * 0.65;
      }
    }
    if (Math.abs(fx - 378) < r + 2) {
      if (fx <= 378) {
        fx = 378 - r - 2;
        fvx = -Math.abs(fvx) * 0.65 - 45;
      } else {
        fx = 378 + r + 2;
        fvx = Math.abs(fvx) * 0.65;
      }
    }
    if (fx > 64 && fx < LEFT_FLIPPER.pivotX && fy > 495) {
      fvx += 24;
    } else if (fx > RIGHT_FLIPPER.pivotX && fx < 376 && fy > 495) {
      fvx -= 24;
    }
  }

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

  nextBumpers = nextBumpers.map((b) => {
    const dx = fx - b.x;
    const dy = fy - b.y;
    const dist = Math.hypot(dx, dy);
    if (dist < b.r + r && dist > 0.001) {
      const nx = dx / dist;
      const ny = dy / dist;
      fx = b.x + nx * (b.r + r + 1);
      fy = b.y + ny * (b.r + r + 1);
      const spd = Math.max(360, Math.hypot(fvx, fvy) * 1.1);
      fvx = nx * spd;
      fvy = ny * spd;
      const pts = b.points * state.realmDef.scoreMultiplier;
      score += pts;
      mercyPercent = Math.min(100, mercyPercent + 10);
      lastEvent = b.label + " Bumper! +" + pts + " pts • Mercy: " + mercyPercent + "%";
      sfxQueue.push("BUMPER");
      return { ...b, flashTicks: 12 };
    }
    return b;
  });

  const gdx = fx - GUARDIAN_BUMPER.x;
  const gdy = fy - GUARDIAN_BUMPER.y;
  const gdist = Math.hypot(gdx, gdy);
  let sparedNow = false;
  if (gdist < GUARDIAN_BUMPER.r + r && gdist > 0.001) {
    const nx = gdx / gdist;
    const ny = gdy / gdist;
    fx = GUARDIAN_BUMPER.x + nx * (GUARDIAN_BUMPER.r + r + 2);
    fy = GUARDIAN_BUMPER.y + ny * (GUARDIAN_BUMPER.r + r + 2);
    const spd = Math.max(380, Math.hypot(fvx, fvy) * 1.12);
    fvx = nx * spd;
    fvy = ny * spd;

    if (mercyPercent >= 100) {
      sparedNow = true;
    } else {
      const pts = 200 * state.realmDef.scoreMultiplier;
      score += pts;
      lastEvent = state.realmDef.guardianName + " (Mercy " + mercyPercent + "% — reach 100% to SPARE!)";
      sfxQueue.push("BUMPER");
    }
  }

  const checkFlipper = (pivotX, pivotY, dir, isUp, justKicked) => {
    const tipX = pivotX + dir * LEFT_FLIPPER.length;
    const tipY = isUp ? pivotY - 28 : pivotY + 18;
    const segX = tipX - pivotX;
    const segY = tipY - pivotY;
    const segLenSq = segX * segX + segY * segY;
    const t = Math.max(0, Math.min(1, ((fx - pivotX) * segX + (fy - pivotY) * segY) / segLenSq));
    const closestX = pivotX + t * segX;
    const closestY = pivotY + t * segY;
    if (Math.hypot(fx - closestX, fy - closestY) < r + 6) {
      fy = closestY - (r + 7);
      if (isUp || justKicked) { fvy = -690 - t * 150; fvx = dir * (145 + t * 230); }
      else { fvy = -Math.abs(fvy) * 0.5; fvx += dir * 75; }
    }
  };

  checkFlipper(LEFT_FLIPPER.pivotX, LEFT_FLIPPER.pivotY, 1, state.leftFlipperActive, leftFlipperTicks > 0);
  checkFlipper(RIGHT_FLIPPER.pivotX, RIGHT_FLIPPER.pivotY, -1, state.rightFlipperActive, rightFlipperTicks > 0);

  if (fy > TABLE_H + 16) {
    if (ballSaveTicks > 0) {
      return {
        ...state, tick, score, mercyPercent, ballSaveTicks: 0,
        soul: { xQ16: toQ16(220), yQ16: toQ16(320), vxQ16: 0, vyQ16: toQ16(-280), radius: 9, inPlungerLane: false },
        actTargets: nextTargets, bumpers: nextBumpers, saveStars: nextStars,
        lastEvent: "BALL SAVED! Your SOUL refused to give up!", sfxQueue: [...sfxQueue, "BALL_SAVE"],
      };
    }
    const nextBalls = state.ballsRemaining > 1 ? state.ballsRemaining - 1 : 3;
    return {
      ...state, tick, score, mercyPercent, ballsRemaining: nextBalls, ballSaveTicks: 0,
      soul: { xQ16: toQ16(451), yQ16: toQ16(545), vxQ16: 0, vyQ16: 0, radius: 9, inPlungerLane: true },
      actTargets: nextTargets, bumpers: nextBumpers, saveStars: nextStars,
      lastEvent: state.ballsRemaining > 1 ? "SOUL drained! " + nextBalls + " left — Pull Plunger!" : "Determination Restored! 3 SOULs loaded!",
      sfxQueue: [...sfxQueue, "DRAIN"],
    };
  }

  const baseNext = {
    ...state, tick, score, mercyPercent, ballSaveTicks, orbitCooldownTicks: nextOrbitCd,
    leftFlipperTicks, rightFlipperTicks, guardianFlashTicks, leftSlingFlash: nextLeftSling, rightSlingFlash: nextRightSling,
    soul: { ...state.soul, xQ16: toQ16(fx), yQ16: toQ16(fy), vxQ16: toQ16(fvx), vyQ16: toQ16(fvy) },
    actTargets: nextTargets, bumpers: nextBumpers, saveStars: nextStars, lastEvent, sfxQueue,
  };
  return sparedNow ? advanceRealmOnSpare(baseNext) : baseNext;
}

export function buildPacifistReceipt(state) {
  const payload = {
    schema: "ndh.underground.soul.pinball.v1",
    realmReached: state.realmIndex + 1, realmSlug: state.realmDef.slug,
    guardiansSpared: state.sparedCount, score: state.score,
    mercyPercent: state.mercyPercent, activeLeitmotif: state.realmDef.trackName,
  };
  return { ...payload, sha256: sha256Hex(JSON.stringify(payload)) };
}
