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

export type GensparkDriveRepresentativeFile = {
  title: string;
  url: string;
  fileType: string;
  purpose: string;
  sizeLabel: string;
  modifiedAt: string;
};

export type GensparkDriveAnalysis = {
  source: {
    name: string;
    folderUrl: string;
    collectedAt: string;
    period: string;
    accountLabel: string;
    note: string;
  };
  totalFiles: number;
  projectCount: number;
  folderCount: number;
  rootFileCount: number;
  totalSizeLabel: string;
  latestOutputDate: string;
  directFileSignal: string;
  typeBreakdown: GensparkCategoryUsage[];
  projectBreakdown: GensparkCategoryUsage[];
  representativeFiles: GensparkDriveRepresentativeFile[];
  insights: string[];
};

export type ChatGptMonthlyUsage = {
  month: string;
  conversations: number;
};

export type ChatGptFileTypeUsage = {
  ext: string;
  count: number;
};

export type ChatGptTermUsage = {
  term: string;
  count: number;
};

export type ChatGptModelUsage = {
  model: string;
  count: number;
};

export type ClaudeExportSourceFile = {
  fileName: string;
  sourceType: "conversations" | "memories" | "users" | "project";
  records: number;
  role: string;
  detail: string;
  verification: string;
};

export type ClaudeExportUsageTopic = {
  topic: string;
  conversations: number;
  messages: number;
  messageShare: number;
  attachments: number;
  businessUse: string;
  evidence: string;
  color: string;
};

export type ClaudeExportAccountUsage = {
  accountLabel: string;
  conversations: number;
  messages: number;
  attachments: number;
  primaryUse: string;
  verification: string;
};

export type ClaudeExportProjectUsage = {
  id: string;
  name: string;
  visibility: string;
  docs: number;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  useCase: string;
  verification: string;
};

export type ClaudeExportMemoryUsage = {
  accountLabel: string;
  characters: number;
  signal: string;
  verification: string;
};

export type ClaudeExportUserDirectory = {
  totalUsers: number;
  activeAccounts: number;
  mappedAccounts: number;
  domain: string;
  privacyNote: string;
};

export type AiUsageTopicInsight = {
  topic: string;
  tasks: number;
  share: number;
  signal: string;
  businessUse: string;
  evidence: string;
  color: string;
};

export type AiPromptExample = {
  title: string;
  prompt: string;
  useCase: string;
  outcome: string;
  qualitySignal: "즉시 재사용" | "가이드 필요" | "개선 필요";
};

export type AiPromptFriction = {
  title: string;
  pattern: string;
  whyHard: string;
  guide: string;
  severity: "높음" | "중간" | "낮음";
};

export type AiGuideOpportunity = {
  area: string;
  trigger: string;
  template: string;
  expectedEffect: string;
  priority: "상" | "중" | "하";
};

export type AiImprovementAction = {
  title: string;
  currentSignal: string;
  action: string;
  expectedImpact: string;
  priority: "상" | "중" | "하";
};

export type AiUsageInsightAnalysis = {
  sourceLabel: string;
  period: string;
  totalRecords: number;
  totalMessages: number;
  attachmentBasedRecords: number;
  outputOrientedRecords: number;
  guideNeededCount: number;
  executiveSummary: string[];
  topicInsights: AiUsageTopicInsight[];
  representativePrompts: AiPromptExample[];
  difficultPrompts: AiPromptFriction[];
  guideOpportunities: AiGuideOpportunity[];
  frictionInsights: string[];
  improvementActions: AiImprovementAction[];
};

export type NotionPromptSourceUsage = {
  accountLabel: string;
  sourcePage: string;
  tool: string;
  sourceUrl: string;
  promptRecords: number;
  generatedOutputs: number;
  outputBasis: string;
  includedRecords: string[];
  note: string;
};

export type NotionPromptUsageData = {
  source: {
    name: string;
    collectedAt: string;
    period: string;
    accountLabel: string;
    status?: "정상" | "주의";
    note: string;
    mode?: string;
    refreshSchedule?: string;
  };
  totalPromptRecords: number;
  totalGeneratedOutputs: number;
  templateRecordsExcluded: number;
  sources: NotionPromptSourceUsage[];
  insights: string[];
};

export function isNotionPromptUsageData(value: unknown): value is NotionPromptUsageData {
  const data = value as NotionPromptUsageData;
  return (
    Boolean(data) &&
    typeof data === "object" &&
    Boolean(data.source) &&
    typeof data.source.name === "string" &&
    typeof data.source.collectedAt === "string" &&
    typeof data.source.period === "string" &&
    typeof data.source.accountLabel === "string" &&
    typeof data.source.note === "string" &&
    typeof data.totalPromptRecords === "number" &&
    typeof data.totalGeneratedOutputs === "number" &&
    typeof data.templateRecordsExcluded === "number" &&
    Array.isArray(data.sources) &&
    data.sources.every(isNotionPromptSourceUsage) &&
    Array.isArray(data.insights) &&
    data.insights.every((insight) => typeof insight === "string")
  );
}

function isNotionPromptSourceUsage(value: unknown): value is NotionPromptSourceUsage {
  const source = value as NotionPromptSourceUsage;
  return (
    Boolean(source) &&
    typeof source === "object" &&
    typeof source.accountLabel === "string" &&
    typeof source.sourcePage === "string" &&
    typeof source.tool === "string" &&
    typeof source.sourceUrl === "string" &&
    typeof source.promptRecords === "number" &&
    typeof source.generatedOutputs === "number" &&
    typeof source.outputBasis === "string" &&
    Array.isArray(source.includedRecords) &&
    typeof source.note === "string"
  );
}

export type ChatGptExportAnalysis = {
  source: {
    name: string;
    collectedAt: string;
    period: string;
    accountLabel: string;
    note: string;
  };
  totalConversations: number;
  totalMessages: number;
  totalUserMessages: number;
  totalAssistantMessages: number;
  totalAttachments: number;
  conversationsWithFiles: number;
  attachmentsFromFiles: number;
  categoryUsage: GensparkCategoryUsage[];
  toolUsage: GensparkToolUsage[];
  topProjects: GensparkProjectUsage[];
  focusDays: GensparkFocusDay[];
  representativeTasks: GensparkTaskSummary[];
  monthlyUsage: ChatGptMonthlyUsage[];
  fileTypeUsage: ChatGptFileTypeUsage[];
  topTerms: ChatGptTermUsage[];
  modelUsage: ChatGptModelUsage[];
  sourceFiles: ClaudeExportSourceFile[];
  usageTopics: ClaudeExportUsageTopic[];
  accountUsage: ClaudeExportAccountUsage[];
  projectExports: ClaudeExportProjectUsage[];
  memoryUsage: ClaudeExportMemoryUsage[];
  userDirectory: ClaudeExportUserDirectory;
  patterns: string[];
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
  insightAnalysis: AiUsageInsightAnalysis;
  driveAnalysis?: GensparkDriveAnalysis;
  notionPromptUsage?: NotionPromptUsageData;
  chatGptExport?: ChatGptExportAnalysis;
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
  driveAnalysis: {
    source: {
      name: "Genspark AI Drive 산출물 분석",
      folderUrl: "https://drive.google.com/drive/folders/1MFJpVf9QfLNbzwLIE27N3b9yua9uYsa2",
      collectedAt: "2026-07-20 09:43 KST",
      period: "2025-12-17 ~ 2026-07-15",
      accountLabel: "Genspark AI Drive · riskzero.marketing@gmail.com",
      note: "2026-07-20 Drive 산출물 요약 Markdown을 직접 확인해 중복 export zip을 제외한 실제 저장 파일, 프로젝트, 파일 유형을 재집계했습니다. Genspark 대화 세션 목록은 공개 조회되지 않아 산출물 기준으로 해석합니다.",
    },
    totalFiles: 131,
    projectCount: 5,
    folderCount: 4,
    rootFileCount: 3,
    totalSizeLabel: "약 2.0 GB",
    latestOutputDate: "2026-07-15",
    directFileSignal: "프로젝트 폴더 4개와 루트 파일 3개에서 중복 export zip을 제외한 실제 산출물을 집계",
    typeBreakdown: [
      { name: "PPTX", tasks: 85, share: 64.9, note: "제안서, 발표자료, 비교 분석 보고서", color: "#2f8f46" },
      { name: "PNG", tasks: 16, share: 12.2, note: "슬라이드·제안서용 시각자료", color: "#e85d4f" },
      { name: "DOCX", tasks: 12, share: 9.2, note: "제안서, 보고서, 운영 문서", color: "#c58612" },
      { name: "ZIP", tasks: 8, share: 6.1, note: "폴더 전체 내보내기 아카이브", color: "#7d6ca7" },
      { name: "XLSX", tasks: 5, share: 3.8, note: "사업금액·기능점수·데이터 산출", color: "#5f6f8c" },
      { name: "PDF", tasks: 3, share: 2.3, note: "회의록과 검토 보고서", color: "#9a6b36" },
      { name: "HTML", tasks: 2, share: 1.5, note: "영업 대시보드·웹 산출물", color: "#0f8b8d" },
    ],
    projectBreakdown: [
      { name: "Genspark (AI Slides/Docs/Sheets)", tasks: 108, share: 82.4, note: "제안서·발표자료·문서·시트 산출", color: "#2f8f46" },
      { name: "AI사고예측 스마트안전관리 발표자료", tasks: 18, share: 13.7, note: "안전관리 시스템 발표자료 묶음", color: "#0f8b8d" },
      { name: "루트 영업대시보드 HTML 외", tasks: 3, share: 2.3, note: "영업 대시보드와 개별 산출물", color: "#5f6f8c" },
      { name: "제안서작성", tasks: 1, share: 0.8, note: "대용량 제안서 산출", color: "#c58612" },
      { name: "zerobee_project", tasks: 1, share: 0.8, note: "ZeroBee 관련 산출", color: "#7d6ca7" },
    ],
    representativeFiles: [
      {
        title: "genspark_sessions_요약_20260720.md",
        url: "https://drive.google.com/file/d/1dFlj0KlG_y5Y4g7fxkfc52KDCuTiRpsZ/view?usp=drivesdk",
        fileType: "Markdown",
        purpose: "131개 산출물·프로젝트별 최신 집계 원천",
        sizeLabel: "2.5 KB",
        modifiedAt: "2026-07-20T00:43:48.909Z",
      },
      {
        title: "리스크제로_스마트안전관리_솔루션_20260715063546.pptx",
        url: "https://docs.google.com/presentation/d/1xIzaUpBzGBkv9xJIfw3NHh9YsxPVQTXt/edit?usp=drivesdk",
        fileType: "PPTX",
        purpose: "리스크제로 스마트안전관리 솔루션 발표자료",
        sizeLabel: "11.6 MB",
        modifiedAt: "2026-07-16T00:46:41.499Z",
      },
      {
        title: "리스크제로_스마트안전관리_솔루션_20260715030712.pptx",
        url: "https://docs.google.com/presentation/d/1KstI3N-aTF2jnJAHVbPqVTRTh7GHoNCs/edit?usp=drivesdk",
        fileType: "PPTX",
        purpose: "리스크제로 스마트안전관리 솔루션 발표자료",
        sizeLabel: "9.8 MB",
        modifiedAt: "2026-07-16T00:46:45.363Z",
      },
      {
        title: "스마트_안전_플랫폼_7개사_비교_분석_보고서_20260705171528.pptx",
        url: "https://docs.google.com/presentation/d/1deS6WWqRp-ijXDGLfU7VR3gu0JSg3blq/edit?usp=drivesdk",
        fileType: "PPTX",
        purpose: "스마트 안전 플랫폼 7개사 비교 분석",
        sizeLabel: "2.4 MB",
        modifiedAt: "2026-07-05T17:15:28+09:00",
      },
      {
        title: "스마트_안전_플랫폼_5개사_비교_분석_보고서_20260705103641.pptx",
        url: "https://docs.google.com/presentation/d/11IDJHMU9oKsc72WV8BN8N2EukdgpjZj4/edit?usp=drivesdk",
        fileType: "PPTX",
        purpose: "스마트 안전 플랫폼 5개사 비교 분석",
        sizeLabel: "2.1 MB",
        modifiedAt: "2026-07-05T10:36:41+09:00",
      },
      {
        title: "slides_20260608054202.pptx",
        url: "https://docs.google.com/presentation/d/1y-7E5en_Lxbq9tCYNp-65QW4zJ3aKHCE/edit?usp=drivesdk",
        fileType: "PPTX",
        purpose: "AI Slides 발표자료",
        sizeLabel: "3.7 MB",
        modifiedAt: "2026-06-08T05:42:02+09:00",
      },
      {
        title: "construction_safety_ai_20260428024039.pptx",
        url: "https://docs.google.com/presentation/d/1uXvWJRpW_iWMkwTVhIrdKufm331qMFTB/edit?usp=drivesdk",
        fileType: "PPTX",
        purpose: "건설 안전 AI 제안자료",
        sizeLabel: "12.5 MB",
        modifiedAt: "2026-04-28T02:40:39+09:00",
      },
      {
        title: "FP_한정_내역_기반_총_사업금액_산출_요청-Genspark_AI_Sheets-20260518_1338.xlsx",
        url: "https://docs.google.com/spreadsheets/d/1JH8PoB8EeGd58v1ZASB36sql3253GkbG/edit?usp=drivesdk",
        fileType: "XLSX",
        purpose: "기능점수·사업금액 산출",
        sizeLabel: "302.6 KB",
        modifiedAt: "2026-05-18T13:38:00+09:00",
      },
    ],
    insights: [
      "2026-07-20 Genspark AI Drive 요약 기준으로 산출물 131개, 약 2.0 GB가 확인되며 파일 수정일 범위는 2025-12-17부터 2026-07-15까지입니다.",
      "PPTX가 85개(64.9%)로 가장 많아 Genspark 활용의 중심은 제안서·발표자료·경쟁 비교 보고서 생산입니다.",
      "Genspark (AI Slides/Docs/Sheets) 프로젝트가 108개(82.4%)를 차지하고, AI사고예측 스마트안전관리 발표자료가 18개(13.7%)로 뒤를 잇습니다.",
      "Genspark 대화 세션 목록은 공개 조회되지 않아 성공률·실패율은 표시하지 않고, 검증 가능한 Drive 산출물 파일을 활용 지표로 사용합니다.",
    ],
  },
  insightAnalysis: {
    sourceLabel: "Genspark 작업 히스토리와 Claude export 통합 분석",
    period: "2025-12-18 ~ 2026-06-26",
    totalRecords: 224,
    totalMessages: 1613,
    attachmentBasedRecords: 32,
    outputOrientedRecords: 91,
    guideNeededCount: 6,
    executiveSummary: [
      "이번 Claude export batch는 65개 대화, 1,613개 메시지이며 Genspark 159개 작업과 합쳐 총 224건의 활용 기록으로 재정리했습니다.",
      "Claude 메시지 기준으로는 개인/게임·생활 질의가 63.3%를 차지해 업무형 활용성과 분리해서 해석해야 합니다.",
      "업무형 Claude 활용은 38개 대화로 개발/아키텍처·DB, RiskZero 제품·산업안전/AI 인프라, 문서·보고, AI 비용·계정 운영에서 확인됩니다.",
      "프로젝트·사용자·메모리 JSON까지 함께 반영해 원천 파일별 근거와 계정 매핑을 확인했고, 6월 신규 대화는 설계변경·LangGraph·Observia 회의록·서버 인프라 주제가 추가됐습니다.",
    ],
    topicInsights: [
      {
        topic: "산업안전·공공 제안/제품 전략",
        tasks: 102,
        share: 45.5,
        signal: "Genspark 중심 실무 산출",
        businessUse: "순천시, LH, SH, 도로공사, 중부발전 제안서와 RiskZero/ZeroGuard 자료 생산",
        evidence: "Genspark 공공기관 제안서 60건, 회사 자체 자료 35건, Claude 설계변경·Observia·사고예측·LoRa·NCP 대화 7건",
        color: "#2f8f46",
      },
      {
        topic: "개발/아키텍처·DB",
        tasks: 19,
        share: 8.5,
        signal: "Claude 업무형 대화의 핵심",
        businessUse: "GitLab 코드 리뷰, LangGraph, MSA 통신 방식, DB 규칙, TimescaleDB, 서버/로드밸런서 검토",
        evidence: "Claude conversations.json에서 기술 설계·디버깅 대화 19건, 384메시지, 첨부 37건 확인",
        color: "#0f8b8d",
      },
      {
        topic: "문서·보고·업무 생산성",
        tasks: 45,
        share: 20.1,
        signal: "반복 산출물 자동화 후보",
        businessUse: "회의록, 운영 매뉴얼, WBS 간트차트, 보고 프롬프트, 문서 검토와 연락처 마스킹 기준 정리",
        evidence: "Genspark 문서·회의록·디자인 작업과 Claude 문서/업무 생산성 대화 7건 결합",
        color: "#c58612",
      },
      {
        topic: "개인/게임·생활 질의",
        tasks: 11,
        share: 4.9,
        signal: "비업무성 사용량 분리 필요",
        businessUse: "게임 빌드, 하드웨어 성능, 건강·생활·뉴스성 질의가 장문 대화로 확장",
        evidence: "Claude export에서 11개 대화가 1,021메시지로 메시지 기준 63.3%를 차지",
        color: "#7d6ca7",
      },
      {
        topic: "AI 비용·계정/도구 운영",
        tasks: 32,
        share: 14.3,
        signal: "운영 체계화 필요",
        businessUse: "Claude API 토큰, 팀플랜 가격, ChatGPT 요금제, 기본 모델, AI 비용·활용 대시보드 운영",
        evidence: "Claude AI 운영 대화 5건과 기존 AI 비용/활용 대시보드·계정 관리 기록 통합",
        color: "#9a6b36",
      },
      {
        topic: "미분류/짧은 대화",
        tasks: 15,
        share: 6.7,
        signal: "태그 보완 필요",
        businessUse: "제목 없음, 인사, 빈 대화, 첨부만 있는 대화처럼 업무 목적 판단이 어려운 짧은 기록",
        evidence: "Claude export의 짧은 대화 16건 중 15건을 통합 미분류로 반영했고 계정 매핑만 가능해 업무 성격은 별도 확인 필요",
        color: "#5f6f8c",
      },
    ],
    representativePrompts: [
      {
        title: "공공 제안서 일괄 산출",
        prompt: "정부 RFP 격식의 Word 제안서와 부록까지 포함한 공식 제출본을 작성하고, HTML·인포그래픽·엑셀 산출물까지 확장해줘.",
        useCase: "공공기관 제안·영업",
        outcome: "35페이지 제안서, HTML 제안서, 인포그래픽, 워크북으로 이어지는 다중 산출물 생산",
        qualitySignal: "즉시 재사용",
      },
      {
        title: "촬영본 기반 발표자료 재구성",
        prompt: "촬영 이미지에서 PPT 내용을 추출하고 중복을 정리한 뒤, 발표 흐름에 맞게 20장 내외 슬라이드로 재편집해줘.",
        useCase: "세미나·임원 보고",
        outcome: "삼성물산 안전혁신 사례 기반 발표자료 구조화",
        qualitySignal: "가이드 필요",
      },
      {
        title: "개발 오류 원인 진단",
        prompt: "터미널 로그, 배포 상태, 환경변수 설정을 함께 보고 실제 원인을 찾은 뒤 수정하고 테스트까지 진행해줘.",
        useCase: "개발/배포 운영",
        outcome: "API, BigQuery, Railway, 권한 오류를 실행 가능한 수정 작업으로 전환",
        qualitySignal: "즉시 재사용",
      },
      {
        title: "법령 변화 리스크 요약",
        prompt: "산업안전보건법 개정안의 As-Is/To-Be와 리스크제로 사업 영향, 대응 전략을 1장 슬라이드로 정리해줘.",
        useCase: "정책·리스크 분석",
        outcome: "안전보건공시제, 위험성평가 강화 등 사업 메시지로 연결",
        qualitySignal: "가이드 필요",
      },
      {
        title: "첨부 자료 기반 대시보드 반영",
        prompt: "첨부한 JSON·엑셀·문서 내용을 분석해서 대시보드 지표와 탭 구조에 반영하고 로컬에서 검증해줘.",
        useCase: "데이터/대시보드 운영",
        outcome: "AI 비용·활용성·프롬프트 분석 화면으로 확장",
        qualitySignal: "개선 필요",
      },
    ],
    difficultPrompts: [
      {
        title: "자료가 많고 산출물이 여러 개인 요청",
        pattern: "문서, 이미지, 엑셀, 링크를 한 번에 넣고 최종본·요약본·발표본을 동시에 요구",
        whyHard: "입력 우선순위와 최종 산출물 기준이 불명확하면 결과물이 넓게 퍼지고 검토 시간이 늘어납니다.",
        guide: "목표 산출물, 우선순위, 반드시 유지할 표현, 제외할 범위를 먼저 적는 제안서/보고서 브리프가 필요합니다.",
        severity: "높음",
      },
      {
        title: "개발 오류 해결 요청",
        pattern: "로그, 환경변수, 권한, 배포 상태가 여러 시스템에 흩어진 상태에서 원인 진단을 요청",
        whyHard: "재현 절차와 현재 실행 위치가 없으면 같은 원인을 여러 번 확인하게 됩니다.",
        guide: "현상, 기대 동작, 실행 명령, 오류 전문, 마지막 변경사항을 한 묶음으로 입력하는 디버깅 템플릿이 필요합니다.",
        severity: "높음",
      },
      {
        title: "법령·정책 해석 요청",
        pattern: "법령 변화, 공공기관 요구사항, 사업 메시지를 한 번에 요약",
        whyHard: "최신성, 출처, 적용 대상이 빠지면 그럴듯하지만 제출하기 어려운 문장이 생깁니다.",
        guide: "출처 URL/문서명, 적용 대상, 결론 수위, 리스크 표현 제한을 지정하는 정책 분석 템플릿이 필요합니다.",
        severity: "중간",
      },
      {
        title: "디자인/슬라이드 개선 요청",
        pattern: "보기 좋게, 고급스럽게, 임원 보고용처럼 같은 추상 표현으로 요청",
        whyHard: "톤앤매너, 분량, 사용처, 금지 스타일이 없으면 재작업이 발생합니다.",
        guide: "대상 청중, 화면비, 컬러 제한, 참고 자료, 한 장의 핵심 메시지를 먼저 정하는 디자인 브리프가 필요합니다.",
        severity: "중간",
      },
    ],
    guideOpportunities: [
      {
        area: "공공 제안서/사업계획",
        trigger: "RFP, 기관명, 제출본, 부록, 제안요청서가 포함된 요청",
        template: "배경 → 발주처 Pain Point → 당사 차별점 → 산출물 형식 → 증빙/수치 → 금지 표현",
        expectedEffect: "제안서 초안 품질 편차와 반복 수정 감소",
        priority: "상",
      },
      {
        area: "개발/배포 디버깅",
        trigger: "오류, 권한, 배포, 환경변수, API 응답 불일치가 포함된 요청",
        template: "현상 → 재현 명령 → 오류 전문 → 기대값 → 최근 변경 → 접근 가능한 환경",
        expectedEffect: "원인 탐색 시간을 줄이고 실제 수정/테스트까지 바로 연결",
        priority: "상",
      },
      {
        area: "법령·정책 리스크 분석",
        trigger: "개정안, 고시, 공공 기준, 안전보건, 중대재해 관련 요청",
        template: "출처 → 적용 대상 → 변화점 → 사업 영향 → 대응 메시지 → 확인 필요 사항",
        expectedEffect: "출처 없는 요약과 과도한 법적 단정 방지",
        priority: "중",
      },
      {
        area: "회의록/음성 재가공",
        trigger: "회의 음성, 전사, NDA, 협의, 발표원고, 후속조치 요청",
        template: "참석자 → 목적 → 결정사항 → 쟁점 → 액션아이템 → 재가공 산출물",
        expectedEffect: "회의록에서 제안서·보고서로 이어지는 재가공 품질 향상",
        priority: "중",
      },
      {
        area: "대시보드/데이터 분석",
        trigger: "CSV, JSON, export, 비용, 사용량, 예측, 탭 추가 요청",
        template: "원천 파일 → 핵심 질문 → 집계 기준 → 제외 기준 → 화면 지표 → 검증 방법",
        expectedEffect: "데이터 출처와 화면 수치 불일치에 대한 재검증 비용 감소",
        priority: "상",
      },
      {
        area: "슬라이드/디자인",
        trigger: "발표자료, 포스터, 인포그래픽, 고급스럽게, 임원 보고용 요청",
        template: "청중 → 한 줄 메시지 → 화면비/분량 → 참고 톤 → 금지 스타일 → 필수 문구",
        expectedEffect: "시각물 재작업과 메시지 흔들림 감소",
        priority: "중",
      },
    ],
    frictionInsights: [
      "Claude export, Genspark, Workspace, API 비용 데이터가 서로 다른 포맷으로 쌓여 업무 단위의 ROI를 바로 연결하기 어렵습니다.",
      "프롬프트에는 실제 사용 목적이 보이지만, 최종 산출물이 제출·배포·영업에 사용됐는지 여부는 별도 태깅이 부족합니다.",
      "첨부 파일명과 대화 제목만으로는 품질, 재사용 가능성, 실패 원인을 완전히 판단하기 어렵습니다.",
      "일반 질의와 실무 산출형 요청이 같은 로그에 섞여 있어 교육 대상과 자동화 대상을 구분하는 기준이 필요합니다.",
    ],
    improvementActions: [
      {
        title: "업무 유형 태그 표준화",
        currentSignal: "208건 중 도구별 원천은 있으나 업무 목적 태그가 수동 추정에 의존",
        action: "요청 후 1분 안에 제안/개발/문서/정책/디자인/데이터 태그와 최종 사용 여부를 기록",
        expectedImpact: "활용률을 비용이 아니라 업무 성과 기준으로 재분류 가능",
        priority: "상",
      },
      {
        title: "프롬프트 템플릿 라이브러리 구축",
        currentSignal: "가이드 필요 영역 6개가 반복 등장",
        action: "제안서, 디버깅, 법령 분석, 회의록, 대시보드, 디자인 브리프 템플릿을 버튼형으로 제공",
        expectedImpact: "초보 사용자도 좋은 입력 구조를 따라가며 재작업 감소",
        priority: "상",
      },
      {
        title: "산출물 피드백 루프 추가",
        currentSignal: "생성 파일과 대화량은 보이지만 실제 채택 여부가 닫히지 않음",
        action: "완성/수정필요/미사용/제출완료 상태와 절감 시간, 후속 매출 기회를 기록",
        expectedImpact: "AI 활용성이 실제 성과로 이어졌는지 월별로 평가 가능",
        priority: "중",
      },
      {
        title: "고난도 프롬프트 사전 경고",
        currentSignal: "자료가 많거나 산출물이 여러 개인 요청에서 범위가 자주 확장",
        action: "대량 첨부·다중 산출물·법령 해석 요청을 감지하면 입력 보강 체크리스트를 먼저 표시",
        expectedImpact: "모호한 요청으로 인한 장문 재작업과 품질 편차 감소",
        priority: "중",
      },
    ],
  },
  notionPromptUsage: {
    source: {
      name: "Notion 프롬프트 DB 분석",
      collectedAt: "2026-06-09",
      period: "2026-06-09",
      accountLabel: "김재우 프롬프트 DB",
      note: "사용자가 제공한 Notion 페이지 2건을 fetch해 프롬프트 기록과 생성 산출물만 집계",
    },
    totalPromptRecords: 5,
    totalGeneratedOutputs: 7,
    templateRecordsExcluded: 1,
    sources: [
      {
        accountLabel: "김재우 프롬프트 DB",
        sourcePage: "클로드 프롬프트 DB",
        tool: "Claude/Cowork",
        sourceUrl: "https://app.notion.com/p/37a32dfb494c806e9622cdadc1fa672e",
        promptRecords: 2,
        generatedOutputs: 2,
        outputBasis: "하위 Claude 작업 페이지의 생성 파일 섹션 1건씩 집계",
        includedRecords: [
          "2026-06-09 · Iris (IRIS 크롤러 정기실행)",
          "2026-06-09 · Aitrendv1 (2026 AI 트렌드·산업안전 적용)",
        ],
        note: "스케줄 자동 트리거 기반 Claude/Cowork 작업 2건",
      },
      {
        accountLabel: "김재우 프롬프트 DB",
        sourcePage: "Codex 프롬프트 DB",
        tool: "Codex",
        sourceUrl: "https://app.notion.com/p/37a32dfb494c802ea9dfea58a48dde04",
        promptRecords: 3,
        generatedOutputs: 5,
        outputBasis: "Codex DB 실제 작업 행의 생성 파일/산출물 기록 기준, 템플릿 행 제외",
        includedRecords: [
          "2026-06-09 Codex 프롬프트 DB 구축",
          "2026-06-09 Codex 프롬프트 DB 일일 저장 자동화 설정",
          "2026-06-09 Codex 프롬프트 DB 테스트 업로드 실행",
        ],
        note: "템플릿 - Codex 질문/생성물 기록 1건은 운영 양식이므로 제외",
      },
    ],
    insights: [
      "Notion 계정 기준으로는 김재우 프롬프트 DB 아래 Claude와 Codex 기록이 함께 쌓이고 있습니다.",
      "프롬프트 기록은 Claude 2건, Codex 3건으로 총 5건입니다.",
      "생성 산출물은 Claude 2건, Codex 5건으로 총 7개이며, Notion 파일 첨부 속성은 이번 화면 지표에서 제외했습니다.",
    ],
  },
  chatGptExport: {
      "source": {
          "name": "Claude 사용 이력 Export 분석",
          "collectedAt": "2026-06-26",
          "period": "2026-05-11 ~ 2026-06-26",
          "accountLabel": "Claude export batch 2026-06-26",
          "note": "conversations, memories, users, projects JSON 전체를 집계했으며 전화번호와 이메일 원문은 화면에서 제외"
      },
      "totalConversations": 65,
      "totalMessages": 1613,
      "totalUserMessages": 804,
      "totalAssistantMessages": 809,
      "totalAttachments": 168,
      "conversationsWithFiles": 19,
      "attachmentsFromFiles": 168,
      "categoryUsage": [
          {
              "name": "개발/아키텍처·DB",
              "tasks": 19,
              "share": 29.2,
              "note": "LangGraph, GitLab CI/CD, MSA, DB 표준, 서버/로드밸런서 등 기술 실행 질의가 가장 많음",
              "color": "#0f8b8d"
          },
          {
              "name": "미분류/짧은 대화",
              "tasks": 16,
              "share": 24.6,
              "note": "제목 없음, 짧은 입력, 첨부만 있는 대화는 업무 활용으로 단정하지 않고 분리",
              "color": "#5f6f8c"
          },
          {
              "name": "개인/게임·생활 질의",
              "tasks": 11,
              "share": 16.9,
              "note": "대화 수는 16.9%지만 메시지 기준 63.3%로 장문 개인성 사용량이 여전히 큼",
              "color": "#7d6ca7"
          },
          {
              "name": "RiskZero 제품·산업안전/AI 인프라",
              "tasks": 7,
              "share": 10.8,
              "note": "사고예측, 설계변경, Observia 회의록, NCP 알림톡, 현장 AI 인프라 검토",
              "color": "#2f8f46"
          },
          {
              "name": "문서·보고·업무 생산성",
              "tasks": 7,
              "share": 10.8,
              "note": "운영 매뉴얼, WBS 간트차트, 마스킹, 문서 검토, 엑셀 단축키 활용",
              "color": "#c58612"
          },
          {
              "name": "AI 비용·계정/도구 운영",
              "tasks": 5,
              "share": 7.7,
              "note": "Claude API 토큰, Team Plan 가격, ChatGPT 요금제, RPD와 기본 모델 설정 확인",
              "color": "#9a6b36"
          }
      ],
      "toolUsage": [
          {
              "tool": "기술 설계/디버깅",
              "tasks": 19,
              "share": 29.2,
              "primaryUse": "LangGraph, GitLab CI/CD, MSA, DB, 서버/로드밸런서 구성 검토",
              "color": "#0f8b8d"
          },
          {
              "tool": "제품/안전 AI 탐색",
              "tasks": 7,
              "share": 10.8,
              "primaryUse": "RiskZero 사고예측, 설계변경, Observia 협업, 현장 AI 인프라",
              "color": "#2f8f46"
          },
          {
              "tool": "문서/업무 생산성",
              "tasks": 7,
              "share": 10.8,
              "primaryUse": "운영 매뉴얼, 보고 프롬프트, WBS, 문서 검토와 마스킹",
              "color": "#c58612"
          },
          {
              "tool": "AI 운영/계정 확인",
              "tasks": 5,
              "share": 7.7,
              "primaryUse": "Claude API 토큰, Team Plan, ChatGPT 요금제, RPD 용어 확인",
              "color": "#9a6b36"
          },
          {
              "tool": "개인/일반 상담",
              "tasks": 11,
              "share": 16.9,
              "primaryUse": "게임, 하드웨어 성능, 건강·생활·뉴스성 질의",
              "color": "#7d6ca7"
          },
          {
              "tool": "미분류/짧은 대화",
              "tasks": 16,
              "share": 24.6,
              "primaryUse": "제목 없음 또는 첨부만 있는 대화라 추가 태그 필요",
              "color": "#5f6f8c"
          }
      ],
      "topProjects": [
          {
              "rank": 1,
              "target": "개발/아키텍처·DB",
              "scale": "19대화",
              "tasks": 19,
              "theme": "LangGraph, GitLab, MSA, DB 표준, 서버/로드밸런서"
          },
          {
              "rank": 2,
              "target": "미분류/짧은 대화",
              "scale": "16대화",
              "tasks": 16,
              "theme": "제목 없음, 짧은 입력, 첨부 기반 대화"
          },
          {
              "rank": 3,
              "target": "개인/게임·생활 질의",
              "scale": "11대화",
              "tasks": 11,
              "theme": "Diablo 2, 하드웨어 성능, 생활·건강 질의"
          },
          {
              "rank": 4,
              "target": "RiskZero 제품·AI 인프라",
              "scale": "7대화",
              "tasks": 7,
              "theme": "설계변경, 사고예측, Observia, NCP, LoRa"
          },
          {
              "rank": 5,
              "target": "문서·보고·업무 생산성",
              "scale": "7대화",
              "tasks": 7,
              "theme": "운영 매뉴얼, WBS, 마스킹, 문서 검토"
          },
          {
              "rank": 6,
              "target": "AI 비용·계정 운영",
              "scale": "5대화",
              "tasks": 5,
              "theme": "Claude/ChatGPT 요금, RPD, API token"
          }
      ],
      "focusDays": [
          {
              "date": "2026-05-11",
              "label": "05/11",
              "tasks": 8,
              "focus": "초기 Claude 계정·프로젝트·CLI·가격 확인"
          },
          {
              "date": "2026-06-24",
              "label": "06/24",
              "tasks": 4,
              "focus": "LangGraph, RPD, ChatGPT 요금, AI 모델 정보"
          },
          {
              "date": "2026-05-22",
              "label": "05/22",
              "tasks": 4,
              "focus": "사고예측, DB 규칙, 개인 질의"
          },
          {
              "date": "2026-06-04",
              "label": "06/04",
              "tasks": 4,
              "focus": "메모 저장, WBS, 실시간 질문, 일반 질의"
          },
          {
              "date": "2026-05-15",
              "label": "05/15",
              "tasks": 3,
              "focus": "게임 장문 대화와 DB/서버 오류"
          },
          {
              "date": "2026-05-28",
              "label": "05/28",
              "tasks": 3,
              "focus": "하드웨어 성능과 업무 보고"
          },
          {
              "date": "2026-06-26",
              "label": "06/26",
              "tasks": 3,
              "focus": "서버 인프라, HTTPS 인증서, Claude CLI"
          },
          {
              "date": "2026-05-17",
              "label": "05/17",
              "tasks": 3,
              "focus": "생활 질의와 첨부 기반 짧은 대화"
          }
      ],
      "representativeTasks": [
          {
              "id": 1,
              "date": "2026-06-22",
              "title": "설계변경 업무 누락 방지 개선안",
              "request": "8개 사용자 메시지와 52개 첨부 기반 설계변경 프로세스 개선 질의",
              "result": "ECO/설계변경 업무 누락 방지를 위한 체크·개선 포인트 정리",
              "tool": "제품/안전 AI 탐색",
              "category": "RiskZero 제품·산업안전/AI 인프라",
              "outputs": [
                  "CHAT",
                  "FILES"
              ],
              "status": "완료"
          },
          {
              "id": 2,
              "date": "2026-05-14",
              "title": "GitLab CI/CD에서 Claude 코드 리뷰 설정",
              "request": "18개 사용자 메시지, 12개 첨부 기반 코드 리뷰 자동화 검토",
              "result": "GitLab merge request 자동 리뷰와 pr-agent 설정 방향 정리",
              "tool": "기술 설계/디버깅",
              "category": "개발/아키텍처·DB",
              "outputs": [
                  "CHAT",
                  "FILES"
              ],
              "status": "완료"
          },
          {
              "id": 3,
              "date": "2026-06-24",
              "title": "LangGraph 개념 이해하기",
              "request": "14개 사용자 메시지와 4개 첨부 기반 LangGraph 개념 학습",
              "result": "그래프 기반 LLM 워크플로와 에이전트 설계 개념 정리",
              "tool": "기술 설계/디버깅",
              "category": "개발/아키텍처·DB",
              "outputs": [
                  "CHAT",
                  "FILES"
              ],
              "status": "완료"
          },
          {
              "id": 4,
              "date": "2026-06-25",
              "title": "Obervia AI와 리스크제로 협업 회의록",
              "request": "m4a 첨부 기반 회의록 생성 요청",
              "result": "Claude export에는 오디오 첨부 처리 한계가 남아 전사/요약 도구 연계 필요",
              "tool": "제품/안전 AI 탐색",
              "category": "RiskZero 제품·산업안전/AI 인프라",
              "outputs": [
                  "CHAT",
                  "FILES"
              ],
              "status": "진행"
          },
          {
              "id": 5,
              "date": "2026-05-22",
              "title": "사고예측 축약",
              "request": "20개 사용자 메시지 기반 사고예측 내용 축약",
              "result": "RiskZero 제품/산업안전 메시지 정리",
              "tool": "제품/안전 AI 탐색",
              "category": "RiskZero 제품·산업안전/AI 인프라",
              "outputs": [
                  "CHAT"
              ],
              "status": "완료"
          },
          {
              "id": 6,
              "date": "2026-06-26",
              "title": "서버 접속 정보 및 인프라 구성 정리",
              "request": "서버 접속과 인프라 구성 정리 요청",
              "result": "운영 인프라 문서화와 로드밸런서/HTTPS 설정 확인 흐름으로 연결",
              "tool": "기술 설계/디버깅",
              "category": "개발/아키텍처·DB",
              "outputs": [
                  "CHAT"
              ],
              "status": "완료"
          }
      ],
      "monthlyUsage": [
          {
              "month": "2026-05",
              "conversations": 36
          },
          {
              "month": "2026-06",
              "conversations": 29
          }
      ],
      "fileTypeUsage": [
          {
              "ext": "unknown",
              "count": 84
          },
          {
              "ext": "jpg",
              "count": 39
          },
          {
              "ext": "txt",
              "count": 13
          },
          {
              "ext": "jpeg",
              "count": 11
          },
          {
              "ext": "png",
              "count": 11
          },
          {
              "ext": "sql",
              "count": 6
          },
          {
              "ext": "xlsx",
              "count": 1
          },
          {
              "ext": "pptx",
              "count": 1
          },
          {
              "ext": "m4a",
              "count": 1
          },
          {
              "ext": "hwp",
              "count": 1
          }
      ],
      "topTerms": [
          {
              "term": "Claude",
              "count": 13
          },
          {
              "term": "DB/데이터베이스",
              "count": 7
          },
          {
              "term": "서버/인프라",
              "count": 6
          },
          {
              "term": "AI",
              "count": 6
          },
          {
              "term": "설계변경",
              "count": 5
          },
          {
              "term": "GitLab/MSA",
              "count": 5
          },
          {
              "term": "문서",
              "count": 5
          },
          {
              "term": "RiskZero",
              "count": 4
          },
          {
              "term": "요금/토큰",
              "count": 4
          },
          {
              "term": "게임/생활",
              "count": 4
          }
      ],
      "modelUsage": [
          {
              "model": "human messages",
              "count": 804
          },
          {
              "model": "assistant messages",
              "count": 809
          }
      ],
      "sourceFiles": [
          {
              "fileName": "conversations.json",
              "sourceType": "conversations",
              "records": 65,
              "role": "대화·메시지·첨부 원천",
              "detail": "1,613메시지, 사용자 804/assistant 809, 첨부 168개, 첨부 대화 19건",
              "verification": "uuid, name, summary, account.uuid, chat_messages 구조 확인"
          },
          {
              "fileName": "memories.json",
              "sourceType": "memories",
              "records": 4,
              "role": "계정별 기억/맥락 요약",
              "detail": "4개 account_uuid의 memory text 10,122자에서 업무/개인 맥락 신호 확인",
              "verification": "conversations_memory, account_uuid 구조 확인"
          },
          {
              "fileName": "users.json",
              "sourceType": "users",
              "records": 14,
              "role": "계정 디렉터리 매핑",
              "detail": "riskzero.kr 계정 14개 중 대화 export 활성 계정 8개 매핑",
              "verification": "uuid, full_name, email domain 확인, 전화번호/이메일 원문 미표시"
          },
          {
              "fileName": "019e1ef4-bf3e-73ea-ab4d-20d8f279b86e.json",
              "sourceType": "project",
              "records": 1,
              "role": "Claude 프로젝트",
              "detail": "scsms 프로젝트, private, 문서 0건",
              "verification": "project uuid/name/is_private/docs 확인"
          },
          {
              "fileName": "019e19f4-3aeb-7315-95b4-7952dcd1ba06.json",
              "sourceType": "project",
              "records": 1,
              "role": "Claude 프로젝트",
              "detail": "이름 미지정 private 프로젝트, 문서 0건",
              "verification": "project uuid/name/is_private/docs 확인"
          },
          {
              "fileName": "019e19f3-0767-74a3-96be-b1370877e3a1.json",
              "sourceType": "project",
              "records": 1,
              "role": "Claude 프로젝트",
              "detail": "이름 미지정 private 프로젝트, 문서 0건",
              "verification": "project uuid/name/is_private/docs 확인"
          },
          {
              "fileName": "019e1593-6895-705d-bc09-fca23444cc7b.json",
              "sourceType": "project",
              "records": 1,
              "role": "Claude 프로젝트",
              "detail": "Riskzero 프로젝트, org tool search 목적 설명, 문서 0건",
              "verification": "project uuid/name/description/docs 확인"
          },
          {
              "fileName": "019e158d-ca08-703a-b4b2-a41e7ad59245.json",
              "sourceType": "project",
              "records": 1,
              "role": "Claude 프로젝트",
              "detail": "gh 프로젝트, private, 문서 0건",
              "verification": "project uuid/name/is_private/docs 확인"
          },
          {
              "fileName": "019e14da-9543-728e-8057-adb4fb806d74.json",
              "sourceType": "project",
              "records": 1,
              "role": "Claude starter 프로젝트",
              "detail": "How to use Claude 프로젝트, starter, 문서 1건 18,195자",
              "verification": "project docs[0].content 길이와 created_at 확인"
          }
      ],
      "usageTopics": [
          {
              "topic": "개발/아키텍처·DB",
              "conversations": 19,
              "messages": 384,
              "messageShare": 23.8,
              "attachments": 37,
              "businessUse": "개발 표준, 배포 방식, 코드 리뷰 자동화, DB/인프라 설계 판단 보조",
              "evidence": "GitLab CI/CD, LangGraph, MSA, Docker-compose vs k3s, TimescaleDB, 서버/로드밸런서",
              "color": "#0f8b8d"
          },
          {
              "topic": "개인/게임·생활 질의",
              "conversations": 11,
              "messages": 1021,
              "messageShare": 63.3,
              "attachments": 45,
              "businessUse": "업무성과와 분리해서 비용/활용률 판단에 반영할 개인성 사용량",
              "evidence": "Diablo 2 장문 대화, 하드웨어 게임 성능, 생활·건강·뉴스성 질의",
              "color": "#7d6ca7"
          },
          {
              "topic": "RiskZero 제품·산업안전/AI 인프라",
              "conversations": 7,
              "messages": 90,
              "messageShare": 5.6,
              "attachments": 56,
              "businessUse": "RiskZero 제품 메시지, 현장 안전 AI, 협업 회의록, 설계변경 업무 개선 보조",
              "evidence": "설계변경 개선안, Observia 협업 회의록, 사고예측, LoRa, NCP 알림톡",
              "color": "#2f8f46"
          },
          {
              "topic": "문서·보고·업무 생산성",
              "conversations": 7,
              "messages": 34,
              "messageShare": 2.1,
              "attachments": 3,
              "businessUse": "운영 매뉴얼, 보고 프롬프트, 문서 검토, 일정표 전환과 마스킹 기준 정리",
              "evidence": "프로젝트 코드 기반 운영 매뉴얼, WBS 간트차트, HWP 검토, 연락처 마스킹",
              "color": "#c58612"
          },
          {
              "topic": "AI 비용·계정/도구 운영",
              "conversations": 5,
              "messages": 24,
              "messageShare": 1.5,
              "attachments": 0,
              "businessUse": "구독/토큰/모델 설정을 비용 관리와 운영 체크리스트로 연결",
              "evidence": "Claude API token usage, 팀플랜 가격, ChatGPT 요금제, RPD, opus 기본 모델",
              "color": "#9a6b36"
          },
          {
              "topic": "미분류/짧은 대화",
              "conversations": 16,
              "messages": 60,
              "messageShare": 3.7,
              "attachments": 27,
              "businessUse": "추가 제목/목적 태그 없이는 업무 활용으로 단정하기 어려운 기록",
              "evidence": "제목 없음, 인사, 빈 대화, 첨부만 있는 짧은 대화",
              "color": "#5f6f8c"
          }
      ],
      "accountUsage": [
          {
              "accountLabel": "wody",
              "conversations": 19,
              "messages": 1131,
              "attachments": 59,
              "primaryUse": "개인/게임·생활 질의",
              "verification": "users.json uuid 매핑, conversations.account.uuid 19건"
          },
          {
              "accountLabel": "배현철",
              "conversations": 16,
              "messages": 260,
              "attachments": 73,
              "primaryUse": "개발/아키텍처·DB",
              "verification": "users.json uuid 매핑, MSA/GitLab/LangGraph/설계변경 대화 확인"
          },
          {
              "accountLabel": "norisk",
              "conversations": 4,
              "messages": 62,
              "attachments": 1,
              "primaryUse": "RiskZero 제품·산업안전/AI 인프라",
              "verification": "users.json uuid 매핑, 사고예측/NCP/DB 인덱스 대화 확인"
          },
          {
              "accountLabel": "myGu",
              "conversations": 6,
              "messages": 50,
              "attachments": 7,
              "primaryUse": "DB 규칙·메모·짧은 대화",
              "verification": "users.json uuid 매핑, memories.json에도 계정 memory 존재"
          },
          {
              "accountLabel": "김성진",
              "conversations": 3,
              "messages": 36,
              "attachments": 0,
              "primaryUse": "아키텍처·Claude 사용법",
              "verification": "users.json uuid 매핑, 소프트웨어 아키텍처/실시간 질문 대화 확인"
          },
          {
              "accountLabel": "성진",
              "conversations": 6,
              "messages": 32,
              "attachments": 27,
              "primaryUse": "첨부 기반 짧은 대화",
              "verification": "users.json uuid 매핑, 제목 없음/첨부 중심 대화 확인"
          },
          {
              "accountLabel": "전우성",
              "conversations": 8,
              "messages": 32,
              "attachments": 0,
              "primaryUse": "문서·업무 생산성",
              "verification": "users.json uuid 매핑, 운영 매뉴얼/일일 업무 보고/CLI 설치 대화 확인"
          },
          {
              "accountLabel": "김재우",
              "conversations": 3,
              "messages": 10,
              "attachments": 1,
              "primaryUse": "AI 용어·협업 회의록",
              "verification": "users.json uuid 매핑, RPD/Observia 회의록 대화 확인"
          }
      ],
      "projectExports": [
          {
              "id": "019e14da-9543-728e-8057-adb4fb806d74",
              "name": "How to use Claude",
              "visibility": "starter/public",
              "docs": 1,
              "fileName": "019e14da-9543-728e-8057-adb4fb806d74.json",
              "createdAt": "2026-05-11",
              "updatedAt": "2026-05-11",
              "useCase": "Claude 사용법 starter 문서 보관",
              "verification": "docs 1건, content 18,195자"
          },
          {
              "id": "019e158d-ca08-703a-b4b2-a41e7ad59245",
              "name": "gh",
              "visibility": "private",
              "docs": 0,
              "fileName": "019e158d-ca08-703a-b4b2-a41e7ad59245.json",
              "createdAt": "2026-05-11",
              "updatedAt": "2026-05-11",
              "useCase": "GitHub/개발 작업용 프로젝트 공간",
              "verification": "docs 0건"
          },
          {
              "id": "019e1593-6895-705d-bc09-fca23444cc7b",
              "name": "Riskzero",
              "visibility": "org",
              "docs": 0,
              "fileName": "019e1593-6895-705d-bc09-fca23444cc7b.json",
              "createdAt": "2026-05-11",
              "updatedAt": "2026-05-11",
              "useCase": "RiskZero 관련 조직 도구 검색/질의 공간",
              "verification": "description에 connected tools 검색 목적 명시, docs 0건"
          },
          {
              "id": "019e19f3-0767-74a3-96be-b1370877e3a1",
              "name": "미지정 프로젝트 A",
              "visibility": "private",
              "docs": 0,
              "fileName": "019e19f3-0767-74a3-96be-b1370877e3a1.json",
              "createdAt": "2026-05-12",
              "updatedAt": "2026-05-16",
              "useCase": "이름 없는 개인 프로젝트 공간",
              "verification": "name 빈 값, docs 0건"
          },
          {
              "id": "019e19f4-3aeb-7315-95b4-7952dcd1ba06",
              "name": "미지정 프로젝트 B",
              "visibility": "private",
              "docs": 0,
              "fileName": "019e19f4-3aeb-7315-95b4-7952dcd1ba06.json",
              "createdAt": "2026-05-12",
              "updatedAt": "2026-05-17",
              "useCase": "이름 없는 개인 프로젝트 공간",
              "verification": "name 빈 값, docs 0건"
          },
          {
              "id": "019e1ef4-bf3e-73ea-ab4d-20d8f279b86e",
              "name": "scsms",
              "visibility": "private",
              "docs": 0,
              "fileName": "019e1ef4-bf3e-73ea-ab4d-20d8f279b86e.json",
              "createdAt": "2026-05-13",
              "updatedAt": "2026-05-13",
              "useCase": "SCSMS 관련 프로젝트 공간",
              "verification": "docs 0건"
          }
      ],
      "memoryUsage": [
          {
              "accountLabel": "김재우",
              "characters": 1066,
              "signal": "RiskZero/Observia 협업 회의록, AI API·PRD 용어 학습 맥락",
              "verification": "memories.json account_uuid 2a804744... 매핑"
          },
          {
              "accountLabel": "myGu",
              "characters": 1204,
              "signal": "업무 맥락은 거의 없고 기억력/집중 관련 개인 질의 신호",
              "verification": "memories.json account_uuid d6438e01... 매핑"
          },
          {
              "accountLabel": "배현철",
              "characters": 4412,
              "signal": "설계변경/ECO, MSA 백엔드, gRPC/REST, CQRS 등 업무 기술 맥락",
              "verification": "memories.json account_uuid d130fb4c... 매핑"
          },
          {
              "accountLabel": "wody",
              "characters": 3440,
              "signal": "Diablo 2와 생활 질의가 top of mind로 요약",
              "verification": "memories.json account_uuid 67695cb8... 매핑"
          }
      ],
      "userDirectory": {
          "totalUsers": 14,
          "activeAccounts": 8,
          "mappedAccounts": 8,
          "domain": "riskzero.kr",
          "privacyNote": "users.json은 계정명 매핑에만 사용하고 이메일 주소와 전화번호 원문은 대시보드에 노출하지 않습니다."
      },
      "patterns": [
          "Claude export는 65개 대화 중 38개가 업무형 활용이고, 개인/게임·생활 질의 11개는 메시지 기준 63.3%를 차지합니다.",
          "첨부 기반 대화는 19건이며 txt, 이미지, sql, xlsx, pptx, m4a, hwp 파일을 함께 다룬 기록이 확인됩니다.",
          "개발/아키텍처·DB 활용은 19대화, 384메시지, 첨부 37개로 업무형 Claude 사용 중 가장 구체적인 실행 신호입니다.",
          "6월 신규 사용 이력에는 설계변경 업무 개선, LangGraph 학습, Observia 협업 회의록, 서버/로드밸런서 설정이 추가됐습니다.",
          "프로젝트 export 6건 중 운영 프로젝트는 대부분 문서가 비어 있어 프로젝트 공간 존재는 확인되지만 산출물 근거는 conversations 중심으로 봐야 합니다.",
          "users.json과 memories.json을 결합하면 활성 계정 8개와 업무/개인 맥락 4개 계정의 memory 신호를 함께 검증할 수 있습니다."
      ]
  },
};
