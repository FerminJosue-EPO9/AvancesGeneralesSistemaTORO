/* ===================================== */
/* BOTONES */
/* ===================================== */

const botonRegresar =
document.querySelector(".boton-regresar");

const botonSiguiente =
document.querySelector(".boton-siguiente");

/* ===================================== */
/* INPUTS */
/* ===================================== */

const titulo =
document.getElementById("tituloActividad");

const fecha =
document.getElementById("fechaVencimiento");

// Establecer fecha mínima (hoy)
const hoy = new Date().toISOString().split("T")[0];
fecha.setAttribute("min", hoy);

const tiempo =
document.getElementById("tiempoLimite");

const intentos =
document.getElementById("intentosMaximos");

const puntos =
document.getElementById("ponderacionPuntos");

titulo.value = "";
fecha.value = "";
tiempo.value = "";
intentos.value = "";
puntos.value = "";

cargarMetricas();

function guardarMetricas() {
    localStorage.setItem("tituloActividad", titulo.value.trim());
    localStorage.setItem("fechaVencimiento", fecha.value);
    localStorage.setItem("tiempoLimite", tiempo.value);
    localStorage.setItem("intentosMaximos", intentos.value);
    localStorage.setItem("ponderacionPuntos", puntos.value);
}

function cargarMetricas() {
    const tituloGuardado = localStorage.getItem("tituloActividad");
    const fechaGuardada = localStorage.getItem("fechaVencimiento");
    const tiempoGuardado = localStorage.getItem("tiempoLimite");
    const intentosGuardados = localStorage.getItem("intentosMaximos");
    const puntosGuardados = localStorage.getItem("ponderacionPuntos");

    if (tituloGuardado || fechaGuardada || tiempoGuardado || intentosGuardados || puntosGuardados) {
        titulo.value = tituloGuardado || "";
        fecha.value = fechaGuardada ||  "";
        tiempo.value = tiempoGuardado || "";
        intentos.value = intentosGuardados || "";
        puntos.value = puntosGuardados || "";
    } else {
        // Si no hay datos, dejamos los campos limpios (fecha en hoy)
        titulo.value = "";
        fecha.value = "";
        tiempo.value = "";
        intentos.value = "";
        puntos.value = "";
    }
}

function borrarMetricas() {
    localStorage.removeItem("tituloActividad");
    localStorage.removeItem("fechaVencimiento");
    localStorage.removeItem("tiempoLimite");
    localStorage.removeItem("intentosMaximos");
    localStorage.removeItem("ponderacionPuntos");
}


function verificarCamposCompletos() {
    if (
        titulo.value.trim() !== "" &&
        fecha.value !== "" &&
        tiempo.value !== "" &&
        intentos.value !== "" &&
        puntos.value !== ""
    ) {
        botonSiguiente.style.backgroundColor = "#171C52";
        botonSiguiente.disabled = false;
    } else {
        botonSiguiente.style.backgroundColor = "#666";
        botonSiguiente.disabled = true;
    }
}

titulo.addEventListener("input", verificarCamposCompletos);
fecha.addEventListener("input", verificarCamposCompletos);
tiempo.addEventListener("input", verificarCamposCompletos);
intentos.addEventListener("input", verificarCamposCompletos);
puntos.addEventListener("input", verificarCamposCompletos);

verificarCamposCompletos();

/* ===================================== */
/* VERIFICAR ACCESO (>=5 preguntas) */
/* ===================================== */
(function verificarAcceso() {
    const datosGuardados = localStorage.getItem("preguntasGuardadas");
    const preguntas = datosGuardados ? JSON.parse(datosGuardados) : [];
    if (preguntas.length < 5) {
        window.location.href = "index.html";
    }
})();

/* ===================================== */
/* FUNCIÓN VERIFICAR DATOS */
/* ===================================== */

function hayDatosEscritos() {

    return (
        titulo.value.trim() !== "" ||
        fecha.value !== "" ||
        tiempo.value !== "" ||
        intentos.value !== "" ||
        puntos.value !== ""
    );

}

/* ===================================== */
/* MODAL CONFIRMACIÓN */
/* ===================================== */

const fondoModal =
document.createElement("div");

fondoModal.classList.add("fondo-modal");

const modal =
document.createElement("div");

modal.classList.add("modal-personalizado");

modal.innerHTML = `

    <p>
        Se eliminará el progreso de la
        configuración de la actividad
    </p>

    <div class="botones-eliminar">

        <button type="button" class="boton-cancelar-eliminar">
            Cancelar
        </button>

        <button type="button" class="boton-confirmar-eliminar">
            Aceptar
        </button>

    </div>

`;

fondoModal.appendChild(modal);

document.querySelector(".formulario-metricas").appendChild(fondoModal);

/* ===================================== */
/* BOTÓN REGRESAR */
/* ===================================== */

botonRegresar.addEventListener("click", () => {

    if (hayDatosEscritos()) {

        fondoModal.classList.add("activo");

    }

    else {

        window.location.href = "index.html";

    }

});

/* ===================================== */
/* BOTÓN CANCELAR */
/* ===================================== */

document
.querySelector(".boton-cancelar-eliminar")
.addEventListener("click", () => {

    fondoModal.classList.remove("activo");

});

/* ===================================== */
/* BOTÓN ACEPTAR */
/* ===================================== */

document
.querySelector(".boton-confirmar-eliminar")
.addEventListener("click", () => {

    borrarMetricas();
    window.location.href = "index.html";

});

/* ===================================== */
/* BOTÓN SIGUIENTE */
/* ===================================== */

botonSiguiente.addEventListener("click", () => {

    if (
        titulo.value.trim() === "" ||
        fecha.value === "" ||
        tiempo.value === "" ||
        intentos.value === "" ||
        puntos.value === ""
    ) {

        alert("Completa todos los campos.");

        return;

    }

    guardarMetricas();
    window.location.href = "finalizar.html";

});