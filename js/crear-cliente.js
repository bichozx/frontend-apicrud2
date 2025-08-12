const nameUser = document.querySelector('#nombre-usuario');
const btnLogout = document.querySelector('#btnLogout');
const btnCreate = document.querySelector('.btn-create');

// Obtener y mostrar el usuario logueado
function getUser() {
  const user = JSON.parse(localStorage.getItem('userLogin'));
  if (user && nameUser) {
    nameUser.textContent = user.usuario || user.nombre || '';
  }
}

// Crear un nuevo cliente
async function createClient() {
  const nuevoCliente = {
    nombre: document.getElementById('nombre-cliente').value.trim(),
    apellido: document.getElementById('apellido-cliente').value.trim(),
    email: document.getElementById('email-cliente').value.trim(),
    celular: document.getElementById('celular-cliente').value.trim(),
    direccion: document.getElementById('direccion-cliente').value.trim(),
    direccion2: document.getElementById('direccion2-cliente').value.trim(),
    descripcion: document.getElementById('descripcion-cliente').value.trim(),
  };

  try {
    const res = await fetch('http://localhost/backend-apicrud/index.php?url=clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCliente),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Error al crear cliente');

    // Limpiar formulario
    document.getElementById('form-cliente').reset();

    alert('Cliente creado correctamente ✅');
    location.href = '../listado-clientes.html';

  } catch (error) {
    console.error('Error creando cliente:', error);
    alert('❌ ' + error.message);
  }
}


// Eventos
// ========================

// Botón logout
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    localStorage.removeItem('userLogin');
    location.href = '../login.html';
  });
}

// Botón crear cliente
if (btnCreate) {
  btnCreate.addEventListener('click', createClient);
}


// Inicialización
// ========================
getUser();
