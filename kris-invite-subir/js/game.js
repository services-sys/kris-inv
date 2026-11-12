/* Motor + historia de la invitación */
(function () {
  const C = window.KRIS_CONFIG;
  const { W, H, GROUND, GIRL, MUSTACHE, COW, WING_UP, WING_DN, ENVELOPE, HEART, HEART_S, glass, scenes } = KI.sprites;
  const audio = KI.audio, sfx = KI.audio.sfx, store = KI.storage;

  const cv = document.getElementById("screen");
  const ctx = cv.getContext("2d");
  const stage = document.getElementById("stage");
  const textEl = document.getElementById("text");
  const speakerEl = document.getElementById("speaker");
  const choicesEl = document.getElementById("choices");
  const dialogEl = document.getElementById("dialog");

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = (fn) => new Promise((r) => { const ch = () => (fn() ? r() : requestAnimationFrame(ch)); ch(); });

  // ------------------------------------------------------------ estado
  const S = {
    scene: "noche", t: 0, fade: 0, fadeTo: 0, shake: 0, siren: false,
    girl: { x: -20, tx: -20, face: 1, jump: 0, vy: 0, show: true, milk: false, happy: 0, speed: 42, stepT: 0 },
    cows: [], particles: [], glass: null, flyCow: null, envelope: null,
    fechasDias: C.fechas.map((f) => f.dia), fechaSel: null,
  };

  // ------------------------------------------------------------ partículas
  function burst(x, y, n = 10, kind = "heart") {
    for (let i = 0; i < n; i++) {
      S.particles.push({
        x, y, vx: (Math.random() - 0.5) * 50, vy: -20 - Math.random() * 40,
        life: 1.2 + Math.random(), kind,
        color: ["#ff4f7d", "#ffd36b", "#7ad3ff", "#b38bff", "#7fe0a3"][i % 5],
      });
    }
  }
  function confetti() { for (let i = 0; i < 60; i++) S.particles.push({ x: Math.random() * W, y: -Math.random() * 40, vx: (Math.random() - 0.5) * 20, vy: 20 + Math.random() * 30, life: 4, kind: "dot", color: ["#ff4f7d", "#ffd36b", "#7ad3ff", "#b38bff", "#7fe0a3", "#ffffff"][i % 6] }); }

  // ------------------------------------------------------------ globos de texto (HTML sobre el canvas)
  function bubble(txt, x, y, ms = 1600) {
    const b = document.createElement("div");
    b.className = "bubble";
    b.textContent = txt;
    b.style.left = (x / W) * 100 + "%";
    b.style.top = (y / H) * 100 + "%";
    document.getElementById("bubbles").appendChild(b);
    setTimeout(() => b.remove(), ms);
  }

  // ------------------------------------------------------------ bucle principal
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; S.t += dt;
    update(dt); draw();
    requestAnimationFrame(loop);
  }

  function update(dt) {
    const g = S.girl;
    const dx = g.tx - g.x;
    if (Math.abs(dx) > 0.5) {
      g.x += Math.sign(dx) * Math.min(Math.abs(dx), g.speed * dt);
      g.face = Math.sign(dx);
      g.stepT += dt; if (g.stepT > 0.22) { g.stepT = 0; sfx.step(); }
    } else g.x = g.tx;
    if (g.jump > 0 || g.vy !== 0) { g.vy -= 260 * dt; g.jump += g.vy * dt; if (g.jump <= 0) { g.jump = 0; g.vy = 0; } }
    if (g.happy > 0) g.happy -= dt;

    S.cows.forEach((c) => {
      if (c.tx == null) return;
      const d = c.tx - c.x;
      if (Math.abs(d) > 0.5) { c.x += Math.sign(d) * Math.min(Math.abs(d), c.speed * dt); c.dir = Math.sign(d); c.moving = true; }
      else { c.moving = false; if (c.wander) { c.tx = 10 + Math.random() * 120; } }
    });

    if (S.flyCow) { const f = S.flyCow; f.x += (f.tx - f.x) * Math.min(1, dt * f.ease); }
    if (S.envelope) {
      const e = S.envelope;
      if (!e.caught) { e.vy += 60 * dt; e.y += e.vy * dt; e.x += Math.sin(S.t * 6) * 0.4; if (e.y >= e.ty) { e.y = e.ty; e.caught = true; } }
    }

    S.particles.forEach((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.kind === "heart") p.vy += 15 * dt; else if (p.kind === "dot") p.vx += Math.sin(S.t * 3 + p.y) * 0.5;
      else if (p.kind === "smoke") { p.vx *= 0.98; }
    });
    S.particles = S.particles.filter((p) => p.life > 0 && p.y < H + 10);

    // humo de chimenea / chispas de volcán
    if (S.scene === "cabana" && Math.random() < dt * 4) S.particles.push({ x: 124 + Math.random() * 3, y: 50, vx: 4 + Math.random() * 4, vy: -8, life: 3, kind: "smoke", color: "#d8d0e0" });
    if (S.scene === "volcanes" && Math.random() < dt * 3) S.particles.push({ x: 78 + Math.random() * 6, y: 38, vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 20, life: 1.5, kind: "spark", color: Math.random() > 0.5 ? "#ffb03b" : "#ff5a2a" });

    S.fade += (S.fadeTo - S.fade) * Math.min(1, dt * 8);
    if (S.shake > 0) S.shake -= dt;
  }

  function drawCow(c) {
    const spr = c.moving && Math.floor(S.t * 6) % 2 ? COW.b : COW.a;
    const y = (c.y ?? GROUND) - 12 - (c.moving ? Math.floor(S.t * 6) % 2 : 0);
    ctx.save();
    if (c.dir < 0) { ctx.translate(Math.round(c.x) + 20, 0); ctx.scale(-1, 1); ctx.drawImage(spr, 0, y); }
    else ctx.drawImage(spr, Math.round(c.x), y);
    ctx.restore();
    if (c.siren) {
      const hx = c.dir < 0 ? c.x + 2 : c.x + 15;
      const on = Math.floor(S.t * 8) % 2;
      KI.sprites.R(ctx, hx, y - 3, 2, 2, on ? "#ff2d2d" : "#2d6bff");
      KI.sprites.R(ctx, hx + 2, y - 3, 2, 2, on ? "#2d6bff" : "#ff2d2d");
    }
  }

  function drawGirl() {
    const g = S.girl;
    if (!g.show) return;
    const moving = Math.abs(g.tx - g.x) > 0.5;
    let spr = GIRL.idle;
    if (moving) spr = Math.floor(S.t * 8) % 2 ? GIRL.walkA : GIRL.walkB;
    else if (g.happy > 0 || g.jump > 0) spr = GIRL.happy;
    else if (S.t % 3.2 < 0.12) spr = GIRL.blink;
    const x = Math.round(g.x) - 7;
    const y = GROUND - spr.height - Math.round(g.jump) + (moving ? Math.floor(S.t * 8) % 2 : 0);
    ctx.save();
    if (g.face < 0) { ctx.translate(x + spr.width, 0); ctx.scale(-1, 1); ctx.drawImage(spr, 0, y); if (g.milk) ctx.drawImage(MUSTACHE, 0, y + 11); }
    else { ctx.drawImage(spr, x, y); if (g.milk) ctx.drawImage(MUSTACHE, x, y + 11); }
    ctx.restore();
  }

  function draw() {
    ctx.save();
    if (S.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * 4), Math.round((Math.random() - 0.5) * 3));
    (scenes[S.scene] || scenes.noche)(ctx, S.t, S);
    if (S.glass) glass(ctx, S.glass, 112, 76);
    S.cows.forEach(drawCow);
    drawGirl();

    if (S.flyCow) {
      const f = S.flyCow;
      const y = f.y + Math.sin(S.t * 4) * 3;
      const flap = Math.floor(S.t * 10) % 2;
      ctx.drawImage(COW.a, Math.round(f.x), Math.round(y));
      ctx.drawImage(flap ? WING_UP : WING_DN, Math.round(f.x) + 4, Math.round(y) - 4);
      if (f.carry) ctx.drawImage(ENVELOPE, Math.round(f.x) + 19, Math.round(y) + 6);
      if (Math.random() < 0.3) S.particles.push({ x: f.x, y: y + 6, vx: -10, vy: 0, life: 0.8, kind: "spark", color: "#fff6c9" });
    }
    if (S.envelope) ctx.drawImage(ENVELOPE, Math.round(S.envelope.x), Math.round(S.envelope.y));

    S.particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
      if (p.kind === "heart") ctx.drawImage(p.big ? HEART : HEART_S, Math.round(p.x), Math.round(p.y));
      else { ctx.fillStyle = p.color; const s = p.kind === "smoke" ? 3 : 1; ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s); }
    });
    ctx.globalAlpha = 1;

    if (S.siren) { ctx.fillStyle = Math.floor(S.t * 6) % 2 ? "rgba(255,40,40,0.18)" : "rgba(40,90,255,0.18)"; ctx.fillRect(0, 0, W, H); }
    if (S.fade > 0.01) { ctx.fillStyle = `rgba(10,6,24,${S.fade})`; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }

  // ------------------------------------------------------------ diálogos
  let skipTyping = false;
  dialogEl.addEventListener("pointerdown", (e) => { if (!e.target.closest("button, input, textarea")) skipTyping = true; });

  function type(txt, speaker) {
    speakerEl.textContent = speaker || "";
    speakerEl.hidden = !speaker;
    choicesEl.innerHTML = "";
    choicesEl.dataset.cols = 1;
    return new Promise((res) => {
      const chars = [...txt];
      let i = 0;
      skipTyping = false;
      textEl.textContent = "";
      const tick = () => {
        if (skipTyping) { textEl.textContent = txt; return res(); }
        textEl.textContent += chars[i++];
        if (i % 2 === 0 && chars[i - 1] !== " ") sfx.blip();
        if (i < chars.length) setTimeout(tick, 26); else res();
      };
      tick();
    });
  }

  function button(label, cls = "") {
    const b = document.createElement("button");
    b.className = "btn " + cls;
    b.innerHTML = label;
    choicesEl.appendChild(b);
    return b;
  }

  async function say(txt, speaker) {
    await type(txt, speaker);
    return new Promise((res) => {
      const b = button("▶", "next");
      b.focus({ preventScroll: true });
      b.onclick = () => { sfx.select(); choicesEl.innerHTML = ""; res(); };
    });
  }

  async function ask(txt, options, { speaker, cols = 1, evasive } = {}) {
    await type(txt, speaker);
    choicesEl.dataset.cols = cols;
    return new Promise((res) => {
      options.forEach((o) => {
        const b = button(o.label, o.cls || "");
        if (o.value === evasive) runAway(b, () => res(o.value));
        else b.onclick = () => { sfx.select(); choicesEl.innerHTML = ""; choicesEl.dataset.cols = 1; res(o.value); };
      });
    });
  }

  // El botón "No" que huye 😏
  function runAway(b, give) {
    let n = 0;
    const flee = (e) => {
      e.preventDefault();
      n++;
      sfx.pop();
      if (n >= 4) { b.innerHTML = "Ok, sí 💖 (me rindo)"; b.style.transform = ""; b.onpointerdown = null; b.onmouseenter = null; b.onclick = () => { sfx.select(); choicesEl.innerHTML = ""; give(); }; return; }
      const dx = (Math.random() - 0.5) * 160, dy = (Math.random() - 0.5) * 40;
      b.style.transform = `translate(${dx}px, ${dy}px) rotate(${(Math.random() - 0.5) * 20}deg)`;
      const msgs = ["¡Nop! 🙈", "Ese botón está en mantenimiento 🔧", "La vaquita se lo comió 🐄"];
      b.innerHTML = msgs[(n - 1) % msgs.length];
    };
    b.onpointerdown = flee;
    b.onmouseenter = flee;
  }

  async function input(txt, { speaker, placeholder = "", multiline = false, max = 300, okLabel = "Enviar ✉️", skipLabel } = {}) {
    await type(txt, speaker);
    return new Promise((res) => {
      const f = document.createElement(multiline ? "textarea" : "input");
      f.className = "field";
      f.placeholder = placeholder;
      f.maxLength = max;
      if (!multiline) { f.type = "text"; f.autocomplete = "off"; f.autocapitalize = "off"; f.spellcheck = false; }
      choicesEl.appendChild(f);
      setTimeout(() => f.focus({ preventScroll: true }), 50);
      const ok = button(okLabel, "primary");
      const send = () => { const v = f.value.trim(); if (!v && !skipLabel) { f.classList.add("shake"); setTimeout(() => f.classList.remove("shake"), 400); return; } sfx.select(); choicesEl.innerHTML = ""; res(v); };
      ok.onclick = send;
      if (!multiline) f.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
      if (skipLabel) { const s = button(skipLabel); s.onclick = () => { sfx.select(); choicesEl.innerHTML = ""; res(""); }; }
    });
  }

  // ------------------------------------------------------------ acciones del personaje
  const walkTo = async (x) => { S.girl.tx = x; await until(() => Math.abs(S.girl.x - S.girl.tx) < 0.6); };
  const jump = (h = 70) => { S.girl.vy = h; S.girl.jump = 0.1; S.girl.happy = 0.8; };
  const hearts = (n = 8) => { sfx.heart(); burst(S.girl.x, GROUND - 26, n); };
  const moveCow = async (c, x) => { c.tx = x; await until(() => Math.abs(c.x - c.tx) < 0.6); };

  async function travel(scene, { enterX = 46 } = {}) {
    S.girl.speed = 75;
    await walkTo(W + 14);
    S.fadeTo = 1; await wait(380);
    S.scene = scene; S.cows = []; S.glass = null; S.particles = [];
    S.girl.x = -14; S.girl.tx = -14;
    S.fadeTo = 0;
    await walkTo(enterX);
    S.girl.speed = 42;
  }

  // ------------------------------------------------------------ contenido
  const TEMAS = [
    { id: "montana", nombre: "Montaña y vaquitas", emoji: "🐄⛰️", texto: "Caminata por la montaña, aire fresco y vaquitas por todos lados. Prometo saludar a cada una por su nombre." },
    { id: "cabana", nombre: "Cabaña en la montaña", emoji: "🏡🌲", texto: "Una cabaña entre pinos, chocolate caliente y cobijas. Nivel de comodidad: legendario." },
    { id: "cena", nombre: "Cena romántica", emoji: "🕯️🍝", texto: "Velitas, comida rica y una conversación de esas que se alargan sin darnos cuenta." },
    { id: "juegos", nombre: "Videojuegos o pelis", emoji: "🎮🍿", texto: "Modo cooperativo: controles, palomitas y maratón. Te dejo ganar… tal vez." },
    { id: "volcanes", nombre: "Volcanes", emoji: "🌋", texto: "Ver un volcán de cerca. Esto se va a poner caliente… geológicamente hablando. 🤓" },
    { id: "cine", nombre: "Cine", emoji: "📽️", texto: "Pantalla gigante, palomitas y yo intentando no comentar toda la película." },
  ];

  const BEBIDAS = [
    { id: "wine", label: "Vino tinto 🍷", alcohol: true, nombre: "vino" },
    { id: "beer", label: "Cerveza bien fría 🍺", alcohol: true, nombre: "cerveza" },
    { id: "gas", label: "Agua mineral con gas 🫧" },
    { id: "choco", label: "Chocolate caliente ☕" },
    { id: "chai", label: "Té chai 🍵" },
    { id: "jamaica", label: "Agua de jamaica 🌺" },
    { id: "soda", label: "Soda italiana 🍒" },
    { id: "shake", label: "Malteada de fresa 🍓" },
    { id: "limonada", label: "Limonada con hierbabuena 🍋" },
    { id: "rompope", label: "Rompope 🥛" },
    { id: "otra", label: "Otra… ✍️" },
  ];

  async function themeEffect(tema) {
    switch (tema.id) {
      case "montana": {
        S.cows = [
          { x: 96, tx: 120, y: 102, dir: 1, speed: 8, wander: true },
          { x: 130, tx: 70, y: 110, dir: -1, speed: 6, wander: true },
        ];
        await wait(500); sfx.moo(); bubble("Muuu 💕", 120, 74);
        await wait(700); jump(); hearts(10);
        setTimeout(() => { sfx.moo(1.25); bubble("¡Muu!", 80, 84); }, 1200);
        break;
      }
      case "cabana": sfx.chime(); await wait(300); jump(50); hearts(6); break;
      case "cena": sfx.chime(); await walkTo(76); hearts(12); break;
      case "juegos": sfx.powerup(); await walkTo(60); jump(); break;
      case "volcanes": sfx.rumble(); S.shake = 1.2; await wait(400); burst(80, 36, 18, "spark"); for (let i = 0; i < 25; i++) S.particles.push({ x: 80, y: 38, vx: (Math.random() - 0.5) * 70, vy: -50 - Math.random() * 40, life: 2, kind: "spark", color: i % 2 ? "#ffb03b" : "#ff5a2a" }); await wait(500); jump(); break;
      case "cine": sfx.clack(); await walkTo(77); hearts(6); break;
    }
  }

  // ------------------------------------------------------------ escenas de la historia
  async function start() {
    S.scene = "noche";
    S.girl.show = false;
    await type("Una invitación MUY importante te espera… 💌", "");
    return new Promise((res) => {
      const b = button("▶ PRESIONA START", "primary start");
      b.onclick = () => { audio.init(); sfx.powerup(); audio.music(true); res(); };
    });
  }

  async function gate() {
    S.fadeTo = 1; await wait(300);
    S.scene = "puerta"; S.girl.show = false;
    const guard = { x: 102, tx: 102, y: 100, dir: -1, speed: 30 };
    S.cows = [guard];
    S.fadeTo = 0;
    await wait(300);
    sfx.moo(); bubble("¡Muu!", 112, 70);
    await say("Alto ahí. Soy la Vaquita Guardiana 🐄🛡️ y esta invitación es solo para una persona.", "Vaquita Guardiana");
    let tries = 0;
    for (;;) {
      const r = await input(C.pregunta, { speaker: "Vaquita Guardiana", placeholder: "Tu respuesta…", okLabel: "Entrar 🔑" });
      const norm = await store.verificar(r);
      if (norm) {
        const docId = await store.sha256("kris-doc:" + norm);
        sfx.sparkle(); burst(112, 80, 12);
        bubble("💖", 112, 70);
        await say(`¡Identidad confirmada! Bienvenida, ${C.para}. ✨ Puedes pasar.`, "Vaquita Guardiana");
        await moveCow(guard, 170);
        return docId;
      }
      tries++;
      sfx.error(); S.shake = 0.4;
      bubble("Muu… 🚫", 112, 70);
      await say(tries >= 3 ? `Muuu… tampoco. Pista: ${C.pista}` : `Muuu… esa no es. Solo ${C.para} puede pasar.`, "Vaquita Guardiana");
    }
  }

  async function intro() {
    S.fadeTo = 1; await wait(350);
    S.scene = "noche"; S.cows = []; S.girl.show = true; S.girl.x = -14; S.girl.tx = -14;
    S.fadeTo = 0;
    await walkTo(54);
    await say(`¡Hola! Soy ${C.para}, tu avatar en esta aventura. 🧠✨`, C.para);
    bubble("❗", S.girl.x, 66); sfx.pop(); jump(60);
    await say(`Acabo de recibir un mensaje misterioso de un tal ${C.de}… 💌`, C.para);
    await say(`«${C.para}: antes llamabas mi atención; ahora, como puedes darte cuenta, tienes toda mi atención. Así que esto es una salida relax, solo de amigos… aunque también es una clara declaración de intenciones de mi parte por conocerte más.»`, C.de);
    const ok = await ask("¿Aceptas la misión?", [
      { label: "¡Acepto! 💪", value: "si", cls: "primary" },
      { label: "No", value: "no" },
    ], { cols: 2, evasive: "no" });
    jump(); hearts(14);
    await say(ok === "si" ? "¡Sabía que dirías que sí! 💖 Vamos al cruce de caminos." : "Jajaja, buen intento. Vamos al cruce de caminos. 💖", "Narrador");
  }

  async function chooseTheme(vistos) {
    await travel("mapa", { enterX: 60 });
    for (;;) {
      const id = await ask("¿Qué tipo de aventura te gustaría? Escoge un camino:", TEMAS.map((t) => ({
        label: `${t.emoji} ${t.nombre}${vistos.includes(t.id) ? " ✓" : ""}`, value: t.id,
      })), { cols: 2 });
      const tema = TEMAS.find((t) => t.id === id);
      if (!vistos.includes(id)) vistos.push(id);
      await travel(tema.id);
      await themeEffect(tema);
      await say(tema.texto, tema.emoji + " " + tema.nombre);
      let detalle = "";
      if (tema.id === "juegos") {
        detalle = await ask("Pregunta importante: ¿control o control remoto?", [
          { label: "🎮 Videojuegos", value: "videojuegos" },
          { label: "🍿 Pelis", value: "pelis" },
          { label: "¡Las dos! 🤩", value: "videojuegos y pelis" },
        ], { cols: 1 });
      }
      const si = await ask("¿Esta es la buena?", [
        { label: "¡Sí, esta! 💖", value: true, cls: "primary" },
        { label: "Quiero ver otra opción ↩", value: false },
      ], { cols: 2 });
      if (si) { jump(); hearts(16); sfx.fanfare(); return { tema, detalle }; }
      await travel("mapa", { enterX: 60 });
    }
  }

  async function chooseDrink() {
    await travel("barra", { enterX: 60 });
    await say("Toda gran aventura empieza con un brindis. 🥂", "Narrador");
    const intentos = [];
    const lines = [
      (b) => `🚨 ¡ALTO! Patrulla Vaquera. Tenemos un reporte: ${C.para} NO toma licor. Ese ${b} queda confiscado.`,
      () => "🚨 Otra vez tú… La vaquita ya está sospechando. 🤨🐄 Confiscado. Tómate tu leche.",
      () => "🚨 Ok, esto ya es reincidencia. La Patrulla Vaquera retira TODO el licor del menú. Por tu propio bien. 🐄👮‍♀️",
    ];
    for (;;) {
      const opts = BEBIDAS.filter((b) => !(b.alcohol && intentos.length >= 3));
      const id = await ask(intentos.length ? "Ahora sí… ¿con qué brindamos de verdad? 😇" : "¿Con qué brindamos?", opts.map((b) => ({ label: b.label, value: b.id })), { cols: 2 });
      let b = BEBIDAS.find((x) => x.id === id);
      if (b.id === "otra") {
        const txt = await input("¿Qué se te antoja? Escríbelo y la vaquita lo consigue. 🐄", { speaker: "Narrador", placeholder: "Ej. café de olla", max: 60, okLabel: "Listo ✅" });
        b = { id: "agua", label: txt };
      }
      S.glass = b.id;
      await walkTo(100);
      if (!b.alcohol) {
        sfx.sparkle(); jump(); hearts(10);
        await say(`Excelente elección: ${b.label}. Aprobado por la vaquita. ✅🐄`, "Narrador");
        const comentario = await input("¿Algún comentario sobre la bebida? (opcional)", {
          speaker: "Narrador", placeholder: "Ej. sin azúcar, bien fría, con canela…", max: 200, okLabel: "Guardar ✅", skipLabel: "Saltar",
        });
        return { bebida: b.label, bebidaComentario: comentario, intentos };
      }
      // --- La Patrulla Vaquera 🚨 ---
      intentos.push(b.label);
      const cop = { x: -24, tx: -24, y: 100, dir: 1, speed: 70, siren: true };
      S.cows = [cop];
      S.siren = true; sfx.siren();
      await moveCow(cop, 64);
      sfx.moo(1.2); S.shake = 0.5;
      bubble("¡MUUU! 🚨", 76, 70);
      await say(lines[intentos.length - 1](b.nombre), "Patrulla Vaquera");
      S.siren = false;
      sfx.whoosh(); burst(114, 66, 10, "dot");
      S.glass = "milk"; S.girl.milk = true;
      sfx.sparkle();
      await say(`La vaquita cambió tu ${b.nombre} por un vaso de leche fresca. 🥛 ¡Salud con bigote de leche!`, "Patrulla Vaquera");
      await moveCow(cop, -30);
      S.cows = []; S.girl.milk = false; S.glass = null;
      await walkTo(60);
    }
  }

  async function chooseDate() {
    await travel("calendario", { enterX: 20 });
    S.fechaSel = null;
    await say("Último paso: ¿qué día nos vamos de aventura? Los corazones marcan los días disponibles. 📅", "Narrador");
    for (;;) {
      const id = await ask("Escoge el día:", [
        ...C.fechas.map((f) => ({ label: "💗 " + f.label, value: f.id })),
        { label: "Ninguno me queda 😢", value: "otra" },
      ]);
      if (id === "otra") {
        const otra = await input("Mmm, bueno… dime tú una fecha y vemos si logramos coincidir. Y si no se da, igual espero que disfrutes mucho lo que queda del 2026. ✨", { speaker: "Narrador", placeholder: "Ej. sábado 28 en la tarde", max: 80 });
        return { fecha: otra, fechaId: "otra" };
      }
      const f = C.fechas.find((x) => x.id === id);
      S.fechaSel = f.dia; sfx.heart(); jump(50);
      const ok = await ask(`${f.label}. ¿Confirmamos?`, [
        { label: "¡Confirmado! 💖", value: true, cls: "primary" },
        { label: "Mejor otro día ↩", value: false },
      ], { cols: 2 });
      if (ok) { hearts(12); return { fecha: f.label, fechaId: f.id }; }
      S.fechaSel = null;
    }
  }

  async function saveAll(docId, data) {
    for (;;) {
      type("Empacando tu respuesta en un sobre… ✉️ 🐄", "Narrador");
      try {
        await store.guardar(docId, data);
        return true;
      } catch (e) {
        console.error(e);
        const again = await ask("Uy, la vaquita mensajera se perdió (¿sin internet?). ¿Lo intentamos otra vez?", [
          { label: "Reintentar 🔁", value: true, cls: "primary" },
          { label: "Continuar igual", value: false },
        ], { cols: 2 });
        if (!again) return false;
      }
    }
  }

  async function finale(data, saved) {
    choicesEl.innerHTML = "";
    await travel("cielo", { enterX: 60 });
    await say(`Y entonces, desde el cielo, se escuchó algo increíble…`, "Narrador");
    choicesEl.innerHTML = ""; textEl.textContent = "…¡MUUUUU! 🐄✨";
    sfx.whoosh(); sfx.moo(1.3);
    S.flyCow = { x: -30, tx: 52, y: 22, ease: 1.2, carry: true };
    await until(() => Math.abs(S.flyCow.x - 52) < 2);
    bubble("¡Correo de Bernal! 💌", 62, 14, 2200);
    await wait(900);
    S.flyCow.carry = false;
    S.envelope = { x: 71, y: 28, vy: 0, ty: 66 };
    sfx.pop();
    await until(() => S.envelope.caught);
    jump(80); hearts(20); sfx.fanfare(); confetti();
    S.flyCow.tx = 200; S.flyCow.ease = 0.8;
    await wait(1000);
    S.envelope = null;
    openLetter(data, saved);
  }

  function openLetter(d, saved) {
    const L = document.getElementById("letter");
    const safe = {};
    Object.keys(d).forEach((k) => (safe[k] = esc(d[k])));
    document.getElementById("letter-body").innerHTML = C.carta(safe);
    document.getElementById("letter-status").textContent = saved
      ? (store.modo() === "demo" ? "Modo demo: guardado solo en este navegador." : `Tu respuesta ya le llegó a ${C.de}. ✅`)
      : "No se pudo enviar. Mándale captura de esta carta a Bernal. 📸";
    L.hidden = false;
    requestAnimationFrame(() => L.classList.add("open"));
    sfx.chime();
    document.getElementById("letter-ok").onclick = async () => {
      sfx.select(); L.classList.remove("open"); setTimeout(() => (L.hidden = true), 400);
      jump(); hearts(20); confetti();
      await say(`¡Es una cita! 💖 Nos vemos el ${d.fecha}. — ${C.de}`, C.de);
      const again = await ask("Fin. ¿Quieres cambiar algo?", [
        { label: "Jugar otra vez 🔁", value: true },
        { label: "Todo perfecto 💖", value: false, cls: "primary" },
      ], { cols: 2 });
      if (again) location.reload();
      else { textEl.textContent = "Nos vemos, " + C.para + "… 💌"; choicesEl.innerHTML = ""; speakerEl.hidden = true; setInterval(() => { if (Math.random() < 0.5) hearts(3); }, 1500); }
    };
  }

  // ------------------------------------------------------------ mute
  const muteBtn = document.getElementById("mute");
  muteBtn.onclick = () => { audio.init(); muteBtn.textContent = audio.toggleMute() ? "🔇" : "🔊"; muteBtn.setAttribute("aria-pressed", audio.muted); };

  // ------------------------------------------------------------ main
  async function main() {
    requestAnimationFrame(loop);
    await start();
    const docId = await gate();
    await intro();
    const vistos = [];
    const { tema, detalle } = await chooseTheme(vistos);
    const { bebida, bebidaComentario, intentos } = await chooseDrink();
    const { fecha, fechaId } = await chooseDate();
    S.fechaSel = null;
    const mensaje = await input(`¿Quieres dejarle un mensajito a ${C.de}? (opcional)`, {
      speaker: "Narrador", placeholder: "Escribe aquí…", multiline: true, max: 600, okLabel: "Enviar ✉️", skipLabel: "Saltar",
    });
    const data = {
      tema: tema.id, temaNombre: tema.nombre, temaDetalle: detalle, bebida, bebidaComentario,
      intentosAlcohol: intentos.join(", "), fecha, fechaId,
      temasVistos: vistos.map((v) => TEMAS.find((t) => t.id === v).nombre).join(", "),
      mensaje, enviado: new Date().toISOString(), version: "1",
    };
    const saved = await saveAll(docId, data);
    await finale(data, saved);
  }

  if (store.modo() === "demo") document.getElementById("demo").hidden = false;
  main();
})();
