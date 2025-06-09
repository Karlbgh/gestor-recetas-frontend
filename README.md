# Gestor de Recetas - Frontend

Este es el repositorio del frontend para la aplicación **Gestor de Recetas**, una Single Page Application (SPA) desarrollada con Angular 19. La aplicación permite a los usuarios explorar, crear, gestionar y planificar sus recetas de cocina.

## ✨ Características Principales

-   **Arquitectura Limpia y Moderna**: Construido con las últimas características de Angular 19, incluyendo componentes `standalone`, `signals` y la nueva sintaxis de `control flow`.
-   **Interfaz de Usuario con Tailwind CSS**: Estilado moderno y responsivo gracias a Tailwind CSS v4.1.
-   **Autenticación Completa**: Soporte para registro e inicio de sesión con email/contraseña y proveedores sociales (Google), incluyendo recuperación de contraseña.
-   **Gestión de Recetas (CRUD)**: Los usuarios autenticados pueden crear, leer, actualizar y eliminar sus propias recetas.
-   **Búsqueda Avanzada**: Búsqueda de recetas por término en la barra de navegación.
-   **Gestión de Perfil de Usuario**: Los usuarios pueden actualizar su nombre y foto de perfil (avatar), cambiar su contraseña y eliminar su cuenta.
-   **Interacción con Backend .NET**: Se comunica con una API RESTful construida con .NET 9 para la persistencia de datos.

## Tecnologías Utilizadas

-   **Framework**: Angular 19
-   **Estilos**: Tailwind CSS 4.1 con PostCSS
-   **Backend como Servicio (BaaS)**: Supabase para autenticación y almacenamiento de imágenes (avatares e imágenes de recetas).
-   **Editor de Texto Enriquecido**: `ngx-quill` para la descripción de los pasos de preparación de las recetas.
-   **Despliegue**: Preparado para Vercel.

---

### 🛠️ Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:

-   **Node.js**: Se recomienda la última versión LTS. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
-   **Angular CLI**: Instálalo globalmente si aún no lo tienes.
    ```bash
    npm install -g @angular/cli
    ```

### Instalación

1.  **Clona el repositorio** [https://github.com/Karlbgh/gestor-recetas-frontend](https://github.com/Karlbgh/gestor-recetas-frontend)
    ```bash
    git clone https://github.com/Karlbgh/gestor-recetas-frontend.git
    cd gestor-recetas-frontend
    ```

2.  **Instala las dependencias del proyecto**
    Este comando leerá el archivo `package.json` e instalará todas las librerías necesarias.
    ```bash
    npm install
    ```

### Iniciar el Servidor de Desarrollo

Una vez instaladas las dependencias y configurado el entorno, puedes arrancar la aplicación.

1.  **Ejecuta el servidor de desarrollo de Angular**
    ```bash
    ng serve -o
    ```
    o, si prefieres usar el script de `package.json`:
    ```bash
    npm start
    ```

2.  **Abre tu navegador**
    El comando anterior abrirá automáticamente tu navegador en `http://localhost:4200/`. La aplicación se recargará automáticamente si realizas cambios en los archivos fuente.

---
