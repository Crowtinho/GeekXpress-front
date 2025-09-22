// detalleProducto.js
document.addEventListener("click", (e) => {
  // Evitar clics en botones de carrito o similares
  if (e.target.closest(".btn-agregar-carrito, .product-btn")) return;

  // Buscar tarjeta de producto
  const card = e.target.closest(".product-card, .product-card-inner, .product-card-no");
  if (!card) return;

  // Obtener el id del producto
  const productId = card.dataset.id;

  if (!productId) {
    console.warn("El producto no tiene data-id asignado");
    return;
  }

  // Guardar solo el id en localStorage
  localStorage.setItem("selectedProductId", productId);
  console.log("selectedProductId guardado:", productId);

  // Redirigir al detalle del producto
  const target = location.pathname.includes("/pages/") ? "product.html" : "pages/product.html";
  window.location.href = target;
});
