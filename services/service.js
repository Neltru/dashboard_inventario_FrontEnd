// services/service.js

export async function obtenerProductosAPI() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");

    if (!response.ok) {
      throw new Error("Error al obtener los productos");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error en fetch:", error);
    return [];
  }
}