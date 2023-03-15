let claves = document.querySelectorAll(`.clave`);
let mostrarContraseña = document.querySelector(`.mostrarContraseña`);

mostrarContraseña.addEventListener(`click`, () => {
  for (campo of claves) {
    if (campo.type == "password") {
      mostrarContraseña.innerHTML = "Ocultar contraseña";
      campo.type = "text";
    } else if (campo.type == "text") {
      mostrarContraseña.innerHTML = "Mostrar contraseña";
      campo.type = "password";
    }
  }
});

let form = document.querySelector(`#registerForm`);
let aviso=document.querySelector(`.avisoContraseñas`)
form.addEventListener(`submit`, (e) => {
  if (!(claves[1].value == claves[0].value)) {
    e.preventDefault();
    aviso.style.display="flex"
    return console.log("Las claves no son iguales");
  }
  aviso.style.display="none"
  return console.log("Las claves son iguales")
});
