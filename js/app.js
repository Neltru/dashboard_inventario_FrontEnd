// ===============================
// INYECTAR ANIMACIONES CSS
// ===============================
const style = document.createElement("style");

style.textContent = `
.flash {
  animation: flashEffect 0.6s ease;
}

@keyframes flashEffect {
  0%   { background-color: #bfdbfe; }
  100% { background-color: transparent; }
}

.fade-in {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInEffect 0.5s ease forwards;
}

@keyframes fadeInEffect {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

document.head.appendChild(style);
import { productos } from "./data.js";
import { crearCard } from "../components/card.js";

const contenedor = document.getElementById("productosContainer");
const totalProductos = document.getElementById("totalProductos");

// ===============================
// RENDER PRINCIPAL
// ===============================
function renderizarProductos() {

  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const card = crearCard(producto, editarProducto);

    card.classList.add("fade-in"); // 👈 animación entrada

    contenedor.appendChild(card);
  });

  totalProductos.textContent = productos.length;
}

// ===============================
// EDITAR PRODUCTO (SIMULADO)
// ===============================
function editarProducto(id) {

  const producto = productos.find(p => p.id === id);

  const nuevoStock = prompt("Ingrese el nuevo stock:", producto.stock);

  if (nuevoStock === null) return; // si cancela

  const stockNumero = parseInt(nuevoStock);

  if (isNaN(stockNumero) || stockNumero < 0) {
    alert("Ingrese un número válido mayor o igual a 0");
    return;
  }

  producto.stock = stockNumero;

  actualizarCard(producto);
}

// ===============================
// ACTUALIZACIÓN PARCIAL REAL
// ===============================
function actualizarCard(producto) {

  const cardVieja = document.querySelector(`[data-id="${producto.id}"]`);

  const nuevaCard = crearCard(producto, editarProducto);

  cardVieja.replaceWith(nuevaCard);

  // 🔥 Disparar animación flash
  nuevaCard.classList.add("flash");

  setTimeout(() => {
    nuevaCard.classList.remove("flash");
  }, 600);
}

// ===============================
document.addEventListener("DOMContentLoaded", renderizarProductos);