import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { NonconformityRecord } from '../types';

export async function generateAndDownloadPDF(
  record: NonconformityRecord,
  elementId: string = 'daehan-report-pdf-target'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('PDF 렌더링 요소를 찾을 수 없습니다.');
  }

  // Ensure element is visible during capture
  const originalDisplay = element.style.display;
  element.style.display = 'block';

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for crisp print quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // A4 dimensions: 210 x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Fill page neatly
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const fileName = `[부적합보고서]_${record.id}_호선${record.shipNo}.pdf`;
    pdf.save(fileName);
  } finally {
    element.style.display = originalDisplay;
  }
}
