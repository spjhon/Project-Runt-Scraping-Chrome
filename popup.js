const URL_RUNT = "https://portalpublico.runt.gov.co/#/consulta-vehiculo/consulta/consulta-ciudadana";



// ==========================================
// 🕵️ FUNCION QUE CREA Y ACTIVA LA VENTANA DEL RUNT PARA EL PROCESO, AQUI SE ACTIVA EL PROCESO
// ==========================================
async function activarCodigo() {
  const placeholder = document.querySelector(".captcha-placeholder");
  const errorDiv = document.getElementById("error-section");
  const captchaBox = document.querySelector(".captcha-box");

  placeholder.textContent = "Reiniciando entorno...";



// ==========================================
  // 🕵️ EXTRAER PLACA DE TECMMAS PRIMERO
  // ==========================================
  try {
    placeholder.textContent = "Leyendo placa de Tecmmas...";
    //aqui se activa la espera por parte del manejador en background
    const respuesta = await chrome.runtime.sendMessage({ action: "leerPlaca" });

    if (respuesta && respuesta.success) {
      console.log(`✅ Placa devuelta con éxito: ${respuesta.placa}`);
      document.getElementById("placa").value = respuesta.placa;
    } else {
      console.log(`❌ Error leyendo la placa de tecmmas.`);
      errorDiv.style.borderColor = "#dc3545";
      errorDiv.innerHTML = `<span style="color: #dc3545; font-weight: 600;">❌ Error leyendo la placa de tecmmas.</span>`;
      document.getElementById("placa").value = "No hay placa";
      return
    }
  } catch (error) {
    console.log(`❌ Error leyendo la placa de tecmmas, Error desconocido`);
    errorDiv.style.borderColor = "#dc3545";
    errorDiv.innerHTML = `<span style="color: #dc3545; font-weight: 600;">❌ Error leyendo la placa de tecmmas, error desconocido: ${error.message}</span>`;
    document.getElementById("placa").value = "No hay placa";
    return
  }






  // ==========================================
  // 🕵️ LISTENER DE MENJASES (Siempre activo)
  // ==========================================
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {


    // 🚨 NUEVA ACCIÓN: Manejo de Alerta de Combustible Diferente
  if (message.action === "alertaCombustible") {
    const boxAlerta = document.getElementById("alerta-combustible");
    if (boxAlerta) {
      if (message.se_detecto_otro_combustible === true) {
        boxAlerta.style.display = "block"; // Se muestra grande y rojo
      } else {
        boxAlerta.style.display = "none";  // Se oculta si no aplica
      }
    }
  }

    //Este es para notificaciones que llegan mientras llega el mensaje final
    if (message.action === "notificacionEstado") {
      errorDiv.style.borderColor = "#0d6efd";
      errorDiv.innerHTML = `<span style="color: #0d6efd; font-weight: 500;">⚡ ${message.texto}</span>`;
    }


    //Una vez se recibe el captcha, se imprime en pantalla
    if (message.action === "procesarCatcha") {
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

  });




  
  // ==========================================
  // 🕵️ 3. AHORA SÍ CREAMOS LA PESTAÑA DEL RUNT
  // ==========================================
  try {

/** 
    placeholder.textContent = "Limpiando consultas anteriores...";

    // Buscamos TODAS las pestañas abiertas que tengan la URL del RUNT
    // Usamos el comodín *://*.runt.gov.co/* para atrapar cualquier subdominio o ruta
    const pestañasRuntExistentes = await chrome.tabs.query({ url: "*://*.runt.gov.co/*" });

    if (pestañasRuntExistentes.length > 0) {
      console.log(`🧹 Se encontraron ${pestañasRuntExistentes.length} pestañas del RUNT abiertas. Cerrando...`);
      
      // Mapeamos los IDs de esas pestañas
      const idsParaCerrar = pestañasRuntExistentes.map(tab => tab.id);
      
      // Las cerramos todas de un solo golpe
      await chrome.tabs.remove(idsParaCerrar);
    }
*/


    placeholder.textContent = "Cargando Angular en la sombra (3-5s)...";
    chrome.tabs.create({
      url: URL_RUNT,
      active: false,
    });
  } catch (error) {
    placeholder.textContent = "❌ Error de entorno";
    errorDiv.style.borderColor = "#dc3545";
    errorDiv.innerHTML = `<span style="color: #dc3545; font-weight: 600;">❌ Error de entorno: ${error.message}</span>`;
  }





  // ==========================================
  // 🕵️ ESCUCHADOR DEL FORMULARIO (funcion asyncrona)
  // ==========================================
  const formulario = document.getElementById("runt-form");
  formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Se extraen los datos del formulario
  const datosAutomacion = {
    tipoDoc: document.getElementById("tipoDocumento").value,
    numDoc: document.getElementById("numeroDocumento").value,
    placaVehiculo: document.getElementById("placa").value.toUpperCase(),
    textoCaptcha: document.getElementById("captchaTexto").value,
    scooterSeleccionado: document.querySelector("#esScooter").value
  };

  // Damos aviso al usuario a través del div de mensajes
  errorDiv.style.borderColor = "#0d6efd";
  errorDiv.innerHTML = `<span style="color: #0d6efd; font-weight: 500;">⚡ Procesando envío seguro...</span>`;

  
  try {
    const response = await chrome.runtime.sendMessage({
      action: "inyectarDatosFormularioEntradaRunt",
      datos: datosAutomacion,
    });

    // El código se frena aquí hasta que el background responda. 
    // Una vez responde, el 'if' se ejecuta en línea recta igual que antes:
    if (response && response.success) {
      errorDiv.style.borderColor = "#198754";
      errorDiv.innerHTML = `<span style="color: #198754; font-weight: 600;">✅ ${response.mensaje}</span>`;
    } else if (response && !response.success) {
      errorDiv.style.borderColor = "#dc3545";
      errorDiv.innerHTML = `<span style="color: #dc3545; font-weight: 600;">❌ Error: ${response.error}</span>`;
    }
  } catch (error) {
    // Es vital envolverlo en try/catch porque si el background no está escuchando,
    // el await lanzará un error que debes atrapar aquí.
    errorDiv.style.borderColor = "#dc3545";
    errorDiv.innerHTML = `<span style="color: #dc3545; font-weight: 600;">❌ Error de conexión: ${error.message}</span>`;
  }
});
}






// ==========================================
// 🕵️ LISTENER QUE SE ACTIVA APENAS CARGA EL DOM DEL POPUP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.connect({ name: "radar-sidepanel" });
  activarCodigo();
});


