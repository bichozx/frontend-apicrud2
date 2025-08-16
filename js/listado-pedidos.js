document.addEventListener('DOMContentLoaded', () => {
  
   
  const tablePedidos = document.querySelector('#table-pedidos > tbody');
  const nameUser = document.querySelector('#nombre-usuario');
  const btnLogout = document.querySelector('#btnLogout');
  const searchInput = document.querySelector('#search-input');

  
  let pedidos = [];
  let pedidoActual = null;

  /* ===============================
        FUNCIONES AUXILIARES
  =============================== */

  // Mostrar usuario logueado
  const getUser = () => {
    const user = JSON.parse(localStorage.getItem('userLogin'));
    if (user && nameUser) {
      nameUser.textContent = user.usuario || user.nombre || '';
    }
  };

  // Renderizar tabla
  const renderTable = (data) => {
    tablePedidos.innerHTML = '';
    data.forEach((dato, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${dato.nombre}</td>
        <td>
          <span class="badge ${
            dato.metodo_pago === 'PSE'
              ? 'badge-success'
              : dato.metodo_pago === 'Transferencia'
              ? 'badge-primary'
              : 'badge-warning'
          }">
            ${dato.metodo_pago ?? ''}
          </span>
        </td>
        <td>${dato.descuento}</td>
        <td>${dato.aumento}</td>
        <td>${dato.fecha}</td>
        <td>
          <button class="btn btn-sm btn-warning btn-edit" data-id="${dato.id || dato.id_cliente}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${dato.id || dato.id_cliente}">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-sm btn-info btn-view" data-id="${dato.id || dato.id_cliente}">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      `;
      tablePedidos.appendChild(row);
    });
  };

  // Buscar pedidos
  const searchProductTable = () => {
    const textSearch = (searchInput.value || '').trim().toLowerCase();
    if (textSearch === '') {
      renderTable(pedidos);
      return;
    }
    const filtrados = pedidos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(textSearch) ||
        p.metodo_pago.toLowerCase().includes(textSearch)
    );
    renderTable(filtrados);
  };

  // Obtener pedidos
  const getPedidos = async () => {
    try {
      const res = await fetch(
        'http://localhost/backend-apicrud/index.php?url=pedidos',
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      if (res.status === 204) {
        console.log('No hay datos en la BD');
        return;
      }

      const data = await res.json();
      pedidos = data;
      localStorage.setItem('datosTablaPedidos', JSON.stringify(data));
      renderTable(data);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    }
  };

  // Obtener pedido por ID
  const fetchPedidoPorId = async (id) => {
    try {
      const res = await fetch(
        `http://localhost/backend-apicrud/index.php?url=pedidos&id=${id}`
      );
      if (!res.ok) throw new Error(`Error al obtener pedido ${id}`);
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  /* ===============================
        MODALES
  =============================== */

  // Ver pedido
  window.verPedido = async (id) => {
    const pedido = await fetchPedidoPorId(id);
    if (!pedido) return;
    pedidoActual = pedido;

    document.getElementById('modal-pedido-numero').textContent = pedido.id;
    document.getElementById('modal-cliente-nombre').textContent = pedido.nombre || '';
    document.getElementById('modal-cliente-email').textContent = pedido.email || '';
    document.getElementById('modal-metodo-pago').textContent = pedido.metodo_pago || '';
    document.getElementById('modal-fecha').textContent = pedido.fecha ? new Date(pedido.fecha).toLocaleString() : '';
    document.getElementById('modal-descuento').textContent = `$${(pedido.descuento || 0).toLocaleString()}`;
    document.getElementById('modal-aumento').textContent = `$${(pedido.aumento || 0).toLocaleString()}`;

    // Productos
    const productosLista = document.getElementById('modal-productos-lista');
    productosLista.innerHTML = '';
    let total = 0;

    if (Array.isArray(pedido.detalles)) {
      pedido.detalles.forEach((producto) => {
        
        const precio = producto.precio || 0;
        const cantidad = producto.cantidad || 0;
        const subtotal = producto.subtotal || precio * cantidad;
        total += subtotal;

        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${producto.producto_nombre || ''}</td>
          <td>$${precio.toLocaleString()}</td>
          <td>${cantidad}</td>
          <td>$${subtotal.toLocaleString()}</td>
        `;
        productosLista.appendChild(fila);
      });
    }

    const totalFinal = total - (pedido.descuento || 0) + (pedido.aumento || 0);
    document.getElementById('modal-total-pedido').textContent = `$${totalFinal.toLocaleString()}`;

    $('#verPedidoModal').modal('show');
  };

  // Editar pedido
  window.editarPedido = () => {
    if (!pedidoActual) return;

    document.getElementById('editar-pedido-numero').textContent = pedidoActual.id;
    document.getElementById('editar-cliente-id').value = pedidoActual.id_cliente;
    document.getElementById('editar-cliente-nombre').value = pedidoActual.nombre || '';
    document.getElementById('editar-cliente-email').value = pedidoActual.email || '';
    document.getElementById('editar-cliente-fecha').value = pedidoActual.fecha || '';
    document.getElementById('editar-metodo-pago').value = pedidoActual.metodo_pago || '';
    document.getElementById('editar-descuento').value = pedidoActual.descuento || 0;
    document.getElementById('editar-aumento').value = pedidoActual.aumento || 0;

    const lista = document.getElementById('editar-productos-lista');
    lista.innerHTML = '';

    if (Array.isArray(pedidoActual.detalles)) {
      pedidoActual.detalles.forEach((prod, index) => {
        console.log('🚀 ~ prod:', prod)
        const precio = prod.precio || 0;
        const cantidad = prod.cantidad || 1;
        const subtotal = precio * cantidad;

        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${prod.producto_nombre || ''}</td>
          <td><input type="number" class="form-control" value="${precio}" disabled></td>
          <td><input type="number" class="form-control" value="${cantidad}" disabled></td>
          <td><input type="number" class="form-control" value="${subtotal}" disabled></td>
        `;
        lista.appendChild(fila);
      });
    }

    $('#verPedidoModal').modal('hide');
    $('#editarPedidoModal').modal('show');
  };

  // Guardar pedido
  window.guardarPedido = async () => {
    const data = {
      id: pedidoActual.id,
      id_cliente: pedidoActual.id_cliente,
      descuento: parseFloat(document.getElementById('editar-descuento').value) || 0,
      metodo_pago: document.getElementById('editar-metodo-pago').value,
      aumento: parseFloat(document.getElementById('editar-aumento').value) || 0,
    };

    try {
      const res = await fetch(`http://localhost/backend-apicrud/index.php?url=pedidos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al guardar');

      alert('Pedido actualizado con éxito');
      getPedidos();
      $('#editarPedidoModal').modal('hide');
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar el pedido');
    }
  };

  // Eliminar pedido
  window.eliminarPedido = (id) => {
    document.getElementById('delete-eliminarPedido-id').value = id;
    $('#eliminarPedidoModal').modal('show');
  };

  document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'confirmarEliminar-pedido') {
      const id = document.getElementById('delete-eliminarPedido-id').value;
      try {
        const res = await fetch(`http://localhost/backend-apicrud/index.php?url=pedidos`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          if (errorText.includes('foreign key')) {
            alert('⚠ No se puede eliminar: El pedido está vinculado a un cliente.');
          } else {
            alert('❌ Error al eliminar el pedido.');
          }
          throw new Error(errorText);
        }

        $('#eliminarPedidoModal').modal('hide');
        alert('✅ Pedido eliminado correctamente');
        getPedidos();
      } catch (error) {
        console.error('Error eliminando pedido:', error);
      }
    }
  });

  /* ===============================
        EVENTOS PRINCIPALES
  =============================== */
  searchInput.addEventListener('input', searchProductTable);
  searchInput.addEventListener('keyup', searchProductTable);

  tablePedidos.addEventListener('click', (e) => {
    const verBtn = e.target.closest('.btn-view');
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (verBtn) verPedido(verBtn.dataset.id);
    if (editBtn) fetchPedidoPorId(editBtn.dataset.id).then((p) => { pedidoActual = p; editarPedido(); });
    if (deleteBtn) eliminarPedido(deleteBtn.dataset.id);
  });

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('userLogin');
      location.href = '../login.html';
    });
  }

  /* ===============================
        INICIALIZACIÓN
  =============================== */
  getUser();
  getPedidos();
});

