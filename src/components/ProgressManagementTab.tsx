import React from 'react';
import {
  Ship,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { NonconformityRecord } from '../types';

interface ProgressManagementTabProps {
  records: NonconformityRecord[];
  onSelectRecord: (record: NonconformityRecord) => void;
}

export const ProgressManagementTab: React.FC<ProgressManagementTabProps> = ({
  records,
  onSelectRecord,
}) => {
  // Sorted by newest registration (최근 등록순)
  const sortedRecords = [...records].sort((a, b) => {
    // Sort descending by row index or registeredAt
    if (a.registeredAt && b.registeredAt) {
      return b.registeredAt.localeCompare(a.registeredAt);
    }
    return b._rowIndex - a._rowIndex;
  });

  return (
    <div className="max-w-2xl mx-auto py-4 px-3 sm:px-4">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">부적합 등록 및 진행 현황</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            총 {sortedRecords.length}건
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> 진행중{' '}
            <strong className="text-blue-700">
              {sortedRecords.filter((r) => r.status === '진행중').length}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 완료{' '}
            <strong className="text-emerald-700">
              {sortedRecords.filter((r) => r.status === '완료').length}
            </strong>
          </span>
        </div>
      </div>

      {/* Cards List (No search bar per spec) */}
      <div className="space-y-3">
        {sortedRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-400 font-medium">등록된 부적합 내역이 없습니다.</p>
          </div>
        ) : (
          sortedRecords.map((record) => {
            const isProgress = record.status === '진행중';

            return (
              <div
                key={record.id}
                id={`record-card-${record.id}`}
                onClick={() => onSelectRecord(record)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group active:scale-[0.995]"
              >
                {/* Top Row: 순번 / 호선 / 상태뱃지 */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {record.id}
                    </span>
                    <span className="font-bold text-sm text-slate-900 flex items-center gap-1">
                      <Ship className="w-4 h-4 text-slate-500" />
                      {record.shipNo}호선
                    </span>
                  </div>

                  {/* 상태 뱃지 (진행중=파랑, 완료=초록) */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${
                      isProgress
                        ? 'bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isProgress ? (
                      <>
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>진행중</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>완료</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Middle: 검사항목 / 부적합유형 */}
                <div className="space-y-1 mb-3">
                  <div className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                    <span className="text-slate-400 font-normal">검사항목:</span>
                    <span className="truncate">{record.inspectionItems.join(', ')}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-slate-400 text-xs">부적합유형:</span>
                    {record.nonconformityTypes.map((type, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-bold"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {record.detailContent && (
                    <p className="text-xs text-slate-500 line-clamp-2 pt-1 font-normal leading-relaxed">
                      {record.detailContent}
                    </p>
                  )}
                </div>

                {/* Bottom Row: 검사일자, 사진 수, 상세 화살표 */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {record.inspectionDate}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      증거 {record.evidencePhotos.length}장
                      {record.completedPhotos.length > 0 && ` / 완료 ${record.completedPhotos.length}장`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    <span>상세보기</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
