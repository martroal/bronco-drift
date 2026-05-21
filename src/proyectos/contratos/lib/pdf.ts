// @ts-ignore — html2pdf no provee tipos perfectos
import html2pdf from 'html2pdf.js';

/**
 * Genera un PDF desde un elemento DOM, con configuración optimizada para contratos.
 */
export async function generarPDF(
  elemento: HTMLElement,
  filename: string,
): Promise<void> {
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
