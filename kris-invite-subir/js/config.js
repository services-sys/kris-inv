/* =========================================================
 *  Configuración personal de la invitación 💌
 *  Edita SOLO este archivo. Para generar los hashes abre
 *  tools/claves.html en tu navegador.
 * ========================================================= */
window.KRIS_CONFIG = {
  de: "Bernal",
  para: "Kristel",

  // --- Puerta secreta (solo Kristel debe saber la respuesta) ---
  pregunta: "¿Cuál es uno de los animales favoritos de Kristel?",
  pista: "Hace «muuu» 🐄",
  // sha256("kris-puerta:" + respuesta normalizada). Placeholder = "vaca"
  hashPuerta: "4997c5ffbc8fbed0016c6376261769b260d5f62b070f6855bef4f89760ee2c86",

  // --- Firebase Firestore (vacío = modo demo con localStorage) ---
  firebase: {
    apiKey: "AIzaSyD-ii1MW5knFitO0mrSFmec78BA8n41cCI",
    projectId: "kris-inv",
  },

  // --- Fechas disponibles ---
  fechas: [
    { id: "2026-11-22", label: "Domingo 22 de noviembre", corto: "Dom 22", dia: 22 },
    { id: "2026-11-29", label: "Domingo 29 de noviembre", corto: "Dom 29", dia: 29 },
  ],

  // --- La carta final que entrega la vaquita voladora ---
  carta(d) {
    return (
      "<p>Querida Kristel:</p>" +
      "<p>Misión cumplida. 💖 Entonces queda así: <b>" + d.temaNombre + "</b>" +
      (d.temaDetalle ? " (" + d.temaDetalle + ")" : "") +
      ", el <b>" + d.fecha + "</b>, y brindamos con <b>" + d.bebida + "</b>.</p>" +
      "<p>Pronto definiremos detalles. Prometo que va a ser una aventura épica.</p>" +
      "<p class='firma'>Con cariño,<br>Bernal</p>"
    );
  },
};
