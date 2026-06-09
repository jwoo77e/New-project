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
  insightAnalysis: {
    sourceLabel: "Genspark 작업 히스토리와 ChatGPT export 통합 분석",
    period: "2025-02-21 ~ 2026-05-12",
    totalRecords: 1650,
    totalMessages: 39737,
    attachmentBasedRecords: 414,
    outputOrientedRecords: 693,
    guideNeededCount: 6,
    executiveSummary: [
      "AI 활용은 단순 질의보다 개발 문제 해결, 산업안전 제안, 문서 산출, 대시보드 운영처럼 실제 업무 산출물 생산에 집중되어 있습니다.",
      "가장 큰 병목은 모델 성능보다 프롬프트 표준화 부족입니다. 입력 자료, 목표 산출물, 검증 기준이 누락될 때 장문 재작업이 반복됩니다.",
      "공공 제안·법령 분석·개발 오류 해결은 재사용 가능한 프롬프트 템플릿으로 고정하면 업무 시간이 크게 줄어드는 영역입니다.",
      "현재 데이터만으로는 최종 산출물이 실제 제출·배포·영업에 얼마나 쓰였는지까지 닫히지 않습니다. 사용 후 태깅과 결과 피드백이 다음 개선 지점입니다.",
    ],
    topicInsights: [
      {
        topic: "개발/배포·시스템 문제 해결",
        tasks: 484,
        share: 29.3,
        signal: "최대 활용 영역",
        businessUse: "API, 서버, 배포, 권한, BigQuery, 네트워크 오류를 실제 수정 작업으로 연결",
        evidence: "ChatGPT export의 개발/코딩 대화 484건과 장문 오류 해결 대화가 핵심 근거",
        color: "#0f8b8d",
      },
      {
        topic: "산업안전·공공 제안/제품 전략",
        tasks: 381,
        share: 23.1,
        signal: "매출 기회와 직접 연결",
        businessUse: "순천시, LH, SH, 도로공사, 중부발전 제안서와 RiskZero/ZeroGuard 자료 생산",
        evidence: "Genspark 제안·법령·현장안전 작업과 ChatGPT 산업안전/리스크 대화 통합",
        color: "#2f8f46",
      },
      {
        topic: "일반 질의·업무 판단 보조",
        tasks: 286,
        share: 17.3,
        signal: "탐색형 사용",
        businessUse: "짧은 의사결정, 비교, 개념 확인, 업무 방향성 점검",
        evidence: "분류 키워드가 약한 일반 상담성 ChatGPT 대화 286건",
        color: "#7d6ca7",
      },
      {
        topic: "문서·보고·회의 산출물",
        tasks: 269,
        share: 16.3,
        signal: "반복 산출물 자동화 후보",
        businessUse: "보고서, 회의록, 계약/공문, 제안서, 발표원고 작성과 검토",
        evidence: "ChatGPT 문서/보고서 231건과 Genspark 문서·회의록 작업 결합",
        color: "#c58612",
      },
      {
        topic: "기획·전략·브랜드/디자인",
        tasks: 154,
        share: 9.3,
        signal: "메시지 정리와 시각화",
        businessUse: "사업계획, 영업전략, 브랜드 방향, 포스터, UI, 슬라이드 구성",
        evidence: "기획/전략 및 이미지/디자인성 활용을 통합 집계",
        color: "#5f6f8c",
      },
      {
        topic: "데이터·대시보드·계정/자동화",
        tasks: 76,
        share: 4.6,
        signal: "운영 체계화 필요",
        businessUse: "AI 비용, 사용량, BigQuery, Workspace 권한, API 수집 자동화",
        evidence: "대시보드 구축·권한 설정·데이터 수집 관련 대화와 작업",
        color: "#9a6b36",
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
      "ChatGPT, Genspark, Workspace, API 비용 데이터가 서로 다른 포맷으로 쌓여 업무 단위의 ROI를 바로 연결하기 어렵습니다.",
      "프롬프트에는 실제 사용 목적이 보이지만, 최종 산출물이 제출·배포·영업에 사용됐는지 여부는 별도 태깅이 부족합니다.",
      "첨부 파일명과 대화 제목만으로는 품질, 재사용 가능성, 실패 원인을 완전히 판단하기 어렵습니다.",
      "일반 질의와 실무 산출형 요청이 같은 로그에 섞여 있어 교육 대상과 자동화 대상을 구분하는 기준이 필요합니다.",
    ],
    improvementActions: [
      {
        title: "업무 유형 태그 표준화",
        currentSignal: "1,650건 중 도구별 원천은 있으나 업무 목적 태그가 수동 추정에 의존",
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
    source: {
      name: "ChatGPT 사용 이력 Export 분석",
      collectedAt: "2026-05-14",
      period: "2025-02-21 ~ 2026-05-12",
      accountLabel: "ChatGPT export",
      note: "15개 대화 JSON과 995개 첨부 파일명을 집계",
    },
    totalConversations: 1491,
    totalMessages: 39737,
    totalUserMessages: 16246,
    totalAssistantMessages: 23491,
    totalAttachments: 5039,
    conversationsWithFiles: 401,
    attachmentsFromFiles: 995,
    categoryUsage: [
      {
        name: "개발/코딩",
        tasks: 484,
        share: 32.5,
        note: "서버, API, 배포, 오류 진단, 자동화 스크립트 중심",
        color: "#0f8b8d",
      },
      {
        name: "일반 질의",
        tasks: 286,
        share: 19.2,
        note: "분류 키워드가 약한 일반 상담성 대화",
        color: "#7d6ca7",
      },
      {
        name: "산업안전/리스크",
        tasks: 264,
        share: 17.7,
        note: "RiskZero/ZeroGuard, 산업안전, CCTV/IoT, 위험성평가",
        color: "#e85d4f",
      },
      {
        name: "문서/보고서",
        tasks: 231,
        share: 15.5,
        note: "보고서, 회의록, 계약/공문, 제안서 초안과 검토",
        color: "#2f8f46",
      },
      {
        name: "이미지/디자인",
        tasks: 76,
        share: 5.1,
        note: "이미지 해석, UI, 슬라이드, 포스터, 로고",
        color: "#6b8f71",
      },
      {
        name: "기획/전략",
        tasks: 62,
        share: 4.2,
        note: "사업계획, 영업전략, 운영계획, 브랜드 방향성",
        color: "#5f6f8c",
      },
      {
        name: "데이터/대시보드",
        tasks: 50,
        share: 3.4,
        note: "AI 비용, 사용량, 엑셀, BigQuery, 시각화와 예측",
        color: "#c58612",
      },
      {
        name: "관리/업무자동화",
        tasks: 38,
        share: 2.5,
        note: "Workspace, 권한, 계정, 일정/메일, 환경설정",
        color: "#9a6b36",
      },
    ],
    toolUsage: [
      {
        tool: "코딩/디버깅",
        tasks: 502,
        share: 33.7,
        primaryUse: "API, 서버, 배포, 오류 해결, 스크립트 작성",
        color: "#0f8b8d",
      },
      {
        tool: "일반 상담/질의",
        tasks: 392,
        share: 26.3,
        primaryUse: "단기 질의와 일반 업무 보조",
        color: "#7d6ca7",
      },
      {
        tool: "문서 작성/검토",
        tasks: 294,
        share: 19.7,
        primaryUse: "보고서, 제안서, 회의록, 계약/공문 검토",
        color: "#2f8f46",
      },
      {
        tool: "전략 기획",
        tasks: 104,
        share: 7,
        primaryUse: "사업계획, 영업전략, 운영계획, 브랜딩",
        color: "#5f6f8c",
      },
      {
        tool: "이미지/디자인 지원",
        tasks: 92,
        share: 6.2,
        primaryUse: "이미지 해석, UI/슬라이드, 디자인 자산",
        color: "#6b8f71",
      },
      {
        tool: "데이터 분석",
        tasks: 62,
        share: 4.2,
        primaryUse: "엑셀, 비용, 사용량, 대시보드, 예측",
        color: "#c58612",
      },
      {
        tool: "업무 자동화/관리",
        tasks: 45,
        share: 3,
        primaryUse: "계정/권한, Workspace, 일정, 환경설정",
        color: "#9a6b36",
      },
    ],
    topProjects: [
      { rank: 1, target: "기타 업무", scale: "기타", tasks: 865, theme: "일반 질의와 보조 업무" },
      { rank: 2, target: "개발/배포 운영", scale: "서비스 운영", tasks: 171, theme: "서비스 배포, 서버 설정, API/DB 문제 해결" },
      { rank: 3, target: "공공/산업안전 제안", scale: "제안·수주", tasks: 152, theme: "스마트 안전관리 플랫폼 제안/수주 지원" },
      { rank: 4, target: "RiskZero/ZeroGuard", scale: "제품·사업 운영", tasks: 108, theme: "제품 운영, 산업안전 AI, 사업자료 생산" },
      { rank: 5, target: "문서/회의 업무", scale: "내부 운영", tasks: 89, theme: "보고서, 회의록, 계약/공문 정리" },
      { rank: 6, target: "브랜드/디자인", scale: "마케팅 자산", tasks: 79, theme: "슬라이드, 이미지, 포스터, UI/브랜드 자산" },
      { rank: 7, target: "AI 비용/활용 대시보드", scale: "전사 AI 운영", tasks: 27, theme: "API 비용·활용성·Workspace 사용량 관리" },
    ],
    focusDays: [
      { date: "2025-09-10", label: "09/10", tasks: 13, focus: "개발/코딩" },
      { date: "2025-11-10", label: "11/10", tasks: 16, focus: "개발/코딩" },
      { date: "2025-11-11", label: "11/11", tasks: 14, focus: "산업안전/리스크" },
      { date: "2025-11-12", label: "11/12", tasks: 16, focus: "일반 질의" },
      { date: "2025-11-17", label: "11/17", tasks: 20, focus: "개발/코딩" },
      { date: "2025-11-26", label: "11/26", tasks: 15, focus: "개발/코딩" },
      { date: "2025-12-01", label: "12/01", tasks: 14, focus: "개발/코딩" },
      { date: "2025-12-10", label: "12/10", tasks: 19, focus: "일반 질의" },
    ],
    representativeTasks: [
      {
        id: 1,
        date: "2025-08-08",
        title: "API 항목 추출 분석",
        request: "343개 사용자 메시지, 43개 첨부 기반 대화",
        result: "개발/코딩 / 개발·배포 운영 관련 장문 협업",
        tool: "코딩/디버깅",
        category: "개발/코딩",
        outputs: ["CHAT", "FILES"],
        status: "완료",
      },
      {
        id: 2,
        date: "2025-09-01",
        title: "Spring 배치 프로그램 설정",
        request: "239개 사용자 메시지, 108개 첨부 기반 대화",
        result: "개발/코딩 / RiskZero·ZeroGuard 관련 장문 협업",
        tool: "코딩/디버깅",
        category: "개발/코딩",
        outputs: ["CHAT", "FILES"],
        status: "완료",
      },
      {
        id: 3,
        date: "2025-05-13",
        title: "데이터 정제 작업",
        request: "268개 사용자 메시지, 69개 첨부 기반 대화",
        result: "산업안전/리스크 관련 데이터 정리 협업",
        tool: "문서 작성/검토",
        category: "산업안전/리스크",
        outputs: ["CHAT", "FILES"],
        status: "완료",
      },
      {
        id: 4,
        date: "2025-10-14",
        title: "풍속 센서 설명",
        request: "414개 사용자 메시지, 40개 첨부 기반 대화",
        result: "센서·현장 데이터 해석과 설명 정리",
        tool: "업무 자동화/관리",
        category: "관리/업무자동화",
        outputs: ["CHAT", "FILES"],
        status: "완료",
      },
      {
        id: 5,
        date: "2025-08-27",
        title: "Axios 네트워크 오류 원인",
        request: "89개 사용자 메시지, 30개 첨부 기반 대화",
        result: "웹/API 네트워크 오류 진단과 수정 방향 정리",
        tool: "코딩/디버깅",
        category: "개발/코딩",
        outputs: ["CHAT", "FILES"],
        status: "완료",
      },
      {
        id: 6,
        date: "2025-03-27",
        title: "Spring Boot SW 아키텍처",
        request: "205개 사용자 메시지, 8개 첨부 기반 대화",
        result: "Spring Boot 기반 시스템 구조와 구현 방향 검토",
        tool: "코딩/디버깅",
        category: "개발/코딩",
        outputs: ["CHAT", "FILES"],
        status: "완료",
      },
    ],
    monthlyUsage: [
      { month: "2025-02", conversations: 25 },
      { month: "2025-03", conversations: 59 },
      { month: "2025-04", conversations: 100 },
      { month: "2025-05", conversations: 73 },
      { month: "2025-06", conversations: 93 },
      { month: "2025-07", conversations: 122 },
      { month: "2025-08", conversations: 100 },
      { month: "2025-09", conversations: 189 },
      { month: "2025-10", conversations: 138 },
      { month: "2025-11", conversations: 221 },
      { month: "2025-12", conversations: 171 },
      { month: "2026-01", conversations: 74 },
      { month: "2026-02", conversations: 31 },
      { month: "2026-03", conversations: 48 },
      { month: "2026-04", conversations: 36 },
      { month: "2026-05", conversations: 11 },
    ],
    fileTypeUsage: [
      { ext: "unknown", count: 2338 },
      { ext: "jpg", count: 1070 },
      { ext: "png", count: 871 },
      { ext: "java", count: 125 },
      { ext: "jpeg", count: 103 },
      { ext: "pdf", count: 98 },
      { ext: "xlsx", count: 97 },
      { ext: "json", count: 40 },
      { ext: "yml", count: 36 },
      { ext: "xml", count: 35 },
    ],
    topTerms: [
      { term: "설명", count: 88 },
      { term: "요청", count: 66 },
      { term: "설정", count: 53 },
      { term: "해결", count: 53 },
      { term: "오류", count: 49 },
      { term: "AI", count: 33 },
      { term: "비교", count: 32 },
      { term: "차이", count: 28 },
      { term: "파일", count: 26 },
      { term: "문제", count: 25 },
      { term: "시스템", count: 24 },
      { term: "쿼리", count: 24 },
    ],
    modelUsage: [
      { model: "gpt-4o", count: 8209 },
      { model: "gpt-5", count: 7203 },
      { model: "gpt-5-thinking", count: 4881 },
      { model: "gpt-5-instant", count: 3319 },
      { model: "gpt-5-1", count: 2374 },
      { model: "gpt-5-2-instant", count: 1450 },
      { model: "gpt-5-1-instant", count: 1216 },
      { model: "gpt-5-2", count: 1169 },
    ],
    patterns: [
      "ChatGPT는 1,491개 대화 중 개발/코딩 484건, 산업안전/리스크 264건, 문서/보고서 231건으로 실무형 활용이 강합니다.",
      "첨부 기반 대화가 401건이며 이미지, 코드, PDF, 엑셀을 함께 다루는 다중 입력형 업무가 반복됩니다.",
      "2025년 9월~12월 사용량이 급증했고, 11월에는 221개 대화로 가장 높은 집중도를 보였습니다.",
      "장문 협업 상위 대화는 API 분석, Spring 배치, 데이터 정제, 센서 설명, 네트워크 오류처럼 실제 운영 문제 해결에 집중됩니다.",
    ],
  },
};
