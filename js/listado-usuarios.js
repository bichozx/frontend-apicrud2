document.addEventListener('DOMContentLoaded', async () => {
  const tableUsuarios = document.querySelector('#table-usuarios > tbody');
  const nameUser = document.querySelector('#nombre-usuario');
  const btnLogout = document.querySelector('#btnLogout');
  const searchInput = document.querySelector('#search-input');

  /* 
      VARIABLES GLOBALES
  =============================== */
  let usuarios = [];
  let usuarioActual = null;

  /* 
    Mostrar nombre usuario
  =============================== */
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


  /* 
    BÚSQUEDA EN LA TABLA
  =============================== */
  const searchClienteTable = () => {
    const textSearch = (searchInput.value || '').trim().toLowerCase();
    console.log('🚀 ~ searchClienteTable ~ textSearch:', textSearch)
    if (textSearch === '') {
      renderTable(usuarios);
      return;
    }

    const filtrados = usuarios.filter(
      (p) =>
        p.usuario.toLowerCase().includes(textSearch) ||
        p.rol.toLowerCase().includes(textSearch)
    );
    renderTable(filtrados);
  };

  searchInput.addEventListener('input', searchClienteTable);
  searchInput.addEventListener('keyup', searchClienteTable);

  /* ✅ Esto hace que si borras con la X del input se recargue la tabla */
  searchInput.addEventListener('search', () => {
    renderTable(usuarios);
  });

  // Renderizar tabla
  //===============================
  const renderTable = (data) => {
    tableUsuarios.innerHTML = '';
    data.forEach((dato, i) => {
      
      // Determinar color del rol
      let rolBadge =dato.rol.toLowerCase() === 'administrador'
          ? 'badge-success'
          :dato.rol.toLowerCase() === 'vendedor'
          ?'badge-warning '
          : 'badge-danger';

      const row = document.createElement('tr');
      row.innerHTML = `
        
        <td>${dato.usuario}</td>
        <td><span class="badge ${rolBadge}">${dato.rol}</span></td>
        <td>
          <button class="btn btn-sm btn-warning btn-edit" data-id="${dato.id}">
                <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${dato.id}">
                <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-sm btn-info btn-view" data-id="${dato.id}">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      `;
      tableUsuarios.appendChild(row);
    });
  };

  // Obtener lista de clientes
  //===============================
  const getUsuarios = async () => {
    try {
      const res = await fetch(
        'http://localhost/backend-apicrud/index.php?url=usuarios',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (res.status === 204) {
        console.log('No hay datos en la BD');
        return;
      }

      const data = await res.json();
      console.log('🚀 ~ getUsuarios ~ data:', data)
      usuarios = data;
      localStorage.setItem('datosTablaUsuario', JSON.stringify(data));
      renderTable(data);
    } catch (error) {
      console.error('Error al obtener Usuario:', error);
    }
  };

    // Obtener pedido por ID
  const fetchUsuarioPorId = async (id) => {
    try {
      const res = await fetch(
        `http://localhost/backend-apicrud/index.php?url=usuarios&id=${id}`
      );
      if (!res.ok) throw new Error(`Error al obtener pedido ${id}`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };


  
  /* ===============================
      FUNCIONES DE MODALES
  =============================== */


  // Ver Usuario
window.verUsuario = async (id) => {
  try {
    const usuario = await fetchUsuarioPorId(id);
    console.log('🚀 ~ usuario:', usuario)
    if (!usuario) return;

    // Datos principales
    document.getElementById('modal-usuario-id').textContent = usuario.id || '';
    document.getElementById('modal-usuario-nombre').textContent = usuario.usuario || usuario.nombre || '';
    
    document.getElementById('modal-usuario-rol').textContent = usuario.rol || '';

    

    // Mostrar modal
    $('#verUsuarioModal').modal('show');
  } catch (error) {
    console.error("Error al obtener usuario:", error);
  }
};


  // Ver Usuario
window.verUsuario = async (id) => {
  try {
    const usuario = await fetchUsuarioPorId(id);
    console.log('🚀 ~ usuario:', usuario)
    if (!usuario) return;

    // Guardar usuario global
    usuarioActual = usuario;
    console.log('🚀 ~ usuarioActual:', usuarioActual)

    // Datos principales
    document.getElementById('modal-usuario-id').textContent = usuario.id || '';
    document.getElementById('modal-usuario-nombre').textContent = usuario.usuario || usuario.nombre || '';
    
    document.getElementById('modal-usuario-rol').textContent = usuario.rol || '';

    // Mostrar modal
    $('#verUsuarioModal').modal('show');
  } catch (error) {
    console.error("Error al obtener usuario:", error);
  }
};

// Editar usuario
window.editarUsuario = () => {
  if (!usuarioActual || !usuarioActual.id) return;

  document.getElementById('editar-usuario-id').value = usuarioActual.id;
  document.getElementById('editar-usuario-nombre').value = usuarioActual.usuario;
  document.getElementById('editar-usuario-rol').value = usuarioActual.rol;

  $('#verUsuarioModal').modal('hide');
  $('#editarUsuarioModal').modal('show');
};

// Guardar cambios
document.getElementById('btnGuardarCambios').addEventListener('click', async () => {
  const updated = {
    id: document.getElementById('editar-usuario-id').value,
    usuario: document.getElementById('editar-usuario-nombre').value || '',
    rol: document.getElementById('editar-usuario-rol').value || ''
  };

  await fetch(`http://localhost/backend-apicrud/index.php?url=usuarios`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated),
  });

    alert("Usuario actualizado con éxito");

  $('#editarUsuarioModal').modal('hide');
  getUsuarios();
});


 

// Función global para confirmar eliminación de usuario
window.confirmarEliminarUsuario = async () => {
  const id = document.getElementById('eliminar-usuario-id').value;

  if (!id) {
    alert("Error: no se encontró el ID del usuario.");
    return;
  }

  try {
    const res = await fetch(`http://localhost/backend-apicrud/index.php?url=usuarios`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error eliminando usuario:", errorText);
      alert("No se pudo eliminar el usuario");
      return;
    }

    // Cierra el modal
    $('#eliminarUsuarioModal').modal('hide');

    alert('✅ Usuario eliminado correctamente');
    
    // Refresca la tabla
    getUsuarios();

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    alert('Ocurrió un error al intentar eliminar el usuario');
  }
};

window.abrirResetearPasswordModal = () => {
  // Obtener datos desde el modal de ver usuario
  const id = document.getElementById('modal-usuario-id').textContent.trim();
  const nombre = document.getElementById('modal-usuario-nombre').textContent.trim();

  // Asignarlos al modal de reset
  document.getElementById('resetear-usuario-id').value = id;
  document.getElementById('resetear-usuario-nombre').textContent = nombre;

  console.log("🟡 Preparando reset contraseña para:", { id, nombre });
};



window.confirmarResetearContraseña = async () => {
  const id = document.getElementById('resetear-usuario-id').value;
  const nuevaContrasena = document.getElementById('resetear-usuario-password').value.trim();

  if (!id) {
    alert('No se encontró el usuario');
    return;
  }

  if (!nuevaContrasena) {
    alert('Por favor ingresa una nueva contraseña');
    return;
  }

  try {
    // Buscar el usuario en la lista
    const usuario = usuarios.find(u => u.id == id);

    if (!usuario) {
      alert('Usuario no encontrado');
      return;
    }

    const data = {
      id: parseInt(id),
      rol: usuario.rol,
      usuario: usuario.usuario,
      contrasena: nuevaContrasena
    };

    const resp = await fetch('http://localhost/backend-apicrud/index.php?url=usuarios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!resp.ok) throw new Error('Error en la petición');

    const result = await resp.json();
    console.log('✅ Contraseña reseteada:', result);

    alert(`La contraseña ha sido actualizada con éxito`);

    // 🔹 Ocultar el modal
    $('#resetearPasswordModal').modal('hide');
    $('#verUsuarioModal').modal('hide');

    // 🔹 Limpiar campos
    document.getElementById('resetear-usuario-id').value = '';
    document.getElementById('resetear-usuario-password').value = '';
    document.getElementById('resetear-usuario-nombre').textContent = '';

  } catch (error) {
    console.error('❌ Error al resetear contraseña:', error);
    alert('No se pudo resetear la contraseña.');
  }
};


 /*
    EVENTOS EN LA TABLA
  =============================== */
  tableUsuarios.addEventListener('click', (e) => {
    const botonesVer = e.target.closest('.btn-view');
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (botonesVer) verUsuario(botonesVer.dataset.id);
    if (editBtn) {
       fetchUsuarioPorId(editBtn.dataset.id).then((usuario) => {
        console.log('🚀 ~ usuario:', usuario)
        if (!usuario) return;
        usuarioActual = usuario;
        window.editarUsuario();
      });
    }

    // if (deleteBtn) eliminarUsuario(deleteBtn.dataset.id);
    if (deleteBtn) {
  const id = deleteBtn.dataset.id;
  document.getElementById('eliminar-usuario-id').value = id;
  $('#eliminarUsuarioModal').modal('show');
}
   
  });


  getUser();
  getUsuarios();
});
