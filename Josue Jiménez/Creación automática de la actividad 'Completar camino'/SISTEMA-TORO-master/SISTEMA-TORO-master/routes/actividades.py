import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

# Crear el Blueprint
actividades_bp = Blueprint('actividades', __name__)

def ensure_actividades_folder():
    """Asegura que la carpeta data/actividades existe (relativa a la raíz del proyecto)"""
    base_dir = current_app.root_path
    actividades_dir = os.path.join(base_dir, 'data', 'actividades')
    os.makedirs(actividades_dir, exist_ok=True)
    return actividades_dir

@actividades_bp.route('/guardar_actividad_txt', methods=['POST'])
def guardar_actividad_txt():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No se recibieron datos'}), 400

        # Extraer datos del frontend
        izquierda = data.get('izquierda', [])
        derecha = data.get('derecha', [])
        respuestas = data.get('respuestas', {})
        nombre = data.get('nombre', 'Sin_titulo')
        intentos = data.get('intentos', '3')
        tiempo = data.get('tiempo', '')
        fecha_vencimiento = data.get('fecha_vencimiento', 'No definida')
        ponderacion = data.get('ponderacion', '0')
        tipo = data.get('tipo', 'completar-camino')

        # Fecha actual para el campo FECHA
        fecha_hoy = datetime.now().strftime('%d/%m/%Y')

        # ========== 1. CABECERA (para que cargar_actividades la entienda) ==========
        contenido = f"ID_PLANTILLA: C001\n"
        contenido += f"NOMBRE: {nombre}\n"
        contenido += f"FECHA: {fecha_hoy}\n"
        contenido += f"LECCION: General\n"       # Puedes ajustar si quieres
        contenido += f"INTENTOS: {intentos}\n"
        contenido += f"TIEMPO: {tiempo if tiempo else 'Sin límite'} minutos\n"
        contenido += f"PONDERACION: {ponderacion}\n"
        contenido += f"FECHA_VENCIMIENTO: {fecha_vencimiento}\n"
        contenido += "---\n"                     # Separador obligatorio

        # ========== 2. CUERPO (contenido específico de la actividad) ==========
        contenido += "const izquierda = [\n"
        for item in izquierda:
            contenido += f'            "{item}",\n'
        if izquierda:
            contenido = contenido.rstrip(',\n') + "\n        ];\n\n"
        else:
            contenido += "        ];\n\n"

        contenido += "const derecha = [\n"
        for item in derecha:
            contenido += f'            "{item}",\n'
        if derecha:
            contenido = contenido.rstrip(',\n') + "\n        ];\n\n"
        else:
            contenido += "        ];\n\n"

        contenido += "const respuestas = {\n"
        for pregunta, palabra in respuestas.items():
            contenido += f'            "{pregunta}": "{palabra}",\n'
        if respuestas:
            contenido = contenido.rstrip(',\n') + "\n        };\n\n"
        else:
            contenido += "        };\n\n"

        contenido += "@@@ Métricas: \n"
        contenido += f"tipo:{tipo}\n"
        contenido += f"nombre:{nombre}\n"
        contenido += f"intentos:{intentos}\n"
        if tiempo:
            contenido += f"tiempo:{tiempo}\n"
        contenido += f"fecha-vencimiento:{fecha_vencimiento}\n"
        contenido += f"ponderacion:{ponderacion}\n"

        # Crear nombre de archivo seguro
        nombre_archivo = secure_filename(f"{nombre}.txt".replace(' ', '_'))
        actividades_dir = ensure_actividades_folder()
        ruta_completa = os.path.join(actividades_dir, nombre_archivo)

        # Evitar sobrescribir: añade sufijo _1, _2 si ya existe
        if os.path.exists(ruta_completa):
            base, ext = os.path.splitext(nombre_archivo)
            contador = 1
            while os.path.exists(os.path.join(actividades_dir, f"{base}_{contador}{ext}")):
                contador += 1
            nombre_archivo = f"{base}_{contador}{ext}"
            ruta_completa = os.path.join(actividades_dir, nombre_archivo)

        # Guardar archivo
        with open(ruta_completa, 'w', encoding='utf-8') as f:
            f.write(contenido)

        print(f"✅ Actividad guardada en: {ruta_completa}")

        return jsonify({
            'success': True,
            'ruta': ruta_completa,
            'archivo': nombre_archivo
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500