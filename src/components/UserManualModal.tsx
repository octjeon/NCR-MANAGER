import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  KeyRound,
  FilePlus2,
  FolderKanban,
  FileText,
  Settings2,
  Smartphone,
  HelpCircle,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { DEFAULT_USER_PASSWORD } from '../types';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ManualCategory = 'all' | 'auth' | 'new' | 'progress' | 'report' | 'admin' | 'faq';

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<ManualCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="user-manual-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                  부적합 품질관리 시스템 사용자 매뉴얼
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  v2.5 최신판
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                주식회사 대한정공 호선별 부적합 관리 표준 운영 가이드
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="매뉴얼 인쇄"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0 space-y-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어 입력 (예: 비밀번호, 122333, 사진 추가, 콤보박스, PDF, 실적분석...)"
              className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'all', label: '전체 보기', icon: BookOpen },
              { id: 'auth', label: '1. 로그인/계정', icon: KeyRound },
              { id: 'new', label: '2. 신규 등록', icon: FilePlus2 },
              { id: 'progress', label: '3. 진행/조치', icon: FolderKanban },
              { id: 'report', label: '4. 보고서(PDF)', icon: FileText },
              { id: 'admin', label: '5. 관리/사진수정', icon: Settings2 },
              { id: 'faq', label: '6. 모바일/FAQ', icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id as ManualCategory)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Manual Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Notice Card: Quick Keys */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>주요 기본 접속 정보</span>
              </div>
              <p className="text-[11px] text-slate-600">
                현장 검사원 및 관리자의 기본 비밀번호 안내입니다. 클릭하여 바로 복사할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleCopy(DEFAULT_USER_PASSWORD, 'userPwd')}
                className="px-3 py-1.5 bg-white border border-blue-300 hover:border-blue-500 rounded-xl text-xs font-bold text-blue-800 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <span>초기 사용자 암호:</span>
                <span className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-900">
                  {DEFAULT_USER_PASSWORD}
                </span>
                {copiedKey === 'userPwd' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCopy('admin1234', 'adminPwd')}
                className="px-3 py-1.5 bg-white border border-indigo-300 hover:border-indigo-500 rounded-xl text-xs font-bold text-indigo-800 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <span>관리자 마스터 암호:</span>
                <span className="font-mono bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-900">
                  admin1234
                </span>
                {copiedKey === 'adminPwd' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Section 1: 계정 및 로그인 */}
          {(activeCategory === 'all' || activeCategory === 'auth') && (
            <div className="space-y-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  사용자 로그인 및 계정 관리
                </h4>
              </div>

              <div className="space-y-3 pl-1">
                <div>
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>초기 로그인 및 자동 로그인 유지</span>
                  </h5>
                  <p className="text-slate-600">
                    본 시스템은 등록된 사용자(검사원)만 접속하여 사용할 수 있습니다.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 mt-1.5 text-slate-600 pl-1">
                    <li>
                      <strong>사용자 선택</strong>: 드롭다운 또는 빠른 선택 뱃지(하대기, 최윤섭, 허성렬, 공병관 등)를 클릭하여 본인 계정을 선택합니다.
                    </li>
                    <li>
                      <strong>비밀번호 입력</strong>: 초기 접속자는 기본 비밀번호{' '}
                      <strong className="text-blue-700 font-mono bg-blue-50 px-1 rounded">122333</strong>을 입력합니다.
                    </li>
                    <li>
                      <strong>로그인 상태 유지</strong>: <em>'한 번 로그인 후 계속 사용하기'</em>를 체크하면 다음 접속 시 재로그인 없이 즉시 사용 가능합니다.
                    </li>
                  </ol>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>개인 비밀번호 변경</span>
                  </h5>
                  <p className="text-slate-600">
                    화면 상단 헤더 우측 본인 성명 옆 <strong>[🔑 비번 변경]</strong> 버튼을 누르면 언제든지 본인만의 비밀번호(4자리 이상)로 변경할 수 있습니다.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>관리자의 사용자(등록자) 계정 관리</span>
                  </h5>
                  <p className="text-slate-600">
                    신규 입사자나 신규 검사원 등록은 <strong>[관리] 탭 ➔ [사용자(등록자) 관리]</strong> 메뉴에서 관리자가 추가하며, 사용자가 비밀번호를 분실했을 경우 <strong>[초기화]</strong> 버튼을 눌러 즉시 <code>122333</code>으로 리셋해 줄 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: 신규 부적합 등록 */}
          {(activeCategory === 'all' || activeCategory === 'new') && (
            <div className="space-y-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  신규 부적합 등록 가이드 (4단계 위저드)
                </h4>
              </div>

              <div className="space-y-4 pl-1">
                <div>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                    1단계: 검사 기본 정보 입력
                  </span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 pl-1">
                    <li>
                      <strong>호선번호</strong>: 숫자 4자리(예: <code>2401</code>)를 입력합니다. (숫자만 자동 필터링)
                    </li>
                    <li>
                      <strong>검사장소 (콤보박스)</strong>: 본사, 1공장, 2공장, 온산공장, 대원, 신라 중 선택. 목록에 없는 협력사나 공장은 하단 <code>[+ 검사장소 추가]</code> 버튼으로 즉시 등록할 수 있습니다.
                    </li>
                    <li>
                      <strong>등록자 자동 세팅</strong>: 로그인된 사용자의 성명이 자동으로 지정됩니다.
                    </li>
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                    2단계: 검사품목 / 검사항목 단일 콤보박스 선택
                  </span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 pl-1">
                    <li>
                      <strong>콤보박스 드롭다운</strong>: 클릭하여 <code>CS PIPE SPOOL VISUAL</code>, <code>SUS PIPE SPOOL HYD</code>, <code>PAINT</code>, <code>LIFTING LUG</code> 등 대상 품목 1개를 선택합니다.
                    </li>
                    <li>
                      <strong>신규 품목 추가</strong>: 목록에 없는 품목은 우측 상단 <code>[+ 검사항목 추가]</code>를 눌러 새 항목을 등록하면 즉시 마스터에 반영되고 자동 선택됩니다.
                    </li>
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                    3단계: 부적합 유형 및 세부내용 작성
                  </span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 pl-1">
                    <li>
                      <strong>부적합 유형 (복수 선택)</strong>: <code>WELDING</code>, <code>PAINT</code>, <code>ASSEMBLE</code>, <code>MIS ALIGN</code>, <code>VISUAL</code>, <code>LEAK</code>, <code>MATERIAL</code>, <code>DESIGN</code> 중 해당되는 항목을 클릭합니다.
                    </li>
                    <li>
                      <strong>상세 내용</strong>: 결함 부위(스풀 번호, 블록 위치), 불량 상태 및 규격 미달 치수를 구체적으로 기재합니다.
                    </li>
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    4단계: 고화질 자동최적화 증거사진 첨부 (최대 4장)
                  </span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 pl-1">
                    <li>
                      <strong>카메라 직접 촬영</strong>: 현장에서 스마트폰 카메라를 즉시 구동하여 사진을 촬영합니다.
                    </li>
                    <li>
                      <strong>갤러리 선택</strong>: 기기 사진첩에서 1장 또는 여러 장을 동시에 선택하여 일괄 첨부합니다.
                    </li>
                    <li>
                      <strong>실시간 자동 최적화</strong>: 첨부 즉시 시스템이 화질 저하 없이 해상도를 800px로 조절하고 95% 이상 용량을 자동 압축하여 저장합니다.
                    </li>
                    <li>
                      <strong>등록 완료</strong>: <code>[💾 부적합 등록 완료]</code>를 누르면 중복 없는 신규 고유번호(<code>DHQ-0001</code>, <code>DHQ-0002</code>...)가 순차 발급됩니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: 진행 관리 및 조치 완료 */}
          {(activeCategory === 'all' || activeCategory === 'progress') && (
            <div className="space-y-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  부적합 진행 관리 및 조치 완료 처리
                </h4>
              </div>

              <div className="space-y-3 pl-1">
                <div>
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>목록 검색 및 사진 원본 확대 (라이트박스)</span>
                  </h5>
                  <p className="text-slate-600">
                    상태별(진행중/완료), 검사장소, 부적합유형 필터를 제공하며, 카드의 사진을 클릭하면 전체화면 라이트박스에서 100%~300% 확대 및 이전/다음 사진 탐색이 가능합니다.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>진행 담당자 지정 및 원클릭 이메일 통보</span>
                  </h5>
                  <p className="text-slate-600">
                    상세 팝업에서 담당자 성명과 이메일을 입력한 후 <strong>[✉️ 담당자 메일 통보]</strong>를 누르면, 정돈된 부적합 보고 내역이 메일 프로그램과 자동 연동되어 담당자에게 즉시 발송됩니다.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    <span>조치 완료 등록 절차</span>
                  </h5>
                  <p className="text-slate-600">
                    현장에서 재작업 및 수리가 완료되었을 때:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-600 pl-1">
                    <li>해당 카드의 <strong>[상태관리 / 조치]</strong> 버튼 클릭.</li>
                    <li>결함 발생 <strong>원인 분석</strong> 및 <strong>특이사항</strong> 기재.</li>
                    <li><strong>조치 방안 선택</strong>: [반품], [재작업], [특채], [용도변경], [폐기] 중 1개 선택.</li>
                    <li><strong>조치완료 증거사진 첨부</strong>: 카메라 또는 갤러리에서 완료 사진 1~4장 등록.</li>
                    <li><strong>확인자(검사원) 성명</strong> 입력 후 <code>[💾 조치완료 저장]</code> 클릭.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: 표준 부적합보고서 출력 */}
          {(activeCategory === 'all' || activeCategory === 'report') && (
            <div className="space-y-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  4
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  사내 표준 부적합보고서 (DH-QP-870-01) 발행
                </h4>
              </div>

              <div className="space-y-3 pl-1 text-slate-600">
                <p>
                  본 시스템은 주식회사 대한정공의 공식 사내 표준 양식인 <strong>[부적합보고서 (양식번호: DH-QP-870-01, 개정: 0)]</strong>를 자동 생성합니다.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800">📄 보고서 구성 항목:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      <li>대한정공 CI 로고 및 공식 관리번호</li>
                      <li>3단 결재란 (작성 / 검토 / 승인)</li>
                      <li>발생일자, 발행번호, 검사원, 호선번호</li>
                      <li>검사장소, 검사항목, 부적합유형, 세부내용</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800">📸 사진 및 후속조치 항목:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                      <li>발생 당시 증거사진 1~4장 (격자 배치)</li>
                      <li>조치완료 확인사진 1~4장 (격자 배치)</li>
                      <li>원인분석, 특이사항, 조치방안 체크박스</li>
                      <li>조치확인일자 및 최종 확인자 서명란</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-700">
                    <FileText className="w-4 h-4" />
                    <span>A4 고화질 PDF 다운로드</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Printer className="w-4 h-4" />
                    <span>프린터 직접 인쇄 지원</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: 관리 탭 및 사진 수정/삭제 */}
          {(activeCategory === 'all' || activeCategory === 'admin') && (
            <div className="space-y-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  5
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  관리자 전용 탭 (문서 수정 시 사진 추가/삭제/자동최적화)
                </h4>
              </div>

              <div className="space-y-3 pl-1">
                <div>
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>관리자 인증 (기본 비밀번호: admin1234)</span>
                  </h5>
                  <p className="text-slate-600">
                    [관리] 탭 접근 시 보안 인증이 필요합니다. 초기 마스터 암호는 <code>admin1234</code> 또는 <code>daehan1234</code>이며, 우측 상단 <strong>[암호 변경]</strong> 버튼으로 관리자가 원하는 암호로 변경할 수 있습니다.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>문서 수정 시 사진 추가 및 삭제 (자동 최적화)</span>
                  </h5>
                  <p className="text-slate-600">
                    각 건의 <strong>[수정]</strong> 버튼을 누르면 부적합 등록 자료 수정 창이 열리며 사진에 대해 다음 작업을 지원합니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 pl-1">
                    <li>
                      <strong>사진 개별 삭제</strong>: 사진 썸네일 위의 붉은색 휴지통(<code>Trash2</code>) 아이콘을 클릭하여 원치 않는 사진을 즉시 삭제합니다.
                    </li>
                    <li>
                      <strong>신규 사진 추가</strong>: <code>[+ 증거사진 추가]</code> 또는 <code>[+ 완료사진 추가]</code>를 눌러 카메라 촬영 또는 갤러리에서 새 사진을 추가합니다.
                    </li>
                    <li>
                      <strong>실시간 자동 최적화</strong>: 추가되는 모든 사진은 Firestore 및 모바일 저장 용량을 고려하여 고화질을 유지한 채 <strong>자동 압축 최적화</strong>되어 등록됩니다.
                    </li>
                    <li>
                      <strong>사진 확대 검토</strong>: 돋보기 아이콘을 눌러 라이트박스에서 원본 화질을 확대 검토할 수 있습니다.
                    </li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>호선별·월별 품질 실적 분석 및 엑셀 다운로드</span>
                  </h5>
                  <p className="text-slate-600">
                    <strong>[실적 분석]</strong> 서브탭에서 매월 실적, 사용자 지정 기간, 전체 누적 데이터를 조회할 수 있으며, 유형별 점유율 그래프, 검사품목별 순위표, 엑셀 호환 CSV 다운로드 및 사내 공식 실적분석표(<code>DH-QA-ST-01</code>)의 A4 PDF 인쇄를 지원합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: FAQ & 모바일 팁 */}
          {(activeCategory === 'all' || activeCategory === 'faq') && (
            <div className="space-y-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  6
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  현장 모바일 팁 및 자주 묻는 질문 (FAQ)
                </h4>
              </div>

              <div className="space-y-3 pl-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-900">
                    Q1. 스마트폰 바탕화면에 앱 아이콘을 추가할 수 있나요?
                  </span>
                  <p className="text-slate-600">
                    A. 네! Chrome 또는 Safari 브라우저 메뉴에서 <strong>[홈 화면에 추가]</strong> 또는 <strong>[앱 설치]</strong>를 선택하면 스마트폰 바탕화면에 대한정공 품질관리 아이콘이 생성되어 일반 앱처럼 즉시 실행할 수 있습니다.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-900">
                    Q2. 사진을 많이 등록하면 앱이 느려지거나 저장 용량이 부족하지 않나요?
                  </span>
                  <p className="text-slate-600">
                    A. 걱정하지 않으셔도 됩니다. 본 시스템은 고해상도 사진을 자동으로 800px 해상도로 압축 최적화(장당 약 70~90KB)하며, 대용량 무제한 IndexedDB 저장소를 연동하여 수천 건 이상의 데이터도 빠르고 안전하게 보존합니다.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-900">
                    Q3. 현장에서 카메라가 작동하지 않을 때는 어떻게 하나요?
                  </span>
                  <p className="text-slate-600">
                    A. 스마트폰 브라우저 설정에서 카메라 권한이 '차단'되어 있는지 확인하시고 '허용'으로 변경해 주십시오. 갤러리 선택을 통해서도 기기 카메라로 찍어둔 사진을 즉시 올릴 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            주식회사 대한정공 품질경영부 (Quality Control Team)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer ml-auto"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
