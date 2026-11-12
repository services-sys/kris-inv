/* Panel privado: admin.html#<docId>  (o escribe la respuesta secreta para generarlo) */
(function () {
  const C = window.KRIS_CONFIG, store = KI.storage;
  const out = document.getElementById("out");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  if (store.modo() === "demo") document.getElementById("demo").hidden = false;

  function askKey() {
    out.innerHTML = `
      <h1>🔒 ¿Quién eres?</h1>
      <p class="muted">Escribe la respuesta secreta de la invitación para abrir tu panel. Después guarda el link que aparece en la barra de direcciones.</p>
      <input class="field" id="k" type="password" placeholder="Respuesta secreta" autocomplete="off">
      <div class="row"><button class="btn primary" id="go">Abrir 🔑</button></div>`;
    const go = async () => {
      const norm = await store.verificar(document.getElementById("k").value);
      if (!norm) { out.querySelector(".muted").textContent = "Muuu… esa no es. 🚫"; return; }
      location.hash = await store.sha256("kris-doc:" + norm);
    };
    document.getElementById("go").onclick = go;
    document.getElementById("k").onkeydown = (e) => e.key === "Enter" && go();
  }

  async function load() {
    const id = location.hash.slice(1);
    if (!/^[0-9a-f]{64}$/.test(id)) return askKey();
    out.innerHTML = `<p class="muted">Llamando a la vaquita mensajera… 🐄</p>`;
    let d;
    try { d = await store.leer(id); }
    catch (e) { out.innerHTML = `<h1>😵 Error</h1><p class="muted">${esc(e.message)}</p>`; return; }
    if (!d) {
      out.innerHTML = `<h1>⏳ Todavía nada</h1><p class="muted">${esc(C.para)} aún no ha completado la invitación. Vuelve más tarde.</p>
        <div class="row"><button class="btn" onclick="location.reload()">Revisar otra vez 🔁</button></div>`;
      return;
    }
    if (d.version === "prueba") {
      out.innerHTML = `<h1>✅ Conexión lista</h1><p class="muted">Firebase funciona: esto es una prueba de conexión. ${esc(C.para)} aún no ha respondido; cuando lo haga, aquí verás sus respuestas.</p>
        <div class="row"><button class="btn" onclick="location.reload()">Revisar otra vez 🔁</button></div>`;
      return;
    }
    const cuando = d.enviado ? new Date(d.enviado).toLocaleString("es", { dateStyle: "full", timeStyle: "short" }) : "—";
    out.innerHTML = `
      <h1>💖 ¡${esc(C.para)} respondió!</h1>
      <dl>
        <div><dt>Tema</dt><dd>${esc(d.temaNombre)}${d.temaDetalle ? " · " + esc(d.temaDetalle) : ""}</dd></div>
        <div><dt>Fecha</dt><dd>${esc(d.fecha)}</dd></div>
        <div><dt>Brindis</dt><dd>${esc(d.bebida)}${d.bebidaComentario ? `<br><span class="muted">“${esc(d.bebidaComentario)}”</span>` : ""}</dd></div>
        <div><dt>Patrulla Vaquera 🚨</dt><dd>${d.intentosAlcohol ? `<span class="cop">Intentó pedir: ${esc(d.intentosAlcohol)}</span>` : "Cero intentos. Ciudadana ejemplar. 😇"}</dd></div>
        <div><dt>Temas que exploró</dt><dd>${esc(d.temasVistos || "—")}</dd></div>
        <div><dt>Mensaje para ti</dt><dd class="msg">${d.mensaje ? esc(d.mensaje) : "<span class='muted'>(sin mensaje)</span>"}</dd></div>
        <div><dt>Enviado</dt><dd>${esc(cuando)}</dd></div>
      </dl>
      <div class="row"><button class="btn" onclick="location.reload()">Actualizar 🔁</button></div>`;
  }

  window.addEventListener("hashchange", load);
  load();
})();
