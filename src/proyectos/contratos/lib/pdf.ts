/**
 * Genera un PDF desde un elemento DOM, con configuración optimizada para contratos.
 *
 * Detalles importantes:
 * - html2pdf.js (~1MB) se carga vía dynamic import: solo se descarga cuando se
 *   llama a esta función, no en el bundle inicial del módulo.
 * - Esperamos `document.fonts.ready` antes de rasterizar para que html2canvas
 *   capture el texto con la tipografía custom (Fraunces, Geist). Sin esto,
 *   fallback fonts producen letras pegadas en headings ("Propiedadintelectual").
 * - Sacamos `legacy` del pagebreak mode: ese modo inyecta una página blanca
 *   inicial. `css + avoid-all` alcanzan para respetar saltos definidos por CSS.
 * - `letterRendering: true` activa el modo de rasterización letter-by-letter
 *   en html2canvas, evitando glitches con kerning agresivo.
 */
export async function generarPDF(
  elemento: HTMLElement,
  filename: string,
): Promise<void> {
  // Esperar que TODAS las fonts en uso estén cargadas.
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Pequeño tick para estabilizar layout antes de rasterizar.
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Dynamic import: html2pdf.js solo se descarga ahora.
  // @ts-ignore — html2pdf.js no tiene tipos perfectos
  const html2pdfMod = await import('html2pdf.js');
  const html2pdf = html2pdfMod.default ?? html2pdfMod;

  const opts = {
    margin: [15, 15, 15, 15] as [number, number, number, number],
    filename,
    image: { type: 'jpeg' as const, quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      letterRendering: true,
      // Esperar a que las fonts del elemento concreto estén listas dentro del clon.
      onclone: (clonedDoc: Document) => {
        if (clonedDoc.fonts && clonedDoc.fonts.ready) {
          return clonedDoc.fonts.ready;
        }
      },
    },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    // 'legacy' inyectaba página blanca inicial. 'css' + 'avoid-all' son suficientes.
    pagebreak: { mode: ['css', 'avoid-all'] as const },
  };
  // @ts-ignore — el tipo Html2PdfOptions de la lib no expone bien todas las opciones
  await html2pdf().from(elemento).set(opts).save();
}
