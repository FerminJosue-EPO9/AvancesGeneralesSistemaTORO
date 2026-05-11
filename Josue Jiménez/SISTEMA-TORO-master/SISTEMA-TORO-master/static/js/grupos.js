let alumnos = [];

// Al cargar la página, obtener los grupos REALES del servidor
document.addEventListener("DOMContentLoaded", () => {
    renderizarGrupos(); 
    
    // Restaurar sección activa
    const seccionGuardada = localStorage.getItem("seccionActiva");
    if (seccionGuardada) {
        mostrarSeccion(seccionGuardada);
    } else {
        mostrarSeccion("seccionDefault");
    }
});

// --- NAVEGACIÓN Y UTILIDADES ---

function IrAGrupos(){
    window.location.href = "grupos.html";
}

function IrAProgresiones(grupoNombre, materiaNombre, parcialNombre) {
  // 1. Guardamos el contexto en la memoria del navegador
  localStorage.setItem('grupoActual', grupoNombre);
  localStorage.setItem('materiaActual', materiaNombre);
  localStorage.setItem('parcialActual', parcialNombre);
  
  // 2. Redirigimos a la RUTA DE PYTHON (no al archivo html)
  window.location.href = "/progresiones"; 
}
function mostrarSeccion(id) {
    document.querySelectorAll(".seccion").forEach(sec => sec.classList.remove("activa"));
    document.getElementById(id).classList.add("activa");
    localStorage.setItem("seccionActiva", id);
}

function regresarSeccionActiva() {
    const hayGrupos = document.getElementById("listaGrupos").children.length > 0;
    if (hayGrupos) {
        mostrarSeccion("mostrarGrupos");
    } else {
        mostrarSeccion("seccionDefault");
    }
}

// --- LÓGICA DE ARCHIVOS (LECTURA TXT) ---
const inputArchivo = document.getElementById('archivoAlumnos');
if(inputArchivo) {
    inputArchivo.addEventListener("change", leerArchivo);
}

function leerArchivo(event){
    const archivo = event.target.files[0];
    if(!archivo) return;
    // Solo lectura visual si es necesario, el backend procesa el archivo real
    console.log("Archivo seleccionado");
}

// --- COMUNICACIÓN CON PYTHON (API) ---

// 1. GUARDAR GRUPO
function GuardarGrupo() {
    const inputNombre = document.getElementById('grupo');
    const inputFile = document.getElementById('archivoAlumnos');
    
    const nombreGrupo = inputNombre.value;
    const archivo = inputFile.files[0];

    if (!nombreGrupo) { alert("Escribe un nombre para el grupo."); return; }
    if (!archivo) { alert("Selecciona el archivo .txt de alumnos."); return; }

    let formData = new FormData();
    formData.append('nombre', nombreGrupo);
    formData.append('archivo', archivo);

    fetch('/crear_grupo', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if (data.exito) {
            alert("¡Grupo creado!");
            inputNombre.value = "";
            inputFile.value = "";
            renderizarGrupos(); 
            mostrarSeccion("mostrarGrupos");
        } else {
            alert("Error: " + data.mensaje);
        }
    })
    .catch(e => console.error(e));
}

// 2. RENDERIZAR GRUPOS
// 2. RENDERIZAR GRUPOS
function renderizarGrupos() {
    const contenedor = document.getElementById("listaGrupos");
    if (!contenedor) return;
    
    fetch('/api/grupos')
    .then(response => response.json())
    .then(grupos => {
        contenedor.innerHTML = ""; 
        
        if (grupos.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:#666;'>No hay grupos creados.</p>";
            return;
        }

        grupos.forEach((grupo) => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("grupo-card");

            tarjeta.innerHTML = `
                <div class="grupo-header">
                    <div class="acciones" style="display:flex; align-items:center;">
                        <span class="nombreGrupo">Grupo ${grupo.nombre}</span>
                        <button class="btn-cerrar-rojo" style="margin-left:10px;" onclick="eliminarGrupo('${grupo.nombre}')" title="Eliminar Grupo">
                            &times;
                        </button>
                    </div>
                    <button class="btn-materia" onclick="agregarMateria('${grupo.nombre}')">
                        + Agregar materia
                    </button>
                </div>
                <div class="grupo-body">
                    ${renderizarMateriasHTML(grupo)}
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });
    })
    .catch(error => console.error("Error cargando grupos:", error));
}

// Helper para generar el HTML de materias y parciales
// Helper para generar el HTML de materias y parciales
function renderizarMateriasHTML(grupo) {
    if (!grupo.materias || grupo.materias.length === 0) return "";

    return grupo.materias.map(materia => {
        // Lógica de conteo de parciales (Máximo 3)
        const numParciales = materia.parciales.length;
        const maxParciales = 3;
        
        // Botón "+ Parcial" o texto "(Completo)"
        const mostrarBotonAgregar = numParciales < maxParciales 
            ? `<button class="btn-agregarParcial" onclick="agregarParcial('${grupo.nombre}', '${materia.nombre}', ${numParciales})">
                 + Parcial
               </button>` 
            : `<span style="font-size:0.75rem; color:#888; margin-left:8px; font-weight:600;">(Máx. alcanzado)</span>`;

        return `
        <div class="materia-card">
            <div class="contenedor-materia-parcial">
                <div style="display:flex; align-items:center; min-width: 200px;">
                    <span class="nombreMateria">${materia.nombre}</span>
                    <button class="btn-cerrar-rojo" style="margin-left:8px;" onclick="eliminarMateria('${grupo.nombre}', '${materia.nombre}')" title="Eliminar Materia">
                        &times;
                    </button>
                </div>
                
                <div class="parcial-contenedor">
                    ${materia.parciales.map(parcial => `
                        <div class="parcial-chip">
                            <button class="parcial-texto" onclick="IrAProgresiones('${grupo.nombre}', '${materia.nombre}', '${parcial.nombre}')">
                                ${parcial.nombre}
                            </button>
                            
                            <button class="btn-cerrar-rojo" onclick="eliminarParcial('${grupo.nombre}', '${materia.nombre}', '${parcial.nombre}')" title="Eliminar Parcial">
                                &times;
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                ${mostrarBotonAgregar}
            </div>
        </div>
    `}).join('');
}

// 3. AGREGAR MATERIA
function agregarMateria(nombreGrupo) {
    const nombreMateria = prompt("Nombre de la materia:");
    if (!nombreMateria) return;

    fetch('/api/crear_materia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupo: nombreGrupo, materia: nombreMateria })
    })
    .then(r => r.json())
    .then(data => {
        if(data.exito) renderizarGrupos();
        else alert(data.mensaje);
    });
}

// 4. AGREGAR PARCIAL (AUTOMÁTICO, MAX 3)
function agregarParcial(nombreGrupo, nombreMateria, cantidadActual) {
    // Doble verificación por seguridad
    if (cantidadActual >= 3) {
        alert("Ya has alcanzado el máximo de 3 parciales.");
        return;
    }

    // Nombre automático
    const nombreParcial = `Parcial ${cantidadActual + 1}`;

    fetch('/api/crear_parcial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupo: nombreGrupo, materia: nombreMateria, parcial: nombreParcial })
    })
    .then(r => r.json())
    .then(data => {
        if(data.exito) renderizarGrupos();
        else alert(data.mensaje);
    });
}

// 5. ELIMINAR
function eliminarGrupo(nombreGrupo) {
    if(!confirm(`¿Eliminar todo el Grupo ${nombreGrupo}?`)) return;
    callEliminarAPI({ grupo: nombreGrupo });
}

function eliminarMateria(nombreGrupo, nombreMateria) {
    if(!confirm(`¿Eliminar la materia ${nombreMateria}?`)) return;
    callEliminarAPI({ grupo: nombreGrupo, materia: nombreMateria });
}

function eliminarParcial(nombreGrupo, nombreMateria, nombreParcial) {
    if(!confirm(`¿Eliminar ${nombreParcial}?`)) return;
    callEliminarAPI({ grupo: nombreGrupo, materia: nombreMateria, parcial: nombreParcial });
}

function callEliminarAPI(payload) {
    fetch('/api/eliminar_elemento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(data => {
        if(data.exito) renderizarGrupos();
        else alert("Error al eliminar: " + data.mensaje);
    });
}