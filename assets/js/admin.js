// admin3.js (Cloudinary integrado con alertas mejoradas)
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

  // Contenedor de preview
  let imagePreview = null;
  if (imageInput) {
    imagePreview = imageInput.parentNode.querySelector('.image-preview-container');
    if (!imagePreview) {
      imagePreview = document.createElement('div');
      imagePreview.className = 'image-preview-container mt-2 d-flex flex-wrap gap-2';
      imageInput.parentNode.appendChild(imagePreview);
    }
  }

  // estado
  let editProductIndex = null;
  let selectedFiles = [];

  // alertas
  const AlertasPersonalizadas = {
    exito: (titulo, mensaje) => {
      return Swal.fire({
        icon: 'success',
        title: titulo,
        text: mensaje,
        background: '#190a28',
        color: '#f8e8ff',
        confirmButtonColor: '#40DFFF',
        confirmButtonText: 'Genial',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        }
      });
    },
    error: (titulo, mensaje) => {
      return Swal.fire({
        icon: 'error',
        title: titulo,
        text: mensaje,
        background: '#190a28',
        color: '#f8e8ff',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    },
    advertencia: (titulo, mensaje) => {
      return Swal.fire({
        icon: 'warning',
        title: titulo,
        text: mensaje,
        background: '#190a28',
        color: '#f8e8ff',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Ok',
        showClass: {
          popup: 'animate__animated animate__pulse'
        }
      });
    },
    confirmacion: (titulo, mensaje) => {
      return Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'question',
        background: '#190a28',
        color: '#f8e8ff',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        showClass: {
          popup: 'animate__animated animate__zoomIn'
        }
      });
    },
    cargando: (titulo, mensaje) => {
      return Swal.fire({
        title: titulo,
        text: mensaje,
        background: '#190a28',
        color: '#f8e8ff',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    }
  };

  // ---------- Helpers ----------
  function getProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
  }
  function setProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  function generarIdUnico() {
    return 'prod-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }

  function safeText(v) {
    return (v === undefined || v === null) ? '' : v;
  }

  // Función para obtener la clase CSS según el estado
  function getEstadoClass(estado) {
    switch(estado?.toLowerCase()) {
      case 'activo': return 'estado-activo';
      case 'inactivo': return 'estado-inactivo';
      default: return 'estado-inactivo';
    }
  }

  // Función para obtener la clase CSS según la categoría
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

  // Función para obtener la clase CSS según el rol
  function getRolClass(rol) {
    switch(rol?.toLowerCase()) {
      case 'admin': case 'administrador': return 'rol-admin';
      case 'cliente': return 'rol-cliente';
      case 'moderador': return 'rol-moderador';
      default: return 'rol-cliente';
    }
  }

  async function uploadToCloudinary(file) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      console.error('Error Cloudinary:', data);
      throw new Error(data.error?.message || 'Fallo al subir a Cloudinary');
    }
    return { url: data.secure_url, public_id: data.public_id };
  }

  // ---------- Formatear moneda COP ----------
  function formatearCOP(valor) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  }

  // ---------- Render tabla ----------
  function renderizarTablaProductos(filtro = '') {
    if (!tablaProductosBody) return;
    const productos = getProducts();
    tablaProductosBody.innerHTML = '';

    const q = filtro.trim().toLowerCase();
    const filtrados = productos.filter(p => {
      if (!q) return true;
      return (
        safeText(p.nombre).toLowerCase().includes(q) ||
        safeText(p.sku).toLowerCase().includes(q) ||
        safeText(p.categoria).toLowerCase().includes(q)
      );
    });

    if (filtrados.length === 0) {
      const noRow = document.createElement('tr');
      noRow.innerHTML = `<td colspan="9" class="text-center">No hay productos para mostrar.</td>`;
      tablaProductosBody.appendChild(noRow);
      return;
    }

    filtrados.forEach(producto => {
      const all = getProducts();
      const realIndex = all.findIndex(p => p.sku === producto.sku);

      const fila = document.createElement('tr');
      const primeraImagen = Array.isArray(producto.imagenes) ? producto.imagenes[0] : producto.imagen;
      
      fila.innerHTML = `
        <td>
          <img src="${primeraImagen || 'https://via.placeholder.com/60'}"
          alt="${producto.nombre}" class="producto-img"
          style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
        </td>
        <td>${producto.nombre}</td>
        <td>${producto.descripcion ? String(producto.descripcion).substring(0,40) + '...' : 'Sin descripción'}</td>
        <td>${producto.sku || ''}</td>
        <td><span class="bg-info">${producto.categoria || 'Sin categoría'}</span></td>
        <td>${formatearCOP(producto.precio)}</td>
        <td>${producto.stock ?? 0}</td>
        <td><span class="${getEstadoClass(producto.estado)}">${producto.estado || 'Inactivo'}</span></td>
        <td>
          <button class="btn btn-sm btn-warning editar-btn" data-index="${realIndex}" title="Editar">✏️</button>
          <button class="btn btn-sm btn-info ver-btn" data-index="${realIndex}" title="Ver">👁</button>
          <button class="btn btn-sm btn-danger eliminar-btn" data-index="${realIndex}" title="Eliminar">🗑️</button>
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
    editProductIndex = null;
    if (imageInput) imageInput.value = '';
    const btnSubmit = document.getElementById('admin-product-submit');
    if (btnSubmit) {
      const span = btnSubmit.querySelector('span') || btnSubmit;
      span.textContent = "Crear producto";
    }
  }

  // ---------- Preview & selección ----------
  if (imageInput) {
    imageInput.addEventListener('change', function () {
      const files = Array.from(this.files || []);
      if (!imagePreview) return;
      imagePreview.innerHTML = '';
      selectedFiles = [];

      if (files.length === 0) return;

      files.forEach((file, idx) => {
        selectedFiles.push(file);
        const displayUrl = URL.createObjectURL(file);

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
        img.addEventListener('load', () => { 
          try { URL.revokeObjectURL(displayUrl); } catch (_) {} 
        });

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

      const sku = (document.getElementById('skuProducto')?.value || '').trim();
      if (!sku) { 
        AlertasPersonalizadas.error('Campo requerido', 'El SKU es obligatorio para identificar el producto.');
        return; 
      }

      const nombre = document.getElementById('nombreProducto')?.value || 'Sin nombre';
      const descripcion = document.getElementById('descripcionProducto')?.value || '';
      const precio = parseFloat(document.getElementById('precioProducto')?.value) || 0;
      const stock = parseInt(document.getElementById('stockProducto')?.value) || 0;
      const categoria = document.getElementById('categoriaProducto')?.value || '';
      const estado = document.getElementById('estadoProducto')?.value || 'Activo';

      const productos = getProducts();
      const isEditing = editProductIndex !== null && productos[editProductIndex];
      const imagenesExistentes = isEditing ? (productos[editProductIndex].imagenes || []) : [];

      let nuevasUrls = [];
      if (selectedFiles.length > 0) {
        // Mostrar alerta de carga
        AlertasPersonalizadas.cargando('Subiendo imágenes...', 'Por favor espera mientras procesamos las imágenes');
        
        try {
          const resultados = await Promise.all(selectedFiles.map(f => uploadToCloudinary(f)));
          nuevasUrls = resultados.map(r => r.url);
          Swal.close(); // Cerrar la alerta de carga
        } catch (err) {
          console.error('Error subiendo imágenes a Cloudinary:', err);
          Swal.close();
          AlertasPersonalizadas.error(
            'Error al subir imágenes', 
            'Ocurrió un problema subiendo una o más imágenes. Por favor intenta nuevamente.'
          );
          return;
        }
      }

      const imagenesFinales = nuevasUrls.length > 0
        ? nuevasUrls
        : (imagenesExistentes.length > 0 ? imagenesExistentes : ['https://via.placeholder.com/100']);

      const productoData = {
        id: isEditing ? productos[editProductIndex].id : generarIdUnico(),        
        nombre,
        sku,
        descripcion,
        precio,
        stock,
        categoria,
        estado,
        imagenes: imagenesFinales,
        imagen: imagenesFinales[0]
      };

      if (isEditing) {
        productos[editProductIndex] = productoData;
        AlertasPersonalizadas.exito(
          '¡Producto actualizado!', 
          `El producto "${productoData.nombre}" se ha actualizado correctamente.`
        );
      } else {
        if (productos.some(p => p.sku === sku)) {
          AlertasPersonalizadas.advertencia(
            'SKU duplicado', 
            `Ya existe un producto con el SKU "${sku}". Por favor usa un SKU diferente.`
          );
          return;
        }
        productos.push(productoData);
        AlertasPersonalizadas.exito(
          '¡Producto creado!', 
          `El producto "${productoData.nombre}" se ha creado exitosamente.`
        );
      }

      setProducts(productos);

      if (modalProductoEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalProductoEl) || new bootstrap.Modal(modalProductoEl);
        modalInstance.hide();
        setTimeout(() => { abrirModalBtn?.focus(); }, 50);
      }

      limpiarFormularioProducto();
      renderizarTablaProductos(busquedaProductoInput?.value || '');
    });
  }

  // ---------- Modal hidden: limpiar + foco ----------
  if (modalProductoEl) {
    modalProductoEl.addEventListener('hidden.bs.modal', () => {
      limpiarFormularioProducto();
      if (abrirModalBtn) abrirModalBtn.focus();
    });
  }

  // ---------- Acciones en la tabla (delegación) ----------
  if (tablaProductosBody) {
    tablaProductosBody.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const index = parseInt(btn.dataset.index);
      const productos = getProducts();
      if (isNaN(index) || !productos[index]) return;

      if (btn.classList.contains('eliminar-btn')) {
        const resultado = await AlertasPersonalizadas.confirmacion(
          '¿Eliminar producto?',
          `¿Estás seguro de que deseas eliminar "${productos[index].nombre}"? Esta acción no se puede deshacer.`
        );
        
        if (resultado.isConfirmed) {
          productos.splice(index, 1);
          setProducts(productos);
          renderizarTablaProductos(busquedaProductoInput?.value || '');
          AlertasPersonalizadas.exito('¡Eliminado!', 'El producto ha sido eliminado correctamente.');
        }
        return;
      }

      if (btn.classList.contains('editar-btn')) {
        const btnSubmit = document.getElementById('admin-product-submit');
        if (btnSubmit) {
          const span = btnSubmit.querySelector('span') || btnSubmit; 
          span.textContent = "Editar producto";
        }
        // preparar edición
        editProductIndex = index;
        const producto = productos[index];

        (document.getElementById('nombreProducto') || {}).value = producto.nombre || '';
        (document.getElementById('skuProducto') || {}).value = producto.sku || '';
        (document.getElementById('descripcionProducto') || {}).value = producto.descripcion || '';
        (document.getElementById('precioProducto') || {}).value = producto.precio ?? 0;
        (document.getElementById('stockProducto') || {}).value = producto.stock ?? 0;
        (document.getElementById('categoriaProducto') || {}).value = producto.categoria || '';
        (document.getElementById('estadoProducto') || {}).value = producto.estado || 'Activo';

        if (imagePreview) imagePreview.innerHTML = '';
        selectedFiles = [];
        const imgs = Array.isArray(producto.imagenes) ? producto.imagenes : (producto.imagen ? [producto.imagen] : []);
        imgs.forEach((p, idx) => {
          const container = document.createElement('div');
          container.className = 'image-preview-item position-relative';
          container.style.width = '100px';
          container.style.height = '100px';

          const img = document.createElement('img');
          img.src = p;
          img.alt = `${producto.nombre} ${idx + 1}`;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          img.style.borderRadius = '6px';

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

        if (modalProductoEl) new bootstrap.Modal(modalProductoEl).show();
        return;
      }

      if (btn.classList.contains('ver-btn')) {
        const producto = productos[index];

        // Generar las imágenes
        let imagenesHTML = '';
        if (producto.imagenes && producto.imagenes.length > 0) {
          imagenesHTML = producto.imagenes.map(img =>
            `<img src="${img}" alt="${producto.nombre}" class="img-thumbnail me-2 mb-2" style="max-width:150px;">`
          ).join('');
        } else {
          imagenesHTML = `<p class="text-muted">Sin imágenes</p>`;
        }

        // Contenido del modal
        const modalContent = `
          <p><strong>Nombre:</strong> ${producto.nombre}</p>
          <p><strong>SKU:</strong> ${producto.sku}</p>
          <p><strong>Categoría:</strong> ${producto.categoria || 'Sin categoría'}</p>
          <p><strong>Precio:</strong> ${formatearCOP(producto.precio)}</p>
          <p><strong>Stock:</strong> ${producto.stock ?? 0}</p>
          <p><strong>Estado:</strong> ${producto.estado || 'Inactivo'}</p>
          <p><strong>Descripción:</strong> ${producto.descripcion || 'Sin descripción'}</p>
          <div class="d-flex flex-wrap">${imagenesHTML}</div>
        `;

        // Insertar el contenido en el body del modal
        document.getElementById('detalleProductoBody').innerHTML = modalContent;

        // Abrir el modal con Bootstrap
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

  // ========== USUARIOS ==========
  const tablaUsuariosBody = document.querySelector('#tablaUsuarios tbody');
  const busquedaUsuarioInput = document.getElementById('busquedaUsuario');
  const formNuevoUsuario = document.getElementById('formNuevoUsuario');
  let editUserIndex = null;
  let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    { usuario: 'Carlos Pérez', email: 'carlos@example.com', tipoDoc: 'CC', documento: '12345678', telefono: '3001234567', fechaNacimiento: '1985-03-15', genero: 'masculino', direccion: 'Calle 123 #45-67', ciudad: 'Bogotá', rol: 'cliente', estado: 'Activo', fechaRegistro: '2024-01-15', notas: 'Cliente frecuente' },
    { usuario: 'María Gómez', email: 'maria@example.com', tipoDoc: 'CE', documento: '87654321', telefono: '3109876543', fechaNacimiento: '1990-07-22', genero: 'femenino', direccion: 'Carrera 50 #20-30', ciudad: 'Medellín', rol: 'cliente', estado: 'Inactivo', fechaRegistro: '2024-02-20', notas: '' }
  ];

  function guardarUsuarios() { 
    localStorage.setItem('usuarios', JSON.stringify(usuarios)); 
  }
  
  function limpiarFormularioUsuario() {
    if (!formNuevoUsuario) return;
    formNuevoUsuario.reset();
    editUserIndex = null;
    const fechaReg = document.getElementById('fechaRegistro');
    if (fechaReg) fechaReg.value = new Date().toISOString().split('T')[0];
    setTextoBotonUsuario("crear");
  }

  // ---------- Render tabla usuarios ----------
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
      
      // Función para obtener clase de estado para usuarios
      function getEstadoUsuarioClass(estado) {
        switch(estado?.toLowerCase()) {
          case 'activo': return 'estado-activo';
          case 'inactivo': return 'estado-inactivo';
          case 'suspendido': return 'estado-suspendido';
          default: return 'estado-inactivo';
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
        AlertasPersonalizadas.exito(
          '¡Usuario actualizado!', 
          `El usuario "${nuevoUsuario.usuario}" ha sido actualizado exitosamente.`
        );
      } else {
        if (usuarios.some(u => u.email === nuevoUsuario.email)) { 
          AlertasPersonalizadas.advertencia(
            'Email duplicado', 
            'Ya existe un usuario registrado con ese email. Por favor usa un email diferente.'
          ); 
          return; 
        }
        if (usuarios.some(u => u.documento === nuevoUsuario.documento && u.tipoDoc === nuevoUsuario.tipoDoc)) { 
          AlertasPersonalizadas.advertencia(
            'Documento duplicado', 
            'Ya existe un usuario con ese tipo y número de documento. Verifica los datos ingresados.'
          ); 
          return; 
        }
        usuarios.push(nuevoUsuario);
        AlertasPersonalizadas.exito(
          '¡Usuario creado!', 
          `El usuario "${nuevoUsuario.usuario}" ha sido creado exitosamente.`
        );
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
    tablaUsuariosBody.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const index = parseInt(btn.dataset.index);
      if (isNaN(index) || !usuarios[index]) return;

      if (btn.classList.contains('eliminar-usuario')) {
        const resultado = await AlertasPersonalizadas.confirmacion(
          '¿Eliminar usuario?',
          `¿Estás seguro de que deseas eliminar al usuario "${usuarios[index].usuario}"? Esta acción no se puede deshacer.`
        );
        
        if (resultado.isConfirmed) {
          usuarios.splice(index, 1);
          guardarUsuarios();
          renderizarUsuarios(busquedaUsuarioInput?.value || '');
          AlertasPersonalizadas.exito('¡Usuario eliminado!', 'El usuario ha sido eliminado correctamente.');
        }
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

        const modalEl = document.getElementById('detalleUsuarioModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }

      if (btn.classList.contains('editar-usuario')) {
        editUserIndex = index;
        const u = usuarios[index];
        (document.getElementById('nombreUsuario') || {}).value = u.usuario || '';
        (document.getElementById('emailUsuario') || {}).value = u.email || '';
        (document.getElementById('tipoDocumento') || {}).value = u.tipoDoc || '';
        (document.getElementById('documentoUsuario') || {}).value = u.documento || '';
        (document.getElementById('telefonoUsuario') || {}).value = u.telefono || '';
        (document.getElementById('fechaNacimiento') || {}).value = u.fechaNacimiento || '';
        (document.getElementById('generoUsuario') || {}).value = u.genero || '';
        (document.getElementById('direccionUsuario') || {}).value = u.direccion || '';
        (document.getElementById('ciudadUsuario') || {}).value = u.ciudad || '';
        (document.getElementById('rolUsuario') || {}).value = u.rol || 'cliente';
        (document.getElementById('estadoUsuario') || {}).value = u.estado || 'Activo';
        (document.getElementById('fechaRegistro') || {}).value = u.fechaRegistro || new Date().toISOString().split('T')[0];
        (document.getElementById('notasUsuario') || {}).value = u.notas || '';
        (document.getElementById('passwordUsuario') || {}).value = '';

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

  // ---------- Inicializar ----------
  renderizarTablaProductos();
  renderizarUsuarios();
});