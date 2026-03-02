// components/modal.js

import { obtenerProveedores } from "../services/service.js";

export function crearModal(onGuardar) {

  const overlay = document.createElement("div");
  overlay.id = "modalOverlay";
  overlay.className = [
    "fixed inset-0 bg-black/50 backdrop-blur-sm",
    "flex items-center justify-center z-50",
    "opacity-0 pointer-events-none transition-opacity duration-300"
  ].join(" ");

  overlay.innerHTML = `
    <div id="modalPanel"
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4
             translate-y-4 transition-transform duration-300">

      <!-- Header -->
      <div class="flex justify-between items-center px-6 py-4 border-b">
        <h2 id="modalTitulo" class="text-lg font-bold text-gray-800">Agregar Producto</h2>
        <button id="modalCerrar" class="text-gray-400 hover:text-gray-600 transition text-xl leading-none">✕</button>
      </div>

      <!-- Body -->
      <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

        <input type="hidden" id="campoId" />

        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span class="text-red-500">*</span>
          </label>
          <input id="campoNombre" type="text" placeholder="Ej. Laptop HP"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p id="errorNombre" class="text-red-500 text-xs mt-1 hidden">El nombre es obligatorio.</p>
        </div>

        <!-- SKU + Categoría -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              SKU <span class="text-red-500">*</span>
            </label>
            <input id="campoSku" type="text" placeholder="PRO-001"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p id="errorSku" class="text-red-500 text-xs mt-1 hidden">SKU obligatorio.</p>
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
            <p id="errorCategoria" class="text-red-500 text-xs mt-1 hidden">Selecciona una categoría.</p>
          </div>
        </div>

        <!-- Stock + Precio -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Stock <span class="text-red-500">*</span>
            </label>
            <input id="campoStock" type="number" min="0" placeholder="0"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p id="errorStock" class="text-red-500 text-xs mt-1 hidden">Stock debe ser ≥ 0.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Precio ($) <span class="text-red-500">*</span>
            </label>
            <input id="campoPrecio" type="number" min="0" step="0.01" placeholder="0.00"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p id="errorPrecio" class="text-red-500 text-xs mt-1 hidden">Precio debe ser > 0.</p>
          </div>
        </div>

        <!-- Proveedor -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Proveedor <span class="text-red-500">*</span>
          </label>

          <!-- Estado: cargando -->
          <div id="proveedorCargando" class="flex items-center gap-2 text-sm text-gray-400 py-2">
            <svg class="animate-spin w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Cargando proveedores...
          </div>

          <!-- Estado: error -->
          <div id="proveedorError" class="hidden text-sm text-red-500 py-2 flex items-center gap-2">
            <span>⚠️ No se pudieron cargar los proveedores.</span>
            <button id="btnReintentarProveedores"
              class="underline text-blue-500 hover:text-blue-700 text-xs">
              Reintentar
            </button>
          </div>

          <!-- Estado: select listo -->
          <select id="campoProveedor"
            class="hidden w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Seleccionar proveedor...</option>
          </select>

          <p id="errorProveedor" class="text-red-500 text-xs mt-1 hidden">
            Selecciona un proveedor.
          </p>

          <!-- Info del proveedor seleccionado -->
          <div id="infoProveedor"
            class="hidden mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 space-y-1">
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
          <p id="errorFecha" class="text-red-500 text-xs mt-1 hidden">La fecha es obligatoria.</p>
        </div>

        <!-- URL imagen -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
          <input id="campoImagen" type="url" placeholder="https://..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p class="text-xs text-gray-400 mt-1">Opcional. Se usará imagen por defecto si se deja vacío.</p>
        </div>

      </div>

      <!-- Footer -->
      <div class="flex gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
        <button id="modalCancelar"
          class="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-100 transition font-medium">
          Cancelar
        </button>
        <button id="modalGuardar"
          class="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition font-medium">
          Guardar
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  // ── Referencias ──────────────────────────────────────────
  const panel       = overlay.querySelector("#modalPanel");
  const titulo      = overlay.querySelector("#modalTitulo");
  const btnCerrar   = overlay.querySelector("#modalCerrar");
  const btnCancelar = overlay.querySelector("#modalCancelar");
  const btnGuardar  = overlay.querySelector("#modalGuardar");

  const campos = {
    id        : overlay.querySelector("#campoId"),
    nombre    : overlay.querySelector("#campoNombre"),
    sku       : overlay.querySelector("#campoSku"),
    categoria : overlay.querySelector("#campoCategoria"),
    stock     : overlay.querySelector("#campoStock"),
    precio    : overlay.querySelector("#campoPrecio"),
    proveedor : overlay.querySelector("#campoProveedor"),
    fecha     : overlay.querySelector("#campoFecha"),
    imagen    : overlay.querySelector("#campoImagen"),
  };

  const proveedorCargando = overlay.querySelector("#proveedorCargando");
  const proveedorError    = overlay.querySelector("#proveedorError");
  const infoProveedor     = overlay.querySelector("#infoProveedor");
  const btnReintentar     = overlay.querySelector("#btnReintentarProveedores");

  // Cache de proveedores para no re-fetchear en cada apertura
  let proveedoresCache = null;

  // ── Cargar proveedores ───────────────────────────────────
  async function cargarProveedores() {
    // Si ya están en caché, solo mostrar el select
    if (proveedoresCache) {
      mostrarSelectProveedor(proveedoresCache);
      return;
    }

    proveedorCargando.classList.remove("hidden");
    proveedorError.classList.add("hidden");
    campos.proveedor.classList.add("hidden");

    try {
      const data = await obtenerProveedores();
      // Validar que sea array; si es objeto con propiedad 'data', extraerla
      const proveedoresArray = Array.isArray(data)
        ? data
        : (Array.isArray(data?.data) ? data.data : []);
      
      if (!Array.isArray(proveedoresArray)) {
        console.warn("⚠️ Respuesta de API proveedores no es un array");
      }
      
      proveedoresCache = proveedoresArray;
      mostrarSelectProveedor(proveedoresArray);
    } catch (err) {
      console.error("Error cargando proveedores:", err);
      proveedorCargando.classList.add("hidden");
      proveedorError.classList.remove("hidden");
    }
  }

  function mostrarSelectProveedor(proveedores) {
    proveedorCargando.classList.add("hidden");
    proveedorError.classList.add("hidden");
    campos.proveedor.classList.remove("hidden");

    // Limpiar opciones previas (excepto el placeholder)
    campos.proveedor.innerHTML = `<option value="">Seleccionar proveedor...</option>`;

    // Solo mostrar proveedores activos
    const activos = proveedores.filter(p => p.activo !== false);
    activos.forEach(p => {
      const opt = document.createElement("option");
      opt.value       = p.id;
      opt.textContent = p.nombre;
      opt.dataset.contacto = p.contacto ?? "";
      // Guardar todos los campos extra como JSON para mostrar info
      opt.dataset.info = JSON.stringify(p);
      campos.proveedor.appendChild(opt);
    });

    if (activos.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No hay proveedores activos';
      opt.disabled = true;
      campos.proveedor.appendChild(opt);
    }
  }

  // Mostrar info del proveedor al seleccionar
  campos.proveedor.addEventListener("change", () => {
    const selected = campos.proveedor.selectedOptions[0];
    if (!selected || !selected.dataset.info) {
      infoProveedor.classList.add("hidden");
      return;
    }

    try {
      const info = JSON.parse(selected.dataset.info);
      // Mostrar solo campos relevantes de la tabla proveedores
      const filas = [
        info.contacto  ? `<span>👤 <strong>Contacto:</strong> ${info.contacto}</span>`   : "",
        info.telefono  ? `<span>📞 <strong>Teléfono:</strong> ${info.telefono}</span>`   : "",
        info.email     ? `<span>✉️ <strong>Email:</strong> ${info.email}</span>`          : "",
        info.direccion ? `<span>📍 <strong>Dirección:</strong> ${info.direccion}</span>` : "",
      ].filter(Boolean).join("");

      infoProveedor.innerHTML = filas || "<span class='text-gray-400'>Sin información adicional</span>";
      infoProveedor.classList.remove("hidden");
    } catch {
      infoProveedor.classList.add("hidden");
    }
  });

  // Reintentar si falló
  btnReintentar.addEventListener("click", cargarProveedores);

  // ── Open / Close ─────────────────────────────────────────
  function abrir() {
    overlay.classList.remove("opacity-0", "pointer-events-none");
    panel.classList.remove("translate-y-4");
    cargarProveedores(); // fetch (o desde caché)
  }

  function cerrar() {
    overlay.classList.add("opacity-0", "pointer-events-none");
    panel.classList.add("translate-y-4");
    limpiarErrores();
    infoProveedor.classList.add("hidden");
  }

  // ── Cargar producto en modo edición ──────────────────────
  function cargarProducto(producto) {
    titulo.textContent      = "Editar Producto";
    campos.id.value         = producto.id;
    campos.nombre.value     = producto.nombre;
    campos.sku.value        = producto.sku;
    campos.sku.disabled     = true;  // SKU no se puede editar
    campos.categoria.value  = producto.categoria;
    campos.stock.value      = producto.stock;
    campos.precio.value     = producto.precio;
    campos.fecha.value      = producto.fecha_vencimiento;
    campos.imagen.value     = producto.imagen || "";

    // Seleccionar el proveedor correcto una vez cargado el select
    if (producto.proveedor_id) {
      // Si el select ya tiene opciones, seleccionar de inmediato
      if (campos.proveedor.options.length > 1) {
        campos.proveedor.value = producto.proveedor_id;
        campos.proveedor.dispatchEvent(new Event("change"));
      } else {
        // Esperar a que carguen los proveedores
        const observer = new MutationObserver(() => {
          if (campos.proveedor.options.length > 1) {
            campos.proveedor.value = producto.proveedor_id;
            campos.proveedor.dispatchEvent(new Event("change"));
            observer.disconnect();
          }
        });
        observer.observe(campos.proveedor, { childList: true });
      }
    }
  }

  function limpiarCampos() {
    titulo.textContent = "Agregar Producto";
    campos.sku.disabled = false;  // SKU habilitado para nuevos productos
    Object.values(campos).forEach(c => (c.value = ""));
    infoProveedor.classList.add("hidden");
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

    if (!campos.nombre.value.trim())                          { mostrarError("nombre",    "Nombre");    ok = false; }
    if (!campos.sku.value.trim())                             { mostrarError("sku",       "Sku");       ok = false; }
    if (!campos.categoria.value)                              { mostrarError("categoria", "Categoria"); ok = false; }
    if (campos.stock.value === "" || parseInt(campos.stock.value) < 0)
                                                              { mostrarError("stock",     "Stock");     ok = false; }
    if (!campos.precio.value || parseFloat(campos.precio.value) <= 0)
                                                              { mostrarError("precio",    "Precio");    ok = false; }
    if (!campos.proveedor.value)                              { mostrarError("proveedor", "Proveedor"); ok = false; }
    if (!campos.fecha.value)                                  { mostrarError("fecha",     "Fecha");     ok = false; }

    return ok;
  }

  // ── Eventos ──────────────────────────────────────────────
  btnCerrar.addEventListener("click",   cerrar);
  btnCancelar.addEventListener("click", cerrar);
  overlay.addEventListener("click", e => { if (e.target === overlay) cerrar(); });

  btnGuardar.addEventListener("click", () => {
    if (!validar()) return;

    // Mapear nombre de categoría a ID
    const categoriasMap = {
      "Tecnología": 1,
      "Accesorios": 2,
      "Ropa": 3,
      "Hogar": 4,
      "Alimentos": 5,
    };

    const producto = {
      id                : campos.id.value ? parseInt(campos.id.value) : null,
      nombre            : campos.nombre.value.trim(),
      sku               : campos.sku.value.trim().toUpperCase(),
      id_categoria      : categoriasMap[campos.categoria.value] || 1,  // Mapear a ID
      stock             : parseInt(campos.stock.value),
      precio            : parseFloat(campos.precio.value),
      proveedor_id      : parseInt(campos.proveedor.value),   // ← relación por ID
      fecha_vencimiento : campos.fecha.value,
      imagen            : campos.imagen.value.trim() || "https://via.placeholder.com/300x200",
    };

    onGuardar(producto);
    cerrar();
  });

  // ── API pública ──────────────────────────────────────────
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
    // Expuesto para limpiar caché si se agrega un proveedor nuevo
    limpiarCacheProveedores() {
      proveedoresCache = null;
    },
  };
}