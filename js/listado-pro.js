
const d = document;

let tablePro      = d.querySelector("#table-pro > tbody");
let searchInput   = d.querySelector("#search-input");
let nameUser      = d.querySelector("#nombre-usuario");
let btnLogout     = d.querySelector("#btnLogout");

let productos     = []; // lista global de productos
let productoIdAEliminar = null;

// Modales Bootstrap
const modalEditar   = new bootstrap.Modal(d.getElementById("modalEditar"));
const modalEliminar = new bootstrap.Modal(d.getElementById("modalEliminar"));

// ======================================================
// FUNCIONES DE USUARIO
// ======================================================
function getUser() {
  let user = JSON.parse(localStorage.getItem("userLogin"));
  if (user) nameUser.textContent = user.usuario;
}

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("userLogin");
  location.href = "../login.html";
});

// ======================================================
// FUNCIONES CRUD
// ======================================================
async function getTableData() {
  let url = "http://localhost/backend-apiCrud/productos";
  try {
    let respuesta = await fetch(url);
    if (respuesta.status === 204) {
      console.log("No hay datos en la BD");
      return;
    }
    productos = await respuesta.json();
    localStorage.setItem("datosTabla", JSON.stringify(productos));
    renderTable(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }
}

async function sendUpdateProduct(product) {
  let url = "http://localhost/backend-apiCrud/productos";
  try {
    let respuesta = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (respuesta.status === 406) {
      alert("Los datos enviados no son admitidos");
      return;
    }

    let mensaje = await respuesta.json();
    alert(mensaje.message);
    location.href = "../listado-pro.html";
  } catch (error) {
    console.error("Error al actualizar producto:", error);
  }
}

async function sendDeleteProduct(id) {
  let url = "http://localhost/backend-apicrud/index.php?url=productos";
  try {
    let respuesta = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    let mensaje = await respuesta.json();
    alert(mensaje.message);
    location.reload();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
  }
}

// ======================================================
// FUNCIONES DE TABLA
// ======================================================
function clearDataTable() {
  d.querySelectorAll("#table-pro > tbody > tr").forEach((row) => row.remove());
}

function renderTable(data) {
  let user    = JSON.parse(localStorage.getItem("userLogin"));
  let isAdmin = user && user.rol === "administrador";

  clearDataTable();
  data.forEach((dato, i) => {
    let row = d.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${dato.nombre}</td>
      <td>${dato.precio}</td>
      <td>${dato.stock}</td>
      <td>${dato.descripcion}</td>
      <td><img src="${dato.imagen}" width="60"></td>
      <td>
        <button class="btn btn-warning btn-sm btn-edit" data-id="${dato.id}">
          <i class="fas fa-edit"></i>
        </button>
        ${isAdmin ? `
          <button class="btn btn-danger btn-sm btn-delete" data-id="${dato.id}">
            <i class="fas fa-trash"></i>
          </button>
        ` : ""}
      </td>
    `;
    tablePro.appendChild(row);
  });
}

function searchProductTable() {
  let textSearch = (searchInput.value || "").toLowerCase();

  if (textSearch === "") {
    renderTable(productos);
    return;
  }

  let filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(textSearch)
  );
  renderTable(filtrados);
}

// ======================================================
// EVENTOS TABLA
// ======================================================
tablePro.addEventListener("click", (e) => {
  const editBtn   = e.target.closest(".btn-edit");
  const deleteBtn = e.target.closest(".btn-delete");

  // EDITAR
  if (editBtn) {
    const id = editBtn.dataset.id;
    const producto = productos.find((p) => p.id == id);
    if (!producto) return;

    d.getElementById("edit-id").value          = producto.id;
    d.getElementById("edit-nombre").value      = producto.nombre;
    d.getElementById("edit-precio").value      = producto.precio;
    d.getElementById("edit-stock").value       = producto.stock;
    d.getElementById("edit-descripcion").value = producto.descripcion;
    d.getElementById("edit-imagen").value      = producto.imagen;

    modalEditar.show();
  }

  // ELIMINAR
  if (deleteBtn) {
    productoIdAEliminar = deleteBtn.dataset.id;
    modalEliminar.show();
  }
});

// Confirmar edición
d.getElementById("btnGuardarCambios").addEventListener("click", () => {
  const updated = {
    id: d.getElementById("edit-id").value,
    nombre: d.getElementById("edit-nombre").value,
    precio: parseFloat(d.getElementById("edit-precio").value) || 0,
    stock: parseInt(d.getElementById("edit-stock").value, 10) || 0,
    descripcion: d.getElementById("edit-descripcion").value,
    imagen: d.getElementById("edit-imagen").value,
  };

  sendUpdateProduct(updated);
  modalEditar.hide();
});

// Confirmar eliminación
d.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
  if (!productoIdAEliminar) return;
  sendDeleteProduct(productoIdAEliminar);
  modalEliminar.hide();
});

// ======================================================
// EVENTOS PRINCIPALES
// ======================================================
searchInput.addEventListener("keyup", searchProductTable);
searchInput.addEventListener("input", searchProductTable);

d.addEventListener("DOMContentLoaded", () => {
  getTableData();
  getUser();
});
