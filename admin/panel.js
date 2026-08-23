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

const CV_MAX_BYTES =
  5 * 1024 * 1024;

const CERTIFICATES_BUCKET =
  "certificados";

const CERTIFICATES_TABLE =
  "certificados_portafolio";

const CERTIFICATE_MAX_BYTES =
  10 * 1024 * 1024;

const CERTIFICATE_ALLOWED_TYPES =
  new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
  ]);

const CERTIFICATE_CATEGORIES =
  new Map([
    [
      "Data / BI",
      "fa-solid fa-chart-column"
    ],
    [
      "Database",
      "fa-solid fa-database"
    ],
    [
      "Cloud",
      "fa-solid fa-cloud"
    ],
    [
      "Development",
      "fa-solid fa-code"
    ],
    [
      "Automation",
      "fa-solid fa-gears"
    ],
    [
      "Security",
      "fa-solid fa-shield-halved"
    ]
  ]);

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

let certificados = [];

let certificadoEnEdicion =
  null;

let archivoCertificadoSeleccionado =
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

  prepararNuevoCertificado();

  await Promise.all([
    cargarProyectos(),
    cargarCurriculum(),
    cargarCertificados()
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
      ),

    newCertificateButton:
      document.getElementById(
        "new-certificate-button"
      ),

    certificateForm:
      document.getElementById(
        "certificate-form"
      ),

    certificateFormTitle:
      document.getElementById(
        "certificate-form-title"
      ),

    certificateId:
      document.getElementById(
        "certificate-id"
      ),

    certificateName:
      document.getElementById(
        "certificate-name"
      ),

    certificateIssuer:
      document.getElementById(
        "certificate-issuer"
      ),

    certificateCategory:
      document.getElementById(
        "certificate-category"
      ),

    certificateCategoryPreview:
      document.getElementById(
        "certificate-category-preview"
      ),

    certificateDate:
      document.getElementById(
        "certificate-date"
      ),

    certificateOrder:
      document.getElementById(
        "certificate-order"
      ),

    certificateActive:
      document.getElementById(
        "certificate-active"
      ),

    certificateFile:
      document.getElementById(
        "certificate-file"
      ),

    certificateSelectedName:
      document.getElementById(
        "certificate-selected-name"
      ),

    certificateFileHelp:
      document.getElementById(
        "certificate-file-help"
      ),

    certificateCancelButton:
      document.getElementById(
        "certificate-cancel-button"
      ),

    certificateSaveButton:
      document.getElementById(
        "certificate-save-button"
      ),

    refreshCertificatesButton:
      document.getElementById(
        "refresh-certificates-button"
      ),

    certificatesCount:
      document.getElementById(
        "certificates-count"
      ),

    certificatesList:
      document.getElementById(
        "certificates-list"
      ),

    certificatesEmptyState:
      document.getElementById(
        "certificates-empty-state"
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

  elementos.newCertificateButton
    .addEventListener(
      "click",
      prepararNuevoCertificado
    );

  elementos.certificateForm
    .addEventListener(
      "submit",
      guardarCertificado
    );

  elementos.certificateCategory
    .addEventListener(
      "change",
      actualizarVistaCategoriaCertificado
    );

  elementos.certificateFile
    .addEventListener(
      "change",
      procesarArchivoCertificado
    );

  elementos.certificateCancelButton
    .addEventListener(
      "click",
      prepararNuevoCertificado
    );

  elementos.refreshCertificatesButton
    .addEventListener(
      "click",
      cargarCertificados
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

/* =============================================
   CURRÍCULUM
============================================= */

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
          contentType:
            "application/pdf",
          upsert: false
        }
      );

    if (storageError) {
      throw new Error(
        `Storage de Supabase: ${storageError.message}`
      );
    }

    archivoNuevoSubido =
      true;

    const datosCv = {
      id: 1,

      nombre_archivo:
        archivo.name,

      ruta:
        nuevaRuta,

      actualizado_en:
        new Date()
          .toISOString(),

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
      rutaAnterior !==
        nuevaRuta
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
          "No fue posible eliminar el CV anterior:",
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

    if (
      archivoNuevoSubido
    ) {

      await supabase
        .storage
        .from(CV_BUCKET)
        .remove([
          nuevaRuta
        ]);
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

    const {
      error: storageError
    } = await supabase
      .storage
      .from(CV_BUCKET)
      .remove([
        curriculumActual.ruta
      ]);

    if (storageError) {
      throw storageError;
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
      throw databaseError;
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

/* =============================================
   CERTIFICADOS
============================================= */

async function cargarCertificados() {

  try {

    const {
      data,
      error
    } = await supabase
      .from(
        CERTIFICATES_TABLE
      )
      .select("*")
      .order(
        "orden",
        {
          ascending: true
        }
      )
      .order(
        "fecha_emision",
        {
          ascending: false,
          nullsFirst: false
        }
      );

    if (error) {
      throw error;
    }

    certificados =
      Array.isArray(data)
        ? data
        : [];

    renderizarCertificadosAdmin();

  } catch (error) {

    console.error(
      "Error al cargar certificados:",
      error
    );

    certificados = [];

    renderizarCertificadosAdmin();

    mostrarMensaje(
      "No fue posible cargar los certificados.",
      "error"
    );
  }
}

function renderizarCertificadosAdmin() {

  elementos.certificatesList
    .replaceChildren();

  elementos.certificatesCount
    .textContent =
    String(
      certificados.length
    );

  elementos.certificatesEmptyState
    .classList.toggle(
      "hidden",
      certificados.length > 0
    );

  const fragmento =
    document
      .createDocumentFragment();

  certificados.forEach(
    (certificado) => {

      fragmento.appendChild(
        crearTarjetaCertificadoAdmin(
          certificado
        )
      );

    }
  );

  elementos.certificatesList
    .appendChild(
      fragmento
    );
}

function crearTarjetaCertificadoAdmin(
  certificado
) {

  const tarjeta =
    document.createElement(
      "article"
    );

  const categoria =
    obtenerCategoriaCertificado(
      certificado.categoria
    );

  tarjeta.className =
    `admin-certificate-card ${obtenerClaseCategoriaCertificado(
      categoria
    )}`;

  const cabecera =
    document.createElement(
      "div"
    );

  cabecera.className =
    "admin-certificate-header";

  const iconoContenedor =
    document.createElement(
      "div"
    );

  iconoContenedor.className =
    "admin-certificate-icon";

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

  const info =
    document.createElement(
      "div"
    );

  info.className =
    "admin-certificate-info";

  const categoriaTexto =
    document.createElement(
      "span"
    );

  categoriaTexto.className =
    "certificate-admin-category";

  categoriaTexto.textContent =
    categoria.toUpperCase();

  const titulo =
    document.createElement(
      "h3"
    );

  titulo.textContent =
    certificado.nombre ||
    "Certificado";

  const emisor =
    document.createElement(
      "p"
    );

  const fecha =
    formatearFechaCertificado(
      certificado.fecha_emision
    );

  emisor.textContent =
    fecha
      ? `${certificado.emisor} · ${fecha}`
      : certificado.emisor;

  info.append(
    categoriaTexto,
    titulo,
    emisor
  );

  cabecera.append(
    iconoContenedor,
    info
  );

  const archivo =
    document.createElement(
      "div"
    );

  archivo.className =
    "certificate-file-row";

  const fileIcon =
    document.createElement(
      "i"
    );

  fileIcon.className =
    certificado.tipo_archivo ===
      "application/pdf"
      ? "fa-solid fa-file-pdf"
      : "fa-solid fa-file-image";

  const fileName =
    document.createElement(
      "span"
    );

  fileName.textContent =
    certificado.nombre_archivo ||
    "Archivo";

  archivo.append(
    fileIcon,
    fileName
  );

  const meta =
    document.createElement(
      "div"
    );

  meta.className =
    "certificate-admin-meta";

  meta.appendChild(
    crearBadge(
      certificado.activo
        ? "Publicado"
        : "Oculto",

      certificado.activo
        ? "published"
        : "hidden-project"
    )
  );

  meta.appendChild(
    crearBadge(
      `Orden ${
        Number(
          certificado.orden
        ) || 0
      }`,
      "order"
    )
  );

  const acciones =
    document.createElement(
      "div"
    );

  acciones.className =
    "certificate-admin-actions";

  const ver =
    crearBoton(
      "Ver"
    );

  ver.addEventListener(
    "click",
    () => {
      abrirCertificado(
        certificado
      );
    }
  );

  const copiar =
    crearBoton(
      "Copiar link"
    );

  copiar.addEventListener(
    "click",
    async () => {
      await copiarEnlaceCertificado(
        certificado
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
      abrirEdicionCertificado(
        certificado
      );
    }
  );

  const estado =
    crearBoton(
      certificado.activo
        ? "Ocultar"
        : "Publicar"
    );

  estado.addEventListener(
    "click",
    async () => {
      await cambiarPublicacionCertificado(
        certificado
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
      await eliminarCertificado(
        certificado
      );
    }
  );

  acciones.append(
    ver,
    copiar,
    editar,
    estado,
    eliminar
  );

  tarjeta.append(
    cabecera,
    archivo,
    meta,
    acciones
  );

  return tarjeta;
}

function prepararNuevoCertificado() {

  certificadoEnEdicion =
    null;

  archivoCertificadoSeleccionado =
    null;

  elementos.certificateForm
    .reset();

  elementos.certificateId
    .value = "";

  elementos.certificateFormTitle
    .textContent =
    "Nuevo certificado";

  elementos.certificateCategory
    .value =
    "Data / BI";

  elementos.certificateOrder
    .value =
    String(
      obtenerSiguienteOrdenCertificado()
    );

  elementos.certificateActive
    .checked = true;

  elementos.certificateFile
    .value = "";

  elementos.certificateSelectedName
    .textContent =
    "Seleccionar certificado";

  elementos.certificateFileHelp
    .textContent =
    "Nuevo certificado: selecciona un PDF o una imagen.";

  elementos.certificateSaveButton
    .innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Guardar certificado
    `;

  actualizarVistaCategoriaCertificado();
}

function abrirEdicionCertificado(
  certificado
) {

  certificadoEnEdicion =
    certificado;

  archivoCertificadoSeleccionado =
    null;

  elementos.certificateFormTitle
    .textContent =
    "Editar certificado";

  elementos.certificateId
    .value =
    String(
      certificado.id
    );

  elementos.certificateName
    .value =
    certificado.nombre || "";

  elementos.certificateIssuer
    .value =
    certificado.emisor || "";

  elementos.certificateCategory
    .value =
    obtenerCategoriaCertificado(
      certificado.categoria
    );

  elementos.certificateDate
    .value =
    certificado.fecha_emision ||
    "";

  elementos.certificateOrder
    .value =
    String(
      Number(
        certificado.orden
      ) || 0
    );

  elementos.certificateActive
    .checked =
    Boolean(
      certificado.activo
    );

  elementos.certificateFile
    .value = "";

  elementos.certificateSelectedName
    .textContent =
    certificado.nombre_archivo ||
    "Archivo actual";

  elementos.certificateFileHelp
    .textContent =
    "Selecciona otro archivo solo si deseas reemplazar el actual.";

  elementos.certificateSaveButton
    .innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      Guardar cambios
    `;

  actualizarVistaCategoriaCertificado();

  elementos.certificateForm
    .scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
}

function procesarArchivoCertificado() {

  const archivo =
    elementos.certificateFile
      .files?.[0] ??
    null;

  archivoCertificadoSeleccionado =
    null;

  if (!archivo) {

    elementos.certificateSelectedName
      .textContent =
      certificadoEnEdicion
        ?.nombre_archivo ||
      "Seleccionar certificado";

    return;
  }

  const extensionValida =
    /\.(pdf|jpe?g|png|webp)$/i
      .test(
        archivo.name
      );

  const tipoValido =
    CERTIFICATE_ALLOWED_TYPES
      .has(
        archivo.type
      ) ||
    extensionValida;

  if (!tipoValido) {

    elementos.certificateFile
      .value = "";

    elementos.certificateSelectedName
      .textContent =
      "Seleccionar certificado";

    mostrarMensaje(
      "El certificado debe ser PDF, JPG, PNG o WEBP.",
      "error"
    );

    return;
  }

  if (
    archivo.size >
    CERTIFICATE_MAX_BYTES
  ) {

    elementos.certificateFile
      .value = "";

    elementos.certificateSelectedName
      .textContent =
      "Seleccionar certificado";

    mostrarMensaje(
      "El certificado no puede superar los 10 MB.",
      "error"
    );

    return;
  }

  archivoCertificadoSeleccionado =
    archivo;

  elementos.certificateSelectedName
    .textContent =
    archivo.name;
}

async function guardarCertificado(
  evento
) {

  evento.preventDefault();

  if (
    !elementos.certificateForm
      .checkValidity()
  ) {

    elementos.certificateForm
      .reportValidity();

    return;
  }

  if (
    !certificadoEnEdicion &&
    !archivoCertificadoSeleccionado
  ) {

    mostrarMensaje(
      "Selecciona el archivo del certificado.",
      "warning"
    );

    return;
  }

  const archivo =
    archivoCertificadoSeleccionado;

  const rutaAnterior =
    certificadoEnEdicion?.ruta ||
    null;

  let nuevaRuta =
    null;

  let archivoSubido =
    false;

  let baseGuardada =
    false;

  try {

    elementos.certificateSaveButton
      .disabled = true;

    elementos.certificateSaveButton
      .innerHTML = `
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        Guardando...
      `;

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
        "Tu sesión expiró. Inicia sesión nuevamente."
      );
    }

    if (archivo) {

      const extension =
        obtenerExtensionArchivo(
          archivo.name,
          archivo.type
        );

      const slug =
        crearSlugArchivo(
          elementos.certificateName
            .value
        );

      nuevaRuta =
        `${Date.now()}-${slug}.${extension}`;

      const {
        error: storageError
      } = await supabase
        .storage
        .from(
          CERTIFICATES_BUCKET
        )
        .upload(
          nuevaRuta,
          archivo,
          {
            cacheControl: "3600",

            contentType:
              archivo.type ||
              obtenerMimeDesdeExtension(
                extension
              ),

            upsert: false
          }
        );

      if (storageError) {
        throw new Error(
          `Storage de Supabase: ${storageError.message}`
        );
      }

      archivoSubido =
        true;
    }

    const ahora =
      new Date()
        .toISOString();

    const datos = {

      nombre:
        elementos.certificateName
          .value
          .trim(),

      emisor:
        elementos.certificateIssuer
          .value
          .trim(),

      categoria:
        obtenerCategoriaCertificado(
          elementos.certificateCategory
            .value
        ),

      fecha_emision:
        elementos.certificateDate
          .value ||
        null,

      orden:
        Number.parseInt(
          elementos.certificateOrder
            .value,
          10
        ) || 0,

      activo:
        elementos.certificateActive
          .checked,

      actualizado_en:
        ahora
    };

    if (archivo) {

      datos.nombre_archivo =
        archivo.name;

      datos.ruta =
        nuevaRuta;

      datos.tipo_archivo =
        archivo.type ||
        obtenerMimeDesdeExtension(
          obtenerExtensionArchivo(
            archivo.name,
            archivo.type
          )
        );

    } else if (
      certificadoEnEdicion
    ) {

      datos.nombre_archivo =
        certificadoEnEdicion
          .nombre_archivo;

      datos.ruta =
        certificadoEnEdicion
          .ruta;

      datos.tipo_archivo =
        certificadoEnEdicion
          .tipo_archivo;
    }

    if (
      certificadoEnEdicion
    ) {

      const {
        error
      } = await supabase
        .from(
          CERTIFICATES_TABLE
        )
        .update(
          datos
        )
        .eq(
          "id",
          certificadoEnEdicion.id
        );

      if (error) {
        throw error;
      }

    } else {

      const {
        error
      } = await supabase
        .from(
          CERTIFICATES_TABLE
        )
        .insert(
          datos
        );

      if (error) {
        throw error;
      }
    }

    baseGuardada =
      true;

    if (
      archivo &&
      rutaAnterior &&
      rutaAnterior !== nuevaRuta
    ) {

      const {
        error: removeError
      } = await supabase
        .storage
        .from(
          CERTIFICATES_BUCKET
        )
        .remove([
          rutaAnterior
        ]);

      if (removeError) {

        console.warn(
          "No fue posible limpiar el archivo anterior:",
          removeError
        );
      }
    }

    await cargarCertificados();

    prepararNuevoCertificado();

    mostrarMensaje(
      "Certificado guardado correctamente.",
      "success"
    );

  } catch (error) {

    console.error(
      "Error al guardar certificado:",
      error
    );

    if (
      archivoSubido &&
      !baseGuardada &&
      nuevaRuta
    ) {

      await supabase
        .storage
        .from(
          CERTIFICATES_BUCKET
        )
        .remove([
          nuevaRuta
        ]);
    }

    mostrarMensaje(
      error?.message ||
      "No fue posible guardar el certificado.",
      "error"
    );

  } finally {

    elementos.certificateSaveButton
      .disabled = false;

    elementos.certificateSaveButton
      .innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        Guardar certificado
      `;
  }
}

async function cambiarPublicacionCertificado(
  certificado
) {

  try {

    const {
      error
    } = await supabase
      .from(
        CERTIFICATES_TABLE
      )
      .update({

        activo:
          !certificado.activo,

        actualizado_en:
          new Date()
            .toISOString()

      })
      .eq(
        "id",
        certificado.id
      );

    if (error) {
      throw error;
    }

    await cargarCertificados();

    mostrarMensaje(
      certificado.activo
        ? "Certificado ocultado."
        : "Certificado publicado.",
      "success"
    );

  } catch (error) {

    console.error(
      error
    );

    mostrarMensaje(
      "No fue posible cambiar el estado del certificado.",
      "error"
    );
  }
}

async function eliminarCertificado(
  certificado
) {

  const confirmado =
    window.confirm(
      `¿Seguro que deseas eliminar "${certificado.nombre}"?`
    );

  if (!confirmado) {
    return;
  }

  try {

    const {
      error: databaseError
    } = await supabase
      .from(
        CERTIFICATES_TABLE
      )
      .delete()
      .eq(
        "id",
        certificado.id
      );

    if (databaseError) {
      throw databaseError;
    }

    if (certificado.ruta) {

      const {
        error: storageError
      } = await supabase
        .storage
        .from(
          CERTIFICATES_BUCKET
        )
        .remove([
          certificado.ruta
        ]);

      if (storageError) {

        console.warn(
          "El registro fue eliminado, pero el archivo no pudo borrarse:",
          storageError
        );
      }
    }

    if (
      certificadoEnEdicion?.id ===
      certificado.id
    ) {

      prepararNuevoCertificado();
    }

    await cargarCertificados();

    mostrarMensaje(
      "Certificado eliminado.",
      "success"
    );

  } catch (error) {

    console.error(
      error
    );

    mostrarMensaje(
      "No fue posible eliminar el certificado.",
      "error"
    );
  }
}

function abrirCertificado(
  certificado
) {

  const url =
    obtenerUrlPublicaCertificado(
      certificado
    );

  if (!url) {

    mostrarMensaje(
      "No fue posible generar el enlace del certificado.",
      "error"
    );

    return;
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

async function copiarEnlaceCertificado(
  certificado
) {

  const url =
    obtenerUrlPublicaCertificado(
      certificado
    );

  if (!url) {

    mostrarMensaje(
      "No fue posible generar el enlace del certificado.",
      "error"
    );

    return;
  }

  try {

    await navigator.clipboard
      .writeText(
        url
      );

    mostrarMensaje(
      "Enlace público copiado. Ya puedes pegarlo en LinkedIn.",
      "success"
    );

  } catch {

    window.prompt(
      "Copia este enlace público:",
      url
    );
  }
}

function obtenerUrlPublicaCertificado(
  certificado
) {

  if (!certificado?.ruta) {
    return null;
  }

  const {
    data
  } = supabase
    .storage
    .from(
      CERTIFICATES_BUCKET
    )
    .getPublicUrl(
      certificado.ruta
    );

  return data?.publicUrl ||
    null;
}

function actualizarVistaCategoriaCertificado() {

  const categoria =
    obtenerCategoriaCertificado(
      elementos.certificateCategory
        .value
    );

  elementos.certificateCategoryPreview
    .className =
    `certificate-category-preview ${obtenerClaseCategoriaCertificado(
      categoria
    )}`;

  elementos.certificateCategoryPreview
    .replaceChildren();

  const icono =
    document.createElement(
      "i"
    );

  icono.className =
    CERTIFICATE_CATEGORIES.get(
      categoria
    );

  elementos.certificateCategoryPreview
    .appendChild(
      icono
    );
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
    "Data / BI":
      "cert-data",

    Database:
      "cert-database",

    Cloud:
      "cert-cloud",

    Development:
      "cert-development",

    Automation:
      "cert-automation",

    Security:
      "cert-security"
  };

  return clases[categoria] ||
    "cert-development";
}

function obtenerSiguienteOrdenCertificado() {

  if (certificados.length === 0) {
    return 0;
  }

  return (
    Math.max(
      ...certificados.map(
        (certificado) =>
          Number(
            certificado.orden
          ) || 0
      )
    ) + 1
  );
}

function obtenerExtensionArchivo(
  nombre,
  tipo
) {

  const match =
    String(nombre)
      .toLowerCase()
      .match(
        /\.([a-z0-9]+)$/
      );

  if (
    match &&
    [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "webp"
    ].includes(
      match[1]
    )
  ) {

    return match[1] ===
      "jpeg"
      ? "jpg"
      : match[1];
  }

  const extensiones = {
    "application/pdf":
      "pdf",

    "image/jpeg":
      "jpg",

    "image/png":
      "png",

    "image/webp":
      "webp"
  };

  return extensiones[tipo] ||
    "bin";
}

function obtenerMimeDesdeExtension(
  extension
) {

  const tipos = {
    pdf:
      "application/pdf",

    jpg:
      "image/jpeg",

    jpeg:
      "image/jpeg",

    png:
      "image/png",

    webp:
      "image/webp"
  };

  return tipos[extension] ||
    "application/octet-stream";
}

function crearSlugArchivo(
  texto
) {

  const slug =
    String(texto)
      .normalize(
        "NFD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .slice(
        0,
        70
      );

  return slug ||
    "certificado";
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
      .replace(
        ".",
        ""
      );

  } catch {

    return "";
  }
}

/* =============================================
   PROYECTOS
============================================= */

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

      fragmento.appendChild(
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
    proyecto.titulo ??
    "";

  elementos.description.value =
    proyecto.descripcion ??
    "";

  elementos.demoUrl.value =
    proyecto.url_demo ??
    "";

  elementos.githubUrl.value =
    proyecto.url_github ??
    "";

  elementos.icon.value =
    obtenerIconoSeguro(
      proyecto.icono
    );

  elementos.theme.value =
    obtenerTemaSeguro(
      proyecto.tema
    );

  elementos.order.value =
    proyecto.orden ??
    0;

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

/* =============================================
   TECNOLOGÍAS FORMULARIO
============================================= */

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

/* =============================================
   UTILIDADES
============================================= */

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

function obtenerMensajeError(
  error
) {

  if (!error) {
    return "Error desconocido.";
  }

  if (
    typeof error ===
      "string"
  ) {
    return error;
  }

  if (
    typeof error.message ===
      "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  try {

    return JSON.stringify(
      error
    );

  } catch {

    return "Error desconocido.";
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
          .textContent =
          "";

      },
      6000
    );
}