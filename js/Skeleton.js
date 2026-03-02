// js/skeleton.js

// ===============================
// SKELETON LOADING
// ===============================

/**
 * Muestra N skeleton cards en el contenedor mientras carga la API.
 * @param {HTMLElement} contenedor
 * @param {number}      cantidad
 */
export function mostrarSkeletons(contenedor, cantidad = 4) {

  // Limpiar contenedor antes de insertar skeletons
  contenedor.innerHTML = "";

  for (let i = 0; i < cantidad; i++) {
    const sk = document.createElement("div");
    sk.className = "skeleton-card bg-white rounded-xl shadow p-4";
    sk.setAttribute("aria-hidden", "true");

    sk.innerHTML = `
      <!-- Badge placeholder -->
      <div class="flex justify-between items-center mb-2">
        <div class="sk-box h-5 w-20 rounded-full"></div>
        <div class="sk-box h-4 w-24 rounded"></div>
      </div>

      <!-- Imagen placeholder -->
      <div class="sk-box rounded-lg mb-3 w-full h-40"></div>

      <!-- Nombre -->
      <div class="sk-box h-5 w-3/4 rounded mb-2"></div>

      <!-- SKU + Categoría -->
      <div class="sk-box h-3 w-1/3 rounded mb-1"></div>
      <div class="sk-box h-3 w-1/2 rounded mb-3"></div>

      <!-- Stock / Precio / Fecha -->
      <div class="space-y-2 mt-2">
        <div class="sk-box h-3 w-2/3 rounded"></div>
        <div class="sk-box h-3 w-1/2 rounded"></div>
        <div class="sk-box h-3 w-2/5 rounded"></div>
      </div>

      <!-- Botones -->
      <div class="flex gap-2 mt-4">
        <div class="sk-box h-8 flex-1 rounded-lg"></div>
        <div class="sk-box h-8 flex-1 rounded-lg"></div>
      </div>
    `;

    contenedor.appendChild(sk);
  }
}

/**
 * Elimina todos los skeleton cards del contenedor.
 * @param {HTMLElement} contenedor
 */
export function ocultarSkeletons(contenedor) {
  contenedor.querySelectorAll(".skeleton-card").forEach(sk => sk.remove());
}

// ── Inyectar CSS de skeleton ─────────────────────────────
const style = document.createElement("style");
style.textContent = `
  .sk-box {
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
document.head.appendChild(style);
