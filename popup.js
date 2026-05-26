const puertoVida = chrome.runtime.connect({ name: "sidepanel" });

const URL_RUNT = "https://portalpublico.runt.gov.co/#/consulta-vehiculo/consulta/consulta-ciudadana";






async function probarScrapingOculto() {
  const placeholder = document.querySelector(".captcha-placeholder");
  const errorDiv = document.getElementById("error-section");
  const captchaBox = document.querySelector(".captcha-box");

  placeholder.textContent = "Reiniciando entorno...";

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "resultadoRunt") {
      if (message.success) {
        placeholder.textContent = "✅ ¡CAPTCHA CLONADO!";
        captchaBox.innerHTML = `<img src="${message.data}" alt="CAPTCHA RUNT" style="max-width:100%; height:auto; border-radius:6px; display:block; margin:0 auto;">`;
        errorDiv.style.borderColor = "#198754";
        errorDiv.innerHTML = `<span style="color: #198754; font-weight: 500;">🤖 Sistema listo. Esperando datos...</span>`;
      } else {
        placeholder.textContent = "❌ Falló la extracción";
        errorDiv.style.borderColor = "#dc3545";
        errorDiv.innerHTML = `<span style="color: #dc3545; font-weight: 600;">❌ Error: ${message.error}</span>`;
      }
    }

    if (message.action === "notificacionEstado") {
      errorDiv.style.borderColor = "#0d6efd";
      errorDiv.innerHTML = `<span style="color: #0d6efd; font-weight: 500;">⚡ ${message.texto}</span>`;
    }
  });

  try {
    placeholder.textContent = "Cargando Angular en la sombra (3-5s)...";

    await chrome.tabs.create({
      url: URL_RUNT,
      active: false,
    });
  } catch (error) {
    placeholder.textContent = "❌ Error de entorno";
    errorDiv.style.borderColor = "#dc3545";
    errorDiv.innerHTML = `<span style="color: #dc3545; font-weight: 600;">❌ Error: ${error.message}</span>`;
  }
}







document.addEventListener("DOMContentLoaded", () => {
  probarScrapingOculto();

  const formulario = document.getElementById("runt-form");

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datosAutomacion = {
      tipoDoc: document.getElementById("tipoDocumento").value,
      numDoc: document.getElementById("numeroDocumento").value,
      placaVehiculo: document.getElementById("placa").value.toUpperCase(),
      textoCaptcha: document.getElementById("captchaTexto").value,
    };

    const errorDiv = document.getElementById("error-section");
    errorDiv.style.borderColor = "#0d6efd";
    errorDiv.innerHTML = `<span style="color: #0d6efd; font-weight: 500;">⚡ Procesando envío seguro...</span>`;

    // 🚀 CAMBIO AQUÍ: Le enviamos la orden al Background, que nunca muere
    // 🚀 Enviamos al background y esperamos su respuesta inmediata
    chrome.runtime.sendMessage(
      {
        action: "guardarDatosFormulario",
        datos: datosAutomacion,
      },
      (response) => {
        // 🔍 Si el background responde con un error, lo pintamos en la caja roja
        if (response && !response.success) {
          errorDiv.style.borderColor = "#dc3545"; // Borde rojo de error
          errorDiv.innerHTML = `<span style="color: #dc3545; font-weight: 600;">❌ Error: ${response.error}</span>`;
        }
        if (response && response.success) {
          errorDiv.style.borderColor = "#198754"; // Color verde de éxito
          errorDiv.innerHTML = `<span style="color: #198754; font-weight: 600;">✅ ${response.mensaje}</span>`;
        }
      },
    );
  });
});



// Detectar de forma nativa cuándo se destruye/cierra el Side Panel
window.addEventListener('unload', () => {
    console.log("se activo el unload")
    chrome.runtime.sendMessage({ action: "cerrarPestañaRunt" });
});

