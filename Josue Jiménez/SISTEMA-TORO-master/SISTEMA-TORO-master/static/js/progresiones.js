// Variable global para saber a qué progresión le estamos agregando la lección
let progTarget = ""; 

document.addEventListener("DOMContentLoaded", () => {
    // 1. Recuperar contexto
    const grupo = localStorage.getItem('grupoActual');
    const materia = localStorage.getItem('materiaActual');
    const parcial = localStorage.getItem('parcialActual');

    // Validación de seguridad
    if (!grupo || !materia || !parcial) {
        window.location.href = "/calificaciones"; 
        return;
    }

    // 2. Llenar Breadcrumbs
    document.getElementById('bcGrupo').textContent = `Grupo ${grupo}`;
    document.getElementById('bcGrupo').onclick = () => window.history.back();
    document.getElementById('bcParcial').textContent = `${materia} > ${parcial}`;

    // 3. Cargar Progresiones
    cargarProgresiones(grupo, materia, parcial);
    
    // 4. Configurar Modales
    configurarModalCrear(grupo, materia, parcial);
    configurarModalAsignar(grupo, materia, parcial);
});

// --- CARGAR DATOS ---
function cargarProgresiones(grupo, materia, parcial) {
    const contenedor = document.getElementById('contenedorProgresiones');
    const estadoVacio = document.getElementById('estadoVacio');

    fetch(`/api/progresiones?grupo=${grupo}&materia=${materia}&parcial=${parcial}`)
        .then(res => res.json())
        .then(lista => {
            contenedor.innerHTML = "";

            if (lista.length === 0) {
                estadoVacio.style.display = 'block';
            } else {
                estadoVacio.style.display = 'none';
                
                // RENDERIZAR TARJETAS (CARDS)
                lista.forEach(prog => {
                    const card = document.createElement('div');
                    card.className = 'prog-card';
                    
                    // HTML DE LA TARJETA
                    card.innerHTML = `
                        <div class="prog-header">
                            <span class="prog-titulo">${prog.nombre}</span>
                            <button class="btn-cerrar-blanco" onclick="eliminarProgresion('${prog.nombre}')" title="Eliminar Progresión">
                                &times;
                            </button>
                        </div>
                        
                        <div class="prog-body">
                            <div class="lecciones-container">
                                ${renderizarLeccionesHTML(prog.lecciones, prog.nombre)}
                            </div>
                            
                            <button class="btn-add-leccion" onclick="abrirModalAsignacion('${prog.nombre}')">
                                + Asignar actividad
                            </button>
                        </div>
                    `;
                    contenedor.appendChild(card);
                });
            }
        });
}

// HELPER: Genera los chips de lecciones
function renderizarLeccionesHTML(lecciones, nombreProgresion) {
    if (!lecciones || lecciones.length === 0) return '<span style="color:#999; font-size:0.9rem; margin-right:10px;">Sin actividades asignadas</span>';
    
    return lecciones.map(leccion => `
        <div class="leccion-chip">
            <span>${leccion.replace('.txt', '')}</span>
            <button class="btn-cerrar-rojo-sm" onclick="eliminarLeccion('${nombreProgresion}', '${leccion}')">
                &times;
            </button>
        </div>
    `).join('');
}

// --- LÓGICA DEL MODAL DE ASIGNACIÓN (NUEVO) ---
function abrirModalAsignacion(nombreProgresion) {
    progTarget = nombreProgresion; // Guardamos quién es el dueño
    const modal = document.getElementById('modalAsignarLeccion');
    const select = document.getElementById('selectLeccion');

    // 1. Mostrar modal y loading
    modal.classList.remove('hidden');
    select.innerHTML = '<option>Cargando lecciones...</option>';

    // 2. Pedir lista al servidor
    fetch('/api/lecciones_disponibles')
        .then(r => r.json())
        .then(lecciones => {
            select.innerHTML = ''; // Limpiar
            
            if (lecciones.length === 0) {
                select.innerHTML = '<option value="">No hay actividades en el banco</option>';
                return;
            }
            
            // Llenar el Select
            lecciones.forEach(lec => {
                const option = document.createElement('option');
                option.value = lec; // El valor real es el nombre del archivo (ej: Copas.txt)
                option.textContent = lec.replace('.txt', ''); // Lo que ve el usuario
                select.appendChild(option);
            });
        });
}

function configurarModalAsignar(grupo, materia, parcial) {
    const modal = document.getElementById('modalAsignarLeccion');
    const btnCancelar = document.getElementById('btnCancelarAsig');
    const btnConfirmar = document.getElementById('btnConfirmarAsig');

    btnCancelar.onclick = () => modal.classList.add('hidden');

    btnConfirmar.onclick = () => {
        const nombreArchivo = document.getElementById('selectLeccion').value;
        
        if (!nombreArchivo) {
            alert("Selecciona una lección válida");
            return;
        }

        // Enviar a Python para COPIAR el archivo
        fetch('/api/asignar_leccion', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                grupo: grupo,
                materia: materia,
                parcial: parcial,
                progresion: progTarget, // Variable global
                nombre_archivo: nombreArchivo
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.exito) {
                modal.classList.add('hidden');
                cargarProgresiones(grupo, materia, parcial); // Recargar pantalla
            } else {
                alert("Error: " + data.mensaje);
            }
        });
    };
}

// --- LÓGICA DEL MODAL DE CREAR PROGRESIÓN (EXISTENTE) ---
function configurarModalCrear(grupo, materia, parcial) {
    const modal = document.getElementById('modalProgresion');
    const btnCrear = document.getElementById('botonCrear');
    const btnCancelar = document.getElementById('botonCancelar');
    const btnGuardar = document.getElementById('botonGuardar');

    btnCrear.onclick = () => {
        modal.classList.remove('hidden');
        document.getElementById('inputNumero').focus();
    };

    btnCancelar.onclick = () => modal.classList.add('hidden');

    btnGuardar.onclick = () => {
        const num = document.getElementById('inputNumero').value.trim();
        const tema = document.getElementById('inputTema').value.trim();

        if (!num || !tema) {
            alert("Por favor completa el número y el tema");
            return;
        }

        const nombreCarpeta = `Progresión ${num} - ${tema}`;

        fetch('/api/crear_progresion', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                grupo: grupo, materia: materia, parcial: parcial, nombre: nombreCarpeta
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.exito) {
                modal.classList.add('hidden');
                document.getElementById('inputNumero').value = '';
                document.getElementById('inputTema').value = '';
                cargarProgresiones(grupo, materia, parcial);
            } else {
                alert(data.mensaje);
            }
        });
    };
}

// --- FUNCIONES DE ELIMINAR ---

function eliminarLeccion(nombreProg, nombreLeccion) {
    const grupo = localStorage.getItem('grupoActual');
    const materia = localStorage.getItem('materiaActual');
    const parcial = localStorage.getItem('parcialActual');

    if(!confirm(`¿Quitar la lección "${nombreLeccion}" de esta progresión?`)) return;

    fetch('/api/eliminar_elemento', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            grupo: grupo, materia: materia, parcial: parcial,
            progresion: nombreProg,
            leccion: nombreLeccion
        })
    }).then(() => cargarProgresiones(grupo, materia, parcial));
}

function eliminarProgresion(nombreProg) {
    const grupo = localStorage.getItem('grupoActual');
    const materia = localStorage.getItem('materiaActual');
    const parcial = localStorage.getItem('parcialActual');

    if(!confirm(`¿Borrar TODA la "${nombreProg}" y sus actividades asignadas?`)) return;

    fetch('/api/eliminar_elemento', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            grupo: grupo, materia: materia, parcial: parcial,
            progresion: nombreProg
        })
    }).then(() => cargarProgresiones(grupo, materia, parcial));
}