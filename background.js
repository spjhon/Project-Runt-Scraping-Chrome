chrome.runtime.onInstalled.addListener(() => {
  // 🔥 ESTA LÍNEA HACE LA MAGIA: Vincula el clic del ícono directamente al Side Panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

let idPestañaActiva = null;


// Escuchar mensajes de la extensión
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {



  // 1. Cuando el content.js encuentra el CAPTCHA, nos pasa el reporte
  if (message.action === "resultadoRunt" && message.success) {
    if (sender.tab && sender.tab.id) {
      idPestañaActiva = sender.tab.id; // 🔥 Guardamos el ID exacto de ESTA pestaña
      console.log("📌 Pestaña del CAPTCHA vinculada con ID:", idPestañaActiva);
    }
  }





  if (message.action === "guardarDatosFormulario") {
    if (idPestañaActiva) {
      // Verificamos si la pestaña que guardamos originalmente todavía existe y sigue viva
      chrome.tabs
        .get(idPestañaActiva)
        .then((tab) => {
          // 🚀 ENVIAR DIRECTO: Le mandamos los datos al ID que tenemos bajo llave
          chrome.tabs.sendMessage(idPestañaActiva, {
            action: "inyectarDatosRunt",
            datos: message.datos,
          });

          sendResponse({
            success: true,
            mensaje: "¡Inyectando datos en la pestaña original!",
          });
        })
        .catch(() => {
          // Si la cerraron o pasó algo, limpiamos el ID y avisamos
          idPestañaActiva = null;
          sendResponse({
            success: false,
            error: "La pestaña original del CAPTCHA fue cerrada.",
          });
        });
    } else {
      sendResponse({
        success: false,
        error: "No hay ninguna pestaña vinculada al CAPTCHA actual.",
      });
    }
  }




	

  return true; // Mantiene el canal abierto
});


chrome.runtime.onConnect.addListener((port) => {
    // Verificamos si la conexión viene del Side Panel de tu extensión
    if (port.name === "sidepanel") {
        console.log("📱 Side Panel conectado al radar.");

        // 🎯 AQUÍ ESTÁ EL TRUCO: Detectar cuándo se destruye el proceso del panel
        port.onDisconnect.addListener(() => {
            console.log("🚨 El Side Panel se ha cerrado (Proceso destruido).");

            // Si hay una pestaña del RUNT guardada bajo llave, la matamos de inmediato
            if (idPestañaActiva) {
                chrome.tabs.remove(idPestañaActiva, () => {
                    if (chrome.runtime.lastError) {
                        console.log("La pestaña del RUNT ya no existía o fue cerrada manualmente.");
                    } else {
                        console.log(`✅ Pestaña del RUNT (${idPestañaActiva}) cerrada automáticamente tras el cierre del Side Panel.`);
                    }
                    idPestañaActiva = null; // Limpiamos memoria
                });
            }
        });
    }
});