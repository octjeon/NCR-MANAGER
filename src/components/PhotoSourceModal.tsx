import React from 'react';
import { Camera, Image, X } from 'lucide-react';

interface PhotoSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectGallery: () => void;
  slotNumber?: number;
  title?: string;
}

export const PhotoSourceModal: React.FC<PhotoSourceModalProps> = ({
  isOpen,
  onClose,
  onSelectCamera,
  onSelectGallery,
  slotNumber,
  title = '사진 추가 방법 선택',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Card */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl z-10 border border-slate-100 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {title}
              {slotNumber && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                  슬롯 #{slotNumber}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              카메라로 직접 촬영하거나 갤러리(앨범)의 사진을 선택하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 py-4">
          {/* Option 1: Camera */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectCamera();
            }}
            className="w-full flex items-center gap-4 p-3.5 rounded-xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/50 text-left transition-all group active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                  카메라로 직접 촬영
                </span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded">
                  즉시 촬영
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                현장 기기 카메라를 실행하여 사진을 즉시 촬영합니다.
              </p>
            </div>
          </button>

          {/* Option 2: Gallery / Album */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectGallery();
            }}
            className="w-full flex items-center gap-4 p-3.5 rounded-xl border-2 border-slate-200 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-left transition-all group active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Image className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-700">
                  갤러리 / 앨범에서 선택
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded">
                  다중 선택 가능
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                기기에 저장된 사진 앨범에서 1장 또는 여러 장을 불러옵니다.
              </p>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
};
