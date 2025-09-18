// product.js (corregido y robusto)
document.addEventListener("DOMContentLoaded", () => {
  const PLACEHOLDER = "https://via.placeholder.com/600x600?text=Sin+imagen";
  const $ = (id) => document.getElementById(id);

  const fmt = (n) => {
    const num = Number(n) || 0;
    try {
      return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(num);
    } catch {
      return "$" + num;
    }
  };

  const safeParseJSON = (raw, fallback = null) => {
    try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
  };

  // Cargar producto
  const raw = localStorage.getItem("selectedProduct");
  const product = safeParseJSON(raw, null);

  if (!product) {
    console.warn("No se encontró producto en localStorage (selectedProduct).");
    return;
  }

  // Normalizar imagenes
  if (!product.imagenes || product.imagenes.length === 0) {
    product.imagenes = product.imagen ? [product.imagen] : [PLACEHOLDER];
  }

  // Helpers DOM (comprobamos elementos antes de usar)
  const maybeSetText = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };
  const maybeSetHTML = (id, html) => {
    const el = $(id);
    if (el) el.innerHTML = html;
  };

  // Render básico (solo si existen los elementos)
  maybeSetText("product-title", product.nombre || "Producto");
  maybeSetText("product-category", product.categoria || "");
  maybeSetText("product-sku", product.sku ? `SKU: ${product.sku}` : "");
  maybeSetText("product-price", fmt(product.precio));
  maybeSetText("product-description", product.descripcion || "");
  maybeSetText("breadcrumb-title", product.nombre || "Producto");

  // Estado (badge)
  const estadoEl = $("product-estado");
  if (estadoEl) {
    estadoEl.textContent = product.estado || "";
    estadoEl.className = (product.estado === "Activo") ? "badge bg-success mb-2" : "badge bg-secondary mb-2";
  }

  // Stock
  const stockEl = $("product-stock");
  const stockNum = Number(product.stock) || 0;
  if (stockEl) {
    if (stockNum > 0) {
      stockEl.innerHTML = `<i class="bi bi-check-circle-fill text-success me-2"></i> En stock (${stockNum})`;
    } else {
      // stockEl.innerHTML = `<i class="bi bi-x-circle-fill text-danger me-2"></i> Agotado`;
    }
  }

  // Galería
  const mainImg = $("product-img");
  const thumbsContainer = $("product-thumbnails");
  if (mainImg) {
    mainImg.src = product.imagenes[0] || PLACEHOLDER;
    mainImg.alt = product.nombre || "Imagen de producto";
  }
  if (thumbsContainer) {
    thumbsContainer.innerHTML = "";
    product.imagenes.forEach((src, idx) => {
      const img = document.createElement("img");
      img.src = src || PLACEHOLDER;
      img.alt = `${product.nombre} vista ${idx + 1}`;
      img.className = "thumb";
      if (idx === 0) img.classList.add("selected");
      img.addEventListener("click", () => {
        if (mainImg) mainImg.src = src || PLACEHOLDER;
        thumbsContainer.querySelectorAll(".thumb").forEach(t => t.classList.remove("selected"));
        img.classList.add("selected");
      });
      thumbsContainer.appendChild(img);
    });
  }

  // Cantidad
  let qty = 1;
  const qtyInput = $("quantity");
  const btnInc = $("increase-btn");
  const btnDec = $("decrease-btn");
  if (qtyInput) qtyInput.value = qty;
  if (btnInc) btnInc.addEventListener("click", () => {
    if (stockNum && qty >= stockNum) return;
    qty++;
    if (qtyInput) qtyInput.value = qty;
  });
  if (btnDec) btnDec.addEventListener("click", () => {
    if (qty > 1) qty--;
    if (qtyInput) qtyInput.value = qty;
  });
  if (qtyInput) {
    qtyInput.addEventListener("input", () => {
      let v = parseInt(qtyInput.value, 10) || 1;
      if (v < 1) v = 1;
      if (stockNum && v > stockNum) v = stockNum;
      qty = v;
      qtyInput.value = qty;
    });
  }

  // ---------- AGREGAR AL CARRITO ----------
  // Buscamos botón por varios ids por compatibilidad con tu HTML
  const addBtn = $("add-to-cart-btn") || $("btn-agregar-carrito") || document.querySelector(".btn-cart") || null;
  if (!addBtn) {
    console.warn("Botón para agregar al carrito no encontrado (esperado id 'add-to-cart-btn').");
    return;
  }



  addBtn.addEventListener("click", (e) => {
    try {

//       // Detectar si corre en GitHub Pages
// const isGitHubPages = window.location.hostname.includes("github.io");
// // Nombre de tu repo (ajústalo si cambia)
// const repoName = "GeekXpress-front";



      const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
      if (!usuarioLogueado) {
        Swal.fire({
          icon: "warning",
          title: "Debes iniciar sesión",
          text: "Por favor inicia sesión para agregar productos al carrito.",
          showConfirmButton: true
        }).then((result) => {
          if(result.isConfirmed){
              window.location.href = `${isGitHubPages ? "/" + repoName : ""}/pages/login.html`;
          }
          // window.location.href = "pages/login.html"; // ajusta la ruta según tu proyecto
        });
        return; // detener aquí
      }

      // if (stockNum === 0) {
      //   alert("Lo sentimos, el producto está agotado.");
      //   console.log(stockNum);
        
      //   return;
      // }

      const carrito = safeParseJSON(localStorage.getItem("carrito"), []);

      const item = {
        id: product.id,
        nombre: product.nombre,
        precio: Number(product.precio) || 0,
        cantidad: qty,
        imagen: (product.imagenes && product.imagenes[0]) || product.imagen || "https://via.placeholder.com/100"
      };

      const existente = carrito.find(p => p.id === item.id);
      if (existente) {
        // if ((existente.cantidad || 0) + item.cantidad > (product.stock || 0)) {
        //   alert("No puedes agregar más de lo disponible en stock.");
        //   return;
        // }
        existente.cantidad = (existente.cantidad || 0) + item.cantidad;
      } else {
        carrito.push(item);
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));

      // Actualizar badges inmediatamente en la misma pestaña
      const totalCantidad = carrito.reduce((acc, it) => acc + (it.cantidad || 0), 0);
      document.querySelectorAll(".contador-carrito").forEach(el => el.textContent = totalCantidad);

      // Emitir evento custom para que carrito.js (si lo adaptas) pueda escucharlo
      window.dispatchEvent(new CustomEvent("carritoActualizado", { detail: { carrito } }));

      // Llamar a funciones globales si fueron expuestas por carrito.js
      if (typeof window.actualizarCarrito === "function") {
        try { window.actualizarCarrito(); } catch (err) { /* silent */ }
      }
      if (typeof window.animarAlCarrito === "function") {
        try { window.animarAlCarrito(addBtn, item.imagen); } catch (err) { /* silent */ }
      }

      // Feedback no bloqueante (toast simple)
      const toast = document.createElement("div");
      toast.textContent = `✅ Se agregaron ${item.cantidad} x ${item.nombre} al carrito.`;
      Object.assign(toast.style, {
        position: "fixed",
        right: "20px",
        bottom: "24px",
        background: "rgba(0,0,0,0.75)",
        color: "white",
        padding: "10px 14px",
        borderRadius: "8px",
        zIndex: 9999,
        // height: "80px",
        // widht: "1300px"
      });
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2200);

    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      alert("Ocurrió un error al agregar el producto. Revisa la consola.");
    }
  });

});
