const URL_RUNT = "https://portalpublico.runt.gov.co/#/consulta-vehiculo/consulta/consulta-ciudadana";
// Probemos con un selector más genérico de imagen primero por si las moscas
const SELECTOR_CAPTCHA = "div.col-md-12:nth-child(3) > img:nth-child(1)";

async function probarScrapingOculto() {
    const placeholder = document.querySelector(".captcha-placeholder");
    // 🚀 Seleccionamos el contenedor de errores usando la clase que creamos en el HTML/CSS
    const errorDiv = document.querySelector(".error-box");
    
    placeholder.textContent = "Verificando entorno...";

    try {
        // 1. 🔍 REVISAR SI YA EXISTE: Buscamos si ya hay un entorno offscreen abierto
        const contextos = await chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT']
        });

        // Si ya existe uno, no lo creamos de nuevo, simplemente avisamos
        if (contextos.length > 0) {
            
            placeholder.textContent = "¡Entorno invisible reutilizado!";
            return; 
        }

        // 2. Si no existía ninguno, procedemos a crearlo de forma segura
        placeholder.textContent = "Creando entorno invisible...";
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['DOM_SCRAPING'],
            justification: 'Clonar el captcha del RUNT para el formulario interno'
        });

        placeholder.textContent = "¡Entorno invisible creado con éxito!";
        
    } catch (error) {
       
        placeholder.textContent = "❌ Error en entorno invisible";
        
        // 🚀 Inyectamos el error real en la sección de errores con un estilo rojo
        errorDiv.style.borderColor = "#dc3545"; // Cambia el borde de la caja a rojo
        errorDiv.innerHTML = `<span style="color: #dc3545; font-weight: 600;">❌ Error: ${error.message}</span>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    probarScrapingOculto();
});