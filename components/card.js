// components/card.js

export function crearCard(producto, onEditar) {

  const card = document.createElement("div");
  card.className = "bg-white rounded-xl shadow p-4 transition-all duration-300";
  card.dataset.id = producto.id;

  card.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <span class="badge text-xs px-2 py-1 rounded-full"></span>
    </div>

    <img
      src="${producto.imagen}"
      class="rounded-lg mb-3 w-full h-40 object-cover"
    />

    <h2 class="font-semibold text-gray-800">${producto.nombre}</h2>

    <p class="text-xs text-gray-500">SKU: ${producto.sku}</p>
    <p class="text-sm text-gray-600">Categoría: ${producto.categoria}</p>

    <div class="mt-2 text-sm">
      <p><span class="font-semibold">Stock:</span> 
        <span class="stock">${producto.stock}</span> unidades
      </p>
      <p><span class="font-semibold">Precio:</span> $${producto.precio}</p>
      <p><span class="font-semibold">Vence:</span> ${producto.fecha_vencimiento}</p>
    </div>

    <div class="flex gap-2 mt-4">
      <button class="btnEditar flex-1 bg-blue-600 text-white py-1 rounded-lg text-sm hover:bg-blue-700 transition">
        Editar
      </button>
      <button class="btnAccion flex-1 border border-gray-300 py-1 rounded-lg text-sm hover:bg-gray-100 transition">
        Acción
      </button>
    </div>
  `;

  aplicarReglasDinamicas(card, producto);

  // 👇 Evento editar (CLAVE)
  card.querySelector(".btnEditar").addEventListener("click", () => {
    onEditar(producto.id);
  });

  return card;
}

// ===============================
// REGLAS DINÁMICAS (JS PURO)
// ===============================
function aplicarReglasDinamicas(card, producto) {

  const btnAccion = card.querySelector(".btnAccion");
  const badge = card.querySelector(".badge");

  const hoy = new Date();
  const fechaVencimiento = new Date(producto.fecha_vencimiento);

  // Limpiar clases previas
  card.classList.remove("border-2", "border-yellow-500", "border-red-500", "opacity-50");

  badge.className = "badge text-xs px-2 py-1 rounded-full";

  // 🟢 Normal (por defecto)
  badge.textContent = "Stock Normal";
  badge.classList.add("bg-green-100", "text-green-600");

  // 🟡 Stock bajo
  if (producto.stock < 5 && producto.stock > 0) {

    card.classList.add("border-2", "border-yellow-500");

    badge.textContent = "Stock Bajo";
    badge.classList.remove("bg-green-100", "text-green-600");
    badge.classList.add("bg-yellow-100", "text-yellow-600");
  }

  // 🔴 Agotado
  if (producto.stock === 0) {

    card.classList.add("border-2", "border-red-500");

    badge.textContent = "Agotado";
    badge.classList.remove("bg-green-100", "text-green-600");
    badge.classList.add("bg-red-100", "text-red-600");

    btnAccion.disabled = true;
    btnAccion.classList.add("opacity-50", "cursor-not-allowed");
  }

  // ⚫ Vencido
  if (fechaVencimiento < hoy) {
    card.classList.add("opacity-50");

    badge.textContent = "Vencido";
    badge.classList.remove("bg-green-100", "text-green-600");
    badge.classList.add("bg-gray-200", "text-gray-600");
  }
}

// ===============================
// ANIMACIÓN FLASH (opcional)
// ===============================
export function animarFlash(card) {
  card.classList.add("flash");

  setTimeout(() => {
    card.classList.remove("flash");
  }, 600);
}