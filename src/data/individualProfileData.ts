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

export const individualProfileDataByEmail: Readonly<Record<string, IndividualProfileData>> = {
  [kimJaewooProfileData.email]: kimJaewooProfileData,
};
