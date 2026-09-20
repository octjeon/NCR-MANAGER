import React, { useState } from 'react';
import { X, Mail, Copy, Check, ExternalLink, AlertCircle, FileText } from 'lucide-react';
import { NonconformityRecord } from '../types';

interface EmailConfirmModalProps {
  record: NonconformityRecord;
  isOpen: boolean;
  onClose: () => void;
  onSaveEmail?: (newEmail: string) => void;
  onGeneratePDF?: () => void;
}

export const EmailConfirmModal: React.FC<EmailConfirmModalProps> = ({
  record,
  isOpen,
  onClose,
  onSaveEmail,
  onGeneratePDF,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(record.managerEmail || '');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(recipientEmail.trim());

  const subject = `[부적합 보고서] ${record.id} / 호선 ${record.shipNo} / ${record.nonconformityTypes.join(', ')}`;

  const body = `[부적합 보고서 송부 안내]

주식회사 대한정공 품질관리팀에서 등록된 조선업 호선별 부적합(불량) 보고서를 송부드립니다.
상세 내용은 첨부된 공식 보고서(DH-QP-870-01) PDF를 확인하여 주시기 바랍니다.

■ 부적합 요약 정보
- 발행번호: ${record.id}
- 대상호선: ${record.shipNo}호선
- 검사일자: ${record.inspectionDate}
- 검사항목: ${record.inspectionItems.join(', ')}
- 부적합유형: ${record.nonconformityTypes.join(', ')}
- 등 록 자: ${record.registrar}
- 진행담당자: ${record.assignedManager || '(미지정)'}
- 전달완료일: ${record.forwardedDate || '(미지정)'}
- 현재상태: ${record.status}

■ 세부 내역
${record.detailContent || '(내용 없음)'}

■ 특이사항
${record.specialNotes || '(특이사항 없음)'}

--------------------------------------------------
※ 본 메일은 DAEHAN Precision & Industries 부적합 관리 시스템에서 생성되었습니다.`;

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleSendMail = () => {
    if (!isEmailValid) return;
    if (onSaveEmail && recipientEmail !== record.managerEmail) {
      onSaveEmail(recipientEmail.trim());
    }

    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail.trim())}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
    }, 4000);
  };

  return (
    <div
      id="email-confirm-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">보고서 메일 발송</h3>
              <p className="text-xs text-slate-500">진행담당자에게 부적합 보고서 내역을 전달합니다</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
          {/* Recipient Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              수신자 이메일 (진행담당자) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="recipient-email-input"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="예: manager@daehan-pi.co.kr"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
                  isEmailValid
                    ? 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                    : 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30'
                }`}
              />
            </div>
            {!isEmailValid && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> 유효한 이메일 주소 형식을 입력해주세요.
              </p>
            )}
          </div>

          {/* Subject Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700">메일 제목</span>
              <button
                type="button"
                onClick={handleCopySubject}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                {copiedSubject ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> 복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> 제목 복사
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-100 text-xs font-mono text-slate-800 break-all select-all border border-slate-200">
              {subject}
            </div>
          </div>

          {/* Body Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700">메일 본문 미리보기</span>
              <button
                type="button"
                onClick={handleCopyBody}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                {copiedBody ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> 복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> 본문 복사
                  </>
                )}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto border border-slate-200 leading-relaxed">
              {body}
            </div>
          </div>

          {/* PDF attachment notification */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">공식 PDF 보고서 첨부 안내</p>
              <p className="text-blue-800">
                메일 프로그램 발송 시 먼저 <strong>[보고서 PDF 출력]</strong> 버튼으로 A4 보고서를 다운로드 후 첨부파일로 추가하시기 바랍니다.
              </p>
              {onGeneratePDF && (
                <button
                  type="button"
                  onClick={onGeneratePDF}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded border border-blue-300 hover:bg-blue-100/50"
                >
                  <FileText className="w-3.5 h-3.5" /> 지금 PDF 바로 다운로드
                </button>
              )}
            </div>
          </div>

          {sentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>메일 클라이언트가 호출되었습니다.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            id="send-email-confirm-btn"
            onClick={handleSendMail}
            disabled={!isEmailValid}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> 메일 발송 실행
          </button>
        </div>
      </div>
    </div>
  );
};
