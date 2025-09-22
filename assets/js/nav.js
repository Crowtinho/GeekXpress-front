

document.addEventListener("navbarLoaded", () => {
  const loginLink = document.getElementById("loginLinkNav");
  const loginNav = document.getElementById("navUsuario");

  if (!loginLink || !loginNav) return;

  // Revisa si hay usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (usuarioLogueado) {
    loginNav.textContent = usuarioLogueado.userName; // mostrar nombre
    console.log("Usuario logueado:", usuarioLogueado.role);


        // Si el usuario es admin, agregar enlace de vista admin
    if (usuarioLogueado.role === "ROLE_ADMIN") {
      const menuCentral = document.querySelector(".navbar-nav"); // ul principal
      const liAdmin = document.createElement("li");
      liAdmin.classList.add("nav-item", "me-3");
      liAdmin.innerHTML = `<a class="nav-link" href="../pages/admin.html">Vista Admin</a>`;
      menuCentral.appendChild(liAdmin); // lo agrega al final
    }
  

    // Crear menú desplegable de cerrar sesión
    const logoutMenu = document.createElement("div");
    logoutMenu.id = "logoutMenu";
    logoutMenu.textContent = "Cerrar sesión";
    document.body.appendChild(logoutMenu);

    document.body.appendChild(logoutMenu);

    // Mostrar/ocultar menú al hacer click en loginLink
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      const rect = loginLink.getBoundingClientRect();
      logoutMenu.style.top = rect.bottom + window.scrollY + "px";
      logoutMenu.style.left = rect.left + window.scrollX + "px";
      logoutMenu.style.display = logoutMenu.style.display === "none" ? "block" : "none";
    });

    // Evento de cerrar sesión
    logoutMenu.addEventListener("click", () => {
      localStorage.removeItem("usuarioLogueado");
      logoutMenu.style.display = "none";
      loginNav.textContent = "Iniciar sesión";
      window.location.reload(); // opcional: recargar para actualizar el nav
    });

    // Cerrar menú si se hace click fuera
    document.addEventListener("click", (e) => {
      if (!loginLink.contains(e.target) && !logoutMenu.contains(e.target)) {
        logoutMenu.style.display = "none";
      }
    });
  } else {
    // Usuario no logueado, redirigir a login
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      // window.location.href = "login.html";
      window.location.href = `${isGitHubPages ? "/" + repoName : ""}/pages/login.html`;
    });
  }
});


