export type ActionPlan = '반품' | '재작업' | '특채' | '용도변경' | '폐기' | '';

export interface NonconformityRecord {
  _rowIndex: number;
  id: string; // DHQ-0001 형식
  registeredAt: string; // 등록일시 (YYYY-MM-DD HH:mm:ss)
  shipNo: string; // 숫자 4자리
  inspectionLocation?: string; // 검사장소 (본사, 1공장, 2공장, 온산공장, 대원, 신라 등)
  inspectionDate: string; // YYYY-MM-DD
  registrar: string; // 등록자
  inspectionItems: string[]; // 검사품목_검사항목 다중선택
  nonconformityTypes: string[]; // 부적합유형 다중선택
  detailContent: string; // 부적합상세내용
  evidencePhotos: string[]; // 증거사진1~4 (최소 1장 필수, 최대 4장)
  status: '진행중' | '완료'; // 상태
  forwardedDate: string; // 전달완료일자
  assignedManager: string; // 진행담당자
  managerEmail: string; // 진행담당자이메일
  checker: string; // 확인자
  completedDate: string; // 완료일자
  completedPhotos: string[]; // 완료증거사진1~4 (최소 1장 필수)
  specialNotes: string; // 특이사항
  causeAnalysis: string; // 원인파악
  actionPlan: ActionPlan; // 조치방안
}

export const DEFAULT_LOCATIONS = [
  '본사',
  '1공장',
  '2공장',
  '온산공장',
  '대원',
  '신라',
];

export const DEFAULT_REGISTRARS = ['하대기', '최윤섭', '허성렬', '공병관'];

export const DEFAULT_INSPECTION_ITEMS = [
  'CS PIPE SPOOL VISUAL',
  'CS PIPE SPOOL HYD',
  'SUS PIPE SPOOL VISUAL',
  'SUS PIPE SPOOL HYD',
  'SKID N2 TEST',
  'SKID ALIGNMENT',
  'SKID FINAL',
  'ER UNIT FINAL',
  'PAINT',
];

export const DEFAULT_NONCONFORMITY_TYPES = [
  'WELDING',
  'PAINT',
  'ASSEMBLE',
  'MIS ALIGN',
  'VISUAL',
  'LEAK',
  'MATERIAL',
  'DESIGN',
];

export const ACTION_PLAN_OPTIONS: ActionPlan[] = ['반품', '재작업', '특채', '용도변경', '폐기'];
