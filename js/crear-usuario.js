document.addEventListener('DOMContentLoaded', () => {
  
  const btnCreate = document.querySelector('.btn-create');
  const form = document.getElementById('form-usuario');
  const nameUser = document.querySelector('#nombre-usuario');
  const btnLogout = document.querySelector('#btnLogout');

  /* 
    FUNCIONES AUXILIARES
  =============================== */
  const getFormData = () => {
    return {
      rol: document.getElementById('rol-usuario').value.trim(),
      usuario: document.getElementById('nombre-usuario-input').value.trim(),
      contrasena: document.getElementById('contrasena-usuario').value.trim(),
      confirmarContrasena: document.getElementById('confirmar-contrasena').value.trim(),
    };
  };

  const validateForm = ({ rol, usuario, contrasena, confirmarContrasena }) => {
    if (!rol || !usuario || !contrasena || !confirmarContrasena) {
      alert('Por favor, completa todos los campos.');
      return false;
    }
    if (contrasena !== confirmarContrasena) {
      alert('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const createUser = async ({ rol, usuario, contrasena }) => {
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

      if (response.ok) {
        // ✅ Usuario creado con éxito
        alert(data.message);
        console.log('ID nuevo:', data.id);
        location.href = '../listado-usuarios.html';
      } else if (response.status === 409) {
        // ⚠️ Usuario ya existe
        alert('Error: ' + data.message);
      } else {
        // ❌ Otro error de API
        console.error('Error en la API:', data.message);
        alert('Ocurrió un error: ' + data.message);
      }
    } catch (error) {
      console.error('Error en la conexión:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  const getUser = () => {
    const user = JSON.parse(localStorage.getItem('userLogin'));
    if (user && nameUser) {
      nameUser.textContent = user.usuario || user.nombre || '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userLogin');
    location.href = '../login.html';
  };

  /* 
    EVENTOS
  =============================== */
  if (btnCreate) {
    btnCreate.addEventListener('click', async () => {
      const formData = getFormData();
      if (!validateForm(formData)) return;

      await createUser(formData);
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }

  /* 
    INICIALIZACIÓN
  =============================== */
  getUser();
});
