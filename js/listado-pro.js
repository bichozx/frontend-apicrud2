// -------------------- VARIABLES GLOBALES --------------------

const d = document;

let tablePro = document.querySelector("#table-pro > tbody");
let searchInput = document.querySelector("#search-input");
let nameUser = document.querySelector("#nombre-usuario");
let btnLogout = document.querySelector("#btnLogout");
let productos = []; // ← lista global de productos
let productoIdAEliminar = null;

// Modales Bootstrap
const modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'));
const modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));

document.getElementById("btnGuardarCambios").addEventListener("click", () => {
    const updated = {
      id: document.getElementById('edit-id').value,
      nombre: document.getElementById('edit-nombre').value,
      precio: parseFloat(document.getElementById('edit-precio').value) || 0,
      stock: parseInt(document.getElementById('edit-stock').value, 10) || 0,
      descripcion: document.getElementById('edit-descripcion').value,
      imagen: document.getElementById('edit-imagen').value
    };

    sendUpdateProduct(updated);
    modalEditar.hide();
});


// -------------------- CONFIRMAR ELIMINACIÓN --------------------
document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    if (!productoIdAEliminar) return;
    sendDeleteProduct(productoIdAEliminar);
    modalEliminar.hide();
});


// -------------------- FUNCIONES DE USUARIO --------------------
let getUser = () => {
    let user = JSON.parse(localStorage.getItem("userLogin"));
    if (user) nameUser.textContent = user.usuario;
};

btnLogout.addEventListener("click", () => {
    localStorage.removeItem("userLogin");
    location.href = "../login.html";
});

// -------------------- FUNCIONES DE TABLA --------------------
let clearDataTable = () => {
    document.querySelectorAll("#table-pro > tbody > tr").forEach(row => row.remove());
};

let renderTable = (data) => {

    let user = JSON.parse(localStorage.getItem("userLogin"));
    
    let isAdmin  = user && user.rol === "administrador";

    clearDataTable();
    data.forEach((dato, i) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${dato.nombre}</td>
            <td>${dato.precio}</td>
            <td>${dato.stock}</td>
            <td>${dato.descripcion}</td>
            <td><img src="${dato.imagen}" width="60"></td>
            <td>
                <button class="btn btn-warning btn-sm btn-edit" data-id="${dato.id}"><i class="fas fa-edit"></i></button>

                ${isAdmin ? `
                <button class="btn btn-danger btn-sm btn-delete" data-id="${dato.id}"><i class="fas fa-trash"></i></button>` : " "}
            </td>
        `;
        tablePro.appendChild(row);
    });
};

let getTableData = async () => {
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
        console.error(error);
    }
};

// -------------------- EVENTOS TABLA --------------------
tablePro.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    // EDITAR
    if (editBtn) {
        const id = editBtn.dataset.id;
        const producto = productos.find(p => p.id == id);
        if (!producto) return;

        document.getElementById('edit-id').value = producto.id;
        document.getElementById('edit-nombre').value = producto.nombre;
        document.getElementById('edit-precio').value = producto.precio;
        document.getElementById('edit-stock').value = producto.stock;
        document.getElementById('edit-descripcion').value = producto.descripcion;
        document.getElementById('edit-imagen').value = producto.imagen;

        modalEditar.show();
    }

    // ELIMINAR
    if (deleteBtn) {
        productoIdAEliminar = deleteBtn.dataset.id;
        modalEliminar.show();
    }
});

// -------------------- FUNCIONES CRUD --------------------
let sendDeleteProduct = async (id) => {
    let url = "http://localhost/backend-apicrud/index.php?url=productos";
    try {
        let respuesta = await fetch(url, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        let mensaje = await respuesta.json();
        alert(mensaje.message);
        location.reload();
    } catch (error) {
        console.error(error);
    }
};

// -------------------- BUSCAR PRODUCTOS --------------------
let searchProductTable = () => {
    let textSearch = (searchInput.value || '').toLowerCase();

    if (textSearch === '') {
    renderTable(productos);
    return;
  }

    let filtrados = productos.filter
    (p => p.nombre.toLowerCase().includes(textSearch));
    renderTable(filtrados);
};

// -------------------- EVENTOS PRINCIPALES --------------------
searchInput.addEventListener("keyup", searchProductTable);
searchInput.addEventListener('input', searchProductTable);

document.addEventListener("DOMContentLoaded", () => {
    getTableData();
    getUser();
});

// Lógica para modo edición: llenar campos y preparar botón Guardar
function updateDataProduct() {
  if (!productUpdate) return;

  // llenar campos
  nameInput.value = productUpdate.nombre ?? "";
  precioInput.value = productUpdate.precio ?? "";
  stockInput.value = productUpdate.stock ?? "";
  descripcionInput.value = productUpdate.descripcion ?? "";
  if (productUpdate.imagen) imagen.src = productUpdate.imagen;

  // alternar botones
  btnCreate.classList.add("d-none");
  btnUpdate.classList.remove("d-none");

  // evitar añadir múltiples listeners si ya existe (protección)
  btnUpdate.replaceWith(btnUpdate.cloneNode(true));
  btnUpdate = d.querySelector('.btn-update');

  // listener para guardar cambios
  btnUpdate.addEventListener("click", (e) => {
    e.preventDefault();
    // construir objeto actualizado
    const updated = {
      id: productUpdate.id, // importante para el backend
      nombre: nameInput.value,
      descripcion: descripcionInput.value,
      precio: parseFloat(precioInput.value) || 0,
      stock: parseInt(stockInput.value, 10) || 0,
      imagen: imagen.src || ""
    };
    // borrar productEdit y enviar actualización
    localStorage.removeItem("productEdit");
    sendUpdateProduct(updated);
  });
}

//funcion para realizar la peticion al servidor
let sendUpdateProduct = async ( pro )=>{
    let url = "http://localhost/backend-apiCrud/productos";
    try {
        let respuesta = await fetch(url,{
            method: "PUT",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(pro)
        });
        if (respuesta.status === 406) {
            alert("Los datos enviados no son admitidos");
        }else{
            let mensaje = await respuesta.json();
            alert(mensaje.message);
            location.href = "../listado-pro.html";
        }
    } catch (error) {
        console.log(error);
    }
}