// ==========================================
// 1. VARIABLES GLOBALES
// ==========================================
// Guardamos referencias a las vistas HTML para poder mostrarlas/ocultarlas
const groupsView = document.getElementById('groups-view');
const selectionView = document.getElementById('selection-view');
const chartsView = document.getElementById('charts-view');
const breadcrumb = document.getElementById('breadcrumb');

const studentsView = document.getElementById('students-view');
const activitiesView = document.getElementById('activities-view');

// Variable para guardar el gráfico actual (para poder destruirlo antes de crear uno nuevo)
let graficoActual = null;

// Variables para guardar datos seleccionados (simulados)
let grupoSeleccionado = '';
let descripcionGrupo = '';

// ==========================================
// 2. FUNCIÓN DE NAVEGACIÓN: SELECCIONAR GRUPO
// ==========================================
// Esta función se ejecuta cuando clickeas una tarjeta de grupo (ej: 401-A)
function seleccionarGrupo(id, descripcion) {
    // Guardamos los datos
    grupoSeleccionado = id;
    descripcionGrupo = descripcion;

    // 1. Ocultamos la vista actual (Lista de grupos)
    groupsView.style.display = 'none';

    // 2. Mostramos la siguiente vista (Selección de tipo)
    selectionView.style.display = 'flex';

    // 3. Actualizamos las "Migas de pan" (texto superior)
    breadcrumb.innerHTML = `
        <span class="bradcrumb-link" onclick="irInicio()">Estadísticas</span> > 
        <span class="bradcrumb-link">${id}</span>
    `;
}

// ==========================================
// 3. FUNCIÓN PARA CREAR GRÁFICOS CON CHART.JS
// ==========================================
// 'tipo' puede ser: 'alumno', 'actividad', o 'grupo'
function cargarGrafico(tipo) {
    // 1. Ocultar la selección de tarjetas
    selectionView.style.display = 'none';

    if (tipo === 'alumno') {
        // Mostrar lista de botones de alumnos
        studentsView.style.display = 'flex';
        breadcrumb.innerHTML += ` > <span class="bradcrumb-link">Alumnos</span>`;
    
    } else if (tipo === 'actividad') {
        // Mostrar tabla de actividades
        activitiesView.style.display = 'flex';
        breadcrumb.innerHTML += ` > <span class="bradcrumb-link">Actividades</span>`;
    
    } else if (tipo === 'grupo') {
        // El grupo va directo al gráfico (promedio general)
        mostrarCanvasFinal('grupo', 'Promedio General', 'Promedio del Grupo');
    }
}

// ==========================================
// FUNCIONES FINALES (Llevan al gráfico)
// ==========================================

function verGraficoAlumno(nombreAlumno) {
    studentsView.style.display = 'none';
    // Llamamos al gráfico pasando el nombre del alumno
    mostrarCanvasFinal('alumno', nombreAlumno, 'Materia: Programación Estructurada');
}

function verGraficoActividad(nombreActividad, tema) {
    activitiesView.style.display = 'none';
    // Llamamos al gráfico pasando la actividad
    mostrarCanvasFinal('actividad', nombreActividad, `Tema: ${tema}`);
}

// ==========================================
// RENDERIZADO DEL GRÁFICO (Chart.js)
// ==========================================
function mostrarCanvasFinal(tipo, nombreDato, detalleExtra) {
    chartsView.style.display = 'flex';
    
    // 1. LLENAR LOS DATOS DEL ENCABEZADO (Como en la imagen)
    
  document.getElementById('chart-group')
document.getElementById('chart-subject')

const labelTipo = document.getElementById('chart-label');
const spanDato = document.getElementById('chart-detail');

    if (tipo === 'alumno') {
        labelTipo.innerText = "Alumno:";   // Pone "Alumno:" en negrita
        spanDato.innerText = nombreDato;   // Pone "Denilson Alexis..."
    } else if (tipo === 'actividad') {
        labelTipo.innerText = "Actividad:"; // Pone "Actividad:" en negrita
        spanDato.innerText = `${nombreDato} - ${detalleExtra}`; // Ej: "Sopa de letras - Archivos"
    } else {
        labelTipo.innerText = "Vista:";
        spanDato.innerText = "General del Grupo";
    }

// 2. CONFIGURACIÓN DEL GRÁFICO (Chart.js)
const ctx = document.getElementById('statisticsChart').getContext('2d');

if (graficoActual) {
    graficoActual.destroy();
}

let config = {};

// ==========================================
// GRÁFICA DE ALUMNO
// ==========================================
if (tipo === 'alumno') {

    config = {
        type: 'bar',

        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],

            datasets: [{
                data: [8, 10, 8.5, 6, 8, 7, 5, 10, 9, 10, 8],

                backgroundColor: '#8CAE8C',
                hoverBackgroundColor: '#3E8E41',

                borderRadius: 0,
                barPercentage: 0.45
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true,
                    max: 10,

                    title: {
                        display: true,
                        text: 'Calificación',
                        color: '#1f3fb7',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },

                    grid: {
                        color: '#c8dfc8'
                    }
                },

                x: {

                    title: {
                        display: true,
                        text: 'No_Lección',
                        color: '#1f3fb7',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },

                    grid: {
                        display: false
                    }
                }
            }
        }
    };
}

// ==========================================
// GRÁFICA DE ACTIVIDAD
// ==========================================
else if (tipo === 'actividad') {

    config = {
        type: 'bar',

        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],

            datasets: [{
                data: [9, 13, 13, 14, 17, 21, 32, 33, 26, 28, 30],

                backgroundColor: '#8CAE8C',
                hoverBackgroundColor: '#3E8E41',

                borderRadius: 0,
                barPercentage: 0.45
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true,

                    title: {
                        display: true,
                        text: 'Cantidad de alumnos',
                        color: '#1f3fb7',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },

                    grid: {
                        color: '#c8dfc8'
                    }
                },

                x: {

                    title: {
                        display: true,
                        text: 'Calificación',
                        color: '#1f3fb7',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },

                    grid: {
                        display: false
                    }
                }
            }
        }
    };
}

// ==========================================
// GRÁFICA DE GRUPO
// ==========================================
else if (tipo === 'grupo') {

    config = {
        type: 'bar',

        data: {
            labels: ['0', '1', '2', '3', '4', '5'],

            datasets: [{
                data: [8, 8.5, 6, 10, 9, 10],

                backgroundColor: '#8CAE8C',
                hoverBackgroundColor: '#3E8E41',

                borderRadius: 0,
                barPercentage: 0.65
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true,
                    max: 10,

                    title: {
                        display: true,
                        text: 'Calificaciones Promedio',
                        color: '#1f3fb7',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },

                    grid: {
                        color: '#c8dfc8'
                    }
                },

                x: {

                    title: {
                        display: true,
                        text: 'No_Lección',
                        color: '#1f3fb7',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },

                    grid: {
                        display: false
                    }
                }
            }
        }
    };
}

    graficoActual = new Chart(ctx, config);
}

// Función auxiliar para el botón "Atrás" en las listas
function regresarASeleccion() {
    studentsView.style.display = 'none';
    activitiesView.style.display = 'none';
    selectionView.style.display = 'flex';
    // Restaurar migas de pan (simplificado)
    breadcrumb.innerHTML = `<span class="bradcrumb-link" onclick="irInicio()">Estadísticas</span> > <span class="bradcrumb-link">${grupoSeleccionado}</span>`;
}

// ==========================================
// 4. FUNCIÓN PARA REGRESAR
// ==========================================
function regresar() {
    // Si estamos en gráficos, volvemos a selección
    if (chartsView.style.display === 'flex') {
        chartsView.style.display = 'none';
        selectionView.style.display = 'flex';
        // Destruimos el gráfico para ahorrar memoria
        if (graficoActual) graficoActual.destroy();
    }
}

// Función auxiliar para volver al inicio desde las migas de pan
function irInicio() {
    location.reload(); // Recarga simple para reiniciar todo
}