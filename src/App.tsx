import React, { useState, useEffect } from 'react';
import {
  FilePlus2,
  FolderKanban,
  Anchor,
  ShieldCheck,
  Ship,
  Sparkles,
  Info,
  Cloud,
  Settings2,
} from 'lucide-react';
import { NonconformityRecord } from './types';
import { StorageService } from './services/storage';
import { DaehanLogo } from './components/DaehanLogo';
import { NewRegistrationTab } from './components/NewRegistrationTab';
import { ProgressManagementTab } from './components/ProgressManagementTab';
import { ManagementTab } from './components/ManagementTab';
import { DetailModal } from './components/DetailModal';
import { RegisteredListModal } from './components/RegisteredListModal';
import { ReportPreviewModal } from './components/ReportPreviewModal';

export default function App() {
  // Navigation Tabs: 'new' (신규 등록) | 'manage' (진행 관리) | 'admin' (관리)
  const [activeTab, setActiveTab] = useState<'new' | 'manage' | 'admin'>('new');

  // Master records state
  const [records, setRecords] = useState<NonconformityRecord[]>([]);

  // Cloud sync indicator
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Selected Record for Detail Modal
  const [selectedRecord, setSelectedRecord] = useState<NonconformityRecord | null>(null);

  // Direct PDF Preview Record
  const [previewPdfRecord, setPreviewPdfRecord] = useState<NonconformityRecord | null>(null);

  // Registered List Modal (from registration complete screen)
  const [isRegisteredListOpen, setIsRegisteredListOpen] = useState(false);

  // Subscribe to real-time records from Firebase Firestore on mount
  useEffect(() => {
    // Initial quick read from local storage
    const initial = StorageService.getRecords();
    setRecords(initial);

    // Live subscription to Firestore cloud database
    const unsubscribe = StorageService.subscribeRecords(
      (freshRecords) => {
        setRecords(freshRecords);
        setIsCloudSynced(true);
      },
      () => {
        setIsCloudSynced(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const loadRecords = () => {
    const data = StorageService.getRecords();
    setRecords(data);
  };

  const handleRecordRegistered = (_newRecord: NonconformityRecord) => {
    loadRecords();
  };

  const handleUpdateRecord = (rowIndex: number, updates: Partial<NonconformityRecord>) => {
    const updated = StorageService.updateRecord(rowIndex, updates);
    loadRecords();
    if (updated && selectedRecord && selectedRecord._rowIndex === rowIndex) {
      setSelectedRecord(updated);
    }
  };

  const handleSelectRecordFromList = (rec: NonconformityRecord) => {
    setIsRegisteredListOpen(false);
    setActiveTab('manage');
    // Ensure we fetch freshest record from storage
    const fresh = StorageService.getRecordByRowIndex(rec._rowIndex) || rec;
    setSelectedRecord(fresh);
  };

  const inProgressCount = records.filter((r) => r.status === '진행중').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900 font-sans text-slate-800">
      {/* Top Application Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/90 shadow-2xs p-1 flex items-center justify-center shrink-0">
              <DaehanLogo className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                  주식회사 대한정공
                </h1>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  DAEHAN
                </span>
                {isCloudSynced && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    클라우드 연동
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-0.5">
                호선별 부적합 관리
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              양식 DH-QP-870-01
            </span>
          </div>
        </div>

        {/* Top 3 Tabs (신규 등록 / 진행 관리 / 관리) */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-3 border-b border-slate-200 text-center">
            {/* Tab 1: 신규 등록 */}
            <button
              type="button"
              id="nav-tab-new"
              onClick={() => setActiveTab('new')}
              className={`py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'new'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
              }`}
            >
              <FilePlus2 className="w-4 h-4" />
              <span>신규 등록</span>
            </button>

            {/* Tab 2: 진행 관리 */}
            <button
              type="button"
              id="nav-tab-manage"
              onClick={() => {
                loadRecords();
                setActiveTab('manage');
              }}
              className={`py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'manage'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>진행 관리</span>
              {inProgressCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  {inProgressCount}
                </span>
              )}
            </button>

            {/* Tab 3: 관리 (Admin) */}
            <button
              type="button"
              id="nav-tab-admin"
              onClick={() => {
                loadRecords();
                setActiveTab('admin');
              }}
              className={`py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>관리</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content Stage */}
      <main className="flex-1 pb-12">
        {activeTab === 'new' && (
          <NewRegistrationTab
            onRecordRegistered={handleRecordRegistered}
            onOpenRegisteredList={() => setIsRegisteredListOpen(true)}
            onNavigateToDetail={(rec) => {
              setActiveTab('manage');
              setSelectedRecord(rec);
            }}
            onOpenReportPdf={(rec) => setPreviewPdfRecord(rec)}
          />
        )}

        {activeTab === 'manage' && (
          <ProgressManagementTab
            records={records}
            onSelectRecord={(rec) => {
              const fresh = StorageService.getRecordByRowIndex(rec._rowIndex) || rec;
              setSelectedRecord(fresh);
            }}
            onOpenReportPdf={(rec) => setPreviewPdfRecord(rec)}
          />
        )}

        {activeTab === 'admin' && (
          <ManagementTab
            records={records}
            onSelectRecord={(rec) => {
              const fresh = StorageService.getRecordByRowIndex(rec._rowIndex) || rec;
              setSelectedRecord(fresh);
            }}
            onOpenReportPdf={(rec) => setPreviewPdfRecord(rec)}
            onRecordUpdated={loadRecords}
          />
        )}
      </main>

      {/* Detail Modal */}
      <DetailModal
        record={selectedRecord}
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        onUpdateRecord={handleUpdateRecord}
      />

      {/* Registered List Modal (from New Registration complete screen) */}
      <RegisteredListModal
        records={records}
        isOpen={isRegisteredListOpen}
        onClose={() => setIsRegisteredListOpen(false)}
        onSelectRecord={handleSelectRecordFromList}
      />

      {/* Direct Report Preview & PDF Print Modal */}
      <ReportPreviewModal
        record={previewPdfRecord}
        isOpen={Boolean(previewPdfRecord)}
        onClose={() => setPreviewPdfRecord(null)}
      />
    </div>
  );
}
