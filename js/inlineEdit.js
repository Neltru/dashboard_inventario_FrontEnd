// js/inlineEdit.js

import { patchStockAPI } from "../services/service.js";

// ===============================
// INLINE EDITING
// ===============================
// Campos inline habilitados y su endpoint correspondiente:
//  - stock  → PATCH /api/productos/:id/stock  (endpoint dedicado)
//  - nombre → sin endpoint propio, se guarda vía PUT desde el modal
//  - precio → sin endpoint propio, se guarda vía PUT desde el modal
//
// Por eso solo "stock" hace llamada API aquí.
// nombre y precio siguen siendo editables visualmente pero
// muestran un aviso de que se guardan al abrir el modal completo.

export function activarInlineEditing(card, producto, onActualizar) {

  const CAMPOS = [
    { selector: ".inline-nombre", campo: "nombre",  tipo: "texto",  tieneAPI: false },
    { selector: ".inline-precio", campo: "precio",  tipo: "numero", tieneAPI: false },
    { selector: ".inline-stock",  campo: "stock",   tipo: "numero", tieneAPI: true  },
  ];

  CAMPOS.forEach(({ selector, campo, tipo, tieneAPI }) => {
    const elemento = card.querySelector(selector);
    if (!elemento) return;

    elemento.classList.add(
      "cursor-pointer", "hover:bg-blue-50",
      "rounded", "px-1", "-mx-1", "transition"
    );
    elemento.title = tieneAPI
      ? "Doble clic para editar y guardar"
      : "Doble clic para editar (usa el botón Editar para guardar)";

    elemento.addEventListener("dblclick", () => {
      iniciarEdicion(elemento, producto, campo, tipo, tieneAPI, onActualizar);
    });
  });
}

// ===============================
// INICIAR EDICIÓN
// ===============================
function iniciarEdicion(elemento, producto, campo, tipo, tieneAPI, onActualizar) {

  if (elemento.querySelector("input")) return;

  const valorOriginal = producto[campo];

  const input = document.createElement("input");
  input.type  = tipo === "numero" ? "number" : "text";
  input.value = valorOriginal;
  if (tipo === "numero") input.min = "0";

  input.className = [
    "w-full border-b-2 border-blue-500 outline-none bg-transparent",
    "text-sm font-semibold text-gray-800 py-0.5",
  ].join(" ");

  const textoOriginal = elemento.innerHTML;
  elemento.innerHTML  = "";
  elemento.appendChild(input);
  input.focus();
  input.select();

  // ── Confirmar ──────────────────────────────────────────
  async function confirmar() {
    const nuevoValor = tipo === "numero"
      ? parseFloat(input.value)
      : input.value.trim();

    if (
      input.value.trim() === "" ||
      (tipo === "numero" && (isNaN(nuevoValor) || nuevoValor < 0))
    ) {
      cancelar(); return;
    }

    if (nuevoValor === valorOriginal) {
      restaurar(elemento, textoOriginal); return;
    }

    // Actualizar DOM optimistamente
    restaurar(elemento, formatearValor(campo, nuevoValor));
    producto[campo] = nuevoValor;

    // Llamar callback de app.js con bandera de si tiene API
    onActualizar(producto.id, campo, nuevoValor, elemento, textoOriginal, valorOriginal, tieneAPI);
  }

  function cancelar() {
    restaurar(elemento, textoOriginal);
  }

  input.addEventListener("blur", confirmar);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.removeEventListener("blur", confirmar);
      confirmar();
    }
    if (e.key === "Escape") {
      input.removeEventListener("blur", confirmar);
      cancelar();
    }
  });
}

function restaurar(elemento, html) {
  elemento.innerHTML = html;
}

function formatearValor(campo, valor) {
  if (campo === "precio") return `$${parseFloat(valor).toFixed(2)}`;
  if (campo === "stock")  return `${parseInt(valor)}`;
  return valor;
}