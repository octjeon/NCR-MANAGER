import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
  AlertCircle,
  LogIn,
  ChevronDown,
  KeyRound,
  BookOpen,
} from 'lucide-react';
import { AppUser, DEFAULT_USER_PASSWORD } from '../types';
import { StorageService } from '../services/storage';
import { DaehanLogo } from './DaehanLogo';
import { UserManualModal } from './UserManualModal';

interface UserLoginScreenProps {
  onLoginSuccess: (userName: string, keepLoggedIn: boolean) => void;
}

export const UserLoginScreen: React.FC<UserLoginScreenProps> = ({ onLoginSuccess }) => {
  const [users, setUsers] = useState<AppUser[]>(() => StorageService.getUsers());
  const [selectedUserName, setSelectedUserName] = useState<string>(() => {
    const initial = StorageService.getUsers();
    return initial[0]?.name || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Subscribe to real-time user list updates from Firestore
  useEffect(() => {
    const unsub = StorageService.subscribeMasterSettings((settings) => {
      const updatedUsers = settings.users || StorageService.getUsers();
      setUsers(updatedUsers);
      if (updatedUsers.length > 0 && !updatedUsers.some((u) => u.name === selectedUserName)) {
        setSelectedUserName(updatedUsers[0].name);
      }
    });
    return () => unsub();
  }, [selectedUserName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = StorageService.authenticateUser(selectedUserName, password, keepLoggedIn);
    if (!result.ok || !result.user) {
      setErrorMsg(result.message || '로그인에 실패했습니다.');
      return;
    }

    onLoginSuccess(result.user.name, keepLoggedIn);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Brand Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 px-6 py-7 text-center text-white relative">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 mx-auto mb-3 shadow-lg flex items-center justify-center">
            <DaehanLogo className="w-full h-full object-contain" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>주식회사 대한정공 품질관리시스템</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">호선별 부적합 관리</h1>
          <p className="text-xs text-slate-300 mt-1">
            등록된 사용자(검사·등록 담당자) 계정으로 로그인하세요
          </p>
        </div>

        {/* Login Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. 등록된 사용자 선택 (콤보박스 + 빠른 선택 버튼) */}
          <div className="space-y-2">
            <label
              htmlFor="login-user-select"
              className="block text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>사용자 (등록자) 선택</span>
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <select
                id="login-user-select"
                value={selectedUserName}
                onChange={(e) => {
                  setSelectedUserName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-bold bg-slate-50/70 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 cursor-pointer appearance-none pr-10"
              >
                {users.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Select Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {users.map((u) => {
                const isSelected = selectedUserName === u.name;
                return (
                  <button
                    type="button"
                    key={u.name}
                    onClick={() => {
                      setSelectedUserName(u.name);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {u.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 비밀번호 입력 */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-password-input"
              className="block text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>비밀번호</span>
              <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="비밀번호 입력 (초기 비밀번호: 122333)"
                autoFocus
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-semibold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 3. 한 번 로그인 후 계속 사용하기 옵션 */}
          <div
            onClick={() => setKeepLoggedIn(!keepLoggedIn)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
              keepLoggedIn
                ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                keepLoggedIn
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-300'
              }`}
            >
              {keepLoggedIn && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-snug">
                한 번 로그인 후 계속 사용하기 (로그인 상태 유지)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                선택 시 앱을 닫았다가 다시 열어도 재로그인 없이 바로 사용할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="user-login-submit-btn"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{selectedUserName ? `${selectedUserName} 님으로 로그인` : '로그인'}</span>
          </button>

          {/* Info Footer */}
          <div className="pt-4 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                모든 사용자의 초기 비밀번호는{' '}
                <strong className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {DEFAULT_USER_PASSWORD}
                </strong>{' '}
                입니다.
              </span>
            </div>
            <p className="pl-5 text-slate-400 leading-relaxed">
              • 로그인 후 화면 상단 <strong>[비번 변경]</strong> 버튼에서 개인 비밀번호로 변경할 수 있습니다.
              <br />• 신규 사용자(등록자) 추가 및 관리는 로그인 후 <strong>[관리]</strong> 탭에서 관리자가 설정할 수 있습니다.
            </p>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                id="login-view-manual-btn"
                onClick={() => setIsManualModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all shadow-2xs cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>시스템 사용 설명서 (매뉴얼) 열람</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Manual Modal */}
      <UserManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
