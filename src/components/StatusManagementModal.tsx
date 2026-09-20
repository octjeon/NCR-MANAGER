import React, { useState, useRef } from 'react';
import { X, Camera, Image as ImageIcon, Check, Trash2, AlertCircle, Save } from 'lucide-react';
import { ACTION_PLAN_OPTIONS, ActionPlan, NonconformityRecord } from '../types';
import { readFileAsDataUrl } from '../utils/imageUtils';
import { PhotoSourceModal } from './PhotoSourceModal';

interface StatusManagementModalProps {
  record: NonconformityRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedFields: Partial<NonconformityRecord>) => void;
}

export const StatusManagementModal: React.FC<StatusManagementModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'진행중' | '완료'>(record.status);

  // In-progress fields
  const [forwardedDate, setForwardedDate] = useState(
    record.forwardedDate || new Date().toISOString().split('T')[0]
  );
  const [assignedManager, setAssignedManager] = useState(record.assignedManager || '');
  const [managerEmail, setManagerEmail] = useState(record.managerEmail || '');

  // Completion fields
  const [causeAnalysis, setCauseAnalysis] = useState(record.causeAnalysis || '');
  const [actionPlan, setActionPlan] = useState<ActionPlan>(record.actionPlan || '');
  const [checker, setChecker] = useState(record.checker || '');
  const [completedDate, setCompletedDate] = useState(
    record.completedDate || new Date().toISOString().split('T')[0]
  );
  const [completedPhotos, setCompletedPhotos] = useState<string[]>(record.completedPhotos || []);
  const [specialNotes, setSpecialNotes] = useState(record.specialNotes || '');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);

  if (!isOpen) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleTriggerSlot = (slotIdx: number) => {
    setTargetSlotIndex(slotIdx);
    setShowPhotoSourceModal(true);
  };

  const handleOpenDirectCamera = (slotIdx?: number) => {
    if (typeof slotIdx === 'number') {
      setTargetSlotIndex(slotIdx);
    } else {
      const nextIdx = completedPhotos.length < 4 ? completedPhotos.length : null;
      setTargetSlotIndex(nextIdx);
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleOpenDirectGallery = (slotIdx?: number) => {
    if (typeof slotIdx === 'number') {
      setTargetSlotIndex(slotIdx);
    } else {
      const nextIdx = completedPhotos.length < 4 ? completedPhotos.length : null;
      setTargetSlotIndex(nextIdx);
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const handleCameraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (targetSlotIndex !== null && targetSlotIndex < completedPhotos.length) {
        const next = [...completedPhotos];
        next[targetSlotIndex] = dataUrl;
        setCompletedPhotos(next);
      } else {
        setCompletedPhotos((prev) => [...prev, dataUrl].slice(0, 4));
      }
      setErrorMessage(null);
    } catch (err) {
      console.error(err);
      setErrorMessage('사진 파일을 처리하는 중 오류가 발생했습니다.');
    } finally {
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      setTargetSlotIndex(null);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const dataUrls = await Promise.all(files.map((f) => readFileAsDataUrl(f)));
      if (targetSlotIndex !== null && targetSlotIndex < completedPhotos.length) {
        const next = [...completedPhotos];
        next[targetSlotIndex] = dataUrls[0];
        const remaining = dataUrls.slice(1);
        const combined = [...next, ...remaining].slice(0, 4);
        setCompletedPhotos(combined);
      } else {
        setCompletedPhotos((prev) => [...prev, ...dataUrls].slice(0, 4));
      }
      setErrorMessage(null);
    } catch (err) {
      console.error(err);
      setErrorMessage('사진 파일을 처리하는 중 오류가 발생했습니다.');
    } finally {
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      setTargetSlotIndex(null);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setCompletedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedStatus === '진행중') {
      if (managerEmail.trim() && !emailRegex.test(managerEmail.trim())) {
        setErrorMessage('진행담당자 이메일 형식이 올바르지 않습니다.');
        return;
      }

      onSave({
        status: '진행중',
        forwardedDate: forwardedDate.trim(),
        assignedManager: assignedManager.trim(),
        managerEmail: managerEmail.trim(),
      });
    } else {
      // Completed validation
      if (!checker.trim()) {
        setErrorMessage('확인자 성명을 입력해주세요.');
        return;
      }
      if (!completedDate.trim()) {
        setErrorMessage('완료일자를 선택해주세요.');
        return;
      }
      if (!actionPlan) {
        setErrorMessage('조치방안을 선택해주세요.');
        return;
      }
      if (!causeAnalysis.trim()) {
        setErrorMessage('원인파악 내용을 입력해주세요.');
        return;
      }
      if (completedPhotos.length === 0) {
        setErrorMessage('완료 증거사진을 최소 1장 이상 등록해야 합니다.');
        return;
      }

      onSave({
        status: '완료',
        checker: checker.trim(),
        completedDate: completedDate.trim(),
        actionPlan,
        causeAnalysis: causeAnalysis.trim(),
        completedPhotos,
        specialNotes: specialNotes.trim(),
        // Also keep any progress fields if previously entered
        forwardedDate: forwardedDate.trim(),
        assignedManager: assignedManager.trim(),
        managerEmail: managerEmail.trim(),
      });
    }
  };

  return (
    <div
      id="status-management-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                {record.id}
              </span>
              <span className="text-xs font-semibold text-slate-500">{record.shipNo}호선</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mt-0.5">진행 상태 관리</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Status Segmented Control */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              변경할 진행 상태 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                id="status-select-progress"
                onClick={() => setSelectedStatus('진행중')}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                  selectedStatus === '진행중'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                진행중 (조치 중)
              </button>
              <button
                type="button"
                id="status-select-completed"
                onClick={() => setSelectedStatus('완료')}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                  selectedStatus === '완료'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                완료 (조치 완료 및 확인)
              </button>
            </div>
          </div>

          {/* If In-Progress */}
          {selectedStatus === '진행중' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
                조치 진행 담당자 정보 및 전달완료일자를 관리합니다.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">전달완료일자</label>
                <input
                  type="date"
                  value={forwardedDate}
                  onChange={(e) => setForwardedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">진행담당자</label>
                <input
                  type="text"
                  value={assignedManager}
                  onChange={(e) => setAssignedManager(e.target.value)}
                  placeholder="예: 김철수 대리"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  진행담당자 이메일 (보고서 수신용)
                </label>
                <input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="예: chulsoo@daehan-pi.co.kr"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* If Completed */}
          {selectedStatus === '완료' && (
            <div className="space-y-4 pt-1 animate-in fade-in duration-150">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                부적합 건에 대한 원인파악, 조치방안, 확인자 서명 및 완료 증거사진을 등록합니다.
              </div>

              {/* Action Plan Single Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  조치방안 (단일 선택) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {ACTION_PLAN_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setActionPlan(opt)}
                      className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-all ${
                        actionPlan === opt
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {actionPlan === opt ? `■ ${opt}` : `□ ${opt}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cause Analysis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  원인파악 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={causeAnalysis}
                  onChange={(e) => setCauseAnalysis(e.target.value)}
                  rows={2}
                  placeholder="발생 원인을 상세히 기술하세요 (예: 도장 전 표면 탈지 미흡, 취부 간격 오차 등)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Checker & Completion Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    확인자 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={checker}
                    onChange={(e) => setChecker(e.target.value)}
                    placeholder="확인자 성명"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    완료일자 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Completed Evidence Photos (Min 1 required, max 4) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    완료 증거사진 (최소 1장 필수, 최대 4장) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-500">{completedPhotos.length} / 4 등록됨</span>
                </div>

                {/* Quick Action Selection Buttons: Camera & Gallery */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDirectCamera()}
                    disabled={completedPhotos.length >= 4}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs active:scale-[0.98] transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    카메라 직접 촬영
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDirectGallery()}
                    disabled={completedPhotos.length >= 4}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-700 border border-slate-200 text-xs font-bold shadow-xs active:scale-[0.98] transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    갤러리에서 선택
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const photo = completedPhotos[slotIdx];
                    return (
                      <div
                        key={slotIdx}
                        className="relative aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden hover:border-emerald-400 transition-colors"
                      >
                        {photo ? (
                          <>
                            <img
                              src={photo}
                              alt={`완료사진 ${slotIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto(slotIdx);
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                              title="사진 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium">
                              #{slotIdx + 1}
                            </span>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTriggerSlot(slotIdx)}
                            className="w-full h-full flex flex-col items-center justify-center p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <Camera className="w-5 h-5 mb-0.5" />
                            <span className="text-[10px] font-medium">슬롯 {slotIdx + 1}</span>
                            <span className="text-[8px] text-slate-400">카메라/갤러리</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Hidden Input for Camera Capture */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleCameraUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {/* Hidden Input for Gallery Selection (Multiple allowed) */}
                <input
                  type="file"
                  ref={galleryInputRef}
                  onChange={handleGalleryUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  특이사항 (선택사항)
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  rows={2}
                  placeholder="추가 조치 사항이나 특이점"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              id="save-status-btn"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> 변경사항 저장
            </button>
          </div>
        </form>

        {/* Photo Source Selection Bottom Sheet / Modal */}
        <PhotoSourceModal
          isOpen={showPhotoSourceModal}
          onClose={() => {
            setShowPhotoSourceModal(false);
            setTargetSlotIndex(null);
          }}
          onSelectCamera={() => {
            setShowPhotoSourceModal(false);
            handleOpenDirectCamera(targetSlotIndex ?? undefined);
          }}
          onSelectGallery={() => {
            setShowPhotoSourceModal(false);
            handleOpenDirectGallery(targetSlotIndex ?? undefined);
          }}
          slotNumber={targetSlotIndex !== null ? targetSlotIndex + 1 : undefined}
          title="완료 증거사진 추가 방법"
        />
      </div>
    </div>
  );
};
