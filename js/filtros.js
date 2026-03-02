// js/filtros.js

// ===============================
// ESTADO GLOBAL DE FILTROS
// ===============================
const estado = {
  busqueda  : "",
  categoria : "todas",
  orden     : { campo: null, dir: "asc" }, // campo: "precio"|"stock"|"fecha"|"nombre"
};

// ── Callback para re-render (se inyecta desde app.js) ────
let _onCambio = null;

export function inicializarFiltros(productos, onCambio) {
  _onCambio = onCambio;
  construirUI(productos);
  bindEventos(productos);
}

// ===============================
// APLICAR FILTROS + BÚSQUEDA + ORDEN
// ===============================
export function aplicarFiltros(productos) {

  let resultado = [...productos];

  // 1. BÚSQUEDA por nombre o SKU
  if (estado.busqueda) {
    const q = estado.busqueda.toLowerCase();
    resultado = resultado.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  }

  // 2. FILTRO por categoría
  if (estado.categoria !== "todas") {
    resultado = resultado.filter(p => p.categoria === estado.categoria);
  }

  // 3. ORDEN
  if (estado.orden.campo) {
    const { campo, dir } = estado.orden;
    const mult = dir === "asc" ? 1 : -1;

    resultado.sort((a, b) => {
      if (campo === "fecha") {
        return mult * (new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));
      }
      if (campo === "nombre") {
        return mult * a.nombre.localeCompare(b.nombre);
      }
      return mult * (a[campo] - b[campo]); // precio, stock
    });
  }

  return resultado;
}

// ===============================
// CONSTRUIR UI DE FILTROS
// ===============================
function construirUI(productos) {

  // ── Obtener categorías únicas del array ──────────────────
  const categorias = ["todas", ...new Set(productos.map(p => p.categoria))];

  // ── Inyectar controles de filtro + orden ─────────────────
  // Los insertamos ANTES del contenedor de productos
  const contenedor = document.getElementById("productosContainer");

  const wrapper = document.createElement("div");
  wrapper.id = "filtrosWrapper";
  wrapper.className = "mb-6 space-y-3";

  wrapper.innerHTML = `

    <!-- FILA 1: Categorías -->
    <div class="bg-white rounded-xl shadow px-4 py-3 flex flex-wrap gap-2 items-center">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
        Categoría:
      </span>
      <div id="btnsCategorias" class="flex flex-wrap gap-2">
        ${categorias.map(cat => `
          <button
            data-cat="${cat}"
            class="btnCategoria px-3 py-1 rounded-full text-xs font-medium border transition
                   ${cat === "todas"
                     ? "bg-blue-600 text-white border-blue-600"
                     : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"}">
            ${cat === "todas" ? "Todas" : cat}
          </button>
        `).join("")}
      </div>
    </div>

    <!-- FILA 2: Orden -->
    <div class="bg-white rounded-xl shadow px-4 py-3 flex flex-wrap gap-2 items-center">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
        Ordenar por:
      </span>
      <div class="flex flex-wrap gap-2">
        ${[
          { campo: "nombre", label: "Nombre"  },
          { campo: "precio", label: "Precio"  },
          { campo: "stock",  label: "Stock"   },
          { campo: "fecha",  label: "Vence"   },
        ].map(({ campo, label }) => `
          <button
            data-orden="${campo}"
            class="btnOrden flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                   border border-gray-300 bg-white text-gray-600
                   hover:border-blue-400 hover:text-blue-600 transition">
            ${label}
            <span class="icono-orden opacity-40">↕</span>
          </button>
        `).join("")}

        <!-- Limpiar orden -->
        <button id="btnLimpiarOrden"
          class="px-3 py-1 rounded-full text-xs font-medium border border-gray-200
                 bg-gray-50 text-gray-400 hover:text-red-500 hover:border-red-300 transition hidden">
          ✕ Quitar orden
        </button>
      </div>
    </div>

    <!-- CONTADOR DE RESULTADOS -->
    <p id="contadorResultados" class="text-xs text-gray-400 px-1"></p>
  `;

  contenedor.parentNode.insertBefore(wrapper, contenedor);
}

// ===============================
// BIND EVENTOS
// ===============================
function bindEventos(productos) {

  let debounceTimer = null;

  // ── Búsqueda en tiempo real con debounce ─────────────────
  document.getElementById("inputBusqueda").addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      estado.busqueda = e.target.value.trim();
      emitir(productos);
    }, 250); // 250ms debounce
  });

  // ── Botón "Filtrar" (búsqueda inmediata) ─────────────────
  document.getElementById("btnFiltrar").addEventListener("click", () => {
    clearTimeout(debounceTimer);
    estado.busqueda = document.getElementById("inputBusqueda").value.trim();
    emitir(productos);
  });

  // ── Botones de categoría ─────────────────────────────────
  document.getElementById("btnsCategorias").addEventListener("click", (e) => {
    const btn = e.target.closest(".btnCategoria");
    if (!btn) return;

    estado.categoria = btn.dataset.cat;
    actualizarBotonesCat();
    emitir(productos);
  });

  // ── Botones de orden ─────────────────────────────────────
  document.getElementById("filtrosWrapper").addEventListener("click", (e) => {

    const btn = e.target.closest(".btnOrden");
    if (!btn) return;

    const campo = btn.dataset.orden;

    if (estado.orden.campo === campo) {
      // Mismo campo → toggle dirección
      estado.orden.dir = estado.orden.dir === "asc" ? "desc" : "asc";
    } else {
      estado.orden.campo = campo;
      estado.orden.dir   = "asc";
    }

    actualizarBotonesOrden();
    emitir(productos);
  });

  // ── Limpiar orden ────────────────────────────────────────
  document.getElementById("btnLimpiarOrden").addEventListener("click", () => {
    estado.orden = { campo: null, dir: "asc" };
    actualizarBotonesOrden();
    emitir(productos);
  });
}

// ===============================
// EMITIR CAMBIO → app.js
// ===============================
function emitir(productos) {
  const resultado = aplicarFiltros(productos);
  actualizarContador(resultado.length, productos.length);
  if (_onCambio) _onCambio(resultado);
}

// ===============================
// ACTUALIZAR ESTILOS CATEGORÍAS
// ===============================
function actualizarBotonesCat() {
  document.querySelectorAll(".btnCategoria").forEach(btn => {
    const activo = btn.dataset.cat === estado.categoria;
    btn.className = btn.className
      .replace(/bg-blue-600 text-white border-blue-600/, "")
      .replace(/bg-white text-gray-600 border-gray-300/, "")
      .trim();

    if (activo) {
      btn.classList.add("bg-blue-600", "text-white", "border-blue-600");
      btn.classList.remove("bg-white", "text-gray-600", "border-gray-300");
    } else {
      btn.classList.add("bg-white", "text-gray-600", "border-gray-300");
      btn.classList.remove("bg-blue-600", "text-white", "border-blue-600");
    }
  });
}

// ===============================
// ACTUALIZAR ESTILOS ORDEN
// ===============================
function actualizarBotonesOrden() {
  const btnLimpiar = document.getElementById("btnLimpiarOrden");

  document.querySelectorAll(".btnOrden").forEach(btn => {
    const activo = btn.dataset.orden === estado.orden.campo;
    const icono  = btn.querySelector(".icono-orden");

    // Reset
    btn.classList.remove(
      "bg-blue-600", "text-white", "border-blue-600",
      "bg-white", "text-gray-600", "border-gray-300"
    );

    if (activo) {
      btn.classList.add("bg-blue-600", "text-white", "border-blue-600");
      icono.textContent = estado.orden.dir === "asc" ? "↑" : "↓";
      icono.classList.remove("opacity-40");
    } else {
      btn.classList.add("bg-white", "text-gray-600", "border-gray-300");
      icono.textContent = "↕";
      icono.classList.add("opacity-40");
    }
  });

  // Mostrar/ocultar botón limpiar
  if (estado.orden.campo) {
    btnLimpiar.classList.remove("hidden");
  } else {
    btnLimpiar.classList.add("hidden");
  }
}

// ===============================
// CONTADOR DE RESULTADOS
// ===============================
function actualizarContador(visibles, total) {
  const el = document.getElementById("contadorResultados");
  if (!el) return;

  if (visibles === total) {
    el.textContent = `Mostrando ${total} producto${total !== 1 ? "s" : ""}`;
  } else {
    el.textContent = `Mostrando ${visibles} de ${total} producto${total !== 1 ? "s" : ""}`;
    el.classList.add("text-blue-500");
  }
}