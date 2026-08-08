"use strict";

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

/* =====================================================
   CONFIGURACIÓN DE SUPABASE
===================================================== */

const SUPABASE_URL =
  "https://uevftlxlqxtrjhkqecjp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_PLXTdDsz9AlyQV_KEYsG4A_7UGrCSpW";

const LOGIN_URL = "./index.html";

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
   ESTADO DEL PANEL
===================================================== */

let proyectos = [];
let proyectoEnEdicion = null;
let tecnologiasFormulario = [];
let elementos = {};

/* =====================================================
   INICIO
===================================================== */

document.addEventListener("DOMContentLoaded", iniciarPanel);

async function iniciarPanel() {
  guardarReferencias();

  if (!validarElementos()) {
    console.error("Faltan elementos necesarios en panel.html.");
    return;
  }

  configurarEventos();

  if (!configuracionLista || !supabase) {
    ocultarCarga();

    mostrarMensaje(
      "Falta colocar la Clave publicable de Supabase en panel.js.",
      "warning"
    );

    return;
  }

  const usuarioValido = await comprobarUsuario();

  if (!usuarioValido) {
    return;
  }

  supabase.auth.onAuthStateChange((_evento, sesion) => {
    if (!sesion) {
      window.location.replace(LOGIN_URL);
    }
  });

  cerrarFormulario();
  await cargarProyectos();

  ocultarCarga();
  elementos.panel.classList.remove("hidden");
}

/* =====================================================
   REFERENCIAS DEL DOM
===================================================== */

function guardarReferencias() {
  elementos = {
    loading: document.getElementById("loading-screen"),
    panel: document.getElementById("admin-panel"),
    workspace: document.querySelector(".workspace"),

    logoutButton: document.getElementById("logout-button"),
    newProjectButton: document.getElementById(
      "new-project-button"
    ),

    formPanel: document.getElementById("form-panel"),
    closeFormButton: document.getElementById(
      "close-form-button"
    ),
    cancelButton: document.getElementById("cancel-button"),

    form: document.getElementById("project-form"),
    formTitle: document.getElementById("form-title"),
    projectId: document.getElementById("project-id"),

    title: document.getElementById("title"),
    description: document.getElementById("description"),
    descriptionCounter: document.getElementById(
      "description-counter"
    ),

    demoUrl: document.getElementById("demo-url"),
    githubUrl: document.getElementById("github-url"),

    technologyInput: document.getElementById(
      "technology-input"
    ),

    addTechnologyButton: document.getElementById(
      "add-technology-button"
    ),

    technologyTags: document.getElementById(
      "technology-tags"
    ),

    icon: document.getElementById("icon"),
    theme: document.getElementById("theme"),
    order: document.getElementById("order"),
    published: document.getElementById("published"),
    featured: document.getElementById("featured"),
    iconPreview: document.getElementById("icon-preview"),
    saveButton: document.getElementById("save-button"),

    panelMessage: document.getElementById("panel-message"),

    totalProjects: document.getElementById("total-projects"),

    publishedProjects: document.getElementById(
      "published-projects"
    ),

    hiddenProjects: document.getElementById(
      "hidden-projects"
    ),

    featuredProjects: document.getElementById(
      "featured-projects"
    ),

    search: document.getElementById("project-search"),

    statusFilter: document.getElementById(
      "status-filter"
    ),

    refreshButton: document.getElementById(
      "refresh-button"
    ),

    projectsList: document.getElementById(
      "projects-list"
    ),

    emptyState: document.getElementById(
      "empty-state"
    )
  };
}

function validarElementos() {
  return Object.values(elementos).every(Boolean);
}

/* =====================================================
   EVENTOS
===================================================== */

function configurarEventos() {
  elementos.logoutButton.addEventListener(
    "click",
    cerrarSesion
  );

  elementos.newProjectButton.addEventListener(
    "click",
    abrirNuevoProyecto
  );

  elementos.closeFormButton.addEventListener(
    "click",
    cerrarFormulario
  );

  elementos.cancelButton.addEventListener(
    "click",
    cerrarFormulario
  );

  elementos.form.addEventListener(
    "submit",
    guardarProyecto
  );

  elementos.description.addEventListener(
    "input",
    actualizarContador
  );

  elementos.icon.addEventListener(
    "change",
    actualizarVistaIcono
  );

  elementos.theme.addEventListener(
    "change",
    actualizarVistaIcono
  );

  elementos.search.addEventListener(
    "input",
    renderizarProyectos
  );

  elementos.statusFilter.addEventListener(
    "change",
    renderizarProyectos
  );

  elementos.refreshButton.addEventListener(
    "click",
    cargarProyectos
  );

  elementos.addTechnologyButton.addEventListener(
    "click",
    agregarTecnologiaFormulario
  );

  elementos.technologyInput.addEventListener(
    "keydown",
    (evento) => {
      if (evento.key === "Enter") {
        evento.preventDefault();
        agregarTecnologiaFormulario();
      }
    }
  );
}

/* =====================================================
   TECNOLOGÍAS DEL FORMULARIO
===================================================== */

function agregarTecnologiaFormulario() {
  const tecnologia =
    elementos.technologyInput.value.trim();

  if (!tecnologia) {
    return;
  }

  if (tecnologiasFormulario.length >= 12) {
    mostrarMensaje(
      "Puedes agregar como máximo 12 tecnologías.",
      "warning"
    );
    return;
  }

  const yaExiste = tecnologiasFormulario.some(
    (item) =>
      item.toLowerCase() === tecnologia.toLowerCase()
  );

  if (yaExiste) {
    elementos.technologyInput.value = "";
    elementos.technologyInput.focus();
    return;
  }

  tecnologiasFormulario.push(tecnologia);

  elementos.technologyInput.value = "";

  renderizarTecnologiasFormulario();
  elementos.technologyInput.focus();
}

function eliminarTecnologiaFormulario(indice) {
  tecnologiasFormulario.splice(indice, 1);
  renderizarTecnologiasFormulario();
}

function renderizarTecnologiasFormulario() {
  elementos.technologyTags.replaceChildren();

  tecnologiasFormulario.forEach(
    (tecnologia, indice) => {
      const etiqueta =
        document.createElement("span");

      etiqueta.className = "technology-chip";

      const texto =
        document.createElement("span");

      texto.textContent = tecnologia;

      const eliminar =
        document.createElement("button");

      eliminar.type = "button";
      eliminar.className =
        "technology-chip-remove";

      eliminar.innerHTML =
        '<i class="fa-solid fa-xmark"></i>';

      eliminar.addEventListener(
        "click",
        () => eliminarTecnologiaFormulario(indice)
      );

      etiqueta.append(texto, eliminar);

      elementos.technologyTags.appendChild(
        etiqueta
      );
    }
  );
}

function establecerTecnologiasFormulario(tecnologias) {
  tecnologiasFormulario =
    normalizarTecnologias(tecnologias).slice(0, 12);

  renderizarTecnologiasFormulario();
}

/* =====================================================
   SESIÓN
===================================================== */

async function comprobarUsuario() {
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      window.location.replace(LOGIN_URL);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al verificar la sesión:", error);

    window.location.replace(LOGIN_URL);
    return false;
  }
}

async function cerrarSesion() {
  elementos.logoutButton.disabled = true;

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("No fue posible cerrar sesión:", error);

    mostrarMensaje(
      "No fue posible cerrar la sesión.",
      "error"
    );
  } finally {
    elementos.logoutButton.disabled = false;
  }
}

/* =====================================================
   CARGAR PROYECTOS
===================================================== */

async function cargarProyectos() {
  establecerCargandoActualizacion(true);
  limpiarMensaje();

  try {
    const { data, error } = await supabase
      .from("proyectos")
      .select("*")
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    proyectos = Array.isArray(data) ? data : [];

    actualizarEstadisticas();
    renderizarProyectos();
  } catch (error) {
    console.error("Error al cargar proyectos:", error);

    mostrarMensaje(
      "No fue posible cargar los proyectos. Verifica las políticas RLS.",
      "error"
    );
  } finally {
    establecerCargandoActualizacion(false);
  }
}

/* =====================================================
   RENDERIZAR PROYECTOS
===================================================== */

function renderizarProyectos() {
  const termino = elementos.search.value
    .trim()
    .toLowerCase();

  const filtro = elementos.statusFilter.value;

  const resultados = proyectos.filter((proyecto) => {
    const coincideTexto =
      !termino ||
      proyecto.titulo.toLowerCase().includes(termino) ||
      proyecto.descripcion.toLowerCase().includes(termino) ||
      normalizarTecnologias(proyecto.tecnologias)
        .join(" ")
        .toLowerCase()
        .includes(termino);

    const coincideEstado =
      filtro === "all" ||
      (filtro === "published" && proyecto.publicado) ||
      (filtro === "hidden" && !proyecto.publicado) ||
      (filtro === "featured" && proyecto.destacado);

    return coincideTexto && coincideEstado;
  });

  elementos.projectsList.replaceChildren();

  if (resultados.length === 0) {
    elementos.emptyState.classList.remove("hidden");
    return;
  }

  elementos.emptyState.classList.add("hidden");

  const fragmento = document.createDocumentFragment();

  resultados.forEach((proyecto) => {
    fragmento.appendChild(crearTarjetaProyecto(proyecto));
  });

  elementos.projectsList.appendChild(fragmento);
}

function crearTarjetaProyecto(proyecto) {
  const tema = obtenerTemaSeguro(proyecto.tema);
  const icono = obtenerIconoSeguro(proyecto.icono);

  const tarjeta = document.createElement("article");
  tarjeta.className = `admin-project-card ${tema}`;

  const cabecera = document.createElement("div");
  cabecera.className = "project-card-header";

  const contenedorIcono = document.createElement("div");
  contenedorIcono.className = "project-card-icon";

  const elementoIcono = document.createElement("i");
  elementoIcono.className = icono;

  contenedorIcono.appendChild(elementoIcono);

  const contenido = document.createElement("div");

  const titulo = document.createElement("h3");
  titulo.className = "project-card-title";
  titulo.textContent = proyecto.titulo;

  const descripcion = document.createElement("p");
  descripcion.className = "project-card-description";
  descripcion.textContent = proyecto.descripcion;

  contenido.append(titulo, descripcion);
  cabecera.append(contenedorIcono, contenido);

  const etiquetas = document.createElement("div");
  etiquetas.className = "project-tags";

  normalizarTecnologias(proyecto.tecnologias)
    .forEach((tecnologia) => {
      const etiqueta = document.createElement("span");
      etiqueta.className = "project-tag";
      etiqueta.textContent = tecnologia;

      etiquetas.appendChild(etiqueta);
    });

  const meta = document.createElement("div");
  meta.className = "project-meta";

  meta.appendChild(
    crearEstado(
      proyecto.publicado ? "Publicado" : "Oculto",
      proyecto.publicado
        ? "fa-solid fa-eye"
        : "fa-solid fa-eye-slash",
      proyecto.publicado
        ? "published"
        : "hidden-project"
    )
  );

  if (proyecto.destacado) {
    meta.appendChild(
      crearEstado(
        "Destacado",
        "fa-solid fa-star",
        "featured"
      )
    );
  }

  meta.appendChild(
    crearEstado(
      `Orden ${proyecto.orden}`,
      "fa-solid fa-arrow-down-1-9",
      "order"
    )
  );

  const acciones = document.createElement("div");
  acciones.className = "project-card-actions";

  const botonDemo = crearBotonAccion(
    "Demo",
    "fa-solid fa-arrow-up-right-from-square"
  );

  botonDemo.addEventListener("click", () => {
    abrirEnlaceSeguro(proyecto.url_demo);
  });

  const botonGitHub = crearBotonAccion(
    "GitHub",
    "fa-brands fa-github"
  );

  botonGitHub.disabled = !proyecto.url_github;

  botonGitHub.addEventListener("click", () => {
    abrirEnlaceSeguro(proyecto.url_github);
  });

  const botonEditar = crearBotonAccion(
    "Editar",
    "fa-solid fa-pen"
  );

  botonEditar.addEventListener("click", () => {
    abrirEdicionProyecto(proyecto);
  });

  const botonEstado = crearBotonAccion(
    proyecto.publicado ? "Ocultar" : "Publicar",
    proyecto.publicado
      ? "fa-solid fa-eye-slash"
      : "fa-solid fa-eye"
  );

  botonEstado.addEventListener("click", () => {
    cambiarPublicacion(proyecto, botonEstado);
  });

  const botonEliminar = crearBotonAccion(
    "Eliminar",
    "fa-solid fa-trash",
    true
  );

  botonEliminar.addEventListener("click", () => {
    eliminarProyecto(proyecto, botonEliminar);
  });

  acciones.append(
    botonDemo,
    botonGitHub,
    botonEditar,
    botonEstado,
    botonEliminar
  );

  tarjeta.append(
    cabecera,
    etiquetas,
    meta,
    acciones
  );

  return tarjeta;
}

function crearEstado(texto, icono, clase) {
  const estado = document.createElement("span");
  estado.className = `status-badge ${clase}`;

  const elementoIcono = document.createElement("i");
  elementoIcono.className = icono;

  const elementoTexto = document.createElement("span");
  elementoTexto.textContent = texto;

  estado.append(elementoIcono, elementoTexto);

  return estado;
}

function crearBotonAccion(texto, icono, peligro = false) {
  const boton = document.createElement("button");

  boton.type = "button";
  boton.className = peligro
    ? "action-button danger"
    : "action-button";

  const elementoIcono = document.createElement("i");
  elementoIcono.className = icono;

  const elementoTexto = document.createElement("span");
  elementoTexto.textContent = texto;

  boton.append(elementoIcono, elementoTexto);

  return boton;
}

/* =====================================================
   CREAR Y EDITAR
===================================================== */

function abrirNuevoProyecto() {
  proyectoEnEdicion = null;

  elementos.form.reset();

  tecnologiasFormulario = [];
  renderizarTecnologiasFormulario();

  elementos.projectId.value = "";
  elementos.formTitle.textContent = "Nuevo proyecto";
  elementos.published.checked = true;
  elementos.featured.checked = true;
  elementos.order.value = obtenerSiguienteOrden();

  actualizarContador();
  actualizarVistaIcono();
  abrirFormulario();

  elementos.title.focus();
}

function abrirEdicionProyecto(proyecto) {
  proyectoEnEdicion = proyecto;

  elementos.projectId.value = proyecto.id;
  elementos.formTitle.textContent = "Editar proyecto";

  elementos.title.value = proyecto.titulo;
  elementos.description.value = proyecto.descripcion;
  elementos.demoUrl.value = proyecto.url_demo;
  elementos.githubUrl.value = proyecto.url_github || "";

  establecerTecnologiasFormulario(
    proyecto.tecnologias
  );

  elementos.icon.value = obtenerIconoSeguro(
    proyecto.icono
  );

  elementos.theme.value = obtenerTemaSeguro(
    proyecto.tema
  );

  elementos.order.value = proyecto.orden;
  elementos.published.checked = proyecto.publicado;
  elementos.featured.checked = proyecto.destacado;

  actualizarContador();
  actualizarVistaIcono();
  abrirFormulario();

  elementos.title.focus();
}

function abrirFormulario() {
  elementos.formPanel.classList.remove("closed");
  elementos.workspace.classList.remove("form-closed");

  elementos.formPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function cerrarFormulario() {
  proyectoEnEdicion = null;

  elementos.form.reset();

  tecnologiasFormulario = [];
  renderizarTecnologiasFormulario();

  elementos.projectId.value = "";

  elementos.formPanel.classList.add("closed");
  elementos.workspace.classList.add("form-closed");

  actualizarContador();
  actualizarVistaIcono();
}

async function guardarProyecto(evento) {
  evento.preventDefault();
  limpiarMensaje();

  if (!elementos.form.checkValidity()) {
    elementos.form.reportValidity();
    return;
  }

  let datos;

  try {
    datos = obtenerDatosFormulario();
  } catch (error) {
    mostrarMensaje(error.message, "error");
    return;
  }

  establecerGuardando(true);

  try {
    let respuesta;

    if (proyectoEnEdicion) {
      respuesta = await supabase
        .from("proyectos")
        .update(datos)
        .eq("id", proyectoEnEdicion.id)
        .select()
        .single();
    } else {
      respuesta = await supabase
        .from("proyectos")
        .insert(datos)
        .select()
        .single();
    }

    if (respuesta.error) {
      throw respuesta.error;
    }

    mostrarMensaje(
      proyectoEnEdicion
        ? "Proyecto actualizado correctamente."
        : "Proyecto creado correctamente.",
      "success"
    );

    cerrarFormulario();
    await cargarProyectos();
  } catch (error) {
    console.error("Error al guardar el proyecto:", error);

    mostrarMensaje(
      "No fue posible guardar el proyecto. Verifica los campos y permisos.",
      "error"
    );
  } finally {
    establecerGuardando(false);
  }
}

function obtenerDatosFormulario() {
  const titulo = elementos.title.value.trim();
  const descripcion = elementos.description.value.trim();

  const urlDemo = validarUrl(
    elementos.demoUrl.value,
    true
  );

  const urlGitHub = validarUrl(
    elementos.githubUrl.value,
    false
  );

  const tecnologias = [
    ...tecnologiasFormulario
  ];

  if (tecnologias.length === 0) {
    throw new Error(
      "Debes agregar al menos una tecnología."
    );
  }

  const orden = Number.parseInt(
    elementos.order.value,
    10
  );

  if (!Number.isInteger(orden) || orden < 0) {
    throw new Error(
      "El orden debe ser un número entero mayor o igual a cero."
    );
  }

  return {
    titulo,
    descripcion,
    url_demo: urlDemo,
    url_github: urlGitHub,
    tecnologias,
    icono: obtenerIconoSeguro(elementos.icon.value),
    tema: obtenerTemaSeguro(elementos.theme.value),
    publicado: elementos.published.checked,
    destacado: elementos.featured.checked,
    orden
  };
}

/* =====================================================
   PUBLICAR Y ELIMINAR
===================================================== */

async function cambiarPublicacion(proyecto, boton) {
  boton.disabled = true;

  try {
    const nuevoEstado = !proyecto.publicado;

    const { error } = await supabase
      .from("proyectos")
      .update({
        publicado: nuevoEstado
      })
      .eq("id", proyecto.id);

    if (error) {
      throw error;
    }

    mostrarMensaje(
      nuevoEstado
        ? "Proyecto publicado."
        : "Proyecto ocultado.",
      "success"
    );

    await cargarProyectos();
  } catch (error) {
    console.error(
      "Error al cambiar publicación:",
      error
    );

    mostrarMensaje(
      "No fue posible cambiar el estado del proyecto.",
      "error"
    );
  } finally {
    boton.disabled = false;
  }
}

async function eliminarProyecto(proyecto, boton) {
  const confirmado = window.confirm(
    `¿Seguro que deseas eliminar "${proyecto.titulo}"?\n\nEsta acción no se puede deshacer.`
  );

  if (!confirmado) {
    return;
  }

  boton.disabled = true;

  try {
    const { error } = await supabase
      .from("proyectos")
      .delete()
      .eq("id", proyecto.id);

    if (error) {
      throw error;
    }

    mostrarMensaje(
      "Proyecto eliminado correctamente.",
      "success"
    );

    if (proyectoEnEdicion?.id === proyecto.id) {
      cerrarFormulario();
    }

    await cargarProyectos();
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);

    mostrarMensaje(
      "No fue posible eliminar el proyecto.",
      "error"
    );
  } finally {
    boton.disabled = false;
  }
}

/* =====================================================
   ESTADÍSTICAS
===================================================== */

function actualizarEstadisticas() {
  elementos.totalProjects.textContent = String(
    proyectos.length
  );

  elementos.publishedProjects.textContent = String(
    proyectos.filter((proyecto) => proyecto.publicado)
      .length
  );

  elementos.hiddenProjects.textContent = String(
    proyectos.filter((proyecto) => !proyecto.publicado)
      .length
  );

  elementos.featuredProjects.textContent = String(
    proyectos.filter((proyecto) => proyecto.destacado)
      .length
  );
}

/* =====================================================
   UTILIDADES
===================================================== */

function actualizarContador() {
  elementos.descriptionCounter.textContent = String(
    elementos.description.value.length
  );
}

function actualizarVistaIcono() {
  const icono = obtenerIconoSeguro(
    elementos.icon.value
  );

  const tema = obtenerTemaSeguro(
    elementos.theme.value
  );

  elementos.iconPreview.className = tema;
  elementos.iconPreview.innerHTML = "";

  const elementoIcono = document.createElement("i");
  elementoIcono.className = icono;

  elementos.iconPreview.appendChild(elementoIcono);
}

function obtenerSiguienteOrden() {
  if (proyectos.length === 0) {
    return 0;
  }

  const mayorOrden = Math.max(
    ...proyectos.map((proyecto) => {
      const valor = Number(proyecto.orden);
      return Number.isFinite(valor) ? valor : 0;
    })
  );

  return mayorOrden + 1;
}

function normalizarTecnologias(tecnologias) {
  if (!Array.isArray(tecnologias)) {
    return [];
  }

  return tecnologias
    .map((tecnologia) => String(tecnologia).trim())
    .filter(Boolean);
}

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

function validarUrl(valor, obligatoria) {
  const texto = valor.trim();

  if (!texto && !obligatoria) {
    return null;
  }

  if (!texto && obligatoria) {
    throw new Error(
      "El enlace del proyecto publicado es obligatorio."
    );
  }

  try {
    const url = new URL(texto);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }

    return url.href;
  } catch {
    throw new Error(
      "Los enlaces deben comenzar con http:// o https://."
    );
  }
}

function abrirEnlaceSeguro(enlace) {
  if (!enlace) {
    return;
  }

  try {
    const url = new URL(enlace);

    if (!["http:", "https:"].includes(url.protocol)) {
      return;
    }

    window.open(
      url.href,
      "_blank",
      "noopener,noreferrer"
    );
  } catch {
    mostrarMensaje(
      "El enlace del proyecto no es válido.",
      "error"
    );
  }
}

function establecerGuardando(guardando) {
  elementos.saveButton.disabled = guardando;

  elementos.saveButton.innerHTML = guardando
    ? `
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      Guardando...
    `
    : `
      <i class="fa-solid fa-floppy-disk"></i>
      Guardar proyecto
    `;
}

function establecerCargandoActualizacion(cargando) {
  elementos.refreshButton.disabled = cargando;

  const icono = elementos.refreshButton.querySelector("i");

  if (icono) {
    icono.className = cargando
      ? "fa-solid fa-rotate fa-spin"
      : "fa-solid fa-rotate";
  }
}

function mostrarMensaje(texto, tipo) {
  elementos.panelMessage.textContent = texto;
  elementos.panelMessage.className =
    `panel-message ${tipo}`;

  window.clearTimeout(mostrarMensaje.temporizador);

  mostrarMensaje.temporizador = window.setTimeout(() => {
    limpiarMensaje();
  }, 5000);
}

function limpiarMensaje() {
  elementos.panelMessage.textContent = "";
  elementos.panelMessage.className = "panel-message";
}

function ocultarCarga() {
  elementos.loading.classList.add("hidden");
}