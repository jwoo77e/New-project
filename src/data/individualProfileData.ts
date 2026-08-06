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
};

export type IndividualProfileHighlight = {
  title: string;
  category: string;
  summary: string;
  result: string;
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
  };
  monthlyPromptCounts: Array<{ month: string; prompts: number }>;
  dailyPromptCounts: Array<{ date: string; prompts: number }>;
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
  },
  monthlyPromptCounts: [
    { month: "2026-07", prompts: 298 },
    { month: "2026-08", prompts: 48 },
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
    { date: "2026-08-02", prompts: 8 },
    { date: "2026-08-03", prompts: 10 },
    { date: "2026-08-04", prompts: 11 },
    { date: "2026-08-05", prompts: 9 },
  ],
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
      "요청 기준에 따라 임성범 부장의 Claude Pro Max 20과 Genspark Pro 월 고정비를 두 상세 페이지에 동일하게 표시합니다.",
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
  email: "shared-account:lim-seongbeom",
  displayName: "임성범 부장",
});

export const joJooyeonProfileData = buildStrategySharedProfile({
  email: "shared-account:jo-jooyeon",
  displayName: "조주연 부장",
});

const leeHyeongbaeDriveUrl =
  "https://drive.google.com/drive/folders/1OFfN4APAViKNtgURnmn9W51jSvcxy6fg?usp=drive_link";

export const leeHyeongbaeProfileData: IndividualProfileData = {
  email: "shared-account:lee-hyeongbae",
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
    "AI 도구 결재 현황의 Claude Pro Max 5와 2026년 8월 시작 ChatGPT Pro(5배) 월 고정비를 합산했습니다. API 변동비는 개인에게 배분하지 않았습니다.",
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
    trendSeriesLabel: "대화 기록 저장본",
    topicBasisLabel: "파일명·대표 본문 분류 264건",
    fileTotalLabel: "전체 저장",
  },
  monthlyPromptCounts: [
    { month: "2026-07", prompts: 209 },
    { month: "2026-08", prompts: 55 },
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
    { date: "2026-08-01", prompts: 9 },
    { date: "2026-08-02", prompts: 9 },
    { date: "2026-08-03", prompts: 10 },
    { date: "2026-08-04", prompts: 12 },
    { date: "2026-08-05", prompts: 7 },
    { date: "2026-08-06", prompts: 8 },
  ],
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

export const individualProfileDataByEmail: Readonly<Record<string, IndividualProfileData>> = {
  [kimJaewooProfileData.email]: kimJaewooProfileData,
  [limSeongbeomProfileData.email]: limSeongbeomProfileData,
  [joJooyeonProfileData.email]: joJooyeonProfileData,
  [leeHyeongbaeProfileData.email]: leeHyeongbaeProfileData,
};
