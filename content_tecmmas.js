console.log("🎯 Script de automatización de Tecmmas cargado y escuchando...");




 // =========================================================================
  // LISTENERS
  // =========================================================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {



    if (request.action === "extraerPlacaDesdePaginaDeTecmmas") {
        const inputPlaca = document.querySelector("#numero_placa");
        
        if (inputPlaca && inputPlaca.value.trim() !== "") {
            const placaCalculada = inputPlaca.value.trim().toUpperCase();
            
            // 🚀 LE RESPONDE AL BACKGROUND: Esto viaja en cadena hasta el await del popup
            sendResponse({ placa: placaCalculada }); 
        } else {
            sendResponse({ placa: null });
        }
    }




   if (request.action === "inyectarEnTecmmas") { // Revisa si es .action o .accion según tu background
    const vehiculo = request.datos;
    console.log("⚡ ¡Datos recibidos desde el RUNT listos para inyección!", vehiculo);

    // 1. Inyectamos la placa
    const inputPlaca = document.querySelector("#numero_placa");
    if (inputPlaca) {
        inputPlaca.value = vehiculo.placa;
        console.log(`✅ Placa '${vehiculo.placa}' inyectada.`);
        
        // ========================================================
        // 🏍️ NUEVO: Inyección automática de Clase de Vehículo (Siempre Motocicleta)
        // ========================================================
        const selectClase = document.querySelector("#idclase");
        if (selectClase) {
            selectClase.value = "10"; // "10" corresponde a MOTOCICLETA en tu HTML
            
            // Forzamos al navegador y a los scripts ocultos a enterarse del cambio
            selectClase.dispatchEvent(new Event('change', { bubbles: true }));
            console.log("✅ Clase de vehículo forzada a: MOTOCICLETA (Value: 10).");
        } else {
            console.warn("⚠️ No se encontró el select '#idclase' en esta pantalla.");
        }
        // ========================================================

        // Forzamos el click de búsqueda automática en Tecmmas para avanzar el flujo
        const botonBuscar = document.querySelector('input[onclick="buscarVehiculo()"]');
        if (botonBuscar) {
            console.log("🔍 Disparando búsqueda automática en Tecmmas...");
            botonBuscar.click();
        }
    } else {
        console.error("❌ No se encontró el input '#numero_placa' en esta vista.");
    }
    
    // 💡 Nota: Los demás datos (marca, modelo) los rellenaremos en el siguiente paso 
    // una vez que la página de Tecmmas procese la placa y cargue el formulario completo.
}



});