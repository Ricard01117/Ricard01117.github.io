# Ricard01117.github.io
Mi Portafolio profesional

## Documentación de dependencias

Este proyecto es un sitio estático sin necesidad de instalar paquetes con npm o yarn. Su funcionamiento se basa en recursos locales y algunas dependencias externas cargadas desde CDN.

### Dependencias externas

- Font Awesome 6.7.2
  - Se utiliza para mostrar iconos visuales en la interfaz, como GitHub, LinkedIn, ubicación, reloj y otros elementos del portafolio.
  - Fuente: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css

- Supabase JavaScript SDK
  - Se usa para conectar el portafolio con la base de datos de Supabase y mostrar los proyectos destacados de forma dinámica.
  - Se importa desde: https://esm.sh/@supabase/supabase-js@2

### Archivos locales del proyecto

- index.html: estructura principal del portafolio.
- estilos.css: estilos visuales del sitio principal.
- script.js: lógica para cargar proyectos, mostrar la hora actual y manejar el acceso administrativo.
- admin/: archivos del panel administrativo.

### Notas importantes

- No requiere instalación adicional para funcionar en un navegador.
- Si cambias la URL de Supabase o la tabla de proyectos, debes actualizar los valores definidos en script.js.
- Los iconos y estilos pueden cambiar si se modifica la versión del CDN o los archivos locales.
