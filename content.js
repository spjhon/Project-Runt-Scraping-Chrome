
//Content Script es el que está atrapado dentro de la página web.
/**
 * El Content Script no se usa para hacer fetch a servidores externos. De hecho, su superpoder (y su única misión) 
 * es manipular el DOM (el HTML) de la página donde está metido.
 */

console.log("🚀 Extractor RUNT: Content script inyectado con éxito en la página.");

// Aquí escucharemos en el siguiente paso cuando el popup le mande la placa y la cédula.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mensaje recibido en content.js:", message);
    
    // Devolver true para indicar que responderemos de forma asíncrona si es necesario
    return true; 
});










/**
 * [ POPUP (React/HTML) ] 
  │  1. Hace 'fetch' a tu Supabase/Next.js para traer la cédula.
  │  2. Hace 'fetch' al RUNT para traer la imagen del CAPTCHA y mostrarla.
  │  3. El usuario resuelve el CAPTCHA.
  │
  ▼  4. Envía (Placa + Cédula + CAPTCHA) mediante un mensaje de Chrome...
[ CONTENT SCRIPT ] (Inyectado en la pestaña del RUNT)
  │  5. Recibe el mensaje, mete los datos en los inputs del RUNT y da "Clic".
  │  6. Espera que cargue la página y raspa el Chasis, Motor, etc.
  │
  ▼  7. Le devuelve los datos limpios mediante otro mensaje...
[ BACKGROUND SCRIPT ]
     8. Recibe los datos finales, genera el CSV o los manda a tu base de datos en la sombra.
 */