import obtenerUsuario from "./local.js";

const d = document;

// Inputs del formulario
const nameInput        = d.querySelector("#nombre-pro");
const priceInput       = d.querySelector("#precio-pro");
const stockInput       = d.querySelector("#stock-pro");
const descripcionInput = d.querySelector("#des-pro");
const imagenInput      = d.querySelector("#url-imagen-pro");
const imagen           = d.querySelector("#imagen-pro");

// Botones y usuario
const btnCreate  = d.querySelector(".btn-create");
const btnLogout  = d.querySelector("#btnLogout");
const nameUser   = d.querySelector("#nombre-usuario");

let productUpdate = null;

// ==============================
// Eventos Principales
// ==============================
d.addEventListener("DOMContentLoaded", () => {
    obtenerUsuario();

    // Si hay producto en edición lo cargamos
    productUpdate = JSON.parse(localStorage.getItem("productEdit"));
    if (productUpdate) {
        updateDataProduct();
    }
});

// Crear producto
btnCreate.addEventListener("click", () => {
    const dataProduct = getDataProduct();
    if (dataProduct) {
        sendDataProduct(dataProduct);
    }
});

// ==============================
// Funciones Auxiliares
// ==============================

/**
 * Obtener datos del formulario y validarlos
 */
function getDataProduct() {
    if (
        nameInput.value &&
        priceInput.value &&
        stockInput.value &&
        descripcionInput.value &&
        imagenInput.value
    ) {
        const product = {
            nombre:      nameInput.value.trim(),
            descripcion: descripcionInput.value.trim(),
            precio:      parseFloat(priceInput.value),
            stock:       parseInt(stockInput.value),
            imagen:      imagenInput.value.trim(),
        };

        clearForm();
        console.log("Producto listo para enviar:", product);
        return product;
    } else {
        alert("Todos los campos son obligatorios");
        return null;
    }
}

/**
 * Limpiar los campos del formulario
 */
function clearForm() {
    nameInput.value        = "";
    priceInput.value       = "";
    stockInput.value       = "";
    descripcionInput.value = "";
    imagenInput.value      = "";
    imagen.src             = "";
}

/**
 * Enviar datos de producto al servidor (CREAR)
 */
async function sendDataProduct(data) {
    const url = "http://localhost/backend-apiCrud/productos";
    try {
        const respuesta = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (respuesta.status === 406) {
            alert("Los datos enviados no son admitidos");
            return;
        }

        const mensaje = await respuesta.json();
        alert(mensaje.message);
        location.href = "../listado-pro.html";
    } catch (error) {
        console.error("Error al crear producto:", error);
    }
}

/**
 * Rellenar el formulario con datos de un producto en edición
 */
function updateDataProduct() {
    // Cargar datos en el formulario
    nameInput.value        = productUpdate.nombre;
    priceInput.value       = productUpdate.precio;
    stockInput.value       = productUpdate.stock;
    descripcionInput.value = productUpdate.descripcion;
    imagen.src             = productUpdate.imagen;

    // Alternar botones
    const btnEdit = d.querySelector(".btn-update");
    btnCreate.classList.add("d-none");
    btnEdit.classList.remove("d-none");

    // Evento para editar producto
    btnEdit.addEventListener("click", () => {
        const product = {
            id:          productUpdate.id,
            nombre:      nameInput.value.trim(),
            descripcion: descripcionInput.value.trim(),
            precio:      parseFloat(priceInput.value),
            stock:       parseInt(stockInput.value),
            imagen:      imagen.src,
        };

        localStorage.removeItem("productEdit");
        sendUpdateProduct(product);
    });
}

/**
 * Enviar actualización de producto al servidor (EDITAR)
 */
async function sendUpdateProduct(product) {
    const url = "http://localhost/backend-apiCrud/productos";
    try {
        const respuesta = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
        });

        if (respuesta.status === 406) {
            alert("Los datos enviados no son admitidos");
            return;
        }

        const mensaje = await respuesta.json();
        alert(mensaje.message);
        location.href = "../listado-pro.html";
    } catch (error) {
        console.error("Error al actualizar producto:", error);
    }
}

