document.addEventListener("DOMContentLoaded", initCarrito);

function initCarrito() {
    // Evitar múltiples inicializaciones
    if (window.carritoInit) return;
    window.carritoInit = true;

    const botonVaciar = document.getElementById('vaciar-carrito');
    const listaCarrito = document.getElementById('lista-carrito');
    const iconoCarrito = document.getElementById('icono-carrito') || document.querySelector('.contador-carrito')?.closest('a,button,.nav-link,div');
    const totalElemento = document.getElementById('total');
    const btnPago = document.getElementById('btn-pago');
    const API_URL = "https://2224knmwcz.us-east-1.awsapprunner.com/cart";

    const userId = parseInt(localStorage.getItem("userId"), 10);
    if (isNaN(userId)) return;

    // --------------------
    // Bloqueo por producto para evitar doble click
    // --------------------
    const productosBloqueados = new Set();

    // --------------------
    // Fetch del carrito
    // --------------------
    async function fetchCarrito() {
        try {
            const res = await fetch(`${API_URL}/${userId}`);
            if (!res.ok) throw new Error("Error obteniendo carrito");
            const data = await res.json();
            return Array.isArray(data.items) ? data.items : [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // --------------------
    // Agregar al carrito
    // --------------------
    async function addToCartBackend(productId, quantity = 1) {
        if (productosBloqueados.has(productId)) return false;
        productosBloqueados.add(productId);
        try {
            const res = await fetch(`${API_URL}/${userId}/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, quantity })
            });
            if (!res.ok) throw new Error("Error agregando producto al carrito");
            return true;
        } catch (err) {
            console.error(err);
            return false;
        } finally {
            productosBloqueados.delete(productId);
        }
    }

    // --------------------
    // Actualizar UI del carrito
    // --------------------
    async function actualizarCarrito() {
        const carrito = await fetchCarrito();
        let totalCantidad = 0;
        let totalPrecio = 0;

        if (listaCarrito) {
            listaCarrito.innerHTML = '';
            for (let item of carrito) {
                const name = item.productName || 'Producto';
                const price = item.unitPrice || 0;
                const quantity = item.quantity || 1;
                totalCantidad += quantity;
                totalPrecio += price * quantity;

                const li = document.createElement('li');
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.innerHTML = `
                    <img src="${item.imageUrl || ''}" alt="${name}" style="width:auto; max-height:60px;">
                    <span>${name} - $${price.toLocaleString('es-CO')} x ${quantity}</span>
                    <div>
                        <button class="btn btn-sm btn-secondary me-1" data-id="${item.productId}" data-accion="disminuir">-</button>
                        <span class="mx-1">${quantity}</span>
                        <button class="btn btn-sm btn-success me-1" data-id="${item.productId}" data-accion="aumentar">+</button>
                        <button class="btn btn-sm btn-danger" data-id="${item.productId}" data-accion="eliminar">X</button>
                    </div>
                `;
                listaCarrito.appendChild(li);
            }
        }

        if (totalElemento) totalElemento.textContent = `$${totalPrecio.toLocaleString('es-CO')}`;
        document.querySelectorAll(".contador-carrito").forEach(el => el.textContent = totalCantidad);

        // botones aumentar/disminuir/eliminar
        listaCarrito?.querySelectorAll('button').forEach(btn => {
            btn.onclick = async () => {
                const accion = btn.dataset.accion;
                const productId = parseInt(btn.dataset.id, 10);

                const currentItem = carrito.find(i => i.productId === productId);
                let newQuantity = currentItem ? currentItem.quantity : 1;

                if (accion === 'aumentar') newQuantity += 1;
                else if (accion === 'disminuir') newQuantity -= 1;
                else if (accion === 'eliminar') newQuantity = 0;
                if (newQuantity < 0) newQuantity = 0;

                if (accion === 'aumentar' || accion === 'disminuir') {
                    try {
                        const res = await fetch(`${API_URL}/${userId}/update`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ productId, quantity: newQuantity })
                        });
                        if (!res.ok) throw new Error("Error actualizando carrito");
                    } catch (err) {
                        console.error(err);
                        Swal.fire({
                            icon: "error",
                            title: "No se pudo actualizar la cantidad",
                            timer: 1200,
                            showConfirmButton: false
                        });
                    }
                } else if (accion === 'eliminar') {
                    try {
                        const res = await fetch(`${API_URL}/${userId}/remove/${productId}`, { method: "DELETE" });
                        if (!res.ok) throw new Error("No se pudo eliminar el producto");
                    } catch (err) {
                        console.error(err);
                        Swal.fire({
                            icon: "error",
                            title: "No se pudo eliminar el producto",
                            timer: 1200,
                            showConfirmButton: false
                        });
                    }
                }

                actualizarCarrito();
            };
        });
    }

    // --------------------
    // Botones agregar al carrito
    // --------------------
    if (!window.addCarritoListener) {
        document.addEventListener('click', async (e) => {
            if (!e.target.matches('.btn-agregar-carrito, .product-btn')) return;

            const boton = e.target;
            const card = boton.closest('.card, .product-card');
            const productId = parseInt(card.dataset.id, 10);
            if (!productId) return;

            const success = await addToCartBackend(productId, 1);
            if (success) {
                Swal.fire({
                    icon: "success",
                    title: "Producto agregado al carrito",
                    timer: 1200,
                    showConfirmButton: false
                });
                actualizarCarrito();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "No se pudo agregar el producto",
                    timer: 1200,
                    showConfirmButton: false
                });
            }
        });
        window.addCarritoListener = true;
    }

    // --------------------
    // Vaciar carrito
    // --------------------
    botonVaciar?.addEventListener("click", async () => {
        try {
            const res = await fetch(`${API_URL}/${userId}/clear`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo vaciar el carrito");
            await actualizarCarrito();
            Swal.fire({
                icon: "success",
                title: "Carrito vaciado",
                timer: 1200,
                showConfirmButton: false
            });
        } catch(err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error al vaciar el carrito",
                timer: 1200,
                showConfirmButton: false
            });
        }
    });

    // --------------------
    // Botón pago
    // --------------------
    btnPago?.addEventListener('click', async () => {
        const carrito = await fetchCarrito();
        if (!carrito.length) return alert("Tu carrito está vacío.");
        alert(`✅ Procediendo al pago con ${carrito.length} productos.`);
    });

    // --------------------
    // Inicio
    // --------------------
    actualizarCarrito();
}
