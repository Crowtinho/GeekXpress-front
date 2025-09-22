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

// LOGIN
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const userName = document.getElementById('username-login').value;
  const password = document.getElementById('password').value;

try {
  const res = await fetch("http://localhost:8080/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password })
  });

  if (res.ok) {
    // Parseamos el JSON que devuelve el backend
    const data = await res.json();

    alert("Inicio de sesión exitoso.");

    // Guardar token y id en localStorage
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("userId", data.id);

    // Guardar usuario logueado (opcional, para mostrar nombre en UI)
    localStorage.setItem("usuarioLogueado", JSON.stringify({
      userName: data.userName,
      name: data.name,
      lastName: data.lastName,
      email: data.email
    }));

    window.location.href = "../pages/catalog.html";
    loginForm.reset();
  } else {
    const errText = await res.text();
    alert(errText || "Error al iniciar sesión.");
  }
} catch (error) {
  console.error("Error:", error);
  alert("Error en la conexión con el servidor.");
}

});

// REGISTER
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
    const res = await fetch("http://localhost:8080/users/register", {
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