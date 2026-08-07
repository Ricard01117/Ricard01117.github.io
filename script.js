"use strict";

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
  "https://uevftlxlqxtrjhkqecjp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_PLXTdDsz9AlyQV_KEYsG4A_7UGrCSpW";

/* =====================================================
   ENLACES DIRECTOS
===================================================== */

const ENLACES_DIRECTOS = new Map([
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

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

/* =====================================================
   INICIO
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  actualizarHora();
  configurarAccesoAdministrativo();

  window.setInterval(actualizarHora, 1000);

  await cargarProyectos();
});

/* =====================================================
   ACCESO OCULTO
===================================================== */

function configurarAccesoAdministrativo() {
  const boton = document.getElementById(
    "hidden-admin-access"
  );

  if (!boton) {
    console.error(
      "No se encontró el botón hidden-admin-access."
    );

    return;
  }

  boton.addEventListener("click", () => {
    window.location.href = "./admin/index.html";
  });
}

/* =====================================================
   PROYECTOS
===================================================== */

async function cargarProyectos() {
  mostrarEstado(
    "Cargando proyectos...",
    "fa-solid fa-circle-notch fa-spin"
  );

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
        publicado,
        destacado,
        orden,
        created_at
      `)
      .eq("publicado", true)
      .eq("destacado", true)
      .order("orden", {
        ascending: true
      })
      .order("created_at", {
        ascending: false
      });

    if (error) {
      throw error;
    }

    renderizarProyectos(
      Array.isArray(data) ? data : []
    );
  } catch (error) {
    console.error(
      "Error al cargar proyectos:",
      error
    );

    mostrarEstado(
      "No fue posible cargar los proyectos.",
      "fa-solid fa-triangle-exclamation"
    );
  }
}

function renderizarProyectos(proyectos) {
  const contenedor = document.getElementById(
    "projects-grid"
  );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  if (proyectos.length === 0) {
    mostrarEstado(
      "Todavía no hay proyectos publicados.",
      "fa-regular fa-folder-open"
    );

    return;
  }

  const fragmento =
    document.createDocumentFragment();

  proyectos.forEach((proyecto) => {
    fragmento.appendChild(
      crearTarjetaProyecto(proyecto)
    );
  });

  contenedor.appendChild(fragmento);

  configurarEfectosTarjetas();
}

function crearTarjetaProyecto(proyecto) {
  const tarjeta = document.createElement("a");

  tarjeta.href =
    obtenerEnlaceProyecto(proyecto);

  tarjeta.target = "_blank";
  tarjeta.rel = "noopener noreferrer";

  tarjeta.className =
    `project-card ${obtenerTemaSeguro(proyecto.tema)}`;

  const contenedorIcono =
    document.createElement("div");

  contenedorIcono.className = "project-icon";

  const icono = document.createElement("i");

  icono.className =
    obtenerIconoSeguro(proyecto.icono);

  contenedorIcono.appendChild(icono);

  const contenido =
    document.createElement("div");

  contenido.className = "project-content";

  const titulo = document.createElement("h4");
  titulo.textContent = proyecto.titulo;

  const descripcion =
    document.createElement("p");

  descripcion.textContent =
    proyecto.descripcion;

  const etiquetas =
    document.createElement("div");

  etiquetas.className = "project-tags";

  normalizarTecnologias(
    proyecto.tecnologias
  ).forEach((tecnologia) => {
    const etiqueta =
      document.createElement("span");

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

  tarjeta.append(
    contenedorIcono,
    contenido,
    flecha
  );

  return tarjeta;
}

function obtenerEnlaceProyecto(proyecto) {
  const titulo = String(
    proyecto.titulo ?? ""
  )
    .trim()
    .toLowerCase();

  const enlaceDirecto =
    ENLACES_DIRECTOS.get(titulo);

  return validarUrl(
    enlaceDirecto || proyecto.url_demo
  );
}

function mostrarEstado(texto, iconoClase) {
  const contenedor = document.getElementById(
    "projects-grid"
  );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  const mensaje = document.createElement("div");
  mensaje.className = "projects-message";

  const icono = document.createElement("i");
  icono.className = iconoClase;

  const parrafo = document.createElement("p");
  parrafo.textContent = texto;

  mensaje.append(icono, parrafo);
  contenedor.appendChild(mensaje);
}

/* =====================================================
   RELOJ
===================================================== */

function actualizarHora() {
  const elemento = document.getElementById(
    "current-time"
  );

  if (!elemento) {
    return;
  }

  try {
    elemento.textContent =
      new Intl.DateTimeFormat("es-MX", {
        timeZone: "America/Mexico_City",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).format(new Date());
  } catch (error) {
    console.error(
      "Error al actualizar la hora:",
      error
    );

    elemento.textContent =
      new Date().toLocaleTimeString("es-MX", {
        hour12: false
      });
  }
}

/* =====================================================
   EFECTOS
===================================================== */

function configurarEfectosTarjetas() {
  const tarjetas =
    document.querySelectorAll(
      ".technology-card, .project-card"
    );

  tarjetas.forEach((tarjeta) => {
    if (
      tarjeta.dataset.efectoConfigurado ===
      "true"
    ) {
      return;
    }

    tarjeta.dataset.efectoConfigurado =
      "true";

    tarjeta.addEventListener(
      "mousemove",
      (evento) => {
        if (window.innerWidth <= 960) {
          return;
        }

        const limites =
          tarjeta.getBoundingClientRect();

        const posicionX =
          evento.clientX - limites.left;

        const posicionY =
          evento.clientY - limites.top;

        const centroX =
          limites.width / 2;

        const centroY =
          limites.height / 2;

        const rotacionX =
          ((posicionY - centroY) / centroY) *
          -1.5;

        const rotacionY =
          ((posicionX - centroX) / centroX) *
          1.5;

        tarjeta.style.transform = `
          perspective(700px)
          translateY(-5px)
          rotateX(${rotacionX}deg)
          rotateY(${rotacionY}deg)
        `;
      }
    );

    tarjeta.addEventListener(
      "mouseleave",
      () => {
        tarjeta.style.transform = "";
      }
    );
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
    .map((tecnologia) =>
      String(tecnologia).trim()
    )
    .filter(Boolean);
}

function validarUrl(valor) {
  try {
    const url = new URL(valor);

    if (
      !["http:", "https:"].includes(
        url.protocol
      )
    ) {
      return "#";
    }

    return url.href;
  } catch {
    return "#";
  }
}