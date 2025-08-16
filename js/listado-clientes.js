

document.addEventListener('DOMContentLoaded', () => {
  
  const tablaClientes = document.querySelector('#table-clientes > tbody');
  const nameUser = document.querySelector('#nombre-usuario');
  const btnLogout = document.querySelector('#btnLogout');
  const searchInput = document.querySelector('#search-input');

  let clientes = [];
  let clienteActual = null;

  /* =========================================================
      MODALES BOOTSTRAP
  ========================================================= */
  const editarClienteModal = new bootstrap.Modal(
    document.getElementById('editarClienteModal')
  );
  const eliminarClienteModal = new bootstrap.Modal(
    document.getElementById('eliminarClienteModal')
  );
  const verClienteModal = new bootstrap.Modal(
    document.getElementById('verClienteModal')
  );

  /* =========================================================
      FUNCIONES AUXILIARES
  ========================================================= */
  const fetchClientePorId = async (id) => {
    try {
      const res = await fetch(
        `http://localhost/backend-apicrud/index.php?url=clientes&id=${id}`
      );
      if (!res.ok) throw new Error(`Error al obtener cliente ${id}`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const getUser = () => {
    const user = JSON.parse(localStorage.getItem('userLogin'));
    if (user && nameUser) {
      nameUser.textContent = user.usuario || user.nombre || '';
    }
  };

  const renderTable = (data) => {
    tablaClientes.innerHTML = '';
    data.forEach((dato, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${dato.nombre}</td>
        <td>${dato.apellido}</td>
        <td>${dato.email}</td>
        <td>${dato.celular}</td>
        <td>${dato.direccion}</td>
        <td>
          <button class="btn btn-sm btn-warning btn-edit" data-id="${dato.id_cliente || dato.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${dato.id_cliente || dato.id}">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-sm btn-info btn-view" data-id="${dato.id_cliente || dato.id}">
            <i class="fas fa-eye"></i>
          </button>
        </td>`;
      tablaClientes.appendChild(row);
    });
  };

  const getClients = async () => {
    try {
      const res = await fetch(
        'http://localhost/backend-apicrud/index.php?url=clientes',
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
      clientes = data;
      localStorage.setItem('datosTablaClientes', JSON.stringify(data));
      renderTable(data);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  /* =========================================================
      FUNCIONES DE MODALES
  ========================================================= */
  window.verCliente = async (id) => {
    const cliente = await fetchClientePorId(id);
    if (!cliente) return;

    clienteActual = cliente;
    document.getElementById('modal-nombre-completo').textContent =
      `${cliente.nombre} ${cliente.apellido}` || '';
    document.getElementById('modal-email').textContent = cliente.email || '';
    document.getElementById('modal-celular').textContent = cliente.celular || '';
    document.getElementById('modal-direccion').textContent = cliente.direccion || '';
    document.getElementById('modal-direccion2').textContent = cliente.direccion2 || '';
    document.getElementById('modal-descripcion').textContent = cliente.descripcion || '';

    verClienteModal.show();
  };

  window.editarCliente = () => {
    if (!clienteActual) return;

    document.getElementById('edit-cliente-id').value = clienteActual.id_cliente;
    document.getElementById('edit-cliente-nombre').value = clienteActual.nombre;
    document.getElementById('edit-cliente-apellido').value = clienteActual.apellido;
    document.getElementById('edit-cliente-email').value = clienteActual.email;
    document.getElementById('edit-cliente-celular').value = clienteActual.celular;
    document.getElementById('edit-cliente-direccion').value = clienteActual.direccion;
    document.getElementById('edit-cliente-direccion2').value = clienteActual.direccion2;
    document.getElementById('edit-cliente-descripcion').value = clienteActual.descripcion;

    verClienteModal.hide();
    editarClienteModal.show();
  };

  /* =========================================================
      CRUD CLIENTES
  ========================================================= */
  // Guardar cambios cliente
  document.getElementById('btnGuardarCambios').addEventListener('click', async () => {
    const updated = {
      id: document.getElementById('edit-cliente-id').value,
      nombre: document.getElementById('edit-cliente-nombre').value,
      apellido: document.getElementById('edit-cliente-apellido').value || '',
      email: document.getElementById('edit-cliente-email').value,
      celular: document.getElementById('edit-cliente-celular').value,
      direccion: document.getElementById('edit-cliente-direccion').value,
      direccion2: document.getElementById('edit-cliente-direccion2').value,
      descripcion: document.getElementById('edit-cliente-descripcion').value,
    };

    await fetch(`http://localhost/backend-apicrud/index.php?url=clientes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });

    editarClienteModal.hide();
    getClients();
  });

  // Eliminar cliente
  window.eliminarCliente = (id) => {
    document.getElementById('delete-cliente-id').value = id;
    eliminarClienteModal.show();
  };

  // Confirmar eliminación
  document.getElementById('btnConfirmarEliminar').addEventListener('click', async () => {
    const id_cliente = document.getElementById('delete-cliente-id').value;
    try {
      const res = await fetch(
        `http://localhost/backend-apicrud/index.php?url=clientes`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id_cliente }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        if (errorText.includes('foreign key') || errorText.includes('pedido')) {
          alert('⚠ No se puede eliminar: El cliente tiene pedidos en curso.');
        } else {
          alert('❌ Error al eliminar el cliente.');
        }
        throw new Error(errorText);
      }

      eliminarClienteModal.hide();
      alert('Cliente Eliminado Correctamente');
      getClients();
    } catch (error) {
      console.error('Error eliminando cliente:', error);
    }
  });

  /* =========================================================
      BÚSQUEDA
  ========================================================= */
  const searchClienteTable = () => {
    const textSearch = (searchInput.value || '').trim().toLowerCase();
    if (textSearch === '') {
      renderTable(clientes);
      return;
    }

    const filtrados = clientes.filter(
      (p) =>
        p.nombre.toLowerCase().includes(textSearch) ||
        p.apellido.toLowerCase().includes(textSearch)
    );
    renderTable(filtrados);
  };

  searchInput.addEventListener('input', searchClienteTable);
  searchInput.addEventListener('keyup', searchClienteTable);
  searchInput.addEventListener('search', () => renderTable(clientes));

  /* =========================================================
      EVENTOS EN TABLA
  ========================================================= */
  tablaClientes.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.btn-view');
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (viewBtn) verCliente(viewBtn.dataset.id);
    if (editBtn) {
      fetchClientePorId(editBtn.dataset.id).then((cliente) => {
        if (!cliente) return;
        clienteActual = cliente;
        window.editarCliente();
      });
    }
    if (deleteBtn) eliminarCliente(deleteBtn.dataset.id);
  });

  /* =========================================================
      LOGOUT
  ========================================================= */
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('userLogin');
      location.href = '../login.html';
    });
  }

  /* =========================================================
      INICIALIZACIÓN
  ========================================================= */
  getUser();
  getClients();
});
