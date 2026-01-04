# Mini Roulette 상세 기획 및 개발 명세서

## 1. 프로젝트 개요
- **프로젝트명**: Mini Roulette
- **목적**: 윈도우용 'Jumpwings Roulette'의 웹 버전 포팅. 언제 어디서나 접근 가능한 가볍고 빠른 룰렛 서비스 제공.
- **핵심 가치**: 무설치, 즉시 실행, 모바일/데스크톱 반응형 지원.

## 2. 기술 스택 및 환경
- **Core**: React 18+, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (PostCSS)
- **State Management**: Zustand
- **Storage**: Browser LocalStorage
- **Package Manager**: npm
- **Icons**: React Icons (예정)

## 3. 아키텍처 및 폴더 구조 (Clean Architecture 지향)
React 환경에 맞게 적응시킨 계층 구조를 사용합니다.

```
src/
├── assets/          # 사운드, 이미지 등 정적 리소스
├── domain/          # 비즈니스 로직 및 타입 정의 (외부 의존성 없음)
│   ├── types.ts     # AppData, RouletteList, AppSettings 등 인터페이스
│   └── constants.ts # 기본값, 설정 상수
├── application/     # 애플리케이션 상태 및 유스케이스
│   ├── store/       # Zustand 스토어 (useRouletteStore)
│   └── hooks/       # 비즈니스 로직 훅 (useRouletteLogic 등)
├── infrastructure/  # 외부 시스템 연동
│   ├── storage/     # LocalStorage 접근 (Repository 구현)
│   ├── sound/       # Audio API 래퍼
│   └── file/        # CSV 내보내기/불러오기 기능
└── presentation/    # UI 컴포넌트
    ├── components/  # 재사용 가능한 공통 컴포넌트 (Button, Input 등)
    ├── layouts/     # 페이지 레이아웃 (Header, Main, Footer)
    └── pages/       # 주요 화면 (MainPage - 룰렛/설정 분기)
```

## 4. 데이터 구조 (Schema)
`LocalStorage` 키: `mini-roulette-data`

```typescript
// domain/types.ts
export interface RouletteItem {
  id: string; // 항목 고유 ID (UUID)
  text: string;
}

export interface RouletteList {
  id: string;
  name: string;
  items: RouletteItem[];
}

export interface AppSettings {
  selectedListId: string | null;
  allowDuplicatesInSession: boolean; // 세션 내 중복 당첨 허용 여부
  soundEnabled: boolean;
}

export interface AppData {
  lists: RouletteList[];
  settings: AppSettings;
}
```

## 5. 상세 기능 명세

### 5.1 목록 관리 (List Management)
- **CRUD**:
  - 목록 생성/수정/삭제.
  - 목록 내부 아이템 추가/삭제.
- **데이터 관리**:
  - 데이터는 즉시 LocalStorage에 동기화.
  - **CSV 내보내기/불러오기**: 현재 선택된 목록을 CSV로 다운로드하거나, CSV 파일을 읽어 새 목록으로 추가.

### 5.2 룰렛 (Roulette)
- **UI**: 슬롯머신 스타일 (세로 롤링 효과).
- **애니메이션**:
  - CSS `transform: translateY` 및 `transition` 활용.
  - 가속 -> 등속 -> 감속 -> 정지 3단계 시퀀스 구현.
- **알고리즘**:
  - `Math.random()` 기반의 가중치 없는 단순 랜덤.
  - **중복 방지**: `allowDuplicatesInSession`이 `false`일 경우, 당첨된 항목을 세션 기록(메모리 상의 일시적 배열)에 저장하고 다음 추첨 후보에서 제외. 후보가 없으면 경고 메시지.

### 5.3 세션 히스토리
- 앱 실행 후(또는 새로고침 후) 당첨된 결과들을 순서대로 보여주는 리스트.
- '초기화' 버튼 클릭 시 히스토리 삭제.

### 5.4 사운드
- `beep.mp3`: 룰렛 회전 중 반복 재생 (일정 간격).
- `finish.mp3`: 룰렛 정지 및 결과 확정 시 재생.
- 묵음(Mute) 옵션 지원.

## 6. UI/UX 디자인 컨셉
- **색상**: Orange(`#FF8A3D`), Pink(`#FF6B9C`), Yellow(`#FFD43B`) 메인.
- **폰트**: Pretendard (CDN 또는 로컬).
- **레이아웃**:
  - **Mobile**: 세로 배치. 상단 룰렛, 하단 컨트롤/히스토리. 설정은 모달 또는 별도 탭.
  - **Desktop**: 가로 배치. 좌측 룰렛 메인, 우측 리스트 관리 패널.

## 7. 단계별 개발 계획

### Phase 1: 프로젝트 초기화 및 환경 설정
- Vite + React-TS + Tailwind 설치.
- 기본 폴더 구조 생성.
- `domain/types.ts` 정의.

### Phase 2: 인프라 및 상태 관리 구현
- `infrastructure/storage`: LocalStorage Wrapper 구현.
- `application/store`: Zustand 스토어 설정 (데이터 로드/저장 액션).
- `infrastructure/sound`: 사운드 매니저 클래스/훅 구현.

### Phase 3: 목록 관리 기능 개발
- UI 컴포넌트: List CRUD, Item CRUD 화면 구현.
- CSV Import/Export 유틸리티 구현.
- 단위 테스트(가능한 경우 로직 위주).

### Phase 4: 룰렛 코어 개발
- 룰렛 로직: 랜덤 선택, 중복 처리 로직.
- 룰렛 UI: 슬롯 머신 애니메이션 컴포넌트.
- 사운드 연동.

### Phase 5: UI 통합 및 폴리싱
- 메인 레이아웃 구성 (반응형).
- 테마 컬러 적용 및 Tailwind 스타일링.
- 세션 히스토리 UI.

### Phase 6: 최종 점검 및 배포 준비
- 버그 수정.
- 빌드 테스트.
