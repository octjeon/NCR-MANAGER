import React, { useState, useEffect, useRef } from 'react';
import {
  Ship,
  Calendar,
  User,
  Plus,
  Check,
  Camera,
  Trash2,
  AlertCircle,
  CheckCircle2,
  List,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
} from 'lucide-react';
import { NonconformityRecord } from '../types';
import { StorageService } from '../services/storage';
import { readFileAsDataUrl } from '../utils/imageUtils';

interface NewRegistrationTabProps {
  onRecordRegistered: (newRecord: NonconformityRecord) => void;
  onOpenRegisteredList: () => void;
  onNavigateToDetail: (record: NonconformityRecord) => void;
  onOpenReportPdf?: (record: NonconformityRecord) => void;
}

export const NewRegistrationTab: React.FC<NewRegistrationTabProps> = ({
  onRecordRegistered,
  onOpenRegisteredList,
  onNavigateToDetail,
  onOpenReportPdf,
}) => {
  // Wizard Step: 1, 2, 3, 4, or 'complete'
  const [currentStep, setCurrentStep] = useState<number | 'complete'>(1);

  // Master lists
  const [registrars, setRegistrars] = useState<string[]>(() => StorageService.getRegistrars());
  const [inspectionItemsList, setInspectionItemsList] = useState<string[]>(() =>
    StorageService.getInspectionItems()
  );
  const [ncTypesList, setNcTypesList] = useState<string[]>(() =>
    StorageService.getNonconformityTypes()
  );

  // Subscribe to live master settings from Firebase
  useEffect(() => {
    const unsub = StorageService.subscribeMasterSettings((settings) => {
      setRegistrars(settings.registrars);
      setInspectionItemsList(settings.inspectionItems);
      setNcTypesList(settings.nonconformityTypes);
    });
    return () => unsub();
  }, []);

  // Form State
  // Step 1
  const [shipNo, setShipNo] = useState('');
  const [inspectionDate, setInspectionDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [selectedRegistrar, setSelectedRegistrar] = useState(registrars[0] || '');

  // Step 2
  const [selectedInspectionItems, setSelectedInspectionItems] = useState<string[]>([]);

  // Step 3
  const [selectedNcTypes, setSelectedNcTypes] = useState<string[]>([]);
  const [detailContent, setDetailContent] = useState('');

  // Step 4
  const [photos, setPhotos] = useState<string[]>([]);

  // Step validation error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Newly registered record upon completion
  const [registeredRecord, setRegisteredRecord] = useState<NonconformityRecord | null>(null);

  // Dynamic Item Add Modals
  const [showAddRegistrarModal, setShowAddRegistrarModal] = useState(false);
  const [newRegistrarName, setNewRegistrarName] = useState('');

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const [showAddNcTypeModal, setShowAddNcTypeModal] = useState(false);
  const [newNcTypeName, setNewNcTypeName] = useState('');

  // Photo Input Ref
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [targetPhotoSlot, setTargetPhotoSlot] = useState<number | null>(null);

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const shipRegex = /^\d{4}$/;
    if (!shipRegex.test(shipNo.trim())) {
      setErrorMsg('호선 번호는 숫자 4자리로 정확히 입력해주세요. (예: 2401)');
      return false;
    }
    if (!inspectionDate.trim()) {
      setErrorMsg('검사일자를 선택해주세요.');
      return false;
    }
    if (!selectedRegistrar.trim()) {
      setErrorMsg('등록자를 선택해주세요.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    if (selectedInspectionItems.length === 0) {
      setErrorMsg('검사항목을 최소 1개 이상 선택해주세요.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    if (selectedNcTypes.length === 0) {
      setErrorMsg('부적합 유형을 최소 1개 이상 선택해주세요.');
      return false;
    }
    if (!detailContent.trim()) {
      setErrorMsg('부적합 세부 내용을 입력해주세요.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 4 Validation & Submission
  const handleRegister = () => {
    if (photos.length === 0) {
      setErrorMsg('증거사진을 최소 1장 이상 등록해야 합니다.');
      return;
    }
    setErrorMsg(null);

    // Save record to storage
    const newRecord = StorageService.addRecord({
      shipNo: shipNo.trim(),
      inspectionDate: inspectionDate.trim(),
      registrar: selectedRegistrar.trim(),
      inspectionItems: selectedInspectionItems,
      nonconformityTypes: selectedNcTypes,
      detailContent: detailContent.trim(),
      evidencePhotos: photos,
      status: '진행중',
      forwardedDate: '',
      assignedManager: '',
      managerEmail: '',
      checker: '',
      completedDate: '',
      completedPhotos: [],
      specialNotes: '',
      causeAnalysis: '',
      actionPlan: '',
    });

    setRegisteredRecord(newRecord);
    onRecordRegistered(newRecord);
    setCurrentStep('complete');
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 4) setCurrentStep(3);
  };

  const handleResetForm = () => {
    setShipNo('');
    setInspectionDate(new Date().toISOString().split('T')[0]);
    setSelectedRegistrar(registrars[0] || '');
    setSelectedInspectionItems([]);
    setSelectedNcTypes([]);
    setDetailContent('');
    setPhotos([]);
    setErrorMsg(null);
    setRegisteredRecord(null);
    setCurrentStep(1);
  };

  // Photo handlers
  const handleTriggerPhotoSlot = (slotIdx: number) => {
    setTargetPhotoSlot(slotIdx);
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (targetPhotoSlot !== null && targetPhotoSlot < photos.length) {
        const next = [...photos];
        next[targetPhotoSlot] = dataUrl;
        setPhotos(next);
      } else {
        setPhotos((prev) => [...prev, dataUrl].slice(0, 4));
      }
      setErrorMsg(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('사진을 변환하는 중 오류가 발생했습니다.');
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = '';
      setTargetPhotoSlot(null);
    }
  };

  const handleRemovePhoto = (slotIdx: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== slotIdx));
  };

  // Dynamic additions
  const handleAddRegistrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegistrarName.trim()) return;
    const ok = StorageService.addRegistrar(newRegistrarName.trim());
    if (ok) {
      const updated = StorageService.getRegistrars();
      setRegistrars(updated);
      setSelectedRegistrar(newRegistrarName.trim());
      setNewRegistrarName('');
      setShowAddRegistrarModal(false);
    } else {
      alert('이미 존재하는 등록자명입니다.');
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const ok = StorageService.addInspectionItem(newItemName.trim());
    if (ok) {
      const updated = StorageService.getInspectionItems();
      setInspectionItemsList(updated);
      setSelectedInspectionItems((prev) => [...prev, newItemName.trim().toUpperCase()]);
      setNewItemName('');
      setShowAddItemModal(false);
    } else {
      alert('이미 존재하는 항목입니다.');
    }
  };

  const handleAddNcType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNcTypeName.trim()) return;
    const ok = StorageService.addNonconformityType(newNcTypeName.trim());
    if (ok) {
      const updated = StorageService.getNonconformityTypes();
      setNcTypesList(updated);
      setSelectedNcTypes((prev) => [...prev, newNcTypeName.trim().toUpperCase()]);
      setNewNcTypeName('');
      setShowAddNcTypeModal(false);
    } else {
      alert('이미 존재하는 부적합 유형입니다.');
    }
  };

  // Completed Screen
  if (currentStep === 'complete' && registeredRecord) {
    return (
      <div className="max-w-lg mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {registeredRecord.id}
          </span>

          <h2 className="text-xl font-bold text-slate-900 mt-2">부적합 등록 완료</h2>
          <p className="text-xs text-slate-500 mt-1">
            <strong>{registeredRecord.shipNo}호선</strong> 부적합 건이 정상적으로 시트에
            등록되었습니다.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 my-5 text-left text-xs text-slate-600 space-y-1.5 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400">발행번호:</span>
              <span className="font-mono font-bold text-slate-800">{registeredRecord.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">검사일자:</span>
              <span className="font-semibold text-slate-800">{registeredRecord.inspectionDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">등록자:</span>
              <span className="font-semibold text-slate-800">{registeredRecord.registrar}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">검사항목:</span>
              <span className="font-medium text-slate-800">
                {registeredRecord.inspectionItems.join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">부적합유형:</span>
              <span className="font-bold text-rose-600">
                {registeredRecord.nonconformityTypes.join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">증거사진:</span>
              <span className="font-medium text-slate-800">
                {registeredRecord.evidencePhotos.length}장 첨부됨
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {onOpenReportPdf && (
              <button
                type="button"
                id="view-report-pdf-btn"
                onClick={() => onOpenReportPdf(registeredRecord)}
                className="w-full py-3 text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 active:scale-98 rounded-xl border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <span>📄 부적합보고서 PDF 출력 (양식 DH-QP-870-01)</span>
              </button>
            )}

            <button
              type="button"
              id="reset-and-new-register-btn"
              onClick={handleResetForm}
              className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> 새 건 등록하기
            </button>

            <button
              type="button"
              id="view-registered-list-btn"
              onClick={onOpenRegisteredList}
              className="w-full py-3 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-98 rounded-xl border border-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <List className="w-4 h-4" /> 등록된 건 목록
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepTitles = [
    '1. 기본 정보',
    '2. 검사품 및 검사항목',
    '3. 부적합 내용',
    '4. 증거사진 첨부',
  ];

  const progressPercent = ((currentStep as number) / 4) * 100;

  return (
    <div className="max-w-xl mx-auto py-4 px-3 sm:px-4">
      {/* Step Wizard Header */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-blue-600">
            {stepTitles[(currentStep as number) - 1]}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {currentStep as number} / 4 단계
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Wizard Step Forms */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6 mb-5">
        {/* STEP 1: 기본 정보 */}
        {currentStep === 1 && (
          <div className="space-y-5">
            {/* 호선 (숫자 4자리) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                호선 번호 (숫자 4자리) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  id="ship-no-input"
                  value={shipNo}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setShipNo(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="예: 2401"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 placeholder:font-normal"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                  호선
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">조선소 선박 건조 호선 4자리 숫자</p>
            </div>

            {/* 검사일자 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                검사일자 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="inspection-date-input"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
            </div>

            {/* 등록자 (체크박스형 단일 선택 + 추가 버튼) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  등록자 선택 (1명 선택) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  id="open-add-registrar-modal-btn"
                  onClick={() => setShowAddRegistrarModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 등록자 추가
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {registrars.map((name) => {
                  const isSelected = selectedRegistrar === name;
                  return (
                    <button
                      type="button"
                      key={name}
                      onClick={() => {
                        setSelectedRegistrar(name);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: 검사품 및 검사항목 (다중 선택 + 추가) */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  검사품목 / 검사항목 선택 <span className="text-red-500">*</span>
                </h3>
                <p className="text-[11px] text-slate-400">다중 선택 가능 (최소 1개 필수)</p>
              </div>
              <button
                type="button"
                id="open-add-item-modal-btn"
                onClick={() => setShowAddItemModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> 검사항목 추가
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {inspectionItemsList.map((item) => {
                const isSelected = selectedInspectionItems.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedInspectionItems((prev) => prev.filter((i) => i !== item));
                      } else {
                        setSelectedInspectionItems((prev) => [...prev, item]);
                      }
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-blue-800 shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item}</span>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-right text-[11px] text-slate-400">
              선택됨: <span className="font-bold text-blue-600">{selectedInspectionItems.length}</span>개
            </div>
          </div>
        )}

        {/* STEP 3: 부적합 내용 (유형 다중선택 + textarea 필수) */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  부적합 유형 선택 <span className="text-red-500">*</span>
                </h3>
                <p className="text-[11px] text-slate-400">다중 선택 가능 (최소 1개 필수)</p>
              </div>
              <button
                type="button"
                id="open-add-nc-type-modal-btn"
                onClick={() => setShowAddNcTypeModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> 부적합유형 추가
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ncTypesList.map((type) => {
                const isSelected = selectedNcTypes.includes(type);
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedNcTypes((prev) => prev.filter((t) => t !== type));
                      } else {
                        setSelectedNcTypes((prev) => [...prev, type]);
                      }
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </span>
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>

            {/* 부적합 세부 내용 */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                부적합 세부 내용 기술 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="detail-content-textarea"
                rows={4}
                value={detailContent}
                onChange={(e) => {
                  setDetailContent(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="불량 발생 부위, 원인 및 현상 세부 내용을 구체적으로 입력하세요 (예: 2401호선 E/R 하부 파이프 스풀 버트 조인트 언더컷 2.5mm 확인)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 4: 증거사진 (4개 슬롯, 카메라 또는 파일) */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  부적합 증거사진 등록 <span className="text-red-500">*</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  카메라 촬영 또는 파일 선택 (최소 1장 필수, 최대 4장)
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600">{photos.length} / 4장</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[0, 1, 2, 3].map((slotIdx) => {
                const photo = photos[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors"
                  >
                    {photo ? (
                      <>
                        <img
                          src={photo}
                          alt={`증거사진 ${slotIdx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(slotIdx);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-transform active:scale-95"
                          title="사진 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-medium">
                          사진 #{slotIdx + 1}
                        </span>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTriggerPhotoSlot(slotIdx)}
                        className="w-full h-full flex flex-col items-center justify-center p-2 text-slate-400 hover:text-blue-600 transition-colors group"
                      >
                        <div className="p-2.5 rounded-full bg-slate-100 group-hover:bg-blue-50 mb-1 transition-colors">
                          <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-xs font-semibold">슬롯 {slotIdx + 1}</span>
                        <span className="text-[10px] text-slate-400">촬영/선택</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hidden Input for Camera and File Selection */}
            <input
              type="file"
              ref={photoInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
              💡 현장에서 카메라 촬영 또는 갤러리의 사진을 선택하면 자동으로 최적화되어 등록됩니다.
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          {typeof currentStep === 'number' && currentStep > 1 ? (
            <button
              type="button"
              id="wizard-prev-btn"
              onClick={handlePrev}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> 이전
            </button>
          ) : (
            <div />
          )}

          {typeof currentStep === 'number' && currentStep < 4 ? (
            <button
              type="button"
              id="wizard-next-btn"
              onClick={handleNext}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-sm transition-all flex items-center gap-1.5 ml-auto"
            >
              다음 단계 <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="submit-register-btn"
              onClick={handleRegister}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-md transition-all flex items-center gap-1.5 ml-auto"
            >
              <Check className="w-4 h-4" /> 등록하기
            </button>
          )}
        </div>
      </div>

      {/* MODAL: 신규 등록자 추가 */}
      {showAddRegistrarModal && (
        <div
          id="add-registrar-backdrop"
          onClick={() => setShowAddRegistrarModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
          >
            <h3 className="text-sm font-bold text-slate-900 mb-1">신규 등록자 추가</h3>
            <p className="text-xs text-slate-500 mb-3">검사 및 등록 담당자 성명을 입력하세요</p>
            <form onSubmit={handleAddRegistrar} className="space-y-3">
              <input
                type="text"
                value={newRegistrarName}
                onChange={(e) => setNewRegistrarName(e.target.value)}
                placeholder="예: 홍길동"
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRegistrarModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 신규 검사항목 추가 */}
      {showAddItemModal && (
        <div
          id="add-item-backdrop"
          onClick={() => setShowAddItemModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
          >
            <h3 className="text-sm font-bold text-slate-900 mb-1">검사항목 추가</h3>
            <p className="text-xs text-slate-500 mb-3">새 검사품목 또는 검사항목명을 입력하세요</p>
            <form onSubmit={handleAddItem} className="space-y-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="예: PIPE LEAK TEST"
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 uppercase"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 신규 부적합유형 추가 */}
      {showAddNcTypeModal && (
        <div
          id="add-nc-type-backdrop"
          onClick={() => setShowAddNcTypeModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
          >
            <h3 className="text-sm font-bold text-slate-900 mb-1">부적합 유형 추가</h3>
            <p className="text-xs text-slate-500 mb-3">새 부적합 유형명을 입력하세요</p>
            <form onSubmit={handleAddNcType} className="space-y-3">
              <input
                type="text"
                value={newNcTypeName}
                onChange={(e) => setNewNcTypeName(e.target.value)}
                placeholder="예: CRACK"
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 uppercase"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNcTypeModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
