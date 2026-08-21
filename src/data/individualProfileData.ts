export type IndividualProfilePromptTopic = {
  label: string;
  count: number;
  description: string;
  examples: string[];
  color: string;
};

export type IndividualProfileFileBreakdown = {
  label: string;
  count: number;
  description: string;
  color: string;
  unit?: string;
};

export type IndividualProfileHighlight = {
  title: string;
  category: string;
  summary: string;
  result: string;
};

export type IndividualProfileMonthlyInsight = {
  topicTitle?: string;
  topicBasisLabel?: string;
  promptTopics: IndividualProfilePromptTopic[];
  highlights: IndividualProfileHighlight[];
};

export type IndividualProfileData = {
  email: string;
  displayName: string;
  title: string;
  department: string;
  approvalOwner: string;
  accountLabel?: string;
  attributionMode?: "individual" | "shared";
  attributionLabel?: string;
  measurementNote?: string;
  costBasisNote?: string;
  sourceLinks?: Array<{
    label: string;
    url: string;
  }>;
  drive: {
    folderName: string;
    folderUrl: string;
    collectedAt: string;
    period: string;
    fileCount: number;
    childFolderCount: number;
    scannedFolderCount: number;
    scanErrors: number;
    promptFiles: number;
    responseFiles: number;
    pairedSessions: number;
    responseOnlySessions: number;
    outputAndSupportFiles: number;
    archiveFiles: number;
    metadataDateAnomalies: number;
    rootFolderCount?: number;
    activityMetricLabel?: string;
    activityMetricDetail?: string;
    trendTitle?: string;
    trendSeriesLabel?: string;
    topicBasisLabel?: string;
    fileTotalLabel?: string;
    analyzedFileCount?: number;
    outputMetricLabel?: string;
    outputMetricValue?: number;
    outputMetricUnit?: string;
    outputMetricDetail?: string;
    topicTitle?: string;
    inventoryTitle?: string;
    inventorySummaryLabel?: string;
    inventoryFootnote?: string;
  };
  monthlyPromptCounts: Array<{ month: string; prompts: number }>;
  dailyPromptCounts: Array<{ date: string; prompts: number }>;
  insightMonth?: string;
  monthlyInsights?: Readonly<Record<string, IndividualProfileMonthlyInsight>>;
  promptTopics: IndividualProfilePromptTopic[];
  fileBreakdown: IndividualProfileFileBreakdown[];
  highlights: IndividualProfileHighlight[];
  notes: string[];
};

export const kimJaewooProfileData: IndividualProfileData = {
  email: "jaewoo.kim@riskzero.kr",
  displayName: "김재우 부장",
  title: "부장",
  department: "기술연구소",
  approvalOwner: "김재우 부장",
  drive: {
    folderName: "김재우 Claude Drive 산출물 저장소",
    folderUrl: "https://drive.google.com/drive/folders/1Q2OorOdMlPn8xRBzuHWyY5kqGHxRYpPZ?usp=drive_link",
    collectedAt: "2026-08-06 15:19 KST",
    period: "2026-06-24 ~ 2026-08-06",
    fileCount: 1_589,
    childFolderCount: 441,
    scannedFolderCount: 442,
    scanErrors: 0,
    promptFiles: 346,
    responseFiles: 350,
    pairedSessions: 346,
    responseOnlySessions: 4,
    outputAndSupportFiles: 832,
    archiveFiles: 61,
    metadataDateAnomalies: 85,
    activityMetricLabel: "Drive 저장 세션",
    activityMetricDetail: "날짜별 세션백업의 저장 세션 수",
    trendSeriesLabel: "저장 세션",
  },
  monthlyPromptCounts: [
    { month: "2026-07", prompts: 298 },
    { month: "2026-08", prompts: 169 },
  ],
  dailyPromptCounts: [
    { date: "2026-07-05", prompts: 7 },
    { date: "2026-07-06", prompts: 21 },
    { date: "2026-07-07", prompts: 11 },
    { date: "2026-07-08", prompts: 19 },
    { date: "2026-07-09", prompts: 13 },
    { date: "2026-07-10", prompts: 13 },
    { date: "2026-07-11", prompts: 11 },
    { date: "2026-07-12", prompts: 8 },
    { date: "2026-07-13", prompts: 18 },
    { date: "2026-07-14", prompts: 12 },
    { date: "2026-07-15", prompts: 8 },
    { date: "2026-07-16", prompts: 7 },
    { date: "2026-07-17", prompts: 7 },
    { date: "2026-07-18", prompts: 10 },
    { date: "2026-07-19", prompts: 7 },
    { date: "2026-07-20", prompts: 12 },
    { date: "2026-07-21", prompts: 12 },
    { date: "2026-07-22", prompts: 9 },
    { date: "2026-07-23", prompts: 11 },
    { date: "2026-07-24", prompts: 11 },
    { date: "2026-07-25", prompts: 8 },
    { date: "2026-07-26", prompts: 7 },
    { date: "2026-07-27", prompts: 13 },
    { date: "2026-07-28", prompts: 12 },
    { date: "2026-07-29", prompts: 14 },
    { date: "2026-07-30", prompts: 8 },
    { date: "2026-07-31", prompts: 9 },
    { date: "2026-08-01", prompts: 10 },
    { date: "2026-08-02", prompts: 9 },
    { date: "2026-08-03", prompts: 11 },
    { date: "2026-08-04", prompts: 11 },
    { date: "2026-08-05", prompts: 9 },
    { date: "2026-08-06", prompts: 9 },
    { date: "2026-08-07", prompts: 9 },
    { date: "2026-08-08", prompts: 10 },
    { date: "2026-08-09", prompts: 6 },
    { date: "2026-08-10", prompts: 9 },
    { date: "2026-08-11", prompts: 7 },
    { date: "2026-08-12", prompts: 9 },
    { date: "2026-08-13", prompts: 11 },
    { date: "2026-08-14", prompts: 11 },
    { date: "2026-08-15", prompts: 11 },
    { date: "2026-08-16", prompts: 8 },
    { date: "2026-08-17", prompts: 9 },
    { date: "2026-08-18", prompts: 10 },
  ],
  monthlyInsights: {
    "2026-08": {
      topicTitle: "8월 대화·프롬프트 업무 영역",
      topicBasisLabel: "8월 Drive 프롬프트 169건 · 결과물 본문·파일명 교차 분석",
      promptTopics: [
        {
          label: "리서치·트렌드 수집",
          count: 51,
          description: "AI 산업 동향, Genspark 조사 결과와 IRIS 연구개발 공고를 반복 수집·정리했습니다.",
          examples: ["Genspark v1", "AI trend v1", "IRIS R&D"],
          color: "#476a6f",
        },
        {
          label: "AX 대시보드·KPI",
          count: 47,
          description: "전사·개인·임원 대시보드와 AX KPI를 갱신하고 배포·수집 상태를 점검했습니다.",
          examples: ["V3 경영진 대시보드", "KJW dashboard refresh", "AX KPI update"],
          color: "#0f8b8d",
        },
        {
          label: "메일·지식관리",
          count: 24,
          description: "메일 요약과 Claude 세션을 Drive·Wiki·Notion으로 구조화해 업무 지식으로 보관했습니다.",
          examples: ["Amaranth 메일 요약", "Claude session to wiki", "세션 백업"],
          color: "#2f8f46",
        },
        {
          label: "보고·콘텐츠 제작",
          count: 21,
          description: "경영 보고 자료, 회의록과 AI 활용 콘텐츠를 문서·발표 형식으로 제작했습니다.",
          examples: ["GPU 서버 CEO 보고", "로봇 솔루션 회의록", "데일리 블로그"],
          color: "#e85d4f",
        },
        {
          label: "기획·기타 업무",
          count: 26,
          description: "로봇 솔루션, 상표 출원과 반복업무 자동화 등 사업·운영 과제를 검토했습니다.",
          examples: ["4족보행로봇", "상표출원 비용품의", "업무 자동화"],
          color: "#c58612",
        },
      ],
      highlights: [
        {
          title: "4족보행로봇 순찰·CCTV 기술 검토",
          category: "로봇 솔루션",
          summary: "순찰 로봇의 영상 전송 구조, 공급사와 임무 소프트웨어를 조사하고 협업 회의 내용을 정리했습니다.",
          result: "기술검토서 PDF·DOCX · 공급사 조사 문서 · 8월 18일 회의록",
        },
        {
          title: "AI Agent GPU 서버 도입안",
          category: "경영 의사결정",
          summary: "AI Agent 개발용 GPU 서버의 모델 운용 조건과 투자 대안을 비교해 경영진 판단 자료로 구성했습니다.",
          result: "2026년 8월 CEO 보고용 PPTX·PDF",
        },
        {
          title: "상표 출원 비용 품의",
          category: "법무·브랜드",
          summary: "상표 출원 대상과 견적·비용 절감 경과를 정리해 결재 가능한 보고 자료로 만들었습니다.",
          result: "CEO 보고용 PPTX·PDF",
        },
        {
          title: "IRIS 연구과제 공고 자동화",
          category: "R&D 기회 탐색",
          summary: "접수 중 연구과제를 일별로 수집하고 마감일과 검토 우선순위를 구조화했습니다.",
          result: "8월 일별 IRIS R&D XLSX·메일 초안",
        },
        {
          title: "AI 트렌드·활용 콘텐츠",
          category: "지식 확산",
          summary: "최신 AI 동향과 내부 활용 사례를 반복 수집해 실무자가 읽을 수 있는 콘텐츠로 정리했습니다.",
          result: "8월 일별 트렌드 Markdown · 블로그 초안·이미지",
        },
      ],
    },
  },
  promptTopics: [
    {
      label: "AX 대시보드·KPI",
      count: 116,
      description: "개인·전사·임원 대시보드 갱신, AX 4축 KPI 계산과 Railway 배포 자동화",
      examples: ["Kjw dashboard daily refresh", "AX KPI daily update", "V3 경영진 지식 대시보드"],
      color: "#0f8b8d",
    },
    {
      label: "리서치·트렌드 수집",
      count: 104,
      description: "AI 트렌드 조사, Genspark 증분 동기화, IRIS·국책과제 공고 수집",
      examples: ["AI trend", "Genspark", "IRIS R&D"],
      color: "#476a6f",
    },
    {
      label: "보고·콘텐츠 제작",
      count: 47,
      description: "데일리 블로그, 일일 업무보고, CEO 의사결정 자료 작성",
      examples: ["AI 활용 사례 블로그", "GPU 서버 CEO 보고", "일일 업무보고"],
      color: "#e85d4f",
    },
    {
      label: "메일·지식관리",
      count: 43,
      description: "Amaranth 메일 요약과 Claude 세션의 Drive·Wiki·Notion 지식화",
      examples: ["메일 요약 Docs", "Claude session to wiki", "세션 백업"],
      color: "#2f8f46",
    },
    {
      label: "기획·기타 업무",
      count: 21,
      description: "상표·특허, 협업 의제, 반복업무 부하와 사업 의사결정 분석",
      examples: ["상표 출원 비용 품의", "산업안전 특허 명세서", "viAct VLM 협업"],
      color: "#c58612",
    },
    {
      label: "AI 기술·운영",
      count: 15,
      description: "GPU·로컬 모델 검토, Ollama·vLLM·서버 운영과 자동화 장애 해결",
      examples: ["Gemma 4 26B GPU", "EXAONE 모델", "운영 모니터링"],
      color: "#6f7fd8",
    },
  ],
  fileBreakdown: [
    { label: "대화 기록", count: 696, description: "프롬프트 346 · 응답 350", color: "#0f8b8d" },
    { label: "보고서·문서", count: 348, description: "Google Docs · Markdown · DOCX · PDF", color: "#2f8f46" },
    { label: "발표·시각 자료", count: 230, description: "PPTX · 이미지 · 인포그래픽", color: "#e85d4f" },
    { label: "코드·구성", count: 198, description: "Python · JavaScript · JSON · HTML · XML", color: "#6f7fd8" },
    { label: "압축·보관", count: 61, description: "ZIP·분할 백업 파일", color: "#c58612" },
    { label: "데이터·스프레드시트", count: 56, description: "XLSX·구조화 데이터", color: "#476a6f" },
  ],
  highlights: [
    {
      title: "전사 AX·개인 대시보드 운영",
      category: "자동화 운영",
      summary: "개인 업무 대시보드, 전사 AX 전환 현황판, 임원 지식 대시보드를 정기 갱신하고 배포 상태를 검증",
      result: "일별 Google Docs·Railway 대시보드·AX 4축 KPI",
    },
    {
      title: "AI Agent 서버 CEO 의사결정 자료",
      category: "경영 의사결정",
      summary: "3개 견적과 결제방식별 24개월 TCO, 모델·VRAM 전략과 리스크를 중립 비교",
      result: "PPTX 12장 · PDF · 생성 스크립트",
    },
    {
      title: "상표 출원 비용 품의",
      category: "법무·브랜드",
      summary: "견적과 메일 이력을 정규화해 출원 대상을 선택하고 비용 절감 경과를 CEO 결재안으로 구성",
      result: "PPTX 4장 · PDF · 생성 스크립트",
    },
    {
      title: "산업안전 사고예측 특허 명세서",
      category: "R&D·IP",
      summary: "선행특허 조사와 회피설계를 반영해 14개 발명의 명세서와 도면 체계를 전문화",
      result: "통합 DOCX·PDF · 개별 명세서 14건 · 도면 56매",
    },
    {
      title: "IRIS 연구과제 공고 자동화",
      category: "R&D 기회 탐색",
      summary: "접수 중 공고를 분류하고 마감일·D-day를 계산해 검토 우선순위와 메일 초안을 생성",
      result: "6개 시트 XLSX · HTML/텍스트 메일 초안 · 캐시 데이터",
    },
    {
      title: "AI 활용 사례 콘텐츠",
      category: "지식 확산",
      summary: "전날 세션과 트렌드 소재를 일반화해 발행 직전의 실무형 블로그 초안으로 전환",
      result: "post.md · 상태 문서 · 인포그래픽 2장",
    },
  ],
  notes: [
    "지정 Drive 루트와 발견된 모든 하위 폴더를 재귀 조회했으며 조회 오류와 1,000개 제한 도달 폴더는 없었습니다.",
    "프롬프트 346건은 모두 대응 응답이 있으며 응답 전용 기록 4건이 추가로 존재합니다.",
    "결과·지원 파일 832개는 대화 기록과 압축 보관 파일을 제외한 문서·시각자료·코드·데이터 파일입니다.",
    "메타데이터 날짜 이상 85건은 Office 내부 파일의 1979년 타임스탬프이며 날짜 추이에서 제외했습니다.",
    "산출물 수는 저장 신호이며 최종 승인·실제 사용·중간본·폐기 여부를 구분하지 않습니다.",
  ],
};

const strategySharedDriveUrl =
  "https://drive.google.com/drive/folders/1NK9PNOb_fbByPSSz0AqydMYj5lUK2Q25?usp=drive_link";
const strategyGensparkDriveUrl =
  "https://drive.google.com/drive/folders/1MFJpVf9QfLNbzwLIE27N3b9yua9uYsa2?usp=drive_link";

const strategySharedDrive = {
  folderName: "전략사업팀 Claude·Genspark 공통 저장소",
  folderUrl: strategySharedDriveUrl,
  collectedAt: "2026-08-06 17:06 KST",
  period: "2025-12-17 ~ 2026-08-06",
  fileCount: 237,
  childFolderCount: 63,
  scannedFolderCount: 65,
  scanErrors: 0,
  promptFiles: 42,
  responseFiles: 0,
  pairedSessions: 42,
  responseOnlySessions: 0,
  outputAndSupportFiles: 191,
  archiveFiles: 3,
  metadataDateAnomalies: 0,
  rootFolderCount: 2,
  activityMetricLabel: "Drive 대화 세션",
  activityMetricDetail: "통합 대화록 42건 · 메시지 1,028개",
  trendTitle: "공통 계정 대화 세션 일별 추이",
  trendSeriesLabel: "대화 세션",
};

const strategySharedMonthlyPromptCounts = [
  { month: "2026-06", prompts: 10 },
  { month: "2026-07", prompts: 26 },
  { month: "2026-08", prompts: 6 },
];

const strategySharedDailyPromptCounts = [
  { date: "2026-06-15", prompts: 2 },
  { date: "2026-06-16", prompts: 1 },
  { date: "2026-06-19", prompts: 2 },
  { date: "2026-06-23", prompts: 1 },
  { date: "2026-06-26", prompts: 3 },
  { date: "2026-06-29", prompts: 1 },
  { date: "2026-07-03", prompts: 4 },
  { date: "2026-07-10", prompts: 4 },
  { date: "2026-07-21", prompts: 4 },
  { date: "2026-07-24", prompts: 3 },
  { date: "2026-07-30", prompts: 6 },
  { date: "2026-07-31", prompts: 5 },
  { date: "2026-08-01", prompts: 1 },
  { date: "2026-08-02", prompts: 1 },
  { date: "2026-08-03", prompts: 1 },
  { date: "2026-08-04", prompts: 1 },
  { date: "2026-08-05", prompts: 1 },
  { date: "2026-08-06", prompts: 1 },
];

const strategySharedPromptTopics: IndividualProfilePromptTopic[] = [
  {
    label: "정기 사업기회 모니터링",
    count: 25,
    description: "수주·발주, 경쟁사, 법령, 입찰 키워드 관련 최신 정보를 주기적으로 수집하고 대시보드 데이터를 갱신",
    examples: ["Award news monitoring", "Competitor news monitoring", "Law info monitoring", "Bid keyword monitoring"],
    color: "#0f8b8d",
  },
  {
    label: "AI 업무환경·지식관리",
    count: 11,
    description: "Claude CLI·Obsidian MCP 설정과 Drive 기록 동기화 등 팀 지식관리 자동화 운영",
    examples: ["Drive to Obsidian daily sync", "Claude CLI 설치", "Obsidian MCP 연결"],
    color: "#476a6f",
  },
  {
    label: "기업조사·제안자료",
    count: 5,
    description: "건설사·현장 조사와 스마트안전 제안서, 기업조사 보고서 및 사내 PPT 템플릿 제작",
    examples: ["한화건설 기업조사", "한화 안전관리 평가", "Samsung GBC 조사", "RiskZero PPT JSON"],
    color: "#e85d4f",
  },
  {
    label: "프롬프트·산출물 분석",
    count: 1,
    description: "Drive에 축적된 대화와 생성 결과물을 구분하고 반복 수집·정리하는 운영 절차 설계",
    examples: ["프롬프트 및 결과물 분석 정리"],
    color: "#6f7fd8",
  },
];

const strategySharedFileBreakdown: IndividualProfileFileBreakdown[] = [
  { label: "Claude 대화 기록", count: 43, description: "논리 세션 42건 · 중복 저장 1건", color: "#0f8b8d" },
  { label: "Claude 문서·발표", count: 3, description: "DOCX 1개 · PPTX 2개", color: "#e85d4f" },
  { label: "Claude 업무 대시보드", count: 1, description: "전략사업팀 HTML 대시보드", color: "#2f8f46" },
  { label: "Claude 코드·데이터", count: 5, description: "JavaScript 4개 · JSON 설정 1개", color: "#6f7fd8" },
  { label: "Claude 백업 인덱스", count: 3, description: "시점별 백업 인덱스 JSON", color: "#c58612" },
  { label: "Genspark 발표자료", count: 132, description: "PPTX 제안서·발표자료", color: "#2f8f46" },
  { label: "Genspark 문서·보고서", count: 19, description: "DOCX 14개 · PDF 5개", color: "#e85d4f" },
  { label: "Genspark 시각자료", count: 16, description: "PNG 이미지 16개", color: "#0f8b8d" },
  { label: "Genspark 데이터·웹", count: 7, description: "XLSX 5개 · HTML 2개", color: "#6f7fd8" },
  { label: "Genspark 아카이브", count: 8, description: "ZIP 아카이브 8개", color: "#7d6ca7" },
];

const strategySharedHighlights: IndividualProfileHighlight[] = [
  {
    title: "한화 마이스파크 스마트안전 PoC 제안",
    category: "제안·사업개발",
    summary: "기업·사고이력 조사부터 안전관리 벤치마크, 구축 로드맵과 리스크제로 차별화 논리까지 반복 보강",
    result: "PPTX 2개 · 기업조사 DOCX 1개 · 최종 제안서 29슬라이드 기록",
  },
  {
    title: "전략사업팀 사업기회 대시보드",
    category: "모니터링 자동화",
    summary: "수주·발주, 경쟁사, 법령, 입찰 키워드 데이터를 주기적으로 검증·갱신해 한 화면에서 관리",
    result: "HTML 대시보드 1개 · JavaScript 데이터 4개 · 설정 JSON 1개",
  },
  {
    title: "삼성 GBC 스마트안전 제안서",
    category: "대형 현장 제안",
    summary: "현대건설·현대엔지니어링 공동시공 환경을 분석하고 6개월 통합 실증과 안전활동 진단 논리를 구성",
    result: "대화 105개 메시지 · 34슬라이드 PPTX/PDF 생성 기록",
  },
  {
    title: "사업기회 주간 모니터링",
    category: "시장·영업 정보",
    summary: "언론 기사와 공고 원문을 검증해 유망 수주·발주, 경쟁사 동향, 안전 법령과 입찰 신호를 누적",
    result: "정기 모니터링 세션 25건 · 대시보드 데이터 지속 갱신",
  },
  {
    title: "Claude·Obsidian 지식관리 자동화",
    category: "업무환경 구축",
    summary: "Claude 대화의 Drive 백업과 Obsidian 일일기록 동기화, CLI·MCP 연결 상태를 점검",
    result: "AI 업무환경·지식관리 세션 11건 · 일별 백업 구조 운영",
  },
  {
    title: "Genspark 제안·발표자료 생산",
    category: "AI 산출물 제작",
    summary: "건설·산업안전 고객 제안과 비교 분석을 중심으로 발표자료·보고서·시각자료를 반복 생성",
    result: "Genspark 산출물 182개 · PPTX 132개 · 문서·보고서 19개",
  },
  {
    title: "반도건설 안전보건 분석",
    category: "최신 Genspark 산출물",
    summary: "반도건설의 안전보건 현황을 분석해 영업·제안 준비에 활용할 수 있는 보고서로 정리",
    result: "반도건설_안전보건분석_보고서.docx · 2026-08-06 Drive 확인",
  },
];

const strategySharedNotes = [
  "지정 Drive 루트와 모든 하위 폴더를 재귀 조회했으며 64개 폴더에서 조회 오류와 1,000개 제한 도달은 없었습니다.",
  "최신 백업 인덱스의 논리 세션은 42건, 메시지는 1,028개입니다. 대화록 파일은 프롬프트와 응답이 합쳐진 통합 기록입니다.",
  "Claude Drive의 실제 저장 파일 55개에는 대화 기록 43개, 원본 산출물 9개, 시점별 백업 인덱스 3개가 포함됩니다.",
  "Genspark Drive 최신 요약 기준 산출물은 182개이며 개별 산출물 174개와 ZIP 아카이브 8개로 구분됩니다.",
  "Genspark Drive 루트의 실제 항목 206개를 조회 오류 없이 확인하고, 최신 genspark_sessions_요약_20260806.md의 산출물 합계 182개와 대조했습니다.",
  "두 Drive를 합친 통합 저장·산출 신호는 237개이며, 결과·지원 파일 191개는 Claude 원본 산출물 9개와 Genspark 산출물 182개의 합계입니다.",
  "Genspark 산출물은 PPTX 132개, PNG 16개, DOCX 14개, ZIP 8개, PDF 5개, XLSX 5개, HTML 2개입니다.",
  "7월 21일 동일 수주 모니터링 대화록 1건은 중복 저장으로 확인되어 활동 세션에서는 한 번만 집계했습니다.",
  "공통 계정 자료만으로 임성범 부장과 조주연 부장의 개인별 기여를 분리할 수 없어 두 페이지에 동일한 팀 공통 활동을 표시합니다.",
  "산출물 수는 저장 신호이며 최종 승인·실제 사용·중간본·폐기 여부를 구분하지 않습니다.",
];

function buildStrategySharedProfile({
  email,
  displayName,
}: {
  email: string;
  displayName: string;
}): IndividualProfileData {
  return {
    email,
    displayName,
    title: "부장",
    department: "전략사업팀",
    approvalOwner: "임성범 부장",
    accountLabel: "공통 계정 · riskzero.marketing@gmail.com",
    attributionMode: "shared",
    costBasisNote:
      "요청 기준에 따라 임성범 부장의 Claude Team Plan Standard와 Genspark Pro 월 고정비를 두 상세 페이지에 동일하게 표시합니다.",
    sourceLinks: [
      { label: "Claude Drive", url: strategySharedDriveUrl },
      { label: "Genspark Drive", url: strategyGensparkDriveUrl },
    ],
    drive: strategySharedDrive,
    monthlyPromptCounts: strategySharedMonthlyPromptCounts,
    dailyPromptCounts: strategySharedDailyPromptCounts,
    promptTopics: strategySharedPromptTopics,
    fileBreakdown: strategySharedFileBreakdown,
    highlights: strategySharedHighlights,
    notes: strategySharedNotes,
  };
}

export const limSeongbeomProfileData = buildStrategySharedProfile({
  email: "sblim0519@riskzero.kr",
  displayName: "임성범 부장",
});

export const joJooyeonProfileData = buildStrategySharedProfile({
  email: "jyjo@riskzero.kr",
  displayName: "조주연 부장",
});

const leeHyeongbaeDriveUrl =
  "https://drive.google.com/drive/folders/1OFfN4APAViKNtgURnmn9W51jSvcxy6fg?usp=drive_link";

export const leeHyeongbaeProfileData: IndividualProfileData = {
  email: "hb777lee@riskzero.kr",
  displayName: "이형배 상무",
  title: "상무",
  department: "기술연구소",
  approvalOwner: "이형배 상무",
  accountLabel: "Claude 공통 계정 · ChatGPT 개인 계정",
  attributionMode: "shared",
  attributionLabel: "이형배 Drive 기준 · 토큰 미분리",
  measurementNote:
    "Drive 활동과 산출물은 이형배 전용 저장소 기준이며 공통 계정의 토큰·코드는 개인별로 분리되지 않습니다.",
  costBasisNote:
    "AI 도구 결재 현황의 Claude Team Plan Standard와 2026년 8월 시작 ChatGPT Business Plan 월 고정비를 합산했습니다. API 변동비는 개인에게 배분하지 않았습니다.",
  sourceLinks: [{ label: "이형배 Claude Drive", url: leeHyeongbaeDriveUrl }],
  drive: {
    folderName: "이형배 Claude Drive 산출물 저장소",
    folderUrl: leeHyeongbaeDriveUrl,
    collectedAt: "2026-08-06 17:26 KST",
    period: "2026-07-07 ~ 2026-08-06",
    fileCount: 656,
    childFolderCount: 188,
    scannedFolderCount: 189,
    scanErrors: 0,
    promptFiles: 264,
    responseFiles: 0,
    pairedSessions: 0,
    responseOnlySessions: 0,
    outputAndSupportFiles: 283,
    archiveFiles: 109,
    metadataDateAnomalies: 0,
    activityMetricLabel: "Drive 대화 기록",
    activityMetricDetail: "날짜별 백업 저장본 · 중복 포함",
    trendTitle: "Drive 대화 기록 저장본 일별 추이",
    trendSeriesLabel: "날짜별 저장본",
    topicBasisLabel: "파일명·대표 본문 분류 264건",
    fileTotalLabel: "전체 저장",
  },
  monthlyPromptCounts: [
    { month: "2026-07", prompts: 209 },
    { month: "2026-08", prompts: 33 },
  ],
  dailyPromptCounts: [
    { date: "2026-07-07", prompts: 46 },
    { date: "2026-07-08", prompts: 49 },
    { date: "2026-07-09", prompts: 50 },
    { date: "2026-07-15", prompts: 7 },
    { date: "2026-07-16", prompts: 6 },
    { date: "2026-07-17", prompts: 5 },
    { date: "2026-07-19", prompts: 5 },
    { date: "2026-07-20", prompts: 6 },
    { date: "2026-07-22", prompts: 4 },
    { date: "2026-07-24", prompts: 5 },
    { date: "2026-07-27", prompts: 9 },
    { date: "2026-07-28", prompts: 4 },
    { date: "2026-07-29", prompts: 4 },
    { date: "2026-07-30", prompts: 4 },
    { date: "2026-07-31", prompts: 5 },
    { date: "2026-08-01", prompts: 2 },
    { date: "2026-08-02", prompts: 2 },
    { date: "2026-08-03", prompts: 2 },
    { date: "2026-08-04", prompts: 2 },
    { date: "2026-08-05", prompts: 2 },
    { date: "2026-08-06", prompts: 2 },
    { date: "2026-08-07", prompts: 2 },
    { date: "2026-08-08", prompts: 2 },
    { date: "2026-08-09", prompts: 2 },
    { date: "2026-08-10", prompts: 2 },
    { date: "2026-08-11", prompts: 2 },
    { date: "2026-08-12", prompts: 3 },
    { date: "2026-08-13", prompts: 3 },
    { date: "2026-08-18", prompts: 5 },
  ],
  monthlyInsights: {
    "2026-08": {
      topicTitle: "8월 대화·프롬프트 업무 영역",
      topicBasisLabel: "8월 Drive 대화 기록 33건 · 결과물 본문·파일명 교차 분석",
      promptTopics: [
        {
          label: "안전보건 일일 브리핑",
          count: 14,
          description: "산업재해 동향, 법령과 주요 사고를 조사해 일일 안전보건 브리핑으로 정리했습니다.",
          examples: ["8월 일일 브리핑", "중대재해 동향", "법령·행사 정보"],
          color: "#e85d4f",
        },
        {
          label: "현장 점검사진 위험요인 분석",
          count: 8,
          description: "건설현장 사진에서 위험요인을 식별하고 관련 법과 단계별 대책을 구조화했습니다.",
          examples: ["점검사진 분석", "위험요인·법·대책", "사고유형 분류"],
          color: "#0f8b8d",
        },
        {
          label: "재해현황·분류 데이터",
          count: 5,
          description: "철도·건설 재해 원천을 분석 가능한 표 형식으로 변환하고 분류 체계를 점검했습니다.",
          examples: ["철도 재해현황", "분석완료 데이터본", "CSV·XLSX 변환"],
          color: "#476a6f",
        },
        {
          label: "일일 업무보고",
          count: 4,
          description: "당일 조사·분석·산출물을 요약해 후속 조치가 드러나는 업무보고로 작성했습니다.",
          examples: ["일일업무보고", "업무 요약", "권고 조치"],
          color: "#2f8f46",
        },
        {
          label: "세션 아카이브·운영",
          count: 2,
          description: "Claude 작업 세션과 산출물을 통합 보관하고 재사용 가능한 기록으로 정리했습니다.",
          examples: ["Claude backup", "세션 통합 보고서", "Main Agent"],
          color: "#c58612",
        },
      ],
      highlights: [
        {
          title: "건설현장 점검사진 위험요인 분석",
          category: "안전 진단",
          summary: "현장 사진의 위험요인을 사고유형, 관련 법규와 공학적·관리적 대책으로 연결했습니다.",
          result: "위험요인+법+대책+유형 분석완료 XLSX·CSV",
        },
        {
          title: "안전보건 일일 브리핑",
          category: "동향·법령",
          summary: "최신 산업재해 사례와 법령·행사 정보를 실무 우선조치와 함께 일별로 정리했습니다.",
          result: "8월 1~13일 DOCX·Markdown·텍스트 브리핑",
        },
        {
          title: "철도 재해현황 데이터 변환",
          category: "데이터 정비",
          summary: "철도 재해현황 원천을 후속 분석에 사용할 수 있도록 구조화하고 분류 기준을 정리했습니다.",
          result: "분석용 표 데이터 · 변환 대화 기록",
        },
        {
          title: "일일 업무보고 자동화",
          category: "업무 기록",
          summary: "조사와 분석 결과를 일일 단위로 요약해 진행 내용과 후속 과제를 지속적으로 남겼습니다.",
          result: "8월 1~13일 일일 업무보고 저장본",
        },
        {
          title: "Claude 세션 아카이브",
          category: "지식관리",
          summary: "작업 세션과 결과물을 통합 정리해 이후 업무에서 검색·재사용할 수 있는 기록으로 만들었습니다.",
          result: "세션 아카이브 통합 보고서",
        },
      ],
    },
  },
  promptTopics: [
    {
      label: "초기 프로젝트 대화 백업",
      count: 94,
      description: "V1·V2 프로젝트 작업 세션을 날짜별 Drive 백업본으로 보관",
      examples: ["V1 project session", "V2 project session", "Claude project backup"],
      color: "#6f7fd8",
    },
    {
      label: "재해 통계·사고 분석",
      count: 72,
      description: "건설·산업재해 사례를 CSI 기준과 RCA 관점으로 재분류하고 법규·통계 해석을 검증",
      examples: ["SH·도기본 재해 비교", "HD현대 사망사고", "아산 KTX 사고 분석"],
      color: "#e85d4f",
    },
    {
      label: "현장 사진 위험요인 분석",
      count: 47,
      description: "점검사진의 직접·잠재 위험을 식별하고 사고유형, 관련 법규와 단계별 안전대책으로 구조화",
      examples: ["사진 위험요인 분석", "3번 사진 검토", "위험요인 법규 재분석"],
      color: "#0f8b8d",
    },
    {
      label: "안전관리 데이터 수집",
      count: 42,
      description: "현장별 안전관리비, 위험성평가, 안전시설·장비와 재난대응 자료를 전수 수집·문서화",
      examples: ["23개 현장 안전관리비", "위험성평가 자료", "TBM 안전관리 체계"],
      color: "#2f8f46",
    },
    {
      label: "AI 업무환경·백업 운영",
      count: 9,
      description: "Windows 터미널 제어, Drive 업로드와 파일 이관 절차를 구축·검증",
      examples: ["Windows terminal control", "Google Drive upload", "File upload workflow"],
      color: "#c58612",
    },
  ],
  fileBreakdown: [
    { label: "생성 결과물", count: 224, description: "MD 141 · TXT 66 · CSV 8 · DOCX 5 · XLSX 3 · JPG 1", color: "#2f8f46" },
    { label: "과거 대화 백업", count: 145, description: "7월 7~9일 Google Docs 세션 백업", color: "#6f7fd8" },
    { label: "날짜별 대화 기록", count: 119, description: "7월 15일~8월 6일 프로젝트 대화록", color: "#0f8b8d" },
    { label: "입력·참고 자료", count: 109, description: "XLSX · JPG · PDF · CSV 등 원천 자료", color: "#476a6f" },
    { label: "프로젝트 정리본", count: 40, description: "날짜·프로젝트별 Google Docs README", color: "#e85d4f" },
    { label: "일일 업무보고", count: 14, description: "업무 요약·조사·산출물·권고 조치", color: "#c58612" },
    { label: "운영·검증 파일", count: 5, description: "백업 스킬 3개 · 업로드 검증 2개", color: "#7d6ca7" },
  ],
  highlights: [
    {
      title: "현장 점검사진 위험요인 분석",
      category: "안전 진단",
      summary: "현장 사진의 직접·잠재 위험을 사고유형, 현행 법규와 공학적·관리적·보호구 대책으로 연결",
      result: "최신 업무보고 기준 사진 12건 분석 · XLSX/CSV 결과표",
    },
    {
      title: "안전보건 일일 브리핑",
      category: "동향·법령",
      summary: "산업재해 통계, 중대재해 사례, 법령 개정과 행사 정보를 조사해 실무 우선조치와 함께 정리",
      result: "6~8월 브리핑 저장본 · DOCX/Markdown/텍스트",
    },
    {
      title: "SH·도기본 재해 비교 검증",
      category: "데이터 품질",
      summary: "외국인 재해 비중 증가가 기록 충실도 변화에서 생긴 통계 착시임을 찾아 보고서 5건의 해석을 정정",
      result: "SH 고령 73.1% 검증 · 도기본 기재분 8.6%→8.3% 정정",
    },
    {
      title: "건설재해 분류·RCA 분석",
      category: "재해 분석",
      summary: "건설사고 데이터를 CSI 분류기준과 RCA 5기법으로 재구성하고 경영층·실무 통합 보고서로 정리",
      result: "6개 시트 분석 양식 · 통합·상세·요약 보고서",
    },
    {
      title: "현장 안전관리 데이터 전수 확인",
      category: "업무 자동화",
      summary: "현장별 안전관리비와 위험성평가·안전시설 자료를 브라우저와 API로 교차 점검하고 증거를 문서화",
      result: "안전관리비 23개 현장 × 28개월, 644개 조합 검증",
    },
  ],
  notes: [
    "지정 Drive 루트와 모든 하위 폴더를 재귀 조회했으며 189개 폴더에서 조회 오류와 1,000개 제한 도달은 없었습니다.",
    "현재 Drive의 실제 저장 파일은 656개이며 루트 직접 파일 1개와 하위 폴더 파일 655개로 구성됩니다.",
    "제목·크기·형식 기준 고유 파일 신호는 415개이고, 날짜별 백업 복사본으로 추정되는 중복 저장은 241개입니다.",
    "대화 기록 264개는 날짜별 대화록 119개와 과거 Google Docs 세션 백업 145개의 합계이며 동일 대화가 여러 스냅샷에 반복될 수 있습니다.",
    "결과·지원 파일 283개는 생성결과물 224개, 프로젝트 정리본 40개, 일일 업무보고 14개, 운영·검증 파일 5개의 합계입니다.",
    "입력·참고 자료 109개는 결과물 집계에서 분리했으며 파일 형식별 전체 합계와 Drive 실제 파일 656개가 일치합니다.",
    "대표 본문에서 현장 사진 위험분석, 재해·법규 검증, 안전보건 브리핑, 현장 데이터 수집 흐름을 확인했습니다.",
    "산출물 수는 저장 신호이며 최종 승인·실제 사용·중간본·폐기 여부를 구분하지 않습니다.",
  ],
};

const kimDaeilDriveUrl =
  "https://drive.google.com/drive/folders/1PV6ISnJ9W86MP1grcOxntHo2eBkCd7NM?usp=drive_link";

export const kimDaeilProfileData: IndividualProfileData = {
  email: "bigone@riskzero.kr",
  displayName: "김대일 상무",
  title: "상무",
  department: "기술연구소",
  approvalOwner: "김대일 상무",
  accountLabel: "Claude 가입 계정 사용",
  measurementNote:
    "개인 Drive 산출물은 확인되지만 Claude 가입 계정의 토큰·요청·코드 사용량은 개인 단위로 분리되지 않습니다.",
  costBasisNote:
    "AI 도구 결재 현황의 Claude Team Plan Premium과 Gemini Workspace 월 고정비를 합산했습니다. API 변동비는 개인에게 배분하지 않았습니다.",
  sourceLinks: [{ label: "김대일 Claude Drive", url: kimDaeilDriveUrl }],
  drive: {
    folderName: "김대일 Claude Drive 산출물 저장소",
    folderUrl: kimDaeilDriveUrl,
    collectedAt: "2026-08-07 08:38 KST",
    period: "2026-03 ~ 2026-08 문서",
    fileCount: 39,
    childFolderCount: 0,
    scannedFolderCount: 1,
    scanErrors: 0,
    promptFiles: 46,
    responseFiles: 0,
    pairedSessions: 0,
    responseOnlySessions: 0,
    outputAndSupportFiles: 46,
    archiveFiles: 1,
    metadataDateAnomalies: 0,
    analyzedFileCount: 46,
    activityMetricLabel: "분석 문서",
    activityMetricDetail: "Drive 직접 문서 38개 · ZIP 내부 문서 8개",
    trendTitle: "Drive 분석 문서 반영 추이",
    trendSeriesLabel: "분석 문서",
    topicBasisLabel: "파일명·대표 본문·ZIP 내부 분석 46개",
    topicTitle: "주요 업무·산출물 영역",
    outputMetricLabel: "ZIP 내부 문서",
    outputMetricValue: 8,
    outputMetricDetail: "임시 해제 후 본문 분석 · Drive 원본 ZIP 유지",
  },
  monthlyPromptCounts: [{ month: "2026-08", prompts: 46 }],
  dailyPromptCounts: [{ date: "2026-08-07", prompts: 46 }],
  promptTopics: [
    {
      label: "특허·국책 R&D",
      count: 16,
      description: "ZeromateAI 특허 패밀리와 산업안전 AI 우수사례·실증사업 참여 자료를 구성",
      examples: ["비침습 조립계층 특허", "다단계 폴백·정규화", "AI 스마트 산업안전 우수사례"],
      color: "#c58612",
    },
    {
      label: "AI 안전제품·아키텍처",
      count: 13,
      description: "VLM·BiRAG·Agentic AI 기반 위험예측 제품의 PRD, 인터페이스와 기술 방향을 설계",
      examples: ["ZeroGuard VLM PRD", "ZeroVisionCopilot", "RZ-Zeromate 인터페이스"],
      color: "#0f8b8d",
    },
    {
      label: "고객 제안·구축",
      count: 11,
      description: "건설·PM 고객의 AI 안전관리 플랫폼과 스마트안전장비 구축 범위·견적을 구체화",
      examples: ["한미글로벌 AI 안전관리", "춘천~속초 철도", "KBS 스마트안전장비"],
      color: "#2f8f46",
    },
    {
      label: "기술경영·지출검증",
      count: 3,
      description: "기술연구소 실적과 로드맵, 법인카드 지출검증 AI Agent의 투자안을 경영 자료로 정리",
      examples: ["AI 지출검증 Agent", "상반기 실적·하반기 계획", "기술연구소 주간보고"],
      color: "#6f7fd8",
    },
    {
      label: "재해·위험 분석",
      count: 3,
      description: "근로자 위험도 알고리즘과 산업재해 조사 결과를 분석 문서로 구조화",
      examples: ["근로자위험도 알고리즘", "한화오션 재해조사", "고려아연 재해조사"],
      color: "#e85d4f",
    },
  ],
  fileBreakdown: [
    { label: "DOCX", count: 15, description: "Drive 7개 · ZIP 내부 8개", color: "#2f8f46" },
    { label: "PDF", count: 10, description: "제안·보고·계획 문서", color: "#e85d4f" },
    { label: "PPTX", count: 8, description: "제품·제안·경영 발표자료", color: "#0f8b8d" },
    { label: "XLSX", count: 7, description: "견적·계획·기준 데이터", color: "#6f7fd8" },
    { label: "HWP", count: 4, description: "공고·검토·참여 문서", color: "#c58612" },
    { label: "HWPX", count: 2, description: "산업안전 우수사례 자료", color: "#476a6f" },
  ],
  highlights: [
    {
      title: "ZeroGuard VLM 모듈 PRD",
      category: "AI 제품 전략",
      summary: "사고예측 LLM과 VLM을 결합해 사후 탐지에서 예측형 안전 의사결정으로 확장하는 제품 요구사항과 사업 목표를 정의",
      result: "제품 목표·사용자 시나리오·성공지표·단계별 로드맵",
    },
    {
      title: "한미글로벌 AI 안전관리 플랫폼",
      category: "고객 제안",
      summary: "RAG·온톨로지 기반 문서검색과 체크리스트·일정·보고 자동화를 21개 기능과 구축 단계로 설계",
      result: "26장 제안서 · 구축계획 · IA · 견적 자료",
    },
    {
      title: "ZeromateAI 특허 패밀리",
      category: "R&D·IP",
      summary: "기존 안전 DB와 예측 엔진을 수정하지 않고 연결하는 비침습 조립계층과 6개 세부 발명을 문서화",
      result: "핵심 특허 1건 · 세부 발명 6건 · 패밀리맵 1건",
    },
    {
      title: "VLM·BiRAG 산업안전 자동화 설계",
      category: "기술 아키텍처",
      summary: "엣지 영상 필터, 서버 VLM·근거검색·위험예측, 사용자 알림으로 이어지는 멀티에이전트 구조와 처리량을 검토",
      result: "개념도 · 시장조사 · 기술회의록 · 선행기술 분석",
    },
    {
      title: "재무 지출검증 AI Agent",
      category: "경영 자동화",
      summary: "법인카드 승인내역과 지출결의서를 규칙과 LLM으로 대조하는 폐쇄망 저비용 Agent 도입안을 구성",
      result: "단일 GPU 구성 · 28주 로드맵 · 비용·통제·보안 검토",
    },
  ],
  notes: [
    "지정 Drive 루트를 조회했으며 하위 폴더, 조회 오류와 1,000개 제한 도달은 없었습니다.",
    "Drive 실제 파일은 39개이며 PPTX 8개, HWP 4개, HWPX 2개, XLSX 7개, PDF 10개, DOCX 7개, ZIP 1개입니다.",
    "ZeromateAI.zip은 무결성 검사를 통과했고 내부 DOCX 8개를 임시 해제해 본문을 분석했습니다. __MACOSX 메타데이터 8개는 집계에서 제외했습니다.",
    "ZIP 컨테이너는 분석 문서 수에 중복 집계하지 않아 직접 문서 38개와 내부 문서 8개, 총 46개를 분류했습니다.",
    "Drive 수정시각은 2026년 8월 7일 일괄 반영 시점이므로 문서의 실제 작성일·활동일로 해석하지 않습니다.",
    "산출물 수는 저장 신호이며 최종 승인·실제 사용·중간본·폐기 여부를 구분하지 않습니다.",
  ],
};

const parkYeonseokDriveUrl =
  "https://drive.google.com/drive/folders/11K6a5HMGcqUkP1CAEDh8TDQ8lD4ixMJs?usp=drive_link";

export const parkYeonseokProfileData: IndividualProfileData = {
  email: "yspark@riskzero.kr",
  displayName: "박연석 전무",
  title: "전무",
  department: "전략실",
  approvalOwner: "박연석 전무",
  accountLabel: "Claude 가입 계정 사용",
  measurementNote:
    "개인 Drive 산출물은 확인되지만 Claude 가입 계정의 토큰·요청·코드 사용량은 개인 단위로 분리되지 않습니다.",
  costBasisNote:
    "AI 도구 결재 현황의 ChatGPT Pro(20배), Claude Team Plan Premium과 Gemini Workspace 월 고정비를 합산했습니다. API 변동비는 개인에게 배분하지 않았습니다.",
  sourceLinks: [{ label: "박연석 Claude Drive", url: parkYeonseokDriveUrl }],
  drive: {
    folderName: "박연석 Claude Drive 산출물 저장소",
    folderUrl: parkYeonseokDriveUrl,
    collectedAt: "2026-08-07 08:38 KST",
    period: "2026-04 ~ 2026-08 문서",
    fileCount: 10,
    childFolderCount: 0,
    scannedFolderCount: 1,
    scanErrors: 0,
    promptFiles: 13,
    responseFiles: 0,
    pairedSessions: 0,
    responseOnlySessions: 0,
    outputAndSupportFiles: 13,
    archiveFiles: 1,
    metadataDateAnomalies: 0,
    analyzedFileCount: 13,
    activityMetricLabel: "분석 문서",
    activityMetricDetail: "Drive 직접 문서 9개 · ZIP 내부 문서 4개",
    trendTitle: "Drive 분석 문서 반영 추이",
    trendSeriesLabel: "분석 문서",
    topicBasisLabel: "파일명·대표 본문·ZIP 내부 분석 13개",
    topicTitle: "주요 업무·산출물 영역",
    outputMetricLabel: "ZIP 내부 문서",
    outputMetricValue: 4,
    outputMetricDetail: "임시 해제 후 본문 분석 · Drive 원본 ZIP 유지",
  },
  monthlyPromptCounts: [{ month: "2026-08", prompts: 13 }],
  dailyPromptCounts: [{ date: "2026-08-07", prompts: 13 }],
  promptTopics: [
    {
      label: "프로젝트 원가관리",
      count: 4,
      description: "수주부터 종료까지 프로젝트 원가코드, R&R, 표준양식과 임원 보고 체계를 정립",
      examples: ["원가관리 프로세스", "원가코드 표준", "표준양식집"],
      color: "#0f8b8d",
    },
    {
      label: "제조안전 R&D 수요",
      count: 4,
      description: "사고유형학습 AI 제조안전 기술개발의 공고, 제안양식, TRL과 산업기술분류를 검토",
      examples: ["기술수요조사 공고", "제안기술 양식", "TRL 1~9단계"],
      color: "#c58612",
    },
    {
      label: "LH 안전문서 체계",
      count: 2,
      description: "건설사업 6단계의 안전관리문서 36종과 작성항목 인계 관계를 분석·시각화",
      examples: ["문서 연관도 분석", "117개 연결", "6개 핵심 흐름"],
      color: "#2f8f46",
    },
    {
      label: "AI 인프라·모델 검토",
      count: 2,
      description: "Claude AWS 서울 리전과 Solar Open 2 공공기관 온프레미스 적용 조건을 사실 검증",
      examples: ["Anthropic In-Region", "Solar Open 2", "망분리·데이터 레지던시"],
      color: "#6f7fd8",
    },
    {
      label: "전사 실행 표준",
      count: 1,
      description: "프로세스 50종의 정의, R&R, Gate와 실무 표준양식을 하나의 실행 패키지로 구성",
      examples: ["Riskzero Way 2.0", "프로세스 R&R", "표준 양식 50종"],
      color: "#e85d4f",
    },
  ],
  fileBreakdown: [
    { label: "XLSX", count: 4, description: "원가·안전문서·전사 표준", color: "#6f7fd8" },
    { label: "DOCX", count: 3, description: "프로세스·AI 인프라 검토", color: "#2f8f46" },
    { label: "HWP", count: 3, description: "ZIP 내부 공고·양식·분류표", color: "#c58612" },
    { label: "PPTX", count: 2, description: "원가관리·LH 문서 흐름", color: "#0f8b8d" },
    { label: "HWPX", count: 1, description: "ZIP 내부 TRL 기준", color: "#476a6f" },
  ],
  highlights: [
    {
      title: "프로젝트 원가관리 표준",
      category: "경영관리",
      summary: "사업 인식부터 운영까지 7단계의 책임부서와 원가코드·보고·승인 기준을 표준 프로세스로 정리",
      result: "프로세스·R&R 정의서 · 원가코드 · 표준양식 · 임원보고",
    },
    {
      title: "Riskzero Way 2.0 실행 패키지",
      category: "전사 운영체계",
      summary: "핵심·지원 프로세스의 Gate, 책임, 기한과 표준 산출물을 연결해 실무자가 바로 쓰는 업무 기준을 구성",
      result: "사업 프로세스 29종 · 지원 프로세스 21종 · 표준양식 50종",
    },
    {
      title: "LH 안전관리문서 연관도",
      category: "안전문서 분석",
      summary: "사업계획부터 준공까지 안전문서 작성항목이 어떻게 계승·참조·집계되는지 흐름도로 시각화",
      result: "안전문서 36종 · 연결 117개 · 작성항목 매핑 49개",
    },
    {
      title: "Claude·Solar 공공 AI 도입 검토",
      category: "AI 전략",
      summary: "AWS 서울 리전 데이터 레지던시와 오픈웨이트 LLM의 공공기관 온프레미스 적용 가능성·제약을 비교",
      result: "In-Region 사실검증 · 하드웨어·라이선스·망분리 검토",
    },
    {
      title: "AI 제조안전 기술수요조사",
      category: "R&D 기회",
      summary: "AI 기반 제조안전 기술개발과 데이터 구축 수요 공고의 제출 항목, 기술성숙도와 분류체계를 분석",
      result: "공고문 · 기술수요조사서 · TRL 기준 · 산업기술분류표",
    },
  ],
  notes: [
    "지정 Drive 루트를 조회했으며 하위 폴더, 조회 오류와 1,000개 제한 도달은 없었습니다.",
    "Drive 실제 파일은 10개이며 DOCX 3개, XLSX 4개, PPTX 2개, ZIP 1개입니다.",
    "제조안전 기술수요조사 ZIP은 무결성 검사를 통과했고 내부 HWP 3개와 HWPX 1개를 임시 해제해 본문과 미리보기를 분석했습니다.",
    "ZIP 컨테이너는 분석 문서 수에 중복 집계하지 않아 직접 문서 9개와 내부 문서 4개, 총 13개를 분류했습니다.",
    "Drive 수정시각은 2026년 8월 7일 일괄 반영 시점이므로 문서의 실제 작성일·활동일로 해석하지 않습니다.",
    "산출물 수는 저장 신호이며 최종 승인·실제 사용·중간본·폐기 여부를 구분하지 않습니다.",
  ],
};

const jeongJaeyoDriveUrl =
  "https://drive.google.com/drive/folders/1nYUQzqS72RGA5d6aXDbVHuxOUYgKbA3p?usp=drive_link";

export const jeongJaeyoProfileData: IndividualProfileData = {
  email: "wody@riskzero.kr",
  displayName: "정재요 차장",
  title: "차장",
  department: "플랫폼개발",
  approvalOwner: "정재요 차장",
  accountLabel: "Claude Team Plan Premium · ChatGPT Business Plan",
  measurementNote:
    "Claude Team 사용량은 개인 계정으로 측정하며, 별도 Drive에는 Claude Code·Codex 작업 지시와 실제 커밋·코드 변경 기록이 날짜별로 보관됩니다.",
  costBasisNote:
    "AI 도구 결재 현황의 Claude Team Plan Premium과 ChatGPT Business Plan 현재 월 고정비를 합산했습니다. API 변동비는 개인에게 배분하지 않았습니다.",
  sourceLinks: [{ label: "정재요 AI 개발 작업 기록 Drive", url: jeongJaeyoDriveUrl }],
  drive: {
    folderName: "정재요 AI 개발 작업 기록 저장소",
    folderUrl: jeongJaeyoDriveUrl,
    collectedAt: "2026-08-19 KST",
    period: "2024-07-23 ~ 2026-08-19",
    fileCount: 386,
    childFolderCount: 386,
    scannedFolderCount: 1,
    scanErrors: 0,
    promptFiles: 6_298,
    responseFiles: 0,
    pairedSessions: 874,
    responseOnlySessions: 0,
    outputAndSupportFiles: 4_137,
    archiveFiles: 300,
    metadataDateAnomalies: 0,
    rootFolderCount: 1,
    activityMetricLabel: "사람 업무 지시",
    activityMetricDetail: "Claude Code 1,169건 · Codex 5,129건",
    trendTitle: "2026년 7월 일별 업무 지시 추이",
    trendSeriesLabel: "업무 지시",
    topicBasisLabel: "선택 월 일자별 저장 인덱스의 상위 작업 경로 · 같은 날 복수 경로 포함",
    topicTitle: "주요 개발 작업 영역",
    fileTotalLabel: "활동일 폴더",
    outputMetricLabel: "실제 Git 커밋",
    outputMetricValue: 4_137,
    outputMetricUnit: "건",
    outputMetricDetail: "일자별 commits.csv 기준 · merge 여부는 원천 로그 기준",
    inventoryTitle: "보관 원천 및 개발 실적 구성",
    inventorySummaryLabel: "활동일 386일",
    inventoryFootnote:
      "항목별 단위가 서로 다르므로 합산하지 않습니다. 날짜별 폴더, 사람 업무 지시, AI 세션, 실제 커밋과 AI 하위 작업 지시를 각각의 원천 신호로 표시합니다.",
  },
  monthlyPromptCounts: [
    { month: "2026-05", prompts: 833 },
    { month: "2026-06", prompts: 275 },
    { month: "2026-07", prompts: 966 },
    { month: "2026-08", prompts: 934 },
  ],
  insightMonth: "2026-07",
  dailyPromptCounts: [
    { date: "2026-07-01", prompts: 2 },
    { date: "2026-07-02", prompts: 15 },
    { date: "2026-07-03", prompts: 5 },
    { date: "2026-07-06", prompts: 9 },
    { date: "2026-07-08", prompts: 27 },
    { date: "2026-07-09", prompts: 13 },
    { date: "2026-07-10", prompts: 51 },
    { date: "2026-07-13", prompts: 28 },
    { date: "2026-07-14", prompts: 18 },
    { date: "2026-07-15", prompts: 17 },
    { date: "2026-07-16", prompts: 140 },
    { date: "2026-07-20", prompts: 88 },
    { date: "2026-07-21", prompts: 71 },
    { date: "2026-07-22", prompts: 55 },
    { date: "2026-07-23", prompts: 74 },
    { date: "2026-07-24", prompts: 55 },
    { date: "2026-07-27", prompts: 58 },
    { date: "2026-07-28", prompts: 76 },
    { date: "2026-07-29", prompts: 52 },
    { date: "2026-07-30", prompts: 66 },
    { date: "2026-07-31", prompts: 46 },
    { date: "2026-08-03", prompts: 61 },
    { date: "2026-08-04", prompts: 36 },
    { date: "2026-08-05", prompts: 51 },
    { date: "2026-08-06", prompts: 96 },
    { date: "2026-08-07", prompts: 57 },
    { date: "2026-08-11", prompts: 95 },
    { date: "2026-08-12", prompts: 68 },
    { date: "2026-08-13", prompts: 244 },
    { date: "2026-08-14", prompts: 77 },
    { date: "2026-08-18", prompts: 78 },
    { date: "2026-08-19", prompts: 71 },
  ],
  monthlyInsights: {
    "2026-08": {
      topicTitle: "8월 주요 개발 작업 영역",
      topicBasisLabel: "8월 사람 업무 지시 934건 · 일자별 instructions 원천 분석",
      promptTopics: [
        {
          label: "근로자 온보딩·인증",
          count: 215,
          description: "근로자 로그인, 약관 동의, 초기 비밀번호 변경과 전체 근로자 온보딩 흐름을 구현·검증했습니다.",
          examples: ["근로자 로그인", "최초 비밀번호 변경", "약관·온보딩"],
          color: "#0f8b8d",
        },
        {
          label: "SOS·작업중지·푸시",
          count: 220,
          description: "SOS와 작업중지 요청을 실제 데이터에 연결하고 푸시 알림·이동·조회 흐름을 고도화했습니다.",
          examples: ["작업중지 실데이터", "SOS 접근 기준", "푸시 알림 이동"],
          color: "#e85d4f",
        },
        {
          label: "모바일 앱·권한 메뉴",
          count: 188,
          description: "WEB·MOBILE 동적 메뉴 권한, 프로필 정책과 모바일 화면 동작을 역할별로 정비했습니다.",
          examples: ["동적 메뉴 권한", "관리자·근로자 모바일", "프로필 정책"],
          color: "#2f8f46",
        },
        {
          label: "배포·DB·Git 운영",
          count: 181,
          description: "개발 DB SQL, worktree와 브랜치 병합, iOS·Android 배포 준비를 작업 흐름 안에서 관리했습니다.",
          examples: ["개발 DB SQL", "worktree·merge", "App Store 준비"],
          color: "#476a6f",
        },
        {
          label: "GH·AI 도구·업무 아카이브",
          count: 130,
          description: "GH 백엔드·배치 작업, AI 스킬과 회의 기록, 산출물 수집·마스킹 자동화를 정리했습니다.",
          examples: ["GH backend·batch", "회의 녹음 skill", "산출물 수집·마스킹"],
          color: "#c58612",
        },
      ],
      highlights: [
        {
          title: "근로자 온보딩·인증 흐름 고도화",
          category: "현장 사용자 경험",
          summary: "로그인부터 약관 동의와 최초 비밀번호 변경까지 근로자 가입·인증 전 과정을 실제 운영 기준으로 정비했습니다.",
          result: "근로자 로그인·약관·비밀번호 변경 구현 및 검증 기록",
        },
        {
          title: "SOS·작업중지 실데이터 및 푸시 연동",
          category: "현장 안전 기능",
          summary: "SOS와 작업중지 기능을 실데이터에 연결하고 알림 수신 후 상세 화면으로 이어지는 흐름을 구현했습니다.",
          result: "작업중지·SOS 접근 기준 · 푸시·알림 목록·이동 동작",
        },
        {
          title: "WEB·MOBILE 동적 메뉴 권한",
          category: "권한 체계",
          summary: "사용자 역할에 따라 웹과 모바일 메뉴가 동적으로 노출되도록 권한 구조와 화면 동작을 정비했습니다.",
          result: "역할별 메뉴 권한 · 관리자·근로자 모바일 화면",
        },
        {
          title: "모바일 앱 스토어 배포 준비",
          category: "제품 배포",
          summary: "iOS·Android 앱 등록에 필요한 계정과 빌드·심사 준비 항목을 점검하고 운영 이슈를 정리했습니다.",
          result: "App Store 등록 준비 · 배포 체크리스트·운영 기록",
        },
        {
          title: "얼굴인식 출역·알림 이력 안정화",
          category: "운영 안정화",
          summary: "얼굴인식 출역 오류와 알림 이력 문제를 재현하고 데이터·화면 흐름을 수정·검증했습니다.",
          result: "출역 오류 분석 · 알림 이력 개선 · 실제 커밋·patch 기록",
        },
      ],
    },
  },
  promptTopics: [
    {
      label: "함안 현장 플랫폼",
      count: 17,
      description: "근로자·출역·대시보드·웹/백엔드 작업이 7월에 가장 자주 기록된 주 작업 경로입니다.",
      examples: ["함안 복합발전소", "근로자 출역", "현장 대시보드"],
      color: "#0f8b8d",
    },
    {
      label: "함안 백엔드",
      count: 8,
      description: "출역 처리, 센서 연동, 대용량 업로드, 데이터 기준 검증을 백엔드 경로에서 수행했습니다.",
      examples: ["출역 배치", "SENSOR_SERVER_URL", "5GB 파일 업로드"],
      color: "#476a6f",
    },
    {
      label: "GH·RAG 운영",
      count: 6,
      description: "RAG Provider API, OCR 도메인 설계, 문서·운영 환경 검토가 연결된 작업 경로입니다.",
      examples: ["CLOVA OCR", "gh-rag-provider", "API 명세"],
      color: "#6f7fd8",
    },
    {
      label: "모바일 기능 개발",
      count: 4,
      description: "관리자·근로자 모바일 메뉴 분리와 마이페이지, 온보딩 흐름을 worktree에서 진행했습니다.",
      examples: ["feature/mobile-dev", "관리자 마이페이지", "근로자 모바일"],
      color: "#2f8f46",
    },
    {
      label: "웹 프론트 개선",
      count: 3,
      description: "순찰 경로·대시보드 시각화와 근로자 일괄 처리 UI를 검토하고 반영했습니다.",
      examples: ["순찰 경로", "작업구역", "필터형 셀렉트"],
      color: "#e85d4f",
    },
    {
      label: "문서·작업 인계",
      count: 3,
      description: "작업 전환을 위한 TODO, README, 재개용 프롬프트와 문서 기록을 남겼습니다.",
      examples: ["RESUME.md", "README", "작업 인계"],
      color: "#c58612",
    },
  ],
  fileBreakdown: [
    { label: "날짜별 활동 폴더", count: 386, unit: "일", description: "지시·세션·커밋·코드 patch를 날짜별 보관", color: "#0f8b8d" },
    { label: "사람 업무 지시", count: 6_298, unit: "건", description: "Claude Code 1,169 · Codex 5,129", color: "#2f8f46" },
    { label: "AI 세션", count: 874, unit: "건", description: "사람 업무 지시가 있었던 세션 인덱스", color: "#6f7fd8" },
    { label: "실제 Git 커밋", count: 4_137, unit: "건", description: "커밋 시각·저장소·제목·변경량을 날짜별 저장", color: "#e85d4f" },
    { label: "AI 하위 작업 지시", count: 300, unit: "건", description: "agent-tasks 원천 · 사람 업무 지시와 별도 집계", color: "#c58612" },
  ],
  highlights: [
    {
      title: "함안 복합발전소 현장 플랫폼 고도화",
      category: "현장 안전 플랫폼",
      summary: "근로자 출역, 작업구역, 대시보드와 순찰 경로를 실제 현장 데이터 기준으로 분석·수정하고 웹·백엔드 작업을 연결했습니다.",
      result: "작업 지시·세션·커밋·코드 patch 원천 기록",
    },
    {
      title: "관리자·근로자 모바일 기능 개발",
      category: "모바일 제품 개발",
      summary: "관리자와 근로자 메뉴 체계 분리, 마이페이지와 온보딩 요구사항을 worktree 기반으로 구현·검토했습니다.",
      result: "feature/mobile-dev 작업 흐름 · 모바일 웹/백엔드 커밋 기록",
    },
    {
      title: "IoT 센서·현장 대시보드 연동",
      category: "현장 운영 자동화",
      summary: "센서 서버 연결, 위험요소 표시 기준, 순찰 경로와 근로자 위치 표현을 점검하고 운영 환경에서 재현·검증했습니다.",
      result: "센서 환경 설정 · 대시보드 UI 검토 · 개발 서버 확인 기록",
    },
    {
      title: "대용량 업로드와 운영 환경 안정화",
      category: "개발 운영",
      summary: "Nginx 업로드 한도, 파일 등록 오류, 서비스 재기동과 dev 브랜치 병합 절차를 작업 흐름 안에서 관리했습니다.",
      result: "오류 분석·설정 변경·커밋 및 병합 기록",
    },
    {
      title: "OCR·RAG 서비스 설계 및 문서화",
      category: "AI 기능 설계",
      summary: "CLOVA OCR 도메인 설계, RAG Provider API, 한글 API 명세와 재개용 작업 문서를 함께 정리했습니다.",
      result: "도메인 설계 지시 · API 검토 · README/RESUME 기록",
    },
  ],
  notes: [
    "Drive README와 index.csv는 2024-07-23~2026-08-19의 활동일 386일, 사람 업무 지시 6,298건, Claude Code 1,169건, Codex 5,129건을 집계합니다.",
    "날짜 폴더에는 instructions, sessions, commits, code patch가 기본 구성으로 보관되며, 일부 날짜에는 AI 하위 작업 지시(agent-tasks)가 별도 저장됩니다.",
    "7월에는 21일 동안 사람 업무 지시 966건, AI 세션 255건, 실제 커밋 388건, 추가 57,530줄·삭제 17,766줄이 index.csv에 기록되었습니다.",
    "AI 하위 작업 지시 300건은 사람이 직접 입력한 업무 지시와 별도 원천이므로 활동량 합계에 중복 반영하지 않습니다.",
    "GitLab 수정 라인은 개인별 AI 활동 화면의 GitLab 공식 집계가 우선이며, 이 Drive의 commits.csv는 작업 지시와 코드 변경을 연결해 해석하는 보조 근거입니다.",
    "저장된 지시·세션·커밋·patch는 작업 과정과 산출 신호이며, 최종 승인, 배포, 품질, 실제 업무 효과는 별도 검증이 필요합니다.",
  ],
};

const jeonWoosungDriveUrl =
  "https://drive.google.com/drive/folders/1Qn2i19lKy_4OlTu-H1UiVfhuGZTevMZL?usp=drive_link";

export const jeonWoosungProfileData: IndividualProfileData = {
  email: "woosung.jeon@riskzero.kr",
  displayName: "전우성 부장",
  title: "부장",
  department: "플랫폼개발",
  approvalOwner: "전우성 부장",
  accountLabel: "Claude Team Plan Premium",
  measurementNote:
    "Claude Team 사용량은 개인 계정으로 측정하며, 별도 Drive에는 날짜별 마스킹 프롬프트, 코드 변경 근거와 업무 문서가 보관됩니다.",
  costBasisNote:
    "AI 도구 결재 현황의 Claude Team Plan Premium 현재 월 고정비를 반영했습니다. API 변동비는 개인에게 배분하지 않았습니다.",
  sourceLinks: [{ label: "전우성 AI 작업 기록 Drive", url: jeonWoosungDriveUrl }],
  drive: {
    folderName: "전우성 AI 개인 산출물 저장소",
    folderUrl: jeonWoosungDriveUrl,
    collectedAt: "2026-08-21 KST",
    period: "2025-12-19 ~ 2026-08-20",
    fileCount: 834,
    childFolderCount: 449,
    scannedFolderCount: 450,
    scanErrors: 0,
    promptFiles: 15,
    responseFiles: 0,
    pairedSessions: 0,
    responseOnlySessions: 0,
    outputAndSupportFiles: 819,
    archiveFiles: 0,
    metadataDateAnomalies: 0,
    rootFolderCount: 1,
    activityMetricLabel: "Drive 작업 기록",
    activityMetricDetail: "날짜별 보관 파일 기준 · 재수집 누락 날짜 보완",
    trendTitle: "일별 Drive 작업 기록 추이",
    trendSeriesLabel: "작업 기록",
    topicBasisLabel: "8월 19~20일 마스킹 프롬프트 15건과 코드·문서 산출물 교차 분석",
    topicTitle: "대화·프롬프트 업무 영역",
    fileTotalLabel: "중복 제거 후 날짜 연동 기록",
    outputMetricLabel: "저장 산출 신호",
    outputMetricValue: 819,
    outputMetricUnit: "개",
    outputMetricDetail: "코드 변경 근거 664개 · 업무 문서 41개 · 일별 결과 색인 111개 · 기타 3개",
    inventoryTitle: "보관 원천 및 산출물 구성",
    inventorySummaryLabel: "활동일 111일",
    inventoryFootnote:
      "날짜별 결과 색인, 마스킹 프롬프트, 코드 변경 근거와 업무 문서는 서로 다른 단위이므로 합산 성과로 해석하지 않습니다.",
  },
  monthlyPromptCounts: [
    { month: "2026-05", prompts: 114 },
    { month: "2026-06", prompts: 97 },
    { month: "2026-07", prompts: 11 },
    { month: "2026-08", prompts: 62 },
  ],
  insightMonth: "2026-08",
  dailyPromptCounts: [
    { date: "2026-05-06", prompts: 6 },
    { date: "2026-05-07", prompts: 8 },
    { date: "2026-05-08", prompts: 6 },
    { date: "2026-05-11", prompts: 8 },
    { date: "2026-05-12", prompts: 8 },
    { date: "2026-05-13", prompts: 6 },
    { date: "2026-05-14", prompts: 6 },
    { date: "2026-05-15", prompts: 4 },
    { date: "2026-05-18", prompts: 8 },
    { date: "2026-05-19", prompts: 8 },
    { date: "2026-05-20", prompts: 6 },
    { date: "2026-05-21", prompts: 4 },
    { date: "2026-05-22", prompts: 8 },
    { date: "2026-05-26", prompts: 6 },
    { date: "2026-05-27", prompts: 8 },
    { date: "2026-05-28", prompts: 6 },
    { date: "2026-05-29", prompts: 8 },
    { date: "2026-06-01", prompts: 8 },
    { date: "2026-06-02", prompts: 6 },
    { date: "2026-06-04", prompts: 4 },
    { date: "2026-06-05", prompts: 4 },
    { date: "2026-06-08", prompts: 6 },
    { date: "2026-06-09", prompts: 6 },
    { date: "2026-06-10", prompts: 6 },
    { date: "2026-06-11", prompts: 4 },
    { date: "2026-06-12", prompts: 4 },
    { date: "2026-06-15", prompts: 4 },
    { date: "2026-06-16", prompts: 1 },
    { date: "2026-06-17", prompts: 6 },
    { date: "2026-06-18", prompts: 1 },
    { date: "2026-06-19", prompts: 6 },
    { date: "2026-06-22", prompts: 8 },
    { date: "2026-06-23", prompts: 6 },
    { date: "2026-06-24", prompts: 1 },
    { date: "2026-06-25", prompts: 4 },
    { date: "2026-06-26", prompts: 4 },
    { date: "2026-06-29", prompts: 4 },
    { date: "2026-06-30", prompts: 4 },
    { date: "2026-07-01", prompts: 4 },
    { date: "2026-07-02", prompts: 1 },
    { date: "2026-07-22", prompts: 1 },
    { date: "2026-07-23", prompts: 1 },
    { date: "2026-07-24", prompts: 1 },
    { date: "2026-07-27", prompts: 1 },
    { date: "2026-07-28", prompts: 1 },
    { date: "2026-07-30", prompts: 1 },
    { date: "2026-08-03", prompts: 1 },
    { date: "2026-08-04", prompts: 1 },
    { date: "2026-08-05", prompts: 1 },
    { date: "2026-08-06", prompts: 1 },
    { date: "2026-08-19", prompts: 22 },
    { date: "2026-08-20", prompts: 36 },
  ],
  monthlyInsights: {
    "2026-08": {
      topicTitle: "8월 대화·프롬프트 업무 영역",
      topicBasisLabel: "8월 19~20일 마스킹 프롬프트 15건 · 코드·문서 산출물 교차 분석",
      promptTopics: [
        {
          label: "배포·운영 검증",
          count: 5,
          description: "개발 서버 배포 순서, 스모크 테스트와 화면 확인을 연결해 운영 검증을 진행했습니다.",
          examples: ["백엔드·프론트·모바일 배포", "Playwright 스모크", "개발 서버 확인"],
          color: "#0f8b8d",
        },
        {
          label: "안전 업무 기능 개선",
          count: 4,
          description: "건설장비 유효성, 작업 전 점검과 TBM 이전 불러오기 기능의 개선 계획을 검토했습니다.",
          examples: ["PTW 장비 유효성", "작업 전 점검", "TBM 이전 불러오기"],
          color: "#e85d4f",
        },
        {
          label: "위험성평가 품질 관리",
          count: 3,
          description: "공종 콤보 개선을 위해 요구사항, 조사, 구현 계획과 TDD 검토를 함께 기록했습니다.",
          examples: ["위험성평가 공종 콤보", "TDD 계획", "구현 검토"],
          color: "#2f8f46",
        },
        {
          label: "코드 정리·변경 관리",
          count: 3,
          description: "미사용 메뉴 차단과 웹 취약점 보완을 코드 리뷰·QA·최종 보고까지 연결했습니다.",
          examples: ["미사용 메뉴 차단", "웹 취약점 보완", "코드 리뷰·QA"],
          color: "#6f7fd8",
        },
      ],
      highlights: [
        {
          title: "개발 서버 배포와 다중 화면 검증",
          category: "개발 운영",
          summary: "백엔드·프론트·모바일 배포 순서와 배포 후 스모크·화면 확인 절차를 대화와 코드 변경 근거에 남겼습니다.",
          result: "3개 저장소 코드 변경 근거 · 일별 커밋 CSV · 배포 검증 기록",
        },
        {
          title: "건설장비 유효성·작업 전 점검 개선",
          category: "현장 안전 기능",
          summary: "PTW 장비 유효성 계획과 작업 전 점검 파일 기준을 검토해 기능·문서 기준을 함께 정리했습니다.",
          result: "유효성 계획 · 적합 파일 기준 검토 · 개선 계획 문서",
        },
        {
          title: "위험성평가 공종 콤보 개선 패키지",
          category: "위험성평가",
          summary: "조사, 논의, 구현 계획, 검토와 TDD 계획을 동일 작업 묶음으로 관리했습니다.",
          result: "연구·논의 · 구현 계획 · 계획 검토 · TDD 문서",
        },
        {
          title: "미사용 메뉴 차단과 웹 보완",
          category: "품질·보안",
          summary: "미사용 메뉴의 호출 차단 방안을 코드 리뷰, QA 체크리스트와 최종 보고까지 연결했습니다.",
          result: "요구사항 · 코드 리뷰 · QA 보고 · 최종 보고",
        },
      ],
    },
  },
  promptTopics: [
    {
      label: "배포·운영 검증",
      count: 5,
      description: "개발 서버 배포와 스모크·화면 확인을 연결한 작업입니다.",
      examples: ["배포", "스모크 테스트", "화면 확인"],
      color: "#0f8b8d",
    },
    {
      label: "안전 업무 기능 개선",
      count: 4,
      description: "PTW 장비 유효성, 작업 전 점검과 TBM 개선을 검토했습니다.",
      examples: ["PTW", "작업 전 점검", "TBM"],
      color: "#e85d4f",
    },
    {
      label: "위험성평가 품질 관리",
      count: 3,
      description: "공종 콤보의 조사·구현·TDD 검토를 수행했습니다.",
      examples: ["위험성평가", "구현 계획", "TDD"],
      color: "#2f8f46",
    },
    {
      label: "코드 정리·변경 관리",
      count: 3,
      description: "미사용 메뉴와 웹 보완 작업의 코드 리뷰·QA를 기록했습니다.",
      examples: ["미사용 메뉴", "코드 리뷰", "QA"],
      color: "#6f7fd8",
    },
  ],
  fileBreakdown: [
    { label: "일별 결과 색인", count: 111, description: "기본 날짜 폴더와 재수집 누락 날짜 기록", color: "#0f8b8d" },
    { label: "코드 변경 근거", count: 664, description: "patch·변경 요약·일자별 커밋 CSV", color: "#e85d4f" },
    { label: "마스킹 프롬프트", count: 15, description: "Claude 14개 · Codex 1개", color: "#2f8f46" },
    { label: "업무 문서", count: 41, description: "개선 계획·요구사항·검토·QA 문서", color: "#6f7fd8" },
    { label: "기타 원천", count: 3, description: "초기 소급 수집 및 보조 기록", color: "#c58612" },
  ],
  highlights: [
    {
      title: "개발 서버 배포와 다중 화면 검증",
      category: "개발 운영",
      summary: "백엔드·프론트·모바일 배포 후 스모크·화면 확인을 이어서 수행했습니다.",
      result: "저장소 3개 · 커밋 CSV · 배포 검증 기록",
    },
    {
      title: "건설장비 유효성·작업 전 점검 개선",
      category: "현장 안전 기능",
      summary: "PTW와 작업 전 점검의 기능·문서 기준을 함께 검토했습니다.",
      result: "유효성 계획 · 파일 기준 검토 · 개선 계획",
    },
    {
      title: "위험성평가 공종 콤보 개선",
      category: "위험성평가",
      summary: "조사부터 구현 계획과 TDD 검토까지 작업 맥락을 연결했습니다.",
      result: "연구·논의 · 구현 계획 · 계획 검토 · TDD",
    },
    {
      title: "미사용 메뉴 차단과 웹 보완",
      category: "품질·보안",
      summary: "미사용 기능 차단 방안을 요구사항, 코드 리뷰와 QA로 검증했습니다.",
      result: "요구사항 · 코드 리뷰 · QA 보고 · 최종 보고",
    },
  ],
  notes: [
    "지정 Drive 루트와 모든 하위 폴더를 읽기 전용으로 재귀 조회했으며, 기본 날짜 폴더 98일과 재수집 보관소의 누락 날짜 13일을 병합해 활동일 111일·중복 제거 후 파일 834개를 집계했습니다.",
    "8월 19~20일에는 개인정보 마스킹된 Claude 14개와 Codex 1개의 대화·프롬프트 원천이 저장돼 있습니다.",
    "재수집 보관소는 동일 날짜의 사본이 섞여 있어 기본 날짜 폴더를 우선하고, 기본 폴더가 없는 날짜만 보완했습니다. 5~8월 그래프는 대화 건수가 아닌 날짜별 Drive 작업 기록 수입니다.",
    "코드 변경 근거와 문서 파일은 작업 과정·산출 신호이며, 최종 승인·배포·품질·실제 업무 효과는 별도 검증이 필요합니다.",
  ],
};

export const individualProfileDataByEmail: Readonly<Record<string, IndividualProfileData>> = {
  [kimJaewooProfileData.email]: kimJaewooProfileData,
  [limSeongbeomProfileData.email]: limSeongbeomProfileData,
  [joJooyeonProfileData.email]: joJooyeonProfileData,
  [leeHyeongbaeProfileData.email]: leeHyeongbaeProfileData,
  [kimDaeilProfileData.email]: kimDaeilProfileData,
  [parkYeonseokProfileData.email]: parkYeonseokProfileData,
  [jeongJaeyoProfileData.email]: jeongJaeyoProfileData,
  [jeonWoosungProfileData.email]: jeonWoosungProfileData,
};
