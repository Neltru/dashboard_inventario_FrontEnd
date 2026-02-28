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
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

document.head.appendChild(style);

import { productos } from "./data.js";
import { crearCard } from "../components/card.js";
import { crearModal } from "../components/modal.js";

const contenedor = document.getElementById("productosContainer");

// ── Inicializar modal ────────────────────────────────────────────────────────
const modal = crearModal(guardarProducto);

// ── Botón "Agregar Producto" ─────────────────────────────────────────────────
document.getElementById("btnAgregar").addEventListener("click", () => {
  modal.abrirNuevo();
});

// ===============================
// GUARDAR (nuevo o edición)
// ===============================
function guardarProducto(producto) {

  if (producto.id === null) {
    // ── NUEVO: generar id y agregar al array ──
    producto.id = Date.now();
    productos.push(producto);
    agregarCard(producto);

  } else {
    // ── EDICIÓN: actualizar objeto en el array ──
    const idx = productos.findIndex(p => p.id === producto.id);
    if (idx !== -1) productos[idx] = producto;
    actualizarCard(producto);
  }

  actualizarEstadisticas();
}

// ===============================
// RENDER PRINCIPAL
// ===============================
function renderizarProductos() {
  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const card = crearCard(producto, abrirEditar);
    card.classList.add("fade-in");
    contenedor.appendChild(card);
  });

  actualizarEstadisticas();
}

// ===============================
// ABRIR MODAL EN MODO EDICIÓN
// ===============================
function abrirEditar(id) {
  const producto = productos.find(p => p.id === id);
  if (producto) modal.abrirEditar(producto);
}

// ===============================
// AGREGAR CARD (producto nuevo)
// ===============================
function agregarCard(producto) {
  const card = crearCard(producto, abrirEditar);
  card.classList.add("fade-in");
  contenedor.appendChild(card);
}

// ===============================
// ACTUALIZAR CARD EXISTENTE
// ===============================
function actualizarCard(producto) {
  const cardVieja = document.querySelector(`[data-id="${producto.id}"]`);
  if (!cardVieja) return;

  const nuevaCard = crearCard(producto, abrirEditar);
  cardVieja.replaceWith(nuevaCard);

  nuevaCard.classList.add("flash");
  setTimeout(() => nuevaCard.classList.remove("flash"), 600);
}

// ===============================
// ESTADÍSTICAS DINÁMICAS
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