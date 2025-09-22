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
        const response = await fetch(`${API_BASE_URL}/products`, {
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
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
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
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
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
                `<span class="badge ${getCategoriaClass(c)}">${c}</span>`).join(' ');

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>
                    <img src="${primeraImagen}" alt="${producto.name}" class="producto-img"
                    style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
                </td>
                <td>${producto.id || ''}</td>
                <td>${producto.name}</td>
                <td>${producto.description ? String(producto.description).substring(0, 40) + '...' : 'Sin descripción'}</td>
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

            let uploadedImages = [];
            if (selectedFiles.length > 0) {
                try {
                    const uploadPromises = selectedFiles.map(f => uploadToCloudinary(f.file));
                    uploadedImages = await Promise.all(uploadPromises);
                    if (uploadedImages.length > 0) uploadedImages[0].mainImage = true;
                } catch (err) {
                    Swal.fire('Error', 'Ocurrió un error subiendo una o más imágenes.', 'error');
                    console.error('Error subiendo imágenes a Cloudinary:', err);
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
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
      { usuario: 'Carlos Pérez', email: 'carlos@example.com', tipoDoc: 'CC', documento: '12345678', telefono: '3001234567', fechaNacimiento: '1985-03-15', genero: 'masculino', direccion: 'Calle 123 #45-67', ciudad: 'Bogotá', rol: 'cliente', estado: 'Activo', fechaRegistro: '2024-01-15', notas: 'Cliente frecuente' },
      { usuario: 'María Gómez', email: 'maria@example.com', tipoDoc: 'CE', documento: '87654321', telefono: '3109876543', fechaNacimiento: '1990-07-22', genero: 'femenino', direccion: 'Carrera 50 #20-30', ciudad: 'Medellín', rol: 'cliente', estado: 'Inactivo', fechaRegistro: '2024-02-20', notas: '' }
    ];

    function guardarUsuarios() { localStorage.setItem('usuarios', JSON.stringify(usuarios)); }
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
          (u.usuario || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.documento || '').toLowerCase().includes(q)
        );
      });

      if (filtrados.length === 0) {
        const no = document.createElement('tr');
        no.innerHTML = `<td colspan="8" class="text-center">No hay usuarios para mostrar.</td>`;
        tablaUsuariosBody.appendChild(no);
        return;
      }

      filtrados.forEach(u => {
        const realIndex = usuarios.findIndex(x => x.email === u.email && x.documento === u.documento);
        const fila = document.createElement('tr');
        
        function getEstadoUsuarioClass(estado) {
          switch(estado?.toLowerCase()) {
            case 'activo': return 'estado-activo';
            case 'inactivo': return 'estado-inactivo';
            case 'suspendido': return 'estado-suspendido';
            default: return 'estado-inactivo';
          }
        }
        
        function getRolClass(rol) {
          switch(rol?.toLowerCase()) {
            case 'admin': case 'administrador': return 'rol-admin';
            case 'cliente': return 'rol-cliente';
            case 'moderador': return 'rol-moderador';
            default: return 'rol-cliente';
          }
        }

        fila.innerHTML = `
          <td class="producto-nombre">${u.usuario}</td>
          <td>${u.email}</td>
          <td><div class="fw-semibold">${u.tipoDoc}</div><small class="text-muted">${u.documento}</small></td>
          <td>${u.telefono || ''}</td>
          <td>${u.ciudad || ''}</td>
          <td><span class="${getRolClass(u.rol)}">${u.rol}</span></td>
          <td><span class="${getEstadoUsuarioClass(u.estado)}">${u.estado}</span></td>
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
      formNuevoUsuario.addEventListener('submit', e => {
        e.preventDefault();
        const nuevoUsuario = {
          usuario: document.getElementById('nombreUsuario')?.value || '',
          email: document.getElementById('emailUsuario')?.value || '',
          tipoDoc: document.getElementById('tipoDocumento')?.value || '',
          documento: document.getElementById('documentoUsuario')?.value || '',
          telefono: document.getElementById('telefonoUsuario')?.value || '',
          fechaNacimiento: document.getElementById('fechaNacimiento')?.value || '',
          genero: document.getElementById('generoUsuario')?.value || '',
          direccion: document.getElementById('direccionUsuario')?.value || '',
          ciudad: document.getElementById('ciudadUsuario')?.value || '',
          rol: document.getElementById('rolUsuario')?.value || 'cliente',
          estado: document.getElementById('estadoUsuario')?.value || 'Activo',
          fechaRegistro: document.getElementById('fechaRegistro')?.value || new Date().toISOString().split('T')[0],
          notas: document.getElementById('notasUsuario')?.value || '',
          password: document.getElementById('passwordUsuario')?.value || '',
        };

        if (editUserIndex !== null) {
          usuarios[editUserIndex] = nuevoUsuario;
          Swal.fire('Actualizado!', `Usuario "${nuevoUsuario.usuario}" actualizado exitosamente.`, 'success');
        } else {
          if (usuarios.some(u => u.email === nuevoUsuario.email)) { Swal.fire('Error', 'Ya existe un usuario con ese email.', 'error'); return; }
          if (usuarios.some(u => u.documento === nuevoUsuario.documento && u.tipoDoc === nuevoUsuario.tipoDoc)) { Swal.fire('Error', 'Ya existe un usuario con ese tipo y número de documento.', 'error'); return; }
          usuarios.push(nuevoUsuario);
          Swal.fire('Creado!', `Usuario "${nuevoUsuario.usuario}" creado exitosamente.`, 'success');
        }

        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        renderizarUsuarios(busquedaUsuarioInput?.value || '');
        limpiarFormularioUsuario();
        const modalEl = document.getElementById('nuevoUsuarioModal');
        if (modalEl) {
          const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modal.hide();
        }
      });
    }

    if (tablaUsuariosBody) {
      tablaUsuariosBody.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const index = parseInt(btn.dataset.index);
        if (isNaN(index) || !usuarios[index]) return;

        if (btn.classList.contains('eliminar-usuario')) {
          Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Seguro que deseas eliminar al usuario "${usuarios[index].usuario}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed) {
              usuarios.splice(index, 1);
              guardarUsuarios();
              renderizarUsuarios(busquedaUsuarioInput?.value || '');
              Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
            }
          });
          return;
        }

        if (btn.classList.contains('ver-usuario')) {
          const u = usuarios[index];
          const infoHtml = `
            <div class="col">
                <p><strong>Nombre:</strong> ${u.usuario}</p>
                <p><strong>Email:</strong> ${u.email}</p>
                <p><strong>Documento:</strong> ${u.tipoDoc} ${u.documento}</p>
                <p><strong>Teléfono:</strong> ${u.telefono || 'No registrado'}</p>
                <p><strong>Ciudad:</strong> ${u.ciudad || 'No registrada'}</p>
                <p><strong>Rol:</strong> ${u.rol}</p>
                <p><strong>Estado:</strong> ${u.estado}</p>
                <p><strong>Fecha de Registro:</strong> ${u.fechaRegistro}</p>
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
          document.getElementById('nombreUsuario').value = u.usuario || '';
          document.getElementById('emailUsuario').value = u.email || '';
          document.getElementById('tipoDocumento').value = u.tipoDoc || '';
          document.getElementById('documentoUsuario').value = u.documento || '';
          document.getElementById('telefonoUsuario').value = u.telefono || '';
          document.getElementById('fechaNacimiento').value = u.fechaNacimiento || '';
          document.getElementById('generoUsuario').value = u.genero || '';
          document.getElementById('direccionUsuario').value = u.direccion || '';
          document.getElementById('ciudadUsuario').value = u.ciudad || '';
          document.getElementById('rolUsuario').value = u.rol || 'cliente';
          document.getElementById('estadoUsuario').value = u.estado || 'Activo';
          document.getElementById('fechaRegistro').value = u.fechaRegistro || new Date().toISOString().split('T')[0];
          document.getElementById('notasUsuario').value = u.notas || '';
          document.getElementById('passwordUsuario').value = '';

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

    renderizarUsuarios();
});