export type GensparkCategoryUsage = {
  name: string;
  tasks: number;
  share: number;
  note: string;
  color: string;
};

export type GensparkToolUsage = {
  tool: string;
  tasks: number;
  share: number;
  primaryUse: string;
  color: string;
};

export type GensparkProjectUsage = {
  rank: number;
  target: string;
  scale: string;
  tasks: number;
  theme: string;
};

export type GensparkFocusDay = {
  date: string;
  label: string;
  tasks: number;
  focus: string;
};

export type GensparkTaskSummary = {
  id: number;
  date: string;
  title: string;
  request: string;
  result: string;
  tool: string;
  category: string;
  outputs: string[];
  status: "완료" | "진행" | "미사용";
};

export type GensparkUsageData = {
  source: {
    name: string;
    collectedAt: string;
    period: string;
    accountLabel: string;
    note: string;
  };
  totalTasks: number;
  detailedTasks: number;
  metadataOnlyTasks: number;
  proposalAutomationTasks: number;
  generatedFileMappedTasks: number;
  categoryUsage: GensparkCategoryUsage[];
  toolUsage: GensparkToolUsage[];
  topProjects: GensparkProjectUsage[];
  focusDays: GensparkFocusDay[];
  representativeTasks: GensparkTaskSummary[];
  patterns: string[];
};

export const initialGensparkUsageData: GensparkUsageData = {
  source: {
    name: "Genspark 작업 히스토리 분석",
    collectedAt: "2026-05-12",
    period: "2025-12-18 ~ 2026-05-10",
    accountLabel: "RiskZero marketing account",
    note: "첨부된 Genspark 크롤링 보고서 5종과 task_ids.json을 구조화한 요약 데이터",
  },
  totalTasks: 159,
  detailedTasks: 65,
  metadataOnlyTasks: 94,
  proposalAutomationTasks: 60,
  generatedFileMappedTasks: 13,
  categoryUsage: [
    {
      name: "공공기관 제안서",
      tasks: 60,
      share: 38,
      note: "순천시, LH, SH, 한국도로공사, 중부발전 등 스마트 안전관리 플랫폼 제안",
      color: "#0f8b8d",
    },
    {
      name: "회사 자체 자료",
      tasks: 35,
      share: 22,
      note: "ZeroGuard, ZeroB, 사업계획, 홈페이지, 브랜드 자료",
      color: "#2f8f46",
    },
    {
      name: "산업안전 법령",
      tasks: 15,
      share: 9,
      note: "산업안전보건법, 안전보건공시제, 위험성평가, 중대재해처벌법",
      color: "#c58612",
    },
    {
      name: "건설현장 안전",
      tasks: 15,
      share: 9,
      note: "삼성물산 세미나, 도시기반시설본부, 건설안전특별법 대응",
      color: "#e85d4f",
    },
    {
      name: "AI/CCTV/IoT",
      tasks: 15,
      share: 9,
      note: "영상분석 협력사, 사고예측모델, IoT 센서, AI CCTV",
      color: "#5f6f8c",
    },
    {
      name: "이미지/디자인",
      tasks: 15,
      share: 9,
      note: "포스터, 인포그래픽, 슬라이드 레이아웃, 로고, 목업",
      color: "#6b8f71",
    },
    {
      name: "통신/디바이스",
      tasks: 12,
      share: 8,
      note: "위성통신, 실종 ZERO, 무사고 트래커, Starlink",
      color: "#9a6b36",
    },
    {
      name: "음성/회의",
      tasks: 3,
      share: 2,
      note: "회의 음성 전사, 발표자료 해설, NDA 협의 회의록",
      color: "#7d6ca7",
    },
  ],
  toolUsage: [
    { tool: "AI 슬라이드", tasks: 80, share: 50, primaryUse: "제안서, 발표자료, 성과보고, 로드맵", color: "#0f8b8d" },
    { tool: "AI 문서", tasks: 30, share: 19, primaryUse: "Word/HTML 제안서, 보고서, Q&A, 발표원고", color: "#2f8f46" },
    { tool: "AI 디자이너", tasks: 25, share: 16, primaryUse: "홈페이지, 인포그래픽, 포스터, 로고, 대시보드", color: "#c58612" },
    { tool: "AI 시트", tasks: 8, share: 5, primaryUse: "교량 목록, 기능점수, 일정표, 예산 워크북", color: "#5f6f8c" },
    { tool: "AI 이미지", tasks: 8, share: 5, primaryUse: "이미지 편집, 합성, 리사이즈, 아이콘", color: "#e85d4f" },
    { tool: "회의록/슈퍼 에이전트", tasks: 8, share: 5, primaryUse: "음성 변환, 회의록, 다중 도구 작업", color: "#6b8f71" },
  ],
  topProjects: [
    { rank: 1, target: "순천시", scale: "200억", tasks: 4, theme: "노후 교량·하천 스마트 안전 플랫폼" },
    { rank: 2, target: "LH", scale: "건설기계", tasks: 10, theme: "무사고 트래커·위치 관제" },
    { rank: 3, target: "SH", scale: "스마트장비", tasks: 4, theme: "MQTT 표준·통합 플랫폼" },
    { rank: 4, target: "한국도로공사", scale: "4.78억", tasks: 1, theme: "스마트안전관리플랫폼 ISMP" },
    { rank: 5, target: "한국중부발전", scale: "550MW", tasks: 3, theme: "함안복합발전소 안전관리" },
    { rank: 6, target: "전라남도", scale: "해상 안전", tasks: 6, theme: "위성통신·실종 ZERO" },
    { rank: 7, target: "삼성물산", scale: "세미나", tasks: 5, theme: "건설현장 안전혁신 발표자료" },
    { rank: 8, target: "F&B 프랜차이즈", scale: "400매장", tasks: 2, theme: "ZeroGuard·ISO 45001" },
  ],
  focusDays: [
    { date: "2025-12-19", label: "12/19", tasks: 9, focus: "2026 사업전략·대표이사 보고" },
    { date: "2025-12-23", label: "12/23", tasks: 10, focus: "679억 수주계획·AI CCTV·슬라이드 최적화" },
    { date: "2026-01-12", label: "1/12", tasks: 8, focus: "제로비 소개서·사망사고 분석" },
    { date: "2026-04-17", label: "4/17", tasks: 8, focus: "중부발전·산업안전 정책 변화" },
    { date: "2026-04-29", label: "4/29", tasks: 7, focus: "삼성물산 세미나·건설현장 안전" },
    { date: "2026-05-10", label: "5/10", tasks: 4, focus: "순천시 제안서 4종 산출" },
  ],
  representativeTasks: [
    {
      id: 1,
      date: "2026-05-10",
      title: "순천시 스마트 안전 플랫폼 구축 사업 제안서",
      request: "정부 RFP 격식의 Word 제안서와 부록까지 포함한 공식 제출본 작성",
      result: "35페이지 Word 제안서, HTML 제안서, 인포그래픽, 엑셀 워크북",
      tool: "AI 문서 + AI 시트 + AI 디자이너",
      category: "공공기관 제안서",
      outputs: ["DOCX", "HTML", "JPG", "XLSX"],
      status: "완료",
    },
    {
      id: 5,
      date: "2026-05-08",
      title: "음성 파일의 텍스트 변환",
      request: "94.75MB 회의 음성 파일 전사",
      result: "NDA 협의 및 법무 검토 일정 중심 회의록 텍스트",
      tool: "AI 회의록",
      category: "음성/회의",
      outputs: ["TXT"],
      status: "완료",
    },
    {
      id: 6,
      date: "2026-05-08",
      title: "산업안전보건법 개정안 리스크 분석",
      request: "안전보건공시제와 위험성평가 강화를 1장 슬라이드로 정리",
      result: "As-Is/To-Be 비교와 리스크 시사점 중심 1920x1080 슬라이드",
      tool: "AI 슬라이드",
      category: "산업안전 법령",
      outputs: ["PPT/HTML"],
      status: "완료",
    },
    {
      id: 10,
      date: "2026-04-29",
      title: "세미나 발표용 슬라이드 재구성",
      request: "촬영 이미지 기반 PPT 내용 추출, 중복 정리, 발표 흐름 재편집",
      result: "삼성물산 건설부문 안전혁신 사례 기반 20장 슬라이드",
      tool: "AI 슬라이드 + 이미지 이해",
      category: "건설현장 안전",
      outputs: ["PPT"],
      status: "완료",
    },
    {
      id: 16,
      date: "2026-04-28",
      title: "지능형 영상분석 협력업체 5개사 분석",
      request: "영상분석 협력사 재무·기술·협업전략 보고서 작성",
      result: "협업 시나리오, 실사 체크리스트, Win-Loss 매트릭스 포함 Word 보고서",
      tool: "AI 문서",
      category: "AI/CCTV/IoT",
      outputs: ["DOCX"],
      status: "완료",
    },
    {
      id: 24,
      date: "2026-04-24",
      title: "한국도로공사 ISMP 분석 및 전략 보고서",
      request: "스마트안전관리플랫폼 ISMP 기회 분석 및 제안 전략 수립",
      result: "공공기관 제안 전략 보고서",
      tool: "AI 문서",
      category: "공공기관 제안서",
      outputs: ["REPORT"],
      status: "완료",
    },
    {
      id: 64,
      date: "2026-02-26",
      title: "LH 건설기계 위치 관제 및 무사고 트래커 도입안",
      request: "건설기계 위치관리 체계와 Teltonika 대체 가능성 비교",
      result: "무사고 트래커 제안서·비교 보고서 시리즈",
      tool: "AI 슬라이드 + AI 문서",
      category: "통신/디바이스",
      outputs: ["PPT", "DOCX"],
      status: "완료",
    },
    {
      id: 130,
      date: "2025-12-23",
      title: "2026년 679억 원 안전관리 플랫폼 수주 계획",
      request: "연간 수주 전략과 성장 로드맵을 임원 보고용으로 정리",
      result: "679억 수주 프로젝트 슬라이드 및 사업계획 자료",
      tool: "AI 슬라이드",
      category: "회사 자체 자료",
      outputs: ["PPT"],
      status: "완료",
    },
  ],
  patterns: [
    "단일 사업에서 Word, HTML, 엑셀, 인포그래픽을 한 번에 확장하는 다중 산출물 패턴이 뚜렷합니다.",
    "회의록이나 촬영본을 입력으로 넣은 뒤 제안서 수정, 발표 슬라이드, 해설 문서로 이어지는 재가공 흐름이 반복됩니다.",
    "임원 보고용 1장 요약과 20장 내외 발표자료를 빠르게 만드는 의사결정 지원 용도가 강합니다.",
    "공공기관 제안과 제품 브랜딩, 법령 리스크 분석이 서로 연결되며 실제 영업 자료 생산에 집중되어 있습니다.",
  ],
};
