// js/reportes-page.js
// Versión de página completa para reportes (no integrada en el dashboard)

import { obtenerMovimientos } from "../services/service.js";
import { toast } from "./toast.js";

// ===============================
// INICIALIZACIÓN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  construirUI();
  cargarMovimientos();
});

// ===============================
// CONSTRUIR UI
// ===============================
function construirUI() {
  const container = document.getElementById("reportesContainer");

  const seccion = document.createElement("div");
  seccion.id = "seccionReportes";
  seccion.className = "";

  seccion.innerHTML = `
    <!-- Filtros rápidos por tipo -->
    <div class="bg-white rounded-xl shadow px-4 py-3 flex flex-wrap gap-2 items-center mb-4">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Tipo:</span>
      ${["todos","entrada","salida","ajuste"].map(tipo => `
        <button data-tipo="${tipo}"
          class="btnTipoFiltro px-3 py-1 rounded-full text-xs font-medium border transition
                 ${tipo === "todos"
                   ? "bg-blue-600 text-white border-blue-600"
                   : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"}">
          ${tipo === "todos" ? "Todos" : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </button>
      `).join("")}

      <!-- Contador + Actualizar -->
      <div class="ml-auto flex items-center gap-3">
        <span id="contadorMovimientos" class="text-xs text-gray-400"></span>
        <button id="btnActualizarReportes"
          class="flex items-center gap-2 border border-gray-300 px-3 py-1 rounded-lg
                 text-sm hover:bg-gray-100 transition text-gray-600">
          <svg id="iconoRefresh" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M4 4v5h.582M20 20v-5h-.581M4.582 9A8 8 0 0120 15M19.418 15A8 8 0 014 9"/>
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow overflow-hidden">

      <!-- Skeleton -->
      <div id="reportesSkeleton" class="p-4 space-y-3">
        ${Array(5).fill(0).map(() => `
          <div class="flex gap-4 items-center">
            <div class="sk-box h-4 w-16 rounded-full"></div>
            <div class="sk-box h-4 w-24 rounded"></div>
            <div class="sk-box h-4 w-12 rounded"></div>
            <div class="sk-box h-4 w-12 rounded"></div>
            <div class="sk-box h-4 w-12 rounded"></div>
            <div class="sk-box h-4 flex-1 rounded"></div>
            <div class="sk-box h-4 w-32 rounded"></div>
          </div>
        `).join("")}
      </div>

      <!-- Tabla real (oculta hasta cargar) -->
      <div id="reportesTabla" class="hidden overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b text-xs text-gray-500 uppercase tracking-wide">
              <th class="px-4 py-3 text-left">Tipo</th>
              <th class="px-4 py-3 text-left">Producto</th>
              <th class="px-4 py-3 text-right">Cantidad</th>
              <th class="px-4 py-3 text-right">Stock anterior</th>
              <th class="px-4 py-3 text-right">Stock nuevo</th>
              <th class="px-4 py-3 text-left">Descripción</th>
              <th class="px-4 py-3 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody id="reportesCuerpo" class="divide-y divide-gray-100"></tbody>
        </table>
      </div>

      <!-- Sin datos -->
      <div id="reportesVacio" class="hidden flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <svg class="w-10 h-10 opacity-30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-sm font-medium">Sin movimientos registrados</p>
      </div>

      <!-- Error -->
      <div id="reportesError" class="hidden flex-col items-center justify-center py-16 text-red-400 gap-2">
        <svg class="w-10 h-10 opacity-50" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <p class="text-sm font-medium">No se pudo cargar el historial</p>
        <button id="btnReintentarReportes"
          class="text-xs text-blue-500 underline hover:text-blue-700 mt-1">
          Reintentar
        </button>
      </div>

    </div>
  `;

  container.appendChild(seccion);

  // Eventos
  document.getElementById("btnActualizarReportes")
    .addEventListener("click", () => cargarMovimientos());

  document.getElementById("btnReintentarReportes")
    .addEventListener("click", () => cargarMovimientos());

  // Filtros por tipo
  seccion.addEventListener("click", (e) => {
    const btn = e.target.closest(".btnTipoFiltro");
    if (!btn) return;
    actualizarFiltroTipo(btn.dataset.tipo);
  });
}

// ===============================
// ESTADO
// ===============================
let _movimientos    = [];   // todos los movimientos originales
let _tipoActivo     = "todos";

// ===============================
// FETCH
// ===============================
async function cargarMovimientos() {
  mostrarEstado("skeleton");
  const icono = document.getElementById("iconoRefresh");
  icono?.classList.add("animate-spin");

  try {
    const respuesta = await obtenerMovimientos();
    
    // La API devuelve { data: [...] }
    _movimientos = Array.isArray(respuesta) ? respuesta : (respuesta?.data ?? []);
    
    renderizarTabla(filtrar(_movimientos));
    mostrarEstado("tabla");
  } catch (err) {
    console.error("Error cargando movimientos:", err);
    mostrarEstado("error");
    toast.error("No se pudo cargar el historial de movimientos");
  } finally {
    icono?.classList.remove("animate-spin");
  }
}

// ===============================
// FILTRAR POR TIPO
// ===============================
function filtrar(movimientos) {
  if (_tipoActivo === "todos") return movimientos;
  return movimientos.filter(m => m.tipo === _tipoActivo);
}

function actualizarFiltroTipo(tipo) {
  _tipoActivo = tipo;

  // Actualizar estilos botones
  document.querySelectorAll(".btnTipoFiltro").forEach(btn => {
    const activo = btn.dataset.tipo === tipo;
    btn.classList.toggle("bg-blue-600",    activo);
    btn.classList.toggle("text-white",     activo);
    btn.classList.toggle("border-blue-600",activo);
    btn.classList.toggle("bg-white",       !activo);
    btn.classList.toggle("text-gray-600",  !activo);
    btn.classList.toggle("border-gray-300",!activo);
  });

  const resultado = filtrar(_movimientos);
  renderizarTabla(resultado);

  if (resultado.length === 0) {
    mostrarEstado("vacio");
  } else {
    mostrarEstado("tabla");
  }
}

// ===============================
// RENDERIZAR FILAS
// ===============================
function renderizarTabla(movimientos) {
  const cuerpo = document.getElementById("reportesCuerpo");
  const contador = document.getElementById("contadorMovimientos");

  if (movimientos.length === 0) {
    mostrarEstado("vacio");
    contador.textContent = "Sin movimientos en este filtro";
    return;
  }

  contador.textContent = `${movimientos.length} registro${movimientos.length !== 1 ? "s" : ""}`;

  cuerpo.innerHTML = movimientos.map(m => {

    // Badge por tipo
    const badges = {
      entrada: "bg-green-100 text-green-700",
      salida : "bg-red-100 text-red-700",
      ajuste : "bg-yellow-100 text-yellow-700",
    };
    const badgeClass = badges[m.tipo] ?? "bg-gray-100 text-gray-600";

    // Cantidad con signo y color
    const cantidadColor = m.cantidad > 0
      ? "text-green-600 font-semibold"
      : m.cantidad < 0
        ? "text-red-600 font-semibold"
        : "text-gray-500";
    const cantidadTexto = m.cantidad > 0 ? `+${m.cantidad}` : `${m.cantidad}`;

    // Flecha stock anterior → nuevo
    const stockCambio = m.stock_nuevo > m.stock_anterior
      ? "text-green-500"
      : m.stock_nuevo < m.stock_anterior
        ? "text-red-500"
        : "text-gray-400";

    // Fecha formateada
    const fecha = new Date(m.fecha).toLocaleString("es-MX", {
      day  : "2-digit", month: "short", year : "numeric",
      hour : "2-digit", minute: "2-digit",
    });

    return `
      <tr class="hover:bg-gray-50 transition">
        <td class="px-4 py-3">
          <span class="px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}">
            ${m.tipo}
          </span>
        </td>
        <td class="px-4 py-3 text-gray-700 font-medium">
          ${m.producto ?? `#${m.producto_id}`}
        </td>
        <td class="px-4 py-3 text-right ${cantidadColor}">${cantidadTexto}</td>
        <td class="px-4 py-3 text-right text-gray-500">${m.stock_anterior}</td>
        <td class="px-4 py-3 text-right ${stockCambio} font-semibold">${m.stock_nuevo}</td>
        <td class="px-4 py-3 text-gray-400 text-xs max-w-[180px] truncate">
          ${m.descripcion ?? "—"}
        </td>
        <td class="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">${fecha}</td>
      </tr>
    `;
  }).join("");
}

// ===============================
// ESTADOS DE LA TABLA
// ===============================
function mostrarEstado(estado) {
  const skeleton = document.getElementById("reportesSkeleton");
  const tabla    = document.getElementById("reportesTabla");
  const vacio    = document.getElementById("reportesVacio");
  const error    = document.getElementById("reportesError");

  skeleton.classList.add("hidden");
  tabla.classList.add("hidden");
  vacio.classList.add("hidden");
  error.classList.add("hidden");

  const map = {
    skeleton : skeleton,
    tabla    : tabla,
    vacio    : vacio,
    error    : error,
  };

  const el = map[estado];
  if (!el) return;
  el.classList.remove("hidden");

  // vacio y error necesitan flex
  if (estado === "vacio" || estado === "error") {
    el.classList.add("flex");
  }
}
