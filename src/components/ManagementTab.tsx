import React, { useState, useMemo } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Eye,
  EyeOff,
  Ship,
  MapPin,
  User,
  ArrowUpDown,
  RotateCcw,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { NonconformityRecord } from '../types';
import { StorageService } from '../services/storage';
import { EditRecordModal } from './EditRecordModal';
import { AnalysisReportModal } from './AnalysisReportModal';
import { AnalysisReportView } from './AnalysisReportView';

interface ManagementTabProps {
  records: NonconformityRecord[];
  onSelectRecord?: (record: NonconformityRecord) => void;
  onOpenReportPdf?: (record: NonconformityRecord) => void;
  onRecordUpdated?: () => void;
}

export const ManagementTab: React.FC<ManagementTabProps> = ({
  records,
  onSelectRecord,
  onOpenReportPdf,
  onRecordUpdated,
}) => {
  // Admin Authentication State
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean>(() => {
    return sessionStorage.getItem('daehan_admin_authed') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Password Change Modal
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);
  const [currentPwdInput, setCurrentPwdInput] = useState('');
  const [newPwdInput, setNewPwdInput] = useState('');
  const [confirmNewPwdInput, setConfirmNewPwdInput] = useState('');
  const [changePwdMsg, setChangePwdMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Sub-navigation within Management Tab: 'data' (자료 수정/삭제) | 'analysis' (실적 분석)
  const [subTab, setSubTab] = useState<'data' | 'analysis'>('data');

  // -------------------------------------------------------------
  // DATA MANAGEMENT (Edit / Delete) State
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Record to edit
  const [editingRecord, setEditingRecord] = useState<NonconformityRecord | null>(null);

  // Record to delete confirmation
  const [deletingRecord, setDeletingRecord] = useState<NonconformityRecord | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // -------------------------------------------------------------
  // PERFORMANCE ANALYSIS (Date Range / Monthly) State
  // -------------------------------------------------------------
  // Default to current year-month
  const now = new Date();
  const currentYearStr = String(now.getFullYear());
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');

  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Date Range Mode: 'month' (매월 실적) | 'custom' (사용자 지정 기간) | 'all' (전체)
  const [periodMode, setPeriodMode] = useState<'month' | 'custom' | 'all'>('month');

  const getFirstDayOfMonth = (year: string, month: string) => `${year}-${month}-01`;
  const getLastDayOfMonth = (year: string, month: string) => {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const lastDay = new Date(y, m, 0).getDate();
    return `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  };

  const [customStartDate, setCustomStartDate] = useState(() => getFirstDayOfMonth(currentYearStr, currentMonthStr));
  const [customEndDate, setCustomEndDate] = useState(() => getLastDayOfMonth(currentYearStr, currentMonthStr));
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Locations list
  const locations = useMemo(() => StorageService.getLocations(), []);
  const ncTypes = useMemo(() => StorageService.getNonconformityTypes(), []);

  // -------------------------------------------------------------
  // Handlers: Authentication
  // -------------------------------------------------------------
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError('관리자 암호를 입력해주세요.');
      return;
    }

    if (StorageService.verifyAdminPassword(passwordInput)) {
      setIsAdminAuthed(true);
      sessionStorage.setItem('daehan_admin_authed', 'true');
      setAuthError(null);
      setPasswordInput('');
    } else {
      setAuthError('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthed(false);
    sessionStorage.removeItem('daehan_admin_authed');
    setPasswordInput('');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePwdMsg(null);

    if (!StorageService.verifyAdminPassword(currentPwdInput)) {
      setChangePwdMsg({ type: 'error', text: '현재 비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (newPwdInput.length < 4) {
      setChangePwdMsg({ type: 'error', text: '새 비밀번호는 4자리 이상이어야 합니다.' });
      return;
    }
    if (newPwdInput !== confirmNewPwdInput) {
      setChangePwdMsg({ type: 'error', text: '새 비밀번호 확인이 일치하지 않습니다.' });
      return;
    }

    StorageService.setAdminPassword(newPwdInput);
    setChangePwdMsg({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
    setTimeout(() => {
      setShowChangePwdModal(false);
      setCurrentPwdInput('');
      setNewPwdInput('');
      setConfirmNewPwdInput('');
      setChangePwdMsg(null);
    }, 1200);
  };

  // -------------------------------------------------------------
  // Handlers: Record Operations (Edit & Delete)
  // -------------------------------------------------------------
  const handleSaveRecord = (rowIndex: number, updates: Partial<NonconformityRecord>) => {
    StorageService.updateRecord(rowIndex, updates);
    if (onRecordUpdated) onRecordUpdated();
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      await StorageService.deleteRecord(deletingRecord._rowIndex);
      setDeletingRecord(null);
      setDeleteConfirmText('');
      if (onRecordUpdated) onRecordUpdated();
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // -------------------------------------------------------------
  // Data Filtering (For Record Management Sub-tab)
  // -------------------------------------------------------------
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchShip = r.shipNo.toLowerCase().includes(q);
        const matchId = r.id.toLowerCase().includes(q);
        const matchReg = r.registrar.toLowerCase().includes(q);
        const matchLoc = (r.inspectionLocation || '').toLowerCase().includes(q);
        const matchDetail = r.detailContent.toLowerCase().includes(q);
        const matchItems = r.inspectionItems.some((item) => item.toLowerCase().includes(q));
        const matchTypes = r.nonconformityTypes.some((t) => t.toLowerCase().includes(q));
        if (!matchShip && !matchId && !matchReg && !matchLoc && !matchDetail && !matchItems && !matchTypes) {
          return false;
        }
      }

      // Status
      if (filterStatus !== 'all' && r.status !== filterStatus) {
        return false;
      }

      // Location
      if (filterLocation !== 'all' && (r.inspectionLocation || '본사') !== filterLocation) {
        return false;
      }

      // Type
      if (filterType !== 'all' && !r.nonconformityTypes.includes(filterType)) {
        return false;
      }

      return true;
    });
  }, [records, searchQuery, filterStatus, filterLocation, filterType]);

  // -------------------------------------------------------------
  // Analysis Calculation (For Period & Monthly Analysis Sub-tab)
  // -------------------------------------------------------------
  const analysisDateRange = useMemo(() => {
    if (periodMode === 'month') {
      return {
        start: getFirstDayOfMonth(selectedYear, selectedMonth),
        end: getLastDayOfMonth(selectedYear, selectedMonth),
        label: `${selectedYear}년 ${parseInt(selectedMonth, 10)}월 실적`,
      };
    } else if (periodMode === 'custom') {
      return {
        start: customStartDate,
        end: customEndDate,
        label: `${customStartDate} ~ ${customEndDate}`,
      };
    } else {
      return {
        start: '1970-01-01',
        end: '2099-12-31',
        label: '전체 누적 실적',
      };
    }
  }, [periodMode, selectedYear, selectedMonth, customStartDate, customEndDate]);

  const analysisRecords = useMemo(() => {
    return records.filter((r) => {
      if (periodMode === 'all') return true;
      const date = r.inspectionDate;
      if (!date) return false;
      return date >= analysisDateRange.start && date <= analysisDateRange.end;
    });
  }, [records, periodMode, analysisDateRange]);

  // Metric summaries
  const totalAnalyzed = analysisRecords.length;
  const completedAnalyzed = analysisRecords.filter((r) => r.status === '완료').length;
  const inProgressAnalyzed = analysisRecords.filter((r) => r.status === '진행중').length;
  const completionRate = totalAnalyzed > 0 ? Math.round((completedAnalyzed / totalAnalyzed) * 100) : 0;

  // Analysis 1: By Nonconformity Type (부적합유형별)
  const analysisByType = useMemo(() => {
    const map: Record<string, { total: number; completed: number; inProgress: number }> = {};

    analysisRecords.forEach((r) => {
      r.nonconformityTypes.forEach((type) => {
        if (!map[type]) {
          map[type] = { total: 0, completed: 0, inProgress: 0 };
        }
        map[type].total += 1;
        if (r.status === '완료') map[type].completed += 1;
        else map[type].inProgress += 1;
      });
    });

    return Object.entries(map)
      .map(([name, stats]) => ({
        name,
        count: stats.total,
        completed: stats.completed,
        inProgress: stats.inProgress,
        percentage: totalAnalyzed > 0 ? Math.round((stats.total / totalAnalyzed) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [analysisRecords, totalAnalyzed]);

  // Analysis 2: By Inspection Item (검사품목 / 검사항목별)
  const analysisByItem = useMemo(() => {
    const map: Record<string, { total: number; completed: number; inProgress: number }> = {};

    analysisRecords.forEach((r) => {
      r.inspectionItems.forEach((item) => {
        if (!map[item]) {
          map[item] = { total: 0, completed: 0, inProgress: 0 };
        }
        map[item].total += 1;
        if (r.status === '완료') map[item].completed += 1;
        else map[item].inProgress += 1;
      });
    });

    return Object.entries(map)
      .map(([name, stats]) => ({
        name,
        count: stats.total,
        completed: stats.completed,
        inProgress: stats.inProgress,
        percentage: totalAnalyzed > 0 ? Math.round((stats.total / totalAnalyzed) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [analysisRecords, totalAnalyzed]);

  // Analysis 3: By Inspection Location (검사장소별)
  const analysisByLocation = useMemo(() => {
    const map: Record<string, { total: number; completed: number; inProgress: number }> = {};

    analysisRecords.forEach((r) => {
      const loc = r.inspectionLocation || '본사';
      if (!map[loc]) {
        map[loc] = { total: 0, completed: 0, inProgress: 0 };
      }
      map[loc].total += 1;
      if (r.status === '완료') map[loc].completed += 1;
      else map[loc].inProgress += 1;
    });

    return Object.entries(map)
      .map(([name, stats]) => ({
        name,
        count: stats.total,
        completed: stats.completed,
        inProgress: stats.inProgress,
        percentage: totalAnalyzed > 0 ? Math.round((stats.total / totalAnalyzed) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [analysisRecords, totalAnalyzed]);

  // Analysis 4: By Ship (호선별)
  const analysisByShip = useMemo(() => {
    const map: Record<string, number> = {};
    analysisRecords.forEach((r) => {
      map[r.shipNo] = (map[r.shipNo] || 0) + 1;
    });
    return Object.entries(map)
      .map(([shipNo, count]) => ({
        shipNo,
        count,
        percentage: totalAnalyzed > 0 ? Math.round((count / totalAnalyzed) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [analysisRecords, totalAnalyzed]);

  // Export CSV
  const handleExportCSV = () => {
    if (analysisRecords.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    const headers = [
      '발행번호',
      '호선',
      '검사장소',
      '검사일자',
      '등록자',
      '검사항목',
      '부적합유형',
      '세부내용',
      '상태',
      '조치담당자',
      '완료일자',
    ];

    const rows = analysisRecords.map((r) => [
      r.id,
      r.shipNo,
      r.inspectionLocation || '본사',
      r.inspectionDate,
      r.registrar,
      `"${r.inspectionItems.join(', ')}"`,
      `"${r.nonconformityTypes.join(', ')}"`,
      `"${(r.detailContent || '').replace(/"/g, '""')}"`,
      r.status,
      r.assignedManager || '',
      r.completedDate || '',
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `부적합_실적분석_${analysisDateRange.label.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    setIsAnalysisModalOpen(true);
  };

  // -------------------------------------------------------------
  // 1. Password Guard View (If not authenticated)
  // -------------------------------------------------------------
  if (!isAdminAuthed) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50/50">
            <Lock className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            관리자 보안 인증
          </span>

          <h2 className="text-lg font-bold text-slate-900 mt-3">관리 탭 접근 권한 확인</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
            등록된 자료의 <strong>수정/삭제</strong> 및{' '}
            <strong>기간별(매월) 실적 분석</strong> 기능을 이용하려면 관리자 암호를 입력해주세요.
          </p>

          {authError && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password-input"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="관리자 암호 입력"
                autoFocus
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-semibold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? '암호 숨기기' : '암호 보기'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              id="admin-login-submit-btn"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>관리자 권한 확인</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              * 초기 기본 관리자 암호: <strong className="text-slate-600 font-mono">admin1234</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. Authenticated Admin View
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto py-4 px-3 sm:px-4 space-y-4">
      {/* Top Admin Status & Navigation Header */}
      <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">관리자 모드 (Admin Portal)</h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  인증 완료
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                등록 자료 수정/삭제 및 기간별/매월 부적합 실적 분석 통계
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              id="change-pwd-btn"
              onClick={() => setShowChangePwdModal(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>암호 변경</span>
            </button>
            <button
              type="button"
              id="admin-logout-btn"
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-semibold text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>잠금</span>
            </button>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="grid grid-cols-2 gap-2 pt-3">
          <button
            type="button"
            id="subtab-data-btn"
            onClick={() => setSubTab('data')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              subTab === 'data'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Edit className="w-4 h-4" />
            <span>등록 자료 수정 및 삭제 ({records.length}건)</span>
          </button>

          <button
            type="button"
            id="subtab-analysis-btn"
            onClick={() => setSubTab('analysis')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              subTab === 'analysis'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>기간별 / 매월 실적 분석</span>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SUB-TAB 1: 자료 수정 및 삭제                                  */}
      {/* ============================================================= */}
      {subTab === 'data' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="호선 번호, 발행번호, 검사장소, 등록자, 부적합 내용 검색..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Status filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">조치 상태</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                >
                  <option value="all">전체 상태</option>
                  <option value="진행중">진행중</option>
                  <option value="완료">완료</option>
                </select>
              </div>

              {/* Location filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">검사장소</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                >
                  <option value="all">전체 검사장소</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">부적합 유형</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                >
                  <option value="all">전체 부적합유형</option>
                  {ncTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>
                검색 결과: <strong>{filteredRecords.length}</strong>건 / 총 {records.length}건
              </span>
              {(searchQuery || filterStatus !== 'all' || filterLocation !== 'all' || filterType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterLocation('all');
                    setFilterType('all');
                  }}
                  className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> 필터 초기화
                </button>
              )}
            </div>
          </div>

          {/* Records List Table */}
          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 text-xs">
                조건에 일치하는 부적합 등록 건이 없습니다.
              </div>
            ) : (
              filteredRecords.map((rec) => {
                const isCompleted = rec.status === '완료';
                return (
                  <div
                    key={rec.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {rec.id}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                          <Ship className="w-3.5 h-3.5 text-blue-600" />
                          {rec.shipNo}호선
                        </span>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          {rec.inspectionLocation || '본사'}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {rec.inspectionDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {rec.registrar}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="font-semibold text-slate-700">
                          {rec.inspectionItems.join(', ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rec.nonconformityTypes.map((type, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                        {rec.detailContent}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-100 sm:pl-3 shrink-0">
                      {/* 수정 버튼 */}
                      <button
                        type="button"
                        onClick={() => setEditingRecord(rec)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors border border-blue-200"
                        title="자료 수정"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        type="button"
                        onClick={() => {
                          setDeletingRecord(rec);
                          setDeleteConfirmText('');
                        }}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors border border-red-200"
                        title="자료 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>

                      {/* PDF 보고서 버튼 */}
                      {onOpenReportPdf && (
                        <button
                          type="button"
                          onClick={() => onOpenReportPdf(rec)}
                          className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-200"
                          title="보고서 보기"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* SUB-TAB 2: 기간별 / 매월 실적 분석                            */}
      {/* ============================================================= */}
      {subTab === 'analysis' && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          {/* Period Selector Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>분석 대상 기간 (매월 실적 선택)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  선택한 기간 동안의 부적합 통계 및 유형별, 검사항목별 분석 결과를 산출합니다.
                </p>
              </div>

              {/* Mode toggles */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPeriodMode('month')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    periodMode === 'month'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  매월 실적
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodMode('custom')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    periodMode === 'custom'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  직접 지정
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodMode('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    periodMode === 'all'
                      ? 'bg-white text-blue-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  전체 누적
                </button>
              </div>
            </div>

            {/* Inputs based on period mode */}
            {periodMode === 'month' && (
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs">
                  <label className="font-bold text-slate-700">년도:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white cursor-pointer"
                  >
                    <option value="2024">2024년</option>
                    <option value="2025">2025년</option>
                    <option value="2026">2026년</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <label className="font-bold text-slate-700">월별 선택:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white cursor-pointer"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i + 1).padStart(2, '0');
                      return (
                        <option key={m} value={m}>
                          {i + 1}월 ({selectedYear}.{m})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 ml-auto">
                  {analysisDateRange.label} ({analysisDateRange.start} ~ {analysisDateRange.end})
                </span>
              </div>
            )}

            {periodMode === 'custom' && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">시작일자:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>
                <span className="text-slate-400">~</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">종료일자:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>
            )}

            {/* Export & Print actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                분석 데이터: 총 <strong>{totalAnalyzed}</strong>건
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>엑셀 / CSV 내보내기</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>분석표 인쇄</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 총 부적합 건수 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block">총 발행 건수</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{totalAnalyzed}</span>
                <span className="text-xs font-semibold text-slate-500">건</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{analysisDateRange.label}</span>
            </div>

            {/* 조치 완료 건수 & 완료율 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 block">조치 완료 (완료율)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-emerald-700">{completedAnalyzed}</span>
                <span className="text-xs font-semibold text-slate-500">건</span>
                <span className="text-xs font-bold text-emerald-600 ml-1">({completionRate}%)</span>
              </div>
              <span className="text-[10px] text-emerald-600/80 mt-0.5 block">정상 조치 완료건</span>
            </div>

            {/* 진행 중 건수 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-600 block">진행 중 건수</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-blue-700">{inProgressAnalyzed}</span>
                <span className="text-xs font-semibold text-slate-500">건</span>
              </div>
              <span className="text-[10px] text-blue-500 mt-0.5 block">조치 계획 및 이행 중</span>
            </div>

            {/* 최빈 부적합 유형 */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-500 block">최빈 부적합 유형</span>
              <div className="truncate font-extrabold text-slate-900 text-sm mt-1.5">
                {analysisByType[0] ? analysisByType[0].name : '-'}
              </div>
              <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">
                {analysisByType[0] ? `${analysisByType[0].count}건 (${analysisByType[0].percentage}%)` : '자료 없음'}
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ANALYSIS SECTION 1: 부적합유형별 분석                     */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">부적합 유형별 분석 (점유율 & 조치 현황)</h3>
                  <p className="text-[11px] text-slate-400">
                    용접불량, 가공불량, 치수불량 등 발생 유형별 발생 빈도 및 조치 완료율
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                총 {analysisByType.length}개 유형
              </span>
            </div>

            {analysisByType.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">선택 기간 내 등록된 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {analysisByType.map((item, idx) => {
                  const itemCompletionRate = item.count > 0 ? Math.round((item.completed / item.count) * 100) : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0
                                ? 'bg-rose-600 text-white'
                                : idx === 1
                                ? 'bg-rose-400 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            (완료 {item.completed}건 / 진행 {item.inProgress}건)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{item.count}건</span>
                          <span className="text-xs font-extrabold text-rose-600 w-10 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                          title={`${item.name}: ${item.count}건 (${item.percentage}%)`}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Detailed Table */}
                <div className="pt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">순위</th>
                        <th className="p-2.5">부적합 유형명</th>
                        <th className="p-2.5 text-center">발생건수</th>
                        <th className="p-2.5 text-center">점유율</th>
                        <th className="p-2.5 text-center">조치 완료</th>
                        <th className="p-2.5 text-center">진행 중</th>
                        <th className="p-2.5 text-center">완료율</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysisByType.map((item, i) => {
                        const itemCompRate = item.count > 0 ? Math.round((item.completed / item.count) * 100) : 0;
                        return (
                          <tr key={item.name} className="hover:bg-slate-50/70">
                            <td className="p-2.5 font-bold text-slate-500">{i + 1}</td>
                            <td className="p-2.5 font-bold text-slate-800">{item.name}</td>
                            <td className="p-2.5 text-center font-bold">{item.count}건</td>
                            <td className="p-2.5 text-center font-semibold text-rose-600">{item.percentage}%</td>
                            <td className="p-2.5 text-center text-emerald-700 font-semibold">{item.completed}건</td>
                            <td className="p-2.5 text-center text-blue-700 font-semibold">{item.inProgress}건</td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  itemCompRate >= 80
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : itemCompRate >= 50
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {itemCompRate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* ANALYSIS SECTION 2: 검사품목 / 검사항목별 분석             */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">검사품목 및 검사항목별 실적 분석</h3>
                  <p className="text-[11px] text-slate-400">
                    LIFTING LUG, PIPE SPOOL, HULL BLOCK 등 검사항목별 불량 발생 실적
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                총 {analysisByItem.length}개 품목
              </span>
            </div>

            {analysisByItem.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">선택 기간 내 등록된 데이터가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {analysisByItem.map((item, idx) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0
                              ? 'bg-blue-600 text-white'
                              : idx === 1
                              ? 'bg-blue-400 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          (완료 {item.completed}건 / 진행 {item.inProgress}건)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{item.count}건</span>
                        <span className="text-xs font-extrabold text-blue-600 w-10 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                        title={`${item.name}: ${item.count}건 (${item.percentage}%)`}
                      />
                    </div>
                  </div>
                ))}

                {/* Item breakdown table */}
                <div className="pt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">순위</th>
                        <th className="p-2.5">검사품목 / 검사항목명</th>
                        <th className="p-2.5 text-center">발생건수</th>
                        <th className="p-2.5 text-center">점유율</th>
                        <th className="p-2.5 text-center">조치 완료</th>
                        <th className="p-2.5 text-center">진행 중</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysisByItem.map((item, i) => (
                        <tr key={item.name} className="hover:bg-slate-50/70">
                          <td className="p-2.5 font-bold text-slate-500">{i + 1}</td>
                          <td className="p-2.5 font-bold text-slate-800">{item.name}</td>
                          <td className="p-2.5 text-center font-bold">{item.count}건</td>
                          <td className="p-2.5 text-center font-semibold text-blue-600">{item.percentage}%</td>
                          <td className="p-2.5 text-center text-emerald-700 font-semibold">{item.completed}건</td>
                          <td className="p-2.5 text-center text-blue-700 font-semibold">{item.inProgress}건</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* ANALYSIS SECTION 3: 검사장소별 및 호선별 보조 실적        */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 검사장소별 실적 */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>검사장소별 발생 현황 (공장/협력사)</span>
              </h4>

              {analysisByLocation.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">자료 없음</p>
              ) : (
                <div className="space-y-2">
                  {analysisByLocation.map((loc) => (
                    <div key={loc.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{loc.name}</span>
                        <span className="font-bold text-slate-600">
                          {loc.count}건 ({loc.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${loc.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 호선별 발생 현황 */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Ship className="w-3.5 h-3.5 text-blue-600" />
                <span>호선별 부적합 발생 건수</span>
              </h4>

              {analysisByShip.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">자료 없음</p>
              ) : (
                <div className="space-y-2">
                  {analysisByShip.map((s) => (
                    <div key={s.shipNo} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800">{s.shipNo}호선</span>
                        <span className="font-bold text-slate-600">
                          {s.count}건 ({s.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full"
                          style={{ width: `${s.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: Record Edit                                            */}
      {/* ============================================================= */}
      <EditRecordModal
        record={editingRecord}
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveRecord}
      />

      {/* ============================================================= */}
      {/* MODAL: Record Delete Confirmation                             */}
      {/* ============================================================= */}
      {deletingRecord && (
        <div
          id="delete-record-backdrop"
          onClick={() => setDeletingRecord(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-red-200 animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">부적합 등록 자료 삭제</h3>
              <p className="text-xs text-slate-500 mt-1">
                정말로 다음 자료를 삭제하시겠습니까? 삭제된 자료는 복구할 수 없습니다.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">발행번호:</span>
                <span className="font-mono font-bold text-blue-700">{deletingRecord.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">호선:</span>
                <span className="font-bold text-slate-900">{deletingRecord.shipNo}호선</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">검사일자:</span>
                <span>{deletingRecord.inspectionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">검사장소:</span>
                <span>{deletingRecord.inspectionLocation || '본사'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">부적합유형:</span>
                <span className="font-semibold text-rose-600">
                  {deletingRecord.nonconformityTypes.join(', ')}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                id="confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? '삭제 중...' : '영구 삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: Change Admin Password                                  */}
      {/* ============================================================= */}
      {showChangePwdModal && (
        <div
          id="change-pwd-backdrop"
          onClick={() => setShowChangePwdModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>관리자 암호 변경</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowChangePwdModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {changePwdMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  changePwdMsg.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {changePwdMsg.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                ) : (
                  <Check className="w-4 h-4 shrink-0" />
                )}
                <span>{changePwdMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">현재 암호</label>
                <input
                  type="password"
                  value={currentPwdInput}
                  onChange={(e) => setCurrentPwdInput(e.target.value)}
                  placeholder="현재 사용 중인 관리자 암호"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">새 암호 (4자리 이상)</label>
                <input
                  type="password"
                  value={newPwdInput}
                  onChange={(e) => setNewPwdInput(e.target.value)}
                  placeholder="새로 설정할 관리자 암호"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">새 암호 확인</label>
                <input
                  type="password"
                  value={confirmNewPwdInput}
                  onChange={(e) => setConfirmNewPwdInput(e.target.value)}
                  placeholder="새 암호 재입력"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePwdModal(false)}
                  className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
                >
                  변경 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analysis Report Preview & Print/PDF Modal */}
      <AnalysisReportModal
        records={analysisRecords}
        periodLabel={analysisDateRange.label}
        startDate={periodMode === 'custom' ? customStartDate : undefined}
        endDate={periodMode === 'custom' ? customEndDate : undefined}
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        analysisByType={analysisByType}
        analysisByItem={analysisByItem}
        analysisByLocation={analysisByLocation}
        analysisByShip={analysisByShip}
      />

      {/* Hidden dedicated print area for direct print triggering */}
      <div className="hidden print:block print-area">
        <AnalysisReportView
          records={analysisRecords}
          periodLabel={analysisDateRange.label}
          startDate={periodMode === 'custom' ? customStartDate : undefined}
          endDate={periodMode === 'custom' ? customEndDate : undefined}
          id="daehan-analysis-pdf-print-target"
          analysisByType={analysisByType}
          analysisByItem={analysisByItem}
          analysisByLocation={analysisByLocation}
          analysisByShip={analysisByShip}
        />
      </div>
    </div>
  );
};
