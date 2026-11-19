/**
 * src/gentle-musicbox-audio.js — Warm, Low-Pass Filtered Felt-Piano & Music-Box Leitmotif Engine (Ledger 2)
 * Zero harsh square waves! Uses pure sine + triangle oscillators routed through a warm
 * 1,050 Hz low-pass BiquadFilterNode with gentle attack/decay envelopes.
 *
 * All 4 tracks transform the 6-note SOUL Leitmotif (F4 – C5 – Bb4 – A4 – G4 – F4):
 *   Track 0: Ruins Hearth Lullaby (84 BPM Waltz)
 *   Track 1: Snowdin Lantern Waltz (104 BPM)
 *   Track 2: Echo Flower Reflection (76 BPM)
 *   Track 3: SOUL Resonance — True Pacifist Reprise (92 BPM)
 *
 * Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>
 */

const NOTE_HZ = {
  REST: 0,
  F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, C3: 130.81, D3: 146.83, E3: 164.81,
  F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, C4: 261.63, D4: 293.66, E4: 329.63,
  F4: 349.23, G4: 392.00, A4: 440.00, Bb4: 466.16, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
};

const LEITMOTIF_TRACKS = [
  {
    name: "Track 1: Ruins Hearth Lullaby (84 BPM Waltz)",
    stepMs: 238, // Gentle 3/4 waltz quarter/eighth pulse
    melody: [
      "F4", "C5", "Bb4", "A4", "G4", "F4",
      "G4", "A4", "Bb4", "C5", "REST", "REST",
      "F4", "C5", "Bb4", "A4", "G4", "A4",
      "G4", "F4", "E4", "F4", "REST", "REST",
    ],
    accompaniment: [
      "F3", "A3", "C4", "F3", "A3", "C4",
      "Bb2", "D3", "F3", "C3", "E3", "G3",
      "D3", "F3", "A3", "Bb2", "D3", "F3",
      "C3", "E3", "G3", "F3", "A3", "C4",
    ],
  },
  {
    name: "Track 2: Snowdin Lantern Waltz (104 BPM)",
    stepMs: 192,
    melody: [
      "C5", "A4", "F4", "C5", "D5", "C5",
      "Bb4", "G4", "E4", "Bb4", "C5", "Bb4",
      "A4", "F4", "C4", "A4", "Bb4", "A4",
      "G4", "A4", "G4", "F4", "REST", "REST",
    ],
    accompaniment: [
      "F2", "C3", "A3", "F2", "C3", "A3",
      "C3", "G3", "Bb3", "C3", "G3", "Bb3",
      "D3", "A3", "F3", "Bb2", "F3", "D3",
      "C3", "G3", "Bb3", "F2", "C3", "A3",
    ],
  },
  {
    name: "Track 3: Echo Flower Reflection (76 BPM)",
    stepMs: 263,
    melody: [
      "F4", "REST", "C5", "REST", "Bb4", "A4",
      "G4", "REST", "F4", "REST", "G4", "REST",
      "A4", "REST", "D5", "REST", "C5", "Bb4",
      "A4", "G4", "E4", "F4", "REST", "REST",
    ],
    accompaniment: [
      "D3", "A3", "F4", "D3", "A3", "F4",
      "Bb2", "F3", "D4", "Bb2", "F3", "D4",
      "F2", "C3", "A3", "G2", "D3", "Bb3",
      "C3", "G3", "E4", "F2", "C3", "A3",
    ],
  },
  {
    name: "Track 4: SOUL Resonance — True Pacifist Reprise (92 BPM)",
    stepMs: 217,
    melody: [
      "F4", "C5", "Bb4", "A4", "G4", "F4",
      "C5", "F5", "E5", "D5", "C5", "REST",
      "D5", "Bb4", "G4", "C5", "A4", "F4",
      "G4", "A4", "G4", "F4", "REST", "REST",
    ],
    accompaniment: [
      "F2", "C3", "A3", "Bb2", "F3", "D4",
      "F2", "C3", "A3", "C3", "G3", "E4",
      "Bb2", "F3", "D4", "F2", "C3", "A3",
      "C3", "G3", "Bb3", "F2", "C3", "F3",
    ],
  },
];

export function createGentleMusicBoxAudio() {
  let muted = true;
  let ctx = null;
  let timer = null;
  let trackIndex = 0;
  let step = 0;

  const ensureCtx = () => {
    if (!ctx && typeof window !== "undefined") {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (Ctor) ctx = new Ctor();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const playWarmNote = (freq, waveType, peak, attack, decay, cutoff = 1050) => {
    const ac = ensureCtx();
    if (!ac || muted || !freq || freq <= 0) return;

    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, now);

    // Warm felt-piano / music-box low-pass filter (eliminates harsh upper harmonics)
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + decay);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);

    osc.start(now);
    osc.stop(now + decay + 0.05);
  };

  const restartSequencer = () => {
    if (timer && typeof window !== "undefined") {
      window.clearInterval(timer);
      timer = null;
    }
    if (muted || typeof window === "undefined") return;

    const track = LEITMOTIF_TRACKS.at(trackIndex);
    const tickNote = () => {
      if (muted) return;
      const t = LEITMOTIF_TRACKS.at(trackIndex);
      const i = step % t.melody.length;

      // Celeste Music-Box Melody (pure sine + subtle octave shimmer)
      const melFreq = NOTE_HZ[t.melody.at(i)];
      if (melFreq > 0) {
        playWarmNote(melFreq, "sine", 0.045, 0.012, 0.95, 1150);
        playWarmNote(melFreq * 2, "sine", 0.012, 0.008, 0.45, 1300);
      }

      // Warm Felt-Piano Accompaniment (filtered triangle)
      const accFreq = NOTE_HZ[t.accompaniment.at(i)];
      if (accFreq > 0) {
        playWarmNote(accFreq, "triangle", 0.032, 0.025, 0.85, 780);
      }

      step++;
    };

    tickNote();
    timer = window.setInterval(tickNote, track.stepMs);
  };

  return {
    isMuted: () => muted,
    getTrackName: () => LEITMOTIF_TRACKS.at(trackIndex).name,
    setTrack: (idx) => {
      const next = ((idx | 0) + LEITMOTIF_TRACKS.length) % LEITMOTIF_TRACKS.length;
      if (next !== trackIndex) {
        trackIndex = next;
        step = 0;
        if (!muted) restartSequencer();
      }
      return LEITMOTIF_TRACKS.at(trackIndex).name;
    },
    nextTrack: () => {
      trackIndex = (trackIndex + 1) % LEITMOTIF_TRACKS.length;
      step = 0;
      if (!muted) restartSequencer();
      return LEITMOTIF_TRACKS.at(trackIndex).name;
    },
    toggleMute: () => {
      muted = !muted;
      if (!muted) {
        ensureCtx();
        restartSequencer();
      } else if (timer && typeof window !== "undefined") {
        window.clearInterval(timer);
        timer = null;
      }
      return muted;
    },
    playSfx: (kind) => {
      if (muted) return;
      if (kind === "ACT_HIT") {
        playWarmNote(523.25, "sine", 0.045, 0.01, 0.45, 1200);
      } else if (kind === "BUMPER" || kind === "SLING") {
        playWarmNote(440.00, "triangle", 0.04, 0.01, 0.35, 950);
      } else if (kind === "FLIPPER") {
        playWarmNote(196.00, "triangle", 0.035, 0.008, 0.14, 650);
      } else if (kind === "PLUNGER" || kind === "BALL_SAVE") {
        playWarmNote(349.23, "sine", 0.045, 0.015, 0.55, 1100);
        setTimeout(() => playWarmNote(523.25, "sine", 0.04, 0.015, 0.65, 1200), 80);
      } else if (kind === "SPARE") {
        [349.23, 523.25, 466.16, 440.00, 392.00, 349.23].forEach((f, idx) => {
          setTimeout(() => playWarmNote(f, "sine", 0.05, 0.015, 0.9, 1250), idx * 110);
        });
      }
    },
  };
}
