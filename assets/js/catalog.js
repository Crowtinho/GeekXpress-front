document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('productContainer');
    const contadorCarrito = document.getElementById("contadorCarrito");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");

    // ================================
    // PRODUCTOS ESTÁTICOS
    // ================================
    const productos = [
        { id: 1, nombre: "One Piece | Caja 24 Sobres OP-05 Awakening of the New Era", categoria: "cartas", precioOferta: 1215000, precio: 125000, rating: 4.8, reviews: 124, imagen: "../assets/img/imgProducts/TCG_ONEPIECE_1.png",imagenes:["https://res.cloudinary.com/dz4qsmco8/image/upload/v1757624618/gzqgtvgzzaonoqvbiyso.jpg","https://res.cloudinary.com/dz4qsmco8/image/upload/v1757624618/potgcijjicczzmlqjdqb.jpg","https://res.cloudinary.com/dz4qsmco8/image/upload/v1757624617/vr4f8thjibaixzm00w78.jpg"] ,stock:14, etiquetas: ["NUEVO", "CARTAS TCG"], descripcion:"lolololo" },
        { id: 2, nombre:"Pokemon Juego de cartas Mega Brave Booster Box (japonés)", categoria: "cartas", precioOferta: 542000, precio: 596200, rating: 4.3, reviews: 24, imagen: "../assets/img/imgProducts/TCG_POKEMON_1.png",stock:14, etiquetas: ["NUEVO", "-10%", "CARTAS TCG"] },
        { id: 3, nombre:"Magic The Gathering Innistrad Remastered Collector Boosters1", categoria: "cartas", precioOferta: 1649350, precio: 2144155, rating: 4.5, reviews: 194, imagen: "../assets/img/imgProducts/TCG_MAGIC_01.png",stock:14, etiquetas: ["NUEVO", "-30%", "CARTAS TCG"] },
        { id: 4, nombre:"Manga Naruto N.01 Special Edition", categoria: "anime", precioOferta: 49500, precio: 54450, rating: 4.7, reviews: 44, imagen: "../assets/img/imgProducts/MANGA_NARUTO_N.01.png",stock:14, etiquetas: ["NUEVO", "-10%", "MANGA"] },
        { id: 5, nombre:"Manga Full Metal Alchemist N.01 Special Edition", categoria: "anime", precioOferta: 60000, precio: 120000, rating: 4.2, reviews: 264, imagen: "../assets/img/imgProducts/MANGA_FMA_N.01.JPG",stock:14, etiquetas: ["NUEVO", "-50%", "MANGA"] },
        { id: 6, nombre:"Manga Jojo's Bizarre N.01 Special Edition", categoria: "anime", precioOferta: 76000, precio: null, rating: 4.9, reviews: 550, imagen: "../assets/img/imgProducts/MANGA_JOJOS_N.01.jpg",stock:14, etiquetas: ["NUEVO", "MANGA"] },
        { id: 7, nombre:"Comic Thor N.01", categoria: "cómics", precioOferta: 69900, precio: 87350, rating: 4.7, reviews: 94, imagen: "../assets/img/imgProducts/Comic_Thor N.01.png",stock:14, etiquetas: ["NUEVO", "-25%", "COMICS"] },
        { id: 8, nombre:"Comic Batman Absolute N.01", categoria: "cómics", precioOferta: 105000, precio: 115500, rating: 4.4, reviews: 10, imagen: "../assets/img/imgProducts/COMIC_BATMAN_N.01.jpg",stock:14, etiquetas: ["NUEVO", "-10%", "COMICS"] },
        { id: 9, nombre:"All Star Superman Edition Deluxe N.01", categoria: "cómics", precioOferta: 188000, precio: 225600, rating: 4.8, reviews: 15, imagen: "../assets/img/imgProducts/COMIC_SUPERMAN_N.01.jpg",stock:14, etiquetas: ["NUEVO", "-20%", "COMICS"] },
        { id: 10,nombre: "Funko POP Plus Tanjiro Kamado Dancing Flash 2041 Demon Slayer", categoria: "accesorios", precioOferta: 69900, precio: 80385, rating: 4.5, reviews: 194, imagen: "../assets/img/imgProducts/FIGURAS_KNY_01.png",stock:14, etiquetas: ["NUEVO", "-10%", "FIGURAS"] },
        { id: 11,nombre: "¡Funko Pop! Animación Dragonball Z - Goku Súper Sayajin", categoria: "accesorios", precioOferta: 69900, precio: 139800, rating: 4.9, reviews: 15, imagen: "../assets/img/imgProducts/FIGURAS_DB_N.01.png",stock:14, etiquetas: ["NUEVO", "-50%", "FIGURAS"] },
        { id: 12,nombre: "Funko Pop Luffy Gear Five One Piece", categoria: "accesorios", precioOferta: 89900, precio: 125860, rating: 4.9, reviews: 15, imagen: "../assets/img/imgProducts/FIGURAS_ONEPIECE_G5_01.png",stock:14, etiquetas: ["NUEVO", "-40%", "FIGURAS"] }
    ];

    // ================================
    // FUNCIONES DE CARRITO
    // ================================
    function getCarrito() {
        return JSON.parse(localStorage.getItem("carrito")) || [];
    }

    function setCarrito(carrito) {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    function actualizarContador() {
        const carrito = getCarrito();
        let totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        if (contadorCarrito) contadorCarrito.textContent = totalItems;
    }

    function formatearPrecio(valor) {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
    }

    // ================================
    // RENDER DE PRODUCTOS
    // ================================
    function createProductCard(prod) {
        const cardCol = document.createElement('div');
        cardCol.classList.add('col-12', 'col-sm-6', 'col-md-4', 'mb-4');

                        // <i class="ver-detalle bi bi-eye-fill" data-id="${prod.id}"></i>

        cardCol.innerHTML = `
            <div class="card product-card" data-id="${prod.id}" data-categoria="${prod.categoria.toLowerCase()}">
                <div class="card-img-container">
                    <img src="${prod.img || prod.imagen}" class="card-img-top" alt="${prod.titulo || prod.nombre}">
                    ${(prod.etiquetas || []).map(et => `<span class="badge bg-light text-dark">${et}</span>`).join('')}
                    <div class="iconos-acciones">
                        <i class="bi bi-heart-fill"></i>

                    </div>
                </div>
                <div class="card-body">
                    <h4 class="card-title">${prod.titulo || prod.nombre}</h4>
                    <p class="precio">
                        <span class="precio-oferta">${formatearPrecio(prod.precioOferta || prod.precio)}</span>
                        ${prod.precioOriginal ? `<span class="precio-original">${formatearPrecio(prod.precioOriginal)}</span>` : ""}
                    </p>
                    <button class="btn btn-agregar-carrito w-100">
                        <i class="bi bi-cart me-2"></i> Agregar al Carrito
                    </button>
                </div>
            </div>
        `;


        return cardCol;
    }

    function renderProducts(products) {
        productContainer.innerHTML = "";
        products.forEach(prod => {
            const card = createProductCard(prod);
            productContainer.appendChild(card);
        });
    }

    function getAllProductsForRender() {
        const localProducts = JSON.parse(localStorage.getItem('products')) || [];
        return [...productos, ...localProducts];
    }

    renderProducts(getAllProductsForRender());

    // ================================
    // FILTRO Y BÚSQUEDA
    // ================================
    function applyFilters() {
        const searchText = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value.toLowerCase();

        const allForRender = getAllProductsForRender();
        const filtered = allForRender.filter(p => {
            const name = p.titulo || p.nombre;
            const category = p.categoria || p.category;
            const matchesSearch = name.toLowerCase().includes(searchText);
            const matchesCategory = !selectedCategory || category.toLowerCase() === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        renderProducts(filtered);
    }

    searchInput.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);

    // ================================
    // EVENTOS DEL CARRITO
    // ================================
    window.addEventListener("storage", actualizarContador);
    actualizarContador();


});
