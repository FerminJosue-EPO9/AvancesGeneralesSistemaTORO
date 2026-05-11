from flask import jsonify,Flask, current_app, render_template, request, redirect, url_for, session
import os
import shutil

# Diccionario para mapear ID de plantilla con su imagen y nombre legible
CATALOGO_PLANTILLAS = {
    'P001': {'tipo': 'Crucigrama', 'img': 'img/imagenesActividades/CRUCIGRAMA.png'},
    'P002': {'tipo': 'Cuestionario F/V', 'img': 'img/imagenesActividades/FV.png'},
    'P003': {'tipo': 'Opción Múltiple', 'img': 'img/imagenesActividades/OPCIONES.png'},
    'P004': {'tipo': 'Sopa de Letras', 'img': 'img/imagenesActividades/SOPA.png'},
        'P005': {'tipo': 'Completar Camino', 'img': 'img/imagenesActividades/COMPLETACAMINO.png'},
    'P006': {'tipo': 'Completar Palabra', 'img': 'img/imagenesActividades/COMPLETARPALABRA.png'},
}

def cargar_actividades():
    ruta_carpeta = 'data/actividades'
    lista_actividades = []

    # Crear carpeta si no existe
    if not os.path.exists(ruta_carpeta):
        os.makedirs(ruta_carpeta)

    # Recorrer todos los archivos .txt en la carpeta
    for archivo in os.listdir(ruta_carpeta):
        if archivo.endswith('.txt'):
            ruta_completa = os.path.join(ruta_carpeta, archivo)
            datos = {}
            
            # Leemos solo el encabezado (hasta encontrar '---')
            try:
                with open(ruta_completa, 'r', encoding='utf-8') as f:
                    for linea in f:
                        linea = linea.strip()
                        if linea == '---': 
                            break # Dejamos de leer al llegar al contenido
                        if ':' in linea:
                            clave, valor = linea.split(':', 1)
                            datos[clave.strip()] = valor.strip()
                
                # Procesamos la información visual (Imagen y Nombre del Tipo)
                id_plantilla = datos.get('ID_PLANTILLA', '')
                info_visual = CATALOGO_PLANTILLAS.get(id_plantilla, {'tipo': 'Desconocido', 'img': 'img/default.png'})
                
                datos['TIPO_LEGIBLE'] = info_visual['tipo']
                datos['IMAGEN'] = info_visual['img']
                datos['ARCHIVO'] = archivo # Guardamos el nombre del archivo para borrar/editar
                
                # Si no pusiste fecha en el txt, ponemos una por defecto
                if 'FECHA' not in datos:
                    datos['FECHA'] = '01/02/2026' 

                lista_actividades.append(datos)
            except Exception as e:
                print(f"Error leyendo {archivo}: {e}")

    return lista_actividades
app = Flask(__name__)
# Esta llave es necesaria para usar 'session' y que los datos no se pierdan
app.secret_key = 'toro_secret_key_2026' 

# --- FUNCIÓN DE LECTURA ---
def leer_datos(archivo):
    ruta = os.path.join('data', archivo)
    if os.path.exists(ruta):
        with open(ruta, 'r', encoding='utf-8') as f:
            return [linea.strip() for linea in f.readlines()]
    return []

# --- RUTAS ---

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    # Solo "registramos" el nombre y apellido en la sesión
    nombre = request.form.get('nombre')
    apellidos = request.form.get('apellidos')
    
    if nombre and apellidos:
        session['profesor'] = f"{nombre} {apellidos}"
        return redirect(url_for('vista_contenido'))
    
    return redirect(url_for('index'))

# ==========================================
# UTILIDAD: FORMATEADOR DE ACTIVIDADES V2 (BLINDADO)
# ==========================================
import time # Importamos aquí para asegurar que exista

@app.route('/formatear_actividades')
def formatear_actividades():
    ruta_origen = os.path.join(app.root_path, 'data', 'actividades')
    ruta_destino = os.path.join(app.root_path, 'data', 'actividades-formateadas')
    
    if not os.path.exists(ruta_destino):
        os.makedirs(ruta_destino)

    log_errores = []
    procesados = 0

    if not os.path.exists(ruta_origen):
        return "No existe la carpeta data/actividades"

    for nombre_archivo in os.listdir(ruta_origen):
        if nombre_archivo.endswith('.txt'):
            path_origen = os.path.join(ruta_origen, nombre_archivo)
            
            try:
                # 1. INTENTO DE LECTURA ROBUSTA (UTF-8 o LATIN-1 para Windows)
                contenido = ""
                try:
                    with open(path_origen, 'r', encoding='utf-8') as f:
                        contenido = f.read()
                except UnicodeDecodeError:
                    with open(path_origen, 'r', encoding='latin-1') as f:
                        contenido = f.read()

                # 2. SEPARAR CABECERA Y CUERPO
                if '---' in contenido:
                    partes = contenido.split('---')
                    cabecera = partes[0].strip().split('\n')
                    cuerpo = partes[1].strip().split('\n')
                else:
                    # Si no hay separador, asumimos que todo es cabecera o fallamos suavemente
                    cabecera = contenido.strip().split('\n')
                    cuerpo = []

                # 3. EXTRAER METADATOS VIEJOS
                meta = {}
                for linea in cabecera:
                    if ':' in linea:
                        clave, valor = linea.split(':', 1)
                        meta[clave.strip()] = valor.strip()

                # 4. CONSTRUIR NUEVO FORMATO
                nuevo = []
                nuevo.append("=== [ENTIDAD: PROFESOR] ===")
                nuevo.append("ID_PROFESOR: 101")
                nuevo.append("NOMBRE_COMPLETO: Profesor T.O.R.O.\n")

                nuevo.append("=== [ENTIDAD: LECCIÓN] ===")
                nuevo.append(f"ID_LECCION: {nombre_archivo.replace('.txt', '')}")
                # Manejo seguro si no existe la clave LECCION
                nuevo.append(f"TITULO: {meta.get('LECCION', 'Generico')}")
                nuevo.append("TEMA: General\n")

                nuevo.append("--- [RELACIÓN: INCORPORA -> CONTENIDO MULTIMEDIA] ---")
                nuevo.append("CONTENIDO_1: estandar.jpg | Tipo: Imagen | Ruta: ./assets/estandar.jpg\n")

                nuevo.append("=== [ENTIDAD: ACTIVIDAD] ===")
                # ID aleatorio basado en el nombre para que no cambie siempre
                nuevo.append(f"ID_ACTIVIDAD: ACT-{abs(hash(nombre_archivo))}") 
                nuevo.append(f"NOMBRE_ACTIVIDAD: {meta.get('NOMBRE', nombre_archivo)}")
                nuevo.append(f"INTENTOS_MAX: {meta.get('INTENTOS', '1')}")
                
                tiempo = meta.get('TIEMPO', '0').lower().replace('minutos', '').replace('mins', '').strip()
                nuevo.append(f"TIEMPO_ESTIMADO: {tiempo} minutos\n")

                nuevo.append("--- [RELACIÓN: GENERA <- PLANTILLA: OPCIÓN MÚLTIPLE] ---")

                # 5. PROCESAR PREGUNTAS (Lógica de Opción Múltiple)
                contador = 1
                letras = ['a', 'b', 'c', 'd']
                
                for linea in cuerpo:
                    linea = linea.strip()
                    if not linea: continue
                    
                    # Limpiamos espacios alrededor de cada parte con .strip()
                    campos = [c.strip() for c in linea.split('|')]
                    
                    if len(campos) >= 6:
                        preg_texto = campos[0]
                        opciones = campos[1:5] # Las 4 opciones
                        respuesta_correcta_texto = campos[5]

                        # Buscar la letra correcta comparando texto
                        letra = 'a' # Default
                        match_encontrado = False
                        
                        # Intento 1: Coincidencia exacta
                        if respuesta_correcta_texto in opciones:
                            letra = letras[opciones.index(respuesta_correcta_texto)]
                            match_encontrado = True
                        
                        # Intento 2: Si no encuentra, puede que la respuesta sea "A", "B", etc.
                        if not match_encontrado and len(respuesta_correcta_texto) == 1:
                            letra = respuesta_correcta_texto.lower()

                        nuevo.append(f"PREGUNTA_{contador}: {preg_texto}")
                        nuevo.append(f"OPCIONES: a) {opciones[0]}, b) {opciones[1]}, c) {opciones[2]}, d) {opciones[3]}")
                        nuevo.append(f"RESPUESTA: {letra}\n")
                        contador += 1

                # 6. GUARDAR
                path_destino = os.path.join(ruta_destino, nombre_archivo)
                with open(path_destino, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(nuevo))
                
                procesados += 1

            except Exception as e:
                # Guardamos el error específico para mostrártelo
                log_errores.append(f"{nombre_archivo}: {str(e)}")

    # RESULTADO FINAL
    if log_errores:
        return jsonify({
            'status': 'Con Errores',
            'procesados': procesados,
            'errores': log_errores
        })
    else:
        return f"¡Éxito! {procesados} archivos convertidos correctamente en data/actividades-formateadas"



# --- RUTAS DE CONTENIDO ---
from gestor_archivos import obtener_lista_lecciones

@app.route('/contenido')
def vista_contenido():
    # 1. CARGA DINÁMICA: Obtenemos los nombres de las carpetas reales 
    # desde C:\...\data\LECCIONES DISPONIBLES
    lecciones_reales = obtener_lista_lecciones()

    # 2. Cargar Actividades (tu lógica de archivos .txt de actividades)
    actividades = cargar_actividades()

    # Enviamos 'lecciones_reales' al HTML bajo el nombre 'lecciones'
    return render_template('contenido/contenido.html', 
                           lecciones=lecciones_reales, 
                           actividades=actividades, 
                           active_page='contenido')

from gestor_archivos import crear_estructura_leccion, obtener_lista_lecciones
from werkzeug.utils import secure_filename

@app.route('/contenido/subir_leccion', methods=['GET', 'POST'])
def subir_leccion():
    if request.method == 'POST':
        # 1. Recibir datos del formulario (usamos .get para evitar errores si falta un campo)
        grupo = request.form.get('grupo')
        materia = request.form.get('materia')
        parcial = request.form.get('parcial')
        tema = request.form.get('tema')
        actividad = request.form.get('actividad')
        
        # 2. Recibir los archivos
        archivos_subidos = request.files.getlist('archivos') 

        try:
            # 3. Crear la carpeta (Usando tu función dinámica de gestor_archivos.py)
            ruta_destino = crear_estructura_leccion(grupo, materia, parcial, tema, actividad)

            # 4. Guardar cada archivo seleccionado
            guardados = 0
            for archivo in archivos_subidos:
                if archivo and archivo.filename:
                    # secure_filename limpia nombres con caracteres raros
                    nombre_seguro = secure_filename(archivo.filename)
                    archivo.save(os.path.join(ruta_destino, nombre_seguro))
                    guardados += 1
            
            print(f"Éxito: Se creó la carpeta en {ruta_destino} y se guardaron {guardados} archivos.")
            
            # 5. EL REGRESO AUTOMÁTICO:
            # Al terminar, Flask le ordena al navegador volver a la lista principal
            # donde la función 'vista_contenido' leerá la nueva carpeta creada.
            return redirect(url_for('vista_contenido'))

        except Exception as e:
            print(f"Error al crear lección: {e}")
            return f"Hubo un error al procesar la carpeta: {e}", 500

    # Si es GET (al cargar la página por primera vez), mostramos el formulario
    lecciones_existentes = obtener_lista_lecciones()
    return render_template('contenido/contenido_crear_leccion.html', 
                           lecciones=lecciones_existentes,
                           active_page='contenido')
    
@app.route('/actividad/eliminar/<string:nombre_archivo>')
def eliminar_actividad(nombre_archivo):
    # 1. Construimos la ruta completa
    carpeta_actividades = 'data/actividades'
    ruta_completa = os.path.join(carpeta_actividades, nombre_archivo)
    
    # 2. Verificamos que exista y lo borramos
    try:
        if os.path.exists(ruta_completa):
            os.remove(ruta_completa)
            print(f"Archivo eliminado: {nombre_archivo}") # Para que lo veas en consola
        else:
            print("El archivo no existe")
    except Exception as e:
        print(f"Error al borrar: {e}")

    # 3. Redirigimos de vuelta a la lista para ver los cambios
    return redirect(url_for('vista_contenido'))


@app.route('/actividad/editar/<string:nombre_archivo>', methods=['GET', 'POST'])
def editar_actividad(nombre_archivo):
    # 1. Definir ruta
    carpeta = os.path.join(current_app.root_path, 'data', 'actividades') # Es más seguro usar os.path.join completo
    ruta_completa = os.path.join(carpeta, nombre_archivo)
    
    # 2. LEER EL ARCHIVO COMPLETO
    try:
        with open(ruta_completa, 'r', encoding='utf-8') as f:
            contenido_total = f.read()
    except FileNotFoundError:
        return "Error: El archivo no existe."

    # 3. PARSEAR (INTERPRETAR) EL CONTENIDO ORIGINAL
    partes = contenido_total.split('---')
    cabecera_lines = partes[0].strip().split('\n')
    cuerpo_original = partes[1].strip() if len(partes) > 1 else ""

    # Extraer metadatos
    meta = {}
    for linea in cabecera_lines:
        if ':' in linea:
            clave, valor = linea.split(':', 1)
            meta[clave.strip()] = valor.strip()

    # Recuperar valores que no deben cambiar
    id_actividad = meta.get('ID_ACTIVIDAD', 'ERROR-ID')
    id_plantilla = meta.get('ID_PLANTILLA', 'P000')
    fecha = meta.get('FECHA', '01/01/2026')

    # --- LÓGICA DE GUARDADO (POST) ---
    if request.method == 'POST':
        # Obtenemos SOLO el nombre y el contenido raw (Ya no pedimos instrucciones)
        nuevo_nombre = request.form['nombre']
        nuevo_contenido = request.form['contenido_raw']
        
        # Reconstruimos el archivo
        nuevo_archivo_str = f"ID_ACTIVIDAD: {id_actividad}\n"
        nuevo_archivo_str += f"ID_PLANTILLA: {id_plantilla}\n"
        nuevo_archivo_str += f"FECHA: {fecha}\n"
        nuevo_archivo_str += f"NOMBRE: {nuevo_nombre}\n"
        # NOTA: Se eliminó la línea de INSTRUCCIONES aquí
        nuevo_archivo_str += "---\n"
        nuevo_archivo_str += nuevo_contenido.strip()
        
        # Sobrescribimos
        with open(ruta_completa, 'w', encoding='utf-8') as f:
            f.write(nuevo_archivo_str)
            
        return redirect(url_for('vista_contenido'))

    # --- LÓGICA DE MOSTRAR (GET) ---
    datos_vista = {
        'NOMBRE': meta.get('NOMBRE', ''),
        # Ya no enviamos INSTRUCCIONES a la vista
        'CUERPO': cuerpo_original
    }

    return render_template('contenido/editar_actividad.html', 
                           archivo=nombre_archivo, 
                           datos=datos_vista,
                           id_plantilla=id_plantilla, 
                           active_page='contenido')

# Asegúrate de tener CATALOGO_PLANTILLAS definido arriba en tu código

from flask import redirect, url_for, request

@app.route('/actividad/crear', methods=['GET', 'POST'])
def crear_actividad():
    if request.method == 'POST':
        try:
            # 1. RECOLECCIÓN DE DATOS DEL FORMULARIO
            plantilla = request.form.get('plantilla_seleccionada')
            leccion_padre = request.form.get('leccion_padre')
            nombre_actividad = request.form.get('nombre_confirmacion') 
            intentos = request.form.get('intentos')
            tiempo_num = request.form.get('tiempo_limite') or "Sin límite"
            instrucciones = request.form.get('instrucciones') or "Sin instrucciones específicas."
            
            # Validación básica
            if not nombre_actividad or not leccion_padre:
                return "Faltan datos obligatorios (Nombre o Lección)", 400

            # 2. PROCESAR PREGUNTAS DINÁMICAS
            preguntas = []
            claves = sorted(request.form.keys())
            
            for key in claves:
                # Buscamos los inputs que sean "q_1_text", "q_2_text", etc.
                if key.startswith('q_') and key.endswith('_text'):
                    q_id = key.split('_')[1]
                    
                    # Obtenemos la letra correcta (A, B, C, D)
                    letra_correcta = request.form.get(f'q_{q_id}_correct')
                    
                    # Obtenemos los textos de las opciones
                    opA = request.form.get(f'q_{q_id}_optA')
                    opB = request.form.get(f'q_{q_id}_optB')
                    opC = request.form.get(f'q_{q_id}_optC')
                    opD = request.form.get(f'q_{q_id}_optD')
                    
                    # LÓGICA CLAVE: Convertir la LETRA a TEXTO para tu formato
                    texto_correcta = ""
                    if letra_correcta == 'A': texto_correcta = opA
                    elif letra_correcta == 'B': texto_correcta = opB
                    elif letra_correcta == 'C': texto_correcta = opC
                    elif letra_correcta == 'D': texto_correcta = opD

                    pregunta = {
                        "texto": request.form.get(f'q_{q_id}_text'),
                        "opA": opA,
                        "opB": opB,
                        "opC": opC,
                        "opD": opD,
                        "correcta_texto": texto_correcta # Guardamos el texto, no la letra
                    }
                    preguntas.append(pregunta)

            # 3. GENERAR EL FORMATO EXACTO QUE PIDESTE
            # Header
            contenido_archivo = f"ID_PLANTILLA: {plantilla}\n"
            contenido_archivo += f"NOMBRE: {nombre_actividad}\n"
            contenido_archivo += f"LECCION: {leccion_padre}\n"
            contenido_archivo += f"INTENTOS: {intentos}\n"
            # Agregamos la palabra "minutos" si es numérico para igualar tu ejemplo
            contenido_archivo += f"TIEMPO: {tiempo_num} minutos\n" 
            contenido_archivo += f"TOTAL_PREGUNTAS: {len(preguntas)}\n"
            contenido_archivo += f"INSTRUCCIONES: {instrucciones}\n"
            contenido_archivo += "---\n" # El separador vital

            # Body (Preguntas separadas por |)
            # Formato: Pregunta|OpA|OpB|OpC|OpD|RespuestaCorrecta
            for p in preguntas:
                linea = f"{p['texto']}|{p['opA']}|{p['opB']}|{p['opC']}|{p['opD']}|{p['correcta_texto']}\n"
                contenido_archivo += linea

            # 4. GUARDAR ARCHIVO
            ruta_carpeta = os.path.join(app.root_path, 'data', 'Actividades')
            if not os.path.exists(ruta_carpeta):
                os.makedirs(ruta_carpeta)

            nombre_archivo = f"{nombre_actividad.replace(' ', '_')}.txt"
            ruta_completa = os.path.join(ruta_carpeta, nombre_archivo)

            with open(ruta_completa, 'w', encoding='utf-8') as f:
                f.write(contenido_archivo)

            print(f"Actividad guardada: {ruta_completa}")
            return redirect(url_for('vista_contenido'))

        except Exception as e:
            print(f"Error al guardar actividad: {e}")
            return f"Error interno: {str(e)}", 500

    # GET
    lista_lecciones = obtener_lista_lecciones()
    return render_template('contenido/crearActividad.html', 
                           active_page='contenido',
                           lecciones=lista_lecciones)# --- RUTAS DE GRUPOS ---

#RUTAS PARA LA VISTA DE GRUPOS
@app.route('/grupos')
def vista_grupos():
    alumnos = leer_datos('alumnos.txt')
    return render_template('grupos/grupos.html', alumnos=alumnos, active_page='grupos')
@app.route('/api/grupos', methods=['GET'])
def api_obtener_grupos():
    """Escanea data/GRUPOS y devuelve toda la estructura en JSON"""
    ruta_raiz = os.path.join(app.root_path, 'data', 'GRUPOS')
    grupos_data = []

    if os.path.exists(ruta_raiz):
        # 1. Escanear Grupos
        for grupo in os.scandir(ruta_raiz):
            if grupo.is_dir():
                materias_data = []
                
                # 2. Escanear Materias dentro del grupo
                for materia in os.scandir(grupo.path):
                    if materia.is_dir():
                        parciales_data = []
                        
                        # 3. Escanear Parciales dentro de la materia
                        for parcial in os.scandir(materia.path):
                            if parcial.is_dir():
                                parciales_data.append({'nombre': parcial.name})
                        
                        # Ordenamos para que salgan bonitos
                        parciales_data.sort(key=lambda x: x['nombre'])
                        materias_data.append({
                            'nombre': materia.name,
                            'parciales': parciales_data
                        })
                
                grupos_data.append({
                    'nombre': grupo.name,
                    'materias': materias_data
                })
    
    # Ordenar grupos alfabéticamente
    grupos_data.sort(key=lambda x: x['nombre'])
    return jsonify(grupos_data)
@app.route('/api/crear_materia', methods=['POST'])
def api_crear_materia():
    data = request.json
    grupo = data.get('grupo')
    materia = data.get('materia')
    
    ruta = os.path.join(app.root_path, 'data', 'GRUPOS', grupo, materia)
    
    if not os.path.exists(ruta):
        os.makedirs(ruta)
        return jsonify({'exito': True})
    return jsonify({'exito': False, 'mensaje': 'La materia ya existe'})

@app.route('/api/crear_parcial', methods=['POST'])
def api_crear_parcial():
    data = request.json
    grupo = data.get('grupo')
    materia = data.get('materia')
    parcial = data.get('parcial')
    
    ruta = os.path.join(app.root_path, 'data', 'GRUPOS', grupo, materia, parcial)
    
    if not os.path.exists(ruta):
        os.makedirs(ruta)
        return jsonify({'exito': True})
    return jsonify({'exito': False, 'mensaje': 'El parcial ya existe'})

@app.route('/api/eliminar_elemento', methods=['POST'])
def api_eliminar_elemento():
    data = request.json
    
    # Construimos la ruta paso a paso
    ruta = os.path.join(app.root_path, 'data', 'GRUPOS', data.get('grupo', ''))
    
    # Validaciones de seguridad para no borrar de más
    if 'materia' in data: 
        ruta = os.path.join(ruta, data['materia'])
    
    if 'parcial' in data: 
        ruta = os.path.join(ruta, data['parcial'])
    
    # AQUÍ ESTABA EL PELIGRO: Si mandabas borrar una progresión, 
    # pero el dato llegaba vacío, borraba el parcial.
    if 'progresion' in data: 
        if not data['progresion']: # Si el nombre está vacío, cancelamos
             return jsonify({'exito': False, 'mensaje': 'Nombre de progresión inválido'})
        ruta = os.path.join(ruta, data['progresion'])
        
    if 'leccion' in data: 
        if not data['leccion']:
             return jsonify({'exito': False, 'mensaje': 'Nombre de lección inválido'})
        ruta = os.path.join(ruta, data['leccion'])

    # Ejecutar borrado
    if os.path.exists(ruta):
        import shutil
        try:
            if os.path.isfile(ruta):
                os.remove(ruta) # Borrar archivo (Lección .txt)
            else:
                shutil.rmtree(ruta) # Borrar carpeta (Progresión, Materia, etc)
            return jsonify({'exito': True})
        except Exception as e:
            return jsonify({'exito': False, 'mensaje': str(e)})
            
    return jsonify({'exito': False, 'mensaje': 'No encontrado'})
@app.route('/crear_grupo', methods=['POST'])
def crear_grupo():
    try:
        # 1. Recibir datos del Javascript
        nombre_grupo = request.form.get('nombre')
        archivo = request.files.get('archivo')

        if not nombre_grupo or not archivo:
            return jsonify({'exito': False, 'mensaje': 'Faltan datos (nombre o archivo)'})

        # 2. Definir la ruta de la nueva carpeta
        # Limpiamos el nombre para quitar espacios raros si quieres, o lo dejamos tal cual
        nombre_limpio = nombre_grupo.strip() 
        ruta_nueva_carpeta = os.path.join(app.root_path, 'data', 'GRUPOS', nombre_limpio)

        # 3. Crear la carpeta si no existe
        if not os.path.exists(ruta_nueva_carpeta):
            os.makedirs(ruta_nueva_carpeta)
        else:
            return jsonify({'exito': False, 'mensaje': '¡Este grupo ya existe!'})

        # 4. Guardar el archivo de alumnos
        # LO RENOMBRAMOS a "lista_alumnos.txt" para que tu sistema de calificaciones lo encuentre fácil
        ruta_archivo_final = os.path.join(ruta_nueva_carpeta, 'lista_alumnos.txt')
        archivo.save(ruta_archivo_final)

        return jsonify({'exito': True, 'mensaje': 'Grupo creado exitosamente'})

    except Exception as e:
        print(f"Error al crear grupo: {e}")
        return jsonify({'exito': False, 'mensaje': f'Error interno: {str(e)}'})
# ==========================================
# API PROGRESIONES
# ==========================================
@app.route('/api/lecciones_disponibles', methods=['GET'])
def api_lecciones_disponibles():
    # Esta es la carpeta donde guardaste las actividades formateadas
    ruta_banco = os.path.join(app.root_path, 'data', 'actividades-formateadas')
    lecciones = []

    if os.path.exists(ruta_banco):
        for archivo in os.listdir(ruta_banco):
            if archivo.endswith('.txt'):
                # Enviamos solo el nombre del archivo (ej: "Copas.txt")
                lecciones.append(archivo)
    
    lecciones.sort()
    return jsonify(lecciones)

# 2. ASIGNAR (COPIAR) LECCIÓN A LA PROGRESIÓN
@app.route('/api/asignar_leccion', methods=['POST'])
def api_asignar_leccion():
    data = request.json
    nombre_archivo = data['nombre_archivo'] # Ej: "Copas.txt"
    
    # Ruta Origen (Banco)
    ruta_origen = os.path.join(app.root_path, 'data', 'actividades-formateadas', nombre_archivo)
    
    # Ruta Destino (Dentro del Grupo > Materia > Parcial > Progresión)
    carpeta_destino = os.path.join(app.root_path, 'data', 'GRUPOS', 
                        data['grupo'], data['materia'], data['parcial'], data['progresion'])
    
    # Ruta Final del archivo
    ruta_final = os.path.join(carpeta_destino, nombre_archivo)
    
    if not os.path.exists(ruta_origen):
         return jsonify({'exito': False, 'mensaje': 'La lección original no existe.'})

    if os.path.exists(ruta_final):
        return jsonify({'exito': False, 'mensaje': 'Esta lección ya fue asignada a esta progresión.'})

    try:
        # COPIAMOS EL ARCHIVO
        shutil.copy2(ruta_origen, ruta_final)
        return jsonify({'exito': True})
    except Exception as e:
        return jsonify({'exito': False, 'mensaje': str(e)})
# --- RUTA PARA LA VISTA DE PROGRESIONES ---
@app.route('/progresiones')
def vista_progresiones():
    # Asegúrate de que 'progresiones.html' esté en tu carpeta templates
    return render_template('grupos/progresiones.html', active_page='grupos')

@app.route('/api/progresiones', methods=['GET'])
def api_obtener_progresiones():
    grupo = request.args.get('grupo')
    materia = request.args.get('materia')
    parcial = request.args.get('parcial')
    
    ruta_base = os.path.join(app.root_path, 'data', 'GRUPOS', grupo, materia, parcial)
    resultado = []

    if os.path.exists(ruta_base):
        # 1. Escanear Progresiones (CARPETAS)
        for prog in os.scandir(ruta_base):
            if prog.is_dir():
                lecciones = []
                
                # 2. Escanear Lecciones (ARCHIVOS .TXT)
                # ERROR ANTERIOR: Antes buscaba .is_dir(), ahora buscamos .is_file()
                for archivo in os.scandir(prog.path):
                    if archivo.is_file() and archivo.name.endswith('.txt'):
                        lecciones.append(archivo.name)
                
                lecciones.sort() 
                resultado.append({
                    'nombre': prog.name,
                    'lecciones': lecciones
                })
    
    resultado.sort(key=lambda x: x['nombre'])
    return jsonify(resultado)
@app.route('/api/crear_progresion', methods=['POST'])
def api_crear_progresion():
    data = request.json
    ruta = os.path.join(app.root_path, 'data', 'GRUPOS', 
                        data['grupo'], data['materia'], data['parcial'], data['nombre'])
    
    if not os.path.exists(ruta):
        os.makedirs(ruta)
        return jsonify({'exito': True})
    return jsonify({'exito': False, 'mensaje': 'Ya existe'})
# Actualiza tu función 'api_eliminar_elemento' para que soporte el nivel de progresión
# O simplemente usa esta lógica general en el delete anterior:
# Si recibes 'progresion' en el JSON, añádelo a la ruta os.path.join
# --- RUTA DE CALIFICACIONES CORREGIDA ---
# ==========================================
# HELPERS DE CALIFICACIONES (NUEVOS)
# ==========================================

def escanear_estructura_grupo(ruta_grupo):
    """
    Recorre la carpeta del grupo y devuelve un diccionario:
    {
        'Matematicas': ['Parcial 1', 'Parcial 2'],
        'TICS': ['Parcial 1']
    }
    """
    estructura = {}
    if not os.path.exists(ruta_grupo):
        return estructura

    # 1. Buscamos Materias (Carpetas dentro del Grupo)
    for materia in os.scandir(ruta_grupo):
        if materia.is_dir():
            parciales = []
            # 2. Buscamos Parciales (Carpetas dentro de la Materia)
            for parcial in os.scandir(materia.path):
                if parcial.is_dir():
                    parciales.append(parcial.name)
            
            # Ordenamos y guardamos si hay parciales
            if parciales:
                parciales.sort()
                estructura[materia.name] = parciales
    
    return estructura

def leer_resumen_global(ruta_parcial):
    """
    Lee resumen_global.txt y organiza los datos para la tabla.
    Retorna: (lista_columnas, lista_alumnos_procesada)
    """
    archivo = os.path.join(ruta_parcial, 'resumen_global.txt')
    datos_alumnos = {} # Diccionario temporal para agrupar notas
    todas_lecciones = set() # Para saber cuántas columnas hay en total

    if os.path.exists(archivo):
        with open(archivo, 'r', encoding='utf-8') as f:
            for linea in f:
                parts = linea.strip().split('|')
                if len(parts) >= 4:
                    # Formato: MATRICULA|NOMBRE|ID_LECCION|CALIFICACION
                    mat, nom, lec, cal = parts[:4]
                    
                    if mat not in datos_alumnos:
                        datos_alumnos[mat] = {'nombre': nom, 'notas': {}}
                    
                    try:
                        datos_alumnos[mat]['notas'][lec] = float(cal)
                        todas_lecciones.add(lec)
                    except: pass

    # Convertimos el set de lecciones a una lista ordenada (Columnas)
    columnas_ordenadas = sorted(list(todas_lecciones))

    # Convertimos el diccionario a la lista de filas que usa tu HTML
    filas_procesadas = []
    for mat, info in datos_alumnos.items():
        lista_notas = []
        suma = 0
        conteo = 0

        # Para cada columna existente, buscamos si el alumno tiene nota
        for col in columnas_ordenadas:
            val = info['notas'].get(col, 0.0) # 0.0 si no tiene nota
            lista_notas.append(val)
            if val > 0:
                suma += val
                conteo += 1
        
        promedio = round(suma / conteo, 1) if conteo > 0 else 0.0

        filas_procesadas.append({
            'nombre': info['nombre'],
            'matricula': mat,
            'notas': lista_notas,
            'promedio': promedio
        })

    return columnas_ordenadas, filas_procesadas
# --- RUTA 1: SELECCIONAR GRUPO (La vista nueva) ---
@app.route('/calificaciones')
def vista_calificaciones():
    # Ruta a tu carpeta real
    ruta_grupos = os.path.join(app.root_path, 'data', 'GRUPOS')
    
    lista_grupos = []
    
    # Escaneamos las carpetas reales
    if os.path.exists(ruta_grupos):
        for entrada in os.scandir(ruta_grupos):
            if entrada.is_dir():
                lista_grupos.append(entrada.name) # Ej: "Grupo204", "Grupo404"
    
    # Renderizamos la lista, apuntando a la subcarpeta correcta
    return render_template('calificaciones/calificaciones_grupos.html', 
                           grupos=lista_grupos,
                           active_page='calificaciones')
    
    
# --- RUTA 2: VER TABLA (Tu vista anterior, ahora recibe el ID) ---
@app.route('/calificaciones/<string:nombre_grupo>')
def vista_tabla_calificaciones(nombre_grupo):
    # 1. Rutas base
    ruta_grupo_absoluta = os.path.join(app.root_path, 'data', 'GRUPOS', nombre_grupo)
    
    # 2. Obtener estructura del grupo (Qué materias y parciales tiene)
    estructura = escanear_estructura_grupo(ruta_grupo_absoluta)
    
    # 3. Determinar qué mostrar (Filtros)
    # Si el usuario seleccionó algo en los dropdowns, usamos eso.
    # Si no, tomamos el primero que encontremos por defecto.
    materia_sel = request.args.get('materia')
    parcial_sel = request.args.get('parcial')

    # Lógica de "Selección por Defecto"
    if not estructura:
        # Caso triste: Grupo vacío
        return render_template('calificaciones/calificaciones.html', 
                               info_grupo={'nombre': nombre_grupo, 'materia': 'Sin Materias', 'parcial': '-'},
                               columnas=[], filas=[], estructura={}, 
                               sel_materia='', sel_parcial='', active_page='calificaciones')

    # Si no hay materia seleccionada (o la que piden no existe), agarramos la primera
    if not materia_sel or materia_sel not in estructura:
        materia_sel = list(estructura.keys())[0]
        parcial_sel = estructura[materia_sel][0] # Primer parcial de esa materia
    
    # Si hay materia pero no parcial (o no existe), agarramos el primero de esa materia
    if not parcial_sel or parcial_sel not in estructura[materia_sel]:
        parcial_sel = estructura[materia_sel][0]

    # 4. Leer los datos REALES del archivo seleccionado
    ruta_final = os.path.join(ruta_grupo_absoluta, materia_sel, parcial_sel)
    cols, filas = leer_resumen_global(ruta_final)

    # 5. Preparar info para la vista
    info = {
        'nombre': nombre_grupo,
        'materia': materia_sel,
        'parcial': parcial_sel
    }

    return render_template('calificaciones/calificaciones.html',
                           info_grupo=info,
                           columnas=cols,
                           filas=filas,
                           estructura=estructura,     # ¡Importante! Enviamos la estructura para llenar los Selects
                           sel_materia=materia_sel,   # Para saber cuál dejar marcado en el HTML
                           sel_parcial=parcial_sel,
                           active_page='calificaciones')
    
    
# ==========================================
# --- RUTAS DE ESTADISTICAS ---
@app.route('/estadisticas')
def vista_estadisticas():
    return render_template('estadisticas/estadisticas.html', active_page='estadisticas')

if __name__ == '__main__':
    app.run(debug=True)