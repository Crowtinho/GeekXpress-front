// product.js
document.addEventListener("DOMContentLoaded", async () => {
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

  // Obtener id del producto
  const rawSelected = localStorage.getItem("selectedProduct");
  const selected = safeParseJSON(rawSelected, null);
  if (!selected || !selected.id) {
    console.warn("No se encontró selectedProduct en localStorage");
    return;
  }
  const productId = selected.id;

  // Llamada al backend para obtener info completa del producto
  let product = null;
  try {
    const res = await fetch(`http://localhost:8080/products/${productId}`);
    if (!res.ok) throw new Error("Error al obtener producto");
    product = await res.json();
  } catch (err) {
    console.error("No se pudo cargar el producto:", err);
    return;
  }

  // Normalizar imágenes
  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    product.images = [{ url: PLACEHOLDER }];
  }
  product.imagenes = product.images.map(img => img.url || PLACEHOLDER);
  product.imagen = product.imagenes[0] || PLACEHOLDER;

  // Helpers DOM
  const maybeSetText = (id, text) => { const el = $(id); if(el) el.textContent = text; };
  const maybeSetHTML = (id, html) => { const el = $(id); if(el) el.innerHTML = html; };

  // Render básico
  maybeSetText("product-title", product.name || "Producto");
  maybeSetText("product-category", (product.categories || []).join(", "));
  maybeSetText("product-sku", product.sku ? `SKU: ${product.sku}` : "");
  maybeSetText("product-price", fmt(product.price));
  maybeSetText("product-description", product.description || "");
  maybeSetText("breadcrumb-title", product.name || "Producto");

<<<<<<< HEAD
  // Estado
=======
  // ---------- BREADCRUMB DINÁMICO ----------
const breadcrumbOl = document.querySelector(".breadcrumb");
if (breadcrumbOl) {
  breadcrumbOl.innerHTML = `
    <li class="breadcrumb-item">
      <a href="../index.html" class="text-decoration-none text-muted">Inicio</a>
    </li>
    <li class="breadcrumb-item">
      <a href="../pages/catalog.html" class="text-decoration-none text-muted">${product.categoria || "Catálogo"}</a>
    </li>
    <li class="breadcrumb-item active text-muted" aria-current="page">
      ${product.nombre || "Producto"}
    </li>
  `;
}

  // Estado (badge)
>>>>>>> 78459ad2d7f8a6d669b67b643673dfb0ae070986
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
      stockEl.innerHTML = `<i class="bi bi-x-circle-fill text-danger me-2"></i> Sin stock`;
    }
  }

  // Galería
  const mainImg = $("product-img");
  const thumbsContainer = $("product-thumbnails");
  if (mainImg) {
    mainImg.src = product.imagenes[0];
    mainImg.alt = product.name || "Imagen de producto";
  }
  if (thumbsContainer) {
    thumbsContainer.innerHTML = "";
    product.imagenes.forEach((src, idx) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `${product.name} vista ${idx + 1}`;
      img.className = "thumb";
      if (idx === 0) img.classList.add("selected");
      img.addEventListener("click", () => {
        if (mainImg) mainImg.src = src;
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
  if (btnInc) btnInc.addEventListener("click", () => { if (stockNum && qty >= stockNum) return; qty++; if(qtyInput) qtyInput.value = qty; });
  if (btnDec) btnDec.addEventListener("click", () => { if (qty > 1) qty--; if(qtyInput) qtyInput.value = qty; });
  if (qtyInput) {
    qtyInput.addEventListener("input", () => {
      let v = parseInt(qtyInput.value,10)||1;
      if(v<1) v=1;
      if(stockNum && v>stockNum) v=stockNum;
      qty=v; qtyInput.value=qty;
    });
  }

  // Agregar al carrito
  const addBtn = $("add-to-cart-btn") || $("btn-agregar-carrito") || document.querySelector(".btn-cart");
  if (!addBtn) {
    console.warn("Botón agregar al carrito no encontrado");
    return;
  }

  addBtn.addEventListener("click", () => {
    try {
      const usuarioLogueado = safeParseJSON(localStorage.getItem("usuarioLogueado"), null);
      if (!usuarioLogueado) {
        Swal.fire({
          icon: "warning",
          title: "Debes iniciar sesión",
          text: "Por favor inicia sesión para agregar productos al carrito.",
          showConfirmButton: true
        }).then(res => {
          if(res.isConfirmed) window.location.href = `${isGitHubPages ? "/" + repoName : ""}/pages/login.html`;
        });
        return;
      }

      const carrito = safeParseJSON(localStorage.getItem("carrito"), []);
      const item = {
        id: product.id,
        nombre: product.name,
        precio: Number(product.price) || 0,
        cantidad: qty,
        imagen: product.imagenes[0]
      };
      const existente = carrito.find(p => p.id === item.id);
      if (existente) existente.cantidad += item.cantidad;
      else carrito.push(item);

      localStorage.setItem("carrito", JSON.stringify(carrito));

      // Actualizar contador carrito
      const totalCantidad = carrito.reduce((acc,it)=>acc+(it.cantidad||0),0);
      document.querySelectorAll(".contador-carrito").forEach(el=>el.textContent=totalCantidad);

      // Toast
      const toast = document.createElement("div");
      toast.textContent = `✅ Se agregaron ${item.cantidad} x ${item.nombre} al carrito.`;
      Object.assign(toast.style,{
        position:"fixed", right:"20px", bottom:"24px", background:"rgba(0,0,0,0.75)",
        color:"white", padding:"10px 14px", borderRadius:"8px", zIndex:9999
      });
      document.body.appendChild(toast);
      setTimeout(()=>toast.remove(),2200);

      // Evento custom
      window.dispatchEvent(new CustomEvent("carritoActualizado",{detail:{carrito}}));

    } catch(err) {
      console.error("Error al agregar al carrito:", err);
      alert("Ocurrió un error al agregar el producto. Revisa la consola.");
    }
  });
});
