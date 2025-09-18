document.addEventListener("DOMContentLoaded", initCarrito);
document.addEventListener("navbarLoaded", initCarrito);

function initCarrito() {

    const botonVaciar = document.getElementById('vaciar-carrito');
    const listaCarrito = document.getElementById('lista-carrito');
    const iconoCarrito = document.getElementById('icono-carrito') || document.querySelector('.d-none.d-lg-flex') || document.querySelector('.bi-cart-fill')?.closest('a,button,.nav-link,div') || document.querySelector('.contador-carrito')?.closest('a,button,.nav-link,div');
    const totalElemento = document.getElementById('total');
    const productContainer = document.getElementById('productContainer');
    const btnPago = document.getElementById('btn-pago');


    // --------------------
    // HELPERS LOCALSTORAGE
    // --------------------
    function getCarrito() {
        return JSON.parse(localStorage.getItem("carrito")) || [];
    }

    function setCarrito(carrito) {
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    if (botonVaciar) {
        botonVaciar.addEventListener("click", () => {
            localStorage.removeItem("carrito"); // o setCarrito([])
            actualizarCarrito();
        console.log("Carrito vaciado");
        });
    }


    // --------------------
    // ANIMACIÓN AL CARRITO
    // --------------------
    function animarAlCarrito(origen, imagen) {
        if (!origen || !iconoCarrito) return;

        const rectBoton = origen.getBoundingClientRect();
        const rectCarrito = iconoCarrito.getBoundingClientRect();

        const startW = Math.max(32, Math.min(rectBoton.width, 80));
        const startH = Math.max(32, Math.min(rectBoton.height, 80));

        const centerBotonX = rectBoton.left + rectBoton.width / 2;
        const centerBotonY = rectBoton.top + rectBoton.height / 2;
        const centerCarritoX = rectCarrito.left + rectCarrito.width / 2;
        const centerCarritoY = rectCarrito.top + rectCarrito.height / 2;

        const animacionContainer = document.createElement('div');
        animacionContainer.classList.add('fly-img');
        animacionContainer.style.width = startW + 'px';
        animacionContainer.style.height = startH + 'px';
        animacionContainer.style.position = 'fixed';
        animacionContainer.style.left = (centerBotonX - startW / 2) + 'px';
        animacionContainer.style.top = (centerBotonY - startH / 2) + 'px';
        animacionContainer.style.pointerEvents = 'none';
        if (imagen) {
            animacionContainer.style.backgroundImage = `url(${imagen})`;
            animacionContainer.style.backgroundSize = 'cover';
            animacionContainer.style.backgroundPosition = 'center';
            animacionContainer.style.backgroundRepeat = 'no-repeat';
        } else {
            animacionContainer.style.backgroundColor = 'rgba(0,0,0,0.06)';
        }

        document.body.appendChild(animacionContainer);

        // forzar reflow
        animacionContainer.offsetWidth;

        const deltaX = centerCarritoX - centerBotonX;
        const deltaY = centerCarritoY - centerBotonY;

        requestAnimationFrame(() => {
            animacionContainer.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.2)`;
        });

        const limpiar = () => {
            if (animacionContainer && animacionContainer.parentNode) animacionContainer.parentNode.removeChild(animacionContainer);
        };
        animacionContainer.addEventListener('transitionend', limpiar, { once: true });
        setTimeout(limpiar, 1600);
    }

    // --------------------
    // ACTUALIZAR CARRITO
    // --------------------
function actualizarCarrito() {
    const carrito = getCarrito();
    setCarrito(carrito);

    // Actualizar numerito en navbar
    const totalCantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    // Selecciona todos los contadores por clase y actualiza su texto
    const contadores = document.querySelectorAll(".contador-carrito");
    contadores.forEach(contador => {
        contador.textContent = totalCantidad;
    });

    // Actualizar lista detallada
    if (listaCarrito) {
        listaCarrito.innerHTML = '';
        let totalPrecio = 0;

        carrito.forEach((producto) => {
            const totalProducto = producto.precio * producto.cantidad;
            totalPrecio += totalProducto;

            const item = document.createElement('li');
            item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            item.innerHTML = `
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="width: auto; max-height: 60px;">
                <span>${producto.nombre} - $${totalProducto.toLocaleString('es-CO')}</span>
                <div>
                    <button class="btn btn-sm btn-secondary me-1" data-id="${producto.id}" data-accion="disminuir">-</button>
                    <span class="mx-1">${producto.cantidad}</span>
                    <button class="btn btn-sm btn-success me-1" data-id="${producto.id}" data-accion="aumentar">+</button>
                    <button class="btn btn-sm btn-danger" data-id="${producto.id}" data-accion="eliminar">X</button>
                </div>
            `;
            listaCarrito.appendChild(item);
        });

        // Hacer clic en todo el contenedor del item, excepto en botones
        listaCarrito.querySelectorAll('.list-group-item').forEach((el) => {
            el.style.cursor = "pointer";

            el.addEventListener('click', (e) => {
                // Evitar redirección si el clic fue en un botón
                if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
                    return;
                }

                const id = el.querySelector("[data-id]")?.getAttribute("data-id");
                if (!id) return;

                const carrito = getCarrito();
                const producto = carrito.find(p => p.id === id);

                if (producto) {
                    localStorage.setItem("selectedProduct", JSON.stringify(producto));
                    const target = location.pathname.includes("/pages/") ? "product.html" : "pages/product.html";
                    window.location.href = target;
                }
            });
        });



        // Total al final de la lista
        if (totalPrecio > 0) {
            const totalItem = document.createElement('li');
            totalItem.classList.add('list-group-item', 'fw-bold', 'text-end');
            totalItem.textContent = `Total: $${totalPrecio.toLocaleString('es-CO')}`;
            listaCarrito.appendChild(totalItem);
        }

        // Total en <strong id="total">
        if (totalElemento) {
            totalElemento.textContent = `$${totalPrecio.toLocaleString('es-CO')}`;
        }

        // Eventos dinámicos
        listaCarrito.querySelectorAll('button').forEach((btn) => {
            btn.addEventListener('click', () => {


                const id = btn.getAttribute('data-id');
                const accion = btn.getAttribute('data-accion');
                const carrito = getCarrito();
                const index = carrito.findIndex(p => p.id === id);

                if (index !== -1) {
                    if (accion === 'aumentar') {
                        carrito[index].cantidad++;
                    } else if (accion === 'disminuir') {
                        carrito[index].cantidad--;
                        if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
                    } else if (accion === 'eliminar') {
                        carrito.splice(index, 1);
                        /*
                        Swal.fire({
                            position: "bottom-end",
                            icon: "info",
                            title: "Eliminaste el producto",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        */
                    }
                    setCarrito(carrito);
                    actualizarCarrito();
                }
            });
        });
    }
}


function asignarEventosCarrito() {
    // Soporta catálogo (.btn-agregar-carrito) y destacados (.product-btn)
    const botonesAgregar = document.querySelectorAll('.btn-agregar-carrito, .product-btn');

    botonesAgregar.forEach(boton => {
        // Clonamos para limpiar listeners previos
        const nuevoBoton = boton.cloneNode(true);
        boton.replaceWith(nuevoBoton);

        nuevoBoton.addEventListener('click', () => {

                const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));

                // 🚨 Si no hay usuario logueado → redirige al login
                if (!usuarioLogueado) {
                    Swal.fire({
                        icon: "warning",
                        title: "Debes iniciar sesión",
                        text: "Por favor inicia sesión para agregar productos al carrito.",
                        showConfirmButton: true,
                    }).then((result) => {
                        if(result.isConfirmed){
                            window.location.href = `${isGitHubPages ? "/" + repoName : ""}/pages/login.html`;
                        }
                        // window.location.href = "login.html"; // Ajusta ruta si es necesario
                    });
                    return; // Detener aquí
                }

            const card = nuevoBoton.closest('.card, .product-card');

            // Nombre
            const nombre = card.querySelector('.card-title, .product-title')?.textContent.trim() || "Producto";

            // Precio
            let precioTexto = card.querySelector('.precio-oferta, .price-offer')?.textContent || "0";
            precioTexto = precioTexto.replace(/[$.,]/g, '').trim();
            const precio = parseInt(precioTexto, 10) || 0;

            // Imagen
            const imagen = card.querySelector('.card-img-top, .product-image')?.src || "";

            // ID único (si no hay data-id, se genera automático con nombre + timestamp)
            let id = card.getAttribute('data-id');
            if (!id) {
                id = nombre.toLowerCase().replace(/\s+/g, '-') + "-" + Date.now();
                card.setAttribute('data-id', id);
            }

            // Carrito
            const carrito = getCarrito();
            const existente = carrito.find(p => p.id === id);

            if (existente) {
                existente.cantidad++;
            } else {
                carrito.push({ id, nombre, precio, cantidad: 1, imagen });
            }

            setCarrito(carrito);
            actualizarCarrito();
            animarAlCarrito(nuevoBoton, imagen);
        });
    });
}


    // --------------------
    // BOTÓN DE PAGO
    // --------------------
    if (btnPago) {
        btnPago.addEventListener('click', () => {
            const carrito = getCarrito();
            if (carrito.length === 0) {
                alert("Tu carrito está vacío.");
            } else {
                alert(`✅ Procediendo al pago con ${carrito.length} productos.`);
                // window.location.href = "checkout.html";
            }
        });
    }

    // --------------------
    // INICIO
    // --------------------
    actualizarCarrito();
    asignarEventosCarrito();
    window.addEventListener("storage", actualizarCarrito);
}