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
        <!-- DESPUÉS (poner esto): -->
<div>
  <label class="block text-sm font-medium text-gray-700 mb-1">Imagen del producto</label>

  <!-- Zona de drop / click -->
  <div id="zonaImagen"
    class="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center
           cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group">

    <!-- Preview (oculto hasta que se seleccione) -->
        <img id="previewImagen" src=""
          class="hidden w-full h-36 object-cover rounded-lg mb-2" />

        <!-- Placeholder -->
        <div id="placeholderImagen" class="flex flex-col items-center gap-1 py-2">
          <svg class="w-8 h-8 text-gray-300 group-hover:text-blue-400 transition"
            fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M3 16.5V19a1 1 0 001 1h16a1 1 0 001-1v-2.5M16 10l-4-4m0 0L8 10m4-4v12"/>
          </svg>
          <p class="text-sm text-gray-400 group-hover:text-blue-500 transition">
            Haz clic o arrastra una imagen aquí
          </p>
          <p class="text-xs text-gray-300">PNG, JPG, WEBP — máx. 5 MB</p>
        </div>

        <!-- Input file oculto -->
        <input id="campoImagen" type="file" accept="image/*"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>

      <!-- Botón para quitar imagen seleccionada -->
      <button id="btnQuitarImagen" type="button"
        class="hidden mt-2 text-xs text-red-400 hover:text-red-600 transition">
        ✕ Quitar imagen
      </button>

      <p class="text-xs text-gray-400 mt-1">
        Opcional. Si no seleccionas ninguna, se usará una imagen por defecto.
      </p>
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
  // ── Imagen: referencias ──────────────────────────────────
  const zonaImagen       = overlay.querySelector("#zonaImagen");
  const previewImagen    = overlay.querySelector("#previewImagen");
  const placeholderImg   = overlay.querySelector("#placeholderImagen");
  const btnQuitarImagen  = overlay.querySelector("#btnQuitarImagen");
  // Guarda el base64 o URL actual de la imagen
  let imagenBase64 = null;

// Mostrar preview cuando el usuario elige un archivo
overlay.querySelector("#campoImagen").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert("La imagen no debe superar 5 MB.");
    e.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    imagenBase64 = ev.target.result; // data:image/...;base64,...
    mostrarPreview(imagenBase64);
  };
  reader.readAsDataURL(file);
});

// Drag & drop visual
zonaImagen.addEventListener("dragover",  (e) => { e.preventDefault(); zonaImagen.classList.add("border-blue-400","bg-blue-50"); });
zonaImagen.addEventListener("dragleave", ()  => { zonaImagen.classList.remove("border-blue-400","bg-blue-50"); });
zonaImagen.addEventListener("drop", (e) => {
  e.preventDefault();
  zonaImagen.classList.remove("border-blue-400","bg-blue-50");
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    imagenBase64 = ev.target.result;
    mostrarPreview(imagenBase64);
  };
  reader.readAsDataURL(file);
});

btnQuitarImagen.addEventListener("click", () => {
  imagenBase64 = null;
  overlay.querySelector("#campoImagen").value = "";
  ocultarPreview();
});

function mostrarPreview(src) {
  previewImagen.src = src;
  previewImagen.classList.remove("hidden");
  placeholderImg.classList.add("hidden");
  btnQuitarImagen.classList.remove("hidden");
}

function ocultarPreview() {
  previewImagen.src = "";
  previewImagen.classList.add("hidden");
  placeholderImg.classList.remove("hidden");
  btnQuitarImagen.classList.add("hidden");
}

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
  campos.sku.disabled     = true;
  campos.categoria.value  = producto.categoria;
  campos.stock.value      = producto.stock;
  campos.precio.value     = producto.precio;
  campos.fecha.value      = producto.fecha_vencimiento;
  // campos.imagen ya no es URL — mostramos el preview si hay imagen
  if (producto.imagen && !producto.imagen.includes("placeholder")) {
    imagenBase64 = producto.imagen; // puede ser base64 o URL externa
    mostrarPreview(producto.imagen);
  } else {
    imagenBase64 = null;
    ocultarPreview();
  }

  if (producto.proveedor_id) {
    if (campos.proveedor.options.length > 1) {
      campos.proveedor.value = producto.proveedor_id;
      campos.proveedor.dispatchEvent(new Event("change"));
    } else {
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
    campos.sku.disabled = false;
    // Limpiar todos los campos excepto imagen (que es file, no tiene .value útil)
    Object.entries(campos).forEach(([key, c]) => {
      if (key !== "imagen") c.value = "";
    });
    imagenBase64 = null;
    ocultarPreview();
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

  // ── Validación de campos antes de guardar ─────────────────
  function validar() {
    limpiarErrores();

    const stockSeguro     = Number(campos.stock.value);
    const precioSeguro    = Number(campos.precio.value);
    const proveedorSeguro = Number(campos.proveedor.value);

    let esValido = true;

    if (!Number.isFinite(stockSeguro) || stockSeguro <= 0) {
      mostrarError("stock", "Stock");
      esValido = false;
    }

    if (!Number.isFinite(precioSeguro) || precioSeguro <= 0) {
      mostrarError("precio", "Precio");
      esValido = false;
    }

    if (!Number.isFinite(proveedorSeguro) || proveedorSeguro <= 0) {
      mostrarError("proveedor", "Proveedor");
      esValido = false;
    }

    if (!esValido) return null;

    return { stockSeguro, precioSeguro, proveedorSeguro };
  }

  // ── Eventos ──────────────────────────────────────────────
  btnCerrar.addEventListener("click",   cerrar);
  btnCancelar.addEventListener("click", cerrar);
  overlay.addEventListener("click", e => { if (e.target === overlay) cerrar(); });

  btnGuardar.addEventListener("click", () => {
    const resultado = validar();
    if (!resultado) return;

    const { stockSeguro, precioSeguro, proveedorSeguro } = resultado;

    const categoriasMap = {
      "Tecnología": 1, "Accesorios": 2,
      "Ropa": 3,       "Hogar": 4,      "Alimentos": 5,
    };

    const producto = {
      id                : campos.id.value ? Number(campos.id.value) : null,
      nombre            : campos.nombre.value.trim(),
      sku               : campos.sku.value.trim().toUpperCase(),
      id_categoria      : categoriasMap[campos.categoria.value] || 1,
      stock             : stockSeguro,
      precio            : precioSeguro,
      proveedor_id      : proveedorSeguro,
      fecha_vencimiento : campos.fecha.value,
      imagen            : imagenBase64 || "https://placehold.co/300x200.jpg",
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