import React, { useState, useEffect } from 'react';
import {
  FilePlus2,
  FolderKanban,
  Anchor,
  ShieldCheck,
  Ship,
  Sparkles,
  Info,
} from 'lucide-react';
import { NonconformityRecord } from './types';
import { StorageService } from './services/storage';
import { NewRegistrationTab } from './components/NewRegistrationTab';
import { ProgressManagementTab } from './components/ProgressManagementTab';
import { DetailModal } from './components/DetailModal';
import { RegisteredListModal } from './components/RegisteredListModal';

export default function App() {
  // Navigation Tabs: 'new' (신규 등록) | 'manage' (진행 관리)
  const [activeTab, setActiveTab] = useState<'new' | 'manage'>('new');

  // Master records state
  const [records, setRecords] = useState<NonconformityRecord[]>([]);

  // Selected Record for Detail Modal
  const [selectedRecord, setSelectedRecord] = useState<NonconformityRecord | null>(null);

  // Registered List Modal (from registration complete screen)
  const [isRegisteredListOpen, setIsRegisteredListOpen] = useState(false);

  // Load records from storage on mount
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const data = StorageService.getRecords();
    setRecords(data);
  };

  const handleRecordRegistered = (newRecord: NonconformityRecord) => {
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
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                  주식회사 대한정공
                </h1>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  DAEHAN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                조선업 호선별 부적합(불량) 관리 시스템
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

        {/* Top 2 Tabs (신규 등록 / 진행 관리) */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="grid grid-cols-2 border-b border-slate-200 text-center">
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
          />
        )}

        {activeTab === 'manage' && (
          <ProgressManagementTab
            records={records}
            onSelectRecord={(rec) => {
              const fresh = StorageService.getRecordByRowIndex(rec._rowIndex) || rec;
              setSelectedRecord(fresh);
            }}
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
    </div>
  );
}
