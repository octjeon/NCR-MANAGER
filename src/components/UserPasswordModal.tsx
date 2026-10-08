import React, { useState } from 'react';
import { X, KeyRound, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { DEFAULT_USER_PASSWORD } from '../types';

interface UserPasswordModalProps {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UserPasswordModal: React.FC<UserPasswordModalProps> = ({
  userName,
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!currentPassword.trim()) {
      setStatusMsg({ type: 'error', text: '현재 비밀번호를 입력해주세요.' });
      return;
    }
    if (newPassword.trim().length < 4) {
      setStatusMsg({ type: 'error', text: '새 비밀번호는 4자리 이상 입력해주세요.' });
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setStatusMsg({ type: 'error', text: '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.' });
      return;
    }

    const res = StorageService.changeUserPassword(userName, currentPassword, newPassword);
    if (!res.ok) {
      setStatusMsg({ type: 'error', text: res.message || '비밀번호 변경에 실패했습니다.' });
      return;
    }

    setStatusMsg({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div
      id="user-password-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>개인 비밀번호 변경</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              로그인 사용자: <strong className="text-blue-700">{userName}</strong> 님
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              statusMsg.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {statusMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Check className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              현재 비밀번호 <span className="text-slate-400 font-normal">(초기값: {DEFAULT_USER_PASSWORD})</span>
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 사용 중인 비밀번호"
              autoFocus
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">새 비밀번호 (4자리 이상)</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 입력"
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">새 비밀번호 확인</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 다시 입력"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              비밀번호 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
