

document.addEventListener("navbarLoaded", () => {
  const loginLink = document.getElementById("loginLinkNav");
  const loginNav = document.getElementById("navUsuario");

  if (!loginLink || !loginNav) return;

  // Revisa si hay usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (usuarioLogueado) {
    loginNav.textContent = usuarioLogueado.firstName; // mostrar nombre
    console.log("Usuario logueado:", usuarioLogueado.firstName);

    // Crear menú desplegable de cerrar sesión
    const logoutMenu = document.createElement("div");
    logoutMenu.id = "logoutMenu";
    logoutMenu.style.position = "absolute";
    logoutMenu.style.background = "#fff";
    logoutMenu.style.border = "1px solid #ccc";
    logoutMenu.style.padding = "8px 12px";
    logoutMenu.style.cursor = "pointer";
    logoutMenu.style.display = "none"; // inicialmente oculto
    logoutMenu.textContent = "Cerrar sesión";
    logoutMenu.style.color = "black"

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
      window.location.href = "login.html";
    });
  }
});


