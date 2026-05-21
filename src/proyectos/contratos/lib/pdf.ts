/**
 * Genera un PDF desde un elemento DOM, con configuración optimizada para contratos.
 *
 * html2pdf.js pesa ~1MB. Lo importamos dinámicamente solo cuando se llama
 * a generarPDF, no en el bundle inicial del módulo. Esto reduce el peso de
 * la carga inicial del módulo y solo se descarga si el usuario realmente
 * descarga un PDF.
 */
export async function generarPDF(
  elemento: HTMLElement,
  filename: string,
): Promise<void> {
  // Dynamic import: html2pdf.js se descarga solo en este momento.
  // @ts-ignore — html2pdf.js no tiene tipos perfectos
  const html2pdfMod = await import('html2pdf.js');
  const html2pdf = html2pdfMod.default ?? html2pdfMod;

  const opts = {
    margin: [15, 15, 15, 15] as [number, number, number, number],
    filename,
    image: { type: 'jpeg' as const, quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as const },
  };
  // @ts-ignore — el tipo Html2PdfOptions de la lib no expone bien todas las opciones
  await html2pdf().from(elemento).set(opts).save();
}
