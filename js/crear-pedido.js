document.addEventListener('DOMContentLoaded', async () => {
  
  let productosPedido = [];

  const clienteSelect   = document.getElementById('cliente-select');
  const estado          = document.getElementById('cliente-estado-select');
  const metodoPago      = document.getElementById('metodo-pago');
  const descuento       = document.getElementById('descuento');
  const aumento         = document.getElementById('aumento');
  const productoSelect  = document.getElementById('producto-select');
  const cantidadInput   = document.getElementById('cantidad');
  const btnAgregar      = document.getElementById('btn-agregar-producto');
  const tbodyProductos  = document.getElementById('productos-pedido');
  const totalPedidoEl   = document.getElementById('total-pedido');
  const btnCrearPedido  = document.querySelector('.btn-create');
  const nameUser        = document.querySelector('#nombre-usuario');
  const btnLogout       = document.querySelector('#btnLogout');

  /* ================================
    FUNCIONES AUXILIARES
  ================================ */

  // Mostrar usuario logueado
  function getUser() {
    const user = JSON.parse(localStorage.getItem('userLogin'));
    if (user && nameUser) {
      nameUser.textContent = user.usuario || user.nombre || '';
    }
  }

  // Calcular total del pedido
  function calcularTotal() {
    let total = productosPedido.reduce(
      (sum, p) => sum + p.precio * p.cantidad,
      0
    );
    totalPedidoEl.textContent = total.toLocaleString();
  }

  // Renderizar tabla de productos agregados
  function renderProductos() {
    tbodyProductos.innerHTML = '';
    productosPedido.forEach((p, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nombre}</td>
        <td>$${p.precio.toLocaleString()}</td>
        <td>${p.cantidad}</td>
        <td>$${(p.precio * p.cantidad).toLocaleString()}</td>
        <td><button class="btn btn-danger btn-sm" data-index="${index}">🗑</button></td>
      `;
      tbodyProductos.appendChild(tr);
    });
    calcularTotal();
  }

  /* ================================
    FUNCIONES DE CARGA (API)
  ================================ */

  // Cargar clientes en select
  async function cargarClientes() {
    try {
      const res = await fetch('http://localhost/backend-apicrud/index.php?url=clientes');
      if (!res.ok) throw new Error('Error al obtener clientes');

      const clientes = await res.json();
      clienteSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';
      clientes.forEach((c) => {
        const option = document.createElement('option');
        option.value = c.id_cliente;
        option.textContent = c.nombre;
        clienteSelect.appendChild(option);
      });
    } catch (error) {
      console.error('❌ Error cargando clientes:', error);
      alert('No se pudieron cargar los clientes.');
    }
  }

  // Cargar productos en select
  async function cargarProductos() {
    try {
      const res = await fetch('http://localhost/backend-apicrud/index.php?url=productos');
      if (!res.ok) throw new Error('Error al obtener productos');

      const productos = await res.json();
      productoSelect.innerHTML = '<option value="">Seleccionar Producto</option>';
      productos.forEach((p) => {
        const option = document.createElement('option');
        option.value = p.id;
        option.dataset.precio = p.precio;
        option.textContent = `${p.nombre} - $${p.precio}`;
        productoSelect.appendChild(option);
      });
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      alert('No se pudieron cargar los productos.');
    }
  }

  /* ================================
    EVENTOS
  ================================ */

  // Botón logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('userLogin');
      location.href = '../login.html';
    });
  }

  // Agregar producto al pedido
  btnAgregar.addEventListener('click', () => {
    const idProducto = productoSelect.value;
    const precio = parseFloat(productoSelect.selectedOptions[0]?.dataset.precio || 0);
    const nombre = productoSelect.selectedOptions[0]?.textContent.split(' - ')[0] || '';
    const cantidad = parseInt(cantidadInput.value);

    if (!idProducto || cantidad <= 0) {
      alert('⚠ Selecciona un producto y cantidad válida');
      return;
    }

    const existente = productosPedido.find((p) => p.id_producto == idProducto);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      productosPedido.push({
        id_producto: parseInt(idProducto),
        nombre,
        precio,
        cantidad,
      });
    }

    renderProductos();
    productoSelect.value = '';
    cantidadInput.value = 1;
  });

  // Eliminar producto del pedido
  tbodyProductos.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const index = e.target.dataset.index;
      productosPedido.splice(index, 1);
      renderProductos();
    }
  });

  // Crear pedido
  btnCrearPedido.addEventListener('click', async () => {
    if (!clienteSelect.value) return alert('⚠ Debes seleccionar un cliente');
    if (!metodoPago.value) return alert('⚠ Debes seleccionar un método de pago');
    if (productosPedido.length === 0) return alert('⚠ Debes agregar al menos un producto');

    const pedidoData = {
      id_cliente: parseInt(clienteSelect.value),
      descuento: parseFloat(descuento.value) || 0,
      estado: estado.value,
      metodo_pago: metodoPago.value,
      aumento: parseFloat(aumento.value) || 0,
      productos: productosPedido.map((p) => ({
        id_producto: p.id_producto,
        precio: p.precio,
        cantidad: p.cantidad,
      })),
    };

    console.log('Enviando pedido:', pedidoData);

    try {
      const res = await fetch('http://localhost/backend-apicrud/index.php?url=pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData),
      });

      const text = await res.text();
     //console.log('📥 Respuesta del servidor:', text);

      if (!res.ok) throw new Error(text);

      alert('✅ Pedido creado con éxito');
      window.location.href = 'listado-pedidos.html';
    } catch (error) {
      console.error('❌ Error creando pedido:', error);
      alert('❌ Error al crear el pedido: ' + error.message);
    }
  });

  /* ================================
    INICIALIZACIÓN
  ================================ */
  await cargarClientes();
  await cargarProductos();
  getUser();
});

