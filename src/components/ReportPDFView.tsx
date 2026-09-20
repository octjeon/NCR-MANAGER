import React from 'react';
import { NonconformityRecord } from '../types';

interface ReportPDFViewProps {
  record: NonconformityRecord;
  id?: string;
}

export const ReportPDFView: React.FC<ReportPDFViewProps> = ({ record, id = 'daehan-report-pdf-target' }) => {
  const actionPlanBox = (name: string) => {
    return record.actionPlan === name ? `■ ${name}` : `□ ${name}`;
  };

  return (
    <div
      id={id}
      style={{
        width: '794px', // A4 width at 96dpi (210mm)
        minHeight: '1120px', // A4 height at 96dpi (297mm)
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: "'Pretendard', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
        padding: '36px 40px',
        boxSizing: 'border-box',
        margin: '0 auto',
        lineHeight: 1.4,
        fontSize: '12px',
      }}
    >
      {/* Top Header Section */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: 'none',
          marginBottom: '6px',
        }}
      >
        <tbody>
          <tr>
            {/* Left: Logo Stack */}
            <td style={{ width: '180px', verticalAlign: 'top', padding: 0 }}>
              <div style={{ lineHeight: 1.1 }}>
                <span
                  style={{
                    fontSize: '26px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    color: '#0f172a',
                    display: 'block',
                  }}
                >
                  DAEHAN
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'block',
                    marginTop: '2px',
                  }}
                >
                  Precision &amp;
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'block',
                  }}
                >
                  Industries
                </span>
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
                  fontSize: '24px',
                  fontWeight: 900,
                  letterSpacing: '14px',
                  color: '#000000',
                  textIndent: '14px', // compensate letter-spacing centering
                }}
              >
                부 적 합 보 고 서
              </h1>
            </td>

            {/* Right: Approval Box (결재란) */}
            <td style={{ width: '220px', verticalAlign: 'top', textAlign: 'right', padding: 0 }}>
              <table
                style={{
                  width: '210px',
                  marginLeft: 'auto',
                  borderCollapse: 'collapse',
                  border: '1px solid #333333',
                  fontSize: '11px',
                  textAlign: 'center',
                }}
              >
                <tbody>
                  <tr>
                    <td
                      rowSpan={2}
                      style={{
                        width: '28px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #333333',
                        fontWeight: 'bold',
                        padding: '4px 2px',
                        lineHeight: 1.3,
                      }}
                    >
                      결<br />재
                    </td>
                    <td
                      style={{
                        width: '60px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #333333',
                        fontWeight: 'bold',
                        padding: '4px 0',
                      }}
                    >
                      작 성
                    </td>
                    <td
                      style={{
                        width: '60px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #333333',
                        fontWeight: 'bold',
                        padding: '4px 0',
                      }}
                    >
                      검 토
                    </td>
                    <td
                      style={{
                        width: '60px',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #333333',
                        fontWeight: 'bold',
                        padding: '4px 0',
                      }}
                    >
                      승 인
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        height: '46px',
                        border: '1px solid #333333',
                        verticalAlign: 'bottom',
                        fontSize: '10px',
                        color: '#666666',
                        padding: '2px',
                      }}
                    >
                      {record.registrar ? record.registrar : ''}
                    </td>
                    <td
                      style={{
                        height: '46px',
                        border: '1px solid #333333',
                        verticalAlign: 'bottom',
                        fontSize: '10px',
                        color: '#666666',
                        padding: '2px',
                      }}
                    >
                      {record.checker ? record.checker : ''}
                    </td>
                    <td
                      style={{
                        height: '46px',
                        border: '1px solid #333333',
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

      {/* Serial Number (발행번호) */}
      <div
        style={{
          textAlign: 'right',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '6px',
          letterSpacing: '1px',
        }}
      >
        발행번호 : {record.id}
      </div>

      {/* Main Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #333333',
          fontSize: '11px',
          marginBottom: '10px',
        }}
      >
        <tbody>
          {/* Row 1: 호선 | 검사일자 */}
          <tr>
            <td
              style={{
                width: '14%',
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '6px',
                textIndent: '6px',
              }}
            >
              호 선
            </td>
            <td
              style={{
                width: '36%',
                border: '1px solid #333333',
                padding: '6px 8px',
                fontWeight: 600,
              }}
            >
              {record.shipNo} 호선
            </td>
            <td
              style={{
                width: '14%',
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
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
                width: '36%',
                border: '1px solid #333333',
                padding: '6px 8px',
              }}
            >
              {record.inspectionDate}
            </td>
          </tr>

          {/* Row 2: 검사항목 | 등록자 */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '3px',
                textIndent: '3px',
              }}
            >
              검사항목
            </td>
            <td
              style={{
                border: '1px solid #333333',
                padding: '6px 8px',
              }}
            >
              {record.inspectionItems.join(', ')}
            </td>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '6px',
                textIndent: '6px',
              }}
            >
              등 록 자
            </td>
            <td
              style={{
                border: '1px solid #333333',
                padding: '6px 8px',
                fontWeight: 600,
              }}
            >
              {record.registrar}
            </td>
          </tr>

          {/* Row 3: 부적합내용 | 상태 */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
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
                border: '1px solid #333333',
                padding: '6px 8px',
                fontWeight: 600,
              }}
            >
              {record.nonconformityTypes.join(', ')}
            </td>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '6px',
                textIndent: '6px',
              }}
            >
              상 태
            </td>
            <td
              style={{
                border: '1px solid #333333',
                padding: '6px 8px',
                fontWeight: 'bold',
                color: record.status === '완료' ? '#047857' : '#1d4ed8',
              }}
            >
              {record.status}
            </td>
          </tr>

          {/* Row 4: 진행담당자 | 전달완료일 */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
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
                border: '1px solid #333333',
                padding: '6px 8px',
              }}
            >
              {record.assignedManager || '-'}
              {record.managerEmail ? ` (${record.managerEmail})` : ''}
            </td>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
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
                border: '1px solid #333333',
                padding: '6px 8px',
              }}
            >
              {record.forwardedDate || '-'}
            </td>
          </tr>

          {/* Row 5: 확인자 | 완료일자 */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '6px 4px',
                letterSpacing: '6px',
                textIndent: '6px',
              }}
            >
              확 인 자
            </td>
            <td
              style={{
                border: '1px solid #333333',
                padding: '6px 8px',
              }}
            >
              {record.checker || '-'}
            </td>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
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
                border: '1px solid #333333',
                padding: '6px 8px',
              }}
            >
              {record.completedDate || '-'}
            </td>
          </tr>

          {/* Row 6: 세부내역 (전체 폭, 여러 줄) */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '10px 4px',
                letterSpacing: '3px',
                textIndent: '3px',
              }}
            >
              세부내역
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #333333',
                padding: '10px 12px',
                whiteSpace: 'pre-wrap',
                minHeight: '60px',
                verticalAlign: 'top',
                lineHeight: 1.5,
              }}
            >
              {record.detailContent || '내용 없음'}
            </td>
          </tr>

          {/* Row 7: 부적합 사진 (전체 폭, 사진 최대 4장 그리드로 삽입) */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 4px',
                letterSpacing: '2px',
                textIndent: '2px',
              }}
            >
              부적합 사진
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #333333',
                padding: '8px',
                backgroundColor: '#fafafa',
              }}
            >
              {record.evidencePhotos && record.evidencePhotos.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                  <tbody>
                    <tr>
                      {record.evidencePhotos.slice(0, 4).map((photoUrl, idx) => (
                        <td
                          key={idx}
                          style={{
                            width: `${100 / Math.min(record.evidencePhotos.length, 4)}%`,
                            padding: '4px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                          }}
                        >
                          <div
                            style={{
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              padding: '2px',
                              borderRadius: '2px',
                            }}
                          >
                            <img
                              src={photoUrl}
                              alt={`부적합 증거 ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '110px',
                                objectFit: 'contain',
                                display: 'block',
                                margin: '0 auto',
                              }}
                            />
                            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                              [사진 {idx + 1}] 부적합 현장
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>사진 없음</div>
              )}
            </td>
          </tr>

          {/* Row 8: 완료 사진 (전체 폭, 사진 최대 4장 그리드로 삽입) */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 4px',
                letterSpacing: '2px',
                textIndent: '2px',
              }}
            >
              완료 사진
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #333333',
                padding: '8px',
                backgroundColor: '#fafafa',
              }}
            >
              {record.completedPhotos && record.completedPhotos.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                  <tbody>
                    <tr>
                      {record.completedPhotos.slice(0, 4).map((photoUrl, idx) => (
                        <td
                          key={idx}
                          style={{
                            width: `${100 / Math.min(record.completedPhotos.length, 4)}%`,
                            padding: '4px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                          }}
                        >
                          <div
                            style={{
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              padding: '2px',
                              borderRadius: '2px',
                            }}
                          >
                            <img
                              src={photoUrl}
                              alt={`완료 증거 ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '110px',
                                objectFit: 'contain',
                                display: 'block',
                                margin: '0 auto',
                              }}
                            />
                            <div style={{ fontSize: '9px', color: '#047857', marginTop: '2px' }}>
                              [완료 {idx + 1}] 조치 후
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                  {record.status === '완료' ? '등록된 완료 사진 없음' : '진행중 (완료 사진 미등록)'}
                </div>
              )}
            </td>
          </tr>

          {/* Row 9: 원인파악 (전체 폭) */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 4px',
                letterSpacing: '3px',
                textIndent: '3px',
              }}
            >
              원인파악
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #333333',
                padding: '8px 12px',
                whiteSpace: 'pre-wrap',
                verticalAlign: 'top',
              }}
            >
              {record.causeAnalysis || '-'}
            </td>
          </tr>

          {/* Row 10: 특이사항 (전체 폭) */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 4px',
                letterSpacing: '3px',
                textIndent: '3px',
              }}
            >
              특이사항
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #333333',
                padding: '8px 12px',
                whiteSpace: 'pre-wrap',
                verticalAlign: 'top',
              }}
            >
              {record.specialNotes || '-'}
            </td>
          </tr>

          {/* Row 11: 조치방안 */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 4px',
                letterSpacing: '3px',
                textIndent: '3px',
              }}
            >
              조치방안
            </td>
            <td
              colSpan={3}
              style={{
                border: '1px solid #333333',
                padding: '8px 14px',
                fontSize: '11px',
                letterSpacing: '1px',
              }}
            >
              {actionPlanBox('반품')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {actionPlanBox('재작업')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {actionPlanBox('특채')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {actionPlanBox('용도변경')}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {actionPlanBox('폐기')}
            </td>
          </tr>

          {/* Row 12: 재검사결과 / 최종처리 이행 */}
          <tr>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 4px',
                letterSpacing: '1px',
              }}
            >
              재검사결과
            </td>
            <td
              style={{
                border: '1px solid #333333',
                padding: '8px 12px',
              }}
            >
              합격 □&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;불합격 □
            </td>
            <td
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #333333',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '8px 4px',
                letterSpacing: '1px',
              }}
            >
              최종처리 이행
            </td>
            <td
              style={{
                border: '1px solid #333333',
                padding: '8px 12px',
              }}
            >
              필요 □&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;불필요 □
            </td>
          </tr>

          {/* Row 13: 일자 기재란 */}
          <tr>
            <td
              colSpan={4}
              style={{
                border: '1px solid #333333',
                padding: '10px 16px',
                textAlign: 'center',
                fontSize: '11px',
                letterSpacing: '1.5px',
                color: '#374151',
              }}
            >
              작성일자 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              검토일자 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              승인일자 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer (3-column Table Layout per Spec) */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: 'none',
          marginTop: '12px',
          fontSize: '11px',
          color: '#4b5563',
          fontWeight: 500,
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
                color: '#111827',
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
