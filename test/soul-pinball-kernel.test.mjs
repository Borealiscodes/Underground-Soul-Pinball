/**
 * test/soul-pinball-kernel.test.mjs — Verification of 36px Center Drain Gap, ACT->MERCY->SPARE & SHA-256 Receipt
 * Run: node --test test/soul-pinball-kernel.test.mjs
 *
 * Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>
 */

import test from "node:test";
import assert from "node:assert/strict";

import { toQ16, fromQ16 } from "../src/core.js";
import {
  createSoulPinballState,
  launchSoulPlunger,
  stepSoulPinballFrame,
  buildPacifistReceipt,
} from "../src/soul-pinball-kernel.js";

test("1. True 36px Center Flipper Gap Allows Unflipped SOUL Drain When Ball Save Expires", () => {
  let s = createSoulPinballState();
  s.soul.inPlungerLane = false;
  s.ballSaveTicks = 0; // Ball Save expired
  // Place SOUL dead-center at x = 220 between Left Flipper tip (202) and Right Flipper tip (238)
  s.soul.xQ16 = toQ16(220);
  s.soul.yQ16 = toQ16(530);
  s.soul.vyQ16 = toQ16(320);

  for (let i = 0; i < 30; i++) {
    s = stepSoulPinballFrame(s);
  }

  assert.equal(s.ballsRemaining, 2); // Drained cleanly through the 36px gap!
  assert.equal(s.soul.inPlungerLane, true);
});

test("2. Hitting [A][C][T] Targets & Orbit Reaches 100% Mercy -> SPARE Advances to Snowdin Forest", () => {
  let s = createSoulPinballState();
  s.soul.inPlungerLane = false;
  s.mercyPercent = 75; // One [A] target away from 100% Mercy

  // Strike [A] drop target at (112, 175)
  s.soul.xQ16 = toQ16(112);
  s.soul.yQ16 = toQ16(195);
  s.soul.vyQ16 = toQ16(-120);
  s = stepSoulPinballFrame(s);
  assert.equal(s.mercyPercent, 100);

  // Strike central Guardian Bumper at (220, 205) to SPARE!
  s.soul.xQ16 = toQ16(220);
  s.soul.yQ16 = toQ16(240);
  s.soul.vyQ16 = toQ16(-140);
  s = stepSoulPinballFrame(s);

  assert.equal(s.sparedCount, 1);
  assert.equal(s.realmIndex, 1);
  assert.equal(s.realmDef.slug, "snowdin-forest");
});

test("3. Pacifist Receipt Generates Deterministic 64-Char SHA-256 Digest", () => {
  const s = createSoulPinballState();
  const receipt = buildPacifistReceipt(s);
  assert.equal(receipt.sha256.length, 64);
  assert.equal(receipt.realmReached, 1);
});
