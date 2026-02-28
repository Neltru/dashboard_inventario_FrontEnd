// js/app.js

// ===============================
// INYECTAR ANIMACIONES CSS
// ===============================
const style = document.createElement("style");

style.textContent = `
.flash {
  animation: flashEffect 0.6s ease;
}
@keyframes flashEffect {
  0%   { background-color: #bfdbfe; }
  100% { background-color: transparent; }
}

.fade-in {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInEffect 0.5s ease forwards;
}
@keyframes fadeInEffect {
  to { opacity: 1; transform: translateY(0); }
}

.inline-guardando { opacity: 0.4; }

.inline-ok {
  animation: inlineOk 0.8s ease forwards;
}
@keyframes inlineOk {
  0%   { background-color: #bbf7d0; }
  100% { background-color: transparent; }
}

.inline-error {
  animation: inlineError 0.8s ease forwards;
}
@keyframes inlineError {
  0%   { background-color: #fecaca; }
  100% { background-color: transparent; }
}
`;

document.head.appendChild(style);

import { productos }        from "./data.js";
import { crearCard }        from "../components/card.js";
import { crearModal }       from "../components/modal.js";
import { patchProductoAPI } from "../services/service.js";
import { toast }            from "./toast.js";

const contenedor = document.getElementById("productosContainer");

// ── Inicializar modal ────────────────────────────────────
const modal = crearModal(guardarProducto);

document.getElementById("btnAgregar").addEventListener("click", () => {
  modal.abrirNuevo();
});

// ===============================
// GUARDAR DESDE MODAL (nuevo o edición completa)
// ===============================
function guardarProducto(producto) {
  try {
    if (producto.id === null) {
      producto.id = Date.now();
      productos.push(producto);
      agregarCard(producto);
      toast.exito(`"${producto.nombre}" agregado correctamente.`);
    } else {
      const idx = productos.findIndex(p => p.id === producto.id);
      if (idx !== -1) productos[idx] = producto;
      actualizarCard(producto);
      toast.exito(`"${producto.nombre}" actualizado correctamente.`);
    }

    actualizarEstadisticas();

  } catch (e) {
    console.error(e);
    toast.error("Ocurrió un error al guardar el producto.");
  }
}

// ===============================
// CALLBACK INLINE EDIT → PATCH
// ===============================
async function alActualizarInline(id, campo, nuevoValor, elemento, textoOriginalHTML, valorOriginal) {

  const producto = productos.find(p => p.id === id);

  elemento.classList.add("inline-guardando");

  const ok = await patchProductoAPI(id, campo, nuevoValor);

  elemento.classList.remove("inline-guardando");

  if (ok) {
    // ── Éxito ────────────────────────────────────────────
    elemento.classList.add("inline-ok");
    setTimeout(() => elemento.classList.remove("inline-ok"), 800);

    const etiquetas = { nombre: "Nombre", precio: "Precio", stock: "Stock" };
    toast.exito(`${etiquetas[campo] ?? campo} actualizado.`, 2500);

    if (campo === "stock" && producto) {
      const card = document.querySelector(`[data-id="${id}"]`);
      if (card) reaplicarReglas(card, producto);
    }

    actualizarEstadisticas();

  } else {
    // ── Fallo: rollback ───────────────────────────────────
    if (producto) producto[campo] = valorOriginal;

    elemento.innerHTML = textoOriginalHTML;
    elemento.classList.add("inline-error");
    setTimeout(() => elemento.classList.remove("inline-error"), 800);

    toast.error("No se pudo guardar el cambio. Revisa tu conexión.");
  }
}

// ===============================
// RE-APLICAR REGLAS VISUALES
// ===============================
function reaplicarReglas(card, producto) {

  const badge     = card.querySelector(".badge");
  const btnAccion = card.querySelector(".btnAccion");

  card.classList.remove("border-2", "border-yellow-500", "border-red-500", "opacity-50");
  badge.className   = "badge text-xs px-2 py-1 rounded-full";
  badge.textContent = "Stock Normal";
  badge.classList.add("bg-green-100", "text-green-600");

  btnAccion.disabled = false;
  btnAccion.classList.remove("opacity-50", "cursor-not-allowed");

  if (producto.stock > 0 && producto.stock < 5) {
    card.classList.add("border-2", "border-yellow-500");
    badge.textContent = "Stock Bajo";
    badge.classList.replace("bg-green-100", "bg-yellow-100");
    badge.classList.replace("text-green-600", "text-yellow-600");
  }

  if (producto.stock === 0) {
    card.classList.add("border-2", "border-red-500");
    badge.textContent = "Agotado";
    badge.classList.replace("bg-green-100", "bg-red-100");
    badge.classList.replace("text-green-600", "text-red-600");
    btnAccion.disabled = true;
    btnAccion.classList.add("opacity-50", "cursor-not-allowed");
  }

  const hoy = new Date();
  if (new Date(producto.fecha_vencimiento) < hoy) {
    card.classList.add("opacity-50");
    badge.textContent = "Vencido";
    badge.classList.replace("bg-green-100", "bg-gray-200");
    badge.classList.replace("text-green-600", "text-gray-600");
  }
}

// ===============================
// RENDER PRINCIPAL
// ===============================
function renderizarProductos() {
  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const card = crearCard(producto, abrirEditar, alActualizarInline);
    card.classList.add("fade-in");
    contenedor.appendChild(card);
  });

  actualizarEstadisticas();
}

function abrirEditar(id) {
  const producto = productos.find(p => p.id === id);
  if (producto) modal.abrirEditar(producto);
}

function agregarCard(producto) {
  const card = crearCard(producto, abrirEditar, alActualizarInline);
  card.classList.add("fade-in");
  contenedor.appendChild(card);
}

function actualizarCard(producto) {
  const cardVieja = document.querySelector(`[data-id="${producto.id}"]`);
  if (!cardVieja) return;

  const nuevaCard = crearCard(producto, abrirEditar, alActualizarInline);
  cardVieja.replaceWith(nuevaCard);
  nuevaCard.classList.add("flash");
  setTimeout(() => nuevaCard.classList.remove("flash"), 600);
}

// ===============================
// ESTADÍSTICAS
// ===============================
function actualizarEstadisticas() {
  const hoy = new Date();

  document.getElementById("totalProductos").textContent = productos.length;

  document.getElementById("stockBajo").textContent =
    productos.filter(p => p.stock > 0 && p.stock < 5).length;

  document.getElementById("agotados").textContent =
    productos.filter(p => p.stock === 0).length;

  document.getElementById("vencidos").textContent =
    productos.filter(p => new Date(p.fecha_vencimiento) < hoy).length;
}

// ===============================
document.addEventListener("DOMContentLoaded", renderizarProductos);