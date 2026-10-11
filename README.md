# VozComún — Comunidad de Audios 🎙️

VozComún es una aplicación web full-stack moderna y funcional diseñada para que las personas puedan grabar audios desde el navegador, subir archivos de audio, escuchar las historias y reflexiones de otros miembros y participar dejando comentarios.

El proyecto está construido con la arquitectura moderna de **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** y **Supabase** (Auth, PostgreSQL y Storage), con una paleta de colores fresca y elegante:
* **Verde azulado** (`#277D8E`): Color principal de marca y acción.
* **Menta** (`#9FD3CB`): Acentos suaves, badges y ondas.
* **Blanco humo** (`#F5F7F6`): Fondo limpio y minimalista.
* **Amarillo dorado** (`#EEB756`): Botones de llamada a la acción (CTA) y destacados.
* **Azul petróleo** (`#283D43`): Tipografía contrastada y elementos profundos.

---

## 📋 Requisitos previos

* **Sistema Operativo:** Windows 10/11, macOS o Linux.
* **Node.js:** Versión 18.18.0 o superior (Recomendado v20+ o v24).
* **npm:** Versión 9+ o superior.
* **Visual Studio Code:** Recomendado con extensiones de Tailwind CSS y ESLint.
* **Cuenta gratuita en Supabase:** [https://supabase.com](https://supabase.com)

> 💡 **Nota sobre permisos de micrófono:** Para grabar audio en desarrollo, los navegadores permiten el acceso a través de `http://localhost:3000`. En entornos de producción (como Vercel) **se requiere HTTPS obligatorio** para que el navegador otorgue acceso al micrófono mediante la MediaRecorder API.

---

## 🚀 Instalación paso a paso

### 1. Clonar o abrir el proyecto en VS Code

Abre una terminal de PowerShell en la carpeta del proyecto:
```powershell
code .
```

### 2. Instalar las dependencias del proyecto

Ejecuta el siguiente comando para instalar todos los paquetes necesarios:
```powershell
npm install
```

---

## 🗄️ Configuración en Supabase

### 1. Crear un nuevo proyecto
1. Ve a tu panel de control en [supabase.com/dashboard](https://supabase.com/dashboard).
2. Haz clic en **"New Project"**.
3. Asigna un nombre a tu proyecto (ej. `VozComun`), define una contraseña segura para la base de datos y selecciona tu región más cercana.

### 2. Ejecutar la migración SQL
1. En el panel izquierdo de Supabase, ve a **SQL Editor**.
2. Haz clic en **"New query"**.
3. Abre el archivo de migración ubicado en tu proyecto:
   `supabase/migrations/20261010000001_initial_schema.sql`
4. Copia todo su contenido, pégalo en el editor SQL de Supabase y pulsa **"Run"**.
5. Esta migración crea de forma automática:
   * Las tablas `profiles`, `audios` y `comments`.
   * Los triggers automáticos para crear el perfil cuando un usuario se registra en Supabase Auth (`handle_new_user`).
   * Los triggers para mantener actualizados los campos `updated_at`.
   * Todos los índices de búsqueda y ordenamiento por fecha.
   * Las políticas de seguridad **Row Level Security (RLS)** para todas las tablas.
   * La creación del bucket de almacenamiento `audios` y sus políticas de lectura pública y subida/edición protegida.

### 3. Verificar el Bucket de Almacenamiento (Storage)
1. En el panel izquierdo de Supabase, ingresa a **Storage**.
2. Asegúrate de ver el bucket llamado `audios`.
3. El bucket debe estar configurado como **Public** (para permitir la reproducción mediante URLs directas) con un límite de tamaño de **20 MB** y tipos MIME de audio permitidos (`audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/ogg`, `audio/webm`, `audio/mp4`, `audio/x-m4a`).

---

## 🔐 Configurar Variables de Entorno

1. En la raíz de tu proyecto, duplica el archivo `.env.example` y renómbralo a `.env.local`:
   ```powershell
   Copy-Item .env.example .env.local
   ```
2. Obtén tus credenciales de Supabase:
   * En Supabase, ve a **Project Settings (⚙️)** > **API**.
   * Copia **Project URL** y colócala en `NEXT_PUBLIC_SUPABASE_URL`.
   * Copia la clave **anon / public** y colócala en `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Tu archivo `.env.local` debe lucir así:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=audios
   NEXT_PUBLIC_MAX_AUDIO_SIZE_BYTES=20971520
   NEXT_PUBLIC_MAX_AUDIO_DURATION_SECONDS=600
   ```

---

## 💻 Ejecución del proyecto

### Iniciar en modo desarrollo
Para levantar el servidor local con recarga rápida (Hot Module Replacement):
```powershell
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

### Ejecutar las pruebas automatizadas
Para ejecutar la suite de pruebas unitarias y de integración (con Vitest):
```powershell
npm test
```

### Compilar para producción
Para verificar que el tipado y la compilación sean 100% correctos:
```powershell
npm run build
```

Para iniciar el servidor con la versión compilada:
```powershell
npm run start
```

---

## 🌐 Despliegue en producción (Vercel)

1. Sube tu código a un repositorio en **GitHub**, **GitLab** o **Bitbucket**.
2. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de Git.
3. Haz clic en **"Add New..."** > **"Project"** e importa tu repositorio `VozComun`.
4. En la sección **Environment Variables**, añade:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` (valor: `audios`)
5. Haz clic en **"Deploy"**.
6. ¡Listo! Vercel te proveerá un dominio con **HTTPS habilitado**, permitiendo el uso completo del micrófono en cualquier dispositivo (computador, tablet y móvil).

---

## 🛡️ Seguridad implementada

* **Row Level Security (RLS):** Cada consulta en la base de datos está auditada por las políticas de Supabase.
* **Separación de privilegios:** Únicamente se utiliza la clave pública `anon` en el cliente. Nunca se expone `service_role`.
* **Protección de rutas:** Middleware de Next.js que protege rutas privadas (`/audios/new` y `/mi-perfil`).
* **Storage aislado:** Cada usuario solo tiene permisos para subir, editar o eliminar archivos en su propia carpeta `{user_id}/*`.
* **Rollback en caso de fallos:** Si la subida a Storage tiene éxito pero falla el guardado en la base de datos, el archivo huérfano se elimina de inmediato.
* **Validaciones dobles:** Formularios con validación en cliente (React Hook Form + Zod) y restricciones de integridad en base de datos PostgreSQL.

