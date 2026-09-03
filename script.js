"use strict";

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://uevftlxlqxtrjhkqecjp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_PLXTdDsz9AlyQV_KEYsG4A_7UGrCSpW";

const CV_BUCKET = "cv";
const CV_TABLE = "cv_portafolio";

const CERTIFICATES_BUCKET = "certificados";
const CERTIFICATES_TABLE = "certificados_portafolio";

const FEATURED_PROJECTS_LIMIT = 3;

const CERTIFICATE_CATEGORIES = new Map([
  ["Data / BI", "fa-solid fa-chart-column"],
  ["Database", "fa-solid fa-database"],
  ["Cloud", "fa-solid fa-cloud"],
  ["Development", "fa-solid fa-code"],
  ["Automation", "fa-solid fa-gears"],
  ["Security", "fa-solid fa-shield-halved"]
]);

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

const THEME_STORAGE_KEY =
  "ricardo-portfolio-theme";

const THEMES = [
  {
    id: "cyan",
    nombre: "Cyan"
  },
  {
    id: "green",
    nombre: "Verde Terminal"
  },
  {
    id: "aurora",
    nombre: "Aurora"
  }
];

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

aplicarTemaGuardado();

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    actualizarHora();

    configurarAccesoAdministrativo();

    configurarSelectorTema();

    window.setInterval(
      actualizarHora,
      1000
    );

    await Promise.all([
      cargarProyectos(),
      cargarCurriculum(),
      cargarCertificados()
    ]);
  }
);

function aplicarTemaGuardado() {
  let temaGuardado = "cyan";

  try {
    const valor =
      window.localStorage.getItem(
        THEME_STORAGE_KEY
      );

    if (
      THEMES.some(
        (tema) => tema.id === valor
      )
    ) {
      temaGuardado = valor;
    }
  } catch (error) {
    console.warn(
      "No fue posible leer el tema guardado:",
      error
    );
  }

  aplicarTema(
    temaGuardado,
    false
  );
}

function configurarSelectorTema() {
  const boton =
    document.getElementById(
      "theme-toggle"
    );

  if (!boton) {
    return;
  }

  actualizarTextoSelectorTema();

  boton.addEventListener(
    "click",
    () => {
      const temaActual =
        obtenerTemaActual();

      const indiceActual =
        THEMES.findIndex(
          (tema) =>
            tema.id === temaActual
        );

      const siguienteIndice =
        (indiceActual + 1) %
        THEMES.length;

      aplicarTema(
        THEMES[siguienteIndice].id,
        true
      );
    }
  );
}

function obtenerTemaActual() {
  const tema =
    document.documentElement
      .dataset.theme;

  return THEMES.some(
    (item) => item.id === tema
  )
    ? tema
    : "cyan";
}

function aplicarTema(
  tema,
  guardar
) {
  const temaSeguro =
    THEMES.some(
      (item) => item.id === tema
    )
      ? tema
      : "cyan";

  document.documentElement
    .dataset.theme = temaSeguro;

  if (guardar) {
    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        temaSeguro
      );
    } catch (error) {
      console.warn(
        "No fue posible guardar el tema:",
        error
      );
    }
  }

  actualizarTextoSelectorTema();
}

function actualizarTextoSelectorTema() {
  const boton =
    document.getElementById(
      "theme-toggle"
    );

  if (!boton) {
    return;
  }

  const temaActual =
    THEMES.find(
      (tema) =>
        tema.id === obtenerTemaActual()
    );

  const nombre =
    temaActual?.nombre ?? "Cyan";

  boton.title =
    `Tema: ${nombre}. Pulsa para cambiar.`;

  boton.setAttribute(
    "aria-label",
    `Tema actual: ${nombre}. Cambiar tema de color.`
  );
}

function configurarAccesoAdministrativo() {
  const boton =
    document.getElementById(
      "hidden-admin-access"
    );

  if (!boton) {
    return;
  }

  boton.addEventListener(
    "click",
    () => {
      window.location.href =
        "./admin/index.html";
    }
  );
}

async function cargarCurriculum() {
  const boton =
    document.getElementById(
      "cv-download-button"
    );

  const textoBoton =
    document.getElementById(
      "cv-download-text"
    );

  const descripcion =
    document.getElementById(
      "cv-description"
    );

  if (
    !boton ||
    !textoBoton ||
    !descripcion
  ) {
    return;
  }

  establecerCvNoDisponible(
    "Consultando CV...",
    "Buscando la versión más reciente."
  );

  try {
    const {
      data,
      error
    } = await supabase
      .from(CV_TABLE)
      .select(`
        id,
        nombre_archivo,
        ruta,
        actualizado_en,
        activo
      `)
      .eq("id", 1)
      .eq("activo", true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.ruta) {
      establecerCvNoDisponible(
        "CV no disponible",
        "Próximamente estará disponible para descarga."
      );

      return;
    }

    const {
      data: publicData
    } = supabase
      .storage
      .from(CV_BUCKET)
      .getPublicUrl(
        data.ruta,
        {
          download: true
        }
      );

    if (!publicData?.publicUrl) {
      throw new Error(
        "No fue posible generar la URL pública del CV."
      );
    }

    const url =
      new URL(
        publicData.publicUrl
      );

    url.searchParams.set(
      "v",
      data.actualizado_en ||
        String(Date.now())
    );

    boton.href = url.href;

    boton.classList.remove(
      "disabled"
    );

    boton.removeAttribute(
      "aria-disabled"
    );

    textoBoton.textContent =
      "Descargar mi CV";

    descripcion.textContent =
      data.nombre_archivo
        ? `Última versión: ${data.nombre_archivo}`
        : "Consulta o descarga mi CV profesional.";

  } catch (error) {
    console.error(
      "Error al cargar el currículum:",
      error
    );

    establecerCvNoDisponible(
      "CV no disponible",
      "No fue posible consultar el currículum en este momento."
    );
  }
}

function establecerCvNoDisponible(
  texto,
  descripcionTexto
) {
  const boton =
    document.getElementById(
      "cv-download-button"
    );

  const textoBoton =
    document.getElementById(
      "cv-download-text"
    );

  const descripcion =
    document.getElementById(
      "cv-description"
    );

  if (
    !boton ||
    !textoBoton ||
    !descripcion
  ) {
    return;
  }

  boton.href = "#";

  boton.classList.add(
    "disabled"
  );

  boton.setAttribute(
    "aria-disabled",
    "true"
  );

  textoBoton.textContent =
    texto;

  descripcion.textContent =
    descripcionTexto;
}

async function cargarCertificados() {
  const seccion =
    document.getElementById(
      "certifications-section"
    );

  const contenedor =
    document.getElementById(
      "certifications-list"
    );

  if (!seccion || !contenedor) {
    return;
  }

  try {
    const {
      data,
      error
    } = await supabase
      .from(CERTIFICATES_TABLE)
      .select(`
        id,
        nombre,
        emisor,
        categoria,
        fecha_emision,
        nombre_archivo,
        ruta,
        tipo_archivo,
        orden,
        activo,
        creado_en,
        actualizado_en
      `)
      .eq("activo", true)
      .order("orden", {
        ascending: true
      })
      .order("fecha_emision", {
        ascending: false,
        nullsFirst: false
      });

    if (error) {
      throw error;
    }

    const certificados =
      Array.isArray(data)
        ? data
        : [];

    if (certificados.length === 0) {
      seccion.classList.add(
        "hidden"
      );

      contenedor.replaceChildren();
      return;
    }

    renderizarCertificados(
      certificados
    );

    seccion.classList.remove(
      "hidden"
    );

  } catch (error) {
    console.error(
      "Error al cargar certificados:",
      error
    );

    seccion.classList.add(
      "hidden"
    );
  }
}

function renderizarCertificados(
  certificados
) {
  const contenedor =
    document.getElementById(
      "certifications-list"
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  const fragmento =
    document.createDocumentFragment();

  certificados.forEach(
    (certificado) => {
      const enlace =
        crearTarjetaCertificado(
          certificado
        );

      if (enlace) {
        fragmento.appendChild(
          enlace
        );
      }
    }
  );

  contenedor.appendChild(
    fragmento
  );
}

function crearTarjetaCertificado(
  certificado
) {
  if (!certificado?.ruta) {
    return null;
  }

  const {
    data: publicData
  } = supabase
    .storage
    .from(CERTIFICATES_BUCKET)
    .getPublicUrl(
      certificado.ruta
    );

  if (!publicData?.publicUrl) {
    return null;
  }

  const enlace =
    document.createElement(
      "a"
    );

  enlace.className =
    "certification-item";

  enlace.href =
    publicData.publicUrl;

  enlace.target =
    "_blank";

  enlace.rel =
    "noopener noreferrer";

  const categoria =
    obtenerCategoriaCertificado(
      certificado.categoria
    );

  const iconoContenedor =
    document.createElement(
      "div"
    );

  iconoContenedor.className =
    `certification-icon ${obtenerClaseCategoriaCertificado(
      categoria
    )}`;

  const icono =
    document.createElement(
      "i"
    );

  icono.className =
    CERTIFICATE_CATEGORIES.get(
      categoria
    );

  iconoContenedor.appendChild(
    icono
  );

  const contenido =
    document.createElement(
      "div"
    );

  contenido.className =
    "certification-content";

  const meta =
    document.createElement(
      "div"
    );

  meta.className =
    "certification-meta";

  const badge =
    document.createElement(
      "span"
    );

  badge.className =
    "certification-badge";

  badge.textContent =
    categoria.toUpperCase();

  const fecha =
    document.createElement(
      "span"
    );

  fecha.className =
    "certification-date";

  fecha.textContent =
    formatearFechaCertificado(
      certificado.fecha_emision
    );

  meta.append(
    badge,
    fecha
  );

  const titulo =
    document.createElement(
      "h4"
    );

  titulo.textContent =
    certificado.nombre ||
    "Certificado";

  const emisor =
    document.createElement(
      "p"
    );

  emisor.textContent =
    certificado.emisor ||
    "Emisor no especificado";

  contenido.append(
    meta,
    titulo,
    emisor
  );

  const flecha =
    document.createElement(
      "i"
    );

  flecha.className =
    "fa-solid fa-arrow-up-right-from-square certification-arrow";

  enlace.append(
    iconoContenedor,
    contenido,
    flecha
  );

  return enlace;
}

function obtenerCategoriaCertificado(
  categoria
) {
  return CERTIFICATE_CATEGORIES.has(
    categoria
  )
    ? categoria
    : "Development";
}

function obtenerClaseCategoriaCertificado(
  categoria
) {
  const clases = {
    "Data / BI": "cert-data",
    Database: "cert-database",
    Cloud: "cert-cloud",
    Development: "cert-development",
    Automation: "cert-automation",
    Security: "cert-security"
  };

  return clases[categoria] ||
    "cert-development";
}

function formatearFechaCertificado(
  fecha
) {
  if (!fecha) {
    return "";
  }

  try {
    return new Intl
      .DateTimeFormat(
        "es-MX",
        {
          month: "short",
          year: "numeric",
          timeZone: "UTC"
        }
      )
      .format(
        new Date(
          `${fecha}T00:00:00Z`
        )
      )
      .replace(".", "");
  } catch {
    return "";
  }
}

async function cargarProyectos() {
  mostrarEstado(
    "Cargando proyectos...",
    "fa-solid fa-circle-notch fa-spin"
  );

  try {
    const {
      data,
      error
    } = await supabase
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
      .eq(
        "publicado",
        true
      )
      .order(
        "orden",
        {
          ascending: true
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

    if (error) {
      throw error;
    }

    const proyectosPublicados =
      Array.isArray(data)
        ? data
        : [];

    renderizarProyectos(
      proyectosPublicados
    );

    renderizarProyectosDestacados(
      proyectosPublicados.filter(
        (proyecto) =>
          Boolean(
            proyecto.destacado
          )
      )
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

function renderizarProyectosDestacados(
  proyectos
) {
  const seccion =
    document.getElementById(
      "featured-projects-section"
    );

  const contenedor =
    document.getElementById(
      "featured-projects-list"
    );

  if (
    !seccion ||
    !contenedor
  ) {
    return;
  }

  contenedor.replaceChildren();

  const destacados =
    (
      Array.isArray(proyectos)
        ? proyectos
        : []
    ).slice(
      0,
      FEATURED_PROJECTS_LIMIT
    );

  seccion.classList.toggle(
    "hidden",
    destacados.length === 0
  );

  if (
    destacados.length === 0
  ) {
    return;
  }

  const fragmento =
    document.createDocumentFragment();

  destacados.forEach(
    (proyecto) => {
      fragmento.appendChild(
        crearTarjetaProyectoDestacado(
          proyecto
        )
      );
    }
  );

  contenedor.appendChild(
    fragmento
  );
}

function crearTarjetaProyectoDestacado(
  proyecto
) {
  const tarjeta =
    document.createElement(
      "a"
    );

  tarjeta.href =
    obtenerEnlaceProyecto(
      proyecto
    );

  tarjeta.target =
    "_blank";

  tarjeta.rel =
    "noopener noreferrer";

  tarjeta.className =
    `featured-project-item ${obtenerTemaSeguro(
      proyecto.tema
    )}`;

  const iconoContenedor =
    document.createElement(
      "div"
    );

  iconoContenedor.className =
    "featured-project-icon";

  const icono =
    document.createElement(
      "i"
    );

  icono.className =
    obtenerIconoSeguro(
      proyecto.icono
    );

  iconoContenedor.appendChild(
    icono
  );

  const contenido =
    document.createElement(
      "div"
    );

  contenido.className =
    "featured-project-content";

  const etiqueta =
    document.createElement(
      "span"
    );

  etiqueta.className =
    "featured-project-kicker";

  etiqueta.textContent =
    "DESTACADO";

  const titulo =
    document.createElement(
      "h4"
    );

  titulo.textContent =
    proyecto.titulo;

  const tecnologias =
    document.createElement(
      "p"
    );

  tecnologias.textContent =
    normalizarTecnologias(
      proyecto.tecnologias
    )
      .slice(0, 4)
      .join(" · ");

  contenido.append(
    etiqueta,
    titulo,
    tecnologias
  );

  const flecha =
    document.createElement(
      "i"
    );

  flecha.className =
    "fa-solid fa-arrow-up-right-from-square featured-project-arrow";

  tarjeta.append(
    iconoContenedor,
    contenido,
    flecha
  );

  return tarjeta;
}

function renderizarProyectos(
  proyectos
) {
  const contenedor =
    document.getElementById(
      "projects-grid"
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  if (
    proyectos.length === 0
  ) {
    mostrarEstado(
      "Todavía no hay proyectos publicados.",
      "fa-regular fa-folder-open"
    );

    return;
  }

  const fragmento =
    document.createDocumentFragment();

  proyectos.forEach(
    (proyecto) => {
      fragmento.appendChild(
        crearTarjetaProyecto(
          proyecto
        )
      );
    }
  );

  contenedor.appendChild(
    fragmento
  );

  configurarEfectosTarjetas();
}

function crearTarjetaProyecto(
  proyecto
) {
  const tarjeta =
    document.createElement(
      "a"
    );

  tarjeta.href =
    obtenerEnlaceProyecto(
      proyecto
    );

  tarjeta.target =
    "_blank";

  tarjeta.rel =
    "noopener noreferrer";

  tarjeta.className =
    `project-card ${obtenerTemaSeguro(
      proyecto.tema
    )}`;

  const contenedorIcono =
    document.createElement(
      "div"
    );

  contenedorIcono.className =
    "project-icon";

  const icono =
    document.createElement(
      "i"
    );

  icono.className =
    obtenerIconoSeguro(
      proyecto.icono
    );

  contenedorIcono.appendChild(
    icono
  );

  const contenido =
    document.createElement(
      "div"
    );

  contenido.className =
    "project-content";

  const titulo =
    document.createElement(
      "h4"
    );

  titulo.textContent =
    proyecto.titulo;

  const descripcion =
    document.createElement(
      "p"
    );

  descripcion.textContent =
    proyecto.descripcion;

  const etiquetas =
    document.createElement(
      "div"
    );

  etiquetas.className =
    "project-tags";

  normalizarTecnologias(
    proyecto.tecnologias
  ).forEach(
    (tecnologia) => {
      const etiqueta =
        document.createElement(
          "span"
        );

      etiqueta.textContent =
        tecnologia;

      etiquetas.appendChild(
        etiqueta
      );
    }
  );

  contenido.append(
    titulo,
    descripcion,
    etiquetas
  );

  const flecha =
    document.createElement(
      "i"
    );

  flecha.className =
    "fa-solid fa-arrow-up-right-from-square project-arrow";

  tarjeta.append(
    contenedorIcono,
    contenido,
    flecha
  );

  return tarjeta;
}

function obtenerEnlaceProyecto(
  proyecto
) {
  const titulo =
    String(
      proyecto.titulo ?? ""
    )
      .trim()
      .toLowerCase();

  const enlaceDirecto =
    ENLACES_DIRECTOS.get(
      titulo
    );

  return validarUrl(
    enlaceDirecto ||
      proyecto.url_demo
  );
}

function mostrarEstado(
  texto,
  iconoClase
) {
  const contenedor =
    document.getElementById(
      "projects-grid"
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  const mensaje =
    document.createElement(
      "div"
    );

  mensaje.className =
    "projects-message";

  const icono =
    document.createElement(
      "i"
    );

  icono.className =
    iconoClase;

  const parrafo =
    document.createElement(
      "p"
    );

  parrafo.textContent =
    texto;

  mensaje.append(
    icono,
    parrafo
  );

  contenedor.appendChild(
    mensaje
  );
}

function actualizarHora() {
  const elemento =
    document.getElementById(
      "current-time"
    );

  if (!elemento) {
    return;
  }

  try {
    elemento.textContent =
      new Intl.DateTimeFormat(
        "es-MX",
        {
          timeZone:
            "America/Mexico_City",
          hour:
            "2-digit",
          minute:
            "2-digit",
          second:
            "2-digit",
          hour12:
            false
        }
      ).format(
        new Date()
      );

  } catch {
    elemento.textContent =
      new Date()
        .toLocaleTimeString(
          "es-MX",
          {
            hour12: false
          }
        );
  }
}

function configurarEfectosTarjetas() {
  const tarjetas =
    document.querySelectorAll(
      ".technology-card, .project-card"
    );

  tarjetas.forEach(
    (tarjeta) => {
      if (
        tarjeta.dataset
          .efectoConfigurado ===
        "true"
      ) {
        return;
      }

      tarjeta.dataset
        .efectoConfigurado =
        "true";

      tarjeta.addEventListener(
        "mousemove",
        (evento) => {
          if (
            window.innerWidth <=
            960
          ) {
            return;
          }

          const limites =
            tarjeta
              .getBoundingClientRect();

          const posicionX =
            evento.clientX -
            limites.left;

          const posicionY =
            evento.clientY -
            limites.top;

          const centroX =
            limites.width / 2;

          const centroY =
            limites.height / 2;

          const rotacionX =
            (
              (
                posicionY -
                centroY
              ) /
              centroY
            ) * -1.5;

          const rotacionY =
            (
              (
                posicionX -
                centroX
              ) /
              centroX
            ) * 1.5;

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
          tarjeta.style
            .transform = "";
        }
      );
    }
  );
}

function obtenerIconoSeguro(
  icono
) {
  return ICONOS_PERMITIDOS.has(
    icono
  )
    ? icono
    : "fa-solid fa-code";
}

function obtenerTemaSeguro(
  tema
) {
  return TEMAS_PERMITIDOS.has(
    tema
  )
    ? tema
    : "cyan-project";
}

function normalizarTecnologias(
  tecnologias
) {
  if (
    !Array.isArray(
      tecnologias
    )
  ) {
    return [];
  }

  return tecnologias
    .map(
      (tecnologia) =>
        String(
          tecnologia
        ).trim()
    )
    .filter(Boolean);
}

function validarUrl(
  valor
) {
  try {
    const url =
      new URL(
        valor
      );

    if (
      ![
        "http:",
        "https:"
      ].includes(
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