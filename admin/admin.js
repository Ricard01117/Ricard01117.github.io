"use strict";

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

/* =====================================================
   CONFIGURACIÓN DE SUPABASE
===================================================== */

const SUPABASE_URL =
  "https://uevftlxlqxtrjhkqecjp.supabase.co";

/*
 * Pega aquí únicamente la Clave publicable completa.
 * Comienza con: sb_publishable_
 *
 * NUNCA coloques aquí:
 * - sb_secret_
 * - service_role
 * - contraseña de PostgreSQL
 * - contraseña de tu usuario
 */
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_PLXTdDsz9AlyQV_KEYsG4A_7UGrCSpW";

/*
 * Después del inicio de sesión se abrirá este archivo.
 * Lo construiremos en el siguiente paso.
 */
const PANEL_URL = "./panel.html";

/* =====================================================
   VALIDACIÓN DE CONFIGURACIÓN
===================================================== */

const configuracionLista =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_URL.includes(".supabase.co") &&
  SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_") &&
  !SUPABASE_PUBLISHABLE_KEY.includes("PEGA_AQUI");

/* =====================================================
   CLIENTE DE SUPABASE
===================================================== */

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

document.addEventListener("DOMContentLoaded", iniciarLogin);

async function iniciarLogin() {
  const formulario = document.getElementById("login-form");
  const botonPassword = document.getElementById(
    "toggle-password"
  );
  const campoPassword = document.getElementById("password");

  if (!formulario || !botonPassword || !campoPassword) {
    console.error(
      "No se encontraron los elementos del formulario."
    );

    return;
  }

  botonPassword.addEventListener("click", () => {
    alternarPassword(campoPassword, botonPassword);
  });

  formulario.addEventListener("submit", procesarLogin);

  if (!configuracionLista) {
    mostrarMensaje(
      "Falta colocar la Clave publicable de Supabase en admin.js.",
      "warning"
    );

    return;
  }

  await comprobarSesionActiva();
}

/* =====================================================
   MOSTRAR U OCULTAR CONTRASEÑA
===================================================== */

function alternarPassword(campoPassword, botonPassword) {
  const passwordVisible = campoPassword.type === "text";

  campoPassword.type = passwordVisible
    ? "password"
    : "text";

  const icono = botonPassword.querySelector("i");

  if (icono) {
    icono.className = passwordVisible
      ? "fa-regular fa-eye"
      : "fa-regular fa-eye-slash";
  }

  botonPassword.setAttribute(
    "aria-label",
    passwordVisible
      ? "Mostrar contraseña"
      : "Ocultar contraseña"
  );
}

/* =====================================================
   COMPROBAR SESIÓN EXISTENTE
===================================================== */

async function comprobarSesionActiva() {
  if (!supabase) {
    return;
  }

  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error) {
      console.error(
        "Error al comprobar la sesión:",
        error
      );

      return;
    }

    if (session) {
      window.location.replace(PANEL_URL);
    }
  } catch (error) {
    console.error(
      "No fue posible comprobar la sesión:",
      error
    );
  }
}

/* =====================================================
   PROCESAR INICIO DE SESIÓN
===================================================== */

async function procesarLogin(evento) {
  evento.preventDefault();

  const formulario = evento.currentTarget;

  const campoEmail = document.getElementById("email");
  const campoPassword = document.getElementById("password");

  const botonLogin = formulario.querySelector(
    ".login-button"
  );

  limpiarMensaje();

  if (
    !campoEmail ||
    !campoPassword ||
    !botonLogin
  ) {
    mostrarMensaje(
      "No fue posible cargar correctamente el formulario.",
      "error"
    );

    return;
  }

  if (!formulario.checkValidity()) {
    formulario.reportValidity();
    return;
  }

  if (!supabase || !configuracionLista) {
    mostrarMensaje(
      "La conexión con Supabase todavía no está configurada.",
      "warning"
    );

    return;
  }

  const email = campoEmail.value
    .trim()
    .toLowerCase();

  const password = campoPassword.value;

  establecerCargando(botonLogin, true);

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error || !data.session) {
      /*
       * Mensaje genérico para no revelar si:
       * - el correo existe
       * - la contraseña es incorrecta
       * - la cuenta está registrada
       */
      mostrarMensaje(
        "Las credenciales no son válidas.",
        "error"
      );

      campoPassword.value = "";
      campoPassword.focus();

      return;
    }

    mostrarMensaje(
      "Acceso correcto. Abriendo el panel...",
      "success"
    );

    window.setTimeout(() => {
      window.location.replace(PANEL_URL);
    }, 600);
  } catch (error) {
    console.error(
      "Error durante el inicio de sesión:",
      error
    );

    mostrarMensaje(
      "No fue posible iniciar sesión. Inténtalo nuevamente.",
      "error"
    );
  } finally {
    establecerCargando(botonLogin, false);
  }
}

/* =====================================================
   ESTADO DEL BOTÓN
===================================================== */

function establecerCargando(boton, cargando) {
  boton.disabled = cargando;

  boton.innerHTML = cargando
    ? `
      <i class="fa-solid fa-circle-notch fa-spin"></i>
      Verificando...
    `
    : `
      <i class="fa-solid fa-right-to-bracket"></i>
      Iniciar sesión
    `;
}

/* =====================================================
   MENSAJES
===================================================== */

function mostrarMensaje(texto, tipo) {
  const elemento = document.getElementById(
    "login-message"
  );

  if (!elemento) {
    return;
  }

  elemento.textContent = texto;
  elemento.className = `login-message ${tipo}`;
}

function limpiarMensaje() {
  const elemento = document.getElementById(
    "login-message"
  );

  if (!elemento) {
    return;
  }

  elemento.textContent = "";
  elemento.className = "login-message";
}