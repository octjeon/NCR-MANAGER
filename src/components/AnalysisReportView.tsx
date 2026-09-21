import React from 'react';
import { NonconformityRecord } from '../types';

interface AnalysisReportViewProps {
  records: NonconformityRecord[];
  periodLabel: string;
  startDate?: string;
  endDate?: string;
  id?: string;
  analysisByType: Array<{
    name: string;
    count: number;
    completed: number;
    inProgress: number;
    percentage: number;
  }>;
  analysisByItem: Array<{
    name: string;
    count: number;
    completed: number;
    inProgress: number;
    percentage: number;
  }>;
  analysisByLocation: Array<{
    name: string;
    count: number;
    completed: number;
    inProgress: number;
    percentage: number;
  }>;
  analysisByShip: Array<{
    shipNo: string;
    count: number;
    percentage: number;
  }>;
}

export const AnalysisReportView: React.FC<AnalysisReportViewProps> = ({
  records,
  periodLabel,
  startDate,
  endDate,
  id = 'daehan-analysis-pdf-target',
  analysisByType,
  analysisByItem,
  analysisByLocation,
  analysisByShip,
}) => {
  const totalCount = records.length;
  const completedCount = records.filter((r) => r.status === '완료').length;
  const inProgressCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Action plan breakdown
  const actionPlanCounts: Record<string, number> = {
    '반품': 0,
    '재작업': 0,
    '특채': 0,
    '용도변경': 0,
    '폐기': 0,
    '미지정': 0,
  };
  records.forEach((r) => {
    if (r.actionPlan && actionPlanCounts[r.actionPlan] !== undefined) {
      actionPlanCounts[r.actionPlan] += 1;
    } else {
      actionPlanCounts['미지정'] += 1;
    }
  });

  const printDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const cellBorder = '1px solid #000000';
  const thBg = '#f2f2f2';

  return (
    <div
      id={id}
      style={{
        width: '794px', // A4 width at 96 DPI
        minHeight: '1120px',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Pretendard', sans-serif",
        padding: '32px 36px',
        boxSizing: 'border-box',
        margin: '0 auto',
        lineHeight: 1.35,
        fontSize: '11px',
      }}
    >
      {/* Top Document Form ID */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', color: '#555555', fontWeight: 'bold' }}>
          양식번호: DH-QA-ST-01 (Rev.0)
        </span>
        <span style={{ fontSize: '10px', color: '#555555' }}>
          출력일시: {printDate}
        </span>
      </div>

      {/* Main Title & Approvals Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: cellBorder,
          marginBottom: '10px',
        }}
      >
        <tbody>
          <tr>
            {/* Logo */}
            <td
              style={{
                width: '130px',
                padding: '8px 10px',
                textAlign: 'center',
                borderRight: cellBorder,
                verticalAlign: 'middle',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '1px', lineHeight: 1 }}>
                DAEHAN
              </div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '2px' }}>
                주식회사 대한정공
              </div>
            </td>

            {/* Document Title */}
            <td
              style={{
                padding: '8px 12px',
                textAlign: 'center',
                verticalAlign: 'middle',
              }}
            >
              <div style={{ fontSize: '19px', fontWeight: 900, letterSpacing: '0.5px' }}>
                호선별 부적합 품질 실적 분석표
              </div>
              <div style={{ fontSize: '10px', color: '#555555', marginTop: '2px', fontWeight: 600 }}>
                NONCONFORMITY QUALITY PERFORMANCE ANALYSIS REPORT
              </div>
            </td>

            {/* Approvals Stamp Box */}
            <td style={{ width: '195px', padding: 0, verticalAlign: 'top', borderLeft: cellBorder }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '10px' }}>
                <tbody>
                  <tr>
                    <td
                      rowSpan={2}
                      style={{
                        width: '24px',
                        backgroundColor: thBg,
                        borderRight: cellBorder,
                        fontWeight: 'bold',
                        padding: '4px 2px',
                      }}
                    >
                      결<br />재
                    </td>
                    <td style={{ width: '57px', padding: '3px 0', borderRight: cellBorder, borderBottom: cellBorder, fontWeight: 'bold' }}>
                      작 성
                    </td>
                    <td style={{ width: '57px', padding: '3px 0', borderRight: cellBorder, borderBottom: cellBorder, fontWeight: 'bold' }}>
                      검 토
                    </td>
                    <td style={{ width: '57px', padding: '3px 0', borderBottom: cellBorder, fontWeight: 'bold' }}>
                      승 인
                    </td>
                  </tr>
                  <tr>
                    <td style={{ height: '36px', borderRight: cellBorder }}></td>
                    <td style={{ height: '36px', borderRight: cellBorder }}></td>
                    <td style={{ height: '36px' }}></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Meta Information Bar */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: cellBorder,
          marginBottom: '12px',
          fontSize: '11px',
        }}
      >
        <tbody>
          <tr>
            <td style={{ width: '14%', backgroundColor: thBg, padding: '5px 8px', fontWeight: 'bold', borderRight: cellBorder, borderBottom: cellBorder }}>
              분석 대상 기간
            </td>
            <td style={{ width: '36%', padding: '5px 8px', borderRight: cellBorder, borderBottom: cellBorder, fontWeight: 'bold' }}>
              {periodLabel}
              {startDate && endDate && (
                <span style={{ fontSize: '10px', color: '#555555', marginLeft: '6px', fontWeight: 'normal' }}>
                  ({startDate} ~ {endDate})
                </span>
              )}
            </td>
            <td style={{ width: '14%', backgroundColor: thBg, padding: '5px 8px', fontWeight: 'bold', borderRight: cellBorder, borderBottom: cellBorder }}>
              주관 부서
            </td>
            <td style={{ width: '36%', padding: '5px 8px', borderBottom: cellBorder, fontWeight: 'bold' }}>
              품질경영본부 / 품질보증팀
            </td>
          </tr>
          <tr>
            <td style={{ backgroundColor: thBg, padding: '5px 8px', fontWeight: 'bold', borderRight: cellBorder }}>
              대상 데이터
            </td>
            <td style={{ padding: '5px 8px', borderRight: cellBorder }}>
              총 <strong>{totalCount}</strong>건 (호선 수: {analysisByShip.length}개)
            </td>
            <td style={{ backgroundColor: thBg, padding: '5px 8px', fontWeight: 'bold', borderRight: cellBorder }}>
              조치 완료율
            </td>
            <td style={{ padding: '5px 8px' }}>
              <span style={{ fontWeight: 'bold', color: completionRate >= 80 ? '#15803d' : '#b91c1c' }}>
                {completionRate}%
              </span>
              <span style={{ fontSize: '10px', color: '#555555', marginLeft: '6px' }}>
                (완료: {completedCount}건 / 진행중: {inProgressCount}건)
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section 1: 종합 실적 요약 (KPI & 조치방안 구분) */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>1. 종합 품질 실적 요약 (발행 및 조치 현황)</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: cellBorder, textAlign: 'center', fontSize: '10.5px' }}>
          <thead>
            <tr style={{ backgroundColor: thBg }}>
              <th style={{ border: cellBorder, padding: '4px', width: '20%' }}>구분</th>
              <th style={{ border: cellBorder, padding: '4px', width: '20%' }}>총 발행 건수</th>
              <th style={{ border: cellBorder, padding: '4px', width: '20%' }}>조치 완료</th>
              <th style={{ border: cellBorder, padding: '4px', width: '20%' }}>조치 진행중</th>
              <th style={{ border: cellBorder, padding: '4px', width: '20%' }}>조치 완료율</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: cellBorder, padding: '6px', fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                건수 및 비율
              </td>
              <td style={{ border: cellBorder, padding: '6px', fontWeight: 'bold', fontSize: '12px' }}>
                {totalCount} 건
              </td>
              <td style={{ border: cellBorder, padding: '6px', fontWeight: 'bold', color: '#15803d' }}>
                {completedCount} 건
              </td>
              <td style={{ border: cellBorder, padding: '6px', fontWeight: 'bold', color: inProgressCount > 0 ? '#b45309' : '#555555' }}>
                {inProgressCount} 건
              </td>
              <td style={{ border: cellBorder, padding: '6px', fontWeight: 'bold', fontSize: '12px' }}>
                {completionRate}%
              </td>
            </tr>
          </tbody>
        </table>

        {/* Action Plans Breakdown Sub-table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: cellBorder, textAlign: 'center', fontSize: '10px', marginTop: '4px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <th style={{ border: cellBorder, padding: '3px', width: '16%' }}>조치구분</th>
              <th style={{ border: cellBorder, padding: '3px', width: '14%' }}>반품</th>
              <th style={{ border: cellBorder, padding: '3px', width: '14%' }}>재작업</th>
              <th style={{ border: cellBorder, padding: '3px', width: '14%' }}>특채</th>
              <th style={{ border: cellBorder, padding: '3px', width: '14%' }}>용도변경</th>
              <th style={{ border: cellBorder, padding: '3px', width: '14%' }}>폐기</th>
              <th style={{ border: cellBorder, padding: '3px', width: '14%' }}>미지정</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: cellBorder, padding: '4px', fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                발생 건수 (점유율)
              </td>
              {(['반품', '재작업', '특채', '용도변경', '폐기', '미지정'] as const).map((plan) => {
                const count = actionPlanCounts[plan] || 0;
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                return (
                  <td key={plan} style={{ border: cellBorder, padding: '4px' }}>
                    <strong>{count}</strong>건
                    <span style={{ fontSize: '9px', color: '#666', display: 'block' }}>({pct}%)</span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 2: 부적합 유형별 발생 및 조치 실적 (상세 표) */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
          <span>2. 부적합 유형별 발생 및 조치 실적</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: cellBorder, textAlign: 'center', fontSize: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: thBg }}>
              <th style={{ border: cellBorder, padding: '4px', width: '8%' }}>순위</th>
              <th style={{ border: cellBorder, padding: '4px', width: '26%' }}>부적합 유형</th>
              <th style={{ border: cellBorder, padding: '4px', width: '14%' }}>발생 건수</th>
              <th style={{ border: cellBorder, padding: '4px', width: '14%' }}>점유율 (%)</th>
              <th style={{ border: cellBorder, padding: '4px', width: '12%' }}>조치완료</th>
              <th style={{ border: cellBorder, padding: '4px', width: '12%' }}>진행중</th>
              <th style={{ border: cellBorder, padding: '4px', width: '14%' }}>조치완료율</th>
            </tr>
          </thead>
          <tbody>
            {analysisByType.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ border: cellBorder, padding: '12px', color: '#666' }}>
                  해당 기간에 등록된 부적합 유형 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              analysisByType.map((item, idx) => {
                const itemRate = item.count > 0 ? Math.round((item.completed / item.count) * 100) : 0;
                return (
                  <tr key={item.name} style={{ backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                    <td style={{ border: cellBorder, padding: '3px' }}>{idx + 1}</td>
                    <td style={{ border: cellBorder, padding: '3px 6px', textAlign: 'left', fontWeight: 'bold' }}>
                      {item.name}
                    </td>
                    <td style={{ border: cellBorder, padding: '3px', fontWeight: 'bold' }}>
                      {item.count}
                    </td>
                    <td style={{ border: cellBorder, padding: '3px' }}>
                      {item.percentage}%
                    </td>
                    <td style={{ border: cellBorder, padding: '3px', color: '#15803d' }}>
                      {item.completed}
                    </td>
                    <td style={{ border: cellBorder, padding: '3px', color: item.inProgress > 0 ? '#b45309' : '#666' }}>
                      {item.inProgress}
                    </td>
                    <td style={{ border: cellBorder, padding: '3px', fontWeight: 'bold' }}>
                      {itemRate}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2-Column Section: 검사품목별 & 검사장소별 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        {/* Left: 검사품목 / 검사항목별 */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            <span>3. 검사품목별 발생 순위</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: cellBorder, textAlign: 'center', fontSize: '9.5px' }}>
            <thead>
              <tr style={{ backgroundColor: thBg }}>
                <th style={{ border: cellBorder, padding: '3px', width: '12%' }}>순위</th>
                <th style={{ border: cellBorder, padding: '3px', width: '46%' }}>검사 품목</th>
                <th style={{ border: cellBorder, padding: '3px', width: '22%' }}>발생 건수</th>
                <th style={{ border: cellBorder, padding: '3px', width: '20%' }}>점유율</th>
              </tr>
            </thead>
            <tbody>
              {analysisByItem.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ border: cellBorder, padding: '8px', color: '#666' }}>
                    데이터 없음
                  </td>
                </tr>
              ) : (
                analysisByItem.slice(0, 8).map((item, idx) => (
                  <tr key={item.name} style={{ backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                    <td style={{ border: cellBorder, padding: '2.5px' }}>{idx + 1}</td>
                    <td style={{ border: cellBorder, padding: '2.5px 4px', textAlign: 'left', fontWeight: 'bold' }}>
                      {item.name}
                    </td>
                    <td style={{ border: cellBorder, padding: '2.5px', fontWeight: 'bold' }}>
                      {item.count}건
                    </td>
                    <td style={{ border: cellBorder, padding: '2.5px' }}>
                      {item.percentage}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Right: 검사장소별 */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            <span>4. 검사장소별 발생 현황</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: cellBorder, textAlign: 'center', fontSize: '9.5px' }}>
            <thead>
              <tr style={{ backgroundColor: thBg }}>
                <th style={{ border: cellBorder, padding: '3px', width: '12%' }}>순위</th>
                <th style={{ border: cellBorder, padding: '3px', width: '46%' }}>검사 장소</th>
                <th style={{ border: cellBorder, padding: '3px', width: '22%' }}>발생 건수</th>
                <th style={{ border: cellBorder, padding: '3px', width: '20%' }}>점유율</th>
              </tr>
            </thead>
            <tbody>
              {analysisByLocation.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ border: cellBorder, padding: '8px', color: '#666' }}>
                    데이터 없음
                  </td>
                </tr>
              ) : (
                analysisByLocation.slice(0, 8).map((loc, idx) => (
                  <tr key={loc.name} style={{ backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                    <td style={{ border: cellBorder, padding: '2.5px' }}>{idx + 1}</td>
                    <td style={{ border: cellBorder, padding: '2.5px 4px', textAlign: 'left', fontWeight: 'bold' }}>
                      {loc.name}
                    </td>
                    <td style={{ border: cellBorder, padding: '2.5px', fontWeight: 'bold' }}>
                      {loc.count}건
                    </td>
                    <td style={{ border: cellBorder, padding: '2.5px' }}>
                      {loc.percentage}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: 주요 발생 호선 현황 */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
          <span>5. 주요 호선별 부적합 발생 현황</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: cellBorder, textAlign: 'center', fontSize: '9.5px' }}>
          <thead>
            <tr style={{ backgroundColor: thBg }}>
              {analysisByShip.slice(0, 8).map((ship, idx) => (
                <th key={ship.shipNo} style={{ border: cellBorder, padding: '3px' }}>
                  {ship.shipNo}호선
                </th>
              ))}
              {analysisByShip.length === 0 && (
                <th style={{ border: cellBorder, padding: '3px' }}>호선 데이터 없음</th>
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              {analysisByShip.slice(0, 8).map((ship) => (
                <td key={ship.shipNo} style={{ border: cellBorder, padding: '4px' }}>
                  <strong style={{ fontSize: '11px' }}>{ship.count}건</strong>
                  <span style={{ fontSize: '9px', color: '#666', display: 'block' }}>({ship.percentage}%)</span>
                </td>
              ))}
              {analysisByShip.length === 0 && (
                <td style={{ border: cellBorder, padding: '6px', color: '#666' }}>-</td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 6: 품질 중점 개선 및 특이사항 */}
      <div style={{ border: cellBorder, padding: '6px 10px', minHeight: '60px', marginBottom: '10px' }}>
        <div style={{ fontSize: '10.5px', fontWeight: 'bold', marginBottom: '3px' }}>
          [ 품질 중점 관리 사항 및 비고 ]
        </div>
        <div style={{ fontSize: '10px', color: '#444444', lineHeight: 1.45 }}>
          1. 주요 부적합 유형에 대한 작업 표준 준수 여부 및 원인 분석 결과에 따른 시정조치 이행 상태를 상시 점검함.<br />
          2. 진행 중인 건에 대하여 담당자별 완료 예정일을 준수하도록 독려하고 미결 건 발생을 방지함.
        </div>
      </div>

      {/* Document Footer */}
      <div
        style={{
          borderTop: '2px solid #000000',
          paddingTop: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          color: '#333333',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>
          주식회사 대한정공 품질경영시스템 (DAEHAN PRECISION CO., LTD.)
        </span>
        <span>
          조선업 호선별 부적합 품질 실적 분석표 (PAGE 1 / 1)
        </span>
      </div>
    </div>
  );
};
