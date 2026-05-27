console.log("worker background funcionando...")





// ==========================================
  // 🔌 LISTENER
  // ==========================================
chrome.runtime.onInstalled.addListener(() => {
  // 🔥 ESTA LÍNEA HACE LA MAGIA: Vincula el clic del ícono directamente al Side Panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});




 // ==========================================
  // 🔌 Escucha la conexión del puerto para saber cuándo muere el Side Panel
  // ==========================================
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "radar-sidepanel") {
    console.log("📱 Side Panel conectado al radar del Background.");

    // Cuando el panel se cierra, este evento se dispara SÍ O SÍ por el navegador
    port.onDisconnect.addListener(() => {
      console.log("🚨 El Side Panel se ha cerrado. Liquidando pestaña del RUNT...");
      if (idPestañaActiva) {
        // 🔌 MANTENER EL PUERTO VIVO: Si el panel se cierra, el puerto se rompe y el background se entera
        chrome.tabs.remove(idPestañaActiva);
        idPestañaActiva = null;
      }
    });
  }
});






let idPestañaActiva = null;






// ==========================================
  // 🔌 Escuchar mensajes de la extensión
  // ==========================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {



  
 // =========================================================================
  // LEER PLACA (Optimizado: Solo actúa sobre la pestaña activa de Tecmmas)
  // =========================================================================
  if (message.action === "leerPlaca") {
    console.log("📬 Recibido leerPlaca en Background. Buscando la pestaña activa de Tecmmas...");

    // 🫧 Mantenemos la burbuja asíncrona para usar el await de forma limpia
    (async () => {
      try {
        // 1. Buscamos la pestaña que tenga la URL de Tecmmas Y que esté activa en la ventana actual
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        // 2. Si no se encuentra (porque el usuario está parado en otra web, ej: el RUNT)
        if (tabs.length === 0) {
          sendResponse({
            success: false,
            error: "Asegúrate de estar parado sobre la pestaña activa de Tecmmas.",
          });
          return; // Frenamos la burbuja aquí mismo
        }

        const pestañaTecmmasActiva = tabs[0];

        // 3. Le disparamos el mensaje DIRECTO a esa única pestaña activa
        const respuestaDeTecmmas = await chrome.tabs.sendMessage(pestañaTecmmasActiva.id, { 
          action: "extraerPlacaDesdePaginaDeTecmmas" 
        });

        // 4. Si Tecmmas nos devuelve la placa con éxito, respondemos de inmediato al popup
        if (respuestaDeTecmmas && respuestaDeTecmmas.placa) {
          sendResponse({ success: true, placa: respuestaDeTecmmas.placa });
        } else {
          sendResponse({
            success: false,
            error: "La pestaña de Tecmmas está activa, pero no se encontró ninguna placa escrita.",
          });
        }

      } catch (error) {
        // Si el sendMessage falla (por ejemplo, si el Content Script de Tecmmas se congeló o crasheó)
        console.error("❌ Error al conectar con el content script de Tecmmas:", error);
        sendResponse({
          success: false,
          error: "La pestaña de Tecmmas activa no responde o necesita ser recargada.",
        });
      }
    })();

    return true; // ✅ SE MANTIENE: Sigue siendo el cable de espera para el popup
  }






  // =========================================================================
  // Aqui lo que pasa es que si se encuentra el captcha, se toma el id de la tab que hizo el envio y se añade al id de pestaña del background para tener referencia
  //de cual es la pestaña que esta abierta
  // =========================================================================
  if (message.action === "procesarCatcha" && message.success) {
    if (sender.tab && sender.tab.id) {
      idPestañaActiva = sender.tab.id;
      console.log("📌 Pestaña del CAPTCHA vinculada con ID:", idPestañaActiva);
    }
    // 🚫 SIN return true; aquí. No hay respuesta asíncrona que esperar.
  }






  // =========================================================================
  // 3. INYECTAR DATOS EN ENTRADA RUNT (Modernizado con Async/Await)
  // =========================================================================
  if (message.action === "inyectarDatosFormularioEntradaRunt") {
    
    // Creamos una función asíncrona interna para poder usar 'await' de forma limpia
    // patron burbuja para poder utilizar el build in tabs.get que es async
    (async () => {

      if (!idPestañaActiva) {
        sendResponse({
          success: false,
          error: "No hay ninguna pestaña vinculada al CAPTCHA actual.",
        });
        return; // Frenamos la ejecución si no hay ID
      }

      try {
        // 🚀 ESPERAMOS a verificar si la pestaña existe y sigue viva
        const tab = await chrome.tabs.get(idPestañaActiva);

        // Si no se estalló el código en la línea anterior, la pestaña existe.
        // Enviamos los datos al content script del RUNT
        // (Le ponemos await también por si quieres asegurar que Tecmmas/RUNT lo reciba)
        await chrome.tabs.sendMessage(idPestañaActiva, {
          action: "inyectarDatosRunt",
          datos: message.datos,
        });

        // Respondemos con éxito directo al popup
        sendResponse({
          success: true,
          mensaje: "¡Inyectando datos en la pestaña original!",
        });

      } catch (error) {
        // Si 'chrome.tabs.get' o 'sendMessage' fallan, el flujo cae directo aquí
        console.error("❌ Error en el proceso de inyección:", error);
        idPestañaActiva = null; // Limpiamos el ID residual
        
        sendResponse({
          success: false,
          error: "La pestaña original del CAPTCHA fue cerrada o no responde.",
        });
      }
    })(); //este parentesis vacio es que no solo se defina sino que de una se ejecute y empiece a hacer lo suyo con su espera y que tales

    return true; // ✅ SE MANTIENE: Sigue siendo crucial para avisarle a Chrome que 'sendResponse' ocurrirá dentro del bloque async
  }






// =========================================================================
  // DATOS VEHICULO EXTRAIDOS (Modernizado con Async/Await - Dispara y Olvida)
  // =========================================================================
  if (message.action === "datosVehiculoExtraidos" && message.success) {
    console.log("📬 Recibido en background. Redireccionando a Tecmmas...");

    // 🫧 Activamos la burbuja asíncrona interna
    (async () => {
      try {
        // 1. Buscamos directamente la pestaña que coincida con la URL de Tecmmas usando await
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tabs.length === 0) {
          console.log("⚠️ No se encontró la pestaña de Tecmmas abierta.");
          return; // Rompemos la burbuja si no hay pestaña objetivo
        }

        // 2. Le disparamos los datos a la primera pestaña encontrada
        await chrome.tabs.sendMessage(tabs[0].id, {
          action: "inyectarEnTecmmas",
          datos: message.datos,
        });
        
        console.log("🚀 Paquete infoVehiculo enviado con éxito a la pestaña de Tecmmas.");

      } catch (error) {
        // Si el sendMessage falla (porque cerraron la pestaña en ese milisegundo), cae aquí limpio
        console.error("❌ Falló el envío de datos hacia Tecmmas:", error);
      }
    })();

    // 🚫 SIN 'return true;' aquí. Como es un flujo de "dispara y olvida", 
    // el emisor original no está esperando respuesta con un await. El canal se puede cerrar de inmediato.
  }



});




