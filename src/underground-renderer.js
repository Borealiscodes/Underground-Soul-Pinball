/**
 * src/underground-renderer.js — Undertale-Inspired Pacifist Pinball Table Renderer (Ledger 2)
 * Zero-flicker obsidian playfield with crisp white pixel-style borders, [A][C][T] drop targets,
 * golden SPARE Guardian Bumper, Left/Right inlanes & outlanes, triangular slingshots,
 * and a glowing crimson heart-shaped SOUL orb.
 *
 * Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>
 */

import { fromQ16 } from "./core.js";
import {
  LEFT_FLIPPER,
  RIGHT_FLIPPER,
  PLAYFIELD_RIGHT,
  GUARDIAN_BUMPER,
} from "./soul-pinball-kernel.js";

function drawSoulHeart(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "#ef4444";
  ctx.strokeStyle = "#fecaca";
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.moveTo(0, r * 0.85);
  ctx.bezierCurveTo(-r * 1.15, r * 0.1, -r * 1.15, -r * 0.85, 0, -r * 0.35);
  ctx.bezierCurveTo(r * 1.15, -r * 0.85, r * 1.15, r * 0.1, 0, r * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function renderUndergroundPinball(ctx, state) {
  const { width, height } = ctx.canvas;
  const realm = state.realmDef;

  // 1. Steady obsidian Underground backdrop (zero flicker)
  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient realm starfield specks
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  for (let i = 0; i < 16; i++) {
    const sx = 34 + ((i * 73) % (PLAYFIELD_RIGHT - 54));
    const sy = 56 + ((i * 97) % (height - 130));
    ctx.fillRect(sx, sy, 2, 2);
  }

  // 2. Crisp Undertale-Style White Outer Cabinet Border & Plunger Divider
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 3.5;
  ctx.strokeRect(18, 34, width - 32, height - 46);

  // Plunger lane wall (x = 434, y = 135..608)
  ctx.beginPath();
  ctx.moveTo(PLAYFIELD_RIGHT, 135);
  ctx.lineTo(PLAYFIELD_RIGHT, height - 12);
  ctx.stroke();

  // Upper launch guide curve
  ctx.beginPath();
  ctx.arc(392, 92, 54, -Math.PI * 0.5, 0);
  ctx.stroke();

  // 3. Upper Waterfall Orbit Banner
  ctx.strokeStyle = realm.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(220, 120, 148, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  ctx.fillStyle = realm.accentColor;
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("WATERFALL ORBIT (+25% MERCY)", 220, 56);
  ctx.textAlign = "left";

  // 4. [A] [C] [T] Drop Targets
  for (const t of state.actTargets) {
    const lit = t.lit || t.flashTicks > 0;
    ctx.fillStyle = lit ? "#fde047" : "#18181b";
    ctx.strokeStyle = lit ? "#fef08a" : "#f97316";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = lit ? "#09090b" : "#fb923c";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(t.label, t.x, t.y + 4);
    ctx.textAlign = "left";
  }

  // 5. Hearth & Kindness Bumpers
  for (const b of state.bumpers) {
    const flash = b.flashTicks > 0;
    ctx.fillStyle = flash ? "#f8fafc" : "#1e1b4b";
    ctx.strokeStyle = realm.accentColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = flash ? "#09090b" : "#f8fafc";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(b.label, b.x, b.y + 3);
    ctx.textAlign = "left";
  }

  // 6. Central Guardian Encounter Bumper (turns Golden when Mercy === 100%)
  const spareReady = state.mercyPercent >= 100;
  ctx.fillStyle = spareReady ? "#fde047" : "#27272a";
  ctx.strokeStyle = spareReady ? "#fef08a" : "#f8fafc";
  ctx.lineWidth = spareReady ? 4 : 2.5;
  ctx.beginPath();
  ctx.arc(GUARDIAN_BUMPER.x, GUARDIAN_BUMPER.y, GUARDIAN_BUMPER.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = spareReady ? "#09090b" : "#fde047";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText(spareReady ? "SPARE!" : state.mercyPercent + "%", GUARDIAN_BUMPER.x, GUARDIAN_BUMPER.y + 4);
  ctx.textAlign = "left";

  // 7. Triangular Slingshot Kickers & Inlane/Outlane Divider Walls
  ctx.fillStyle = state.leftSlingFlash > 0 ? "#fde047" : "#18181b";
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(82, 415);
  ctx.lineTo(116, 468);
  ctx.lineTo(82, 468);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = state.rightSlingFlash > 0 ? "#fde047" : "#18181b";
  ctx.beginPath();
  ctx.moveTo(358, 415);
  ctx.lineTo(324, 468);
  ctx.lineTo(358, 468);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inlane / Outlane Dividers (x = 62 and x = 378)
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(62, 435);
  ctx.lineTo(62, 540);
  ctx.lineTo(LEFT_FLIPPER.pivotX - 4, LEFT_FLIPPER.pivotY);

  ctx.moveTo(378, 435);
  ctx.lineTo(378, 540);
  ctx.lineTo(RIGHT_FLIPPER.pivotX + 4, RIGHT_FLIPPER.pivotY);
  ctx.stroke();

  // Outlane Drain Warning Labels
  ctx.fillStyle = "#f87171";
  ctx.font = "8px monospace";
  ctx.fillText("OUT", 31, 515);
  ctx.fillText("OUT", 392, 515);

  // 8. Ball Save Active SAVE Star Indicator between Flippers
  if (state.ballSaveTicks > 0) {
    ctx.fillStyle = "#fde047";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("✦ BALL SAVE (" + Math.ceil(state.ballSaveTicks / 60) + "s) ✦", 220, 588);
    ctx.textAlign = "left";
  }

  // 9. Left & Right Flippers (with true 36px center drain gap between x=202 and x=238!)
  const drawFlipper = (pivotX, pivotY, dir, isUp) => {
    const tipX = pivotX + dir * LEFT_FLIPPER.length;
    const tipY = isUp ? pivotY - 28 : pivotY + 18;
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4.5, 0, Math.PI * 2);
    ctx.fill();
  };

  drawFlipper(LEFT_FLIPPER.pivotX, LEFT_FLIPPER.pivotY, 1, state.leftFlipperActive);
  drawFlipper(RIGHT_FLIPPER.pivotX, RIGHT_FLIPPER.pivotY, -1, state.rightFlipperActive);

  // 10. Plunger Spring & Crimson Heart SOUL Orb
  ctx.fillStyle = "#fde047";
  ctx.fillRect(442, 560, 18, 32);

  drawSoulHeart(ctx, fromQ16(state.soul.xQ16), fromQ16(state.soul.yQ16), state.soul.radius);

  // 11. Golden SAVE Stars on Pacifist SPARE
  for (const s of state.saveStars) {
    ctx.fillStyle = "#fde047";
    ctx.font = "12px monospace";
    ctx.fillText("✦", s.x, s.y);
  }
}
