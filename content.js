// ==========================================
// 📢 FUNCIONES AUXILIARES
// ==========================================

// Esta es una funcion de ayuda para que desde este content.js se pueda enviar diferentes mensajes
//el message lo envia a todo el mundo menos a los otros tabs, osea que background y popup si pero contenttecmmas no
function notificarPopup(mensaje) {
    chrome.runtime.sendMessage({
        action: "notificacionEstado",
        texto: mensaje
    });
}












// ==========================================
// 🕵️ EXTRAER EL CAPTCHA AL INICIAR
// ==========================================
function esperarCaptcha() {
    const selector = "div.col-md-12:nth-child(3) > img:nth-child(1)";
    
    let intervalo; // 1. 📦 Declaramos la variable arriba para que sea visible por todos

    const timeoutId = setTimeout(() => {
        clearInterval(intervalo); //  ¡Ahora sí funciona! Ya sabe qué es 'intervalo'
        console.log("⏱️ Tiempo límite agotado.");
    }, 15000);

    // 2. Le asignamos el valor real abajo
    intervalo = setInterval(() => {
        const img = document.querySelector(selector);
        if (img && img.src && img.src.startsWith("data:image")) {
            clearInterval(intervalo);
            clearTimeout(timeoutId);
            
            chrome.runtime.sendMessage({
                action: "procesarCatcha",
                success: true,
                data: img.src
            });
        }
    }, 500);
}


// ==========================================
// 🕵️ SE ACTIVA LA BUSQUEDA DEL CAPTCHA HASTA QUE APAREZCA O PASEN 15 SEGUNDOS
// ==========================================
if (window.location.href.includes("runt.gov.co")) {
    esperarCaptcha();
}






// ==========================================
// 🕵️ EXTRACTOR UNA VEZ SE TIENE ACCESO
// ==========================================
function extraerDatosResultado() {
    notificarPopup("🔍 Extrayendo datos del vehículo...");

    try {
        const infoVehiculo = {};

        // 1. 🚗 PLACA
        const selectorPlaca = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(1) > div.panel-content > div > div > div:nth-child(1) > div.col-xs-12.col-md-3.col-sm-3.show-grande > b`;
        const elementoPlaca = document.querySelector(selectorPlaca);
        infoVehiculo.placa = elementoPlaca ? elementoPlaca.textContent.trim() : "No encontrada";

        // 2. 📄 NÚMERO DE LICENCIA DE TRÁNSITO
        const selectorLicencia = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(1) > div.panel-content > div > div > div:nth-child(2) > div:nth-child(2) > b`;
        const elementoLicencia = document.querySelector(selectorLicencia);
        infoVehiculo.licenciaTransito = elementoLicencia ? elementoLicencia.textContent.trim() : "No encontrado";

        // 3. 🛠️ TIPO DE SERVICIO
        const selectorServicio = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(1) > div.panel-content > div > div > div:nth-child(3) > div:nth-child(2) > b`;
        const elementoServicio = document.querySelector(selectorServicio);
        infoVehiculo.tipoServicio = elementoServicio ? elementoServicio.textContent.trim() : "No encontrado";

        // 4. 🛞 CLASE DE VEHÍCULO
        const selectorClase = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(1) > div.panel-content > div > div > div:nth-child(3) > div:nth-child(4) > b`;
        const elementoClase = document.querySelector(selectorClase);
        infoVehiculo.claseVehiculo = elementoClase ? elementoClase.textContent.trim() : "No encontrado";

        // 5. 🏷️ MARCA
        const selectorMarca = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(1) > div:nth-child(2) > b`;
        const elementoMarca = document.querySelector(selectorMarca);
        infoVehiculo.marcaVehiculo = elementoMarca ? elementoMarca.textContent.trim() : "No encontrado";

        // 6. 📉 LÍNEA
        const selectorLinea = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(1) > div:nth-child(4) > b`;
        const elementoLinea = document.querySelector(selectorLinea);
        infoVehiculo.linea = elementoLinea ? elementoLinea.textContent.trim() : "No encontrado";

        // 7. 📅 MODELO
        const selectorModelo = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(2) > div:nth-child(2) > b`;
        const elementoModelo = document.querySelector(selectorModelo);
        infoVehiculo.modelo = elementoModelo ? elementoModelo.textContent.trim() : "No encontrado";

        // 8. 🎨 COLOR
        const selectorColor = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(2) > div:nth-child(4) > b`;
        const elementoColor = document.querySelector(selectorColor);
        infoVehiculo.color = elementoColor ? elementoColor.textContent.trim() : "No encontrado";

        // 9. 🔢 NÚMERO SERIE
        const selectorSerie = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(3) > div:nth-child(2) > b`;
        const elementoSerie = document.querySelector(selectorSerie);
        infoVehiculo.numeroSerie = elementoSerie ? elementoSerie.textContent.trim() : "No encontrado";

        // 10. ⚡ NÚMERO MOTOR
        const selectorMotor = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(3) > div:nth-child(4) > b`;
        const elementoMotor = document.querySelector(selectorMotor);
        infoVehiculo.numeroMotor = elementoMotor ? elementoMotor.textContent.trim() : "No encontrado";

        // 11. 🆔 NÚMERO DE CHASIS
        const selectorChasis = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(4) > div:nth-child(2) > b`;
        const elementoChasis = document.querySelector(selectorChasis);
        infoVehiculo.numeroChasis = elementoChasis ? elementoChasis.textContent.trim() : "No encontrado";

        // 12. 🔑 NÚMERO VIN
        const selectorVin = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(4) > div:nth-child(4) > b`;
        const elementoVin = document.querySelector(selectorVin);
        infoVehiculo.numeroVin = elementoVin ? elementoVin.textContent.trim() : "No encontrado";

        // 13. 🧪 CILINDRAJE
        const selectorCilindraje = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(5) > div:nth-child(2) > b`;
        const elementoCilindraje = document.querySelector(selectorCilindraje);
        infoVehiculo.cilindraje = elementoCilindraje ? elementoCilindraje.textContent.trim() : "No encontrado";

        // 14. 📦 TIPO CARROCERÍA
        const selectorCarroceria = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(5) > div:nth-child(4) > b`;
        const elementoCarroceria = document.querySelector(selectorCarroceria);
        infoVehiculo.tipoCarroceria = elementoCarroceria ? elementoCarroceria.textContent.trim() : "No encontrado";

        // 15. ⛽ COMBUSTIBLE
        const selectorCombustible = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(6) > div:nth-child(2) > b`;
        const elementoCombustible = document.querySelector(selectorCombustible);
        infoVehiculo.combustible = elementoCombustible ? elementoCombustible.textContent.trim() : "No encontrado";

        // 16. 📆 FECHA MATRÍCULA
        const selectorMatricula = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(6) > div.col-xs-12.col-md-3.col-sm-3.show-grande.td-icon-date > b`;
        const elementoMatricula = document.querySelector(selectorMatricula);
        infoVehiculo.fechaMatricula = elementoMatricula ? elementoMatricula.textContent.trim() : "No encontrado";

        // 17. 🏥 FECHA VENCIMIENTO SOAT (Selector de acordeón)
        const selectorSoat = `#cdk-accordion-child-1 > div > mat-card-content > div > mat-table > mat-row > mat-cell.mat-cell.cdk-cell.cdk-column-fechaFinVigencia.mat-column-fechaFinVigencia.ng-star-inserted`;
        const elementoSoat = document.querySelector(selectorSoat);
        infoVehiculo.vencimientoSoat = elementoSoat ? elementoSoat.textContent.replace(/.*Vencimiento:\s*/i, "").trim() : "No encontrado";

        // 18. 🏥 VERIFICAR SI ES ENSEÑANZA O NO
        const selectorEnsenanza = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(13) > div:nth-child(2) > b`;
        const elementoEnsenanza = document.querySelector(selectorEnsenanza);
        infoVehiculo.esEnsenanza = elementoEnsenanza ? elementoEnsenanza.textContent.toUpperCase().trim() : "NO";


        let se_detecto_combustible_diferente = false;

      

        if (infoVehiculo.combustible !== "GASOLINA"){
            infoVehiculo.combustible = "";
            se_detecto_combustible_diferente = true;
            
        }

        // ==========================================
        // 🚀 ENVÍO DEL PAQUETE TÉCNICO COMPLETO
        // ==========================================
        console.log("📦 Datos totales del vehículo listos:", infoVehiculo);

        chrome.runtime.sendMessage({
            action: "datosVehiculoExtraidos",
            success: true,
            datos: infoVehiculo,
            se_detecto_otro_combustible: se_detecto_combustible_diferente
        });

        notificarPopup(`✅ ¡Extracción completa de la placa ${infoVehiculo.placa}!`);

    } catch (error) {
        notificarPopup(`⚠️ Error al extraer datos: ${error.message}`);
    }
}









// ==========================================
// 📊 VIGILAR QUE APAREZCA PINTADO EL SOAT PARA PODER PROCEDER A EXTRAER EL RESTO DE DATOS
// ==========================================

function expandirYEsperardesplegableSOAT() {
    // 1. El JS Path exacto del elemento que contiene la fecha dentro del SOAT
    const selectorInternoSOAT = `#cdk-accordion-child-1 > div > mat-card-content > div > mat-table > mat-row > mat-cell.mat-cell.cdk-cell.cdk-column-fechaFinVigencia.mat-column-fechaFinVigencia.ng-star-inserted`;
    
    let tiempoMaximoSOAT;

// Seguro de vida: Si en 8 segundos el RUNT no pintó el SOAT, extrae lo que tenga
    tiempoMaximoSOAT = setTimeout(() => {
        clearInterval(intervaloSOAT);
        console.log("⏱️ Tiempo límite agotado esperando el contenido del SOAT.");
        extraerDatosResultado(); // Extrae marca, modelo, etc., así falle el SOAT
    }, 8000);

    //Iniciamos el segundo bucle de búsqueda (revisa cada 300ms)
    const intervaloSOAT = setInterval(() => {
        const elementoSOATPresente = document.querySelector(selectorInternoSOAT);

        // Si el elemento interno ya existe y tiene el texto de la fecha
        if (elementoSOATPresente && elementoSOATPresente.textContent.trim() !== "") {
            console.log("🎯 ¡Contenido interno del SOAT detectado!");
            
            clearInterval(intervaloSOAT);    // Frenamos este segundo bucle
            clearTimeout(tiempoMaximoSOAT);   // Cancelamos su propio timeout de seguridad
            
            // 🚀 EJECUCIÓN FINAL: Ahora sí extraemos todo el JSON limpio
            extraerDatosResultado();
        }
    }, 300);

    
}






// ==========================================
// 🚨 VIGILAR SI EL RUNT DEVUELVE UN ERROR DE VALIDACIÓN
// ==========================================
function verificarErroresRunt(onClean, onError) {
    // 1. Selector común para las alertas de error que muestra el RUNT (ej: credenciales inválidas, captcha incorrecto)
    // Nota: Si el RUNT usa un elemento específico como <mat-error> o un div con clase de alerta, ajusta este selector.
    const selectorErrorRunt = '#swal2-html-container';
    
    let tiempoMaximoValidacion;
    let intervaloError;

    // Seguro de vida: Si en 2.5 segundos no apareció ningún error, asumimos que todo va bien
    tiempoMaximoValidacion = setTimeout(() => {
        clearInterval(intervaloError);
        console.log("⏱️ No se detectaron errores visuales inmediatos. Procediendo a resultados...");
        onClean(); // Ejecuta la función de éxito (vigilarCargaResultados)
    }, 2500);

    // Revisamos el DOM cada 200ms buscando textos de error
    intervaloError = setInterval(() => {
        const elementoError = document.querySelector(selectorErrorRunt);

        if (elementoError && elementoError.textContent.trim() !== "") {
            const textoError = elementoError.textContent.trim();
            console.error(`🚨 Se detectó un error en la plataforma del RUNT: "${textoError}"`);
            
            clearInterval(intervaloError);
            clearTimeout(tiempoMaximoValidacion);
            
            // Ejecuta el callback de error notificando al usuario
            onError(textoError); 
        }
    }, 200);
}






function vigilarCargaResultados() {
    
    const selectorPlaca = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(1) > div.panel-content > div > div > div:nth-child(1) > div.col-xs-12.col-md-3.col-sm-3.show-grande > b`;
    const selectorMarca = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div > div:nth-child(2) > div:nth-child(2) > cyrconsultavehiculo-info-vehiculo-detallada > div > div:nth-child(2) > div > div.panel-content > div.col-lg-12 > div:nth-child(1) > div:nth-child(2) > b`;
    
    // Guardamos la referencia de este timeout
    let timeoutId;

    const intervaloResultado = setInterval(() => {
        const placaPresente = document.querySelector(selectorPlaca);
        const marcaPresente = document.querySelector(selectorMarca);
        const desplegableSOAT = document.querySelector("#mat-expansion-panel-header-1")


        console.log(desplegableSOAT)

        if (placaPresente && placaPresente.textContent.trim() !== "" && marcaPresente && desplegableSOAT ) {
            clearInterval(intervaloResultado); // Frenamos el bucle de búsqueda
            clearTimeout(timeoutId);           // 🎯 NUEVO: Cancelamos el temporizador de 20s

            desplegableSOAT.click();

            expandirYEsperardesplegableSOAT()
            
           
        }
    }, 600);

    // Asignamos el timeout a la variable
    timeoutId = setTimeout(() => {
        clearInterval(intervaloResultado);
        console.log("⏱️ Tiempo límite superado esperando los resultados.");
    }, 20000);
}









// ==========================================
// 📥 INYECTAR LOS DATOS Y REPORTAR ESTADOS (LISTENERS)
// ==========================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {


    //si el mensaje que llega es inyectarDatosRunt, es para rellenar el formulario y entrar
    if (message.action === "inyectarDatosRunt") {

        const datos = message.datos;
        
        notificarPopup("Iniciando el rellenado del formulario...");

        try {
            // 1. Inyectar la Placa
            const inputPlaca = document.querySelector('input[formcontrolname="placa"]');
            if (inputPlaca) {
                inputPlaca.value = datos.placaVehiculo;
                inputPlaca.dispatchEvent(new Event('input', { bubbles: true }));
                inputPlaca.dispatchEvent(new Event('change', { bubbles: true }));
                notificarPopup("Placa del vehículo colocada correctamente...");
            } else {
                notificarPopup("⚠️ Campo de placa no encontrado.");
            }

            // 2. Inyectar el Número de Documento
            const inputCedula = document.querySelector('input[formcontrolname="documento"]');
            if (inputCedula) {
                inputCedula.value = datos.numDoc;
                inputCedula.dispatchEvent(new Event('input', { bubbles: true }));
                inputCedula.dispatchEvent(new Event('change', { bubbles: true }));
                notificarPopup("Número de documento ingresado...");
            } else {
                notificarPopup("⚠️ Campo de documento no encontrado.");
            }

            // 3. Inyectar el Texto del CAPTCHA
            const inputCaptcha = document.querySelector('input[formcontrolname="captcha"]');
            if (inputCaptcha) {
                inputCaptcha.value = datos.textoCaptcha; 
                inputCaptcha.dispatchEvent(new Event('input', { bubbles: true }));
                inputCaptcha.dispatchEvent(new Event('change', { bubbles: true }));
                notificarPopup("Caracteres del CAPTCHA transferidos...");
            } else {
                notificarPopup("⚠️ Campo del captcha no encontrado en el RUNT.");
            }

            // 4. Seleccionar el Tipo de Documento (mat-select)
            const selectTipoDoc = document.querySelector('mat-select[formcontrolname="tipoDocumento"]');
            if (selectTipoDoc) {
                notificarPopup("Abriendo menú de tipo de documento...");
                selectTipoDoc.click();

                setTimeout(() => {
                    let textoBuscado = "Cédula Ciudadanía";
                    if (datos.tipoDoc === "nit") textoBuscado = "NIT";
                    if (datos.tipoDoc === "pasaporte") textoBuscado = "Pasaporte";
                    if (datos.tipoDoc === "cedula_extranjeria") textoBuscado = "Cédula de Extranjería";
                    if (datos.tipoDoc === "tarjeta_identidad") textoBuscado = "Tarjeta de Identidad";
                    if (datos.tipoDoc === "registro_civil") textoBuscado = "Registro Civil";
                    if (datos.tipoDoc === "carnet_diplomatico") textoBuscado = "Carnet Diplomático";
                    if (datos.tipoDoc === "ppt") textoBuscado = "Permiso por Protección Temporal";

                    const opciones = document.querySelectorAll('mat-option');
                    let encontrada = false;

                    opciones.forEach(opcion => {
                        const spanTexto = opcion.querySelector('.mat-option-text');
                        if (spanTexto) {
                            const textoOpcion = spanTexto.textContent.trim().toLowerCase();
                            
                            if (textoOpcion === textoBuscado.toLowerCase()) {
                                opcion.click();
                                encontrada = true;
                                notificarPopup(`✅ Tipo fijado en: ${textoBuscado}`);
                            }
                        }
                    });

                    if (encontrada) {
                        setTimeout(() => {
                            const selectorExacto = `body > host-runt-root > app-layout > app-theme-runt2 > mat-sidenav-container > mat-sidenav-content > div > ng-component > div > div.row.g-4.align-items-start > div.col-12.col-lg-9.order-1.order-lg-2 > form > div:nth-child(2) > div > mat-card > mat-card-content > div:nth-child(8) > div > div > button`;
                            const botonConsultar = document.querySelector(selectorExacto);

                            if (botonConsultar) {
                                notificarPopup("🚀 Lanzando evento físico de consulta...");
                                
                                const eventoClick = new MouseEvent('click', {
                                    view: window,
                                    bubbles: true,
                                    cancelable: true
                                });
                                botonConsultar.dispatchEvent(eventoClick);

                                console.log("Se logró dar al botón de login, ahora se activa vigilarCargaResultados");


                             // 🎯 AQUÍ ENTRA LA MAGIA: Interceptamos antes de cantar victoria
                                verificarErroresRunt(
                                    // Caso A: Si todo está limpio (onClean)
                                    () => {
                                        notificarPopup("⚡ Formulario procesado con éxito. Extrayendo...");
                                        vigilarCargaResultados();
                                    },
                                    // Caso B: Si saltó un error en el RUNT (onError)
                                    (mensajeErrorRunt) => {
                                        notificarPopup(`❌ RUNT dice: ${mensajeErrorRunt} Cierre y vuelva a abrir esta extencion.`);
                                        // Aquí el flujo se detiene por completo. No se llama a vigilarCargaResultados()
                                    }
                                );


                                
                                
                            } else {
                                notificarPopup("⚠️ Formulario lleno, pero falló el selector JS Path del botón.");
                            }
                        }, 250);
                    } else {
                        notificarPopup(`⚠️ No se pudo marcar la opción: ${textoBuscado}`);
                    }

                }, 300);



            } else {
                notificarPopup("⚠️ Selector de tipo de documento no hallado.");
            }

        } catch (error) {
            chrome.runtime.sendMessage({
                action: "procesarCatcha",
                success: false,
                error: `Fallo en la inyección: ${error.message}`
            });
        }
    }
});