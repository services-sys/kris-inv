/* Sonidos chiptune generados con WebAudio (sin archivos externos) */
window.KI = window.KI || {};

(function () {
  let ac = null, master = null, sfxBus = null, musicBus = null;
  let muted = false, musicTimer = null, step = 0, nextTime = 0;

  const NOTES = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
  const freq = (n) => {
    const m = /^([A-G]#?)(\d)$/.exec(n);
    return 440 * Math.pow(2, (NOTES[m[1]] + (+m[2] + 1) * 12 - 69) / 12);
  };

  function init() {
    if (ac) { if (ac.state === "suspended") ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.7; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.5; sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = 0.16; musicBus.connect(master);
  }

  function tone(f, dur, o = {}) {
    if (!ac) return;
    const t = ac.currentTime + (o.delay || 0);
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = o.type || "square";
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const v = o.vol ?? 0.25;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lowpass) {
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = o.lowpass;
      osc.connect(lp); node = lp;
    }
    if (o.vibrato) {
      const lfo = ac.createOscillator(); const lg = ac.createGain();
      lfo.frequency.value = o.vibrato; lg.gain.value = f * 0.04;
      lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + dur);
    }
    node.connect(g); g.connect(o.dest || sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(dur, o = {}) {
    if (!ac) return;
    const t = ac.currentTime + (o.delay || 0);
    const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = o.filter || "bandpass";
    f.frequency.setValueAtTime(o.from || 800, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(o.vol ?? 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start(t); src.stop(t + dur);
  }

  const sfx = {
    blip: () => tone(700 + Math.random() * 120, 0.03, { vol: 0.06 }),
    select: () => { tone(660, 0.06, { vol: 0.18 }); tone(990, 0.09, { delay: 0.06, vol: 0.18 }); },
    step: () => tone(110, 0.04, { type: "triangle", vol: 0.12 }),
    error: () => { tone(220, 0.15, { to: 110, vol: 0.2 }); tone(160, 0.2, { delay: 0.15, to: 80, vol: 0.2 }); },
    moo: (pitch = 1) => {
      tone(190 * pitch, 0.75, { type: "sawtooth", to: 120 * pitch, vol: 0.35, lowpass: 700, vibrato: 6 });
      tone(95 * pitch, 0.75, { type: "triangle", to: 70 * pitch, vol: 0.2 });
    },
    siren: () => { for (let i = 0; i < 6; i++) tone(i % 2 ? 960 : 720, 0.22, { delay: i * 0.22, vol: 0.14 }); },
    sparkle: () => [1319, 1568, 2093, 2637].forEach((f, i) => tone(f, 0.12, { delay: i * 0.06, vol: 0.1, type: "triangle" })),
    whoosh: () => noise(0.8, { from: 300, to: 3000, vol: 0.25 }),
    rumble: () => { noise(1.4, { filter: "lowpass", from: 180, to: 60, vol: 0.6 }); tone(55, 1.2, { type: "sawtooth", vol: 0.15, lowpass: 200 }); },
    pop: () => tone(520, 0.08, { to: 1040, vol: 0.15 }),
    clack: () => { noise(0.05, { from: 2000, vol: 0.3 }); noise(0.05, { from: 2000, vol: 0.3, delay: 0.12 }); },
    powerup: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.08, { delay: i * 0.05, vol: 0.14 })),
    chime: () => [1047, 1319].forEach((f, i) => tone(f, 0.6, { delay: i * 0.15, vol: 0.1, type: "sine" })),
    heart: () => { tone(880, 0.08, { vol: 0.12, type: "triangle" }); tone(1175, 0.14, { delay: 0.08, vol: 0.12, type: "triangle" }); },
    fanfare: () => {
      const seq = [["C5", 0.12], ["E5", 0.12], ["G5", 0.12], ["C6", 0.32], ["G5", 0.12], ["C6", 0.5]];
      let d = 0;
      seq.forEach(([n, l]) => { tone(freq(n), l, { delay: d, vol: 0.2 }); tone(freq(n) / 2, l, { delay: d, vol: 0.12, type: "triangle" }); d += l; });
    },
  };

  // --- Música: loop romántico C - Am - F - G ---
  const LEAD = ["E5", null, "G5", null, "E5", "D5", "C5", null, "C5", null, "E5", null, "A5", "G5", "E5", null,
                "F5", null, "A5", null, "C6", null, "A5", "F5", "G5", null, "F5", "E5", "D5", null, "B4", null];
  const BASS = ["C3", "G3", "A2", "E3", "F2", "C3", "G2", "D3"];
  const ARP = [["C4", "E4", "G4", "E4"], ["A3", "C4", "E4", "C4"], ["F3", "A3", "C4", "A3"], ["G3", "B3", "D4", "B3"]];
  const SPB = 0.25; // segundos por corchea

  function schedule() {
    while (nextTime < ac.currentTime + 0.2) {
      const i = step % 32;
      const at = nextTime - ac.currentTime;
      if (LEAD[i]) tone(freq(LEAD[i]), SPB * 0.9, { delay: at, vol: 0.22, dest: musicBus, type: "square" });
      if (i % 4 === 0) tone(freq(BASS[(i / 4) | 0]), SPB * 1.8, { delay: at, vol: 0.35, dest: musicBus, type: "triangle" });
      const a = ARP[(i / 8) | 0];
      tone(freq(a[i % 4]), SPB * 0.5, { delay: at, vol: 0.06, dest: musicBus, type: "square" });
      nextTime += SPB; step++;
    }
  }

  function music(on) {
    if (!ac) return;
    if (on && !musicTimer) { nextTime = ac.currentTime + 0.1; musicTimer = setInterval(schedule, 50); }
    if (!on && musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  function toggleMute() {
    muted = !muted;
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.7, ac.currentTime, 0.05);
    return muted;
  }

  KI.audio = { init, sfx, music, toggleMute, get muted() { return muted; } };
})();
