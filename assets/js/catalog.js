document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM listo, buscando #productContainer...");
    const productContainer = document.getElementById("productContainer");

    if (!productContainer) {
        console.error("❌ No se encontró el contenedor #productContainer en el DOM");
        return;
    }

    // 🔹 Obtener productos desde el backend
async function fetchProducts() {
    try {
        console.log("🔄 Solicitando productos al backend...");
        const response = await fetch("http://localhost:8080/products");
        if (!response.ok) throw new Error("Error en la petición al backend");
        const data = await response.json();
        console.log("✅ Productos recibidos del backend:", data);
        return data.map(p => ({
            id: p.id,
            nombre: p.name,
            categoria: p.categories?.[0]?.name || "Sin categoría",
            precio: p.price,
            stock: p.stock,
            descripcion: p.description,
            imagen: (p.images && p.images.length > 0) 
                        ? p.images[0].url 
                        : "../assets/img/default.png",
            etiquetas: ["NUEVO"]
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

    // 🚀 Inicializar
    fetchProducts().then(renderProducts);
});
