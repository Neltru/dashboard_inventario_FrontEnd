// components/modal.js

export function crearModal(onGuardar) {

  // ── Overlay ──────────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.id = "modalOverlay";
  overlay.className = [
    "fixed inset-0 bg-black/50 backdrop-blur-sm",
    "flex items-center justify-center z-50",
    "opacity-0 pointer-events-none transition-opacity duration-300"
  ].join(" ");

  // ── Panel ────────────────────────────────────────────────
  overlay.innerHTML = `
    <div id="modalPanel"
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4
             translate-y-4 transition-transform duration-300">

      <!-- Header -->
      <div class="flex justify-between items-center px-6 py-4 border-b">
        <h2 id="modalTitulo" class="text-lg font-bold text-gray-800">
          Agregar Producto
        </h2>
        <button id="modalCerrar"
          class="text-gray-400 hover:text-gray-600 transition text-xl leading-none">
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4">

        <input type="hidden" id="campoId" />

        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span class="text-red-500">*</span>
          </label>
          <input id="campoNombre" type="text"
            placeholder="Ej. Laptop HP"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p id="errorNombre" class="text-red-500 text-xs mt-1 hidden">
            El nombre es obligatorio.
          </p>
        </div>

        <!-- SKU + Categoría -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              SKU <span class="text-red-500">*</span>
            </label>
            <input id="campoSku" type="text"
              placeholder="PRO-001"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p id="errorSku" class="text-red-500 text-xs mt-1 hidden">
              SKU obligatorio.
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Categoría <span class="text-red-500">*</span>
            </label>
            <select id="campoCategoria"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar...</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Ropa">Ropa</option>
              <option value="Hogar">Hogar</option>
              <option value="Alimentos">Alimentos</option>
            </select>
            <p id="errorCategoria" class="text-red-500 text-xs mt-1 hidden">
              Selecciona una categoría.
            </p>
          </div>
        </div>

        <!-- Stock + Precio -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Stock <span class="text-red-500">*</span>
            </label>
            <input id="campoStock" type="number" min="0"
              placeholder="0"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p id="errorStock" class="text-red-500 text-xs mt-1 hidden">
              Stock debe ser ≥ 0.
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Precio ($) <span class="text-red-500">*</span>
            </label>
            <input id="campoPrecio" type="number" min="0" step="0.01"
              placeholder="0.00"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p id="errorPrecio" class="text-red-500 text-xs mt-1 hidden">
              Precio debe ser > 0.
            </p>
          </div>
        </div>

        <!-- Fecha vencimiento -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fecha de vencimiento <span class="text-red-500">*</span>
          </label>
          <input id="campoFecha" type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p id="errorFecha" class="text-red-500 text-xs mt-1 hidden">
            La fecha es obligatoria.
          </p>
        </div>

        <!-- URL imagen -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            URL de imagen
          </label>
          <input id="campoImagen" type="url"
            placeholder="https://..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p class="text-xs text-gray-400 mt-1">
            Opcional. Se usará imagen por defecto si se deja vacío.
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div class="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button id="modalCancelar"
          class="flex-1 border border-gray-300 py-2 rounded-lg text-sm
                 hover:bg-gray-100 transition font-medium">
          Cancelar
        </button>
        <button id="modalGuardar"
          class="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm
                 hover:bg-blue-700 transition font-medium">
          Guardar
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  // ── Referencias internas ─────────────────────────────────
  const panel      = overlay.querySelector("#modalPanel");
  const titulo     = overlay.querySelector("#modalTitulo");
  const btnCerrar  = overlay.querySelector("#modalCerrar");
  const btnCancelar= overlay.querySelector("#modalCancelar");
  const btnGuardar = overlay.querySelector("#modalGuardar");

  const campos = {
    id       : overlay.querySelector("#campoId"),
    nombre   : overlay.querySelector("#campoNombre"),
    sku      : overlay.querySelector("#campoSku"),
    categoria: overlay.querySelector("#campoCategoria"),
    stock    : overlay.querySelector("#campoStock"),
    precio   : overlay.querySelector("#campoPrecio"),
    fecha    : overlay.querySelector("#campoFecha"),
    imagen   : overlay.querySelector("#campoImagen"),
  };

  // ── Helpers open / close ─────────────────────────────────
  function abrir() {
    overlay.classList.remove("opacity-0", "pointer-events-none");
    panel.classList.remove("translate-y-4");
  }

  function cerrar() {
    overlay.classList.add("opacity-0", "pointer-events-none");
    panel.classList.add("translate-y-4");
    limpiarErrores();
  }

  // ── Rellenar campos en modo edición ──────────────────────
  function cargarProducto(producto) {
    titulo.textContent     = "Editar Producto";
    campos.id.value        = producto.id;
    campos.nombre.value    = producto.nombre;
    campos.sku.value       = producto.sku;
    campos.categoria.value = producto.categoria;
    campos.stock.value     = producto.stock;
    campos.precio.value    = producto.precio;
    campos.fecha.value     = producto.fecha_vencimiento;
    campos.imagen.value    = producto.imagen || "";
  }

  function limpiarCampos() {
    titulo.textContent = "Agregar Producto";
    Object.values(campos).forEach(c => (c.value = ""));
  }

  // ── Validación ───────────────────────────────────────────
  function limpiarErrores() {
    overlay.querySelectorAll("[id^='error']")
      .forEach(el => el.classList.add("hidden"));
    overlay.querySelectorAll("input, select")
      .forEach(el => el.classList.remove("border-red-500"));
  }

  function mostrarError(campo, mensajeId) {
    campos[campo].classList.add("border-red-500");
    overlay.querySelector(`#error${mensajeId}`).classList.remove("hidden");
  }

  function validar() {
    limpiarErrores();
    let ok = true;

    if (!campos.nombre.value.trim()) {
      mostrarError("nombre", "Nombre"); ok = false;
    }
    if (!campos.sku.value.trim()) {
      mostrarError("sku", "Sku"); ok = false;
    }
    if (!campos.categoria.value) {
      mostrarError("categoria", "Categoria"); ok = false;
    }
    if (campos.stock.value === "" || parseInt(campos.stock.value) < 0) {
      mostrarError("stock", "Stock"); ok = false;
    }
    if (!campos.precio.value || parseFloat(campos.precio.value) <= 0) {
      mostrarError("precio", "Precio"); ok = false;
    }
    if (!campos.fecha.value) {
      mostrarError("fecha", "Fecha"); ok = false;
    }

    return ok;
  }

  // ── Eventos ──────────────────────────────────────────────
  btnCerrar.addEventListener("click",   cerrar);
  btnCancelar.addEventListener("click", cerrar);

  // Cerrar al hacer click fuera del panel
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrar();
  });

  btnGuardar.addEventListener("click", () => {
    if (!validar()) return;

    const producto = {
      id                : campos.id.value ? parseInt(campos.id.value) : null,
      nombre            : campos.nombre.value.trim(),
      sku               : campos.sku.value.trim().toUpperCase(),
      categoria         : campos.categoria.value,
      stock             : parseInt(campos.stock.value),
      precio            : parseFloat(campos.precio.value),
      fecha_vencimiento : campos.fecha.value,
      imagen            : campos.imagen.value.trim() ||
                          "https://via.placeholder.com/300x200",
    };

    onGuardar(producto);
    cerrar();
  });

  // ── API pública del componente ───────────────────────────
  return {
    abrirNuevo() {
      limpiarCampos();
      abrir();
    },
    abrirEditar(producto) {
      limpiarCampos();
      cargarProducto(producto);
      abrir();
    },
  };
}