import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  Loader2,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { NonconformityRecord } from '../types';
import { ReportPDFView } from './ReportPDFView';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';

interface ReportPreviewModalProps {
  record: NonconformityRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [scale, setScale] = useState(0.85);
  const printTargetRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !record) return null;

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await generateAndDownloadPDF(record, `report-modal-pdf-target-${record.id}`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF 파일 생성 중 오류가 발생했습니다. 브라우저 [인쇄] 버튼을 이용해 PDF로 저장하실 수도 있습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="report-preview-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/90 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden border border-slate-700 animate-in zoom-in-95 duration-150"
      >
        {/* Modal Top Control Bar */}
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700">
                  {record.id}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {record.shipNo}호선 부적합 보고서
                </span>
                <span className="hidden sm:inline-block font-mono text-[11px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  DH-QP-870-01 (Rev.0)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-700/80 rounded-lg p-1 border border-slate-600 text-xs">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                className="p-1 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                title="축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 font-mono text-[11px] text-slate-300">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(1.2, s + 0.1))}
                className="p-1 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                title="확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setScale(0.85)}
                className="p-1 hover:bg-slate-600 rounded text-slate-300 hover:text-white ml-0.5"
                title="기본 크기"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              id="print-report-direct-btn"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-700 hover:bg-slate-600 active:scale-98 rounded-lg border border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>인쇄</span>
            </button>

            {/* PDF Download Button */}
            <button
              type="button"
              id="download-pdf-file-btn"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-98 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>다운로드 완료!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF 다운로드</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="close-report-preview-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Container Viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-slate-950/70">
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="shadow-2xl rounded-sm"
          >
            <div ref={printTargetRef} className="print-area">
              <ReportPDFView
                record={record}
                id={`report-modal-pdf-target-${record.id}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
