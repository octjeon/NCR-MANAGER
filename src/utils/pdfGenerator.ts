import html2canvas from 'html2canvas-pro';
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
      windowWidth: 794, // exact A4 layout width
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

export async function generateAndDownloadAnalysisPDF(
  periodLabel: string,
  elementId: string = 'daehan-analysis-pdf-target'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('분석표 렌더링 요소를 찾을 수 없습니다.');
  }

  const originalDisplay = element.style.display;
  element.style.display = 'block';

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // 2x scale for crisp print quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      windowWidth: 794, // exact A4 layout width
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

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
    } else {
      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    const cleanLabel = (periodLabel || '실적').replace(/[^\w\s가-힣-]/g, '_').trim();
    const fileName = `[품질실적분석표]_${cleanLabel}.pdf`;
    pdf.save(fileName);
  } finally {
    element.style.display = originalDisplay;
  }
}

