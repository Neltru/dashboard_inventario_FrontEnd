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

/* Card oculta por filtro */
.card-oculta {
  display: none !important;
}

/* Sin resultados */
#sinResultados {
  display: none;
}
#sinResultados.visible {
  display: flex;
}
`;

document.head.appendChild(style);

import { productos }           from "./data.js";
import { crearCard }           from "../components/card.js";
import { crearModal }          from "../components/modal.js";
import { patchProductoAPI }    from "../services/service.js";
import { toast }               from "./toast.js";
import { inicializarFiltros, aplicarFiltros } from "./filtros.js";

const contenedor = document.getElementById("productosContainer");

// ── Placeholder "sin resultados" ─────────────────────────
const sinResultados = document.createElement("div");
sinResultados.id = "sinResultados";
sinResultados.className = [
  "col-span-full flex-col items-center justify-center",
  "py-16 text-gray-400 gap-3"
].join(" ");
sinResultados.innerHTML = `
  <svg class="w-12 h-12 opacity-30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
  </svg>
  <p class="text-sm font-medium">Sin resultados para esta búsqueda</p>
  <p class="text-xs">Intenta con otro nombre, SKU o categoría</p>
`;
contenedor.appendChild(sinResultados);

// ── Inicializar modal ────────────────────────────────────
const modal = crearModal(guardarProducto);

document.getElementById("btnAgregar").addEventListener("click", () => {
  modal.abrirNuevo();
});

// ===============================
// RENDER PRINCIPAL
// ===============================
function renderizarProductos() {
  // Limpiar excepto el placeholder
  Array.from(contenedor.children).forEach(child => {
    if (child.id !== "sinResultados") child.remove();
  });

  productos.forEach(producto => {
    const card = crearCard(producto, abrirEditar, alActualizarInline);
    card.classList.add("fade-in");
    contenedor.insertBefore(card, sinResultados);
  });

  actualizarEstadisticas();

  // Inicializar filtros DESPUÉS de renderizar
  // (necesita que el DOM del buscador ya exista)
  inicializarFiltros(productos, onFiltrosCambian);
}

// ===============================
// CALLBACK FILTROS → RE-RENDER VIRTUAL
// No re-crea las cards, solo muestra/oculta
// ===============================
function onFiltrosCambian(productosFiltrados) {

  const idsVisibles = new Set(productosFiltrados.map(p => String(p.id)));

  // Reordenar + mostrar/ocultar
  productosFiltrados.forEach((producto, i) => {
    const card = contenedor.querySelector(`[data-id="${producto.id}"]`);
    if (!card) return;
    card.classList.remove("card-oculta");
    card.style.order = i; // CSS order para reordenar sin mover el DOM
  });

  // Ocultar los que no están en el resultado
  Array.from(contenedor.querySelectorAll("[data-id]")).forEach(card => {
    if (!idsVisibles.has(card.dataset.id)) {
      card.classList.add("card-oculta");
    }
  });

  // Mostrar/ocultar placeholder
  if (productosFiltrados.length === 0) {
    sinResultados.classList.add("visible");
  } else {
    sinResultados.classList.remove("visible");
  }
}

// ===============================
// GUARDAR DESDE MODAL
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

    // Re-aplicar filtros para incluir/excluir el nuevo producto
    const resultado = aplicarFiltros(productos);
    onFiltrosCambian(resultado);

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
    elemento.classList.add("inline-ok");
    setTimeout(() => elemento.classList.remove("inline-ok"), 800);

    const etiquetas = { nombre: "Nombre", precio: "Precio", stock: "Stock" };
    toast.exito(`${etiquetas[campo] ?? campo} actualizado.`, 2500);

    if (campo === "stock" && producto) {
      const card = document.querySelector(`[data-id="${id}"]`);
      if (card) reaplicarReglas(card, producto);
    }

    // Re-aplicar filtros (el orden puede haber cambiado)
    const resultado = aplicarFiltros(productos);
    onFiltrosCambian(resultado);

    actualizarEstadisticas();

  } else {
    if (producto) producto[campo] = valorOriginal;
    elemento.innerHTML = textoOriginalHTML;
    elemento.classList.add("inline-error");
    setTimeout(() => elemento.classList.remove("inline-error"), 800);
    toast.error("No se pudo guardar el cambio. Revisa tu conexión.");
  }
}

// ===============================
// RE-APLICAR REGLAS VISUALES (inline stock)
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
// AGREGAR / ACTUALIZAR CARDS
// ===============================
function abrirEditar(id) {
  const producto = productos.find(p => p.id === id);
  if (producto) modal.abrirEditar(producto);
}

function agregarCard(producto) {
  const card = crearCard(producto, abrirEditar, alActualizarInline);
  card.classList.add("fade-in");
  contenedor.insertBefore(card, sinResultados);
}

function actualizarCard(producto) {
  const cardVieja = contenedor.querySelector(`[data-id="${producto.id}"]`);
  if (!cardVieja) return;

  const nuevaCard = crearCard(producto, abrirEditar, alActualizarInline);
  nuevaCard.style.order = cardVieja.style.order; // mantener posición
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