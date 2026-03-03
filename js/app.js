// js/app.js

// ===============================
// INYECTAR ANIMACIONES CSS
// ===============================
const style = document.createElement("style");
style.textContent = `
.flash { animation: flashEffect 0.6s ease; }
@keyframes flashEffect {
  0%   { background-color: #bfdbfe; }
  100% { background-color: transparent; }
}
.fade-in {
  opacity: 0; transform: translateY(10px);
  animation: fadeInEffect 0.5s ease forwards;
}
@keyframes fadeInEffect { to { opacity: 1; transform: translateY(0); } }
.inline-guardando { opacity: 0.4; }
.inline-ok   { animation: inlineOk   0.8s ease forwards; }
.inline-error{ animation: inlineError 0.8s ease forwards; }
@keyframes inlineOk   { 0% { background-color: #bbf7d0; } 100% { background-color: transparent; } }
@keyframes inlineError{ 0% { background-color: #fecaca; } 100% { background-color: transparent; } }
.card-oculta { display: none !important; }
#sinResultados { display: none; }
#sinResultados.visible { display: flex; }
.stat-update { animation: statPop 0.4s ease; }
@keyframes statPop { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
`;
document.head.appendChild(style);

import { productos as productosLocales } from "./data.js";
import { crearCard }           from "../components/card.js";
import { crearModal }          from "../components/modal.js";
import { toast }               from "./toast.js";
import { inicializarFiltros, aplicarFiltros } from "./filtros.js";
import { mostrarSkeletons, ocultarSkeletons } from "./skeleton.js";
import {
  obtenerProductos,
  obtenerCategorias,
  obtenerEstadisticas,
  crearProducto,
  editarProducto,
  patchStockAPI,
  eliminarProducto,
} from "../services/service.js";

// Array vivo de productos (se llena desde la API)
let productos = [];

// caché de URLs de imagen en localStorage para compensar API que no persiste
const IMAGEN_CACHE_KEY = "productos_imagenes";
function cargarCacheImagenes() {
  try {
    return JSON.parse(localStorage.getItem(IMAGEN_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}
function guardarCacheImagen(id, url) {
  const cache = cargarCacheImagenes();
  cache[id] = url;
  localStorage.setItem(IMAGEN_CACHE_KEY, JSON.stringify(cache));
}
function aplicarCacheImagenes(lista) {
  const cache = cargarCacheImagenes();
  return lista.map(p => {
    if (cache[p.id]) {
      return { ...p, imagen: cache[p.id] };
    }
    return p;
  });
}

const contenedor = document.getElementById("productosContainer");

// ── Placeholder sin resultados ───────────────────────────
const sinResultados = document.createElement("div");
sinResultados.id = "sinResultados";
sinResultados.className = "col-span-full flex-col items-center justify-center py-16 text-gray-400 gap-3";
sinResultados.innerHTML = `
  <svg class="w-12 h-12 opacity-30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
  </svg>
  <p class="text-sm font-medium">Sin resultados para esta búsqueda</p>
  <p class="text-xs">Intenta con otro nombre, SKU o categoría</p>
`;
contenedor.appendChild(sinResultados);

// ── Modal ────────────────────────────────────────────────
const modal = crearModal(guardarProducto);
document.getElementById("btnAgregar").addEventListener("click", () => modal.abrirNuevo());

// ── Botón Ver Reportes ──────────────────────────────────
document.getElementById("btnVerReportes").addEventListener("click", () => {
  window.location.href = "./pages/reportes.html";
});

// ===============================
// RENDER PRINCIPAL
// ===============================
async function renderizarProductos() {

  // 1. Skeletons en productos y stats
  mostrarSkeletons(contenedor, 4);
  contenedor.appendChild(sinResultados);

  try {
    // 2. Fetch en paralelo: productos + categorías + estadísticas
    const [productosAPI, categoriasAPI, statsAPI] = await Promise.allSettled([
      obtenerProductos(),
      obtenerCategorias(),
      obtenerEstadisticas(),
    ]);

    // Usar datos de API si OK, fallback a local si falla
    const productosData = productosAPI.status === "fulfilled" ? productosAPI.value : null;
    // Validar que sea array; si es objeto con propiedad 'data', extraerla
    productos = Array.isArray(productosData)
      ? productosData
      : (Array.isArray(productosData?.data) ? productosData.data : productosLocales);

    // garantizar que cada producto tenga una imagen válida (fallback placeholder)
    productos = productos.map(p => ({
      ...p,
      imagen: p.imagen || "https://placehold.co/300x200",
    }));

    // Aplicar caché local de imágenes (base64) por id
    productos = aplicarCacheImagenes(productos);

    if (productosAPI.status === "rejected") {
      console.warn("⚠️ GET /api/productos falló, usando data.js local");
    }
    
    if (!Array.isArray(productos)) {
      console.warn("⚠️ Respuesta de API no es un array, usando data.js local");
      productos = productosLocales;
    }

    // 3. Estadísticas: siempre calcular desde los productos cargados
    actualizarEstadisticas();
    revelarStats();

    // 4. Categorías: usar API si OK, extraer del array si falla
    const categorias = categoriasAPI.status === "fulfilled"
      ? categoriasAPI.value
      : [...new Set(productos.map(p => p.categoria))];

    if (categoriasAPI.status === "rejected") {
      console.warn("⚠️ GET /api/categorias falló, extrayendo del array");
    }

    // 5. Ocultar skeletons y renderizar cards
    ocultarSkeletons(contenedor);

    productos.forEach(producto => {
      const card = crearCard(producto, abrirEditar, alActualizarInline, eliminarProductoHandler);
      card.classList.add("fade-in");
      contenedor.insertBefore(card, sinResultados);
    });

    // 6. Filtros con categorías reales
    inicializarFiltros(productos, categorias, onFiltrosCambian);

  } catch (err) {
    // Error inesperado — fallback total
    console.error("Error crítico al cargar:", err);
    ocultarSkeletons(contenedor);
    productos = productosLocales;
    productos.forEach(p => {
      const card = crearCard(p, abrirEditar, alActualizarInline);
      contenedor.insertBefore(card, sinResultados);
    });
    actualizarEstadisticas();
    revelarStats();
    inicializarFiltros(productos, [...new Set(productos.map(p => p.categoria))], onFiltrosCambian);
    toast.advertencia("No se pudo conectar a la API. Mostrando datos locales.");
  }
}

// ===============================
// GUARDAR (POST o PUT según si tiene id)
// ===============================
async function guardarProducto(producto) {
  try {
    let productoGuardado;

    const categoriasNombre = {
      1: "Tecnología", 2: "Accesorios",
      3: "Ropa",       4: "Hogar",      5: "Alimentos",
    };
    

    // Mezcla lo enviado + respuesta de la API, resolviendo campos con nombres distintos
    function normalizar(enviado, respuesta) {
      return {
        ...enviado,   // base con todos los campos correctos
        ...respuesta, // sobreescribe con datos reales (ej: el id asignado)
        // Campos que la API puede devolver diferente:
        categoria: respuesta.categoria
          || categoriasNombre[respuesta.id_categoria]
          || categoriasNombre[enviado.id_categoria]
          || enviado.categoria || "",
        nombre:            respuesta.nombre            || enviado.nombre,
        sku:               respuesta.sku               || enviado.sku,
        stock:             respuesta.stock             ?? enviado.stock,
        precio:            respuesta.precio            ?? enviado.precio,
        fecha_vencimiento: respuesta.fecha_vencimiento || enviado.fecha_vencimiento,
        imagen:            respuesta.imagen            || enviado.imagen
                           || "https://placehold.co/300x200.jpg",
        proveedor_id:      respuesta.proveedor_id      || enviado.proveedor_id,
        proveedor_nombre:  respuesta.proveedor_nombre  || "",
      };
    }

    const etiquetasCampos = {
      nombre: "Nombre", precio: "Precio", stock: "Stock",
      fecha_vencimiento: "Fecha de vencimiento", sku: "SKU",
      categoria: "Categoría", proveedor_id: "Proveedor", imagen: "Imagen",
    };
    producto.stock = Number(producto.stock);
    producto.precio = Number(producto.precio);

    // Si la imagen viene como base64 (data URL), NO la enviamos al backend
    // (muchos APIs/BD no aceptan strings tan grandes en este campo).
    // La persistimos en localStorage usando el id retornado por la API.
    const imagenOriginal = producto.imagen;
    const esImagenBase64 =
      typeof imagenOriginal === "string" && imagenOriginal.startsWith("data:image/");
    if (esImagenBase64) {
      producto.imagen = "https://placehold.co/300x200.jpg";
    }

    if (isNaN(producto.stock) || producto.stock <= 0) {
      toast.error("El stock debe ser un número mayor a 0.");
      return;
    }

    if (isNaN(producto.precio) || producto.precio <= 0) {
      toast.error("El precio debe ser un número mayor a 0.");
      return;
    }

    // Debug: ver exactamente qué se envía al backend
    console.log("DEBUG guardarProducto payload:", {
      ...producto,
      imagen_es_base64: esImagenBase64,
      stock_tipo  : typeof producto.stock,
      precio_tipo : typeof producto.precio,
    });

    if (producto.id === null) {
      const respuesta = await crearProducto(producto);
      productoGuardado = normalizar(producto, respuesta);
      if (esImagenBase64 && productoGuardado?.id != null) {
        guardarCacheImagen(productoGuardado.id, imagenOriginal);
        productoGuardado.imagen = imagenOriginal;
      }
      productos.push(productoGuardado);
      agregarCard(productoGuardado);
      toast.exito(`"${productoGuardado.nombre || 'Producto'}" agregado correctamente.`);

    } else {
      const respuesta = await editarProducto(producto.id, producto);
      productoGuardado = normalizar(producto, respuesta);
      if (esImagenBase64 && productoGuardado?.id != null) {
        guardarCacheImagen(productoGuardado.id, imagenOriginal);
        productoGuardado.imagen = imagenOriginal;
      }
      const idx = productos.findIndex(p => p.id === productoGuardado.id);
      if (idx !== -1) productos[idx] = productoGuardado;
      actualizarCard(productoGuardado);

      const camposCambiados = Object.keys(producto).filter(k => producto[k] !== productoGuardado[k]);
      if (camposCambiados.length === 1) {
        toast.exito(`${etiquetasCampos[camposCambiados[0]] || camposCambiados[0]} actualizado correctamente.`);
      } else {
        toast.exito(`"${productoGuardado.nombre || 'Producto'}" actualizado correctamente.`);
      }
    }
  } catch (err) {
    console.error("Error al guardar:", err);
    toast.error("No se pudo guardar el producto. Revisa tu conexión.");
  }
}


// ===============================
// ELIMINAR PRODUCTO
// ===============================
export async function eliminarProductoHandler(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  try {
    // ── DELETE /api/productos/:id ─────────────────────
    await eliminarProducto(id);

    // Quitar del array y del DOM
    productos = productos.filter(p => p.id !== id);
    const card = contenedor.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.style.transition = "opacity 0.3s, transform 0.3s";
      card.style.opacity    = "0";
      card.style.transform  = "scale(0.95)";
      setTimeout(() => card.remove(), 300);
    }

    const resultado = aplicarFiltros(productos);
    onFiltrosCambian(resultado);
    actualizarEstadisticas();
    toast.exito(`"${producto.nombre}" eliminado.`);

  } catch (err) {
    console.error("Error al eliminar:", err);
    toast.error("No se pudo eliminar el producto.");
  }
}

// ===============================
// CALLBACK INLINE EDIT → PATCH /stock
// ===============================
async function alActualizarInline(id, campo, nuevoValor, elemento, textoOriginalHTML, valorOriginal, tieneAPI) {

  const producto = productos.find(p => p.id === id);
  elemento.classList.add("inline-guardando");

  try {
    if (tieneAPI && campo === "stock") {
      // ── PATCH /api/productos/:id/stock ───────────────
      // Pasar stock anterior y nuevo para calcular cantidad y tipo
      await patchStockAPI(id, parseInt(valorOriginal), parseInt(nuevoValor));
    }
    // nombre y precio no tienen endpoint propio:
    // el cambio queda en memoria hasta que se guarde con PUT desde el modal

    elemento.classList.remove("inline-guardando");
    elemento.classList.add("inline-ok");
    setTimeout(() => elemento.classList.remove("inline-ok"), 800);

    const etiquetas = { nombre: "Nombre", precio: "Precio", stock: "Stock", fecha_vencimiento: "Fecha de vencimiento" };
    const sufijo = tieneAPI ? "" : " (pendiente de guardar con Editar)";
    toast.exito(`${etiquetas[campo] ?? campo} actualizado.${sufijo}`, 2500);

    if ((campo === "stock" || campo === "fecha_vencimiento") && producto) {
      const card = contenedor.querySelector(`[data-id="${id}"]`);
      if (card) reaplicarReglas(card, producto);
    }

    const resultado = aplicarFiltros(productos);
    onFiltrosCambian(resultado);
    actualizarEstadisticas();

  } catch (err) {
    console.error("Error PATCH:", err);
    elemento.classList.remove("inline-guardando");

    // Rollback
    if (producto) producto[campo] = valorOriginal;
    elemento.innerHTML = textoOriginalHTML;
    elemento.classList.add("inline-error");
    setTimeout(() => elemento.classList.remove("inline-error"), 800);
    toast.error("No se pudo guardar el cambio. Revisa tu conexión.");
  }
}

// ===============================
// ESTADÍSTICAS DESDE API
// ===============================

// ===============================
// ESTADÍSTICAS CALCULADAS LOCAL (fallback)
// ===============================
function actualizarEstadisticas() {
  const hoy        = new Date();
  const valorTotal = productos.reduce((acc, p) => {
    const precio = parseFloat(p.precio) || 0;
    const stock = parseInt(p.stock) || 0;
    return acc + (precio * stock);
  }, 0);

  setStatWithAnimation("totalProductos", productos.length);
  setStatWithAnimation("stockBajo",  productos.filter(p => p.stock > 0 && p.stock < 5).length);
  setStatWithAnimation("agotados",   productos.filter(p => p.stock === 0).length);
  setStatWithAnimation("vencidos",   productos.filter(p => new Date(p.fecha_vencimiento) < hoy).length);
  setStatWithAnimation("valorTotal", `$${valorTotal.toLocaleString("es-MX")}`);
}


function setStatWithAnimation(id, valor) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = valor;
  el.classList.remove("stat-update");
  void el.offsetWidth;
  el.classList.add("stat-update");
}

// Revelar stat cards (ocultar skeletons de stats)
function revelarStats() {
  ["totalProductos","stockBajo","agotados","vencidos","valorTotal"].forEach(id => {
    const sk = document.getElementById(`${id}-sk`);
    const el = document.getElementById(id);
    if (sk) sk.style.display = "none";
    if (el) el.classList.remove("hidden");
  });
}

// ===============================
// FILTROS CALLBACK
// ===============================
function onFiltrosCambian(productosFiltrados) {
  const idsVisibles = new Set(productosFiltrados.map(p => String(p.id)));

  productosFiltrados.forEach((producto, i) => {
    const card = contenedor.querySelector(`[data-id="${producto.id}"]`);
    if (!card) return;
    card.classList.remove("card-oculta");
    card.style.order = i;
  });

  Array.from(contenedor.querySelectorAll("[data-id]")).forEach(card => {
    if (!idsVisibles.has(card.dataset.id)) card.classList.add("card-oculta");
  });

  sinResultados.classList.toggle("visible", productosFiltrados.length === 0);
}

// ===============================
// HELPERS DOM
// ===============================
function abrirEditar(id) {
  const producto = productos.find(p => p.id === id);
  if (producto) modal.abrirEditar(producto);
}

function agregarCard(producto) {
  const card = crearCard(producto, abrirEditar, alActualizarInline, eliminarProductoHandler);
  card.classList.add("fade-in");
  contenedor.insertBefore(card, sinResultados);
}

function actualizarCard(producto) {
  const cardVieja = contenedor.querySelector(`[data-id="${producto.id}"]`);
  if (!cardVieja) return;
  const nuevaCard = crearCard(producto, abrirEditar, alActualizarInline);
  nuevaCard.style.order = cardVieja.style.order;
  cardVieja.replaceWith(nuevaCard);
  nuevaCard.classList.add("flash");
  setTimeout(() => nuevaCard.classList.remove("flash"), 600);
}

function reaplicarReglas(card, producto) {
  const badge     = card.querySelector(".badge");
  const btnAccion = card.querySelector(".btnEditar");
  const fechaElem = card.querySelector(".inline-fecha-vencimiento");

  // Actualizar fecha de vencimiento en tiempo real
  if (fechaElem) {
    fechaElem.textContent = producto.fecha_vencimiento || "N/A";
  }

  card.classList.remove("border-2","border-yellow-500","border-red-500","opacity-50");
  badge.className   = "badge text-xs px-2 py-1 rounded-full";
  badge.textContent = "Stock Normal";
  badge.classList.add("bg-green-100","text-green-600");

  if (btnAccion) {
    btnAccion.disabled = false;
    btnAccion.classList.remove("opacity-50","cursor-not-allowed");
  }

  if (producto.stock > 0 && producto.stock < 5) {
    card.classList.add("border-2","border-yellow-500");
    badge.textContent = "Stock Bajo";
    badge.classList.replace("bg-green-100","bg-yellow-100");
    badge.classList.replace("text-green-600","text-yellow-600");
  }
  if (producto.stock === 0) {
    card.classList.add("border-2","border-red-500");
    badge.textContent = "Agotado";
    badge.classList.replace("bg-green-100","bg-red-100");
    badge.classList.replace("text-green-600","text-red-600");
    if (btnAccion) {
      btnAccion.disabled = true;
      btnAccion.classList.add("opacity-50","cursor-not-allowed");
    }
  }
  const hoy = new Date();
  if (producto.fecha_vencimiento && new Date(producto.fecha_vencimiento) < hoy) {
    card.classList.add("opacity-50");
    badge.textContent = "Vencido";
    badge.classList.replace("bg-green-100","bg-gray-200");
    badge.classList.replace("text-green-600","text-gray-600");
  }
}

// ===============================
document.addEventListener("DOMContentLoaded", renderizarProductos);