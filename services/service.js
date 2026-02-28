// services/service.js

export async function obtenerProductosAPI() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");

    if (!response.ok) throw new Error("Error al obtener los productos");

    return await response.json();

  } catch (error) {
    console.error("Error en fetch:", error);
    return [];
  }
}

// ===============================
// PATCH — actualizar campo puntual
// ===============================

/**
 * Envía solo el campo modificado a la API.
 *
 * @param {number|string} id     - ID del producto
 * @param {string}        campo  - Clave a actualizar ("nombre", "precio", "stock")
 * @param {*}             valor  - Nuevo valor
 * @returns {Promise<boolean>}   - true si OK, false si fallo
 */
export async function patchProductoAPI(id, campo, valor) {
  try {
    const response = await fetch(`https://fakestoreapi.com/products/${id}`, {
      method : "PATCH",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ [campo]: valor }),
    });

    if (!response.ok) throw new Error(`PATCH falló: ${response.status}`);

    const data = await response.json();
    console.log(`✅ PATCH OK [${campo}]:`, data);
    return true;

  } catch (error) {
    console.error(`❌ PATCH error [${campo}]:`, error);
    return false;
  }
}