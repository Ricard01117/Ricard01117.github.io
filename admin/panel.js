"use strict";

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://uevftlxlqxtrjhkqecjp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_PLXTdDsz9AlyQV_KEYsG4A_7UGrCSpW";

const LOGIN_URL =
  "./index.html";

const CV_BUCKET =
  "cv";

const CV_TABLE =
  "cv_portafolio";

const CV_PATH =
  "ricardo-castro-cv.pdf";

const CV_MAX_BYTES =
  5 * 1024 * 1024;

const ICONOS_PERMITIDOS =
  new Set([
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

const TEMAS_PERMITIDOS =
  new Set([
    "cyan-project",
    "blue-project",
    "purple-project",
    "pink-project",
    "green-project"
  ]);

const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

let proyectos = [];

let proyectoEnEdicion =
  null;

let tecnologiasFormulario =
  [];

let curriculumActual =
  null;

let archivoCvSeleccionado =
  null;

let elementos = {};

document.addEventListener(
  "DOMContentLoaded",
  iniciarPanel
);

async function iniciarPanel() {
  guardarReferencias();

  if (!validarElementos()) {
    console.error(
      "Faltan elementos necesarios en panel.html."
    );

    return;
  }

  configurarEventos();

  const usuarioValido =
    await comprobarUsuario();

  if (!usuarioValido) {
    return;
  }

  supabase.auth
    .onAuthStateChange(
      (_evento, sesion) => {
        if (!sesion) {
          window.location.replace(
            LOGIN_URL
          );
        }
      }
    );

  cerrarFormulario();

  await Promise.all([
    cargarProyectos(),
    cargarCurriculum()
  ]);

  elementos.loading
    .classList.add(
      "hidden"
    );

  elementos.panel
    .classList.remove(
      "hidden"
    );
}

function guardarReferencias() {
  elementos = {
    loading:
      document.getElementById(
        "loading-screen"
      ),

    panel:
      document.getElementById(
        "admin-panel"
      ),

    workspace:
      document.querySelector(
        ".workspace"
      ),

    logoutButton:
      document.getElementById(
        "logout-button"
      ),

    newProjectButton:
      document.getElementById(
        "new-project-button"
      ),

    formPanel:
      document.getElementById(
        "form-panel"
      ),

    closeFormButton:
      document.getElementById(
        "close-form-button"
      ),

    cancelButton:
      document.getElementById(
        "cancel-button"
      ),

    form:
      document.getElementById(
        "project-form"
      ),

    formTitle:
      document.getElementById(
        "form-title"
      ),

    projectId:
      document.getElementById(
        "project-id"
      ),

    title:
      document.getElementById(
        "title"
      ),

    description:
      document.getElementById(
        "description"
      ),

    descriptionCounter:
      document.getElementById(
        "description-counter"
      ),

    demoUrl:
      document.getElementById(
        "demo-url"
      ),

    githubUrl:
      document.getElementById(
        "github-url"
      ),

    technologyInput:
      document.getElementById(
        "technology-input"
      ),

    addTechnologyButton:
      document.getElementById(
        "add-technology-button"
      ),

    technologyTags:
      document.getElementById(
        "technology-tags"
      ),

    icon:
      document.getElementById(
        "icon"
      ),

    theme:
      document.getElementById(
        "theme"
      ),

    order:
      document.getElementById(
        "order"
      ),

    published:
      document.getElementById(
        "published"
      ),

    featured:
      document.getElementById(
        "featured"
      ),

    iconPreview:
      document.getElementById(
        "icon-preview"
      ),

    saveButton:
      document.getElementById(
        "save-button"
      ),

    panelMessage:
      document.getElementById(
        "panel-message"
      ),

    totalProjects:
      document.getElementById(
        "total-projects"
      ),

    publishedProjects:
      document.getElementById(
        "published-projects"
      ),

    hiddenProjects:
      document.getElementById(
        "hidden-projects"
      ),

    featuredProjects:
      document.getElementById(
        "featured-projects"
      ),

    search:
      document.getElementById(
        "project-search"
      ),

    statusFilter:
      document.getElementById(
        "status-filter"
      ),

    refreshButton:
      document.getElementById(
        "refresh-button"
      ),

    projectsList:
      document.getElementById(
        "projects-list"
      ),

    emptyState:
      document.getElementById(
        "empty-state"
      ),

    cvEmptyState:
      document.getElementById(
        "cv-empty-state"
      ),

    cvCurrentFile:
      document.getElementById(
        "cv-current-file"
      ),

    cvFileName:
      document.getElementById(
        "cv-file-name"
      ),

    cvUpdatedAt:
      document.getElementById(
        "cv-updated-at"
      ),

    cvFileInput:
      document.getElementById(
        "cv-file-input"
      ),

    cvSelectButton:
      document.getElementById(
        "cv-select-button"
      ),

    cvSelectedName:
      document.getElementById(
        "cv-selected-name"
      ),

    cvViewButton:
      document.getElementById(
        "cv-view-button"
      ),

    cvUploadButton:
      document.getElementById(
        "cv-upload-button"
      ),

    cvDeleteButton:
      document.getElementById(
        "cv-delete-button"
      )
  };
}

function validarElementos() {
  return Object.values(
    elementos
  ).every(Boolean);
}

function configurarEventos() {
  elementos.logoutButton
    .addEventListener(
      "click",
      cerrarSesion
    );

  elementos.newProjectButton
    .addEventListener(
      "click",
      abrirNuevoProyecto
    );

  elementos.closeFormButton
    .addEventListener(
      "click",
      cerrarFormulario
    );

  elementos.cancelButton
    .addEventListener(
      "click",
      cerrarFormulario
    );

  elementos.form
    .addEventListener(
      "submit",
      guardarProyecto
    );

  elementos.description
    .addEventListener(
      "input",
      actualizarContador
    );

  elementos.icon
    .addEventListener(
      "change",
      actualizarVistaIcono
    );

  elementos.theme
    .addEventListener(
      "change",
      actualizarVistaIcono
    );

  elementos.search
    .addEventListener(
      "input",
      renderizarProyectos
    );

  elementos.statusFilter
    .addEventListener(
      "change",
      renderizarProyectos
    );

  elementos.refreshButton
    .addEventListener(
      "click",
      cargarProyectos
    );

  elementos.addTechnologyButton
    .addEventListener(
      "click",
      agregarTecnologiaFormulario
    );

  elementos.technologyInput
    .addEventListener(
      "keydown",
      (evento) => {
        if (
          evento.key ===
          "Enter"
        ) {
          evento.preventDefault();

          agregarTecnologiaFormulario();
        }
      }
    );

  elementos.cvSelectButton
    .addEventListener(
      "click",
      () => {
        elementos
          .cvFileInput
          .click();
      }
    );

  elementos.cvFileInput
    .addEventListener(
      "change",
      procesarSeleccionCv
    );

  elementos.cvUploadButton
    .addEventListener(
      "click",
      subirCurriculum
    );

  elementos.cvViewButton
    .addEventListener(
      "click",
      verCurriculum
    );

  elementos.cvDeleteButton
    .addEventListener(
      "click",
      eliminarCurriculum
    );
}

async function comprobarUsuario() {
  try {
    const {
      data: { user },
      error
    } =
      await supabase.auth
        .getUser();

    if (
      error ||
      !user
    ) {
      window.location.replace(
        LOGIN_URL
      );

      return false;
    }

    return true;

  } catch {
    window.location.replace(
      LOGIN_URL
    );

    return false;
  }
}

async function cerrarSesion() {
  try {
    await supabase.auth
      .signOut();

    window.location.replace(
      LOGIN_URL
    );
  } catch {
    mostrarMensaje(
      "No fue posible cerrar la sesión.",
      "error"
    );
  }
}

async function cargarCurriculum() {
  try {
    const {
      data,
      error
    } =
      await supabase
        .from(CV_TABLE)
        .select(`
          id,
          nombre_archivo,
          ruta,
          actualizado_en,
          activo
        `)
        .eq(
          "id",
          1
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    curriculumActual =
      data?.activo
        ? data
        : null;

    renderizarCurriculum();

  } catch (error) {
    console.error(
      error
    );

    curriculumActual =
      null;

    renderizarCurriculum();

    mostrarMensaje(
      "No fue posible consultar el CV.",
      "warning"
    );
  }
}

function renderizarCurriculum() {
  if (curriculumActual) {
    elementos.cvEmptyState
      .classList.add(
        "hidden"
      );

    elementos.cvCurrentFile
      .classList.remove(
        "hidden"
      );

    elementos.cvFileName
      .textContent =
      curriculumActual
        .nombre_archivo ||
      "Ricardo-Castro-CV.pdf";

    elementos.cvUpdatedAt
      .textContent =
      curriculumActual
        .actualizado_en
        ? `Actualizado: ${formatearFecha(
            curriculumActual
              .actualizado_en
          )}`
        : "Sin fecha";

    elementos.cvViewButton
      .disabled = false;

    elementos.cvDeleteButton
      .disabled = false;

  } else {
    elementos.cvEmptyState
      .classList.remove(
        "hidden"
      );

    elementos.cvCurrentFile
      .classList.add(
        "hidden"
      );

    elementos.cvViewButton
      .disabled = true;

    elementos.cvDeleteButton
      .disabled = true;
  }

  actualizarBotonSubirCv();
}

function procesarSeleccionCv() {
  const archivo =
    elementos.cvFileInput
      .files?.[0] ??
    null;

  archivoCvSeleccionado =
    null;

  if (!archivo) {
    elementos.cvSelectedName
      .textContent =
      "Ningún archivo seleccionado";

    actualizarBotonSubirCv();

    return;
  }

  const esPdf =
    archivo.type ===
      "application/pdf" ||
    archivo.name
      .toLowerCase()
      .endsWith(
        ".pdf"
      );

  if (!esPdf) {
    elementos.cvFileInput
      .value = "";

    mostrarMensaje(
      "El archivo debe ser PDF.",
      "error"
    );

    actualizarBotonSubirCv();

    return;
  }

  if (
    archivo.size >
    CV_MAX_BYTES
  ) {
    elementos.cvFileInput
      .value = "";

    mostrarMensaje(
      "El PDF no puede superar los 5 MB.",
      "error"
    );

    actualizarBotonSubirCv();

    return;
  }

  archivoCvSeleccionado =
    archivo;

  elementos.cvSelectedName
    .textContent =
    archivo.name;

  actualizarBotonSubirCv();
}

function actualizarBotonSubirCv() {
  elementos.cvUploadButton
    .disabled =
    !archivoCvSeleccionado;

  elementos.cvUploadButton
    .innerHTML =
    curriculumActual
      ? `
        <i class="fa-solid fa-rotate"></i>
        Reemplazar CV
      `
      : `
        <i class="fa-solid fa-cloud-arrow-up"></i>
        Subir CV
      `;
}

async function subirCurriculum() {
  if (!archivoCvSeleccionado) {
    mostrarMensaje(
      "Primero selecciona un archivo PDF.",
      "warning"
    );

    return;
  }

  const archivo =
    archivoCvSeleccionado;

  const rutaAnterior =
    curriculumActual?.ruta ||
    null;

  const nuevaRuta =
    `ricardo-castro-cv-${Date.now()}.pdf`;

  let archivoNuevoSubido =
    false;

  try {
    elementos.cvUploadButton
      .disabled = true;

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth
      .getSession();

    if (
      sessionError ||
      !session
    ) {
      throw new Error(
        "Tu sesión de administrador expiró. Inicia sesión nuevamente."
      );
    }

    const {
      error: storageError
    } = await supabase
      .storage
      .from(CV_BUCKET)
      .upload(
        nuevaRuta,
        archivo,
        {
          cacheControl: "3600",
          contentType: "application/pdf",
          upsert: false
        }
      );

    if (storageError) {
      throw new Error(
        `Storage de Supabase: ${storageError.message}`
      );
    }

    archivoNuevoSubido = true;

    const datosCv = {
      id: 1,
      nombre_archivo:
        archivo.name,
      ruta:
        nuevaRuta,
      actualizado_en:
        new Date().toISOString(),
      activo:
        true
    };

    const {
      data,
      error: databaseError
    } = await supabase
      .from(CV_TABLE)
      .upsert(
        datosCv,
        {
          onConflict: "id"
        }
      )
      .select()
      .single();

    if (databaseError) {
      throw new Error(
        `Tabla ${CV_TABLE}: ${databaseError.message}`
      );
    }

    curriculumActual =
      data;

    if (
      rutaAnterior &&
      rutaAnterior !== nuevaRuta
    ) {
      const {
        error: removeOldError
      } = await supabase
        .storage
        .from(CV_BUCKET)
        .remove([
          rutaAnterior
        ]);

      if (removeOldError) {
        console.warn(
          "El CV nuevo se publicó, pero no fue posible eliminar el archivo anterior:",
          removeOldError
        );
      }
    }

    archivoCvSeleccionado =
      null;

    elementos.cvFileInput
      .value = "";

    elementos.cvSelectedName
      .textContent =
      "Ningún archivo seleccionado";

    renderizarCurriculum();

    mostrarMensaje(
      "CV publicado correctamente.",
      "success"
    );

  } catch (error) {
    console.error(
      "Error al subir el CV:",
      error
    );

    if (archivoNuevoSubido) {
      const {
        error: cleanupError
      } = await supabase
        .storage
        .from(CV_BUCKET)
        .remove([
          nuevaRuta
        ]);

      if (cleanupError) {
        console.warn(
          "No fue posible limpiar el archivo después del error:",
          cleanupError
        );
      }
    }

    mostrarMensaje(
      `No fue posible subir el CV: ${obtenerMensajeError(error)}`,
      "error"
    );

  } finally {
    actualizarBotonSubirCv();
  }
}

function verCurriculum() {
  if (
    !curriculumActual?.ruta
  ) {
    return;
  }

  const {
    data
  } =
    supabase.storage
      .from(
        CV_BUCKET
      )
      .getPublicUrl(
        curriculumActual.ruta
      );

  if (
    !data?.publicUrl
  ) {
    return;
  }

  const url =
    new URL(
      data.publicUrl
    );

  url.searchParams.set(
    "v",
    curriculumActual
      .actualizado_en ||
      Date.now()
  );

  window.open(
    url.href,
    "_blank",
    "noopener,noreferrer"
  );
}

async function eliminarCurriculum() {
  if (!curriculumActual) {
    return;
  }

  const confirmado =
    window.confirm(
      "¿Seguro que deseas eliminar el CV publicado?"
    );

  if (!confirmado) {
    return;
  }

  try {
    const ruta =
      curriculumActual.ruta ||
      CV_PATH;

    const {
      error: storageError
    } = await supabase
      .storage
      .from(CV_BUCKET)
      .remove([
        ruta
      ]);

    if (storageError) {
      throw new Error(
        `Storage de Supabase: ${storageError.message}`
      );
    }

    const {
      error: databaseError
    } = await supabase
      .from(CV_TABLE)
      .delete()
      .eq(
        "id",
        1
      );

    if (databaseError) {
      throw new Error(
        `Tabla ${CV_TABLE}: ${databaseError.message}`
      );
    }

    curriculumActual =
      null;

    archivoCvSeleccionado =
      null;

    elementos.cvFileInput
      .value = "";

    elementos.cvSelectedName
      .textContent =
      "Ningún archivo seleccionado";

    renderizarCurriculum();

    mostrarMensaje(
      "CV eliminado correctamente.",
      "success"
    );

  } catch (error) {
    console.error(
      "Error al eliminar el CV:",
      error
    );

    mostrarMensaje(
      `No fue posible eliminar el CV: ${obtenerMensajeError(error)}`,
      "error"
    );
  }
}

function obtenerMensajeError(error) {
  if (!error) {
    return "Error desconocido.";
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  if (
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Error desconocido.";
  }
}

function agregarTecnologiaFormulario() {
  const tecnologia =
    elementos
      .technologyInput
      .value
      .trim();

  if (!tecnologia) {
    return;
  }

  if (
    tecnologiasFormulario
      .length >= 12
  ) {
    mostrarMensaje(
      "Puedes agregar máximo 12 tecnologías.",
      "warning"
    );

    return;
  }

  const existe =
    tecnologiasFormulario.some(
      (item) =>
        item.toLowerCase() ===
        tecnologia.toLowerCase()
    );

  if (existe) {
    return;
  }

  tecnologiasFormulario
    .push(
      tecnologia
    );

  elementos
    .technologyInput
    .value = "";

  renderizarTecnologiasFormulario();
}

function eliminarTecnologiaFormulario(
  indice
) {
  tecnologiasFormulario
    .splice(
      indice,
      1
    );

  renderizarTecnologiasFormulario();
}

function renderizarTecnologiasFormulario() {
  elementos
    .technologyTags
    .replaceChildren();

  tecnologiasFormulario
    .forEach(
      (
        tecnologia,
        indice
      ) => {
        const etiqueta =
          document
            .createElement(
              "span"
            );

        etiqueta.className =
          "technology-chip";

        const texto =
          document
            .createElement(
              "span"
            );

        texto.textContent =
          tecnologia;

        const eliminar =
          document
            .createElement(
              "button"
            );

        eliminar.type =
          "button";

        eliminar.className =
          "technology-chip-remove";

        eliminar.innerHTML =
          '<i class="fa-solid fa-xmark"></i>';

        eliminar.addEventListener(
          "click",
          () => {
            eliminarTecnologiaFormulario(
              indice
            );
          }
        );

        etiqueta.append(
          texto,
          eliminar
        );

        elementos
          .technologyTags
          .appendChild(
            etiqueta
          );
      }
    );
}

async function cargarProyectos() {
  try {
    const {
      data,
      error
    } =
      await supabase
        .from(
          "proyectos"
        )
        .select("*")
        .order(
          "orden",
          {
            ascending:
              true
          }
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        );

    if (error) {
      throw error;
    }

    proyectos =
      Array.isArray(data)
        ? data
        : [];

    actualizarEstadisticas();

    renderizarProyectos();

  } catch (error) {
    console.error(
      error
    );

    mostrarMensaje(
      "No fue posible cargar los proyectos.",
      "error"
    );
  }
}

function renderizarProyectos() {
  const termino =
    elementos.search
      .value
      .trim()
      .toLowerCase();

  const filtro =
    elementos
      .statusFilter
      .value;

  const resultados =
    proyectos.filter(
      (proyecto) => {
        const texto =
          [
            proyecto.titulo,
            proyecto.descripcion,
            ...normalizarTecnologias(
              proyecto.tecnologias
            )
          ]
            .join(" ")
            .toLowerCase();

        const coincideTexto =
          !termino ||
          texto.includes(
            termino
          );

        const coincideEstado =
          filtro === "all" ||
          (
            filtro ===
              "published" &&
            proyecto.publicado
          ) ||
          (
            filtro ===
              "hidden" &&
            !proyecto.publicado
          ) ||
          (
            filtro ===
              "featured" &&
            proyecto.destacado
          );

        return (
          coincideTexto &&
          coincideEstado
        );
      }
    );

  elementos.projectsList
    .replaceChildren();

  elementos.emptyState
    .classList.toggle(
      "hidden",
      resultados.length > 0
    );

  const fragmento =
    document
      .createDocumentFragment();

  resultados.forEach(
    (proyecto) => {
      fragmento
        .appendChild(
          crearTarjetaProyecto(
            proyecto
          )
        );
    }
  );

  elementos.projectsList
    .appendChild(
      fragmento
    );
}

function crearTarjetaProyecto(
  proyecto
) {
  const tarjeta =
    document.createElement(
      "article"
    );

  tarjeta.className =
    `admin-project-card ${obtenerTemaSeguro(
      proyecto.tema
    )}`;

  const cabecera =
    document.createElement(
      "div"
    );

  cabecera.className =
    "project-card-header";

  const iconoContenedor =
    document.createElement(
      "div"
    );

  iconoContenedor.className =
    "project-card-icon";

  const icono =
    document.createElement(
      "i"
    );

  icono.className =
    obtenerIconoSeguro(
      proyecto.icono
    );

  iconoContenedor
    .appendChild(
      icono
    );

  const contenido =
    document.createElement(
      "div"
    );

  const titulo =
    document.createElement(
      "h3"
    );

  titulo.className =
    "project-card-title";

  titulo.textContent =
    proyecto.titulo;

  const descripcion =
    document.createElement(
      "p"
    );

  descripcion.className =
    "project-card-description";

  descripcion.textContent =
    proyecto.descripcion;

  contenido.append(
    titulo,
    descripcion
  );

  cabecera.append(
    iconoContenedor,
    contenido
  );

  const tags =
    document.createElement(
      "div"
    );

  tags.className =
    "project-tags";

  normalizarTecnologias(
    proyecto.tecnologias
  ).forEach(
    (tecnologia) => {
      const tag =
        document.createElement(
          "span"
        );

      tag.className =
        "project-tag";

      tag.textContent =
        tecnologia;

      tags.appendChild(
        tag
      );
    }
  );

  const meta =
    document.createElement(
      "div"
    );

  meta.className =
    "project-meta";

  meta.appendChild(
    crearBadge(
      proyecto.publicado
        ? "Publicado"
        : "Oculto",

      proyecto.publicado
        ? "published"
        : "hidden-project"
    )
  );

  if (
    proyecto.destacado
  ) {
    meta.appendChild(
      crearBadge(
        "Destacado",
        "featured"
      )
    );
  }

  meta.appendChild(
    crearBadge(
      `Orden ${proyecto.orden}`,
      "order"
    )
  );

  const acciones =
    document.createElement(
      "div"
    );

  acciones.className =
    "project-card-actions";

  const demo =
    crearBoton(
      "Demo"
    );

  demo.addEventListener(
    "click",
    () => {
      abrirEnlaceSeguro(
        proyecto.url_demo
      );
    }
  );

  const github =
    crearBoton(
      "GitHub"
    );

  github.disabled =
    !proyecto.url_github;

  github.addEventListener(
    "click",
    () => {
      abrirEnlaceSeguro(
        proyecto.url_github
      );
    }
  );

  const editar =
    crearBoton(
      "Editar"
    );

  editar.addEventListener(
    "click",
    () => {
      abrirEdicionProyecto(
        proyecto
      );
    }
  );

  const estado =
    crearBoton(
      proyecto.publicado
        ? "Ocultar"
        : "Publicar"
    );

  estado.addEventListener(
    "click",
    async () => {
      await cambiarPublicacion(
        proyecto
      );
    }
  );

  const eliminar =
    crearBoton(
      "Eliminar",
      true
    );

  eliminar.addEventListener(
    "click",
    async () => {
      await eliminarProyecto(
        proyecto
      );
    }
  );

  acciones.append(
    demo,
    github,
    editar,
    estado,
    eliminar
  );

  tarjeta.append(
    cabecera,
    tags,
    meta,
    acciones
  );

  return tarjeta;
}

function crearBadge(
  texto,
  clase
) {
  const badge =
    document.createElement(
      "span"
    );

  badge.className =
    `status-badge ${clase}`;

  badge.textContent =
    texto;

  return badge;
}

function crearBoton(
  texto,
  peligro = false
) {
  const boton =
    document.createElement(
      "button"
    );

  boton.type =
    "button";

  boton.className =
    peligro
      ? "action-button danger"
      : "action-button";

  boton.textContent =
    texto;

  return boton;
}

function abrirNuevoProyecto() {
  proyectoEnEdicion =
    null;

  elementos.form.reset();

  tecnologiasFormulario =
    [];

  renderizarTecnologiasFormulario();

  elementos.formTitle
    .textContent =
    "Nuevo proyecto";

  elementos.published
    .checked = true;

  elementos.featured
    .checked = true;

  elementos.order
    .value =
    obtenerSiguienteOrden();

  abrirFormulario();

  actualizarContador();

  actualizarVistaIcono();
}

function abrirEdicionProyecto(
  proyecto
) {
  proyectoEnEdicion =
    proyecto;

  elementos.formTitle
    .textContent =
    "Editar proyecto";

  elementos.title.value =
    proyecto.titulo ?? "";

  elementos.description.value =
    proyecto.descripcion ?? "";

  elementos.demoUrl.value =
    proyecto.url_demo ?? "";

  elementos.githubUrl.value =
    proyecto.url_github ?? "";

  elementos.icon.value =
    obtenerIconoSeguro(
      proyecto.icono
    );

  elementos.theme.value =
    obtenerTemaSeguro(
      proyecto.tema
    );

  elementos.order.value =
    proyecto.orden ?? 0;

  elementos.published.checked =
    Boolean(
      proyecto.publicado
    );

  elementos.featured.checked =
    Boolean(
      proyecto.destacado
    );

  tecnologiasFormulario =
    normalizarTecnologias(
      proyecto.tecnologias
    );

  renderizarTecnologiasFormulario();

  abrirFormulario();

  actualizarContador();

  actualizarVistaIcono();
}

function abrirFormulario() {
  elementos.formPanel
    .classList.remove(
      "closed"
    );

  elementos.workspace
    .classList.remove(
      "form-closed"
    );
}

function cerrarFormulario() {
  proyectoEnEdicion =
    null;

  elementos.form.reset();

  tecnologiasFormulario =
    [];

  renderizarTecnologiasFormulario();

  elementos.formPanel
    .classList.add(
      "closed"
    );

  elementos.workspace
    .classList.add(
      "form-closed"
    );
}

async function guardarProyecto(
  evento
) {
  evento.preventDefault();

  if (
    !elementos.form
      .checkValidity()
  ) {
    elementos.form
      .reportValidity();

    return;
  }

  if (
    tecnologiasFormulario
      .length === 0
  ) {
    mostrarMensaje(
      "Agrega al menos una tecnología.",
      "warning"
    );

    return;
  }

  const datos = {
    titulo:
      elementos.title
        .value
        .trim(),

    descripcion:
      elementos.description
        .value
        .trim(),

    url_demo:
      validarUrl(
        elementos.demoUrl
          .value
      ),

    url_github:
      elementos.githubUrl
        .value
        .trim()
        ? validarUrl(
            elementos.githubUrl
              .value
          )
        : null,

    tecnologias:
      tecnologiasFormulario,

    icono:
      obtenerIconoSeguro(
        elementos.icon.value
      ),

    tema:
      obtenerTemaSeguro(
        elementos.theme.value
      ),

    orden:
      Number.parseInt(
        elementos.order.value,
        10
      ),

    publicado:
      elementos.published.checked,

    destacado:
      elementos.featured.checked
  };

  try {
    if (
      proyectoEnEdicion
    ) {
      const {
        error
      } =
        await supabase
          .from(
            "proyectos"
          )
          .update(
            datos
          )
          .eq(
            "id",
            proyectoEnEdicion.id
          );

      if (error) {
        throw error;
      }

    } else {
      const {
        error
      } =
        await supabase
          .from(
            "proyectos"
          )
          .insert(
            datos
          );

      if (error) {
        throw error;
      }
    }

    cerrarFormulario();

    await cargarProyectos();

    mostrarMensaje(
      "Proyecto guardado correctamente.",
      "success"
    );

  } catch (error) {
    console.error(
      error
    );

    mostrarMensaje(
      "No fue posible guardar el proyecto.",
      "error"
    );
  }
}

async function cambiarPublicacion(
  proyecto
) {
  try {
    const {
      error
    } =
      await supabase
        .from(
          "proyectos"
        )
        .update({
          publicado:
            !proyecto.publicado
        })
        .eq(
          "id",
          proyecto.id
        );

    if (error) {
      throw error;
    }

    await cargarProyectos();

  } catch {
    mostrarMensaje(
      "No fue posible cambiar el estado.",
      "error"
    );
  }
}

async function eliminarProyecto(
  proyecto
) {
  const confirmado =
    window.confirm(
      `¿Seguro que deseas eliminar "${proyecto.titulo}"?`
    );

  if (!confirmado) {
    return;
  }

  try {
    const {
      error
    } =
      await supabase
        .from(
          "proyectos"
        )
        .delete()
        .eq(
          "id",
          proyecto.id
        );

    if (error) {
      throw error;
    }

    await cargarProyectos();

    mostrarMensaje(
      "Proyecto eliminado.",
      "success"
    );

  } catch {
    mostrarMensaje(
      "No fue posible eliminar el proyecto.",
      "error"
    );
  }
}

function actualizarEstadisticas() {
  elementos.totalProjects
    .textContent =
    String(
      proyectos.length
    );

  elementos.publishedProjects
    .textContent =
    String(
      proyectos.filter(
        (p) =>
          p.publicado
      ).length
    );

  elementos.hiddenProjects
    .textContent =
    String(
      proyectos.filter(
        (p) =>
          !p.publicado
      ).length
    );

  elementos.featuredProjects
    .textContent =
    String(
      proyectos.filter(
        (p) =>
          p.destacado
      ).length
    );
}

function actualizarContador() {
  elementos
    .descriptionCounter
    .textContent =
    String(
      elementos.description
        .value.length
    );
}

function actualizarVistaIcono() {
  elementos.iconPreview
    .className =
    obtenerTemaSeguro(
      elementos.theme.value
    );

  elementos.iconPreview
    .innerHTML = "";

  const icono =
    document.createElement(
      "i"
    );

  icono.className =
    obtenerIconoSeguro(
      elementos.icon.value
    );

  elementos.iconPreview
    .appendChild(
      icono
    );
}

function obtenerSiguienteOrden() {
  if (
    proyectos.length === 0
  ) {
    return 0;
  }

  return (
    Math.max(
      ...proyectos.map(
        (p) =>
          Number(
            p.orden
          ) || 0
      )
    ) + 1
  );
}

function normalizarTecnologias(
  tecnologias
) {
  return Array.isArray(
    tecnologias
  )
    ? tecnologias
        .map(
          (t) =>
            String(t)
              .trim()
        )
        .filter(Boolean)
    : [];
}

function obtenerIconoSeguro(
  icono
) {
  return ICONOS_PERMITIDOS
    .has(icono)
      ? icono
      : "fa-solid fa-code";
}

function obtenerTemaSeguro(
  tema
) {
  return TEMAS_PERMITIDOS
    .has(tema)
      ? tema
      : "cyan-project";
}

function validarUrl(
  valor
) {
  const url =
    new URL(
      valor.trim()
    );

  if (
    ![
      "http:",
      "https:"
    ].includes(
      url.protocol
    )
  ) {
    throw new Error(
      "URL inválida"
    );
  }

  return url.href;
}

function abrirEnlaceSeguro(
  enlace
) {
  if (!enlace) {
    return;
  }

  try {
    window.open(
      validarUrl(
        enlace
      ),
      "_blank",
      "noopener,noreferrer"
    );
  } catch {
    mostrarMensaje(
      "El enlace no es válido.",
      "error"
    );
  }
}

function formatearFecha(
  fecha
) {
  try {
    return new Intl
      .DateTimeFormat(
        "es-MX",
        {
          dateStyle:
            "medium",

          timeStyle:
            "short",

          timeZone:
            "America/Mexico_City"
        }
      )
      .format(
        new Date(
          fecha
        )
      );
  } catch {
    return fecha;
  }
}

function mostrarMensaje(
  texto,
  tipo
) {
  elementos.panelMessage
    .textContent =
    texto;

  elementos.panelMessage
    .className =
    `panel-message ${tipo}`;

  clearTimeout(
    mostrarMensaje.timer
  );

  mostrarMensaje.timer =
    setTimeout(
      () => {
        elementos
          .panelMessage
          .textContent = "";
      },
      6000
    );
}