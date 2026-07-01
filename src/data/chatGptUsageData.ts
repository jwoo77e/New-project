export type ChatGptUsageTopic = {
  topic: string;
  conversations: number;
  messages: number;
  attachmentRefs: number;
  share: number;
  signal: string;
  businessUse: string;
  evidence: string;
  color: string;
};

export type ChatGptMonthlyUsage = {
  month: string;
  conversations: number;
  messages: number;
  attachmentRefs: number;
};

export type ChatGptModelUsage = {
  model: string;
  messages: number;
  share: number;
};

export type ChatGptFileSignal = {
  label: string;
  value: number;
  note: string;
};

export type ChatGptRepresentativeThread = {
  title: string;
  date: string;
  category: string;
  messages: number;
  attachmentRefs: number;
  signal: string;
};

export type ChatGptUsageData = {
  source: {
    name: string;
    folderName: string;
    collectedAt: string;
    period: string;
    status: string;
    note: string;
  };
  totalConversations: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  activeDays: number;
  businessConversationShare: number;
  conversationAssetFiles: number;
  libraryFiles: number;
  readyLibraryFiles: number;
  messageOriginLibraryFiles: number;
  typedArtifacts: number;
  workHourMessageShare: number;
  topicInsights: ChatGptUsageTopic[];
  monthlyUsage: ChatGptMonthlyUsage[];
  modelUsage: ChatGptModelUsage[];
  fileSignals: ChatGptFileSignal[];
  representativeThreads: ChatGptRepresentativeThread[];
  insights: string[];
  caveats: string[];
};

export const chatGptUsageData: ChatGptUsageData = {
  source: {
    name: "ChatGPT export 분석",
    folderName: "0eb06c1358cdf7b2dd396d4c376de13d8821e75214477bbc03d5eb95580f44d5-2026-06-30-03-12-02-b6ca68c1d7384793983da178d42c169c",
    collectedAt: "2026-06-30 03:12 KST",
    period: "2025-02-21 ~ 2026-06-30",
    status: "JSON export 반영",
    note: "conversations-000~015.json, conversation_asset_file_names.json, library_files.json을 읽어 대화·메시지·모델·첨부/라이브러리 파일 신호를 집계했습니다.",
  },
  totalConversations: 1552,
  totalMessages: 32881,
  userMessages: 14515,
  assistantMessages: 18366,
  activeDays: 357,
  businessConversationShare: 83.8,
  conversationAssetFiles: 966,
  libraryFiles: 130,
  readyLibraryFiles: 107,
  messageOriginLibraryFiles: 64,
  typedArtifacts: 14,
  workHourMessageShare: 91.9,
  topicInsights: [
    {
      topic: "RiskZero·안전/제안",
      conversations: 768,
      messages: 24565,
      attachmentRefs: 16828,
      share: 49.5,
      signal: "업무 맥락의 중심",
      businessUse: "산업안전, 공공 제안, WIMS/관제/센서, 철도·발전소·현장 안전관리 자료 검토",
      evidence: "대화 768개, 메시지 24,565개, 첨부 참조 16,828건",
      color: "#2f8f46",
    },
    {
      topic: "개발·인프라/데이터",
      conversations: 364,
      messages: 5984,
      attachmentRefs: 3205,
      share: 23.5,
      signal: "기술 문제 해결 채널",
      businessUse: "Spring, NGINX, DB, API, Git, 배포 오류, 로그 분석, 네트워크·서버 설정 검토",
      evidence: "대화 364개, 메시지 5,984개, 첨부 참조 3,205건",
      color: "#0f8b8d",
    },
    {
      topic: "문서·보고/업무 생산성",
      conversations: 114,
      messages: 912,
      attachmentRefs: 1340,
      share: 7.3,
      signal: "자료 재가공과 보고 지원",
      businessUse: "PPT, 보고서, 회의록, 엑셀, 체크리스트, 아이콘·UI 자료와 설명 문서 정리",
      evidence: "대화 114개, 메시지 912개, 첨부 참조 1,340건",
      color: "#c58612",
    },
    {
      topic: "AI 도구·비용/운영",
      conversations: 32,
      messages: 212,
      attachmentRefs: 611,
      share: 2.1,
      signal: "AI 운영 지식 축적",
      businessUse: "ChatGPT, Claude, Gemini, Genspark, Gamma, API 키, 토큰, 요금, 프롬프트와 대시보드 운영",
      evidence: "대화 32개, 메시지 212개, 첨부 참조 611건",
      color: "#9a6b36",
    },
    {
      topic: "리서치·정책/시장",
      conversations: 23,
      messages: 146,
      attachmentRefs: 276,
      share: 1.5,
      signal: "외부 동향 확인",
      businessUse: "정책, 시장, 특허, 기관·업체 정보, 장비 사양과 발주 계획 확인",
      evidence: "대화 23개, 메시지 146개, 첨부 참조 276건",
      color: "#5f6f8c",
    },
    {
      topic: "개인·생활/비업무",
      conversations: 15,
      messages: 147,
      attachmentRefs: 237,
      share: 1.0,
      signal: "업무 활용과 분리 관리",
      businessUse: "건강, 생활, 기기 설정, 책 추천 등 업무성과 지표에서 제외할 개인성 질의",
      evidence: "대화 15개, 메시지 147개, 첨부 참조 237건",
      color: "#7d6ca7",
    },
    {
      topic: "미분류/짧은 대화",
      conversations: 236,
      messages: 915,
      attachmentRefs: 1475,
      share: 15.2,
      signal: "추가 태깅 필요",
      businessUse: "제목과 짧은 메시지만으로 업무 목적을 확정하기 어려운 대화",
      evidence: "대화 236개, 메시지 915개, 첨부 참조 1,475건",
      color: "#476a6f",
    },
  ],
  monthlyUsage: [
    { month: "2025-02", conversations: 25, messages: 307, attachmentRefs: 459 },
    { month: "2025-03", conversations: 59, messages: 1488, attachmentRefs: 1200 },
    { month: "2025-04", conversations: 100, messages: 1534, attachmentRefs: 2425 },
    { month: "2025-05", conversations: 73, messages: 2095, attachmentRefs: 2590 },
    { month: "2025-06", conversations: 91, messages: 1997, attachmentRefs: 1819 },
    { month: "2025-07", conversations: 123, messages: 3720, attachmentRefs: 1809 },
    { month: "2025-08", conversations: 99, messages: 3734, attachmentRefs: 1581 },
    { month: "2025-09", conversations: 191, messages: 6010, attachmentRefs: 2909 },
    { month: "2025-10", conversations: 138, messages: 2444, attachmentRefs: 2244 },
    { month: "2025-11", conversations: 220, messages: 3737, attachmentRefs: 2355 },
    { month: "2025-12", conversations: 171, messages: 2192, attachmentRefs: 1923 },
    { month: "2026-01", conversations: 74, messages: 725, attachmentRefs: 820 },
    { month: "2026-02", conversations: 31, messages: 432, attachmentRefs: 444 },
    { month: "2026-03", conversations: 48, messages: 692, attachmentRefs: 420 },
    { month: "2026-04", conversations: 36, messages: 705, attachmentRefs: 380 },
    { month: "2026-05", conversations: 36, messages: 482, attachmentRefs: 309 },
    { month: "2026-06", conversations: 37, messages: 587, attachmentRefs: 285 },
  ],
  modelUsage: [
    { model: "gpt-4o", messages: 4734, share: 25.8 },
    { model: "gpt-5-thinking", messages: 3432, share: 18.7 },
    { model: "gpt-5", messages: 2828, share: 15.4 },
    { model: "gpt-5-instant", messages: 1322, share: 7.2 },
    { model: "gpt-5-1", messages: 1134, share: 6.2 },
    { model: "gpt-4-1", messages: 685, share: 3.7 },
    { model: "gpt-4o-mini", messages: 519, share: 2.8 },
    { model: "gpt-5-1-instant", messages: 510, share: 2.8 },
  ],
  fileSignals: [
    {
      label: "대화 자산 파일",
      value: 966,
      note: "conversation_asset_file_names.json 기준 unique asset name",
    },
    {
      label: "이미지·스크린샷",
      value: 953,
      note: "PNG/JPEG/JPG/WEBP 자산으로 화면 캡처 기반 질의가 대부분",
    },
    {
      label: "라이브러리 파일",
      value: 130,
      note: "library_files.json 기준, ready 107개와 failed 23개",
    },
    {
      label: "메시지 연계 파일",
      value: 64,
      note: "origination_message_id가 있는 라이브러리 파일",
    },
    {
      label: "구조화 산출 후보",
      value: 14,
      note: "report, writing_block, image 등 library_artifact_type이 지정된 항목",
    },
  ],
  representativeThreads: [
    {
      title: "API 항목 추출 분석",
      date: "2025-08-08",
      category: "RiskZero·안전/제안",
      messages: 813,
      attachmentRefs: 174,
      signal: "대량 API·업무 항목을 구조화하는 장문 분석",
    },
    {
      title: "Spring 배치 프로그램 설정",
      date: "2025-09-01",
      category: "개발·인프라/데이터",
      messages: 793,
      attachmentRefs: 95,
      signal: "백엔드 설정과 배치 처리 문제를 반복 진단",
    },
    {
      title: "풍속 센서 설명",
      date: "2025-10-14",
      category: "RiskZero·안전/제안",
      messages: 673,
      attachmentRefs: 28,
      signal: "산업안전 센서/현장 데이터 설명 자료화",
    },
    {
      title: "제5차 철도망 계획",
      date: "2025-10-23",
      category: "문서·보고/업무 생산성",
      messages: 91,
      attachmentRefs: 409,
      signal: "대량 첨부 자료를 기반으로 정책·사업 문맥 분석",
    },
    {
      title: "SH공사 수주업체 정보",
      date: "2025-05-29",
      category: "RiskZero·안전/제안",
      messages: 26,
      attachmentRefs: 401,
      signal: "공공기관·수주 정보 조사와 제안 준비",
    },
    {
      title: "건설업 안전관리 체크리스트",
      date: "2025-06-20",
      category: "RiskZero·안전/제안",
      messages: 52,
      attachmentRefs: 313,
      signal: "안전관리 문서와 체크리스트 검토",
    },
  ],
  insights: [
    "대화 기준 83.8%가 업무성 주제로 분류되며, 개인·생활 질의는 1.0% 수준입니다.",
    "RiskZero·안전/제안 주제는 대화 49.5%이지만 메시지 기준으로는 74.7%를 차지해 장문 분석이 집중됩니다.",
    "개발·인프라/데이터 대화가 364개로 두 번째 축이며, ChatGPT가 기술 트러블슈팅과 코드/서버 검토에 반복 사용됐습니다.",
    "09~18시 메시지가 91.9%라 업무 시간대 사용 신호가 강합니다.",
    "대화 자산 966개 중 대부분이 이미지·스크린샷이라 화면 캡처 기반 오류 진단과 자료 판독 비중이 큽니다.",
  ],
  caveats: [
    "ChatGPT export의 library_files는 파일명·상태·origination_message_id를 제공하지만, 최종 제출 여부나 실제 채택 여부는 별도 업무 태그가 필요합니다.",
    "대화 자산 파일은 같은 대화 안에서 여러 번 참조될 수 있어 첨부 참조 수와 unique 파일 수를 분리해서 해석해야 합니다.",
    "미분류/짧은 대화 236개는 업무·개인 여부를 확정하기 어려워 향후 대화 제목/업무 태그 보완 대상입니다.",
  ],
};
