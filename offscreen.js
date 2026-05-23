// Esperamos a que el iframe cargue por completo su HTML inicial
const iframe = document.getElementById('runt-frame');

iframe.addEventListener('load', () => {
    console.log("🌐 El iframe del RUNT ha cargado en segundo plano.");

    // Damos un pequeño respiro de 3 segundos para que Angular termine de pintar el DOM interno
    setTimeout(() => {
        try {
            // Entramos al documento interno del iframe
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            
            // 🔍 Buscamos tu selector CSS dentro del RUNT
            const captchaImg = iframeDocument.querySelector("div.col-md-12:nth-child(3) > img:nth-child(1)");

            if (captchaImg) {
                // Si lo encuentra, le mandamos un mensaje al popup con el ID o el SRC
                chrome.runtime.sendMessage({
                    action: "resultadoRunt",
                    success: true,
                    data: `Elemento encontrado. ID/Clase: ${captchaImg.className || 'Sin clase'} - Alt: ${captchaImg.alt || 'Sin alt'}`
                });
            } else {
                // Si no lo encuentra, avisamos del fallo
                chrome.runtime.sendMessage({
                    action: "resultadoRunt",
                    success: false,
                    error: "No se encontró el elemento con el selector CSS indicado."
                });
            }
        } catch (err) {
            // Si el RUNT nos bloquea por políticas del iframe (SOP), saltará aquí
            chrome.runtime.sendMessage({
                action: "resultadoRunt",
                success: false,
                error: `Bloqueo de seguridad: ${err.message}`
            });
        }
    }, 3000); 
});