import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { NonconformityRecord, ActionPlan } from '../types';
import { StorageService } from '../services/storage';

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

      setAvailableLocations(StorageService.getLocations());
      setAvailableRegistrars(StorageService.getRegistrars());
      setAvailableItems(StorageService.getInspectionItems());
      setAvailableNcTypes(StorageService.getNonconformityTypes());
      setErrorMsg(null);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

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

    const updates: Partial<NonconformityRecord> = {
      shipNo: shipClean,
      inspectionLocation,
      inspectionDate: inspectionDate.trim(),
      registrar: registrar.trim() || record.registrar,
      inspectionItems,
      nonconformityTypes,
      detailContent: detailContent.trim(),
      status,
      forwardedDate: forwardedDate.trim(),
      assignedManager: assignedManager.trim(),
      managerEmail: managerEmail.trim(),
      checker: checker.trim(),
      completedDate: status === '완료' ? (completedDate.trim() || new Date().toISOString().split('T')[0]) : completedDate.trim(),
      causeAnalysis: causeAnalysis.trim(),
      actionPlan: actionPlan,
      specialNotes: specialNotes.trim(),
    };

    onSave(record._rowIndex, updates);
    onClose();
  };

  return (
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
            <h3 className="text-base font-bold text-slate-900">부적합 등록 자료 수정 (관리자)</h3>
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
        <form id="edit-record-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
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

          {/* Section 3: 상태 및 조치 결과 */}
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
                {(['', '반품', '재작업', '특채', '용도변경', '폐기'] as ActionPlan[]).map((plan) => (
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
                ))}
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
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
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
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>수정 사항 저장</span>
          </button>
        </div>
      </div>
    </div>
  );
};
