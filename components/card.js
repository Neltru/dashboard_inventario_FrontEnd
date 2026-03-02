// components/card.js

import { activarInlineEditing } from "../js/inlineEdit.js";

export function crearCard(producto, onEditar, onActualizar, onEliminar) {

  const card = document.createElement("div");
  card.className = "bg-white rounded-xl shadow p-4 transition-all duration-300";
  card.dataset.id = producto.id;

  card.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <span class="badge text-xs px-2 py-1 rounded-full"></span>
      <span class="text-xs text-gray-300 select-none">✎ doble clic para editar</span>
    </div>

    <img src="${producto.imagen || 'https://via.placeholder.com/300x200'}" class="rounded-lg mb-3 w-full h-40 object-cover" />

    <h2 class="inline-nombre font-semibold text-gray-800">${producto.nombre}</h2>
    <p class="text-xs text-gray-500">SKU: ${producto.sku || "N/A"}</p>
    <p class="text-sm text-gray-600">Categoría: ${producto.categoria}</p>
    ${producto.proveedor_nombre
      ? `<div class="mt-1 space-y-0.5">
           <p class="text-xs text-gray-500 flex items-center gap-1">
             🏭 <span class="font-medium">${producto.proveedor_nombre}</span>
           </p>
           ${producto.proveedor_contacto
             ? `<p class="text-xs text-gray-400">👤 ${producto.proveedor_contacto}</p>`
             : ""}
           ${producto.proveedor_telefono
             ? `<p class="text-xs text-gray-400">📞 ${producto.proveedor_telefono}</p>`
             : ""}
           ${producto.proveedor_email
             ? `<p class="text-xs text-gray-400">✉️ ${producto.proveedor_email}</p>`
             : ""}
         </div>`
      : ""}

    <div class="mt-2 text-sm">
      <p>
        <span class="font-semibold">Stock:</span>
        <span class="inline-stock stock">${producto.stock}</span> unidades
      </p>
      <p>
        <span class="font-semibold">Precio:</span>
        <span class="inline-precio">$${producto.precio}</span>
      </p>
      <p><span class="font-semibold">Vence:</span> <span class="inline-fecha-vencimiento">${producto.fecha_vencimiento || "N/A"}</span></p>
    </div>

    <div class="flex gap-2 mt-4">
      <button class="btnEditar flex-1 bg-blue-600 text-white py-1 rounded-lg text-sm hover:bg-blue-700 transition">
        Editar
      </button>
      <button class="btnEliminar border border-red-200 text-red-400 px-3 py-1 rounded-lg text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition"
        title="Eliminar producto">
        🗑
      </button>
    </div>
  `;

  aplicarReglasDinamicas(card, producto);

  card.querySelector(".btnEditar").addEventListener("click", () => onEditar(producto.id));

  // ── DELETE ───────────────────────────────────────────────
  card.querySelector(".btnEliminar").addEventListener("click", () => {
    confirmarEliminar(producto, onEliminar);
  });

  if (onActualizar) {
    activarInlineEditing(card, producto, onActualizar);
  }

  return card;
}

// ── Confirmación antes de eliminar ───────────────────────
function confirmarEliminar(producto, onEliminar) {
  // Usa el sistema de toast modal existente con un overlay de confirmación
  const overlay = document.createElement("div");
  overlay.className = [
    "fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm",
    "flex items-center justify-center",
    "opacity-0 transition-opacity duration-300",
  ].join(" ");

  overlay.innerHTML = `
    <div class="
      relative w-full max-w-sm mx-4 bg-white border-2 border-red-300
      rounded-2xl shadow-2xl p-8 text-center
      scale-90 opacity-0 transition-all duration-300
    ">
      <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-red-700 mb-2">¿Eliminar producto?</h3>
      <p class="text-gray-600 text-sm leading-relaxed mb-6">
        Se eliminará <strong>${producto.nombre}</strong> permanentemente.<br/>
        Esta acción no se puede deshacer.
      </p>
      <div class="flex gap-3">
        <button id="btnCancelarEliminar"
          class="flex-1 border border-gray-300 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button id="btnConfirmarEliminar"
          class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-semibold transition">
          Sí, eliminar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const panel = overlay.querySelector("div");

  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.classList.remove("opacity-0");
    panel.classList.remove("scale-90", "opacity-0");
  }));

  function cerrar() {
    overlay.classList.add("opacity-0");
    panel.classList.add("scale-90", "opacity-0");
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
  }

  overlay.querySelector("#btnCancelarEliminar").addEventListener("click", cerrar);
  overlay.addEventListener("click", e => { if (e.target === overlay) cerrar(); });

  overlay.querySelector("#btnConfirmarEliminar").addEventListener("click", () => {
    cerrar();
    if (onEliminar) onEliminar(producto.id);
  });
}

// ===============================
// REGLAS DINÁMICAS
// ===============================
function aplicarReglasDinamicas(card, producto) {
  const btnEliminar = card.querySelector(".btnEliminar");
  const badge       = card.querySelector(".badge");
  const hoy         = new Date();

  card.classList.remove("border-2","border-yellow-500","border-red-500","opacity-50");
  badge.className   = "badge text-xs px-2 py-1 rounded-full";
  badge.textContent = "Stock Normal";
  badge.classList.add("bg-green-100","text-green-600");

  if (producto.stock < 5 && producto.stock > 0) {
    card.classList.add("border-2","border-yellow-500");
    badge.textContent = "Stock Bajo";
    badge.classList.remove("bg-green-100","text-green-600");
    badge.classList.add("bg-yellow-100","text-yellow-600");
  }

  if (producto.stock === 0) {
    card.classList.add("border-2","border-red-500");
    badge.textContent = "Agotado";
    badge.classList.remove("bg-green-100","text-green-600");
    badge.classList.add("bg-red-100","text-red-600");
  }

  if (producto.fecha_vencimiento && new Date(producto.fecha_vencimiento) < hoy) {
    card.classList.add("opacity-50");
    badge.textContent = "Vencido";
    badge.classList.remove("bg-green-100","text-green-600");
    badge.classList.add("bg-gray-200","text-gray-600");
  }
}

export function animarFlash(card) {
  card.classList.add("flash");
  setTimeout(() => card.classList.remove("flash"), 600);
}