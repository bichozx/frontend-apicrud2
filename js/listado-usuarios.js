document.addEventListener('DOMContentLoaded', async () => {
  
  const tableUsuarios   = document.querySelector('#table-usuarios > tbody');
  const nameUser        = document.querySelector('#nombre-usuario');
  const btnLogout       = document.querySelector('#btnLogout');
  const searchInput     = document.querySelector('#search-input');

  let usuarios = [];
  let usuarioActual = null;

  /* 
    ===============================
        FUNCIONES DE UTILIDAD
    ===============================
  */
  const getUser = () => {
    const user = JSON.parse(localStorage.getItem('userLogin'));
    if (user && nameUser) {
      nameUser.textContent = user.usuario || user.nombre || '';
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('http://localhost/backend-apicrud/index.php?url=usuarios');
      if (res.status === 204) return console.log('No hay datos en la BD');

      const data = await res.json();
      usuarios = data;
      localStorage.setItem('datosTablaUsuario', JSON.stringify(data));
      renderTable(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const fetchUsuarioPorId = async (id) => {
    try {
      const res = await fetch(`http://localhost/backend-apicrud/index.php?url=usuarios&id=${id}`);
      if (!res.ok) throw new Error(`Error al obtener usuario ${id}`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  /* 
    ===============================
        RENDERIZADO DE TABLA
    ===============================
  */
  const renderTable = (data) => {
    tableUsuarios.innerHTML = '';

    data.forEach((dato) => {
      const rolBadge =
        dato.rol.toLowerCase() === 'administrador'
          ? 'badge-success'
          : dato.rol.toLowerCase() === 'vendedor'
          ? 'badge-warning'
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

  /* 
    ===============================
        BÚSQUEDA EN TABLA
    ===============================
  */
  const searchClienteTable = () => {
    const textSearch = (searchInput.value || '').trim().toLowerCase();
    if (textSearch === '') return renderTable(usuarios);

    const filtrados = usuarios.filter(
      (p) =>
        p.usuario.toLowerCase().includes(textSearch) ||
        p.rol.toLowerCase().includes(textSearch)
    );
    renderTable(filtrados);
  };

  searchInput.addEventListener('input', searchClienteTable);
  searchInput.addEventListener('keyup', searchClienteTable);
  searchInput.addEventListener('search', () => renderTable(usuarios));

  /* 
    ===============================
        MODALES (Ver / Editar / Eliminar / Reset)
    ===============================
  */
  // Ver Usuario
  window.verUsuario = async (id) => {
    try {
      const usuario = await fetchUsuarioPorId(id);
      if (!usuario) return;

      usuarioActual = usuario;

      document.getElementById('modal-usuario-id').textContent = usuario.id || '';
      document.getElementById('modal-usuario-nombre').textContent = usuario.usuario || usuario.nombre || '';
      document.getElementById('modal-usuario-rol').textContent = usuario.rol || '';

      $('#verUsuarioModal').modal('show');
    } catch (error) {
      console.error("Error al obtener usuario:", error);
    }
  };

  // Editar Usuario
  window.editarUsuario = () => {
    if (!usuarioActual || !usuarioActual.id) return;

    document.getElementById('editar-usuario-id').value = usuarioActual.id;
    document.getElementById('editar-usuario-nombre').value = usuarioActual.usuario;
    document.getElementById('editar-usuario-rol').value = usuarioActual.rol;

    $('#verUsuarioModal').modal('hide');
    $('#editarUsuarioModal').modal('show');
  };

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
    fetchUsuarios();
  });

  // Eliminar Usuario
  window.confirmarEliminarUsuario = async () => {
    const id = document.getElementById('eliminar-usuario-id').value;
    if (!id) return alert("Error: no se encontró el ID del usuario.");

    try {
      const res = await fetch(`http://localhost/backend-apicrud/index.php?url=usuarios`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Error eliminando usuario");

      $('#eliminarUsuarioModal').modal('hide');
      alert('✅ Usuario eliminado correctamente');
      fetchUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Ocurrió un error al intentar eliminar el usuario');
    }
  };

  // Resetear Contraseña
  window.abrirResetearPasswordModal = () => {
    const id = document.getElementById('modal-usuario-id').textContent.trim();
    const nombre = document.getElementById('modal-usuario-nombre').textContent.trim();

    document.getElementById('resetear-usuario-id').value = id;
    document.getElementById('resetear-usuario-nombre').textContent = nombre;
  };

  window.confirmarResetearContraseña = async () => {
    const id = document.getElementById('resetear-usuario-id').value;
    const nuevaContrasena = document.getElementById('resetear-usuario-password').value.trim();

    if (!id || !nuevaContrasena) return alert('Completa todos los campos');

    try {
      const usuario = usuarios.find(u => u.id == id);
      if (!usuario) return alert('Usuario no encontrado');

      const data = { id: parseInt(id), rol: usuario.rol, usuario: usuario.usuario, contrasena: nuevaContrasena };

      const resp = await fetch('http://localhost/backend-apicrud/index.php?url=usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!resp.ok) throw new Error('Error en la petición');

      alert('✅ Contraseña reseteada con éxito');

      $('#resetearPasswordModal').modal('hide');
      $('#verUsuarioModal').modal('hide');

      document.getElementById('resetear-usuario-id').value = '';
      document.getElementById('resetear-usuario-password').value = '';
      document.getElementById('resetear-usuario-nombre').textContent = '';
    } catch (error) {
      console.error('❌ Error al resetear contraseña:', error);
      alert('No se pudo resetear la contraseña.');
    }
  };

  /* 
    ===============================
        EVENTOS DE TABLA
    ===============================
  */
  tableUsuarios.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.btn-view');
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (viewBtn) verUsuario(viewBtn.dataset.id);

    if (editBtn) {
      fetchUsuarioPorId(editBtn.dataset.id).then((usuario) => {
        if (!usuario) return;
        usuarioActual = usuario;
        window.editarUsuario();
      });
    }

    if (deleteBtn) {
      document.getElementById('eliminar-usuario-id').value = deleteBtn.dataset.id;
      $('#eliminarUsuarioModal').modal('show');
    }
  });

  /* 
    ===============================
        LOGOUT
    ===============================
  */
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('userLogin');
      location.href = '../login.html';
    });
  }

  /* 
    ===============================
        INICIALIZACIÓN
    ===============================
  */
  getUser();
  fetchUsuarios();
});
