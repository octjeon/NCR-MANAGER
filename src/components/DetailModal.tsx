import React, { useState } from 'react';
import {
  X,
  FileText,
  Mail,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  Ship,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { NonconformityRecord } from '../types';
import { StatusManagementModal } from './StatusManagementModal';
import { EmailConfirmModal } from './EmailConfirmModal';
import { Lightbox } from './Lightbox';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';
import { ReportPDFView } from './ReportPDFView';
import { ReportPreviewModal } from './ReportPreviewModal';

interface DetailModalProps {
  record: NonconformityRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRecord: (rowIndex: number, updates: Partial<NonconformityRecord>) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  record,
  isOpen,
  onClose,
  onUpdateRecord,
}) => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessNotice, setPdfSuccessNotice] = useState(false);

  if (!isOpen || !record) return null;

  const isProgress = record.status === '진행중';

  const handleOpenPhoto = (photos: string[], index: number) => {
    setLightboxImages(photos);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateAndDownloadPDF(record, `detail-pdf-render-${record.id}`);
      setPdfSuccessNotice(true);
      setTimeout(() => setPdfSuccessNotice(false), 3000);
    } catch (err) {
      console.error(err);
      alert('PDF 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSaveStatus = (updates: Partial<NonconformityRecord>) => {
    onUpdateRecord(record._rowIndex, updates);
    setIsStatusModalOpen(false);
    onClose(); // Close both modals as requested by specification
  };

  return (
    <>
      {/* Hidden off-screen PDF render container for accurate print capture */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          zIndex: -1,
          overflow: 'hidden',
        }}
      >
        <ReportPDFView record={record} id={`detail-pdf-render-${record.id}`} />
      </div>

      {/* Main Detail Backdrop */}
      <div
        id="detail-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-xs p-3 overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {record.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Ship className="w-3.5 h-3.5" />
                    {record.shipNo}호선
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">부적합 상세 내역</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Badge: Clickable only when "진행중" */}
              {isProgress ? (
                <button
                  type="button"
                  id="detail-status-badge-btn"
                  onClick={() => setIsStatusModalOpen(true)}
                  className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer shadow-xs"
                  title="클릭하여 진행 상태를 관리합니다"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span className="underline decoration-blue-400 underline-offset-2">진행중</span>
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>완료</span>
                </span>
              )}

              <button
                type="button"
                id="detail-modal-close-btn"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-5 text-sm">
            {/* Status action callout if in progress */}
            {isProgress && (
              <div
                onClick={() => setIsStatusModalOpen(true)}
                className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between cursor-pointer hover:bg-blue-100/60 transition-colors group"
              >
                <div className="flex items-center gap-2 text-xs text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>
                    현재 <strong>진행중</strong> 상태입니다. 완료 처리나 담당자 변경은 <strong>상태 관리</strong>를 누르세요.
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-700 underline flex items-center gap-0.5 shrink-0 ml-2">
                  상태 관리 <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}

            {/* Quick Grid Info */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">검사일자</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {record.inspectionDate}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">등록자</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  {record.registrar}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-400 block mb-0.5">검사품목 / 검사항목</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {record.inspectionItems.map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-slate-400 block mb-0.5">부적합 유형</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {record.nonconformityTypes.map((type, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-rose-50 border border-rose-200 rounded text-xs font-bold text-rose-700"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail Content (세부내역) */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                부적합 상세 내용
              </h4>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {record.detailContent || '(상세 내용 없음)'}
              </div>
            </div>

            {/* Evidence Photos (증거사진) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  부적합 증거사진 ({record.evidencePhotos.length}장)
                </h4>
                <span className="text-[11px] text-slate-400">클릭 시 전체화면 확대</span>
              </div>

              {record.evidencePhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {record.evidencePhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleOpenPhoto(record.evidencePhotos, idx)}
                      className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all"
                    >
                      <img
                        src={photo}
                        alt={`증거사진 ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-[11px] font-semibold bg-black/60 px-2 py-0.5 rounded transition-opacity">
                          확대보기
                        </span>
                      </div>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px]">
                        사진 {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  등록된 사진이 없습니다.
                </div>
              )}
            </div>

            {/* Completed Section (if completed) */}
            {record.status === '완료' && (
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    완료 조치 내역
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">조치방안</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {record.actionPlan || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">확인자</span>
                    <span className="font-semibold text-slate-800">{record.checker || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">완료일자</span>
                    <span className="font-semibold text-slate-800">{record.completedDate || '-'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 block mb-0.5">원인파악</span>
                    <p className="text-slate-700 whitespace-pre-wrap">{record.causeAnalysis || '-'}</p>
                  </div>
                  {record.specialNotes && (
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-slate-400 block mb-0.5">특이사항</span>
                      <p className="text-slate-700 whitespace-pre-wrap">{record.specialNotes}</p>
                    </div>
                  )}
                </div>

                {/* Completed Evidence Photos */}
                {record.completedPhotos && record.completedPhotos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        완료 증거사진 ({record.completedPhotos.length}장)
                      </span>
                      <span className="text-[11px] text-slate-400">클릭 시 확대</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {record.completedPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleOpenPhoto(record.completedPhotos, idx)}
                          className="group relative aspect-4/3 rounded-xl overflow-hidden border border-emerald-200 bg-slate-100 cursor-pointer hover:shadow-md hover:border-emerald-400 transition-all"
                        >
                          <img
                            src={photo}
                            alt={`완료사진 ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-800/80 text-white text-[9px]">
                            조치완료 {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress Details (if assigned manager exists) */}
            {(record.assignedManager || record.managerEmail || record.forwardedDate) && (
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-600 block mb-1.5">진행 담당 정보</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span>
                    담당자: <strong>{record.assignedManager || '-'}</strong>
                  </span>
                  <span>
                    이메일: <strong>{record.managerEmail || '-'}</strong>
                  </span>
                  <span>
                    전달일자: <strong>{record.forwardedDate || '-'}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="download-report-pdf-btn"
                onClick={() => setIsReportPreviewOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 active:scale-98 border border-slate-300 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-red-500" />
                <span>📄 보고서 PDF 출력</span>
              </button>

              <button
                type="button"
                id="send-report-mail-btn"
                onClick={() => setIsEmailModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-98 border border-blue-200 rounded-lg shadow-xs transition-all flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>📧 메일 전송</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {pdfSuccessNotice && (
                <span className="text-xs text-emerald-600 font-semibold animate-in fade-in">
                  PDF 다운로드 완료!
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Report PDF Preview & Print Modal */}
      <ReportPreviewModal
        record={record}
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
      />

      {/* Nested Status Management Modal (Higher z-index 50) */}
      <StatusManagementModal
        record={record}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSave={handleSaveStatus}
      />

      {/* Email Confirm Modal */}
      <EmailConfirmModal
        record={record}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSaveEmail={(newEmail) => {
          onUpdateRecord(record._rowIndex, { managerEmail: newEmail });
        }}
        onGeneratePDF={handleDownloadPDF}
      />

      {/* Fullscreen Lightbox */}
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={`${record.id} 증거사진`}
      />
    </>
  );
};
