// filtro.js

// Función para verificar acceso de admin
function checkAdminAccess() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Debes iniciar sesión para acceder.");
    window.location.href = "../index.html"; // 👈 redirige al login
    return;
  }

  try {
    // Decodificar payload del JWT
    const tokenParts = token.split(".");
    const payload = JSON.parse(atob(tokenParts[1]));

    const role = payload.role; // 👈 el claim que pusiste en el backend
    localStorage.setItem("userRole", role); // opcional, para cachear

    if (role !== "ROLE_ADMIN") {
    //   alert("No tienes permisos para acceder a esta página.");
      window.location.href = "../pages/403.html";
    }
  } catch (err) {
    console.error("Error al verificar token:", err);
    alert("Sesión inválida. Vuelve a iniciar sesión.");
    localStorage.clear();
    window.location.href = "../index.html";
  }
}

// Ejecutar automáticamente al cargar la página
document.addEventListener("DOMContentLoaded", checkAdminAccess);
