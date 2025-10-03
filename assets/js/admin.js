// admin.js (integrado con el backend de productos)

const API_BASE_URL = 'http://localhost:8080';
const CLOUDINARY_CLOUD_NAME = 'dz4qsmco8';
const CLOUDINARY_UPLOAD_PRESET = 'geekxpress';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

document.addEventListener('DOMContentLoaded', () => {
    // ---------- Elementos DOM ----------
    const tablaProductosBody = document.querySelector('#tablaProductos tbody');
    const busquedaProductoInput = document.getElementById('busquedaProducto');
    const productForm = document.getElementById('formNuevoProducto');
    const imageInput = document.getElementById('imagenesProducto');
    const modalProductoEl = document.getElementById('nuevoProductoModal');
    const abrirModalBtn = document.getElementById('nuevoProductoBtn');
    const imagePreview = document.querySelector('.image-preview-container');
    const adminProductSubmitBtn = document.getElementById('admin-product-submit');

    // ---------- Estado ----------
    let editProductId = null;
    let selectedFiles = [];

    // ---------- Helpers ----------
    async function uploadToCloudinary(file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: fd });
        if (!res.ok) {
            const data = await res.json();
            console.error('Error Cloudinary:', data);
            throw new Error(data.error?.message || 'Fallo al subir a Cloudinary');
        }
        const data = await res.json();
        return { url: data.secure_url, mainImage: false };
    }

    function safeText(v) {
        return (v === undefined || v === null) ? '' : v;
    }

    function formatearCOP(valor) {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor);
    }
    
    function getCategoriaClass(categoria) {
        switch(categoria?.toLowerCase()) {
            case 'anime': return 'categoria-anime';
            case 'videojuegos': return 'categoria-videojuegos';
            case 'cómics': case 'comics': return 'categoria-comics';
            case 'cartas': return 'categoria-cartas';
            case 'accesorios': return 'categoria-accesorios';
            default: return 'categoria-accesorios';
        }
    }

    // ---------- API calls ----------
    async function fetchProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
            return [];
        }
    }

    async function createProduct(productData) {
        const response = await fetch(`${API_BASE_URL}/products/admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Fallo al crear el producto');
        }
        return await response.json();
    }

    async function updateProduct(id, productData) {
        const response = await fetch(`${API_BASE_URL}/products/admin/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Fallo al actualizar el producto');
        }
        return await response.json();
    }

    async function deleteProduct(id) {
        const response = await fetch(`${API_BASE_URL}/products/admin/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Fallo al eliminar el producto');
        }
    }

    // ---------- Render tabla ----------
    async function renderizarTablaProductos(filtro = '') {
        if (!tablaProductosBody) return;
        tablaProductosBody.innerHTML = '<tr><td colspan="8" class="text-center">Cargando productos...</td></tr>';

        const productos = await fetchProducts();
        tablaProductosBody.innerHTML = '';

        const q = filtro.trim().toLowerCase();
        const filtrados = productos.filter(p => {
            if (!q) return true;
            return (
                safeText(p.name).toLowerCase().includes(q) ||
                safeText(p.id).toString().includes(q) ||
                (p.categories && Array.from(p.categories).some(c => safeText(c).toLowerCase().includes(q)))
            );
        });

        if (filtrados.length === 0) {
            const noRow = document.createElement('tr');
            noRow.innerHTML = `<td colspan="8" class="text-center">No hay productos para mostrar.</td>`;
            tablaProductosBody.appendChild(noRow);
            return;
        }

        filtrados.forEach(producto => {
            const primeraImagen = Array.isArray(producto.images) && producto.images.length > 0 ?
                producto.images.find(img => img.mainImage)?.url || producto.images[0].url :
                'https://via.placeholder.com/60';

            const categorias = Array.from(producto.categories).map(c =>
                `<span class=" ${getCategoriaClass(c)}">${c}</span>`).join(' ');

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>
                    <img src="${primeraImagen}" alt="${producto.name}" class="producto-img"
                    style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
                </td>
                <td>${producto.id || ''}</td>
                <td>${producto.name}</td>
                <td>${categorias || 'Sin categoría'}</td>
                <td>${formatearCOP(producto.price)}</td>
                <td>${producto.stock ?? 0}</td>
                <td>
                    <button class="btn btn-sm btn-warning editar-btn" data-id="${producto.id}" title="Editar">✏️</button>
                    <button class="btn btn-sm btn-info ver-btn" data-id="${producto.id}" title="Ver">👁</button>
                    <button class="btn btn-sm btn-danger eliminar-btn" data-id="${producto.id}" title="Eliminar">🗑️</button>
                </td>
            `;
            tablaProductosBody.appendChild(fila);
        });
    }

    // ---------- Limpiar formulario ----------
    function limpiarFormularioProducto() {
        if (productForm) productForm.reset();
        if (imagePreview) imagePreview.innerHTML = '';
        selectedFiles = [];
        editProductId = null;
        if (imageInput) imageInput.value = '';
        if (adminProductSubmitBtn) {
            adminProductSubmitBtn.textContent = "Crear producto";
        }
    }

    // ---------- Preview & selección ----------
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function () {
            const files = Array.from(this.files || []);
            imagePreview.innerHTML = '';
            selectedFiles = [];

            if (files.length === 0) return;

            files.forEach((file, idx) => {
                const displayUrl = URL.createObjectURL(file);
                selectedFiles.push({ file, mainImage: idx === 0 });

                const container = document.createElement('div');
                container.className = 'image-preview-item position-relative';
                container.style.width = '100px';
                container.style.height = '100px';

                const img = document.createElement('img');
                img.src = displayUrl;
                img.alt = file.name;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '6px';
                img.addEventListener('load', () => { try { URL.revokeObjectURL(displayUrl); } catch (_) { } });

                if (idx === 0) {
                    const badge = document.createElement('span');
                    badge.className = 'image-preview-badge badge bg-primary position-absolute';
                    badge.style.top = '6px';
                    badge.style.left = '6px';
                    badge.textContent = 'Principal';
                    container.appendChild(badge);
                }

                container.appendChild(img);
                imagePreview.appendChild(container);
            });
        });
    }

    // ---------- Submit producto (crear / editar) ----------
    if (productForm) {
        productForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const nombre = document.getElementById('nombreProducto')?.value || 'Sin nombre';
            const descripcion = document.getElementById('descripcionProducto')?.value || '';
            const precio = parseFloat(document.getElementById('precioProducto')?.value) || 0;
            const stock = parseInt(document.getElementById('stockProducto')?.value) || 0;
            const categoriaNombre = document.getElementById('categoriaProducto')?.value;

            if (!categoriaNombre) {
                Swal.fire('Error', 'Debe seleccionar una categoría.', 'error');
                return;
            }

            Swal.fire({
                title: editProductId ? 'Actualizando...' : 'Creando...',
                text: 'Subiendo imágenes y guardando el producto. Por favor, espera.',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            let uploadedImages = selectedFiles
                .filter(f => f.url) // imágenes existentes
                .map(f => ({ url: f.url, mainImage: f.mainImage }));

            if (selectedFiles.some(f => f.file)) {
                try {
                    const uploadPromises = selectedFiles
                        .filter(f => f.file) // solo nuevas
                        .map(f => uploadToCloudinary(f.file));
                    const nuevas = await Promise.all(uploadPromises);
                    uploadedImages = [...uploadedImages, ...nuevas];
                    if (uploadedImages.length > 0) uploadedImages[0].mainImage = true;
                } catch (err) {
                    Swal.fire('Error', 'Ocurrió un error subiendo una o más imágenes.', 'error');
                    return;
                }
            }


            const productData = {
                name: nombre,
                description: descripcion,
                price: precio,
                stock: stock,
                categoryNames: [categoriaNombre],
                images: uploadedImages,
            };

            try {
                if (editProductId) {
                    await updateProduct(editProductId, productData);
                    Swal.fire('Actualizado!', `Producto "${nombre}" actualizado correctamente!`, 'success');
                } else {
                    await createProduct(productData);
                    Swal.fire('Creado!', `Producto "${nombre}" creado correctamente!`, 'success');
                }
                
                const modalInstance = bootstrap.Modal.getInstance(modalProductoEl) || new bootstrap.Modal(modalProductoEl);
                modalInstance.hide();
                limpiarFormularioProducto();
                renderizarTablaProductos(busquedaProductoInput?.value || '');

            } catch (err) {
                console.error('Error al guardar el producto:', err);
                Swal.fire('Error', 'Ocurrió un error al guardar el producto. Inténtalo de nuevo.', 'error');
            }
        });
    }

    // ---------- Acciones en la tabla (delegación) ----------
    if (tablaProductosBody) {
        tablaProductosBody.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const id = btn.dataset.id;
            if (!id) return;

            const productos = await fetchProducts();
            const producto = productos.find(p => p.id == id);
            if (!producto) return;

            if (btn.classList.contains('eliminar-btn')) {
                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: `¿Eliminar el producto "${producto.name}"?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });
                if (result.isConfirmed) {
                    try {
                        await deleteProduct(id);
                        Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
                        renderizarTablaProductos(busquedaProductoInput?.value || '');
                    } catch (err) {
                        Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
                    }
                }
                return;
            }

            if (btn.classList.contains('editar-btn')) {
                editProductId = id;
                if (adminProductSubmitBtn) adminProductSubmitBtn.textContent = "Editar producto";
                
                document.getElementById('nombreProducto').value = producto.name || '';
                document.getElementById('descripcionProducto').value = producto.description || '';
                document.getElementById('precioProducto').value = producto.price ?? 0;
                document.getElementById('stockProducto').value = producto.stock ?? 0;

                if (producto.categories && producto.categories.length > 0) {
                    document.getElementById('categoriaProducto').value = producto.categories[0]; 
                }

                if (imagePreview) {
                    imagePreview.innerHTML = '';
                    selectedFiles = [];

                    const imgs = Array.isArray(producto.images) ? producto.images : [];
                    imgs.forEach((p, idx) => {
                        // Mostrar imagen
                        const container = document.createElement('div');
                        container.className = 'image-preview-item position-relative';
                        container.style.width = '100px';
                        container.style.height = '100px';

                        const img = document.createElement('img');
                        img.src = p.url;
                        img.alt = `${producto.name} ${idx + 1}`;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'cover';
                        img.style.borderRadius = '6px';

                        if (p.mainImage) {
                            const badge = document.createElement('span');
                            badge.className = 'image-preview-badge badge bg-primary position-absolute';
                            badge.style.top = '6px';
                            badge.style.left = '6px';
                            badge.textContent = 'Principal';
                            container.appendChild(badge);
                        }

                        container.appendChild(img);
                        imagePreview.appendChild(container);

                        // Guardar en selectedFiles como existente
                        selectedFiles.push({
                            file: null,     // no hay archivo local
                            url: p.url,     // viene del backend
                            mainImage: !!p.mainImage
                        });
                    });
                }


                if (modalProductoEl) new bootstrap.Modal(modalProductoEl).show();
                return;
            }

            if (btn.classList.contains('ver-btn')) {
                const producto = productos.find(p => p.id == id);
                if (!producto) return;

                let imagenesHTML = '';
                if (producto.images && producto.images.length > 0) {
                    imagenesHTML = producto.images.map(img =>
                        `<img src="${img.url}" alt="${producto.name}" class="img-thumbnail me-2 mb-2" style="max-width:150px;">`
                    ).join('');
                } else {
                    imagenesHTML = `<p class="text-muted">Sin imágenes</p>`;
                }

                const categorias = Array.from(producto.categories).join(', ');
                const modalContent = `
                    <p><strong>ID:</strong> ${producto.id}</p>
                    <p><strong>Nombre:</strong> ${producto.name}</p>
                    <p><strong>Categoría:</strong> ${categorias || 'Sin categoría'}</p>
                    <p><strong>Precio:</strong> ${formatearCOP(producto.price)}</p>
                    <p><strong>Stock:</strong> ${producto.stock ?? 0}</p>
                    <p><strong>Descripción:</strong> ${producto.description || 'Sin descripción'}</p>
                    <div class="d-flex flex-wrap">${imagenesHTML}</div>
                `;

                document.getElementById('detalleProductoBody').innerHTML = modalContent;
                const modal = new bootstrap.Modal(document.getElementById('detalleProductoModal'));
                modal.show();
            }
        });
    }

    // ---------- Búsqueda productos ----------
    if (busquedaProductoInput) {
        busquedaProductoInput.addEventListener('keyup', function () {
            renderizarTablaProductos(this.value);
        });
    }

    // Llama a la función de renderizado inicial
    renderizarTablaProductos();
    const tablaUsuariosBody = document.querySelector('#tablaUsuarios tbody');
const busquedaUsuarioInput = document.getElementById('busquedaUsuario');
const formNuevoUsuario = document.getElementById('formNuevoUsuario');
let editUserIndex = null;

let usuarios = [];

async function cargarUsuarios() {
  try {
    const resp = await fetch("http://localhost:8080/users");
    if (!resp.ok) throw new Error("Error al cargar usuarios");
    usuarios = await resp.json();
    renderizarUsuarios();
  } catch (err) {
    console.error("Error cargando usuarios:", err);
    usuarios = [];
    renderizarUsuarios();
  }
}

function limpiarFormularioUsuario() {
  if (!formNuevoUsuario) return;
  formNuevoUsuario.reset();
  editUserIndex = null;
  const fechaReg = document.getElementById('fechaRegistro');
  if (fechaReg) fechaReg.value = new Date().toISOString().split('T')[0];
  setTextoBotonUsuario("crear");
}

function renderizarUsuarios(filtro = '') {
  if (!tablaUsuariosBody) return;
  tablaUsuariosBody.innerHTML = '';
  const q = filtro.trim().toLowerCase();
  const filtrados = usuarios.filter(u => {
    if (!q) return true;
    return (
      (u.userName || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.lastName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  if (filtrados.length === 0) {
    const no = document.createElement('tr');
    no.innerHTML = `<td colspan="8" class="text-center">No hay usuarios para mostrar.</td>`;
    tablaUsuariosBody.appendChild(no);
    return;
  }

  filtrados.forEach(u => {
    const realIndex = usuarios.findIndex(x => x.id === u.id);
    const fila = document.createElement('tr');

    function getRolClass(rol) {
      switch(rol?.toLowerCase()) {
        case 'admin': case 'administrador': return 'rol-admin';
        case 'cliente': return 'rol-cliente';
        case 'moderador': return 'rol-moderador';
        default: return 'rol-cliente';
      }
    }

    fila.innerHTML = `
      <td>${u.name}</td>
      <td>${u.lastName}</td>
      <td>${u.userName}</td>
      <td>${u.email || ''}</td>
      <td>
        <span class="${getRolClass(u.userName === 'admin' ? 'admin' : (u.rol || 'user'))}">
          ${u.userName === 'admin' ? 'admin' : (u.rol || 'user')}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-warning editar-usuario" data-index="${realIndex}" title="Editar">✏️</button>
        <button class="btn btn-sm btn-info ver-usuario" data-index="${realIndex}" title="Ver">👁</button>
        <button class="btn btn-sm btn-danger eliminar-usuario" data-index="${realIndex}" title="Eliminar">🗑️</button>
      </td>
    `;
    tablaUsuariosBody.appendChild(fila);
  });
}

if (busquedaUsuarioInput) {
  busquedaUsuarioInput.addEventListener('keyup', function () {
    renderizarUsuarios(this.value);
  });
}

const nuevoUsuarioBtn = document.getElementById('nuevoUsuarioBtn');
if (nuevoUsuarioBtn) {
  nuevoUsuarioBtn.addEventListener('click', limpiarFormularioUsuario);
}

if (formNuevoUsuario) {
  formNuevoUsuario.addEventListener('submit', async e => {
    e.preventDefault();
    const nuevoUsuario = {
      userName: document.getElementById('usuario')?.value || '',
      name: document.getElementById('nombreUsuario')?.value || '',
      lastName: document.getElementById('apellidoUsuario')?.value || '',
      email: document.getElementById('emailUsuario')?.value || '',
      password: document.getElementById('passwordUsuario')?.value || '',
    };

    try {
      if (editUserIndex !== null) {
        // EDITAR usuario en backend
        const userId = usuarios[editUserIndex].id;
        const resp = await fetch(`http://localhost:8080/users/admin/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoUsuario)
        });
        if (!resp.ok) throw new Error("Error al actualizar usuario");

        Swal.fire('Actualizado!', `Usuario "${nuevoUsuario.userName}" actualizado exitosamente.`, 'success');
      } else {
        // CREAR usuario en backend
        const resp = await fetch("http://localhost:8080/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoUsuario)
        });
        if (!resp.ok) throw new Error("Error al crear usuario");

        Swal.fire('Creado!', `Usuario "${nuevoUsuario.userName}" creado exitosamente.`, 'success');
      }

      await cargarUsuarios();
      limpiarFormularioUsuario();

      const modalEl = document.getElementById('nuevoUsuarioModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo guardar el usuario en el servidor.', 'error');
    }
  });
}

if (tablaUsuariosBody) {
  tablaUsuariosBody.addEventListener('click', async e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const index = parseInt(btn.dataset.index);
    if (isNaN(index) || !usuarios[index]) return;

    if (btn.classList.contains('eliminar-usuario')) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Seguro que deseas eliminar al usuario "${usuarios[index].userName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const userId = usuarios[index].id;
            const resp = await fetch(`http://localhost:8080/users/admin/${userId}`, {
              method: "DELETE"
            });
            if (!resp.ok) throw new Error("Error al eliminar usuario");

            Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
            await cargarUsuarios();
          } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar el usuario en el servidor.', 'error');
          }
        }
      });
      return;
    }

    if (btn.classList.contains('ver-usuario')) {
      const u = usuarios[index];
      const infoHtml = `
        <div class="col">
            <p><strong>Nombre:</strong> ${u.userName}</p>
            <p><strong>Email:</strong> ${u.email}</p>
            <p><strong>Documento:</strong> ${u.tipoDoc || ''} ${u.documento || ''}</p>
            <p><strong>Teléfono:</strong> ${u.telefono || 'No registrado'}</p>
            <p><strong>Ciudad:</strong> ${u.ciudad || 'No registrada'}</p>
            <p><strong>Rol:</strong> ${u.rol || ''}</p>
            <p><strong>Estado:</strong> ${u.estado || ''}</p>
            <p><strong>Fecha de Registro:</strong> ${u.fechaRegistro || ''}</p>
        </div>
        ${u.notas ? `<div class="mt-3"><p><strong>Notas:</strong> ${u.notas}</p></div>` : ''}
      `;
      document.getElementById('detalleUsuarioBody').innerHTML = infoHtml;
      const modal = new bootstrap.Modal(document.getElementById('detalleUsuarioModal'));
      modal.show();
    }

    if (btn.classList.contains('editar-usuario')) {
      editUserIndex = index;
      const u = usuarios[index];
      document.getElementById('nombreUsuario').value = u.name || '';
      document.getElementById('apellidoUsuario').value = u.lastName || '';
      document.getElementById('usuario').value = u.userName || '';
      document.getElementById('emailUsuario').value = u.email || '';
      document.getElementById('passwordUsuario').value = u.password ||'';

      setTextoBotonUsuario("editar");
      const modalEl = document.getElementById('nuevoUsuarioModal');
      if (modalEl) new bootstrap.Modal(modalEl).show();
    }
  });
}

function setTextoBotonUsuario(modo) {
  const spanBtn = document.getElementById('admin-user-submit');
  if (!spanBtn) return;
  if (modo === 'editar') {
    spanBtn.textContent = "Editar Usuario";
  } else {
    spanBtn.textContent = "Crear Usuario";
  }
}

// 👉 Llamada inicial para cargar usuarios desde el backend
cargarUsuarios();
});