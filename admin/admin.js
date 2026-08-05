"use strict";

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

/*
 * Estas dos variables se completarán después de crear Supabase.
 *
 * La PUBLISHABLE KEY puede utilizarse en el navegador con RLS.
 * NUNCA coloques aquí:
 * - la contraseña
 * - una secret key
 * - una service_role key
 * - credenciales de la base de datos
 */
const SUPABASE_URL =
  "REEMPLAZAR_CON_URL_DE_SUPABASE";

const SUPABASE_PUBLISHABLE_KEY =
  "REEMPLAZAR_CON_PUBLISHABLE_KEY";

const PANEL_URL = "./panel.html";

const configuracionLista =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("REEMPLAZAR") &&
  SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_") &&
  !SUPABASE_PUBLISHABLE_KEY.includes("REEMPLAZAR");

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

document.addEventListener("DOMContentLoaded", iniciarLogin);

async function iniciarLogin() {
  const formulario = document.getElementById("login-form");
  const botonPassword = document.getElementById("toggle-password");
  const campoPassword = document.getElementById("password");

  if (!formulario || !botonPassword || !campoPassword) {
    console.error("No se encontraron los elementos del formulario.");
    return;
  }

  botonPassword.addEventListener("click", () => {
    alternarPassword(campoPassword, botonPassword);
  });

  formulario.addEventListener("submit", procesarLogin);

  if (!configuracionLista) {
    mostrarMensaje(
      "La interfaz está lista. Falta conectar Supabase para activar el acceso.",
      "warning"
    );

    return;
  }

  await comprobarSesionActiva();
}

function alternarPassword(campoPassword, botonPassword) {
  const mostrandoPassword = campoPassword.type === "text";

  campoPassword.type = mostrandoPassword
    ? "password"
    : "text";

  const icono = botonPassword.querySelector("i");

  if (icono) {
    icono.className = mostrandoPassword
      ? "fa-regular fa-eye"
      : "fa-regular fa-eye-slash";
  }

  botonPassword.setAttribute(
    "aria-label",
    mostrandoPassword
      ? "Mostrar contraseña"
      : "Ocultar contraseña"
  );
}

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
      console.error("Error al comprobar la sesión:", error);
      return;
    }

    if (session) {
      window.location.replace(PANEL_URL);
    }
  } catch (error) {
    console.error("No fue posible comprobar la sesión:", error);
  }
}

async function procesarLogin(evento) {
  evento.preventDefault();

  const formulario = evento.currentTarget;
  const campoEmail = document.getElementById("email");
  const campoPassword = document.getElementById("password");
  const botonLogin = formulario.querySelector(".login-button");

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
      "El acceso todavía no está conectado con Supabase.",
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
       * Usamos un mensaje genérico para no revelar:
       * - si el correo existe
       * - si la contraseña fue incorrecta
       * - si la cuenta está registrada
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
    console.error("Error durante el inicio de sesión:", error);

    mostrarMensaje(
      "No fue posible iniciar sesión. Inténtalo nuevamente.",
      "error"
    );
  } finally {
    establecerCargando(botonLogin, false);
  }
}

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

function mostrarMensaje(texto, tipo) {
  const elemento = document.getElementById("login-message");

  if (!elemento) {
    return;
  }

  elemento.textContent = texto;
  elemento.className = `login-message ${tipo}`;
}

function limpiarMensaje() {
  const elemento = document.getElementById("login-message");

  if (!elemento) {
    return;
  }

  elemento.textContent = "";
  elemento.className = "login-message";
}