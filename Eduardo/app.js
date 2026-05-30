/* ===================================== */
/* SISTEMA EDUCATIVO CBTA */
/* ===================================== */

/* ===================================== */
/* VARIABLES PRINCIPALES */
/* ===================================== */

const botonAgregar = document.getElementById("botonAgregarPregunta");
const contenedorPreguntas = document.getElementById("contenedorPreguntas");
const mensajeVacio = document.querySelector(".mensaje-vacio");
const botonInfo = document.getElementById("botonInfo");
const botonSiguiente = document.querySelector(".boton-siguiente");

let contadorPreguntas = 0;
let preguntaAEliminar = null;
let eliminandoTarjetaNueva = false;


function guardarPreguntasEnLocalStorage() {
    const tarjetas = contenedorPreguntas.querySelectorAll(".tarjeta-pregunta.guardado");
    const datos = [];
    tarjetas.forEach(tarjeta => {
        const texto = tarjeta.querySelector(".texto-pregunta-guardada").textContent;
        const esVerdadero = !tarjeta.querySelector(".contenedor-toggle").classList.contains("estado-falso");
        datos.push({ texto, esVerdadero });
    });
    localStorage.setItem("preguntasGuardadas", JSON.stringify(datos));
    // También guardamos el contador actual
    localStorage.setItem("contadorPreguntas", contadorPreguntas);
}

function cargarPreguntasDesdeLocalStorage() {
    const datosGuardados = localStorage.getItem("preguntasGuardadas");
    if (!datosGuardados) return false;

    const datos = JSON.parse(datosGuardados);
    contadorPreguntas = parseInt(localStorage.getItem("contadorPreguntas")) || 0;

    // Limpiamos el contenedor actual
    contenedorPreguntas.innerHTML = "";

    datos.forEach((item, index) => {
        const numeroPregunta = index + 1;
        const tarjetaPregunta = document.createElement("div");
        tarjetaPregunta.classList.add("tarjeta-pregunta", "guardado");
        tarjetaPregunta.dataset.questionNumber = numeroPregunta;
        tarjetaPregunta.innerHTML = crearHTMLVistaGuardada(item.texto, item.esVerdadero, numeroPregunta);
        contenedorPreguntas.appendChild(tarjetaPregunta);
        asignarEventosVistaGuardada(tarjetaPregunta, item.texto, item.esVerdadero);
    });

    // Si hay preguntas, ocultamos estado vacío y ajustamos botones
    if (datos.length > 0) {
        mensajeVacio.classList.add("oculto");
        botonInfo.classList.add("oculto");
        // Movemos el botón agregar a su lugar activo
        const panelPregunta = document.querySelector(".panel-preguntas");
        panelPregunta.appendChild(botonAgregar);
        botonAgregar.classList.remove("inicial");
        botonAgregar.classList.add("boton-activo");
        botonAgregar.disabled = false; // Habilitado porque no hay pregunta en edición
        botonAgregar.classList.add("listo");
        actualizarBotonSiguiente();
    } else {
        // Estado vacío normal
        inicializarEstadoVacio();
    }
    return true;
}


function ocultarAccionesTarjetasGuardadas() {
    document.querySelectorAll(".tarjeta-pregunta.guardado").forEach(tarjeta => {
        tarjeta.classList.add("acciones-ocultas");
    });
}

function mostrarAccionesTarjetasGuardadas() {
    document.querySelectorAll(".tarjeta-pregunta.guardado").forEach(tarjeta => {
        tarjeta.classList.remove("acciones-ocultas");
    });
}

/* ===================================== */
/* FUNCIÓN DE INICIALIZACIÓN DEL ESTADO VACÍO */
/* ===================================== */
function inicializarEstadoVacio() {
    const estadoVacio = document.querySelector(".estado-vacio");
    estadoVacio.appendChild(botonAgregar);

    botonAgregar.classList.add("inicial");
    botonAgregar.classList.remove("boton-activo", "listo");
    botonAgregar.disabled = false;

    mensajeVacio.classList.remove("oculto");
    botonInfo.classList.remove("oculto");

    // Botón siguiente gris y deshabilitado al inicio
    botonSiguiente.style.backgroundColor = "#666";
    botonSiguiente.disabled = true;
}

if (!cargarPreguntasDesdeLocalStorage()) {
    inicializarEstadoVacio();
}

/* ===================================== */
/* ACTUALIZAR BOTÓN SIGUIENTE */
/* ===================================== */
function actualizarBotonSiguiente() {
    const tarjetasGuardadas = contenedorPreguntas.querySelectorAll(".tarjeta-pregunta.guardado").length;
    if (tarjetasGuardadas >= 5) {
        botonSiguiente.style.backgroundColor = "#171C52";
        botonSiguiente.disabled = false;
    } else {
        botonSiguiente.style.backgroundColor = "#666";
        botonSiguiente.disabled = true;
    }
}

/* ===================================== */
/* MODAL INFORMACIÓN */
/* ===================================== */

const fondoModal = document.createElement("div");
fondoModal.classList.add("fondo-modal");

const modal = document.createElement("div");
modal.classList.add("modal-personalizado");
modal.innerHTML = `
    <p>
        Al agregar preguntas a la interfaz,
        la opción de regresar se deshabilitará.
        Podrás volver a la vista anterior
        únicamente si la lista de preguntas
        está vacía.
    </p>
    <button class="boton-modal">Aceptar</button>
`;
fondoModal.appendChild(modal);
document.body.appendChild(fondoModal);

botonInfo.addEventListener("click", () => fondoModal.classList.add("activo"));
document.querySelector(".boton-modal").addEventListener("click", () => fondoModal.classList.remove("activo"));

/* ===================================== */
/* FUNCIÓN PARA ACTIVAR TOGGLE DE UNA TARJETA */
/* ===================================== */

function activarFuncionesTarjeta(tarjetaPregunta) {
    const entradaToggle = tarjetaPregunta.querySelector(".interruptor input");
    const textoToggle = tarjetaPregunta.querySelector(".texto-toggle");
    const contenedorToggle = tarjetaPregunta.querySelector(".contenedor-toggle");

    entradaToggle.addEventListener("change", () => {
        if (entradaToggle.checked) {
            textoToggle.textContent = "Verdadero";
            contenedorToggle.classList.remove("estado-falso");
        } else {
            textoToggle.textContent = "Falso";
            contenedorToggle.classList.add("estado-falso");
        }
    });
}

/* ===================================== */
/* MODAL ELIMINAR PREGUNTA */
/* ===================================== */

const fondoEliminar = document.createElement("div");
fondoEliminar.classList.add("fondo-modal");

const modalEliminar = document.createElement("div");
modalEliminar.classList.add("modal-personalizado");
modalEliminar.innerHTML = `
    <p class="texto-eliminar">
        ¿Estás seguro de que deseas eliminar esta pregunta?
        Esta acción no se puede deshacer.
    </p>
    <div class="botones-eliminar">
        <button class="boton-cancelar-eliminar">Cancelar</button>
        <button class="boton-confirmar-eliminar">Aceptar</button>
    </div>
`;
fondoEliminar.appendChild(modalEliminar);
document.body.appendChild(fondoEliminar);

function mostrarMensajeEliminado() {
    const mensajeExito = document.createElement("div");
    mensajeExito.classList.add("mensaje-exito");
    mensajeExito.textContent = "El elemento se ha eliminado exitosamente!";
    document.querySelector(".panel-preguntas").appendChild(mensajeExito);
    setTimeout(() => mensajeExito.remove(), 3000);
}

document.querySelector(".boton-cancelar-eliminar").addEventListener("click", () => {
    fondoEliminar.classList.remove("activo");
    preguntaAEliminar = null;
    eliminandoTarjetaNueva = false;
});

document.querySelector(".boton-confirmar-eliminar").addEventListener("click", () => {
    if (preguntaAEliminar) {
        preguntaAEliminar.remove();
        mostrarMensajeEliminado();
        renumerarPreguntas();
        guardarPreguntasEnLocalStorage(); 
        mostrarAccionesTarjetasGuardadas();
        actualizarBotonSiguiente();

        if (contenedorPreguntas.children.length > 0) {
            botonAgregar.disabled = false;
            botonAgregar.classList.add("listo");
        }
        eliminandoTarjetaNueva = false;

        if (contenedorPreguntas.children.length === 0) restablecerEstadoVacio();
    }
    fondoEliminar.classList.remove("activo");
    preguntaAEliminar = null;
});

/* ===================================== */
/* FUNCIÓN PARA RENUMERAR PREGUNTAS */
/* ===================================== */
function renumerarPreguntas() {
    const tarjetas = contenedorPreguntas.querySelectorAll(".tarjeta-pregunta");
    tarjetas.forEach((tarjeta, indice) => {
        const nuevoNumero = indice + 1;
        tarjeta.dataset.questionNumber = nuevoNumero;
        
        const titulo = tarjeta.querySelector(".titulo-pregunta-guardada") || tarjeta.querySelector(".titulo-pregunta");
        if (titulo) {
            titulo.textContent = `Pregunta ${nuevoNumero}:`;
        }
    });
    contadorPreguntas = tarjetas.length;
}

/* ===================================== */
/* FUNCIONES REUTILIZABLES */
/* ===================================== */

function restablecerEstadoVacio() {
    inicializarEstadoVacio();
    actualizarBotonSiguiente();
    contadorPreguntas = 0;
    localStorage.removeItem("preguntasGuardadas"); 
    localStorage.removeItem("contadorPreguntas");
}

function crearHTMLVistaGuardada(textoPregunta, esVerdadero, numeroPregunta) {
    const textoRespuesta = esVerdadero ? "Verdadero" : "Falso";
    return `
        <span class="editar-pregunta">✎</span>
        <span class="cerrar-pregunta cerrar-guardado">x</span>
        <div class="contenido-pregunta-guardada">
            <h3 class="titulo-pregunta-guardada">Pregunta ${numeroPregunta}:</h3>
            <p class="texto-pregunta-guardada">${textoPregunta}</p>
        </div>
        <div class="contenedor-toggle ${esVerdadero ? "" : "estado-falso"}">
            <label class="interruptor">
                <input type="checkbox" ${esVerdadero ? "checked" : ""} disabled>
                <span class="deslizador"></span>
            </label>
            <span class="texto-toggle">${textoRespuesta}</span>
        </div>
    `;
}

function asignarEventosVistaGuardada(tarjetaPregunta, textoPregunta, esVerdadero) {
    const botonCerrarGuardado = tarjetaPregunta.querySelector(".cerrar-guardado");
    const botonEditar = tarjetaPregunta.querySelector(".editar-pregunta");

    botonCerrarGuardado.addEventListener("click", () => {
        preguntaAEliminar = tarjetaPregunta;
        fondoEliminar.classList.add("activo");
        if (contenedorPreguntas.children.length === 0) restablecerEstadoVacio();
    });

    botonEditar.addEventListener("click", () => {
        const numeroPregunta = parseInt(tarjetaPregunta.dataset.questionNumber);
        entrarModoEdicion(tarjetaPregunta, textoPregunta, esVerdadero, numeroPregunta);
    });
}

function entrarModoEdicion(tarjetaPregunta, textoPregunta, esVerdadero, numeroPregunta) {
    botonAgregar.disabled = true;
    botonAgregar.classList.remove("listo");
    ocultarAccionesTarjetasGuardadas();

    botonSiguiente.style.backgroundColor = "#666";
    botonSiguiente.disabled = true;

    tarjetaPregunta.classList.remove("guardado");
    tarjetaPregunta.innerHTML = `
        <h3 class="titulo-pregunta">Pregunta ${numeroPregunta}:</h3>
        <span class="cerrar-pregunta">x</span>
        <input type="text" class="entrada-pregunta" placeholder="Escribe la pregunta" value="${textoPregunta}">
        <div class="acciones-pregunta">
            <div class="contenedor-toggle ${esVerdadero ? "" : "estado-falso"}">
                <label class="interruptor">
                    <input type="checkbox" ${esVerdadero ? "checked" : ""}>
                    <span class="deslizador"></span>
                </label>
                <span class="texto-toggle">${esVerdadero ? "Verdadero" : "Falso"}</span>
            </div>
            <button class="boton-guardar">Guardar pregunta</button>
        </div>
    `;

    activarFuncionesTarjeta(tarjetaPregunta);

    const botonGuardar = tarjetaPregunta.querySelector(".boton-guardar");
    const entradaPregunta = tarjetaPregunta.querySelector(".entrada-pregunta");
    const entradaToggle = tarjetaPregunta.querySelector(".interruptor input");
    const botonCerrar = tarjetaPregunta.querySelector(".cerrar-pregunta");

    entradaPregunta.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            botonGuardar.click();
        }
    });

    botonGuardar.addEventListener("click", () => {
        const nuevoTexto = entradaPregunta.value.trim();
        if (nuevoTexto === "") {
            entradaPregunta.classList.add("error");
            if (!document.querySelector(".mensaje-error")) {
                const mensajeError = document.createElement("div");
                mensajeError.classList.add("mensaje-error");
                mensajeError.textContent = "Por favor escribe la pregunta antes de guardarlo !";
                document.querySelector(".panel-preguntas").appendChild(mensajeError);
                setTimeout(() => mensajeError.remove(), 3000);
            }
            return;
        }
        entradaPregunta.classList.remove("error");
        const nuevoEsVerdadero = entradaToggle.checked;

        tarjetaPregunta.classList.add("guardado");
        tarjetaPregunta.innerHTML = crearHTMLVistaGuardada(nuevoTexto, nuevoEsVerdadero, numeroPregunta);
        tarjetaPregunta.dataset.questionNumber = numeroPregunta;
        asignarEventosVistaGuardada(tarjetaPregunta, nuevoTexto, nuevoEsVerdadero);

        botonAgregar.disabled = false;
        botonAgregar.classList.add("listo");
        actualizarBotonSiguiente();
        mostrarAccionesTarjetasGuardadas();
        guardarPreguntasEnLocalStorage();
    });

    botonCerrar.addEventListener("click", () => {
        preguntaAEliminar = tarjetaPregunta;
        fondoEliminar.classList.add("activo");
        if (contenedorPreguntas.children.length === 0) restablecerEstadoVacio();
    });
}

/* ===================================== */
/* FUNCIÓN CREAR PREGUNTA (inicial) */
/* ===================================== */

function crearTarjetaPregunta() {
    contadorPreguntas++;

    const tarjetaPregunta = document.createElement("div");
    tarjetaPregunta.classList.add("tarjeta-pregunta");
    tarjetaPregunta.dataset.questionNumber = contadorPreguntas;
    tarjetaPregunta.innerHTML = `
        <h3 class="titulo-pregunta">Pregunta ${contadorPreguntas}:</h3>
        <span class="cerrar-pregunta">x</span>
        <input type="text" class="entrada-pregunta" placeholder="Escribe la pregunta">
        <div class="acciones-pregunta">
            <div class="contenedor-toggle">
                <label class="interruptor">
                    <input type="checkbox" checked>
                    <span class="deslizador"></span>
                </label>
                <span class="texto-toggle">Verdadero</span>
            </div>
            <button class="boton-guardar">Guardar pregunta</button>
        </div>
    `;

    contenedorPreguntas.appendChild(tarjetaPregunta);
    activarFuncionesTarjeta(tarjetaPregunta);
    ocultarAccionesTarjetasGuardadas();

    botonSiguiente.style.backgroundColor = "#666";
    botonSiguiente.disabled = true;

    const botonGuardar = tarjetaPregunta.querySelector(".boton-guardar");
    const entradaPregunta = tarjetaPregunta.querySelector(".entrada-pregunta");
    entradaPregunta.focus();
    tarjetaPregunta.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    entradaPregunta.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            botonGuardar.click();
        }
    });

    const entradaToggle = tarjetaPregunta.querySelector(".interruptor input");
    const botonCerrar = tarjetaPregunta.querySelector(".cerrar-pregunta");

    botonGuardar.addEventListener("click", () => {
        const texto = entradaPregunta.value.trim();
        if (texto === "") {
            entradaPregunta.classList.add("error");
            if (!document.querySelector(".mensaje-error")) {
                const mensajeError = document.createElement("div");
                mensajeError.classList.add("mensaje-error");
                mensajeError.textContent = "Por favor escribe la pregunta antes de guardarlo !";
                document.querySelector(".panel-preguntas").appendChild(mensajeError);
                setTimeout(() => mensajeError.remove(), 3000);
            }
            return;
        }
        entradaPregunta.classList.remove("error");
        const esVerdadero = entradaToggle.checked;

        tarjetaPregunta.classList.add("guardado");
        tarjetaPregunta.innerHTML = crearHTMLVistaGuardada(texto, esVerdadero, contadorPreguntas);
        asignarEventosVistaGuardada(tarjetaPregunta, texto, esVerdadero);

        botonAgregar.disabled = false;
        botonAgregar.classList.add("listo");
        actualizarBotonSiguiente();
        mostrarAccionesTarjetasGuardadas();
        guardarPreguntasEnLocalStorage(); 
    });

    botonCerrar.addEventListener("click", () => {
        preguntaAEliminar = tarjetaPregunta;
        eliminandoTarjetaNueva = true;
        fondoEliminar.classList.add("activo");
        if (contenedorPreguntas.children.length === 0) restablecerEstadoVacio();
    });
}

/* ===================================== */
/* BOTÓN AGREGAR PREGUNTA */
/* ===================================== */

botonAgregar.addEventListener("click", () => {
    const panelPregunta = document.querySelector(".panel-preguntas");
    panelPregunta.appendChild(botonAgregar);

    botonAgregar.classList.remove("inicial");
    botonAgregar.classList.add("boton-activo");
    botonAgregar.disabled = true;

    mensajeVacio.classList.add("oculto");
    botonInfo.classList.add("oculto");

    crearTarjetaPregunta();

    botonAgregar.classList.remove("listo");
});

/* ===================================== */
/* BOTÓN SIGUIENTE */
/* ===================================== */

botonSiguiente.addEventListener("click", () => {

    /* Validar que esté habilitado */
    if(!botonSiguiente.disabled){

        /* Ir a la siguiente pantalla */
        window.location.href = "metricas.html";

    }

});