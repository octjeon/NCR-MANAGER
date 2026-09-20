import React from 'react';
import { X, ChevronRight, Clock, CheckCircle2, Ship, Calendar, User } from 'lucide-react';
import { NonconformityRecord } from '../types';

interface RegisteredListModalProps {
  records: NonconformityRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSelectRecord: (record: NonconformityRecord) => void;
}

export const RegisteredListModal: React.FC<RegisteredListModalProps> = ({
  records,
  isOpen,
  onClose,
  onSelectRecord,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="registered-list-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">등록된 부적합 건 목록</h3>
            <p className="text-xs text-slate-500">총 {records.length}건이 등록되어 있습니다</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
          {records.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              등록된 부적합 건이 없습니다.
            </div>
          ) : (
            records.map((rec) => {
              const isProgress = rec.status === '진행중';
              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    onClose();
                    onSelectRecord(rec);
                  }}
                  className="pt-2 pb-2 first:pt-0 flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors"
                >
                  <div className="space-y-1 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {rec.id}
                      </span>
                      <span className="font-bold text-sm text-slate-800 flex items-center gap-1">
                        <Ship className="w-3.5 h-3.5 text-slate-500" />
                        {rec.shipNo}호선
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isProgress
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 truncate font-medium">
                      {rec.inspectionItems.slice(0, 2).join(', ')}
                      {rec.inspectionItems.length > 2 && ` 외 ${rec.inspectionItems.length - 2}건`}
                      {' · '}
                      <span className="text-rose-600">{rec.nonconformityTypes.join(', ')}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {rec.inspectionDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {rec.registrar}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
