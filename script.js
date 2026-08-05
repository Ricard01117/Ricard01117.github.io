"use strict";

/* =========================================
   PROYECTOS DEL PORTAFOLIO
========================================= */

const proyectos = [
  {
    titulo: "plataforma-academica",
    enlace: "https://plataforma-academica-ricard01117.netlify.app/login",
    descripcion:
      "Plataforma académica full stack con React, Laravel y MySQL para gestionar, publicar y consultar documentos académicos.",
    tecnologias: ["React", "Laravel", "MySQL"],
    icono: "fa-solid fa-graduation-cap",
    tema: "cyan-project"
  },
  {
    titulo: "sistema-inventario-frontend",
    enlace: "https://ricard01117.github.io/sistema-inventario-frontend/",
    descripcion:
      "Interfaz de sistema de inventario desarrollada con React y Vite.",
    tecnologias: ["React", "Vite", "JavaScript"],
    icono: "fa-solid fa-box-open",
    tema: "cyan-project"
  },
  {
    titulo: "artesanias-de-mi-mama",
    enlace: "https://ricard01117.github.io/artesanias-de-mi-mama/",
    descripcion:
      "Sitio web para presentar y compartir manualidades, imágenes, videos y trabajos artesanales.",
    tecnologias: ["HTML", "CSS", "JavaScript"],
    icono: "fa-regular fa-heart",
    tema: "pink-project"
  },
  {
    titulo: "Buscador-de-juegos",
    enlace: "https://ricard01117.github.io/Buscador-de-juegos/?v=4",
    descripcion:
      "Buscador de videojuegos gratuitos desarrollado con React, Vite y una API externa.",
    tecnologias: ["React", "Vite", "API"],
    icono: "fa-solid fa-gamepad",
    tema: "purple-project"
  }
];


/* =========================================
   INICIO DE LA PÁGINA
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  renderizarProyectos();
  actualizarHora();
  crearCalendarioContribuciones();
  configurarAccesoAdministrativo();
  configurarEfectosTarjetas();

  setInterval(actualizarHora, 1000);
});


/* =========================================
   RENDERIZAR PROYECTOS
========================================= */

function renderizarProyectos() {
  const contenedor = document.getElementById("projects-grid");

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = proyectos
    .map((proyecto) => {
      const etiquetas = proyecto.tecnologias
        .map((tecnologia) => `<span>${tecnologia}</span>`)
        .join("");

      return `
        <a
          href="${proyecto.enlace}"
          target="_blank"
          rel="noopener noreferrer"
          class="project-card ${proyecto.tema}"
        >
          <div class="project-icon">
            <i class="${proyecto.icono}"></i>
          </div>

          <div class="project-content">
            <h4>${proyecto.titulo}</h4>

            <p>${proyecto.descripcion}</p>

            <div class="project-tags">
              ${etiquetas}
            </div>
          </div>

          <i
            class="fa-solid fa-arrow-up-right-from-square project-arrow"
          ></i>
        </a>
      `;
    })
    .join("");
}


/* =========================================
   RELOJ DE MÉXICO
========================================= */

function actualizarHora() {
  const elementoHora = document.getElementById("current-time");

  if (!elementoHora) {
    return;
  }

  try {
    const horaMexico = new Intl.DateTimeFormat("es-MX", {
      timeZone: "America/Mexico_City",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(new Date());

    elementoHora.textContent = horaMexico;
  } catch (error) {
    console.error("No fue posible actualizar la hora:", error);

    elementoHora.textContent = new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  }
}


/* =========================================
   CALENDARIO DE CONTRIBUCIONES
========================================= */

function crearCalendarioContribuciones() {
  const calendario = document.getElementById("contribution-grid");

  if (!calendario) {
    return;
  }

  calendario.innerHTML = "";

  const totalSemanas = 52;
  const diasPorSemana = 7;
  const totalCeldas = totalSemanas * diasPorSemana;

  const colores = [
    "#082238",
    "#09344a",
    "#07596a",
    "#008f8c",
    "#00c7a5",
    "#20efbd"
  ];

  const textos = [
    "Sin actividad",
    "Actividad baja",
    "Actividad moderada",
    "Actividad constante",
    "Actividad alta",
    "Actividad muy alta"
  ];

  const generador = crearGeneradorAleatorio(117);

  for (let indice = 0; indice < totalCeldas; indice += 1) {
    const celda = document.createElement("div");

    const semana = Math.floor(indice / diasPorSemana);
    const actividadBase = semana / totalSemanas;
    const valorAleatorio = generador();

    let nivel = 0;

    if (valorAleatorio < actividadBase * 0.16) {
      nivel = 1;
    }

    if (valorAleatorio < actividadBase * 0.11) {
      nivel = 2;
    }

    if (valorAleatorio < actividadBase * 0.075) {
      nivel = 3;
    }

    if (semana > 39 && valorAleatorio < 0.18) {
      nivel = 4;
    }

    if (semana > 46 && valorAleatorio < 0.13) {
      nivel = 5;
    }

    celda.style.backgroundColor = colores[nivel];
    celda.dataset.level = String(nivel);
    celda.title = textos[nivel];
    celda.setAttribute("aria-label", textos[nivel]);

    calendario.appendChild(celda);
  }
}


/* =========================================
   GENERADOR DECORATIVO
========================================= */

function crearGeneradorAleatorio(semilla) {
  let valor = semilla;

  return function generar() {
    valor += 0x6d2b79f5;

    let resultado = valor;

    resultado = Math.imul(
      resultado ^ (resultado >>> 15),
      resultado | 1
    );

    resultado ^= resultado + Math.imul(
      resultado ^ (resultado >>> 7),
      resultado | 61
    );

    return (
      ((resultado ^ (resultado >>> 14)) >>> 0) /
      4294967296
    );
  };
}


/* =========================================
   ACCESO OCULTO AL ADMINISTRADOR
========================================= */

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


/* =========================================
   EFECTO DE MOVIMIENTO EN TARJETAS
========================================= */

function configurarEfectosTarjetas() {
  const tarjetas = document.querySelectorAll(
    ".technology-card, .project-card, .stat-card"
  );

  tarjetas.forEach((tarjeta) => {
    tarjeta.addEventListener("mousemove", (evento) => {
      if (window.innerWidth <= 960) {
        return;
      }

      const limites = tarjeta.getBoundingClientRect();

      const posicionX = evento.clientX - limites.left;
      const posicionY = evento.clientY - limites.top;

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