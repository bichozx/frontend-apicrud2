document.addEventListener('DOMContentLoaded', () => {
  const tablePedidos = document.querySelector('#table-pedidos > tbody');
  const nameUser = document.querySelector('#nombre-usuario');
  const btnLogout = document.querySelector('#btnLogout');
  const searchInput = document.querySelector('#search-input');
  

  /* VARIABLES GLOBALES
  =============================== */
  let pedidos = [];
  let pedidoActual = null;


// -------------------- BUSCAR PRODUCTOS --------------------
let searchProductTable = () => {
    let textSearch = (searchInput.value || '').toLowerCase();

    if (textSearch === '') {
    renderTable(pedidos);
    return;
  }

    let filtrados = pedidos.filter
    (p => p.nombre.toLowerCase().includes(textSearch) || p.metodo_pago.toLowerCase().includes(textSearch));
    renderTable(filtrados);
};

// -------------------- EVENTOS PRINCIPALES --------------------
searchInput.addEventListener("keyup", searchProductTable);
searchInput.addEventListener('input', searchProductTable);

document.addEventListener("DOMContentLoaded", () => {
    getTableData();
    getUser();
});
  
  /* 
    MODALES BOOTSTRAP
  =============================== */
  const editarPedidoModal = new bootstrap.Modal(
    document.getElementById('editarPedidoModal')
  );
  const eliminarPedidoModal = new bootstrap.Modal(
    document.getElementById('eliminarPedidoModal')
  );
  const verPedidoModal = new bootstrap.Modal(
    document.getElementById('verPedidoModal')
  );

  /* 
    FUNCIONES AUXILIARES
  =============================== */

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

  // Mostrar nombre usuario
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
        
          <button class="btn btn-sm btn-warning btn-edit" data-id="${
            dato.id || dato.id_cliente
          }">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${
            dato.id || dato.id_cliente
          }">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-sm btn-info btn-view" data-id="${
            dato.id || dato.id_cliente
          }">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      `;
      tablePedidos.appendChild(row);
    });
  };

  // Obtener lista de clientes
  const getPedidos = async () => {
    try {
      const res = await fetch(
        'http://localhost/backend-apicrud/index.php?url=pedidos',
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
      pedidos = data;
      console.log('🚀 ~ getPedidos ~ pedidos:', pedidos)
      localStorage.setItem('datosTablaPedidos', JSON.stringify(data));
      renderTable(data);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    }
  };

  /* ===============================
      FUNCIONES DE MODALES
  =============================== */


  // Ver pedido
window.verPedido = async (id) => {
  const pedido = await fetchPedidoPorId(id);
  console.log('🚀 ~ pedido:', pedido)
  console.log('Detalles del pedido:', pedido.detalles);
  console.log('🚀 ~ pedido:', pedido);

  if (!pedido) return;
  pedidoActual = pedido; // ✅ CORREGIDO

   document.getElementById('modal-pedido-numero').textContent = pedido.id;
 

  // Poblar información básica
  document.getElementById('modal-pedido-numero').textContent = pedido.id;
  document.getElementById('modal-cliente-nombre').textContent = pedido.nombre || '';
  document.getElementById('modal-cliente-email').textContent = pedido.email || '';
  document.getElementById('modal-metodo-pago').textContent = pedido.metodo_pago || '';
  document.getElementById('modal-fecha').textContent = pedido.fecha ? new Date(pedido.fecha).toLocaleString() : '';

  document.getElementById('modal-descuento').textContent = `$${(pedido.descuento || 0).toLocaleString()}`;
  document.getElementById('modal-aumento').textContent = `$${(pedido.aumento || 0).toLocaleString()}`;

  // Cargar productos
  const productosLista = document.getElementById('modal-productos-lista');
  productosLista.innerHTML = '';
  let total = 0;

  if (Array.isArray(pedido.detalles)) {
    pedido.detalles.forEach((producto) => {
      const precio = producto.precio || 0;
      const cantidad = producto.cantidad || 0;
      const subtotal = producto.subtotal || (precio * cantidad);

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${producto.nombre || ''}</td>
        <td>$${precio.toLocaleString()}</td>
        <td>${cantidad}</td>
        <td>$${subtotal.toLocaleString()}</td>
      `;
      productosLista.appendChild(fila);
      total += subtotal;
    });
  }

  // Calcular total final
  const totalFinal = total - (pedido.descuento || 0) + (pedido.aumento || 0);
  document.getElementById('modal-total-pedido').textContent = `$${totalFinal.toLocaleString()}`;

  // Mostrar modal
  $('#verPedidoModal').modal('show');
};


// Editar pedido
window.editarPedido = () => {
  if (!pedidoActual || !pedidoActual.id_cliente) return;

  // Info básica
  document.getElementById('editar-pedido-numero').textContent = pedidoActual.id;
  document.getElementById('editar-cliente-id').value = pedidoActual.id_cliente;
  document.getElementById('editar-cliente-nombre').value = pedidoActual.nombre || '';

  document.getElementById('editar-cliente-email').value = pedidoActual.email || '';

  document.getElementById('editar-cliente-fecha').value = pedidoActual.fecha || '';

  document.getElementById('editar-metodo-pago').value = pedidoActual.metodo_pago || '';
  document.getElementById('editar-descuento').value = pedidoActual.descuento || 0;
  document.getElementById('editar-aumento').value = pedidoActual.aumento || 0;

  // Productos
  const lista = document.getElementById('editar-productos-lista');
  lista.innerHTML = '';

  if (Array.isArray(pedidoActual.detalles)) {
    pedidoActual.detalles.forEach((prod, index) => {
      const precio = prod.precio || 0;
      const cantidad = prod.cantidad || 1;
      const subtotal = precio * cantidad;

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${prod.nombre || ''}</td>
        <td><input type="number" class="form-control" value="${precio}" disabled
            oninput="actualizarSubtotal(${index})" id="editar-precio-${index}"></td>
        <td><input type="number" class="form-control" value="${cantidad}" disabled
            oninput="actualizarSubtotal(${index})" id="editar-cantidad-${index}"></td>
        <td id="editar-subtotal-${index}"><input type="number" class="form-control" value="${subtotal.toLocaleString() }" disabled
        </td>
      `;
      lista.appendChild(fila);
    });
  }

  recalcularTotalEditar();

  $('#verPedidoModal').modal('hide');
  $('#editarPedidoModal').modal('show');
};

// Recalcular subtotal y total
window.actualizarSubtotal = (index) => {
  const precio = parseFloat(document.getElementById(`editar-precio-${index}`).value) || 0;
  const cantidad = parseInt(document.getElementById(`editar-cantidad-${index}`).value) || 0;
  const subtotal = precio * cantidad;

  document.getElementById(`editar-subtotal-${index}`).textContent = `$${subtotal.toLocaleString()}`;

  // Actualizar en pedidoActual
  pedidoActual.detalles[index].precio = precio;
  pedidoActual.detalles[index].cantidad = cantidad;
  pedidoActual.detalles[index].subtotal = subtotal;

  recalcularTotalEditar();
};

// Calcular total final
function recalcularTotalEditar() {
  let total = 0;
  if (Array.isArray(pedidoActual.detalles)) {
    pedidoActual.detalles.forEach(prod => {
      total += prod.subtotal || (prod.precio * prod.cantidad);
    });
  }

  const descuento = parseFloat(document.getElementById('editar-descuento').value) || 0;
  const aumento = parseFloat(document.getElementById('editar-aumento').value) || 0;

  const totalFinal = total - descuento + aumento;
  document.getElementById('editar-total-pedido').textContent = `$${totalFinal.toLocaleString()}`;
}

window.guardarPedido = async () => {
  // Aquí envías pedidoActual modificado al servidor
   const data = {
    id: pedidoActual.id,
    id_cliente: pedidoActual.id_cliente,
    descuento: parseFloat(document.getElementById('editar-descuento').value) || 0,
    metodo_pago: document.getElementById('editar-metodo-pago').value,
    aumento: parseFloat(document.getElementById('editar-aumento').value) || 0
  };
  console.log("Pedido a guardar:", pedidoActual);

  try {
    const res = await fetch(`http://localhost/backend-apicrud/index.php?url=pedidos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('🚀 ~ res:', res)

    if (!res.ok) throw new Error("Error al guardar");

    alert("Pedido actualizado con éxito");
    getPedidos();
    $('#editarPedidoModal').modal('hide');
    // Recargar listado o refrescar pedido
  } catch (error) {
    console.error(error);
    alert("Hubo un error al guardar el pedido");
  }
};


// Eliminar 
 // Abrir modal de eliminación de pedido
// window.eliminarPedido = (id) => {
//   console.log('🚀 ~ id:', id)
//   document.getElementById('delete-eliminarPedido-id').value =id;
//   $('#eliminarPedidoModal').modal('show'); // Si usas Bootstrap
// };

// // Esperar a que cargue el DOM antes de asignar eventos
// document.addEventListener('DOMContentLoaded', () => {
//   const btnEliminar = document.getElementById('confirmarEliminar-pedido');
//   //if (!btnEliminar) return; // Evita error si no existe
//   if (!btnEliminar) {
//     console.warn("❌ Botón de confirmar eliminar no encontrado");
//     return;
//   }

//   btnEliminar.addEventListener('click', async () => {
//     console.log("✅ Click detectado en botón 'Eliminar'");
//     const id = document.getElementById('confirmarEliminar-pedido').value;

//     try {
//       const res = await fetch(`http://localhost/backend-apicrud/index.php?url=pedidos`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id: id }),
//       });
//         console.log('🚀 ~ res.body:', res.body)

//       if (!res.ok) {
//         const errorText = await res.text();

//         // Detectar si hay restricción por FK u otro motivo
//         if (errorText.includes("foreign key") || errorText.includes("cliente")) {
//           alert("⚠ No se puede eliminar: El pedido está vinculado a un cliente.");
//         } else {
//           alert("❌ Error al eliminar el pedido.");
//         }
//         throw new Error(errorText);
//       }

//       $('#eliminarPedidoModal').modal('hide');
//       alert('✅ Pedido eliminado correctamente');
//       getPedidos(); // Refrescar listado
//     } catch (error) {
//       console.error('Error eliminando pedido:', error);
//     }
//   });
// });

// Abrir modal de eliminación de pedido
window.eliminarPedido = (id) => {
  console.log('🚀 ID a eliminar:', id);
  document.getElementById('delete-eliminarPedido-id').value = id;
  $('#eliminarPedidoModal').modal('show');
};

// Delegación de eventos: detecta clicks aunque el contenido sea dinámico
document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'confirmarEliminar-pedido') {
    console.log("✅ Click detectado en botón 'Eliminar'");

    const id = document.getElementById('delete-eliminarPedido-id').value;
    console.log("📦 ID capturado para eliminar:", id);

    try {
      const res = await fetch(`http://localhost/backend-apicrud/index.php?url=pedidos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (errorText.includes("foreign key") || errorText.includes("cliente")) {
          alert("⚠ No se puede eliminar: El pedido está vinculado a un cliente.");
        } else {
          alert("❌ Error al eliminar el pedido.");
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
    EVENTOS EN LA TABLA
  =============================== */
  tablePedidos.addEventListener('click', (e) => {
    const botonesVer = e.target.closest('.btn-view');
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (botonesVer) verPedido(botonesVer.dataset.id);
    if (editBtn) {
      fetchPedidoPorId(editBtn.dataset.id).then((pedido) => {
        console.log('🚀 ~ pedido:', pedido)
        if (!pedido) return;
        pedidoActual = pedido;
        window.editarPedido();
      });
    }
    if (deleteBtn) eliminarPedido(deleteBtn.dataset.id);
  });

  /* ===============================
    LOGOUT
  =============================== */
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('userLogin');
      location.href = '../login.html';
    });
  }

  /* 
      INICIALIZACIÓN
  =============================== */
  getUser();
  getPedidos();
});
