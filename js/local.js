//variables globales de admin
const d = document;
//let nameUser = d.querySelector("#nombre-usuario");
//let btnLogout = d.querySelector("#btnLogout");

let nameUser;
let btnLogout;

d.addEventListener("DOMContentLoaded", () =>{
    //getUser();
    nameUser = d.querySelector("#nombre-usuario");
    btnLogout = d.querySelector("#btnLogout");

    
    getUser();

    //evento para el boton del logout
    btnLogout.addEventListener("click", () => {
        localStorage.removeItem("userLogin");
        location.href = "../login.html";
    });
})

//funcion para poner el nombre del usuario
let getUser = () => {
    let user = JSON.parse(localStorage.getItem("userLogin"));
    
    //nameUser.textContent = user.nombre;
    //console.log(nameUser)
    if (user) {
        nameUser.textContent = user.usuario;
        
    } else {
        console.warn("No hay usuario en localStorage");
    }
};

//evento para el boton del logout
/*btnLogout.addEventListener("click", () =>{
    localStorage.removeItem("userLogin");
    location.href = "../login.html";
});*/

export default getUser;