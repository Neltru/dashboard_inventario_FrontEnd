// services/service.js

// ===============================
// CONFIGURACIÓN BASE
// ===============================
// Cambia esta URL según tu entorno:
// Desarrollo:  "http://localhost:3000"
// Producción:  "https://tu-dominio.com"
// Relativa:    "" (si frontend y backend corren juntos)
export const BASE_URL = "https://06fb-2806-102e-d-c29f-656f-14d-7c8e-f0a9.ngrok-free.app";

const API = `${BASE_URL}/api`;

// ── Helper interno: fetch + manejo de errores ────────────
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type"   : "application/json",
        "Accept"         : "application/json",
        "ngrok-skip-browser-warning": "true",  // evita la pantalla de advertencia de ngrok
      },
      mode: "cors",
      ...options,
    });

    if (!response.ok) {
      const msg = await response.text().catch(() => response.statusText);
      throw new Error(`[${response.status}] ${msg}`);
    }

    // Validar que la respuesta sea JSON y no HTML
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Respuesta inesperada (no es JSON): ${text.slice(0, 80)}`);
    }

    return response.json();
  } catch (err) {
    // redondear y mejorar mensaje para problemas de red / CORS
    console.error(`[service.request] error fetching ${url}`, err);
    throw new Error(`Error de red al solicitar ${url}: ${err.message}`);
  }
}

// ===============================
// GET /api/productos
// → Aldo: renderizar tarjetas
// ===============================
export async function obtenerProductos() {
  return request(`${API}/productos`);
}

// ===============================
// GET /api/categorias
// → Caleb: filtro por categoría
// ===============================
export async function obtenerCategorias() {
  return request(`${API}/categorias`);
}

// ===============================
// GET /api/estadisticas
// → Pedro: contadores del dashboard
// ===============================
export async function obtenerEstadisticas() {
  return request(`${API}/estadisticas`);
}

// ===============================
// POST /api/productos
// → Pedro: formulario agregar
// ===============================
export async function crearProducto(producto) {
  return request(`${API}/productos`, {
    method: "POST",
    body  : JSON.stringify(producto),
  });
}

// ===============================
// PUT /api/productos/:id
// → Pedro: formulario editar
// ===============================
export async function editarProducto(id, producto) {
  return request(`${API}/productos/${id}`, {
    method: "PUT",
    body  : JSON.stringify(producto),
  });
}

// ===============================
// PATCH /api/productos/:id/stock
// → Pedro: inline editing del stock
// ===============================
export async function patchStockAPI(id, stockAnterior, nuevoStock) {
  // Calcular cantidad y tipo basado en el cambio
  const cantidad = nuevoStock - stockAnterior;
  let tipo = "ajuste";
  
  if (cantidad > 0) {
    tipo = "entrada";
  } else if (cantidad < 0) {
    tipo = "salida";
  }
  
  return request(`${API}/productos/${id}/stock`, {
    method: "PATCH",
    body  : JSON.stringify({ 
      cantidad: Math.abs(cantidad),
      tipo: tipo
    }),
  });
}

// ===============================
// DELETE /api/productos/:id
// → Pedro: botón eliminar
// ===============================
export async function eliminarProducto(id) {
  return request(`${API}/productos/${id}`, {
    method: "DELETE",
  });
}

// ===============================
// OPCIONAL: GET /api/proveedores
// → Solo si el formulario tiene campo proveedor
// ===============================
export async function obtenerProveedores() {
  try {
    return await request(`${API}/proveedores`);
  } catch (err) {
    // Si hay error de red o servidor, devolvemos array vacío para que la UI
    // pueda mostrar el mensaje de error sin quebrar la lógica del llamado.
    console.error("obtenerProveedores error:", err);
    return [];
  }
}

// ===============================
// GET /api/reportes
// → Registrar movimiento de stock
// ===============================
export async function registrarMovimiento(id, stockAnterior, stockNuevo) {
  return request(`${API}/reportes/movimientos`, {
    method: "POST",
    body  : JSON.stringify({
      producto_id   : id,
      stock_anterior: stockAnterior,
      stock_nuevo   : stockNuevo,
      fecha         : new Date().toISOString(),
    }),
  });
}

// ===============================
// GET /api/reportes
// → Historial de movimientos de stock
// ===============================
export async function obtenerMovimientos() {
  // Temporalmente usando datos locales mientras se implementa la API
  // TODO: cambiar a return request(`${API}/reportes`) cuando el endpoint esté listo
  
  const { movimientos } = await import("../js/data-reportes.js");
  
  // Simular delay de red
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(movimientos);
    }, 500);
  });
}