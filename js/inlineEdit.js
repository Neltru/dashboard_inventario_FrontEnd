// js/inlineEdit.js

// ===============================
// INLINE EDITING
// ===============================

/**
 * Activa el inline editing en los campos editables de una card.
 * Se llama desde crearCard() después de aplicarReglasDinamicas().
 *
 * @param {HTMLElement} card       - La card del producto
 * @param {Object}      producto   - El objeto producto
 * @param {Function}    onActualizar - Callback(id, campo, valor) llamado tras PATCH exitoso
 */
export function activarInlineEditing(card, producto, onActualizar) {

  // Campos habilitados para edición inline:
  // data-campo  → clave del objeto producto
  // data-tipo   → "texto" | "numero"
  const CAMPOS = [
    { selector: ".inline-nombre", campo: "nombre",  tipo: "texto"  },
    { selector: ".inline-precio", campo: "precio",  tipo: "numero" },
    { selector: ".inline-stock",  campo: "stock",   tipo: "numero" },
  ];

  CAMPOS.forEach(({ selector, campo, tipo }) => {

    const elemento = card.querySelector(selector);
    if (!elemento) return;

    // Cursor pointer para indicar que es editable
    elemento.classList.add("cursor-pointer", "hover:bg-blue-50", "rounded", "px-1", "-mx-1", "transition");
    elemento.title = "Doble clic para editar";

    elemento.addEventListener("dblclick", () => {
      iniciarEdicion(elemento, producto, campo, tipo, onActualizar);
    });
  });
}

// ===============================
// INICIAR EDICIÓN
// ===============================
function iniciarEdicion(elemento, producto, campo, tipo, onActualizar) {

  // Evitar doble activación si ya hay un input activo
  if (elemento.querySelector("input")) return;

  const valorOriginal = producto[campo];

  // ── Crear input ──────────────────────────────────────────
  const input = document.createElement("input");
  input.type  = tipo === "numero" ? "number" : "text";
  input.value = valorOriginal;
  input.min   = tipo === "numero" ? "0" : undefined;

  input.className = [
    "w-full border-b-2 border-blue-500 outline-none bg-transparent",
    "text-sm font-semibold text-gray-800 py-0.5",
  ].join(" ");

  // ── Guardar referencia al texto original y ocultarlo ─────
  const textoOriginal = elemento.innerHTML;
  elemento.innerHTML  = "";
  elemento.appendChild(input);

  input.focus();
  input.select(); // seleccionar todo el texto para edición rápida

  // ── Confirmar ────────────────────────────────────────────
  async function confirmar() {
    const nuevoValor = tipo === "numero"
      ? parseFloat(input.value)
      : input.value.trim();

    // Validación básica
    if (
      input.value.trim() === "" ||
      (tipo === "numero" && (isNaN(nuevoValor) || nuevoValor < 0))
    ) {
      cancelar();
      return;
    }

    // Sin cambios → no hacer nada
    if (nuevoValor === valorOriginal) {
      restaurar(elemento, textoOriginal);
      return;
    }

    // ── Optimista: actualizar DOM ya ──────────────────────
    restaurar(elemento, formatearValor(campo, nuevoValor));
    producto[campo] = nuevoValor;
    onActualizar(producto.id, campo, nuevoValor, elemento, textoOriginal, valorOriginal);
  }

  // ── Cancelar (Escape) ────────────────────────────────────
  function cancelar() {
    restaurar(elemento, textoOriginal);
  }

  // ── Eventos del input ────────────────────────────────────
  input.addEventListener("blur", confirmar);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.removeEventListener("blur", confirmar); // evitar doble disparo
      confirmar();
    }
    if (e.key === "Escape") {
      input.removeEventListener("blur", confirmar);
      cancelar();
    }
  });
}

// ===============================
// RESTAURAR ELEMENTO
// ===============================
function restaurar(elemento, contenidoHTML) {
  elemento.innerHTML = contenidoHTML;
}

// ===============================
// FORMATEAR VALOR PARA MOSTRAR
// ===============================
function formatearValor(campo, valor) {
  if (campo === "precio") return `$${parseFloat(valor).toFixed(2)}`;
  if (campo === "stock")  return `${parseInt(valor)}`;
  return valor;
}