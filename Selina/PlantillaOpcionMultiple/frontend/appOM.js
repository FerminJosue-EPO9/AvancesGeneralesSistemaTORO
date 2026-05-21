const questionTemplate = document.querySelector("#question-template");
const emptyMessage = document.querySelector("#emptyMessage");

/* MODAL AYUDA*/
const helpButton = document.querySelector(".help-button");
const helpModal = document.querySelector("#helpModal");
const closeHelpBtn = document.querySelector("#closeHelpBtn");

/* MODAL ELIMINAR */
const deleteModal = document.querySelector("#deleteModal");
const cancelDeleteBtn = document.querySelector("#cancelDeleteBtn");
const confirmDeleteBtn = document.querySelector("#confirmDeleteBtn");

let questionToDelete = null;

/* MODAL AVISOS */
const warningModal = document.querySelector("#warningModal");
const warningMessage = document.querySelector("#warningMessage");
const warningAcceptBtn = document.querySelector("#warningAcceptBtn");

/* LISTENERS */
helpButton.addEventListener("click", () => {
    helpModal.style.display = "flex";
});

closeHelpBtn.addEventListener("click", () => {
    helpModal.style.display = "none";
});

helpModal.addEventListener("click", (e) => {
    if(e.target === helpModal){
        helpModal.style.display = "none";
    }
});

warningAcceptBtn.addEventListener("click", () => {
    warningModal.style.display = "none";
});

/* CONTADOR */
let questionCounter = 0;
function updateQuestionNumbers(){
    const savedCards = document.querySelectorAll(".saved-question-card");
    savedCards.forEach((card, index) => {
        const title = card.querySelector("h3"); title.textContent =`Pregunta ${index + 1}:`;});
}

/* AGREGAR PREGUNTA */
const addQuestionBtn = document.querySelector(".add-question-btn");
const questionsWrapper = document.querySelector(".questions-wrapper");
const nextBtn = document.querySelector(".next-btn");

addQuestionBtn.addEventListener("click", () => {
    const totalQuestions = document.querySelectorAll( ".saved-question-card").length;
    if(totalQuestions >= 15){
        warningMessage.textContent = "No es posible agregar más preguntas.";
        warningModal.style.display = "flex";
        return;
    }

    const editingCard = document.querySelector(".question-card");

    if(editingCard){
        alert("Debes guardar la pregunta actual antes de agregar otra.");
        return;
    }
    createQuestionCard();
});

/* CREAR TARJETA*/
function createQuestionCard(savedData = null, insertBeforeElement = null){
    if(!savedData){
        questionCounter++;
    }

    const questionId = savedData? savedData.id: questionCounter;
    const templateClone = questionTemplate.content.cloneNode(true);
    const questionCard = templateClone.querySelector(".question-card");
    const addOptionBtn = templateClone.querySelector(".add-option-btn");
    const deleteEditingBtn = templateClone.querySelector(".delete-editing-question-btn");
    const optionsContainer = templateClone.querySelector(".options-container");
    const saveQuestionBtn =templateClone.querySelector(".save-question-btn");
    const questionInput = templateClone.querySelector(".question-input");

    let optionCount = 0;

    /* ELIMINAR PREGUNTA EN EDICIÓN*/
    deleteEditingBtn.addEventListener("click", () => {

        const questionText = questionInput.value.trim();
        const optionInputs = optionsContainer.querySelectorAll(".option-input");
        let hasContent = false;

        if(questionText !== ""){
            hasContent = true;
        }

        optionInputs.forEach(input => {
            if(input.value.trim() !== ""){
                hasContent = true;
            }
        });

        if(!hasContent){
            questionCard.remove();
            if(questionsWrapper.children.length === 0){
                emptyMessage.style.display = "block";
            }
            return;
        }

        questionToDelete = questionCard;
        deleteModal.style.display = "flex";
    });

    /* CARGAR DATOS SI ES EDICIÓN*/
    if(savedData){
        questionInput.value = savedData.question;
        savedData.options.forEach((option, index) => {
            optionCount++;
            const checked = option === savedData.correctAnswer? "checked": "";
            const editingClass =index === savedData.options.length - 1? "editing": "";
            const optionItem = document.createElement("div");

            optionItem.classList.add("option-item");
            optionItem.innerHTML = `
                <input type="radio" name="correct-${questionId}"${checked}>

                <div class="option-content ${editingClass}">
                    <input type="text" class="option-input"value="${option}">
                    <span class="option-text"> ${option}</span>
                    <div class="option-actions">
                        <button class="edit-option-btn">
                            🖉
                        </button>

                        <button class="delete-option">
                            ˣ
                        </button>
                    </div>
                </div>
            `;
            optionsContainer.appendChild(optionItem);
        });
    }

    /*AGREGAR INCISO */

    addOptionBtn.addEventListener("click", () => {
        if(optionCount >= 4){
            alert("Solo puedes agregar máximo 4 incisos");
            return;
        }

        const editingOption = optionsContainer.querySelector(".option-content.editing");

        if(editingOption){
            const currentInput = editingOption.querySelector(".option-input");

            if(currentInput.value.trim() === ""){
                alert("Debes escribir algo en el inciso actual.");
                return;
            }
        }

        const previousOptions = optionsContainer.querySelectorAll(".option-content");
        previousOptions.forEach(option => {
            const input = option.querySelector(".option-input");
            const text =option.querySelector(".option-text");

            if(input.value.trim() !== ""){
                text.textContent = input.value;
                option.classList.remove("editing");
            }
        });
        optionCount++;

        const optionItem = document.createElement("div");
        optionItem.classList.add("option-item");
        optionItem.innerHTML = `
        
            <input type="radio" name="correct-${questionId}">
            <div class="option-content editing">
                <input type="text" class="option-input">
                <span class="option-text"></span>
                <div class="option-actions">
                    <button class="edit-option-btn">
                        🖉
                    </button>

                    <button class="delete-option">
                        ˣ
                    </button>
                </div>
            </div>
        `;
        optionsContainer.appendChild(optionItem);
    });

    /* EDITAR Y ELIMINAR INCISOS */
    questionCard.addEventListener("click", (e) => {
        if(e.target.classList.contains("delete-option")){
            e.target.closest(".option-item").remove();
            optionCount--;
            return;
        }

        if(e.target.classList.contains("edit-option-btn")){
            const optionContent = e.target.closest(".option-content");
            const input = optionContent.querySelector(".option-input");
            const allOptions = optionsContainer.querySelectorAll(".option-content");

            allOptions.forEach(option => {
                if(option !== optionContent){
                    const otherInput = option.querySelector(".option-input");
                    const otherText = option.querySelector(".option-text");

                    if(otherInput.value.trim() !== ""){
                        otherText.textContent = otherInput.value;
                        option.classList.remove("editing");
                    }
                }
            });

            optionContent.classList.add("editing");
            input.focus();
        }
    });

    /* GUARDAR PREGUNTA */
    saveQuestionBtn.addEventListener("click", () => {
        const options = optionsContainer.querySelectorAll(".option-input");
        const radios = optionsContainer.querySelectorAll("input[type='radio']");
        let filledOptions = [];
        let correctAnswer = "";

        if(questionInput.value.trim() === ""){
            alert("Debes escribir una pregunta");
            return;
        }

        options.forEach((option, index) => {
            if(option.value.trim() !== ""){
                filledOptions.push(option.value);

                if(radios[index].checked){
                    correctAnswer = option.value;
                }
            }
        });

        if(filledOptions.length === 0){
            alert("Debes agregar al menos un inciso");
            return;
        }

        if(correctAnswer === ""){
            alert("Debes seleccionar una respuesta correcta");
            return;
        }

        const savedCard = document.createElement("div");
        savedCard.classList.add("saved-question-card");
        let optionsHTML = "";

        filledOptions.forEach(option => {const checked = option === correctAnswer? "checked": "";
            optionsHTML += `
                <label class="saved-option">
                    <input type="radio" disabled ${checked}>
                    <span>${option}</span>
                </label>
            `;
        });

        savedCard.innerHTML = `
            <div class="saved-header">
                <h3>
                    Pregunta ${questionId}:
                </h3>

                <div class="saved-actions">
                    <button class="edit-btn">
                        🖉
                    </button>

                    <button class="delete-btn">
                        ˣ
                    </button>
                </div>
            </div>

            <p class="saved-question-text">
                ${questionInput.value}
            </p>

            <div class="saved-options">
                ${optionsHTML}
            </div>
        `;

        questionCard.replaceWith(savedCard);
        updateQuestionNumbers();

        saveQuestionsToSession();

        /* EDITAR PREGUNTA */
        savedCard.querySelector(".edit-btn")
        .addEventListener("click", () => {

            const editingCard = document.querySelector(".question-card");

            if(editingCard){
                alert("Debes terminar la pregunta actual antes de editar otra.");
                return;
            }

            const questionText = savedCard.querySelector(".saved-question-text").textContent.trim();
            const optionElements = savedCard.querySelectorAll(".saved-option");
            const options = [];
            let correctAnswer = "";

            optionElements.forEach(option => {
                const text = option.querySelector("span").textContent.trim();
                options.push(text);

                if(option.querySelector("input").checked){
                    correctAnswer = text;
                }
            });

            const nextSibling = savedCard.nextSibling;
            savedCard.remove();

            createQuestionCard(
                {
                    id: questionId,
                    question: questionText,
                    options: options,
                    correctAnswer: correctAnswer
                },
                nextSibling
            );
        });

        /* ELIMINAR PREGUNTA */
        savedCard.querySelector(".delete-btn")
        .addEventListener("click", () => {
            questionToDelete = savedCard;
            deleteModal.style.display = "flex";
        });
    });

    /* AGREGAR TARJETA AL DOM */
    if(insertBeforeElement){
        questionsWrapper.insertBefore(templateClone,insertBeforeElement);
    }else{
        questionsWrapper.appendChild(templateClone);
    }
    emptyMessage.style.display = "none";
}

/*CANCELAR ELIMINACIÓN*/
cancelDeleteBtn.addEventListener("click", () => {deleteModal.style.display = "none"; questionToDelete = null;});

/* GUARDAR ESTADO ACTUAL */

function saveQuestionsToSession(){
    const savedQuestions = document.querySelectorAll(".saved-question-card");
    let questionsData = [];

    savedQuestions.forEach((card, index) => {
        const question = card.querySelector(".saved-question-text").textContent.trim();
        let options = [];
        let correctAnswer = "";

        card.querySelectorAll(".saved-option").forEach(option => {
            const optionText = option.querySelector("span").textContent.trim();
            options.push(optionText);

            if(option.querySelector("input").checked){
                correctAnswer = optionText;
            }
        });

        questionsData.push({
            id: index + 1, question, options, correctAnswer
        });
    });

    sessionStorage.setItem("questionsData", JSON.stringify(questionsData));
}

/* VALIDAR BOTÓN SIGUIENTE */
nextBtn.addEventListener("click", () => {
    const totalQuestions = document.querySelectorAll(".saved-question-card").length;

    if(totalQuestions < 5){
        warningMessage.innerHTML = `
            No es posible continuar debido a
            que no cuenta con la cantidad de
            reactivos suficiente.
            <br><br>
            Revise el botón "?" para más
            información
        `;

        warningModal.style.display = "flex";
        return;
    }

    const savedQuestions = document.querySelectorAll(".saved-question-card");
    let questionsData = [];

    savedQuestions.forEach((card, index) => {
        const question = card.querySelector(".saved-question-text").textContent.trim();
        let options = [];
        let correctAnswer = "";

        card.querySelectorAll(".saved-option").forEach(option => {
            const optionText = option.querySelector("span").textContent.trim();
            options.push(optionText);

            if(option.querySelector("input").checked){
                correctAnswer = optionText;
            }
        });

        questionsData.push({
            id: index + 1, question, options, correctAnswer
        });
    });

    sessionStorage.setItem("questionsData", JSON.stringify(questionsData));

    window.location.href = "metricas_actividad.html";});

/* CONFIRMAR ELIMINACIÓN*/
confirmDeleteBtn.addEventListener("click", () => {
    if(questionToDelete){
        questionToDelete.remove();
        updateQuestionNumbers();
        saveQuestionsToSession();
    }

    deleteModal.style.display = "none";
    questionToDelete = null;

    if(questionsWrapper.children.length === 0){
        emptyMessage.style.display = "block";
    }
});

/* RECUPERAR PREGUNTAS */

window.addEventListener("DOMContentLoaded", () => {
    const savedQuestions = sessionStorage.getItem("questionsData");

    if(!savedQuestions){
        return;
    }

    const questions = JSON.parse(savedQuestions);

    questions.forEach(questionData => {
        questionCounter++;
        const savedCard = document.createElement("div");
        savedCard.classList.add("saved-question-card"
        );

        let optionsHTML = "";

        questionData.options.forEach(option => {
            const checked = option === questionData.correctAnswer? "checked": "";
            optionsHTML += `
            
                <label class="saved-option">
                    <input type="radio" disabled ${checked}>
                    <span>${option}</span>
                </label>
            `;
        });

        savedCard.innerHTML = `
           <div class="saved-header">
                <h3>
                    Pregunta ${questionData.id}:
                </h3>

                <div class="saved-actions">
                    <button class="edit-btn">
                        🖉
                    </button>

                    <button class="delete-btn">
                        ˣ
                    </button>
                </div>
            </div>

            <p class="saved-question-text"> ${questionData.question}</p>
            <div class="saved-options"> ${optionsHTML}</div>
        `;

        questionsWrapper.appendChild(savedCard);

        /* EDITAR */
        savedCard.querySelector(".edit-btn").addEventListener("click", () => {
            const editingCard = document.querySelector(".question-card");

            if(editingCard){
                alert("Debes terminar la pregunta actual antes de editar otra.");
                return;
            }

            const nextSibling = savedCard.nextSibling;
            savedCard.remove();

            createQuestionCard(
                {
                    id: questionData.id, question: questionData.question, options: questionData.options, correctAnswer: questionData.correctAnswer
                },
                nextSibling
            );
        });

        /* ELIMINAR */
        savedCard.querySelector(".delete-btn").addEventListener("click", () => {
            questionToDelete = savedCard;
            deleteModal.style.display = "flex";
        });
    });

    emptyMessage.style.display = "none";
    updateQuestionNumbers();

});