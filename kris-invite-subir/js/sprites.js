/* Sprites pixel art originales + escenarios dibujados a mano (160x120) */
window.KI = window.KI || {};

(function () {
  const W = 160, H = 120, GROUND = 100;

  function build(rows, pal) {
    const h = rows.length, w = Math.max(...rows.map((r) => r.length));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    rows.forEach((r, j) => [...r].forEach((ch, i) => {
      if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); }
    }));
    return c;
  }

  // ---------- Kristel (original: delgada, pelo negro largo y suelto, chaqueta negra, camisa blanca, jeans negros) ----------
  const GIRL_PAL = {
    K: "#15111f", H: "#3a3150", S: "#ffe2cf", P: "#ffa3b3", E: "#3d2f5c", L: "#15111f", W: "#ffffff",
    G: "#dcd8ea", T: "#e98a7a", D: "#363452", d: "#5d5a80", Q: "#ffd9c4", M: "#e0607a", N: "#2b2a3a", J: "#3c3b52", Z: "#f4f4fa",
  };
  const GIRL_TOP = [
    "....KKKKKK....",
    "...KKKKKKKK...",
    "..KKKKKKKKKK..",
    "..KKKKHHKKKK..",
    "..KKKSSSSKKK..",
    "..KKSSSSSSKK..",
    "..KSLLSSLLSK..",
    "..KSEWSSEWSK..",
    "..KSEESSEESK..",
    "..KPSSSSSSPK..",
    "..KKSSMMSSKK..",
    "..KKKSSSSKKK..",
    ".KKKKKSSKKKKK.",
    ".KKDDWSSWDDKK.",
    ".KDDDWWWWDDDK.",
    ".KDdDWWWWDdDK.",
    ".KD.DWWWWD.DK.",
    "..T.DWWWWD.D..",
    "..Q.NNNNNN.Q..",
    "...NNNNNNNN...",
    "...NNNNNNNN...",
    "...NJNNNNJN...",
  ];
  const LEGS_IDLE = ["...NJN..NJN...", "....NJ..JN....", "....NJ..JN....", "....NJ..JN....", "...ZZZ..ZZZ..."];
  const LEGS_A = ["..NJN....NJN..", "..NJ......JN..", ".NJ........JN.", ".NJ........JN.", ".ZZZ......ZZZ."];
  const LEGS_B = ["....NJNJN.....", ".....NJN......", ".....NJN......", ".....NJN......", "....ZZZZ......"];
  const blinkTop = GIRL_TOP.map((r, i) => (i === 6 || i === 7 ? "..KSSSSSSSSK.." : i === 8 ? "..KSLLSSLLSK.." : r));
  const happyTop = GIRL_TOP.map((r, i) =>
    i === 6 || i === 8 ? "..KSSSSSSSSK.." : i === 7 ? "..KSLLSSLLSK.." : i === 10 ? "..KKSMMMMSKK.." : r);

  const GIRL = {
    idle: build([...GIRL_TOP, ...LEGS_IDLE], GIRL_PAL),
    blink: build([...blinkTop, ...LEGS_IDLE], GIRL_PAL),
    walkA: build([...GIRL_TOP, ...LEGS_A], GIRL_PAL),
    walkB: build([...GIRL_TOP, ...LEGS_B], GIRL_PAL),
    happy: build([...happyTop, ...LEGS_IDLE], GIRL_PAL),
  };
  const MUSTACHE = build(["....WWWWWW....", ".....W..W....."], { W: "#ffffff" });

  // ---------- Vaquita ----------
  const COW_PAL = { W: "#ffffff", B: "#2b2233", K: "#2b2233", P: "#ffb3c1", N: "#b5566a", O: "#e8c48a", G: "#d8d0e0" };
  const COW_BODY = [
    "..............O....O",
    "..............WWWWWW",
    "..............WKWWKW",
    ".BBWWWWWWWWBBWWWWWWW",
    "BBBWWWWWWWBBBWWWWWWW",
    "WBWWWWBBWWWBWWPPPPPP",
    "WWWWWBBBWWWWWWPNPPNP",
    "WWWWWWBWWWWWWWPPPPPP",
    "WWWWWWWWWWWWWW......",
    "GWWWWWWWWWWWWG......",
  ];
  const COW = {
    a: build([...COW_BODY, ".WW.WW.PP..WW.WW....", ".KK.KK.....KK.KK...."], COW_PAL),
    b: build([...COW_BODY, "..WW.WW.PP..WW.WW...", "..KK..KK....KK..KK.."], COW_PAL),
  };
  const WING_PAL = { L: "#cfe9ff", W: "#ffffff" };
  const WING_UP = build(["......L", "....LWL", "..LWWL.", "LWWWL..", ".LLL..."], WING_PAL);
  const WING_DN = build([".LLL...", "LWWWL..", "..LWWL.", "....LWL", "......L"], WING_PAL);

  const ENVELOPE = build([
    "WWWWWWWWW",
    "WGWWWWWGW",
    "WWGWWWGWW",
    "WWWGRGWWW",
    "WWWWRWWWW",
    "WWWWWWWWW",
  ], { W: "#fff6e8", G: "#c9b9a6", R: "#ff3d6e" });

  const HEART = build([".R.R.", "RRRRR", "RRRRR", ".RRR.", "..R.."], { R: "#ff4f7d" });
  const HEART_S = build(["R.R", "RRR", ".R."], { R: "#ff7aa0" });

  // ---------- Fuente diminuta 3x5 ----------
  const FONT = {
    0: ["111", "101", "101", "101", "111"], 1: ["010", "110", "010", "010", "111"],
    2: ["111", "001", "111", "100", "111"], 3: ["111", "001", "111", "001", "111"],
    4: ["101", "101", "111", "001", "001"], 5: ["111", "100", "111", "001", "111"],
    6: ["111", "100", "111", "101", "111"], 7: ["111", "001", "010", "010", "010"],
    8: ["111", "101", "111", "101", "111"], 9: ["111", "101", "111", "001", "111"],
    N: ["101", "111", "111", "111", "101"], O: ["111", "101", "101", "101", "111"],
    V: ["101", "101", "101", "101", "010"], " ": ["000", "000", "000", "000", "000"],
  };
  function text(ctx, str, x, y, color) {
    ctx.fillStyle = color;
    [...String(str)].forEach((ch, k) => {
      const g = FONT[ch]; if (!g) return;
      g.forEach((row, j) => [...row].forEach((b, i) => { if (b === "1") ctx.fillRect(x + k * 4 + i, y + j, 1, 1); }));
    });
  }

  // ---------- Utilidades de dibujo ----------
  const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

  function bands(ctx, colors, h = GROUND) {
    const bh = Math.ceil(h / colors.length);
    colors.forEach((c, i) => R(ctx, 0, i * bh, W, bh, c));
  }
  function mountain(ctx, cx, baseY, h, col, snow, slope = 1.1) {
    for (let y = 0; y < h; y++) {
      const half = Math.round(y * slope);
      R(ctx, cx - half, baseY - h + y, half * 2 + 1, 1, snow && y < h * 0.28 ? snow : col);
    }
  }
  function pine(ctx, x, baseY, s, col) {
    R(ctx, x - 1, baseY - 3, 2, 3, "#5b3a29");
    for (let k = 0; k < 3; k++) {
      const top = baseY - 3 - (k + 1) * s;
      for (let y = 0; y < s + 2; y++) R(ctx, x - Math.round(y * 0.8), top + y, Math.round(y * 1.6) + 1, 1, col);
    }
  }
  function stars(ctx, t, n = 30, maxY = 70) {
    for (let i = 0; i < n; i++) {
      const x = (i * 97 + i * i * 13 + 7) % W, y = (i * 61 + i * i * 7 + 3) % maxY;
      const on = Math.sin(t * 2 + i * 1.7) > -0.3;
      R(ctx, x, y, 1, 1, on ? "#fff6c9" : "#8c7bbd");
    }
  }
  function moon(ctx, x, y, r, cut) {
    ctx.fillStyle = "#fff3c4";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    if (cut) { ctx.fillStyle = cut; ctx.beginPath(); ctx.arc(x + r * 0.55, y - r * 0.3, r * 0.85, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.fillStyle = "#e9dca8"; ctx.fillRect(x - 3, y - 2, 2, 2); ctx.fillRect(x + 2, y + 2, 3, 2); }
  }
  function cloud(ctx, x, y, c = "#ffffff") {
    R(ctx, x, y + 2, 18, 4, c); R(ctx, x + 3, y, 8, 3, c); R(ctx, x + 9, y - 1, 6, 4, c);
  }
  function grass(ctx, top = GROUND, c1 = "#5bbf5a", c2 = "#3f9c4a") {
    R(ctx, 0, top, W, H - top, c1);
    for (let i = 0; i < 40; i++) R(ctx, (i * 37) % W, top + 2 + ((i * 7) % (H - top - 3)), 1, 2, c2);
  }
  function flowers(ctx) {
    const cols = ["#ff7aa0", "#fff07a", "#ffffff", "#b38bff"];
    for (let i = 0; i < 14; i++) R(ctx, (i * 23 + 5) % W, GROUND + 4 + ((i * 11) % 14), 1, 1, cols[i % 4]);
  }
  function floor(ctx, c1, c2) {
    R(ctx, 0, GROUND, W, H - GROUND, c1);
    for (let x = 0; x < W; x += 16) R(ctx, x, GROUND, 1, H - GROUND, c2);
    R(ctx, 0, GROUND, W, 1, c2);
  }
  function glass(ctx, kind, x, y) {
    // vaso/copa de 6x9 sobre (x,y) = base
    const G = "#d9f1ff";
    if (kind === "wine") { R(ctx, x, y - 9, 6, 4, "#8e1b3a"); R(ctx, x + 2, y - 5, 2, 4, G); R(ctx, x, y - 1, 6, 1, G); return; }
    if (kind === "tequila") { R(ctx, x + 1, y - 5, 4, 5, G); R(ctx, x + 1, y - 4, 4, 4, "#f0c35a"); R(ctx, x + 4, y - 7, 2, 2, "#9be36b"); return; }
    const fill = { beer: "#f4b730", milk: "#ffffff", choco: "#7a4a33", shake: "#ff9fc4", agua: "#9fdcff", cafe: "#5b3a29", limonada: "#f6f08a", rompope: "#f3df9a", gas: "#cfefff", chai: "#c9925e", jamaica: "#b3204a", soda: "#ff7a9a" }[kind] || "#ffffff";
    R(ctx, x, y - 9, 6, 9, G); R(ctx, x + 1, y - 7, 4, 7, fill);
    if (kind === "beer") R(ctx, x, y - 10, 6, 2, "#ffffff");
    if (kind === "gas") { R(ctx, x + 2, y - 5, 1, 1, "#ffffff"); R(ctx, x + 3, y - 3, 1, 1, "#ffffff"); R(ctx, x + 2, y - 2, 1, 1, "#ffffff"); }
    if (kind === "shake" || kind === "milk") R(ctx, x + 4, y - 13, 1, 5, "#ff4f7d");
  }

  // ---------- Escenarios ----------
  const scenes = {
    noche(ctx, t) {
      bands(ctx, ["#1a1640", "#251d55", "#322669", "#43307c"]);
      stars(ctx, t, 40, 80);
      moon(ctx, 134, 18, 7, "#1a1640");
      mountain(ctx, 30, GROUND, 30, "#2b2558");
      mountain(ctx, 110, GROUND, 40, "#2f2860");
      grass(ctx, GROUND, "#2e6b4a", "#24563c");
    },
    puerta(ctx, t) {
      bands(ctx, ["#8fd3ff", "#a6dcff", "#bfe6ff", "#d6f0ff"]);
      cloud(ctx, ((t * 4) % 200) - 30, 14); cloud(ctx, ((t * 3 + 90) % 200) - 30, 30);
      mountain(ctx, 40, GROUND, 34, "#7fb48a", "#ffffff");
      mountain(ctx, 120, GROUND, 44, "#6aa37a", "#ffffff");
      grass(ctx); flowers(ctx);
      // cerca + portón
      for (let x = 0; x < W; x += 8) if (x < 56 || x > 96) { R(ctx, x, 84, 2, 16, "#c58b5a"); }
      R(ctx, 0, 88, 56, 2, "#c58b5a"); R(ctx, 98, 88, 62, 2, "#c58b5a");
      R(ctx, 56, 70, 3, 30, "#8d5a37"); R(ctx, 94, 70, 3, 30, "#8d5a37");
      R(ctx, 56, 68, 41, 4, "#8d5a37");
      for (let x = 60; x < 94; x += 5) R(ctx, x, 74, 2, 26, "#e0a777");
      HEART && ctx.drawImage(HEART, 74, 61);
    },
    mapa(ctx, t) {
      bands(ctx, ["#9fdcff", "#b4e5ff", "#c8edff", "#dcf5ff"]);
      cloud(ctx, ((t * 4) % 200) - 30, 12); cloud(ctx, ((t * 2.5 + 80) % 200) - 30, 26, "#f4fbff");
      mountain(ctx, 20, 92, 26, "#86c08f"); mountain(ctx, 140, 92, 30, "#79b585");
      grass(ctx, 88); flowers(ctx);
      R(ctx, 0, 100, W, 6, "#e3c08d"); R(ctx, 76, 88, 8, 32, "#e3c08d");
      // poste con flechas
      R(ctx, 100, 60, 3, 40, "#8d5a37");
      const arrows = [["#ff7aa0", -1], ["#7ad3ff", 1], ["#ffd36b", -1], ["#a98bff", 1], ["#ff9b5a", -1], ["#7fe0a3", 1]];
      arrows.forEach(([c, d], i) => {
        const y = 60 + i * 5 + (Math.sin(t * 3 + i) > 0.95 ? -1 : 0);
        if (d > 0) { R(ctx, 103, y, 14, 4, c); R(ctx, 117, y + 1, 2, 2, c); }
        else { R(ctx, 86, y, 14, 4, c); R(ctx, 84, y + 1, 2, 2, c); }
      });
    },
    montana(ctx, t) {
      bands(ctx, ["#7cc8ff", "#93d3ff", "#aadcff", "#c2e7ff"]);
      R(ctx, 18, 10, 12, 12, "#ffe66b"); R(ctx, 16, 14, 16, 4, "#ffe66b"); R(ctx, 22, 8, 4, 16, "#ffe66b");
      cloud(ctx, ((t * 5) % 220) - 40, 18); cloud(ctx, ((t * 3 + 120) % 220) - 40, 8);
      mountain(ctx, 50, 92, 52, "#6b8fb5", "#ffffff", 1.0);
      mountain(ctx, 110, 92, 62, "#5a7fa8", "#ffffff", 1.0);
      mountain(ctx, 150, 92, 40, "#7aa0c4", "#ffffff", 1.0);
      R(ctx, 0, 86, W, 8, "#7ccf6f");
      grass(ctx, 92, "#62c25e", "#46a34f"); flowers(ctx);
      R(ctx, 0, 103, W, 3, "#d8b98a");
      pine(ctx, 8, 92, 4, "#2f7d4a"); pine(ctx, 150, 94, 5, "#2f7d4a");
    },
    cabana(ctx, t) {
      bands(ctx, ["#3d2b6b", "#6b3f86", "#b45f8f", "#f2948a", "#ffc48a"]);
      stars(ctx, t, 12, 22);
      mountain(ctx, 30, 90, 46, "#4a3f78", "#e9e0ff");
      mountain(ctx, 120, 90, 56, "#3e3570", "#e9e0ff");
      grass(ctx, 90, "#3f7d55", "#2f6544");
      R(ctx, 0, 103, W, 3, "#9e7b5a");
      pine(ctx, 10, 96, 6, "#1f5a3d"); pine(ctx, 26, 92, 5, "#24613f"); pine(ctx, 148, 96, 6, "#1f5a3d");
      // cabaña
      const cx = 92;
      R(ctx, cx, 70, 40, 28, "#8a5634");
      for (let y = 72; y < 98; y += 4) R(ctx, cx, y, 40, 1, "#6e4127");
      for (let y = 0; y < 16; y++) R(ctx, cx - 4 + y, 54 + y, 48 - y * 2, 1, "#5b2e2e");
      R(ctx, cx + 30, 52, 5, 12, "#7a6a6a");
      R(ctx, cx + 16, 82, 8, 16, "#4a2b1a");
      const glow = Math.sin(t * 6) > 0 ? "#ffd36b" : "#ffc34a";
      R(ctx, cx + 4, 76, 8, 8, glow); R(ctx, cx + 28, 76, 8, 8, glow);
      R(ctx, cx + 7, 76, 1, 8, "#6e4127"); R(ctx, cx + 31, 76, 1, 8, "#6e4127");
    },
    cena(ctx, t) {
      R(ctx, 0, 0, W, GROUND, "#5a1f35");
      for (let x = 4; x < W; x += 12) R(ctx, x, 0, 1, GROUND, "#6b2741");
      // ventana con luna
      R(ctx, 16, 14, 40, 34, "#3a1426"); R(ctx, 18, 16, 36, 30, "#1c1a48");
      stars(ctx, t, 8, 0); for (let i = 0; i < 6; i++) R(ctx, 20 + i * 6, 18 + ((i * 7) % 24), 1, 1, "#fff6c9");
      R(ctx, 42, 20, 7, 7, "#fff3c4"); R(ctx, 35, 16, 1, 30, "#3a1426"); R(ctx, 18, 30, 36, 1, "#3a1426");
      // guirnalda de luces
      for (let x = 0; x < W; x += 8) R(ctx, x, 6 + (x % 16 ? 2 : 0), 2, 2, Math.sin(t * 4 + x) > 0 ? "#ffd36b" : "#ff9fb0");
      floor(ctx, "#7a4a33", "#5f3826");
      // mesa
      R(ctx, 88, 78, 56, 6, "#ffffff"); R(ctx, 88, 84, 56, 8, "#f1e4ee");
      R(ctx, 94, 92, 3, 8, "#4a2b1a"); R(ctx, 136, 92, 3, 8, "#4a2b1a");
      R(ctx, 96, 76, 10, 2, "#dcdcdc"); R(ctx, 126, 76, 10, 2, "#dcdcdc");
      R(ctx, 99, 74, 4, 2, "#ff9b5a"); R(ctx, 129, 74, 4, 2, "#e8d36b");
      // velas
      [112, 118].forEach((x, i) => {
        R(ctx, x, 68, 2, 10, "#fff3c4");
        const f = Math.sin(t * 12 + i * 2) > 0;
        R(ctx, x, f ? 64 : 65, 2, f ? 4 : 3, "#ffb03b"); R(ctx, x, 66, 2, 1, "#fff07a");
      });
      R(ctx, 114, 62 + Math.round(Math.sin(t * 2)), 1, 1, "#ffe7a0");
      // flor
      R(ctx, 115, 70, 1, 8, "#3f9c4a"); R(ctx, 114, 68, 3, 3, "#ff3d6e");
    },
    juegos(ctx, t) {
      R(ctx, 0, 0, W, GROUND, "#3b2d6b");
      for (let y = 8; y < GROUND; y += 16) for (let x = (y / 8) % 2 ? 0 : 8; x < W; x += 16) R(ctx, x, y, 2, 2, "#4a3a82");
      floor(ctx, "#6a4b8a", "#583c75");
      // tapete
      R(ctx, 20, 104, 120, 10, "#ff7aa0"); R(ctx, 22, 106, 116, 6, "#ff9fc4");
      // mueble + TV
      R(ctx, 92, 80, 54, 20, "#8a5634"); R(ctx, 94, 84, 22, 12, "#6e4127"); R(ctx, 120, 84, 24, 12, "#6e4127");
      R(ctx, 96, 42, 46, 36, "#20203a"); R(ctx, 99, 45, 40, 30, "#0f1630");
      R(ctx, 117, 78, 4, 2, "#20203a");
      // mini juego en la tele: corazón que salta obstáculos
      const gx = 99, gy = 45;
      R(ctx, gx, gy + 24, 40, 6, "#2f7d4a");
      const ox = 40 - ((t * 30) % 52);
      R(ctx, gx + Math.max(0, ox), gy + 20, 3, 4, "#ffd36b");
      const jump = Math.max(0, Math.sin(t * 6)) * 8;
      ctx.drawImage(HEART_S, gx + 8, gy + 20 - Math.round(jump));
      text(ctx, String(Math.floor(t * 10) % 1000).padStart(3, "0"), gx + 2, gy + 2, "#7fe0a3");
      // consola y control
      R(ctx, 128, 90, 12, 4, "#d8d0e0"); R(ctx, 70, 104, 8, 3, "#20203a"); R(ctx, 71, 103, 2, 1, "#ff3d6e");
      // palomitas
      R(ctx, 30, 96, 10, 8, "#ff3d6e"); R(ctx, 32, 96, 2, 8, "#ffffff"); R(ctx, 36, 96, 2, 8, "#ffffff");
      R(ctx, 30, 93, 10, 3, "#fff6c9"); R(ctx, 32, 91, 3, 2, "#fff6c9"); R(ctx, 35, 92, 3, 2, "#ffffff");
    },
    volcanes(ctx, t) {
      bands(ctx, ["#3a1f4a", "#6b2a4a", "#a8433f", "#e0703a", "#f7a34a"]);
      R(ctx, 130, 10, 8, 8, "#ffe1a0");
      // volcán
      for (let y = 0; y < 62; y++) {
        const half = 10 + Math.round(y * 0.9);
        R(ctx, 80 - half, 38 + y, half * 2, 1, y < 4 ? "#ff5a2a" : "#4a2e2a");
      }
      for (let y = 0; y < 62; y += 3) R(ctx, 80 - 10 - Math.round(y * 0.9) + 4, 38 + y, 2, 1, "#5d3a33");
      // lava que baja
      const lv = (t * 10) % 40;
      R(ctx, 76, 40, 3, 8 + lv / 2, "#ff7a2a"); R(ctx, 84, 40, 2, 4 + lv / 3, "#ffb03b");
      R(ctx, 72, 52, 2, 10 + lv / 4, "#ff5a2a");
      // humo
      for (let i = 0; i < 5; i++) {
        const k = (t * 0.6 + i / 5) % 1;
        const s = 3 + Math.round(k * 6);
        R(ctx, 78 + Math.sin(k * 6 + i) * 4 - s / 2, 36 - k * 34, s, s, `rgba(90,80,90,${0.8 - k * 0.7})`);
      }
      grass(ctx, GROUND, "#3d2a2a", "#2b1d1d");
      for (let i = 0; i < 10; i++) R(ctx, (i * 31) % W, 104 + (i % 3) * 4, 3, 1, "#ff7a2a");
    },
    cine(ctx, t) {
      R(ctx, 0, 0, W, H, "#140f24");
      R(ctx, 0, 0, 14, 90, "#8e1b3a"); R(ctx, 146, 0, 14, 90, "#8e1b3a");
      for (let y = 0; y < 90; y += 6) { R(ctx, 4, y, 1, 6, "#6b1430"); R(ctx, 154, y, 1, 6, "#6b1430"); }
      // pantalla
      const flick = 0.85 + Math.sin(t * 20) * 0.05;
      R(ctx, 18, 6, 124, 52, "#d9d9e8");
      ctx.globalAlpha = flick; R(ctx, 20, 8, 120, 48, "#bfe6ff"); ctx.globalAlpha = 1;
      R(ctx, 20, 44, 120, 12, "#8fd18a");
      mountain(ctx, 60, 44, 16, "#7aa0c4", "#ffffff"); mountain(ctx, 110, 44, 22, "#6b8fb5", "#ffffff");
      const mx = 20 + ((t * 18) % 140) - 20;
      ctx.save(); ctx.beginPath(); ctx.rect(20, 8, 120, 48); ctx.clip();
      ctx.drawImage(COW[Math.floor(t * 4) % 2 ? "a" : "b"], Math.round(mx), 34);
      ctx.restore();
      // haz del proyector
      ctx.globalAlpha = 0.08; ctx.fillStyle = "#fff6c9";
      ctx.beginPath(); ctx.moveTo(80, 120); ctx.lineTo(20, 8); ctx.lineTo(140, 8); ctx.fill(); ctx.globalAlpha = 1;
      // butacas
      for (let row = 0; row < 3; row++) for (let x = 2 + row * 4; x < W; x += 14) {
        if (x > 66 && x < 86) continue;
        R(ctx, x, 86 + row * 11, 11, 9, row % 2 ? "#a3203f" : "#c22a4d"); R(ctx, x + 1, 86 + row * 11, 9, 2, "#e04b6b");
      }
      R(ctx, 70, GROUND, 14, 20, "#2a1f3d");
    },
    barra(ctx, t) {
      R(ctx, 0, 0, W, GROUND, "#2f6f73");
      for (let x = 0; x < W; x += 10) R(ctx, x, 0, 5, GROUND, "#2a6468");
      // letrero
      R(ctx, 50, 8, 60, 14, "#20203a");
      const neon = Math.sin(t * 5) > -0.6 ? "#ff7aa0" : "#7a3550";
      R(ctx, 54, 12, 52, 1, neon); R(ctx, 54, 18, 52, 1, neon);
      ctx.drawImage(HEART_S, 62, 13); ctx.drawImage(HEART_S, 76, 13); ctx.drawImage(HEART_S, 90, 13);
      // repisa con botellas y cartón de leche
      R(ctx, 20, 46, 120, 3, "#8a5634");
      const bot = ["#2f7d4a", "#8e1b3a", "#c58b2a", "#2f7d4a", "#6b3f86"];
      bot.forEach((c, i) => { R(ctx, 26 + i * 12, 34, 6, 12, c); R(ctx, 28 + i * 12, 30, 2, 4, c); });
      R(ctx, 100, 32, 12, 14, "#ffffff"); R(ctx, 100, 30, 12, 3, "#7ad3ff"); R(ctx, 103, 36, 6, 5, "#2b2233");
      R(ctx, 104, 37, 2, 2, "#ffffff"); R(ctx, 118, 34, 10, 12, "#7a4a33"); R(ctx, 120, 37, 6, 3, "#fff6c9");
      floor(ctx, "#8a5634", "#6e4127");
      // barra
      R(ctx, 70, 76, 90, 6, "#c58b5a"); R(ctx, 74, 82, 86, 18, "#8a5634");
      for (let x = 80; x < W; x += 14) R(ctx, x, 84, 1, 14, "#6e4127");
    },
    calendario(ctx, t, s) {
      R(ctx, 0, 0, W, GROUND, "#ffe7ef");
      for (let x = 0; x < W; x += 8) R(ctx, x, 0, 4, GROUND, "#ffdce8");
      floor(ctx, "#c58b5a", "#a8714a");
      // hoja del calendario
      const x0 = 40, y0 = 6;
      R(ctx, x0 - 2, y0 + 2, 104, 84, "#d7b5c4");
      R(ctx, x0, y0, 102, 82, "#ffffff");
      R(ctx, x0, y0, 102, 12, "#ff4f7d");
      text(ctx, "NOV 2026", x0 + 36, y0 + 4, "#ffffff");
      R(ctx, x0 + 20, y0 - 3, 2, 6, "#8a8a9a"); R(ctx, x0 + 80, y0 - 3, 2, 6, "#8a8a9a");
      const hi = (s.fechasDias || []);
      for (let d = 1; d <= 30; d++) {
        const idx = d - 1, col = idx % 7, row = Math.floor(idx / 7);
        const cx = x0 + 3 + col * 14, cy = y0 + 16 + row * 13;
        const sel = s.fechaSel === d;
        if (hi.includes(d)) {
          const pulse = Math.sin(t * 5 + d) > 0;
          R(ctx, cx - 1, cy - 1, 13, 12, sel ? "#ff4f7d" : pulse ? "#ffd1df" : "#ffe4ec");
          ctx.drawImage(HEART_S, cx + 8, cy - 2);
        }
        text(ctx, d, cx + (d < 10 ? 3 : 1), cy + 2, sel ? "#ffffff" : col === 0 || col === 6 ? "#ff4f7d" : "#5a4a6a");
      }
    },
    cielo(ctx, t) {
      bands(ctx, ["#120e33", "#1d1650", "#2b1f66", "#3d2a7a", "#57348a"]);
      stars(ctx, t, 50, 90);
      moon(ctx, 29, 17, 8);
      mountain(ctx, 120, GROUND, 36, "#2b2558", "#d6ccff");
      mountain(ctx, 40, GROUND, 26, "#241f4d");
      grass(ctx, GROUND, "#2e6b4a", "#24563c");
      for (let i = 0; i < 8; i++) {
        const k = (t * 0.3 + i / 8) % 1;
        R(ctx, (i * 41) % W, 96 - k * 40, 1, 1, Math.sin(t * 8 + i) > 0 ? "#fff07a" : "#c8ff7a");
      }
    },
  };

  KI.sprites = { W, H, GROUND, GIRL, MUSTACHE, COW, WING_UP, WING_DN, ENVELOPE, HEART, HEART_S, glass, scenes, R };
})();
