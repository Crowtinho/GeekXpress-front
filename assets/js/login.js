const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const panelLogin = document.getElementById('panel-login');
const panelRegister = document.getElementById('panel-register');

tabLogin.addEventListener('click', () => {
  tabLogin.setAttribute('aria-selected', 'true');
  tabRegister.setAttribute('aria-selected', 'false');
  panelLogin.hidden = false;
  panelRegister.hidden = true;

  tabLogin.classList.add('text-white', 'font-semibold');
  tabRegister.classList.remove('text-white', 'font-semibold');
});

tabRegister.addEventListener('click', () => {
  tabRegister.setAttribute('aria-selected', 'true');
  tabLogin.setAttribute('aria-selected', 'false');
  panelRegister.hidden = false;
  panelLogin.hidden = true;

  tabRegister.classList.add('text-white', 'font-semibold');
  tabLogin.classList.remove('text-white', 'font-semibold');
});

// ===================== LOGIN =====================
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userName = document.getElementById('username-login').value;
  const password = document.getElementById('password').value;

try {
  const res = await fetch("https://8mq33rknsp.us-east-1.awsapprunner.com/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password })
  });

  if (res.ok) {
    const data = await res.json();
    console.log("Respuesta del backend:", data);

    // Guardar token y userId en localStorage
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userId", data.id);

    // Decodificar JWT para obtener claims
    const tokenParts = data.token.split(".");
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log("Payload JWT:", payload);

    // Guardar datos del usuario logueado
    localStorage.setItem("usuarioLogueado", JSON.stringify({
      name: data.name,
      userName: payload.sub,
      role: payload.role
    }));

    // Mostrar SweetAlert y redirigir cuando termine
    Swal.fire({
      icon: "success",
      title: "Inicio de sesión exitoso",
      showConfirmButton: false,
      timer: 1500
    }).then(() => {
      if (payload.role === "ROLE_ADMIN") {
        window.location.href = "../pages/admin.html";
      } else {
        window.location.href = "../pages/catalog.html";
      }
    });

    loginForm.reset();

  } else {
    const errText = await res.text();
    Swal.fire({
      icon: "error",
      title: "Error al iniciar sesión",
      text: errText || "Usuario o contraseña incorrectos"
    });
  }

} catch (error) {
  console.error("Error:", error);
  Swal.fire({
    icon: "error",
    title: "Error de conexión",
    text: "No se pudo conectar con el servidor. Intenta nuevamente."
  });
}
});


// ===================== REGISTER =====================
const registerForm = document.getElementById('register-form');
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const userName = document.getElementById('username-register').value;
  const email = document.getElementById('email-register').value;
  const password = document.getElementById('password-register').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  try {
    const res = await fetch("https://8mq33rknsp.us-east-1.awsapprunner.com/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName,
        name: firstName,
        lastName,
        email,
        password
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Cuenta creada con éxito.");
      registerForm.reset();
      tabLogin.click();
    } else {
      alert(data.message || "Error al crear la cuenta.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error en la conexión con el servidor.");
  }
});
