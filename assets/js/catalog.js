document.addEventListener("DOMContentLoaded", () => {
  const productContainer = document.getElementById("productContainer");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");

  let allProducts = []; // 🔹 Aquí guardamos todos los productos del backend

  if (!productContainer) {
    console.error("❌ No se encontró #productContainer");
    return;
  }

  // 🔹 Obtener productos desde el backend (SOLO UNA VEZ)
  async function fetchProducts() {
    try {
      console.log("🔄 Solicitando productos al backend...");

      // const url = "http://localhost:8080/products";
      const url = "https://2224knmwcz.us-east-1.awsapprunner.com/products";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error en la petición al backend");
      const data = await response.json();
      const categoryFilter = document.getElementById("categoryFilter");


      // Mapeamos los productos al formato que usamos en frontend
      allProducts = data.map(p => ({
        id: p.id,
        nombre: p.name,
        categoria: (p.categories && p.categories.length > 0) ? p.categories.join(", ") : "Sin categoría",
        precio: p.price,
        stock: p.stock,
        descripcion: p.description,
        imagen: (p.images && p.images.length > 0) ? p.images[0].url : "../assets/img/default.png"
      }));

      renderProducts(allProducts);
    } catch (err) {
      console.error("❌ No se pudieron cargar los productos:", err);
      productContainer.innerHTML = "<p class='text-center'>Error al cargar productos.</p>";
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

  // 🔹 Crear tarjeta de producto
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

  // 🔹 Renderizar productos
  function renderProducts(products) {
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

  // 🔹 Aplicar filtros (categoría + búsqueda)
  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = allProducts.filter(prod => {
      const matchesCategory =
      selectedCategory === "" || selectedCategory === "all" || prod.categoria.split(", ").includes(selectedCategory);
      const matchesSearch =
        prod.nombre.toLowerCase().includes(searchTerm) ||
        prod.descripcion?.toLowerCase().includes(searchTerm);

        console.log(selectedCategory);
      return matchesCategory && matchesSearch;
      
    });

    renderProducts(filtered);
  }

  // 🎯 Eventos de filtro
  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);

  // 🚀 Inicializar
  fetchProducts();
  loadCategories();
});
