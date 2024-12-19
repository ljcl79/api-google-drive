# Google Drive API Wrapper

Este repositorio proporciona una API RESTful para interactuar con Google Drive. Permite crear carpetas, subir y descargar archivos, y gestionar rutas de carpetas dinámicamente. Es ideal para proyectos que requieren integración con Google Drive en sus operaciones de almacenamiento.

---

## Características

- Crear carpetas en Google Drive.
- Subir archivos a carpetas específicas.
- Descargar archivos de Google Drive.
- Verificar y crear carpetas de forma dinámica basándose en rutas.

---

## Requisitos previos

Antes de usar esta API, asegúrate de cumplir con los siguientes requisitos:

1. **Node.js**: Versión 14 o superior.
2. **Cuenta de Google Drive**: Configurada y con acceso a Google Cloud Console.
3. **Credenciales**: Descarga el archivo `credentials.json` desde Google Cloud Console.
4. **Dependencias instaladas**: Verifica las dependencias ejecutando `npm install`.

---

## Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/usuario/google-drive-api-wrapper.git
   cd google-drive-api-wrapper
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar credenciales**:
   - Coloca tu archivo `credentials.json` en el directorio raíz del proyecto.

4. **Generar token de acceso**:
   Ejecuta la aplicación por primera vez para generar el archivo `token.json`:
   ```bash
   npm run dev
   ```
   Sigue las instrucciones en la consola para autorizar la aplicación y guardar el token.

5. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

---

## Endpoints

### 1. Crear Carpeta

- **Ruta**: `POST /create-folder`
- **Descripción**: Crea una carpeta en Google Drive.
- **Body**:
  ```json
  {
      "folderName": "nombre_de_la_carpeta",
      "parentId": "id_de_la_carpeta_padre" (opcional)
  }
  ```
- **Respuesta**:
  ```json
  {
      "message": "Carpeta creada",
      "folderId": "id_de_la_carpeta"
  }
  ```

### 2. Subir Archivo

- **Ruta**: `POST /upload-file`
- **Descripción**: Sube un archivo a una carpeta específica de Google Drive.
- **Headers**:
  - `Content-Type: multipart/form-data`
- **Body**:
  - Archivo a través de `form-data` con clave `file`.
  - `parentId`: ID de la carpeta destino (opcional).
- **Respuesta**:
  ```json
  {
      "message": "Archivo subido",
      "fileId": "id_del_archivo"
  }
  ```

### 3. Descargar Archivo

- **Ruta**: `GET /download-file/:fileId`
- **Descripción**: Descarga un archivo desde Google Drive.
- **Respuesta**: Descarga directa del archivo.

### 4. Verificar y Crear Carpeta desde Ruta

- **Ruta**: `POST /check-folder-create-if-not-exist`
- **Descripción**: Verifica si existe una carpeta basada en la ruta dada y la crea si no existe.
- **Body**:
  ```json
  {
      "folderPath": "/carpeta1/carpeta2/carpeta3"
  }
  ```
- **Respuesta**:
  ```json
  {
      "message": "ID de la última carpeta en la ruta '/carpeta1/carpeta2/carpeta3'",
      "folderId": "id_de_la_carpeta"
  }
  ```

---

## Scripts disponibles

- **`npm run dev`**: Inicia el servidor en modo desarrollo.
- **`npm run build`**: Compila el proyecto TypeScript a JavaScript.
- **`npm start`**: Inicia el servidor usando el código compilado.

---

## Tecnologías utilizadas

- Node.js
- Express.js
- Google Drive API
- TypeScript

---

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, abre un *issue* o envía un *pull request*.

---

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

