import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  AlertCircle,
  Ship,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
  Plus,
  Camera,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
  Sparkles,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { NonconformityRecord, ActionPlan } from '../types';
import { StorageService } from '../services/storage';
import { readAndOptimizeImage, formatBytes } from '../utils/imageUtils';
import { Lightbox } from './Lightbox';
import { PhotoSourceModal } from './PhotoSourceModal';

interface EditRecordModalProps {
  record: NonconformityRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rowIndex: number, updates: Partial<NonconformityRecord>) => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onSave,
}) => {
  const [shipNo, setShipNo] = useState('');
  const [inspectionLocation, setInspectionLocation] = useState('본사');
  const [inspectionDate, setInspectionDate] = useState('');
  const [registrar, setRegistrar] = useState('');
  const [inspectionItems, setInspectionItems] = useState<string[]>([]);
  const [nonconformityTypes, setNonconformityTypes] = useState<string[]>([]);
  const [detailContent, setDetailContent] = useState('');
  const [status, setStatus] = useState<'진행중' | '완료'>('진행중');

  // Follow-up actions
  const [forwardedDate, setForwardedDate] = useState('');
  const [assignedManager, setAssignedManager] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [checker, setChecker] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [causeAnalysis, setCauseAnalysis] = useState('');
  const [actionPlan, setActionPlan] = useState<ActionPlan>('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Photos State
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [completedPhotos, setCompletedPhotos] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationToast, setOptimizationToast] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('사진 원본 확대');

  // Photo Source Modal & File Inputs State
  const [isPhotoSourceOpen, setIsPhotoSourceOpen] = useState(false);
  const [activePhotoCategory, setActivePhotoCategory] = useState<'evidence' | 'completed'>('evidence');
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Available masters
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [availableRegistrars, setAvailableRegistrars] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [availableNcTypes, setAvailableNcTypes] = useState<string[]>([]);

  const [customItemInput, setCustomItemInput] = useState('');
  const [customTypeInput, setCustomTypeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (record && isOpen) {
      setShipNo(record.shipNo || '');
      setInspectionLocation(record.inspectionLocation || '본사');
      setInspectionDate(record.inspectionDate || '');
      setRegistrar(record.registrar || '');
      setInspectionItems(record.inspectionItems || []);
      setNonconformityTypes(record.nonconformityTypes || []);
      setDetailContent(record.detailContent || '');
      setStatus(record.status || '진행중');

      setForwardedDate(record.forwardedDate || '');
      setAssignedManager(record.assignedManager || '');
      setManagerEmail(record.managerEmail || '');
      setChecker(record.checker || '');
      setCompletedDate(record.completedDate || '');
      setCauseAnalysis(record.causeAnalysis || '');
      setActionPlan(record.actionPlan || '');
      setSpecialNotes(record.specialNotes || '');

      setEvidencePhotos(record.evidencePhotos ? [...record.evidencePhotos] : []);
      setCompletedPhotos(record.completedPhotos ? [...record.completedPhotos] : []);

      setAvailableLocations(StorageService.getLocations());
      setAvailableRegistrars(StorageService.getRegistrars());
      setAvailableItems(StorageService.getInspectionItems());
      setAvailableNcTypes(StorageService.getNonconformityTypes());
      setErrorMsg(null);
      setOptimizationToast(null);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setOptimizationToast({ text, type });
    setTimeout(() => {
      setOptimizationToast(null);
    }, 4500);
  };

  const toggleItem = (item: string) => {
    if (inspectionItems.includes(item)) {
      setInspectionItems(inspectionItems.filter((i) => i !== item));
    } else {
      setInspectionItems([...inspectionItems, item]);
    }
  };

  const toggleType = (type: string) => {
    if (nonconformityTypes.includes(type)) {
      setNonconformityTypes(nonconformityTypes.filter((t) => t !== type));
    } else {
      setNonconformityTypes([...nonconformityTypes, type]);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customItemInput.trim().toUpperCase();
    if (!val) return;
    if (!inspectionItems.includes(val)) {
      setInspectionItems([...inspectionItems, val]);
      StorageService.addInspectionItem(val);
      setAvailableItems(StorageService.getInspectionItems());
    }
    setCustomItemInput('');
  };

  const handleAddCustomType = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customTypeInput.trim().toUpperCase();
    if (!val) return;
    if (!nonconformityTypes.includes(val)) {
      setNonconformityTypes([...nonconformityTypes, val]);
      StorageService.addNonconformityType(val);
      setAvailableNcTypes(StorageService.getNonconformityTypes());
    }
    setCustomTypeInput('');
  };

  // -----------------------------------------------------------------
  // Photo Operations: Open Source Modal, Camera, Gallery
  // -----------------------------------------------------------------

  const handleTriggerPhotoAdd = (category: 'evidence' | 'completed', slotIdx?: number) => {
    setActivePhotoCategory(category);
    setTargetSlotIndex(typeof slotIdx === 'number' ? slotIdx : null);
    setIsPhotoSourceOpen(true);
  };

  const handleOpenDirectCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleOpenDirectGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  // Process chosen image files with automatic optimization
  const processImageFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsOptimizing(true);

    try {
      let totalOrig = 0;
      let totalOpt = 0;
      const optimizedResults = [];

      for (const file of files) {
        totalOrig += file.size;
        const result = await readAndOptimizeImage(file, 800);
        totalOpt += result.optimizedSize;
        optimizedResults.push(result.dataUrl);
      }

      if (activePhotoCategory === 'evidence') {
        if (targetSlotIndex !== null && targetSlotIndex < evidencePhotos.length) {
          const next = [...evidencePhotos];
          next[targetSlotIndex] = optimizedResults[0];
          const remaining = optimizedResults.slice(1);
          const combined = [...next, ...remaining].slice(0, 4);
          setEvidencePhotos(combined);
        } else {
          setEvidencePhotos((prev) => [...prev, ...optimizedResults].slice(0, 4));
        }
      } else {
        if (targetSlotIndex !== null && targetSlotIndex < completedPhotos.length) {
          const next = [...completedPhotos];
          next[targetSlotIndex] = optimizedResults[0];
          const remaining = optimizedResults.slice(1);
          const combined = [...next, ...remaining].slice(0, 4);
          setCompletedPhotos(combined);
        } else {
          setCompletedPhotos((prev) => [...prev, ...optimizedResults].slice(0, 4));
        }
      }

      const percent = totalOrig > 0 ? Math.round(((totalOrig - totalOpt) / totalOrig) * 100) : 0;
      const countLabel = files.length > 1 ? `${files.length}장` : '1장';
      showToast(
        `✨ 사진 ${countLabel}이 자동 최적화되었습니다 (${formatBytes(totalOrig)} → ${formatBytes(totalOpt)}, ${percent}% 절약)`,
        'success'
      );
      setErrorMsg(null);
    } catch (err) {
      console.error(err);
      showToast('사진 파일을 최적화하는 중 문제가 발생했습니다.', 'error');
    } finally {
      setIsOptimizing(false);
      setTargetSlotIndex(null);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFiles([file]);
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await processImageFiles(files);
  };

  const handleDeleteEvidencePhoto = (index: number) => {
    setEvidencePhotos((prev) => prev.filter((_, i) => i !== index));
    showToast(`부적합 증거사진 #${index + 1}이 삭제되었습니다.`, 'info');
  };

  const handleDeleteCompletedPhoto = (index: number) => {
    setCompletedPhotos((prev) => prev.filter((_, i) => i !== index));
    showToast(`조치완료 증거사진 #${index + 1}이 삭제되었습니다.`, 'info');
  };

  const handleOpenLightbox = (images: string[], index: number, title: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setIsLightboxOpen(true);
  };

  // -----------------------------------------------------------------
  // Form Submission
  // -----------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shipClean = shipNo.replace(/\D/g, '').slice(0, 4);
    if (!/^\d{4}$/.test(shipClean)) {
      setErrorMsg('호선 번호는 숫자 4자리여야 합니다. (예: 2401)');
      return;
    }
    if (!inspectionDate.trim()) {
      setErrorMsg('검사일자를 입력해주세요.');
      return;
    }
    if (inspectionItems.length === 0) {
      setErrorMsg('검사항목을 최소 1개 이상 선택해야 합니다.');
      return;
    }
    if (nonconformityTypes.length === 0) {
      setErrorMsg('부적합 유형을 최소 1개 이상 선택해야 합니다.');
      return;
    }
    if (!detailContent.trim()) {
      setErrorMsg('부적합 세부 내용을 입력해주세요.');
      return;
    }
    if (evidencePhotos.length === 0) {
      setErrorMsg('부적합 증거사진은 최소 1장 이상 등록되어야 합니다. 사진을 추가해주세요.');
      return;
    }

    const updates: Partial<NonconformityRecord> = {
      shipNo: shipClean,
      inspectionLocation,
      inspectionDate: inspectionDate.trim(),
      registrar: registrar.trim() || record.registrar,
      inspectionItems,
      nonconformityTypes,
      detailContent: detailContent.trim(),
      evidencePhotos,
      status,
      forwardedDate: forwardedDate.trim(),
      assignedManager: assignedManager.trim(),
      managerEmail: managerEmail.trim(),
      checker: checker.trim(),
      completedDate:
        status === '완료'
          ? completedDate.trim() || new Date().toISOString().split('T')[0]
          : completedDate.trim(),
      completedPhotos,
      causeAnalysis: causeAnalysis.trim(),
      actionPlan: actionPlan,
      specialNotes: specialNotes.trim(),
    };

    onSave(record._rowIndex, updates);
    onClose();
  };

  return (
    <>
      <div
        id="edit-record-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                {record.id}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                부적합 등록 자료 수정 (관리자)
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form
            id="edit-record-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700"
          >
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Optimization feedback banner */}
            {optimizationToast && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs animate-in fade-in duration-200 ${
                  optimizationToast.type === 'error'
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-medium">{optimizationToast.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOptimizationToast(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Section 1: 기본 정보 */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-200 pb-2">
                <Ship className="w-4 h-4 text-blue-600" />
                <span>검사 기본 정보</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 호선 번호 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    호선 번호 (숫자 4자리) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={shipNo}
                    onChange={(e) => setShipNo(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                    placeholder="예: 2401"
                  />
                </div>

                {/* 검사장소 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>검사장소</span> <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inspectionLocation}
                    onChange={(e) => setInspectionLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 cursor-pointer"
                  >
                    {availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 검사일자 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>검사일자</span> <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>

                {/* 등록자 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>등록자</span> <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={registrar}
                    onChange={(e) => setRegistrar(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 cursor-pointer"
                  >
                    {availableRegistrars.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: 검사품목 & 부적합유형 */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-200 pb-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>검사품목 및 부적합 유형</span>
              </h4>

              {/* 검사항목 Chips */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  검사품목 / 검사항목 선택 (복수 선택 가능) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {availableItems.map((item) => {
                    const isChecked = inspectionItems.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-1.5 max-w-xs">
                  <input
                    type="text"
                    value={customItemInput}
                    onChange={(e) => setCustomItemInput(e.target.value)}
                    placeholder="새 항목 직접 추가"
                    className="flex-1 px-2.5 py-1 border border-slate-300 rounded text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 추가
                  </button>
                </div>
              </div>

              {/* 부적합유형 Chips */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  부적합 유형 선택 (복수 선택 가능) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {availableNcTypes.map((type) => {
                    const isChecked = nonconformityTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-400'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-1.5 max-w-xs">
                  <input
                    type="text"
                    value={customTypeInput}
                    onChange={(e) => setCustomTypeInput(e.target.value)}
                    placeholder="새 부적합유형 추가"
                    className="flex-1 px-2.5 py-1 border border-slate-300 rounded text-xs uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomType}
                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 추가
                  </button>
                </div>
              </div>

              {/* 세부내용 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  부적합 세부내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={detailContent}
                  onChange={(e) => setDetailContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 leading-relaxed"
                  placeholder="불량 발생 부위, 상태, 규격 미달 수치 등을 구체적으로 기록"
                />
              </div>
            </div>

            {/* ============================================================= */}
            {/* Section 3: 부적합 증거사진 관리 (추가 / 삭제 / 자동최적화) */}
            {/* ============================================================= */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-900 text-xs">
                    부적합 증거사진 관리
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      evidencePhotos.length > 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {evidencePhotos.length} / 4장
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    추가 시 고화질 자동 압축 최적화
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                기존 사진의 삭제 및 새로운 현장 사진 추가가 가능합니다. (최소 1장 필수, 최대 4장)
              </p>

              {/* Evidence Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {evidencePhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shadow-2xs hover:shadow-md transition-all"
                  >
                    <img
                      src={photo}
                      alt={`증거사진 ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Badge */}
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold tracking-wider z-10">
                      증거 {idx + 1}
                    </span>

                    {/* Action buttons overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 z-20">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenLightbox(evidencePhotos, idx, `부적합 증거사진 ${idx + 1}`)
                        }
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow cursor-pointer transition-transform hover:scale-110"
                        title="크게 확대보기"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvidencePhoto(idx)}
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow cursor-pointer transition-transform hover:scale-110"
                        title="이 사진 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Photo Slot Button if under limit */}
                {evidencePhotos.length < 4 && (
                  <div className="aspect-4/3 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/90 transition-all flex flex-col items-center justify-center p-2 text-center group cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleTriggerPhotoAdd('evidence')}
                      disabled={isOptimizing}
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                    >
                      {isOptimizing ? (
                        <div className="flex flex-col items-center gap-1 text-blue-600">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span className="text-[10px] font-bold">최적화 중...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-xs text-blue-700 group-hover:underline">
                            + 증거사진 추가
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            카메라 / 갤러리
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick direct upload buttons for convenience */}
              {evidencePhotos.length < 4 && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhotoCategory('evidence');
                      setTargetSlotIndex(null);
                      handleOpenDirectCamera();
                    }}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>카메라 직접 촬영</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhotoCategory('evidence');
                      setTargetSlotIndex(null);
                      handleOpenDirectGallery();
                    }}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>갤러리에서 선택</span>
                  </button>
                </div>
              )}
            </div>

            {/* ============================================================= */}
            {/* Section 4: 상태 및 조치 결과 */}
            {/* ============================================================= */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-200 pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>조치 진행 상태 및 후속 조치</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 상태 선택 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">조치 상태</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                      <input
                        type="radio"
                        name="status"
                        value="진행중"
                        checked={status === '진행중'}
                        onChange={() => setStatus('진행중')}
                        className="text-blue-600"
                      />
                      <span className="text-blue-700">진행중</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                      <input
                        type="radio"
                        name="status"
                        value="완료"
                        checked={status === '완료'}
                        onChange={() => setStatus('완료')}
                        className="text-emerald-600"
                      />
                      <span className="text-emerald-700">완료</span>
                    </label>
                  </div>
                </div>

                {/* 완료일자 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">조치 완료일자</label>
                  <input
                    type="date"
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>

                {/* 조치담당자 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">조치 담당자</label>
                  <input
                    type="text"
                    value={assignedManager}
                    onChange={(e) => setAssignedManager(e.target.value)}
                    placeholder="예: 김철수 반장"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>

                {/* 담당자 이메일 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">담당자 이메일</label>
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    placeholder="manager@daehan.co.kr"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>

                {/* 확인자(검사원) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">확인자 (검사원)</label>
                  <input
                    type="text"
                    value={checker}
                    onChange={(e) => setChecker(e.target.value)}
                    placeholder="예: 박품질 차장"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>

                {/* 통보일자 */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">부서 통보일자</label>
                  <input
                    type="date"
                    value={forwardedDate}
                    onChange={(e) => setForwardedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* 조치방안 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">조치방안 선택</label>
                <div className="flex flex-wrap gap-2">
                  {(['', '반품', '재작업', '특채', '용도변경', '폐기'] as ActionPlan[]).map(
                    (plan) => (
                      <button
                        key={plan || 'none'}
                        type="button"
                        onClick={() => setActionPlan(plan)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          actionPlan === plan
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {plan || '선택 안함'}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 원인분석 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">원인 분석</label>
                <textarea
                  rows={2}
                  value={causeAnalysis}
                  onChange={(e) => setCauseAnalysis(e.target.value)}
                  placeholder="불량 발생 원인 분석 내용"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              {/* 특이사항 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">특이사항</label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="조치 과정 중 특이사항 또는 메모"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>
            </div>

            {/* ============================================================= */}
            {/* Section 5: 조치완료 증거사진 관리 (추가 / 삭제 / 자동최적화) */}
            {/* ============================================================= */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-slate-900 text-xs">
                    조치완료 증거사진 관리
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {completedPhotos.length} / 4장
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    추가 시 고화질 자동 압축 최적화
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                재작업/조치가 완료된 후 현장 확인 사진입니다. (상태가 '완료'일 때 첨부 권장)
              </p>

              {/* Completed Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {completedPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-4/3 rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 shadow-2xs hover:shadow-md transition-all"
                  >
                    <img
                      src={photo}
                      alt={`완료사진 ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Badge */}
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-800/80 text-white font-mono text-[9px] font-bold tracking-wider z-10">
                      완료 {idx + 1}
                    </span>

                    {/* Action buttons overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 z-20">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenLightbox(completedPhotos, idx, `조치완료 증거사진 ${idx + 1}`)
                        }
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow cursor-pointer transition-transform hover:scale-110"
                        title="크게 확대보기"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCompletedPhoto(idx)}
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow cursor-pointer transition-transform hover:scale-110"
                        title="이 완료사진 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Photo Slot Button if under limit */}
                {completedPhotos.length < 4 && (
                  <div className="aspect-4/3 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/90 transition-all flex flex-col items-center justify-center p-2 text-center group cursor-pointer">
                    <button
                      type="button"
                      onClick={() => handleTriggerPhotoAdd('completed')}
                      disabled={isOptimizing}
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                    >
                      {isOptimizing ? (
                        <div className="flex flex-col items-center gap-1 text-emerald-600">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span className="text-[10px] font-bold">최적화 중...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-xs text-emerald-700 group-hover:underline">
                            + 완료사진 추가
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            카메라 / 갤러리
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick direct upload buttons for completed photos */}
              {completedPhotos.length < 4 && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhotoCategory('completed');
                      setTargetSlotIndex(null);
                      handleOpenDirectCamera();
                    }}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>카메라 직접 촬영</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhotoCategory('completed');
                      setTargetSlotIndex(null);
                      handleOpenDirectGallery();
                    }}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>갤러리에서 선택</span>
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
            <div className="text-[11px] text-slate-400 hidden sm:block">
              증거사진: {evidencePhotos.length}장 / 완료사진: {completedPhotos.length}장
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                form="edit-record-form"
                disabled={isOptimizing}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>수정 사항 저장</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Inputs for Camera and Gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraChange}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleGalleryChange}
      />

      {/* Photo Source Modal (Camera or Gallery) */}
      <PhotoSourceModal
        isOpen={isPhotoSourceOpen}
        onClose={() => setIsPhotoSourceOpen(false)}
        onSelectCamera={handleOpenDirectCamera}
        onSelectGallery={handleOpenDirectGallery}
        slotNumber={targetSlotIndex !== null ? targetSlotIndex + 1 : undefined}
        title={
          activePhotoCategory === 'evidence'
            ? '부적합 증거사진 추가 방법 선택'
            : '조치완료 증거사진 추가 방법 선택'
        }
      />

      {/* Fullscreen Lightbox Zoom Modal */}
      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={lightboxTitle}
      />
    </>
  );
};
