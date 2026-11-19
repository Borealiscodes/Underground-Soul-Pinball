/**
 * src/soul-pinball-app.js — Underground Soul Pinball Controller, Flippers & Leitmotif Jukebox
 *
 * Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>
 */

import {
  createSoulPinballState,
  setFlipperState,
  launchSoulPlunger,
  stepSoulPinballFrame,
  buildPacifistReceipt,
} from "./soul-pinball-kernel.js";
import { createGentleMusicBoxAudio } from "./gentle-musicbox-audio.js";
import { renderUndergroundPinball } from "./underground-renderer.js";

const FIXED_DT_MS = 1000 / 60;

function initUndergroundPinball() {
  const canvas = document.getElementById("soul-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const audio = createGentleMusicBoxAudio();

  const hudStats = document.getElementById("hud-stats");
  const realmTitleEl = document.getElementById("realm-title");
  const guardianLabelEl = document.getElementById("guardian-label");
  const realmStoryEl = document.getElementById("realm-story");
  const mercyFillEl = document.getElementById("mercy-fill");
  const mercyTextEl = document.getElementById("mercy-text");
  const tickerEl = document.getElementById("event-ticker");
  const trackLabelEl = document.getElementById("track-label");

  const audioBtn = document.getElementById("btn-audio");
  const trackBtn = document.getElementById("btn-track");
  const leftFlipperBtn = document.getElementById("btn-left-flipper");
  const rightFlipperBtn = document.getElementById("btn-right-flipper");
  const plungerBtn = document.getElementById("btn-plunger");
  const receiptBox = document.getElementById("receipt-output");

  let state = createSoulPinballState();
  let lastRealmIdx = 0;

  const syncDialogueBox = () => {
    if (hudStats) {
      hudStats.textContent =
        "Score: " + state.score + " | Spared: " + state.sparedCount + " | SOULs: " + state.ballsRemaining;
    }
    if (realmTitleEl) realmTitleEl.textContent = state.realmDef.title;
    if (guardianLabelEl) {
      guardianLabelEl.textContent =
        "* Encounter: " + state.realmDef.guardianName + (state.mercyPercent >= 100 ? " [SPARE READY!]" : "");
    }
    if (realmStoryEl) realmStoryEl.textContent = state.realmDef.story;
    if (mercyFillEl) mercyFillEl.style.width = state.mercyPercent + "%";
    if (mercyTextEl) mercyTextEl.textContent = "MERCY: " + state.mercyPercent + "%";
    if (tickerEl) tickerEl.textContent = "* " + state.lastEvent;

    if (state.realmIndex !== lastRealmIdx) {
      lastRealmIdx = state.realmIndex;
      const trackName = audio.setTrack(state.realmDef.trackIndex);
      if (trackLabelEl) trackLabelEl.textContent = trackName;
    }
  };

  syncDialogueBox();

  const bindFlipper = (el, side) => {
    if (!el) return;
    const down = (ev) => {
      ev.preventDefault();
      state = setFlipperState(state, side, true);
    };
    const up = (ev) => {
      ev.preventDefault();
      state = setFlipperState(state, side, false);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
    el.addEventListener("pointercancel", up);
  };

  bindFlipper(leftFlipperBtn, "LEFT");
  bindFlipper(rightFlipperBtn, "RIGHT");

  plungerBtn?.addEventListener("click", () => {
    state = launchSoulPlunger(state);
    syncDialogueBox();
  });

  window.addEventListener("keydown", (ev) => {
    const k = ev.key.toLowerCase();
    if (k === "a" || k === "arrowleft" || k === "z") {
      state = setFlipperState(state, "LEFT", true);
    } else if (k === "d" || k === "arrowright" || k === "/") {
      state = setFlipperState(state, "RIGHT", true);
    } else if (k === " " || k === "enter") {
      ev.preventDefault();
      state = launchSoulPlunger(state);
    }
  });

  window.addEventListener("keyup", (ev) => {
    const k = ev.key.toLowerCase();
    if (k === "a" || k === "arrowleft" || k === "z") {
      state = setFlipperState(state, "LEFT", false);
    } else if (k === "d" || k === "arrowright" || k === "/") {
      state = setFlipperState(state, "RIGHT", false);
    }
  });

  audioBtn?.addEventListener("click", () => {
    const muted = audio.toggleMute();
    audioBtn.textContent = muted ? "Sound: Muted" : "🎹 Gentle Music-Box: ON";
    if (trackLabelEl) trackLabelEl.textContent = audio.getTrackName();
  });

  trackBtn?.addEventListener("click", () => {
    const nextName = audio.nextTrack();
    if (trackLabelEl) trackLabelEl.textContent = nextName;
  });

  document.getElementById("btn-receipt")?.addEventListener("click", () => {
    if (receiptBox) receiptBox.value = JSON.stringify(buildPacifistReceipt(state), null, 2);
  });

  let lastTime = performance.now();
  let accumulator = 0;

  function loop(now) {
    accumulator += Math.min(100, now - lastTime);
    lastTime = now;

    while (accumulator >= FIXED_DT_MS) {
      state = stepSoulPinballFrame(state);
      for (const sfx of state.sfxQueue) {
        audio.playSfx(sfx);
      }
      accumulator -= FIXED_DT_MS;
    }

    syncDialogueBox();
    if (ctx) renderUndergroundPinball(ctx, state);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

window.addEventListener("DOMContentLoaded", initUndergroundPinball);
