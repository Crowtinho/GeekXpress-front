document.addEventListener("DOMContentLoaded", () => {
  const productContainer = document.getElementById("productContainer");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  if (!productContainer) {
    console.error("❌ No se encontró #productContainer");
    return;
  }

  let allProducts = []; // todos los productos cargados
  let currentCategory = ""; // categoría seleccionada

  // 🔹 Obtener productos desde el backend
  async function fetchProducts(category = "") {
    try {
      console.log("🔄 Solicitando productos al backend...");
      let url = "http://localhost:8080/products";
      if (category && category !== "Todas") {
        url += `/category/${category}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Error en la petición al backend");
      const data = await response.json();

      return data.map(p => ({
        id: p.id,
        nombre: p.name,
        categoria: p.categories?.[0]?.name || "Sin categoría",
        precio: p.price,
        stock: p.stock,
        descripcion: p.description,
        imagen: (p.images && p.images.length > 0) ? p.images[0].url : "../assets/img/default.png"
      }));
    } catch (err) {
      console.error("❌ No se pudieron cargar los productos:", err);
      return [];
    }
  }

  // 🔹 Formatear precio en COP
  function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(valor);
  }

  // 🔹 Crear tarjeta de producto (respeta tus estilos)
  function createProductCard(prod) {
    const cardCol = document.createElement("div");
    cardCol.classList.add("col-12", "col-sm-6", "col-md-4", "mb-4");

    cardCol.innerHTML = `
      <div class="card product-card h-100" data-id="${prod.id}">
        <div class="card-img-container">
          <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
        </div>
        <div class="card-body d-flex flex-column">
          <h4 class="card-title">${prod.nombre}</h4>
          <p class="text-muted small mb-1">${prod.categoria}</p>
          <p class="precio fw-bold">${formatearPrecio(prod.precio)}</p>
          <button class="btn btn-agregar-carrito mt-auto w-100">
            <i class="bi bi-cart me-2"></i> Agregar al Carrito
          </button>
        </div>
      </div>
    `;

    return cardCol;
  }

  // 🔹 Renderizar productos en pantalla
  function renderProducts(products) {
    console.log(`🎨 Pintando ${products.length} productos en pantalla...`);
    productContainer.innerHTML = "";

    if (!products || products.length === 0) {
      productContainer.innerHTML = "<p class='text-center'>No hay productos disponibles.</p>";
      return;
    }

    products.forEach(prod => {
      const card = createProductCard(prod);
      productContainer.appendChild(card);
    });
  }

  // 🔎 Filtrar por búsqueda
  function filterBySearch(term) {
    const filtered = allProducts.filter(prod =>
      prod.nombre.toLowerCase().includes(term.toLowerCase())
    );
    renderProducts(filtered);
  }

  // 📌 Listeners
  searchInput?.addEventListener("input", (e) => {
    filterBySearch(e.target.value);
  });

  categoryFilter?.addEventListener("change", async (e) => {
    currentCategory = e.target.value;
    allProducts = await fetchProducts(currentCategory);
    renderProducts(allProducts);
    searchInput.value = ""; // limpiar búsqueda al cambiar categoría
  });

  // 🚀 Inicializar
  fetchProducts().then(products => {
    allProducts = products;
    renderProducts(products);
  });
});
