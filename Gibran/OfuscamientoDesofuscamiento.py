"""
reporte.py  —  Ofusca archivos .txt de cada lección y empaqueta en .zip

Uso:
    python reporte.py ofuscar      → Ofusca todos los .txt en LECCIONES DISPONIBLES y genera .zip en Actividades-Formateadas
    python reporte.py desofuscar   → Desofusca un archivo .txt individual

Ruta pensada actual (relativa a este script):
    ../Josue Jiménez/
        Unificacion de la division de Grupos/SISTEMA-TORO-master/
            data/
                LECCIONES DISPONIBLES/
                    A_Español_P3_Introducción_LECCION C.../
                        index.html
                        info_leccion.txt
                    A_Matemáticas_P1_.../
                        index.html
                        info_leccion.txt
                Actividades-Formateadas/
"""

import sys
import os
import base64
import zipfile
import glob


# ─────────────────────────────────────────────
# RUTAS  (relativas al directorio de este script)
# ─────────────────────────────────────────────

def obtener_ruta_base():
    """Devuelve la ruta al directorio que contiene a Gibran (donde está el script)"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # script_dir  →  .../Gibran
    # padre       →  .../  (contiene Gibran y Josue Jiménez)
    return os.path.dirname(script_dir)


def buscar_carpeta_sistema(ruta: str) -> str:
    """
    Dentro de 'Josue Jiménez/Unificacion de la division de Grupos/'
    busca la carpeta que contenga 'data/LECCIONES DISPONIBLES'.
    Devuelve la ruta completa a esa carpeta 'data'.
    """
    unificacion = os.path.join(ruta, "Unificacion de la division de Grupos")
    if not os.path.isdir(unificacion):
        # Intentar búsqueda flexible por si el nombre varía levemente
        candidatos = [d for d in os.listdir(ruta)
                    if os.path.isdir(os.path.join(ruta, d))
                    and "unificacion" in d.lower()]
        if not candidatos:
            print(f"ERROR: No se encontró la carpeta 'Unificacion de la division de Grupos' en:\n  {ruta}")
            sys.exit(1)
        unificacion = os.path.join(ruta, candidatos[0])

    # Buscar subcarpeta que tenga /data dentro
    for nombre in os.listdir(unificacion):
        ruta_data = os.path.join(unificacion, nombre, "data")
        if os.path.isdir(ruta_data):
            return ruta_data

    print(f"ERROR: No se encontró ninguna carpeta con subcarpeta 'data' dentro de:\n  {unificacion}")
    sys.exit(1)


# ─────────────────────────────────────────────
# OFUSCACIÓN / DESOFUSCACIÓN
# ─────────────────────────────────────────────

def ofuscar_reporte(texto: str) -> str:
    firma = str(len(texto) * 77)
    texto_con_firma = texto + "||" + firma
    texto_modificado = "".join(chr(ord(c) + 3) for c in texto_con_firma)
    encoded_bytes = texto_modificado.encode("utf-8")
    return base64.b64encode(encoded_bytes).decode("ascii")


def desofuscar_reporte(base64_str: str) -> str:
    try:
        decoded_bytes = base64.b64decode(base64_str)
        texto_modificado = decoded_bytes.decode("utf-8")
        texto_original = "".join(chr(ord(c) - 3) for c in texto_modificado)

        partes = texto_original.split("||")
        if len(partes) != 2:
            return "ERROR: Formato de archivo inválido."

        contenido, firma_recibida = partes[0], partes[1]
        firma_calculada = str(len(contenido) * 77)

        if firma_recibida == firma_calculada:
            return contenido
        else:
            return "ALERTA: Este archivo fue MANIPULADO. Las calificaciones no son confiables"

    except Exception:
        return "ERROR: El archivo está corrupto o no es un reporte válido."


# ─────────────────────────────────────────────
# FUNCIONES AUXILIARES DE ARCHIVO
# ─────────────────────────────────────────────

def leer_archivo(ruta: str) -> str:
    ruta_abs = os.path.abspath(ruta)
    if not os.path.exists(ruta_abs):
        print(f"  ✗ No se encontró el archivo: {ruta_abs}")
        sys.exit(1)
    with open(ruta_abs, "r", encoding="utf-8") as f:
        return f.read()


def escribir_archivo(ruta: str, contenido: str):
    ruta_abs = os.path.abspath(ruta)
    os.makedirs(os.path.dirname(ruta_abs), exist_ok=True)
    with open(ruta_abs, "w", encoding="utf-8") as f:
        f.write(contenido)


# ─────────────────────────────────────────────
# ACCIÓN PRINCIPAL: OFUSCAR LECCIONES
# ─────────────────────────────────────────────

def procesar_lecciones():
    """
    1. Localiza cada carpeta dentro de 'LECCIONES DISPONIBLES'.
    2. Busca el .txt dentro de cada carpeta.
    3. Ofusca el .txt.
    4. Crea un .zip con el .txt ofuscado y el index.html.
    5. Guarda el .zip en 'Actividades-Formateadas'.
    """
    base = obtener_ruta_base()
    ruta = os.path.join(base, "Josue Jiménez")

    if not os.path.isdir(ruta):
        # Búsqueda flexible por si el nombre varía (tilde, espacio, etc.)
        candidatos = [d for d in os.listdir(base)
                    if os.path.isdir(os.path.join(base, d))
                    and "josue" in d.lower()]
        if not candidatos:
            print(f"ERROR: No se encontró la carpeta 'Josue Jiménez' en:\n  {base}")
            sys.exit(1)
        ruta = os.path.join(base, candidatos[0])

    ruta_data            = buscar_carpeta_sistema(ruta)
    ruta_lecciones       = os.path.join(ruta_data, "LECCIONES DISPONIBLES")
    ruta_formateadas     = os.path.join(ruta_data, "Actividades-Formateadas")

    if not os.path.isdir(ruta_lecciones):
        # Búsqueda flexible
        candidatos = [d for d in os.listdir(ruta_data)
                    if os.path.isdir(os.path.join(ruta_data, d))
                    and "lecciones" in d.lower()]
        if not candidatos:
            print(f"ERROR: No se encontró 'LECCIONES DISPONIBLES' en:\n  {ruta_data}")
            sys.exit(1)
        ruta_lecciones = os.path.join(ruta_data, candidatos[0])

    os.makedirs(ruta_formateadas, exist_ok=True)

    carpetas_leccion = sorted([
        d for d in os.listdir(ruta_lecciones)
        if os.path.isdir(os.path.join(ruta_lecciones, d))
    ])

    if not carpetas_leccion:
        print("No se encontraron carpetas de lecciones.")
        sys.exit(0)

    print(f"\n{'─'*55}")
    print(f"  Lecciones encontradas: {len(carpetas_leccion)}")
    print(f"  Destino .zip:  {ruta_formateadas}")
    print(f"{'─'*55}\n")

    exitosos  = 0
    fallidos  = 0

    for nombre_carpeta in carpetas_leccion:
        ruta_carpeta = os.path.join(ruta_lecciones, nombre_carpeta)
        print(f"  → {nombre_carpeta}")

        # ── Buscar el .txt (puede tener cualquier nombre) ──
        archivos_txt = glob.glob(os.path.join(ruta_carpeta, "*.txt"))
        if not archivos_txt:
            print(f"     ✗ No se encontró ningún .txt — carpeta omitida.\n")
            fallidos += 1
            continue

        ruta_txt = archivos_txt[0]   # toma el primero si hay varios
        nombre_txt = os.path.basename(ruta_txt)

        # ── Buscar el index.html ──
        ruta_html = os.path.join(ruta_carpeta, "index.html")
        if not os.path.exists(ruta_html):
            print(f"     ✗ No se encontró index.html — carpeta omitida.\n")
            fallidos += 1
            continue

        # ── Ofuscar el .txt ──
        try:
            texto_original = leer_archivo(ruta_txt)
            texto_ofuscado = ofuscar_reporte(texto_original)
        except Exception as e:
            print(f"     ✗ Error al ofuscar: {e}\n")
            fallidos += 1
            continue

        # ── Crear el .zip en Actividades-Formateadas ──
        nombre_zip = nombre_carpeta + ".zip"
        ruta_zip   = os.path.join(ruta_formateadas, nombre_zip)

        try:
            with zipfile.ZipFile(ruta_zip, "w", zipfile.ZIP_DEFLATED) as zf:
                # Guardar el .txt ofuscado (en memoria, sin escribir archivo temporal)
                zf.writestr(nombre_txt, texto_ofuscado)
                # Agregar el index.html con su contenido original
                zf.write(ruta_html, "index.html")

            print(f"     ✔ {nombre_zip}  ({nombre_txt} ofuscado + index.html)\n")
            exitosos += 1

        except Exception as e:
            print(f"     ✗ Error al crear el .zip: {e}\n")
            fallidos += 1

    print(f"{'─'*55}")
    print(f"  Completado: {exitosos} zip(s) generados, {fallidos} omitidos.")
    print(f"{'─'*55}\n")


# ─────────────────────────────────────────────
# ACCIÓN LEGACY: DESOFUSCAR ARCHIVO INDIVIDUAL
# ─────────────────────────────────────────────

# Rutas para el modo legacy (desofuscar un archivo suelto)
RUTA_TXT_ENCRIPTADO  = "./ofuscado/reporte_ofuscado.txt"
RUTA_TXT_DESOFUSCADO = "./desofuscado/reporte_claro.txt"


def desofuscar_individual():
    base64_texto = leer_archivo(RUTA_TXT_ENCRIPTADO).strip()
    resultado    = desofuscar_reporte(base64_texto)
    escribir_archivo(RUTA_TXT_DESOFUSCADO, resultado)
    print(f"Desofuscado guardado en: {os.path.abspath(RUTA_TXT_DESOFUSCADO)}")


# ─────────────────────────────────────────────
# PUNTO DE ENTRADA
# ─────────────────────────────────────────────

if len(sys.argv) < 2:
    print(f"""
Uso:
  python reporte.py ofuscar      → Ofusca los .txt de cada lección y genera .zip en Actividades-Formateadas
  python reporte.py desofuscar   → Desofusca el archivo individual en '{RUTA_TXT_ENCRIPTADO}'
""")
    sys.exit(0)

accion = sys.argv[1].lower()

if accion == "ofuscar":
    procesar_lecciones()

elif accion == "desofuscar":
    desofuscar_individual()

else:
    print(f"Acción desconocida: '{accion}'. Usa 'ofuscar' o 'desofuscar'.")
    sys.exit(1)
