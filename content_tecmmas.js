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

  if (request.action === "inyectarEnTecmmas") {
    const vehiculo = request.datos;
    console.log(
      "⚡ ¡Datos recibidos desde el RUNT listos para inyección!",
      vehiculo,
    );

    // =========================================================================
    // INYECCION EN EL SELECT DE LA CLASE DE VEHICULO (MOTOCICLETA, AUTOMOVIL, ETC...)
    // =========================================================================
    // Capturamos el select de la clase
    const selectClase = document.querySelector("#idclase");

    // Validamos que el select exista y que el objeto traiga la propiedad 'claseVehiculo'
    if (selectClase && vehiculo.claseVehiculo) {
      // Convertimos el texto del RUNT (ej: "Motocicleta" o "Automovil") a MAYÚSCULAS
      // y le quitamos espacios fantasmas con .trim()
      const claseBuscar = vehiculo.claseVehiculo.toUpperCase().trim();
      let encontrado = false;

      console.log(`🔍 Buscando qué fila de Tecmmas coincide con: "${claseBuscar}"...`);

      // 3. Recorremos las opciones (<option>) del select una por una
      for (let i = 0; i < selectClase.options.length; i++) {
        const opcion = selectClase.options[i];
        const textoOpcion = opcion.text.toUpperCase().trim();

        // Si el texto del select de Tecmmas coincide con el del RUNT
        if (textoOpcion === claseBuscar || textoOpcion.includes(claseBuscar)) {
          // Aplicamos la jugada maestra: paramos al navegador en ese índice físico
          selectClase.selectedIndex = i;
          selectClase.value = opcion.value; // Sincronizamos el value (ej: "1" o "10")

          encontrado = true;
          console.log(`✅ Coincidencia hallada: ${opcion.text} (Value: ${opcion.value} en Índice: ${i})`);
          break; // Rompemos el bucle porque ya encontramos la opción correcta
        }
      }

      // 4. Si lo encontramos, le disparamos el evento para que pinte el cambio en la pantalla
      if (encontrado) {
        selectClase.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        console.warn(
          `⚠️ No se encontró ningún texto que coincida con "${claseBuscar}" en la lista de Tecmmas.`,
        );
      }
    } else {
      console.error(
        "❌ El select '#idclase' no existe o 'vehiculo.claseVehiculo' viene vacío.",
      );
    }




    // =========================================================================
    // INYECCION DE LA MARCA
    // =========================================================================
    const botonMarca = document.querySelector("#btnmarca");

    if (botonMarca) {
      console.log("🎯 Botón de marcas (#btnmarca) encontrado. Abriendo dialog...",);
      botonMarca.click(); // Este click simula físicamente la acción del usuario

      // =========================================================================
      // ✍️ ESPERAR AL DIALOG E INYECTAR LA MARCA
      // =========================================================================
      // Le damos 400ms a la animación de Bootstrap para que el input exista en el DOM
      setTimeout(() => {
        const inputBusquedaMarca = document.querySelector("#textoMarca");

        if (inputBusquedaMarca && vehiculo.marcaVehiculo) {
          const marcaTexto = vehiculo.marcaVehiculo.toUpperCase().trim();

          // 1. Inyectamos la marca del RUNT en el buscador
          inputBusquedaMarca.value = marcaTexto;

          // 2. Alertas obligatorias al navegador para que active los scripts del buscador
          inputBusquedaMarca.dispatchEvent(
            new Event("input", { bubbles: true }),
          );
          inputBusquedaMarca.dispatchEvent(
            new Event("change", { bubbles: true }),
          );


          console.log(`✅ Marca "${marcaTexto}" escrita en el buscador del dialog.`,);


          // 3. NUEVO: Capturamos el botón "Aproximado 🔎" por su atributo onclick
          const botonFiltrarMarca = document.querySelector("#marcaModal > div > div > div.modal-body > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(1) > input",);

          if (botonFiltrarMarca) {
            console.log("🔍 Botón 'Aproximado 🔎' encontrado. Disparando filtro...");

            botonFiltrarMarca.click(); // Hackeamos el click de búsqueda

            //despues de hacer la busqueda vamos a seleccionar a lo que le vamos a dar click

            // =========================================================================
            // 🛡️ POLLING ASÍNCRONO: Espera inteligente con un tope de 10 segundos
            // =========================================================================
            let intentos = 0;
            const maxIntentos = 50; // 50 intentos * 200ms = 10 segundos máximo de aguante

            const verificarTabla = setInterval(() => {
              intentos++;

              // Buscamos todos los botones que aparecieron dentro de la tabla #listaMarcas
              const botonesResultado = document.querySelectorAll("#listaMarcas input[type='button']");

              // 🚀 CONDICIÓN DE ÉXITO: ¡Aparecieron los datos en la tabla!
              if (botonesResultado.length > 0) {
                clearInterval(verificarTabla); // Frenamos el bucle inmediatamente para liberar memoria
                console.log(`📊 ¡Tabla cargada con éxito en el intento ${intentos} (${intentos * 200}ms)! Encontradas ${botonesResultado.length} opciones.`,);

                let marcaSeleccionada = false;

                // 1. EVALUACIÓN EXACTA: Si el botón dice exactamente la marca que buscamos (Ej: "SUZUKI")
                for (let i = 0; i < botonesResultado.length; i++) {
                  const botonOp = botonesResultado[i];
                  const textoBoton = botonOp.value.toUpperCase().trim();

                  if (textoBoton === marcaTexto) {
                    console.log(
                      `🎯 Coincidencia exacta encontrada: "${botonOp.value}". Dando click...`,
                    );
                    botonOp.click(); // Asigna la marca y cierra el modal nativamente
                    marcaSeleccionada = true;
                    break; // Rompemos el ciclo del for
                  }
                }

                // 2. PLAN DE RESPALDO: Si no hubo coincidencia exacta (Ej: Buscas "CHEVROLET" y sale "CHEVROLET-GM")
                if (!marcaSeleccionada) {
                  console.log("⚠️ No hubo coincidencia exacta. Aplicando Plan B (Aproximación)...");
                  for (let i = 0; i < botonesResultado.length; i++) {
                    const botonOp = botonesResultado[i];
                    const textoBoton = botonOp.value.toUpperCase().trim();

                    if (
                      textoBoton.includes(marcaTexto) ||
                      marcaTexto.includes(textoBoton)
                    ) {
                      console.log(
                        `🎯 Coincidencia parcial encontrada: "${botonOp.value}". Dando click...`,
                      );
                      botonOp.click();
                      marcaSeleccionada = true;
                      break;
                    }
                  }
                }

                if (!marcaSeleccionada) {
                  console.warn(
                    "❌ La tabla cargó, pero ninguna opción coincide con la marca del RUNT.",
                  );
                }

                return; // Detiene la ejecución del ciclo actual porque ya ganamos
              }

              // ⏱️ CONDICIÓN DE FALLO: Se agotaron los 10 segundos y la tabla nunca se llenó
              if (intentos >= maxIntentos) {
                clearInterval(verificarTabla);
                console.error("❌ Tiempo de espera agotado (10s). El servidor de Tecmmas no arrojó resultados para esta marca.");
              }


            }, 200); // 🔄 Revisa la pantalla obsesivamente cada 200 milisegundos
          } else {
            console.warn(
              "⚠️ No se encontró el botón de buscar marcas con el atributo onclick.",
            );
          }
        } else {
          console.error(
            "❌ No se encontró el input '#textoMarca' o 'vehiculo.marca' vino vacío.",
          );
        }
      }, 400); // ⏱️ Espera estratégica de 400 milisegundos
    } else {
      console.error(
        "❌ Error: No se encontró el botón con el id '#btnmarca' en la página.",
      );
    }












// =========================================================================
    // 🏍️ INYECCIÓN DE LA LÍNEA DE VEHÍCULO
    // =========================================================================
    const botonLinea = document.querySelector("#btnlinea");

    if (botonLinea) {
      console.log("🎯 Botón de líneas (#btnlinea) encontrado. Abriendo dialog...");
      botonLinea.click(); // Abrimos el modal de líneas

      // =========================================================================
      // ✍️ ESPERAR AL DIALOG E INYECTAR LA LÍNEA
      // =========================================================================
      // Le damos 400ms a la animación de Bootstrap para que el input exista en el DOM
      setTimeout(() => {
        const inputBusquedaLinea = document.querySelector("#textoLinea");

        if (inputBusquedaLinea && vehiculo.linea) {
          const lineaTexto = vehiculo.linea.toUpperCase().trim();

          // 1. Inyectamos la línea que viene del RUNT en el buscador
          inputBusquedaLinea.value = lineaTexto;

          // 2. Alertas obligatorias al navegador para activar scripts internos
          inputBusquedaLinea.dispatchEvent(new Event("input", { bubbles: true }));
          inputBusquedaLinea.dispatchEvent(new Event("change", { bubbles: true }));

          console.log(`✅ Línea "${lineaTexto}" escrita en el buscador del dialog.`);

          // 3. Capturamos el botón "Aproximado 🔎" del modal de líneas con tu path exacto
          const botonFiltrarLinea = document.querySelector(
            "#lineaModal > div > div > div.modal-body > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(1) > input"
          );

					botonFiltrarLinea.click(); // Disparamos la búsqueda de líneas
          if (botonFiltrarLinea) {
            console.log("🔍 Botón 'Aproximado 🔎' de líneas encontrado. Disparando filtro...");
            

            // =========================================================================
            // 🛡️ POLLING ASÍNCRONO: Espera inteligente con un tope de 10 segundos (Tabla de Líneas)
            // =========================================================================
            let intentosLinea = 0;
            const maxIntentosLinea = 50; // 50 intentos * 200ms = 10 segundos máximo

            const verificarTablaLinea = setInterval(() => {
							
              intentosLinea++;

              // Buscamos todos los botones que aparecieron dentro de la tabla #listaLineas
              const botonesResultadoLinea = document.querySelectorAll(
                "#listaLineas input[type='button']"
              );

              // 🚀 CONDICIÓN DE ÉXITO: ¡Aparecieron los datos en la tabla de líneas!
              if (botonesResultadoLinea.length > 0) {
                clearInterval(verificarTablaLinea); // Frenamos el bucle inmediatamente
                console.log(
                  `📊 ¡Tabla de líneas cargada con éxito en el intento ${intentosLinea}! Encontradas ${botonesResultadoLinea.length} opciones.`
                );

                let lineaSeleccionada = false;

                // 1. EVALUACIÓN EXACTA: Si el botón de Tecmmas coincide idéntico con la línea del RUNT (Ej: "GN 125")
                for (let i = 0; i < botonesResultadoLinea.length; i++) {
                  const botonOp = botonesResultadoLinea[i];
                  const textoBoton = botonOp.value.toUpperCase().trim();

                  if (textoBoton === lineaTexto) {
                    console.log(`🎯 Coincidencia exacta de línea encontrada: "${botonOp.value}". Dando click...`);
                    botonOp.click(); // Asigna la línea y cierra el modal nativamente
                    lineaSeleccionada = true;
                    break; // Rompemos el ciclo del for
                  }
                }

                // 2. PLAN DE RESPALDO: Si no hubo coincidencia exacta (Ej: Buscas "GN 125" y sale "GN 125 SPORT")
                if (!lineaSeleccionada) {
                  console.log("⚠️ No hubo coincidencia exacta de línea. Aplicando Plan B (Aproximación)...");
                  for (let i = 0; i < botonesResultadoLinea.length; i++) {
                    const botonOp = botonesResultadoLinea[i];
                    const textoBoton = botonOp.value.toUpperCase().trim();

                    if (textoBoton.includes(lineaTexto) || lineaTexto.includes(textoBoton)) {
                      console.log(`🎯 Coincidencia parcial de línea encontrada: "${botonOp.value}". Dando click...`);
                      botonOp.click();
                      lineaSeleccionada = true;
                      break;
                    }
                  }
                }

                if (!lineaSeleccionada) {
                  console.warn("❌ La tabla cargó, pero ninguna opción coincide con la línea del RUNT.");
                }

                return; // Detiene la ejecución del ciclo actual
              }

              // ⏱️ CONDICIÓN DE FALLO: Se agotaron los 10 segundos
              if (intentosLinea >= maxIntentosLinea) {
                clearInterval(verificarTablaLinea);
                console.error("❌ Tiempo de espera agotado (10s). El servidor de Tecmmas no arrojó resultados para esta línea.");
              }
            }, 200); // 🔄 Revisa la pantalla cada 200ms

          } else {
            console.warn("⚠️ No se encontró el botón de buscar líneas con el selector proporcionado.");
          }
        } else {
          console.error("❌ No se encontró el input '#textoLinea' o 'vehiculo.linea' vino vacío.");
        }
      }, 2000); // ⏱️ Espera estratégica de 400ms para la animación del modal
    } else {
      console.error("❌ Error: No se encontró el botón con el id '#btnlinea' en la página.");
    }










// =========================================================================
    // 🚗 INYECCIÓN DE LA CARROCERÍA DEL VEHÍCULO
    // =========================================================================
    const botonCarroceria = document.querySelector("#btncarroceria");

    if (botonCarroceria) {
      console.log("🎯 Botón de carrocerías (#btncarroceria) encontrado. Abriendo dialog...");
      botonCarroceria.click(); // Abrimos el modal de carrocerías

      // =========================================================================
      // ✍️ ESPERAR AL DIALOG E INYECTAR LA CARROCERÍA
      // =========================================================================
      // Le damos 400ms a la animación de Bootstrap para que el input exista en el DOM
      setTimeout(() => {
        const inputBusquedaCarroceria = document.querySelector("#textoCarroceria");

        if (inputBusquedaCarroceria && vehiculo.tipoCarroceria) {
          const carroceriaTexto = vehiculo.tipoCarroceria.toUpperCase().trim();

          // 1. Inyectamos la carrocería que viene del RUNT en el buscador
          inputBusquedaCarroceria.value = carroceriaTexto;

          // 2. Alertas obligatorias al navegador para activar scripts internos de Tecmmas
          inputBusquedaCarroceria.dispatchEvent(new Event("input", { bubbles: true }));
          inputBusquedaCarroceria.dispatchEvent(new Event("change", { bubbles: true }));

          console.log(`✅ Carrocería "${carroceriaTexto}" escrita en el buscador del dialog.`);

          // 3. Capturamos el botón "Aproximado 🔎" del modal de carrocerías con tu path exacto
          const botonFiltrarCarroceria = document.querySelector(
            "#carroceriaModal > div > div > div.modal-body > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(1) > input"
          );

          if (botonFiltrarCarroceria) {
            console.log("🔍 Botón 'Aproximado 🔎' de carrocerías encontrado. Disparando filtro...");
            botonFiltrarCarroceria.click(); // Disparamos la búsqueda de carrocerías

            // =========================================================================
            // 🛡️ POLLING ASÍNCRONO: Espera inteligente con un tope de 10 segundos (Tabla de Carrocerías)
            // =========================================================================
            let intentosCarroceria = 0;
            const maxIntentosCarroceria = 50; // 50 intentos * 200ms = 10 segundos máximo

            const verificarTablaCarroceria = setInterval(() => {
              intentosCarroceria++;

              // Buscamos todos los botones que aparecieron dentro de la tabla #listaCarrocerias
              const botonesResultadoCarroceria = document.querySelectorAll(
                "#listaCarrocerias input[type='button']"
              );

              // 🚀 CONDICIÓN DE ÉXITO: ¡Aparecieron los datos en la tabla de carrocerías!
              if (botonesResultadoCarroceria.length > 0) {
                clearInterval(verificarTablaCarroceria); // Frenamos el bucle inmediatamente
                console.log(
                  `📊 ¡Tabla de carrocerías cargada con éxito en el intento ${intentosCarroceria}! Encontradas ${botonesResultadoCarroceria.length} opciones.`
                );

                let carroceriaSeleccionada = false;

                // 1. EVALUACIÓN EXACTA: Si coincide idéntico (Ej: "MOTOCARRO")
                for (let i = 0; i < botonesResultadoCarroceria.length; i++) {
                  const botonOp = botonesResultadoCarroceria[i];
                  const textoBoton = botonOp.value.toUpperCase().trim();

                  if (textoBoton === carroceriaTexto) {
                    console.log(`🎯 Coincidencia exacta de carrocería encontrada: "${botonOp.value}". Dando click...`);
                    botonOp.click(); // Asigna la carrocería y cierra el modal nativamente
                    carroceriaSeleccionada = true;
                    break; // Rompemos el ciclo del for
                  }
                }

                // 2. PLAN DE RESPALDO: Si no hubo coincidencia exacta (Ej: Buscas "ESTACAS" y sale "ESTACAS / REPARTO")
                if (!carroceriaSeleccionada) {
                  console.log("⚠️ No hubo coincidencia exacta de carrocería. Aplicando Plan B (Aproximación)...");
                  for (let i = 0; i < botonesResultadoCarroceria.length; i++) {
                    const botonOp = botonesResultadoCarroceria[i];
                    const textoBoton = botonOp.value.toUpperCase().trim();

                    if (textoBoton.includes(carroceriaTexto) || carroceriaTexto.includes(textoBoton)) {
                      console.log(`🎯 Coincidencia parcial de carrocería encontrada: "${botonOp.value}". Dando click...`);
                      botonOp.click();
                      carroceriaSeleccionada = true;
                      break;
                    }
                  }
                }

                if (!carroceriaSeleccionada) {
                  console.warn("❌ La tabla cargó, pero ninguna opción coincide con la carrocería del RUNT.");
                }

                return; // Detiene la ejecución del ciclo actual
              }

              // ⏱️ CONDICIÓN DE FALLO: Se agotaron los 10 segundos
              if (intentosCarroceria >= maxIntentosCarroceria) {
                clearInterval(verificarTablaCarroceria);
                console.error("❌ Tiempo de espera agotado (10s). El servidor de Tecmmas no arrojó resultados para esta carrocería.");
              }
            }, 200); // 🔄 Revisa la pantalla cada 200ms

          } else {
            console.warn("⚠️ No se encontró el botón de buscar carrocerías con el selector proporcionado.");
          }
        } else {
          console.error("❌ No se encontró el input '#textoCarroceria' o 'vehiculo.carroceria' vino vacío.");
        }
      }, 400); // ⏱️ Espera estratégica de 400ms para la animación del modal
    } else {
      console.error("❌ Error: No se encontró el botón con el id '#btncarroceria' en la página.");
    }











    // =========================================================================
    // 🎨 INYECCIÓN DEL COLOR DEL VEHÍCULO
    // =========================================================================
    const botonColor = document.querySelector("#btncolor");

    if (botonColor) {
      console.log("🎯 Botón de colores (#btncolor) encontrado. Abriendo dialog...");
      botonColor.click(); // Abrimos el modal de colores

      // =========================================================================
      // ✍️ ESPERAR AL DIALOG E INYECTAR EL COLOR
      // =========================================================================
      // Le damos 400ms a la animación de Bootstrap para que el input exista en el DOM
      setTimeout(() => {
        const inputBusquedaColor = document.querySelector("#textoColor");

        if (inputBusquedaColor && vehiculo.color) {
          const colorTexto = vehiculo.color.toUpperCase().trim();

          // 1. Inyectamos el color que viene del RUNT en el buscador
          inputBusquedaColor.value = colorTexto;

          // 2. Alertas obligatorias al navegador para activar scripts internos de Tecmmas
          inputBusquedaColor.dispatchEvent(new Event("input", { bubbles: true }));
          inputBusquedaColor.dispatchEvent(new Event("change", { bubbles: true }));

          console.log(`✅ Color "${colorTexto}" escrito en el buscador del dialog.`);

          // 3. Capturamos el botón "Aproximado 🔎" del modal de colores con tu path exacto
          const botonFiltrarColor = document.querySelector(
            "#colorModal > div > div > div.modal-body > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(1) > input"
          );

          if (botonFiltrarColor) {
            console.log("🔍 Botón 'Aproximado 🔎' de colores encontrado. Disparando filtro...");
            botonFiltrarColor.click(); // Disparamos la búsqueda de colores

            // =========================================================================
            // 🛡️ POLLING ASÍNCRONO: Espera inteligente con un tope de 10 segundos (Tabla de Colores)
            // =========================================================================
            let intentosColor = 0;
            const maxIntentosColor = 50; // 50 intentos * 200ms = 10 segundos máximo

            const verificarTablaColor = setInterval(() => {
              intentosColor++;

              // Buscamos todos los botones que aparecieron dentro de la tabla #listaColores
              const botonesResultadoColor = document.querySelectorAll(
                "#listaColores input[type='button']"
              );

              // 🚀 CONDICIÓN DE ÉXITO: ¡Aparecieron los datos en la tabla de colores!
              if (botonesResultadoColor.length > 0) {
                clearInterval(verificarTablaColor); // Frenamos el bucle inmediatamente
                console.log(
                  `📊 ¡Tabla de colores cargada con éxito en el intento ${intentosColor}! Encontradas ${botonesResultadoColor.length} opciones.`
                );

                let colorSeleccionado = false;

                // 1. EVALUACIÓN EXACTA: Si coincide idéntico (Ej: "NEGRO")
                for (let i = 0; i < botonesResultadoColor.length; i++) {
                  const botonOp = botonesResultadoColor[i];
                  const textoBoton = botonOp.value.toUpperCase().trim();

                  if (textoBoton === colorTexto) {
                    console.log(`🎯 Coincidencia exacta de color encontrada: "${botonOp.value}". Dando click...`);
                    botonOp.click(); // Asigna el color y cierra el modal nativamente
                    colorSeleccionado = true;
                    break; // Rompemos el ciclo del for
                  }
                }

                // 2. PLAN DE RESPALDO: Si no hubo coincidencia exacta (Ej: Buscas "ROJO" y sale "ROJO VERMUDES")
                if (!colorSeleccionado) {
                  console.log("⚠️ No hubo coincidencia exacta de color. Aplicando Plan B (Aproximación)...");
                  for (let i = 0; i < botonesResultadoColor.length; i++) {
                    const botonOp = botonesResultadoColor[i];
                    const textoBoton = botonOp.value.toUpperCase().trim();

                    if (textoBoton.includes(colorTexto) || colorTexto.includes(textoBoton)) {
                      console.log(`🎯 Coincidencia parcial de color encontrada: "${botonOp.value}". Dando click...`);
                      botonOp.click();
                      colorSeleccionado = true;
                      break;
                    }
                  }
                }

                if (!colorSeleccionado) {
                  console.warn("❌ La tabla cargó, pero ninguna opción coincide con el color del RUNT.");
                }

                return; // Detiene la ejecución del ciclo actual
              }

              // ⏱️ CONDICIÓN DE FALLO: Se agotaron los 10 segundos
              if (intentosColor >= maxIntentosColor) {
                clearInterval(verificarTablaColor);
                console.error("❌ Tiempo de espera agotado (10s). El servidor de Tecmmas no arrojó resultados para este color.");
              }
            }, 200); // 🔄 Revisa la pantalla cada 200ms

          } else {
            console.warn("⚠️ No se encontró el botón de buscar colores con el selector proporcionado.");
          }
        } else {
          console.error("❌ No se encontró el input '#textoColor' o 'vehiculo.color' vino vacío.");
        }
      }, 400); // ⏱️ Espera estratégica de 400ms para la animación del modal
    } else {
      console.error("❌ Error: No se encontró el botón con el id '#btncolor' en la página.");
    }









    // =========================================================================
    // 🏛️ INYECCIÓN EN EL SELECT DEL TIPO DE SERVICIO (PARTICULAR, PÚBLICO, ETC...)
    // =========================================================================
    // Capturamos el select del servicio
    const selectServicio = document.querySelector("#idservicio");

    // Validamos que el select exista y que el objeto traiga la propiedad 'tipoServicio'
    if (selectServicio && vehiculo.tipoServicio) {
      // Convertimos el texto del RUNT (ej: "Particular" o "Publico") a MAYÚSCULAS
      // y le quitamos espacios fantasmas con .trim()
      const servicioBuscar = vehiculo.tipoServicio.toUpperCase().trim();
      let encontradoServicio = false;

      console.log(`🔍 Buscando qué fila de Tecmmas coincide con el servicio: "${servicioBuscar}"...`);

      // Recorremos las opciones (<option>) del select una por una
      for (let i = 0; i < selectServicio.options.length; i++) {
        const opcion = selectServicio.options[i];
        const textoOpcion = opcion.text.toUpperCase().trim();

        // Si el texto del select de Tecmmas coincide con el del RUNT
        if (textoOpcion === servicioBuscar || textoOpcion.includes(servicioBuscar)) {
          // Aplicamos la jugada maestra: paramos al navegador en ese índice físico
          selectServicio.selectedIndex = i;
          selectServicio.value = opcion.value; // Sincronizamos el value (ej: "3" o "2")

          encontradoServicio = true;
          console.log(`✅ Servicio hallado: ${opcion.text} (Value: ${opcion.value} en Índice: ${i})`);
          break; // Rompemos el bucle porque ya encontramos la opción correcta
        }
      }

      // Si lo encontramos, le disparamos los eventos para que pinte el cambio en la pantalla
      if (encontradoServicio) {
        selectServicio.dispatchEvent(new Event("change", { bubbles: true }));
        selectServicio.dispatchEvent(new Event("input", { bubbles: true }));
        
        // Ejecución de respaldo si Tecmmas tiene lógica inline amarrada al select
        if (typeof selectServicio.onchange === 'function') {
          selectServicio.onchange();
        }
      } else {
        console.warn(
          `⚠️ No se encontró ningún texto que coincida con "${servicioBuscar}" en la lista de servicios de Tecmmas.`,
        );
      }
    } else {
      console.error(
        "❌ El select '#idservicio' no existe o 'vehiculo.tipoServicio' viene vacío.",
      );
    }







    // =========================================================================
    // 📅 INYECCIÓN DEL AÑO MODELO DEL VEHÍCULO
    // =========================================================================
    // Capturamos el input del modelo
    const inputModelo = document.querySelector("#ano_modelo");

    // Validamos que el elemento exista y que el objeto traiga la propiedad 'modelo'
    if (inputModelo && vehiculo.modelo) {
      console.log(`🔍 Inyectando el año modelo: "${vehiculo.modelo}"...`);

      // 1. Asignamos el valor directamente (convertido a string limpio por si viene como número)
      inputModelo.value = vehiculo.modelo.toString().trim();

      // 2. Despertamos los scripts de Tecmmas lanzando los eventos obligatorios
      inputModelo.dispatchEvent(new Event("input", { bubbles: true }));
      inputModelo.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Año modelo inyectado con éxito: ${inputModelo.value}`);
    } else {
      console.error(
        "❌ El input '#ano_modelo' no existe o 'vehiculo.modelo' viene vacío.",
      );
    }







    // =========================================================================
    // 🆔 INYECCIÓN DEL NÚMERO DE CHASIS / SERIE
    // =========================================================================
    // Capturamos el input de la serie/chasis
    const inputChasis = document.querySelector("#numero_serie");

    // Validamos que el elemento exista y que el objeto traiga la propiedad 'numeroChasis'
    if (inputChasis && vehiculo.numeroChasis) {
      console.log(`🔍 Inyectando el número de chasis: "${vehiculo.numeroChasis}"...`);

      // 1. Asignamos el valor en MAYÚSCULAS y sin espacios fantasmas
      inputChasis.value = vehiculo.numeroChasis.toUpperCase().trim();

      // 2. Disparamos los eventos obligatorios para que el navegador se entere del cambio
      inputChasis.dispatchEvent(new Event("input", { bubbles: true }));
      inputChasis.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Número de chasis inyectado con éxito: ${inputChasis.value}`);
    } else {
      console.error(
        "❌ El input '#numero_serie' no existe o 'vehiculo.numeroChasis' viene vacío.",
      );
    }







    // =========================================================================
    // ⚙️ INYECCIÓN DEL NÚMERO DE MOTOR
    // =========================================================================
    // Capturamos el input del motor
    const inputMotor = document.querySelector("#numero_motor");

    // Validamos que el elemento exista y que el objeto traiga la propiedad 'numeroMotor'
    if (inputMotor && vehiculo.numeroMotor) {
      console.log(`🔍 Inyectando el número de motor: "${vehiculo.numeroMotor}"...`);

      // 1. Asignamos el valor en MAYÚSCULAS y bien formateado
      inputMotor.value = vehiculo.numeroMotor.toUpperCase().trim();

      // 2. Notificamos al navegador con los eventos para que la página procese el cambio
      inputMotor.dispatchEvent(new Event("input", { bubbles: true }));
      inputMotor.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Número de motor inyectado con éxito: ${inputMotor.value}`);
    } else {
      console.error(
        "❌ El input '#numero_motor' no existe o 'vehiculo.numeroMotor' viene vacío.",
      );
    }








    // =========================================================================
    // 🪪 INYECCIÓN DEL NÚMERO DE VIN
    // =========================================================================
    // Capturamos el input del VIN
    const inputVin = document.querySelector("#numero_vin");

    // Validamos que el elemento exista y que el objeto traiga la propiedad 'numeroVin'
    if (inputVin && vehiculo.numeroVin) {
      console.log(`🔍 Inyectando el número VIN: "${vehiculo.numeroVin}"...`);

      // 1. Asignamos el valor en MAYÚSCULAS y sin espacios
      inputVin.value = vehiculo.numeroVin.toUpperCase().trim();

      // 2. Notificamos al navegador con los eventos correspondientes
      inputVin.dispatchEvent(new Event("input", { bubbles: true }));
      inputVin.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Número VIN inyectado con éxito: ${inputVin.value}`);
    } else {
      console.error(
        "❌ El input '#numero_vin' no existe o 'vehiculo.numeroVin' viene vacío.",
      );
    }







// =========================================================================
    // ⚡ INYECCIÓN DE LA POTENCIA DEL MOTOR (Valor por Defecto: 10)
    // =========================================================================
    // Capturamos el input de la potencia
    const inputPotencia = document.querySelector("#potencia_motor");

    if (inputPotencia) {
      console.log("🔍 Seteando potencia del motor por defecto para motocicletas...");

      // Asignamos fijamente el valor 10 según la regla del CDA
      inputPotencia.value = 10;

      // Despertamos los eventos para que Tecmmas valide el campo
      inputPotencia.dispatchEvent(new Event("input", { bubbles: true }));
      inputPotencia.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Potencia seteada con éxito en: ${inputPotencia.value} HP`);
    } else {
      console.error("❌ El input '#potencia_motor' no existe en la página actual.");
    }









// =========================================================================
    // 🏍️ INYECCIÓN DEL CILINDRAJE DEL VEHÍCULO
    // =========================================================================
    // Capturamos el input del cilindraje
    const inputCilindraje = document.querySelector("#cilindraje");

    // Validamos que el elemento exista y que el objeto traiga la propiedad 'cilindraje'
    if (inputCilindraje && vehiculo.cilindraje) {
      console.log(`🔍 Inyectando el cilindraje: ${vehiculo.cilindraje}...`);

      // 1. Asignamos el valor directamente (limpio de espacios)
      inputCilindraje.value = vehiculo.cilindraje.toString().trim();

      // 2. Disparamos los eventos obligatorios para alertar al sistema
      inputCilindraje.dispatchEvent(new Event("input", { bubbles: true }));
      inputCilindraje.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Cilindraje inyectado con éxito: ${inputCilindraje.value} cc`);
    } else {
      console.error(
        "❌ El input '#cilindraje' no existe o 'vehiculo.cilindraje' viene vacío.",
      );
    }







// =========================================================================
    // 💳 INYECCIÓN DEL NÚMERO DE LICENCIA DE TRÁNSITO / TARJETA DE PROPIEDAD
    // =========================================================================
    // Capturamos el input de la tarjeta de propiedad
    const inputLicencia = document.querySelector("#numero_tarjeta_propiedad");

    // Validamos que el elemento exista y que el objeto traiga la propiedad 'licenciaTransito'
    if (inputLicencia && vehiculo.licenciaTransito) {
      console.log(`🔍 Inyectando el número de licencia de tránsito: "${vehiculo.licenciaTransito}"...`);

      // 1. Asignamos el valor en MAYÚSCULAS y sin espacios fantasmas
      inputLicencia.value = vehiculo.licenciaTransito.toUpperCase().trim();

      // 2. Disparamos los eventos obligatorios para notificar a Tecmmas
      inputLicencia.dispatchEvent(new Event("input", { bubbles: true }));
      inputLicencia.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Número de licencia inyectado con éxito: ${inputLicencia.value}`);
    } else {
      console.error(
        "❌ El input '#numero_tarjeta_propiedad' no existe o 'vehiculo.licenciaTransito' viene vacío.",
      );
    }






// =========================================================================
    // 🏍️ SELECCIÓN FIJA DEL TIPO DE VEHÍCULO (Siempre MOTO)
    // =========================================================================
    // Capturamos el select del tipo de vehículo
    const selectTipoVehiculo = document.querySelector("#tipo_vehiculo");

    if (selectTipoVehiculo) {
      console.log("🔍 Seteando tipo de vehículo fijo: 'MOTO'...");
      let encontradoMoto = false;

      // Recorremos las opciones para encontrar la primera "MOTO"
      for (let i = 0; i < selectTipoVehiculo.options.length; i++) {
        const opcion = selectTipoVehiculo.options[i];
        const textoOpcion = opcion.text.toUpperCase().trim();

        if (textoOpcion === "MOTO") {
          // Nos paramos físicamente en ese índice y sincronizamos el valor
          selectTipoVehiculo.selectedIndex = i;
          selectTipoVehiculo.value = opcion.value; // Setea el "3"

          encontradoMoto = true;
          console.log(`✅ Opción MOTO encontrada en el Índice: ${i} (Value: ${opcion.value})`);
          break; // Rompemos el ciclo en la primera coincidencia válida
        }
      }

      // Si lo encontramos, disparamos los eventos y la función inline de Tecmmas
      if (encontradoMoto) {
        selectTipoVehiculo.dispatchEvent(new Event("change", { bubbles: true }));
        selectTipoVehiculo.dispatchEvent(new Event("input", { bubbles: true }));

        // 🚀 CRUCIAL: Disparar la función inline cambiarTV(this) de Tecmmas
        if (typeof selectTipoVehiculo.onchange === "function") {
          console.log("⚡ Ejecutando función nativa cambiarTV()...");
          selectTipoVehiculo.onchange();
        }
      } else {
        console.warn("⚠️ No se encontró la opción 'MOTO' en el select.");
      }
    } else {
      console.error("❌ El select '#tipo_vehiculo' no existe en la página actual.");
    }








    // =========================================================================
    // 🚲 SELECCIÓN FIJA DEL NÚMERO DE EJES (Siempre 2)
    // =========================================================================
    // Capturamos el select del número de ejes
    const selectEjes = document.querySelector("#numejes");

    if (selectEjes) {
      console.log("🔍 Seteando número de ejes fijo: '2'...");
      let encontradoEjes = false;

      // Recorremos las opciones para encontrar la primera que diga "2"
      for (let i = 0; i < selectEjes.options.length; i++) {
        const opcion = selectEjes.options[i];
        const textoOpcion = opcion.text.trim();

        if (textoOpcion === "2") {
          // Nos paramos físicamente en ese índice y sincronizamos el valor
          selectEjes.selectedIndex = i;
          selectEjes.value = opcion.value; // Setea el "2"

          encontradoEjes = true;
          console.log(`✅ Opción '2 ejes' encontrada en el Índice: ${i} (Value: ${opcion.value})`);
          break; // Rompemos el ciclo en la primera coincidencia
        }
      }

      // Si lo encontramos, disparamos los eventos obligatorios al navegador
      if (encontradoEjes) {
        selectEjes.dispatchEvent(new Event("change", { bubbles: true }));
        selectEjes.dispatchEvent(new Event("input", { bubbles: true }));

        // Ejecución de respaldo por si Tecmmas tiene lógica amarrada al select
        if (typeof selectEjes.onchange === "function") {
          selectEjes.onchange();
        }
      } else {
        console.warn("⚠️ No se encontró la opción '2' en el select de ejes.");
      }
    } else {
      console.error("❌ El select '#numejes' no existe en la página actual.");
    }







// =========================================================================
    // 🛞 SELECCIÓN FIJA DEL NÚMERO DE LLANTAS (Siempre 2)
    // =========================================================================
    // Capturamos el select del número de llantas
    const selectLlantas = document.querySelector("#numero_llantas");

    if (selectLlantas) {
      console.log("🔍 Seteando número de llantas fijo: '2'...");
      let encontradoLlantas = false;

      // Recorremos las opciones para encontrar la primera que diga "2"
      for (let i = 0; i < selectLlantas.options.length; i++) {
        const opcion = selectLlantas.options[i];
        const textoOpcion = opcion.text.trim();

        if (textoOpcion === "2") {
          // Nos paramos físicamente en ese índice y sincronizamos el valor
          selectLlantas.selectedIndex = i;
          selectLlantas.value = opcion.value; // Setea el "2"

          encontradoLlantas = true;
          console.log(`✅ Opción '2 llantas' encontrada en el Índice: ${i} (Value: ${opcion.value})`);
          break; // Rompemos el ciclo en la primera coincidencia
        }
      }

      // Si lo encontramos, disparamos los eventos obligatorios al navegador
      if (encontradoLlantas) {
        selectLlantas.dispatchEvent(new Event("change", { bubbles: true }));
        selectLlantas.dispatchEvent(new Event("input", { bubbles: true }));

        // Ejecución de respaldo por si Tecmmas tiene lógica oculta en este select
        if (typeof selectLlantas.onchange === "function") {
          selectLlantas.onchange();
        }
      } else {
        console.warn("⚠️ No se encontró la opción '2' en el select de llantas.");
      }
    } else {
      console.error("❌ El select '#numero_llantas' no existe en la página actual.");
    }








    // =========================================================================
    // 💺 INYECCIÓN DEL NÚMERO DE SILLAS (Siempre 1)
    // =========================================================================
    // Capturamos el input del número de sillas
    const inputSillas = document.querySelector("#numsillas");

    if (inputSillas) {
      console.log("🔍 Seteando número de sillas fijo para moto...");

      // Asignamos directamente el valor 1 en modo numérico
      inputSillas.value = 1;

      // Notificamos los cambios obligatorios al sistema de Tecmmas
      inputSillas.dispatchEvent(new Event("input", { bubbles: true }));
      inputSillas.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Número de sillas seteado con éxito en: ${inputSillas.value}`);
    } else {
      console.error("❌ El input '#numsillas' no existe en la página actual.");
    }







    // =========================================================================
    // 📅 INYECCIÓN DE LA FECHA DE MATRÍCULA (Conversión de DD/MM/YYYY a YYYY-MM-DD)
    // =========================================================================
    // Capturamos el input de la fecha de matrícula
    const inputFechaMatricula = document.querySelector("#fecha_matricula");

    // Validamos que el elemento exista y que el objeto traiga la propiedad 'fechaMatricula'
    if (inputFechaMatricula && vehiculo.fechaMatricula) {
      let fechaOriginal = vehiculo.fechaMatricula.toString().trim(); // Viene: "29/08/2025"
      let fechaFormateada = fechaOriginal;

      console.log(`🔍 Procesando fecha original recibida: "${fechaOriginal}"...`);

      // 🛠️ Transformación mágica: Si la fecha contiene barras "/", la reordenamos
      if (fechaOriginal.includes("/")) {
        const partes = fechaOriginal.split("/"); // Separa en: ["29", "08", "2025"]
        
        // Validamos que el split haya cortado los 3 pedazos correctos (Día, Mes, Año)
        if (partes.length === 3) {
          const dia = partes[0];
          const mes = partes[1];
          const ano = partes[2];
          
          // Armamos el formato que Tecmmas ama: "2025-08-29"
          fechaFormateada = `${ano}-${mes}-${dia}`;
          console.log(`🔄 Fecha transformada con éxito a formato Tecmmas: "${fechaFormateada}"`);
        }
      }

      // 1. Inyectamos la fecha perfectamente formateada
      inputFechaMatricula.value = fechaFormateada;

      // 2. Notificamos de inmediato al navegador y a la máscara de datos (data-mask)
      inputFechaMatricula.dispatchEvent(new Event("input", { bubbles: true }));
      inputFechaMatricula.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Fecha de matrícula inyectada con éxito: ${inputFechaMatricula.value}`);
    } else {
      console.error(
        "❌ El input '#fecha_matricula' no existe o 'vehiculo.fechaMatricula' viene vacío.",
      );
    }








    // =========================================================================
    // 🛡️ INYECCIÓN DE LA FECHA DE VENCIMIENTO DEL SOAT (Conversión de DD/MM/YYYY a YYYY-MM-DD)
    // =========================================================================
    // Capturamos el input de la fecha del SOAT
    const inputFechaSoat = document.querySelector("#fecha_vencimiento_soat");

    // Validamos que el elemento exista y que el objeto traiga la propiedad 'vencimientoSoat'
    if (inputFechaSoat && vehiculo.vencimientoSoat) {
      let fechaSoatOriginal = vehiculo.vencimientoSoat.toString().trim(); // Viene: "29/08/2025"
      let fechaSoatFormateada = fechaSoatOriginal;

      console.log(`🔍 Procesando fecha de SOAT original recibida: "${fechaSoatOriginal}"...`);

      // 🛠️ Transformación: Si la fecha contiene barras "/", la reordenamos al derecho de Tecmmas
      if (fechaSoatOriginal.includes("/")) {
        const partesSoat = fechaSoatOriginal.split("/"); // Separa en: ["29", "08", "2025"]
        
        // Validamos que el split tenga los 3 componentes (Día, Mes, Año)
        if (partesSoat.length === 3) {
          const diaSoat = partesSoat[0];
          const mesSoat = partesSoat[1];
          const anoSoat = partesSoat[2];
          
          // Armamos el formato requerido: "2025-08-29"
          fechaSoatFormateada = `${anoSoat}-${mesSoat}-${diaSoat}`;
          console.log(`🔄 Fecha de SOAT transformada con éxito a formato Tecmmas: "${fechaSoatFormateada}"`);
        }
      }

      // 1. Inyectamos la fecha del SOAT perfectamente volteada
      inputFechaSoat.value = fechaSoatFormateada;

      // 2. Notificamos de inmediato al navegador y a la máscara de datos (data-mask)
      inputFechaSoat.dispatchEvent(new Event("input", { bubbles: true }));
      inputFechaSoat.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Fecha de vencimiento de SOAT inyectada con éxito: ${inputFechaSoat.value}`);
    } else {
      console.error(
        "❌ El input '#fecha_vencimiento_soat' no existe o 'vehiculo.vencimientoSoat' viene vacío.",
      );
    }






// =========================================================================
    // 🎓 SELECCIÓN DEL MODO ENSEÑANZA (Basado en la extracción del RUNT)
    // =========================================================================
    // Capturamos el select de enseñanza en Tecmmas
    const selectEnsenanza = document.querySelector("#ensenanza");

    // Validamos que el select exista y que el objeto traiga el dato
    if (selectEnsenanza && vehiculo.esEnsenanza) {
      // Normalizamos el texto del RUNT (por si viene con tilde "SÍ", lo dejamos "SI")
      const valorRunt = vehiculo.esEnsenanza.toUpperCase().trim().replace("SÍ", "SI");
      
      console.log(`🔍 Evaluando modo enseñanza. Valor del RUNT: "${valorRunt}"...`);
      let encontradoEnsenanza = false;

      // Recorremos las opciones del select de Tecmmas
      for (let i = 0; i < selectEnsenanza.options.length; i++) {
        const opcion = selectEnsenanza.options[i];
        const textoOpcion = opcion.text.toUpperCase().trim(); // "NO" o "SI"

        // Comparamos si la opción de Tecmmas coincide con lo que extrajimos del RUNT
        if (textoOpcion === valorRunt) {
          // Nos posicionamos físicamente en ese índice y sincronizamos el valor
          selectEnsenanza.selectedIndex = i;
          selectEnsenanza.value = opcion.value; // Setea "1" si es SI, u "0" si es NO

          encontradoEnsenanza = true;
          console.log(`✅ Opción '${textoOpcion}' seleccionada en el Índice: ${i} (Value: ${opcion.value})`);
          break; // Rompemos el ciclo en la primera coincidencia
        }
      }

      // Si lo encontramos, despertamos los eventos para que Tecmmas procese el cambio
      if (encontradoEnsenanza) {
        selectEnsenanza.dispatchEvent(new Event("change", { bubbles: true }));
        selectEnsenanza.dispatchEvent(new Event("input", { bubbles: true }));

        // Ejecución de respaldo por si Tecmmas tiene lógica inline o amarrada por detrás
        if (typeof selectEnsenanza.onchange === "function") {
          selectEnsenanza.onchange();
        }
      } else {
        console.warn(`⚠️ No se encontró una opción que coincida con "${valorRunt}" en el select.`);
      }
    } else {
      console.error(
        "❌ El select '#ensenanza' no existe o 'vehiculo.esEnsenanza' viene vacío.",
      );
    }







// =========================================================================
    // 👥 INYECCIÓN DEL NÚMERO DE PASAJEROS (Siempre 1)
    // =========================================================================
    // Capturamos el input del número de pasajeros
    const inputPasajeros = document.querySelector("#num_pasajeros");

    if (inputPasajeros) {
      console.log("🔍 Seteando número de pasajeros fijo para moto (1)...");

      // Asignamos directamente el valor 1 en modo numérico
      inputPasajeros.value = 1;

      // Despertamos los eventos obligatorios para notificar a Tecmmas
      inputPasajeros.dispatchEvent(new Event("input", { bubbles: true }));
      inputPasajeros.dispatchEvent(new Event("change", { bubbles: true }));

      console.log(`✅ Número de pasajeros seteado con éxito en: ${inputPasajeros.value}`);
    } else {
      console.error("❌ El input '#num_pasajeros' no existe en la página actual.");
    }







// =========================================================================
    // 🛵 SELECCIÓN DEL TIPO SCOOTER (Basado en el popup de la extensión)
    // =========================================================================
    // Capturamos el select de scooter en Tecmmas
    const selectScooter = document.querySelector("#scooter");

    // Validamos que el select exista y que el objeto traiga el dato del popup
    if (selectScooter && vehiculo.esScooter) {
      // Normalizamos el valor por si acaso (MAYÚSCULAS y sin espacios)
      const valorScooterPopup = vehiculo.esScooter.toUpperCase().trim();
      
      console.log(`🔍 Evaluando si es Scooter. Valor desde el Popup: "${valorScooterPopup}"...`);
      let encontradoScooter = false;

      // Recorremos las opciones del select de Tecmmas
      for (let i = 0; i < selectScooter.options.length; i++) {
        const opcion = selectScooter.options[i];
        const textoOpcion = opcion.text.toUpperCase().trim(); // "NO" o "SI"

        // Comparamos si la opción de Tecmmas coincide con lo seleccionado en tu popup
        if (textoOpcion === valorScooterPopup) {
          // Nos posicionamos físicamente en ese índice y sincronizamos el valor
          selectScooter.selectedIndex = i;
          selectScooter.value = opcion.value; // Setea "1" si es SI, u "0" si es NO

          encontradoScooter = true;
          console.log(`✅ Opción Scooter '${textoOpcion}' seleccionada en el Índice: ${i} (Value: ${opcion.value})`);
          break; // Rompemos el ciclo en la primera coincidencia
        }
      }

      // Si lo encontramos, despertamos los eventos para que Tecmmas procese el cambio
      if (encontradoScooter) {
        selectScooter.dispatchEvent(new Event("change", { bubbles: true }));
        selectScooter.dispatchEvent(new Event("input", { bubbles: true }));

        // Ejecución de respaldo por si Tecmmas tiene lógica reactiva amarrada por detrás
        if (typeof selectScooter.onchange === "function") {
          selectScooter.onchange();
        }
      } else {
        console.warn(`⚠️ No se encontró una opción que coincida con "${valorScooterPopup}" en el select de scooter.`);
      }
    } else {
      console.error(
        "❌ El select '#scooter' no existe o 'vehiculo.esScooter' viene vacío.",
      );
    }










  }
});
