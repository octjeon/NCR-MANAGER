# 대한정공 부적합 관리 시스템 (DAEHAN QC System)

주식회사 대한정공 조선/배관 품질관리 업무를 위한 **호선별 부적합 등록, 진행 관리 및 표준 부적합보고서(DH-QP-870-01) 발행 웹 애플리케이션**입니다.

---

## 📌 주요 기능

### 1. 신규 부적합 등록 (단계별 마법사)
- **1단계 (기본정보)**: 호선번호(숫자 자동 변환), 검사일자, 등록자 선택 및 신규 등록자 즉시 추가
- **2단계 (검사항목 & 유형)**: CS/SUS 배관, 도장, 수압, 치수 등 검사항목 및 WELDING, VISUAL, CRACK 등 부적합 유형 복수 선택 및 신규 마스터 추가
- **3단계 (내용 작성)**: 구체적인 부적합 발생 위치 및 결함 현상 상세 기재
- **4단계 (증거사진 등록)**: 
  - **카메라 직접 촬영**: 현장 스마트폰 카메라로 즉시 촬영하여 슬롯에 등록
  - **갤러리(앨범) 선택**: 기기에 저장된 사진 다중 선택 및 자동 슬롯 배치
  - 최대 4장 등록, 이미지 자동 압축 최적화 및 슬롯별 삭제/교체 지원

### 2. 진행 관리 및 완료 조치
- **필터 및 검색**: 호선별, 등록자별, 상태별(`진행중` / `완료`) 실시간 필터링
- **상세 조회 & 이력 관리**: 등록 일시, 증거사진 라이트박스(Lightbox) 원본 확대 보기
- **상태 관리 및 완료 처리**:
  - 원인파악 기재
  - 특이사항 기재 (행 높이 확장 적용)
  - 조치방안 선택 (반품 / 재작업 / 특채 / 용도변경 / 폐기)
  - 완료 증거사진 첨부 (카메라 / 갤러리 선택 지원, 최대 4장)
  - 확인자 서명 및 완료일자 기록
- **담당자 이메일 통보**: 부적합 통보 대상자 지정 및 이메일 클라이언트 자동 연동

### 3. 표준 부적합보고서 (DH-QP-870-01) PDF 생성 및 인쇄
- 사내 품질경영 표준 양식인 **부적합보고서 (양식번호: DH-QP-870-01, 개정: 0)** 100% 규격 준수
- **결재란**: 작성, 검토, 승인 3단 결재란 배치
- **사진 증빙 레이아웃**: 부적합 사진(1~4번) 및 조치완료 사진(1~4번) 균형 배치
- **조치방안 체크박스**: 반품, 재작업, 특채, 용도변경, 폐기 체크 마크(■/□) 자동 반영
- **고해상도 PDF 다운로드 & 인쇄**: A4 1페이지 규격에 최적화된 고화질 PDF 내보내기 및 즉시 인쇄(`window.print`) 지원

### 4. 클라우드 실시간 동기화 (Firebase Firestore)
- Firestore 실시간 리스너(`onSnapshot`)를 통한 다중 사용자/기기간 실시간 데이터 동기화
- 네트워크 상태가 불안정하거나 오프라인 상태일 때도 로컬 캐시(LocalStorage)를 활용한 안전한 데이터 보존

---

## 🛠 기술 스택

| 분류 | 기술명 |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Icons & Motion** | Lucide React, Motion (Framer Motion) |
| **PDF & Canvas** | jsPDF, html2canvas, html2canvas-pro |
| **Database & Auth** | Firebase Firestore, Firebase Authentication |
| **Deployment** | Vercel / Cloud Run (SPA) |

---

## 📁 프로젝트 구조

```text
├── src/
│   ├── components/
│   │   ├── DaehanLogo.tsx              # 대한정공 CI 로고 컴포넌트
│   │   ├── DetailModal.tsx             # 부적합 건 상세 보기 모달
│   │   ├── EmailConfirmModal.tsx       # 담당자 이메일 발송 안내 모달
│   │   ├── Lightbox.tsx                # 사진 원본 슬라이드 확대 모달
│   │   ├── NewRegistrationTab.tsx      # 신규 부적합 등록 (1~4단계)
│   │   ├── PhotoSourceModal.tsx        # 카메라 vs 갤러리 사진 선택 바텀시트
│   │   ├── ProgressManagementTab.tsx   # 진행관리 목록 & 필터 대시보드
│   │   ├── RegisteredListModal.tsx     # 신규 등록 직후 전체 목록 확인 모달
│   │   ├── ReportPDFView.tsx           # DH-QP-870-01 표준 부적합보고서 테이블 뷰
│   │   ├── ReportPreviewModal.tsx      # 부적합보고서 인쇄/PDF 미리보기 모달
│   │   └── StatusManagementModal.tsx   # 진행상태 관리 및 완료처리 모달
│   ├── lib/
│   │   └── firebase.ts                 # Firebase App 및 Firestore 초기화
│   ├── services/
│   │   └── storage.ts                  # Firestore 실시간 연동 및 로컬 캐시 관리
│   ├── types/
│   │   └── index.ts                    # 부적합 레코드, 마스터 데이터 타입 정의
│   ├── utils/
│   │   ├── imageUtils.ts               # 이미지 압축, DataURL 변환 유틸
│   │   └── sampleImages.ts             # 기본 데모용 샘플 SVG 생성기
│   ├── App.tsx                         # 메인 탭 전환 및 앱 진입점
│   ├── index.css                       # Tailwind CSS 글로벌 스타일
│   └── main.tsx                        # React DOM 렌더링 엔트리
├── firebase-applet-config.json         # Firebase 프로젝트 설정
├── firestore.rules                     # Firestore 데이터베이스 보안 규칙
├── metadata.json                       # 앱 메타데이터 및 권한 설정
├── vercel.json                         # Vercel SPA 배포 라우팅 설정
└── vite.config.ts                      # Vite 번들러 환경 설정
```

---

## 🚀 실행 및 빌드 방법

### 1. 의존성 패키지 설치
```bash
npm install
# 또는
bun install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

### 3. 프로덕션 빌드
```bash
npm run build
```
`dist/` 디렉터리에 정적 빌드 결과물이 생성됩니다.

### 4. 코드 린트 및 타입 검사
```bash
npm run lint
```

---

## 🗄️ 데이터베이스 (Firebase Firestore) 안내

- **프로젝트 ID**: `knotted-woods-jvxch`
- **데이터베이스 ID**: `ai-studio-daehan-a8c9b28b-50c4-4870-b34e-bfc9b476af05`
- **주요 컬렉션**:
  - `records`: 개별 부적합 등록 건 (문서 ID: `DHQ-0001`, `DHQ-0002` 등)
  - `settings/master`: 등록자, 검사항목, 부적합유형 기준정보 마스터 데이터
- **콘솔 확인**: [Firebase Console](https://console.firebase.google.com/project/knotted-woods-jvxch/firestore) 접속 후 데이터베이스 목록에서 해당 DB ID를 선택하여 실시간 데이터를 열람할 수 있습니다.
