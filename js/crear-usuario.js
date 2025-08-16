document.addEventListener('DOMContentLoaded', () => {
  const btnCreate = document.querySelector('.btn-create');
  const form = document.getElementById('form-usuario');
  const nameUser = document.querySelector('#nombre-usuario');
  const btnLogout = document.querySelector('#btnLogout');

  btnCreate.addEventListener('click', async () => {
    const rol = document.getElementById('rol-usuario').value.trim();
    const usuario = document
      .getElementById('nombre-usuario-input')
      .value.trim();
    const contrasena = document
      .getElementById('contrasena-usuario')
      .value.trim();
    const confirmarContrasena = document
      .getElementById('confirmar-contrasena')
      .value.trim();

    // Validar campos
    if (!rol || !usuario || !contrasena || !confirmarContrasena) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Datos a enviar
    const data = {
      rol: rol,
      usuario: usuario,
      contrasena: contrasena,
    };

    try {
      const response = await fetch(
        'http://localhost/backend-apicrud/index.php?url=usuarios',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rol, usuario, contrasena }),
        }
      );

      const data = await response.json();

      if (response.status === 201 || response.status === 200) {
        // ✅ Usuario creado
        alert(data.message);
        location.href = "../listado-usuarios.html";
        console.log('ID nuevo:', data.id);
      } else if (response.status === 409) {
        // ⚠️ Usuario ya existe
        alert('Error: ' + data.message);
      } else {
        // ❌ Otro error
        console.error('Error en la API:', data.message);
        alert('Ocurrió un error: ' + data.message);
      }
    } catch (error) {
      console.error('Error en la conexión:', error);
      alert('No se pudo conectar con el servidor.');
    }
  });


  const getUser = () => {
    const user = JSON.parse(localStorage.getItem('userLogin'));
    if (user && nameUser) {
      nameUser.textContent = user.usuario || user.nombre || '';
    }
  };

   /* 
    LOGOUT
  =============================== */
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('userLogin');
      location.href = '../login.html';
    });
  }

  getUser()
});
