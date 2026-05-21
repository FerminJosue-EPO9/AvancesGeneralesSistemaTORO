const savedMetrics = JSON.parse(localStorage.getItem("activityMetrics"));
console.log("JS cargado");
const backBtn = document.querySelector("#backBtn");
const nextBtn = document.querySelector("#nextBtn");

/* MODAL REGRESAR */
const backWarningModal = document.querySelector("#backWarningModal");
const cancelBackBtn = document.querySelector("#cancelBackBtn");
const confirmBackBtn = document.querySelector("#confirmBackBtn");

/* INPUTS*/
const activityTitle = document.querySelector("#activityTitle");
const dueDate = document.querySelector("#dueDate");
const timeLimit = document.querySelector("#timeLimit");
const maxAttempts = document.querySelector("#maxAttempts");
const score = document.querySelector("#score");

/* CARGAR DATOS GUARDADOS */

if(savedMetrics){
    activityTitle.value = savedMetrics.title || "";
    dueDate.value = savedMetrics.dueDate || "";
    timeLimit.value = savedMetrics.timeLimit || "";
    maxAttempts.value = savedMetrics.maxAttempts || "";
    score.value = savedMetrics.score || "";
}
/* REGRESAR*/
backBtn.addEventListener("click", () => {
    const hasData =
        activityTitle.value.trim() !== "" ||
        dueDate.value.trim() !== "" ||
        timeLimit.value.trim() !== "" ||
        maxAttempts.value.trim() !== "" ||
        score.value.trim() !== "";

    /* SI NO HAY DATOS*/
    if(!hasData){
        window.location.href = "crear_actividadOM.html";
        return;
    }

    /* MOSTRAR MODAL*/
    backWarningModal.style.display = "flex";
});

/* CANCELAR REGRESO */
cancelBackBtn.addEventListener("click",() => {
        backWarningModal.style.display = "none";
    }
);

/* CONFIRMAR REGRESO */
confirmBackBtn.addEventListener("click",() => {
        /* ELIMINAR MÉTRICAS */
        const returningFromFinalizar =sessionStorage.getItem("returningFromFinalizar");
        
        if(!returningFromFinalizar){
            sessionStorage.removeItem("activityMetrics");
        }else{
            sessionStorage.removeItem("returningFromFinalizar");
        }

        /* REGRESAR */
        window.location.href = "crear_actividadOM.html";}
);

/* SIGUIENTE*/
nextBtn.addEventListener("click", () => {
    const metrics = {title: activityTitle.value, dueDate: dueDate.value, timeLimit: timeLimit.value, maxAttempts: maxAttempts.value, score: score.value};
    sessionStorage.setItem("activityMetrics", JSON.stringify(metrics));
    window.location.href = "finalizar.html";
});
