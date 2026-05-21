const summaryCard = document.querySelector("#summaryCard");
const backBtn = document.querySelector("#backBtn");
const finishBtn = document.querySelector("#finishBtn");

/*CARGAR MÉTRICAS */
const metrics = JSON.parse(sessionStorage.getItem("activityMetrics"));
if(!metrics){
    window.location.href = "metricas_actividad.html";
}
/* CREAR TARJETA */
summaryCard.innerHTML = `
    <div class="summary-top">
        <div class="summary-title">
            Plantilla<br>
            seleccionada
        </div>

        <img src="img/OM.png" class="summary-image">
    </div>

    <div class="summary-data">
        <div class="summary-row">
            <span class="summary-label">
                Título de la actividad
            </span>

            <span class="summary-value">
                ${metrics.title}
            </span>
        </div>

        <div class="summary-row">
            <span class="summary-label">
                Fecha de vencimiento
            </span>

            <span class="summary-value">
                ${metrics.dueDate}
            </span>
        </div>

        <div class="summary-row">
            <span class="summary-label">
                Tiempo límite
            </span>

            <span class="summary-value">
                ${metrics.timeLimit}
            </span>
        </div>

        <div class="summary-row">
            <span class="summary-label">
                Intentos máximo
            </span>

            <span class="summary-value">
                ${metrics.maxAttempts}
            </span>
        </div>

        <div class="summary-row">
            <span class="summary-label">
                Ponderación en puntos
            </span>

            <span class="summary-value">
                ${metrics.score}
            </span>
        </div>
    </div>
`;

/* REGRESAR*/
backBtn.addEventListener("click", () => {
    sessionStorage.setItem("returningFromFinalizar","true");

    window.location.href ="metricas_actividad.html";
});

/* FINALIZAR */
const successContainer = document.querySelector("#successContainer");
const activitiesBtn = document.querySelector("#activitiesBtn");

finishBtn.addEventListener("click", () => {
    /* OCULTAR RESUMEN */
    summaryCard.style.display = "none";
    /* OCULTAR BOTONES */
    backBtn.style.display = "none";
    finishBtn.style.display = "none";

    /* MOSTRAR MENSAJE */
    successContainer.style.display = "flex";
});

/* IR A ACTIVIDADES */
activitiesBtn.addEventListener("click", () => {
    window.location.href = null;
});