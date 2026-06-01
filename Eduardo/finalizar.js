/* ===================================== */
/* BOTONES */
/* ===================================== */

const botonRegresar =
document.querySelector(".boton-regresar");

const botonSiguiente =
document.querySelector(".boton-siguiente");

/* ===================================== */
/* CAMPOS RESUMEN */
/* ===================================== */

const valorTitulo =
document.getElementById("valorTitulo");

const valorFecha =
document.getElementById("valorFecha");

const valorTiempo =
document.getElementById("valorTiempo");

const valorIntentos =
document.getElementById("valorIntentos");

const valorPuntos =
document.getElementById("valorPuntos");

/* ===================================== */
/* VERIFICAR ACCESO */
/* ===================================== */

(function verificarAcceso() {

    const preguntasGuardadas =
    localStorage.getItem("preguntasGuardadas");

    const preguntas =
    preguntasGuardadas
    ? JSON.parse(preguntasGuardadas)
    : [];

    const titulo =
    localStorage.getItem("tituloActividad");

    const fecha =
    localStorage.getItem("fechaVencimiento");

    const tiempo =
    localStorage.getItem("tiempoLimite");

    const intentos =
    localStorage.getItem("intentosMaximos");

    const puntos =
    localStorage.getItem("ponderacionPuntos");

    if (
        preguntas.length < 5 ||
        !titulo ||
        !fecha ||
        !tiempo ||
        !intentos ||
        !puntos
    ) {

        window.location.href = "metricas.html";

    }

})();

/* ===================================== */
/* CARGAR DATOS */
/* ===================================== */

function cargarResumenActividad() {

    const titulo =
    localStorage.getItem("tituloActividad");

    const fecha =
    localStorage.getItem("fechaVencimiento");

    const tiempo =
    localStorage.getItem("tiempoLimite");

    const intentos =
    localStorage.getItem("intentosMaximos");

    const puntos =
    localStorage.getItem("ponderacionPuntos");

    valorTitulo.textContent = titulo;

    valorTiempo.textContent = tiempo;

    valorIntentos.textContent = intentos;

    valorPuntos.textContent = puntos;

    /* ===================================== */
    /* FORMATEAR FECHA */
    /* ===================================== */

    const partesFecha = fecha.split("-");

    const fechaFormateada =
    `${partesFecha[2]} / ${partesFecha[1]} / ${partesFecha[0]}`;

    valorFecha.textContent = fechaFormateada;

}

cargarResumenActividad();

/* ===================================== */
/* BOTÓN REGRESAR */
/* ===================================== */

botonRegresar.addEventListener("click", () => {

    window.location.href = "metricas.html";

});

/* ===================================== */
/* ELEMENTOS */
/* ===================================== */

const mensajeFinal =
document.querySelector(".mensaje-final");

const contenedorDatos =
document.querySelector(".contenedor-datos");

const encabezadoResumen =
document.querySelector(".encabezado-resumen");

const tituloResumen =
document.querySelector(".titulo-resumen");

const botonIrActividades =
document.querySelector(".boton-ir-actividades");

/* ===================================== */
/* BOTÓN SIGUIENTE */
/* ===================================== */

botonSiguiente.addEventListener("click", () => {

    encabezadoResumen.classList.add("oculto");

    contenedorDatos.classList.add("oculto");

    tituloResumen.classList.add("oculto");

    mensajeFinal.classList.remove("oculto");

    document.querySelector(".panel-finalizacion").classList.add("con-mensaje-visible");

    // Deshabilitar visualmente ambos botones con el mismo estilo
    botonSiguiente.disabled = true;
    botonSiguiente.style.backgroundColor = "#666";
    botonSiguiente.style.color = "#ffffff";            // mismo color de texto

    botonRegresar.disabled = true;
    botonRegresar.style.backgroundColor = "#666";
    botonRegresar.style.color = "#ffffff";            // mismo color de texto
    botonRegresar.style.borderColor = "#666";      // opcional: que el borde también se vuelva gris

});

//* ===================================== */
/* BOTÓN IR A ACTIVIDADES */
/* ===================================== */

botonIrActividades.addEventListener("click", () => {

    // 1. Enviar datos al servidor (tu compañero insertará aquí su fetch)
    // enviarDatosAlServidor(); // ← descomentar cuando esté listo

    // 2. Limpiar TODOS los datos del localStorage (actividad finalizada)
    localStorage.removeItem("preguntasGuardadas");
    localStorage.removeItem("contadorPreguntas");
    localStorage.removeItem("tituloActividad");
    localStorage.removeItem("fechaVencimiento");
    localStorage.removeItem("tiempoLimite");
    localStorage.removeItem("intentosMaximos");
    localStorage.removeItem("ponderacionPuntos");

    // 3. Redirigir a la lista de actividades del profesor
    window.location.href = "misactividades.html";  // ajusta el nombre si es necesario
});