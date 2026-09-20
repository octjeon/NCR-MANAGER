import React from 'react';
import { NonconformityRecord, ActionPlan } from '../types';

interface ReportPDFViewProps {
  record: NonconformityRecord;
  id?: string;
  isPrintMode?: boolean;
}

export const ReportPDFView: React.FC<ReportPDFViewProps> = ({
  record,
  id = 'daehan-report-pdf-target',
  isPrintMode = false,
}) => {
  // Helper for action plan check boxes (checkbox on the right of text per DH-QP-870-01 spec)
  const renderActionBox = (label: string, valueToMatch: ActionPlan) => {
    const isChecked = record.actionPlan === valueToMatch;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        <span>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{isChecked ? '■' : '□'}</span>
      </span>
    );
  };

  // Format ship number to contain digits only (e.g. '1234')
  const formatShipNo = (val?: string) => {
    if (!val) return '';
    const digits = val.replace(/[^0-9]/g, '');
    return digits || val;
  };

  // Format inspection date to 'YYYY년 MM월 DD일' format per spec
  const formatInspectionDate = (val?: string) => {
    if (!val) return '';
    const clean = val.trim();
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length === 8) {
      const y = digitsOnly.substring(0, 4);
      const m = digitsOnly.substring(4, 6);
      const d = digitsOnly.substring(6, 8);
      return `${y}년 ${m}월 ${d}일`;
    }
    const match = clean.match(/^(\d{4})[-./년\s]?\s*(\d{1,2})[-./월\s]?\s*(\d{1,2})[일\s]?/);
    if (match) {
      const y = match[1];
      const m = match[2].padStart(2, '0');
      const d = match[3].padStart(2, '0');
      return `${y}년 ${m}월 ${d}일`;
    }
    return val;
  };

  // Header background per official DH-QP-870-01 style
  const headerBg = '#f0f0f0';

  return (
    <div
      id={id}
      style={{
        width: '794px', // Standard A4 width at 96 DPI (210mm)
        minHeight: '1120px', // Standard A4 height at 96 DPI (297mm)
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Pretendard', sans-serif",
        padding: '36px 40px',
        boxSizing: 'border-box',
        margin: '0 auto',
        lineHeight: 1.3,
        fontSize: '11.5px',
      }}
    >
      {/* Top Header Section */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: 'none',
          marginBottom: '2px',
        }}
      >
        <tbody>
          <tr>
            {/* Left: DAEHAN Logo Stack */}
            <td style={{ width: '190px', verticalAlign: 'top', padding: '0 0 2px 0' }}>
              <div style={{ lineHeight: 1.15, fontFamily: 'Arial, sans-serif' }}>
                <div
                  style={{
                    fontSize: '25px',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    color: '#000000',
                  }}
                >
                  DAEHAN
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#111111',
                    marginTop: '2px',
                  }}
                >
                  Precision &amp;
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#111111',
                  }}
                >
                  Industries
                </div>
              </div>
            </td>

            {/* Center: Document Title */}
            <td
              style={{
                verticalAlign: 'middle',
                textAlign: 'center',
                padding: '0 8px',
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: '26px',
                  fontWeight: 900,
                  letterSpacing: '10px',
                  color: '#000000',
                  textIndent: '10px',
                  whiteSpace: 'nowrap',
                }}
              >
                부 적 합 &nbsp; 보 고 서
              </h1>
            </td>

            {/* Right: 2x4 Approval Signature Box (결재란) */}
            <td style={{ width: '220px', verticalAlign: 'top', textAlign: 'right', padding: 0 }}>
              <table
                style={{
                  width: '210px',
                  marginLeft: 'auto',
                  borderCollapse: 'collapse',
                  border: '1px solid #000000',
                  fontSize: '11px',
                  textAlign: 'center',
                }}
              >
                <tbody>
                  {/* Row 1: Headers (2x4 table: 1 label spanning 2 rows, 3 column headers) */}
                  <tr>
                    <td
                      rowSpan={2}
                      style={{
                        width: '30px',
                        backgroundColor: headerBg,
                        border: '1px solid #000000',
                        fontWeight: 'bold',
                        padding: '4px 1px',
                        lineHeight: 1.35,
                        verticalAlign: 'middle',
                        letterSpacing: '2px',
                        textIndent: '2px',
                      }}
                    >
                      결<br />재
                    </td>
                    <td
                      style={{
                        width: '60px',
                        backgroundColor: headerBg,
                        border: '1px solid #000000',
                        fontWeight: 'bold',
                        padding: '4px 0',
                        letterSpacing: '4px',
                        textIndent: '4px',
                      }}
                    >
                      작 성
                    </td>
                    <td
                      style={{
                        width: '60px',
                        backgroundColor: headerBg,
                        border: '1px solid #000000',
                        fontWeight: 'bold',
                        padding: '4px 0',
                        letterSpacing: '4px',
                        textIndent: '4px',
                      }}
                    >
                      검 토
                    </td>
                    <td
                      style={{
                        width: '60px',
                        backgroundColor: headerBg,
                        border: '1px solid #000000',
                        fontWeight: 'bold',
                        padding: '4px 0',
                        letterSpacing: '4px',
                        textIndent: '4px',
                      }}
                    >
                      승 인
                    </td>
                  </tr>

                  {/* Row 2: Signatures Area */}
                  <tr>
                    <td
                      style={{
                        height: '48px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #000000',
                        verticalAlign: 'bottom',
                        fontSize: '10px',
                        color: '#333333',
                        padding: '2px',
                        textAlign: 'center',
                      }}
                    >
                      {record.registrar || ''}
                    </td>
                    <td
                      style={{
                        height: '48px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #000000',
                        verticalAlign: 'bottom',
                        fontSize: '10px',
                        color: '#333333',
                        padding: '2px',
                        textAlign: 'center',
                      }}
                    >
                      {record.checker || ''}
                    </td>
                    <td
                      style={{
                        height: '48px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #000000',
                        padding: '2px',
                      }}
                    ></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Serial Number (발행번호) - Aligned to the right edge */}
      <div
        style={{
          textAlign: 'right',
          fontSize: '12px',
          fontWeight: 'bold',
          marginTop: '6px',
          marginBottom: '4px',
          letterSpacing: '1px',
          color: '#000000',
        }}
      >
        발행번호 : {record.id || ''}
      </div>

      {/* Main Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1.5px solid #000000',
          fontSize: '11px',
          marginBottom: '8px',
        }}
      >
        <tbody>
          {/* Row 1: 호선 | 검사일자 */}
          <tr>
            <td
              style={{
                width: '18%',
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '12px',
                textIndent: '12px',
              }}
            >
              호 선
            </td>
            <td
              style={{
                width: '32%',
                border: '1px solid #000000',
                padding: '6px 10px',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {formatShipNo(record.shipNo)}
            </td>
            <td
              style={{
                width: '18%',
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '3px',
                textIndent: '3px',
              }}
            >
              검사일자
            </td>
            <td
              style={{
                width: '32%',
                border: '1px solid #000000',
                padding: '6px 8px',
                textAlign: 'center',
              }}
            >
              {formatInspectionDate(record.inspectionDate)}
            </td>
          </tr>

          {/* Row 2: 검사항목 | 등록자 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '4px',
                textIndent: '4px',
              }}
            >
              검 사 항 목
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 10px',
              }}
            >
              {record.inspectionItems ? record.inspectionItems.join(', ') : ''}
            </td>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '10px',
                textIndent: '10px',
              }}
            >
              등 록 자
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 8px',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {record.registrar || ''}
            </td>
          </tr>

          {/* Row 3: 부적합내용 | 상태 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '2px',
                textIndent: '2px',
              }}
            >
              부적합내용
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 10px',
                fontWeight: 600,
              }}
            >
              {record.nonconformityTypes ? record.nonconformityTypes.join(', ') : ''}
            </td>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '12px',
                textIndent: '12px',
              }}
            >
              상 태
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 8px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#000000',
              }}
            >
              {record.status || '진행중'}
            </td>
          </tr>

          {/* Row 4: 진행담당자 | 전달완료일 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '2px',
                textIndent: '2px',
              }}
            >
              진행담당자
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 10px',
              }}
            >
              {record.assignedManager || ''}
            </td>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '2px',
                textIndent: '2px',
              }}
            >
              전달완료일
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 8px',
                textAlign: 'center',
              }}
            >
              {record.forwardedDate || ''}
            </td>
          </tr>

          {/* Row 5: 확인자 | 완료일자 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '10px',
                textIndent: '10px',
              }}
            >
              확 인 자
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 10px',
              }}
            >
              {record.checker || ''}
            </td>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '3px',
                textIndent: '3px',
              }}
            >
              완료일자
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 8px',
                textAlign: 'center',
              }}
            >
              {record.completedDate || ''}
            </td>
          </tr>

          {/* Row 6: 세부내역 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '12px 4px',
                letterSpacing: '5px',
                textIndent: '5px',
                verticalAlign: 'middle',
              }}
            >
              세 부 내 역
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #000000',
                padding: '10px 12px',
                whiteSpace: 'pre-wrap',
                height: '150px',
                verticalAlign: 'top',
                lineHeight: 1.6,
                fontSize: '11px',
              }}
            >
              {record.detailContent || ''}
            </td>
          </tr>

          {/* Row 7: 부적합사진 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '12px 4px',
                letterSpacing: '4px',
                textIndent: '4px',
                verticalAlign: 'middle',
              }}
            >
              부 적 합 사 진
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #000000',
                padding: '6px 8px',
                height: '155px',
                verticalAlign: 'middle',
                backgroundColor: '#ffffff',
              }}
            >
              {record.evidencePhotos && record.evidencePhotos.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    height: '100%',
                  }}
                >
                  {record.evidencePhotos.slice(0, 4).map((photoUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        maxWidth: '25%',
                        height: '140px',
                        border: '1px solid #cccccc',
                        backgroundColor: '#f8fafc',
                        padding: '2px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={photoUrl}
                        alt={`부적합 사진 ${idx + 1}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '115px',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '9px',
                          color: '#475569',
                          marginTop: '2px',
                          textAlign: 'center',
                        }}
                      >
                        사진 #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height: '140px' }} />
              )}
            </td>
          </tr>

          {/* Row 8: 완료사진 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '12px 4px',
                letterSpacing: '8px',
                textIndent: '8px',
                verticalAlign: 'middle',
              }}
            >
              완 료 사 진
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #000000',
                padding: '6px 8px',
                height: '155px',
                verticalAlign: 'middle',
                backgroundColor: '#ffffff',
              }}
            >
              {record.completedPhotos && record.completedPhotos.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    height: '100%',
                  }}
                >
                  {record.completedPhotos.slice(0, 4).map((photoUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        maxWidth: '25%',
                        height: '140px',
                        border: '1px solid #cccccc',
                        backgroundColor: '#f8fafc',
                        padding: '2px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={photoUrl}
                        alt={`완료 사진 ${idx + 1}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '115px',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '9px',
                          color: '#15803d',
                          marginTop: '2px',
                          textAlign: 'center',
                          fontWeight: 600,
                        }}
                      >
                        조치완료 #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height: '140px' }} />
              )}
            </td>
          </tr>

          {/* Row 9: 원인파악 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 4px',
                letterSpacing: '5px',
                textIndent: '5px',
                verticalAlign: 'middle',
              }}
            >
              원 인 파 악
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #000000',
                padding: '8px 12px',
                whiteSpace: 'pre-wrap',
                verticalAlign: 'top',
                height: '42px',
              }}
            >
              {record.causeAnalysis || ''}
            </td>
          </tr>

          {/* Row 10: 특이사항 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 4px',
                letterSpacing: '5px',
                textIndent: '5px',
                verticalAlign: 'middle',
              }}
            >
              특 이 사 항
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #000000',
                padding: '8px 12px',
                whiteSpace: 'pre-wrap',
                verticalAlign: 'top',
                height: '42px',
              }}
            >
              {record.specialNotes || ''}
            </td>
          </tr>

          {/* Row 11: 조치방안 (반품 □  재작업 □  특 채 □  용도변경 □  폐기 ■) */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '5px',
                textIndent: '5px',
                verticalAlign: 'middle',
              }}
            >
              조 치 방 안
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #000000',
                padding: '6px 18px',
                fontSize: '11px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  width: '100%',
                }}
              >
                {renderActionBox('반품', '반품')}
                {renderActionBox('재작업', '재작업')}
                {renderActionBox('특 채', '특채')}
                {renderActionBox('용도변경', '용도변경')}
                {renderActionBox('폐기', '폐기')}
              </div>
            </td>
          </tr>

          {/* Row 12: 재검사결과 / 최종처리 이행 */}
          <tr>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '2px',
                textIndent: '2px',
                verticalAlign: 'middle',
              }}
            >
              재검사결과
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '24px',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span>합격</span>
                  <span style={{ fontSize: '13px' }}>{record.status === '완료' ? '■' : '□'}</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span>불합격</span>
                  <span style={{ fontSize: '13px' }}>□</span>
                </span>
              </div>
            </td>
            <td
              style={{
                backgroundColor: headerBg,
                border: '1px solid #000000',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '4px 2px',
                letterSpacing: '2px',
                lineHeight: 1.25,
                verticalAlign: 'middle',
              }}
            >
              최종처리<br />이 &nbsp; 행
            </td>
            <td
              style={{
                border: '1px solid #000000',
                padding: '6px 12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '24px',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span>필요</span>
                  <span style={{ fontSize: '13px' }}>□</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <span>불필요</span>
                  <span style={{ fontSize: '13px' }}>
                    {record.status === '완료' ? '■' : '□'}
                  </span>
                </span>
              </div>
            </td>
          </tr>

          {/* Row 13: 일자 기재란 (작성일자 / 검토일자 / 승인일자) */}
          <tr>
            <td
              colSpan={4}
              style={{
                border: '1px solid #000000',
                padding: '8px 24px',
                fontSize: '11px',
                color: '#000000',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <span>작성일자 : &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span>
                <span>검토일자 : &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span>
                <span>승인일자 : &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer (3-column Table Layout per DH-QP-870-01 (Rev.0) Spec) */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: 'none',
          marginTop: '6px',
          fontSize: '11px',
          color: '#000000',
        }}
      >
        <tbody>
          <tr>
            <td style={{ width: '33.3%', textAlign: 'left', padding: 0 }}>
              DH-QP-870-01 (Rev.0)
            </td>
            <td
              style={{
                width: '33.3%',
                textAlign: 'center',
                fontWeight: 'bold',
                letterSpacing: '2px',
                padding: 0,
              }}
            >
              주식회사 대한정공
            </td>
            <td style={{ width: '33.3%', textAlign: 'right', padding: 0 }}>
              A4(210X297)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
