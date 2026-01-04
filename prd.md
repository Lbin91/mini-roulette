# 미니 룰렛 PRD

## 1. 개요 (Overview)
- **프로젝트명**: Mini Roulette
- **목적**: 기존 윈도우 데스크톱용 Flutter 앱인 'Jumpwings Roulette'의 핵심 기능을 웹 환경에서 가볍고 빠르게 사용할 수 있도록 이식한다.
- **핵심 가치**: 별도의 설치 없이 브라우저 접속만으로 즉시 사용 가능하며, 모바일 및 데스크톱 브라우저 환경 모두를 지원한다.

## 2. 기술 스택 (Tech Stack)
- **Frontend Framework**: React 18+ (Vite 기반)
  - Flutter Web 대비 초기 로딩 속도 최적화 및 웹 친화적인 UI/UX 제공 목적.
- **Language**: TypeScript
- **Styling**: Tailwind CSS (빠른 스타일링 및 반응형 대응)
- **State Management**: Zustand (가볍고 직관적인 전역 상태 관리)
- **Storage**: Browser LocalStorage (별도 백엔드 없이 클라이언트 브라우저에 데이터 영구 저장)
- **Deploy**: Vercel / Netlify / GitHub Pages 등 정적 호스팅

## 3. 주요 기능 (Features)

### 3.1 룰렛 (Roulette)
- **UI 구성**:
  - 중앙에 룰렛 슬롯 머신 형태의 뷰 (현재 항목, 이전/다음 항목 노출).
  - '룰렛 시작', '정지' (또는 자동 정지), '다시 돌리기' 버튼.
  - 선택된 목록 정보 및 중복 허용 옵션 체크박스.
- **동작 로직**:
  - **애니메이션**: CSS Transform 및 JS 타이머를 활용하여 슬롯이 빠르게 회전하다가 감속하여 멈추는 효과 구현.
  - **랜덤 로직**: JS `Math.random()`을 사용하여 결과 선정.
  - **중복 처리**: '세션 내 중복 허용' 옵션 해제 시, 이미 당첨된 항목은 결과 후보에서 제외.
- **사운드**:
  - 회전 시 'beep' 효과음.
  - 당첨 시 'finish' 효과음.
  - (브라우저 정책에 따라 최초 인터랙션 후 재생)

### 3.2 목록 관리 (List Management)
- **기능**:
  - 목록 생성 (Create), 수정 (Update 이름), 삭제 (Delete).
  - 목록 내 항목(Item) 추가, 삭제.
- **데이터 구조**:
  - JSON 형태로 LocalStorage에 저장.
  - 예: `[{ id: 'uuid', name: '간식 내기', items: ['사탕', '젤리'] }]`

### 3.3 세션 히스토리 (Session History)
- **기능**:
  - 현재 세션에서 당첨된 결과들을 리스트로 표시.
  - '세션 리셋' 버튼으로 기록 초기화 가능.
  - 중복 허용 여부에 따라 당첨된 항목의 재등장 가능성 제어.

## 4. 데이터 모델 (Data Model)
- **LocalStorage Key**: `mini-roulette-data`
```typescript
interface AppData {
  lists: RouletteList[];
  settings: AppSettings;
}

interface RouletteList {
  id: string;
  name: string;
  items: string[]; // 순서가 있는 문자열 배열
}

interface AppSettings {
  selectedListId: string | null;
  allowDuplicatesInSession: boolean;
  soundEnabled: boolean;
}
```

## 5. UI/UX 디자인 가이드
- **Color Palette** (기존 앱 유지):
  - Primary: Orange `#FF8A3D`
  - Secondary: Pink `#FF6B9C`
  - Accent: Forsythia Yellow `#FFD43B`
  - Background: White `#FFFFFF` or Light Gray `#F8F9FA`
- **Layout**:
  - **Mobile**: 상단 탭(룰렛/관리) 또는 하단 네비게이션. 좁은 화면에 맞춰 룰렛 크기 자동 조절.
  - **Desktop**: 좌측 룰렛 / 우측 목록 관리 또는 탭 구조 유지하되 넓은 여백 활용.
- **Typography**: 웹 폰트 (Pretendard 또는 Noto Sans KR) 적용으로 가독성 확보.

## 6. 개발 로드맵 (Roadmap)
1.  **프로젝트 초기화**: Vite + React + TypeScript + Tailwind CSS 설정.
2.  **스토리지/상태 구현**: LocalStorage 연동 및 Zustand Store 구성.
3.  **목록 관리 페이지 구현**: CRUD 기능 개발.
4.  **룰렛 로직 및 UI 구현**: 슬롯 애니메이션 및 랜덤 추첨 로직 이식.
5.  **사운드 및 옵션 적용**: 효과음 및 중복 방지 로직 연결.
6.  **반응형 최적화**: 모바일/데스크톱 뷰포트 대응.
7.  **배포**: 정적 웹 호스팅 배포.

## 7. 차이점 (vs 기존 Flutter 앱)
- **애니메이션**: Flutter의 컨트롤러 기반 애니메이션 대신 CSS Transition/Animation 사용.
- **저장소**: 파일 시스템(JSON) 대신 브라우저 LocalStorage 사용.
- **플랫폼**: 윈도우 실행 파일(.exe)이 아닌 웹 URL로 접근.
- **데이터 관리**: 저장한 목록을 csv로 내보내거나 불러오기 할 수 있다