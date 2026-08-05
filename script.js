"use strict";

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

/* =====================================================
   CONFIGURACIÓN DE SUPABASE
===================================================== */

const SUPABASE_URL =
  "https://uevftlxlqxtrjhkqecjp.supabase.co";

/*
 * Esta es una clave publicable para el navegador.
 * Nunca coloques aquí una clave sb_secret_.
 */
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_PLXTdDsz9AlyQV_KEYsG4A_7UGrCSpW";

/* =====================================================
   ENLACES DIRECTOS DE PROYECTOS ACTUALES

   Para cambiar posteriormente uno de estos enlaces,
   modifícalo únicamente en esta sección.
===================================================== */

const ENLACES_DEMO = new Map([
  [
    "plataforma-academica",
    "https://plataforma-academica-ricard01117.netlify.app/login"
  ],
  [
    "sistema-inventario-frontend",
    "https://ricard01117.github.io/sistema-inventario-frontend/"
  ],
  [
    "artesanias-de-mi-mama",
    "https://ricard01117.github.io/artesanias-de-mi-mama/"
  ],
  [
    "buscador-de-juegos",
    "https://ricard01117.github.io/Buscador-de-juegos/?v=4"
  ]
]);

/* =====================================================
   CONFIGURACIÓN SEGURA DE TARJETAS
===================================================== */

const ICONOS_PERMITIDOS = new Set([
  "fa-solid fa-code",
  "fa-solid fa-graduation-cap",
  "fa-solid fa-box-open",
  "fa-solid fa-gamepad",
  "fa-solid fa-laptop-code",
  "fa-solid fa-database",
  "fa-solid fa-gears",
  "fa-regular fa-heart",
  "fa-solid fa-chart-line",
  "fa-solid fa-mobile-screen"
]);

const TEMAS_PERMITIDOS = new Set([
  "cyan-project",
  "blue-project",
  "purple-project",
  "pink-project",
  "green-project"
]);

const configuracionLista =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_URL.includes(".supabase.co") &&
  SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_") &&
  !SUPABASE_PUBLISHABLE_KEY.includes("PEGA_AQUI");

const supabase = configuracionLista
  ? createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    )
  : null;

/* =====================================================
   INICIO
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  actualizarHora();
  configurarAccesoAdministrativo();

  setInterval(actualizarHora, 1000);

  await cargarProyectos();
});

/* =====================================================
   CARGAR PROYECTOS DESDE SUPABASE
===================================================== */

async function cargarProyectos() {
  const contenedor = document.getElementById("projects-grid");

  if (!contenedor) {
    return;
  }

  mostrarEstadoProyectos(
    "Cargando proyectos...",
    "fa-solid fa-circle-notch fa-spin"
  );

  if (!supabase || !configuracionLista) {
    mostrarEstadoProyectos(
      "Falta configurar la clave publicable de Supabase.",
      "fa-solid fa-triangle-exclamation"
    );

    return;
  }

  try {
    const { data, error } = await supabase
      .from("proyectos")
      .select(`
        id,
        titulo,
        descripcion,
        url_demo,
        url_github,
        tecnologias,
        icono,
        tema,
        orden
      `)
      .eq("publicado", true)
      .eq("destacado", true)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const proyectos = Array.isArray(data) ? data : [];

    renderizarProyectos(proyectos);
  } catch (error) {
    console.error(
      "No fue posible cargar los proyectos:",
      error
    );

    mostrarEstadoProyectos(
      "No fue posible cargar los proyectos.",
      "fa-solid fa-triangle-exclamation"
    );
  }
}

/* =====================================================
   RENDERIZAR TARJETAS
===================================================== */

function renderizarProyectos(proyectos) {
  const contenedor = document.getElementById("projects-grid");

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  if (proyectos.length === 0) {
    mostrarEstadoProyectos(
      "Todavía no hay proyectos publicados.",
      "fa-regular fa-folder-open"
    );

    return;
  }

  const fragmento = document.createDocumentFragment();

  proyectos.forEach((proyecto) => {
    fragmento.appendChild(
      crearTarjetaProyecto(proyecto)
    );
  });

  contenedor.appendChild(fragmento);

  configurarEfectosTarjetas();
}

function crearTarjetaProyecto(proyecto) {
  const enlace = document.createElement("a");

  /*
   * Los cuatro proyectos actuales utilizan los enlaces definidos
   * en ENLACES_DEMO. Los proyectos nuevos utilizan url_demo
   * almacenado en Supabase.
   */
  enlace.href = obtenerEnlaceProyecto(proyecto);

  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";

  enlace.className =
    `project-card ${obtenerTemaSeguro(proyecto.tema)}`;

  const contenedorIcono = document.createElement("div");
  contenedorIcono.className = "project-icon";

  const icono = document.createElement("i");
  icono.className = obtenerIconoSeguro(proyecto.icono);

  contenedorIcono.appendChild(icono);

  const contenido = document.createElement("div");
  contenido.className = "project-content";

  const titulo = document.createElement("h4");
  titulo.textContent = proyecto.titulo;

  const descripcion = document.createElement("p");
  descripcion.textContent = proyecto.descripcion;

  const etiquetas = document.createElement("div");
  etiquetas.className = "project-tags";

  normalizarTecnologias(proyecto.tecnologias)
    .forEach((tecnologia) => {
      const etiqueta = document.createElement("span");

      etiqueta.textContent = tecnologia;
      etiquetas.appendChild(etiqueta);
    });

  contenido.append(
    titulo,
    descripcion,
    etiquetas
  );

  const flecha = document.createElement("i");

  flecha.className =
    "fa-solid fa-arrow-up-right-from-square project-arrow";

  enlace.append(
    contenedorIcono,
    contenido,
    flecha
  );

  return enlace;
}

/* =====================================================
   OBTENER ENLACE CORRECTO DEL PROYECTO
===================================================== */

function obtenerEnlaceProyecto(proyecto) {
  const tituloNormalizado = normalizarTitulo(
    proyecto.titulo
  );

  const enlaceDefinido =
    ENLACES_DEMO.get(tituloNormalizado);

  /*
   * Si el proyecto está dentro del mapa, utiliza el enlace
   * directo configurado arriba.
   *
   * Para proyectos nuevos, utiliza url_demo de Supabase.
   */
  const enlaceFinal =
    enlaceDefinido || proyecto.url_demo;

  return validarUrl(enlaceFinal);
}

function normalizarTitulo(titulo) {
  return String(titulo ?? "")
    .trim()
    .toLowerCase();
}

function mostrarEstadoProyectos(texto, claseIcono) {
  const contenedor = document.getElementById("projects-grid");

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  const mensaje = document.createElement("div");
  mensaje.className = "projects-message";

  const icono = document.createElement("i");
  icono.className = claseIcono;

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;

  mensaje.append(icono, parrafo);
  contenedor.appendChild(mensaje);
}

/* =====================================================
   HORA DE MÉXICO
===================================================== */

function actualizarHora() {
  const elementoHora = document.getElementById("current-time");

  if (!elementoHora) {
    return;
  }

  try {
    elementoHora.textContent =
      new Intl.DateTimeFormat("es-MX", {
        timeZone: "America/Mexico_City",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(new Date());
  } catch (error) {
    console.error(
      "No fue posible actualizar la hora:",
      error
    );

    elementoHora.textContent =
      new Date().toLocaleTimeString("es-MX", {
        hour12: false
      });
  }
}

/* =====================================================
   ACCESO OCULTO AL ADMINISTRADOR
===================================================== */

function configurarAccesoAdministrativo() {
  const accesoAdmin = document.getElementById(
    "hidden-admin-access"
  );

  if (!accesoAdmin) {
    return;
  }

  accesoAdmin.addEventListener("click", () => {
    window.location.href = "./admin/";
  });
}

/* =====================================================
   EFECTOS DE TARJETAS
===================================================== */

function configurarEfectosTarjetas() {
  const tarjetas = document.querySelectorAll(
    ".technology-card, .project-card"
  );

  tarjetas.forEach((tarjeta) => {
    if (tarjeta.dataset.efectoConfigurado === "true") {
      return;
    }

    tarjeta.dataset.efectoConfigurado = "true";

    tarjeta.addEventListener("mousemove", (evento) => {
      if (window.innerWidth <= 960) {
        return;
      }

      const limites = tarjeta.getBoundingClientRect();

      const posicionX =
        evento.clientX - limites.left;

      const posicionY =
        evento.clientY - limites.top;

      const centroX = limites.width / 2;
      const centroY = limites.height / 2;

      const rotacionX =
        ((posicionY - centroY) / centroY) * -1.5;

      const rotacionY =
        ((posicionX - centroX) / centroX) * 1.5;

      tarjeta.style.transform = `
        perspective(700px)
        translateY(-5px)
        rotateX(${rotacionX}deg)
        rotateY(${rotacionY}deg)
      `;
    });

    tarjeta.addEventListener("mouseleave", () => {
      tarjeta.style.transform = "";
    });
  });
}

/* =====================================================
   VALIDACIONES
===================================================== */

function obtenerIconoSeguro(icono) {
  return ICONOS_PERMITIDOS.has(icono)
    ? icono
    : "fa-solid fa-code";
}

function obtenerTemaSeguro(tema) {
  return TEMAS_PERMITIDOS.has(tema)
    ? tema
    : "cyan-project";
}

function normalizarTecnologias(tecnologias) {
  if (!Array.isArray(tecnologias)) {
    return [];
  }

  return tecnologias
    .map((tecnologia) => String(tecnologia).trim())
    .filter(Boolean);
}

function validarUrl(valor) {
  try {
    const url = new URL(valor);

    if (!["http:", "https:"].includes(url.protocol)) {
      return "#";
    }

    return url.href;
  } catch {
    return "#";
  }
}