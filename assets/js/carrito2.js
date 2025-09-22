// ====================== //
// Funciones de carrito  //
// ====================== //

// Obtener carrito desde backend
function actualizarCarritoDesdeBackend() {
  fetch("http://localhost:8080/cart")
    .then(response => {
      if (!response.ok) throw new Error("Error al obtener carrito");
      return response.json();
    })
    .then(data => {
      const contenedorCarrito = document.getElementById("lista-carrito");
      contenedorCarrito.innerHTML = "";
      let total = 0;
      let cantidadTotal = 0;

      data.items.forEach(item => {
        const subtotal = item.unitPrice * item.quantity;
        total += subtotal;
        cantidadTotal += item.quantity;

        // Crear estructura HTML similar a la que ya usabas
        const producto = document.createElement("div");
        producto.classList.add("producto", "d-flex", "justify-content-between", "align-items-center", "mb-2");

        producto.innerHTML = `
          <div class="info d-flex align-items-center">
            <img src="assets/img/product-${item.productId}.jpg" alt="Producto ${item.productId}" class="img-thumbnail" style="width: 60px; height: 60px;">
            <div class="ms-2">
              <h6 class="mb-1">Producto #${item.productId}</h6>
              <span class="precio">$${item.unitPrice.toLocaleString("es-CO")}</span>
            </div>
          </div>
          <div class="acciones d-flex align-items-center">
            <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(this, -1)">-</button>
            <span class="mx-2 num-cantidad">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-secondary" onclick="cambiarCantidad(this, 1)">+</button>
            <span class="mx-3 subtotal">$ ${subtotal.toLocaleString("es-CO")}</span>
            <button class="btn btn-sm btn-danger" onclick="eliminarProducto(this)">X</button>
          </div>
        `;

        contenedorCarrito.appendChild(producto);
      });

      // Actualizar totales
      document.getElementById("subtotal").textContent = `$ ${total.toLocaleString("es-CO")}`;
      document.getElementById("total").textContent = `$ ${total.toLocaleString("es-CO")}`;
      document.getElementById("num-articulos").textContent = cantidadTotal;

      // Numerito de carrito en navbar
      document.querySelectorAll(".contador-carrito").forEach(c => c.textContent = cantidadTotal);
    })
    .catch(err => {
      console.error("Error cargando carrito:", err);
    });
}

// ====================== //
// Funciones de cantidad //
// ====================== //

function cambiarCantidad(boton, cambio) {
  const cantidadElem = boton.parentElement.querySelector(".num-cantidad");
  let cantidad = parseInt(cantidadElem.textContent);

  cantidad += cambio;
  if (cantidad < 1) return; // no permitir menos de 1

  cantidadElem.textContent = cantidad;

  actualizarSubtotal(boton.closest(".producto"));
  actualizarResumen();
}

function actualizarSubtotal(producto) {
  const precioTexto = producto.querySelector(".precio").textContent
    .replace("$", "")
    .replace(/\./g, "")
    .trim();

  const precio = parseInt(precioTexto.replace(/\D/g, ""));
  const cantidad = parseInt(producto.querySelector(".num-cantidad").textContent);

  const subtotal = precio * cantidad;
  producto.querySelector(".subtotal").textContent = `$ ${subtotal.toLocaleString("es-CO")}`;
}

function eliminarProducto(boton) {
  const producto = boton.closest(".producto");
  producto.remove();
  actualizarResumen();
}

function actualizarResumen() {
  const productos = document.querySelectorAll(".producto");
  let total = 0;
  let cantidadTotal = 0;

  productos.forEach(producto => {
    const subtotalTexto = producto.querySelector(".subtotal").textContent.replace("$", "").trim();
    const subtotal = parseInt(subtotalTexto.replace(/\D/g, ""));
    total += subtotal;

    cantidadTotal += parseInt(producto.querySelector(".num-cantidad").textContent);
  });

  document.getElementById("subtotal").textContent = `$ ${total.toLocaleString("es-CO")}`;
  document.getElementById("total").textContent = `$ ${total.toLocaleString("es-CO")}`;
  document.getElementById("num-articulos").textContent = cantidadTotal;
}

// ====================== //
// Inicialización        //
// ====================== //

document.addEventListener("DOMContentLoaded", () => {
  actualizarCarritoDesdeBackend();
});
