/* Hashing + guardado (Firestore REST o localStorage en modo demo) */
window.KI = window.KI || {};

(function () {
  const CAMPOS = [
    "tema", "temaNombre", "temaDetalle", "bebida", "bebidaComentario", "intentosAlcohol",
    "fecha", "fechaId", "temasVistos", "mensaje", "enviado", "version",
  ];

  // SHA-256 de respaldo para contextos sin crypto.subtle (p. ej. file:// en algunos navegadores)
  function sha256Fallback(ascii) {
    const rr = (v, a) => (v >>> a) | (v << (32 - a));
    const bytes = new TextEncoder().encode(ascii);
    const K = [];
    const H = [];
    let n = 2;
    for (let c = 0; c < 64; n++) {
      let prime = true;
      for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
      if (!prime) continue;
      if (c < 8) H[c] = (Math.pow(n, 1 / 2) * 2 ** 32) | 0;
      K[c++] = (Math.pow(n, 1 / 3) * 2 ** 32) | 0;
    }
    const l = bytes.length;
    const withPad = new Uint8Array(((l + 9 + 63) >> 6) << 6);
    withPad.set(bytes);
    withPad[l] = 0x80;
    const dv = new DataView(withPad.buffer);
    dv.setUint32(withPad.length - 4, l * 8);
    dv.setUint32(withPad.length - 8, Math.floor((l * 8) / 2 ** 32));
    const w = new Array(64);
    for (let off = 0; off < withPad.length; off += 64) {
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        if (i < 16) w[i] = dv.getUint32(off + i * 4);
        else {
          const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
          const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
          w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
        }
        const t1 = (h + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
  }

  async function sha256(str) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    return sha256Fallback(str);
  }

  function normalize(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  const cfg = () => (window.KRIS_CONFIG || {}).firebase || {};
  const modo = () => (cfg().apiKey && cfg().projectId ? "firebase" : "demo");
  const url = (id) =>
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(cfg().projectId)}` +
    `/databases/(default)/documents/invitaciones/${encodeURIComponent(id)}?key=${encodeURIComponent(cfg().apiKey)}`;

  async function guardar(docId, data) {
    const limpio = {};
    CAMPOS.forEach((k) => (limpio[k] = String(data[k] == null ? "" : data[k]).slice(0, 1000)));
    if (modo() === "demo") {
      try { localStorage.setItem("kris-invite:" + docId, JSON.stringify(limpio)); } catch (e) { /* sin almacenamiento */ }
      await new Promise((r) => setTimeout(r, 900));
      return { modo: "demo" };
    }
    const fields = {};
    CAMPOS.forEach((k) => (fields[k] = { stringValue: limpio[k] }));
    const res = await fetch(url(docId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) throw new Error("Firestore " + res.status + ": " + (await res.text()));
    return { modo: "firebase" };
  }

  async function leer(docId) {
    if (modo() === "demo") {
      let raw = null; try { raw = localStorage.getItem("kris-invite:" + docId); } catch (e) { /* sin almacenamiento */ }
      return raw ? JSON.parse(raw) : null;
    }
    const res = await fetch(url(docId));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Firestore " + res.status + ": " + (await res.text()));
    const json = await res.json();
    const out = {};
    Object.entries(json.fields || {}).forEach(([k, v]) => (out[k] = v.stringValue ?? ""));
    return out;
  }

  // Acepta singular y plural ("vaca" / "vacas"). Devuelve la forma que coincide con hashPuerta, o null.
  async function verificar(respuesta) {
    const n = normalize(respuesta);
    const variantes = [...new Set([n, n.replace(/(es|s)$/, ""), n.replace(/s$/, ""), n + "s"])].filter(Boolean);
    for (const v of variantes) {
      if ((await sha256("kris-puerta:" + v)) === window.KRIS_CONFIG.hashPuerta) return v;
    }
    return null;
  }

  KI.storage = { sha256, normalize, verificar, modo, guardar, leer, CAMPOS };
})();
