# 💌 Una misión para Kristel

Invitación-videojuego en pixel art de Bernal para Kristel. HTML/CSS/JS estático, sin dependencias ni build.

## Cómo funciona

1. **START** → la **Vaquita Guardiana** pregunta algo que solo Kristel sabe.
2. Kristel acepta la misión (el botón "No" huye 😏).
3. Escoge el **tema** caminando por el cruce de caminos: Montaña y vaquitas, Cabaña en la montaña, Cena romántica, Videojuegos o pelis, Volcanes y Cine.
4. Escoge con qué **brindar**. Si pide licor, llega la **Patrulla Vaquera** 🚨 y se lo cambia por leche.
5. Escoge la **fecha** en el calendario (domingo 22 o domingo 29 de noviembre de 2026, u otra).
6. Deja un mensaje opcional → se guarda → la **vaquita voladora** entrega la carta de Bernal.

Bernal ve las respuestas en `admin.html#<clave>`.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | El juego (el link para Kristel) |
| `admin.html` | Panel privado de Bernal |
| `js/config.js` | **Lo único que hay que editar**: pregunta, hash, Firebase, fechas, texto de la carta |
| `tools/claves.html` | Genera el hash de la respuesta, las reglas de Firestore y tu link privado |
| `firestore.rules` | Plantilla de reglas |

## Configuración (≈10 min)

### 1. Pregunta secreta
Abre `tools/claves.html`, escribe la pregunta y la respuesta (no importan mayúsculas ni tildes), y copia `pregunta` y `hashPuerta` a `js/config.js`. La respuesta nunca se guarda en el código, solo su hash.

### 2. Firebase (gratis)
1. Entra a <https://console.firebase.google.com> → **Agregar proyecto** (puedes desactivar Analytics).
2. **Compilación → Firestore Database → Crear base de datos** → modo **producción** → cualquier región.
3. **Reglas** → pega las reglas que generó `tools/claves.html` → **Publicar**.
4. ⚙️ **Configuración del proyecto → General → Tus apps → Web (`</>`)** → registra la app y copia `apiKey` y `projectId` a `js/config.js` → `firebase`.

> El `apiKey` de Firebase no es secreto; la seguridad la dan las reglas: solo se puede leer o escribir el documento cuyo id sale de la respuesta secreta.

### 3. Publicar en GitHub Pages
**Settings → Pages → Deploy from a branch → `main` / root**. Quedará en `https://<usuario>.github.io/kris-inv/`.

- Link para Kristel: `https://<usuario>.github.io/kris-inv/`
- Tu link: `https://<usuario>.github.io/kris-inv/admin.html#<clave>` (lo da `tools/claves.html`; no se lo compartas a nadie)

## Probar localmente
```bash
python3 -m http.server 8000   # luego abre http://localhost:8000
```
Sin Firebase configurado el juego corre en **modo DEMO** (etiqueta amarilla) y guarda en `localStorage`. La respuesta de prueba es `vaca`.

## Seguridad, honestamente
Es una invitación, no un banco. El hash de la respuesta está en el código público, así que una respuesta muy corta se podría adivinar por fuerza bruta. Usa algo que solo ella sepa y que no sea de una palabra obvia (ej. un apodo o un chiste interno).
