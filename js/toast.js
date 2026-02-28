// js/toast.js

// ===============================
// SISTEMA DE ALERTAS MODALES
// ===============================

const TIPOS = {
  exito: {
    bg     : "bg-green-50",
    borde  : "border-green-400",
    icono  : `<div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>`,
    titulo : "text-green-700",
    boton  : "bg-green-500 hover:bg-green-600",
    label  : "¡Éxito!",
  },
  error: {
    bg     : "bg-red-50",
    borde  : "border-red-400",
    icono  : `<div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>`,
    titulo : "text-red-700",
    boton  : "bg-red-500 hover:bg-red-600",
    label  : "¡Error!",
  },
  advertencia: {
    bg     : "bg-yellow-50",
    borde  : "border-yellow-400",
    icono  : `<div class="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>`,
    titulo : "text-yellow-700",
    boton  : "bg-yellow-500 hover:bg-yellow-600",
    label  : "Advertencia",
  },
  info: {
    bg     : "bg-blue-50",
    borde  : "border-blue-400",
    icono  : `<div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
                </svg>
              </div>`,
    titulo : "text-blue-700",
    boton  : "bg-blue-500 hover:bg-blue-600",
    label  : "Información",
  },
};

// Cola para apilar alertas si llegan varias seguidas
const cola = [];
let abierto = false;

/**
 * Muestra una alerta modal centrada en pantalla.
 *
 * @param {string} mensaje
 * @param {"exito"|"error"|"advertencia"|"info"} tipo
 * @param {number} duracion - ms para cierre automático (0 = solo manual)
 */
export function mostrarToast(mensaje, tipo = "info", duracion = 3500) {
  cola.push({ mensaje, tipo, duracion });
  if (!abierto) procesarCola();
}

function procesarCola() {
  if (cola.length === 0) { abierto = false; return; }
  abierto = true;
  const { mensaje, tipo, duracion } = cola.shift();
  renderAlert(mensaje, tipo, duracion);
}

function renderAlert(mensaje, tipo, duracion) {

  const cfg = TIPOS[tipo] ?? TIPOS.info;

  // ── Overlay ──────────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.className = [
    "fixed inset-0 z-[100]",
    "bg-black/40 backdrop-blur-sm",
    "flex items-center justify-center",
    "opacity-0 transition-opacity duration-300",
  ].join(" ");

  // ── Panel ────────────────────────────────────────────────
  overlay.innerHTML = `
    <div class="
      relative w-full max-w-sm mx-4
      ${cfg.bg} border-2 ${cfg.borde}
      rounded-2xl shadow-2xl p-8 text-center
      scale-90 opacity-0 transition-all duration-300
    ">

      ${cfg.icono}

      <h3 class="text-xl font-bold ${cfg.titulo} mb-2">${cfg.label}</h3>
      <p class="text-gray-600 text-sm leading-relaxed mb-6">${mensaje}</p>

      ${duracion > 0 ? `
        <!-- Barra de progreso -->
        <div class="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden bg-black/10">
          <div class="progress-bar h-full ${cfg.boton.replace("hover:bg-", "").split(" ")[0]} transition-none"
               style="width:100%">
          </div>
        </div>
      ` : ""}

      <button class="btnCerrar
        ${cfg.boton} text-white
        px-8 py-2.5 rounded-xl font-semibold text-sm
        transition shadow-md hover:shadow-lg active:scale-95">
        Aceptar
      </button>

    </div>
  `;

  document.body.appendChild(overlay);

  const panel      = overlay.querySelector("div");
  const btnCerrar  = overlay.querySelector(".btnCerrar");
  const progressBar= overlay.querySelector(".progress-bar");

  // ── Entrada ──────────────────────────────────────────────
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      panel.classList.remove("scale-90", "opacity-0");
    });
  });

  // ── Barra de progreso ────────────────────────────────────
  let timerId = null;

  if (duracion > 0 && progressBar) {
    // Forzar reflow antes de activar la transición
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.transition = `width ${duracion}ms linear`;
        progressBar.style.width = "0%";
      });
    });

    timerId = setTimeout(cerrar, duracion);
  }

  // ── Cerrar ───────────────────────────────────────────────
  function cerrar() {
    if (timerId) clearTimeout(timerId);

    overlay.classList.add("opacity-0");
    panel.classList.add("scale-90", "opacity-0");

    overlay.addEventListener("transitionend", () => {
      overlay.remove();
      procesarCola(); // siguiente en cola
    }, { once: true });
  }

  btnCerrar.addEventListener("click", cerrar);

  // Click fuera del panel también cierra
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrar();
  });
}

// ── Helpers semánticos ───────────────────────────────────
export const toast = {
  exito      : (msg, ms) => mostrarToast(msg, "exito",       ms),
  error      : (msg, ms) => mostrarToast(msg, "error",       ms),
  advertencia: (msg, ms) => mostrarToast(msg, "advertencia", ms),
  info       : (msg, ms) => mostrarToast(msg, "info",        ms),
};