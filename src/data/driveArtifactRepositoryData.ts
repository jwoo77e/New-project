export type DriveArtifactKind = "프롬프트" | "프롬프트+응답" | "응답" | "업무보고" | "데이터 파일" | "문서 산출물";

export type DriveArtifact = {
  title: string;
  url: string;
  mimeType: string;
  createdAt: string;
  modifiedAt: string;
  kind: DriveArtifactKind;
  useCase: string;
  usageSignal: string;
};

export type DriveArtifactBreakdown = {
  label: string;
  count: number;
  share: number;
  color: string;
};

export type DriveArtifactDailyCount = {
  date: string;
  count: number;
};

export type DriveArtifactInventory = {
  fileCount: number;
  directFileCount: number;
  nestedFileCount: number;
  folderCount: number;
  maxDepth: number;
  uniqueFileCount: number;
  duplicateCopyCount: number;
  metadataDateAnomalyCount: number;
  documentCount: number;
  dataFileCount: number;
  typeCounts: Record<string, number>;
  useCaseCounts: Record<string, number>;
  dailyCounts: DriveArtifactDailyCount[];
};

export type DriveArtifactRepository = {
  owner: string;
  folderName: string;
  folderId: string;
  folderUrl: string;
  role: string;
  folderModifiedAt: string;
  fileCount: number;
  promptCount: number;
  outputCount: number;
  documentCount: number;
  dataFileCount: number;
  utilizationScore: number;
  utilizationLevel: string;
  inventory: DriveArtifactInventory;
  typeBreakdown: DriveArtifactBreakdown[];
  useCaseBreakdown: DriveArtifactBreakdown[];
  artifacts: DriveArtifact[];
  insights: string[];
};

export type DriveArtifactRepositoryData = {
  source: {
    name: string;
    collectedAt: string;
    period: string;
    note: string;
  };
  totals: {
    repositories: number;
    files: number;
    prompts: number;
    outputs: number;
    documents: number;
    dataFiles: number;
    folders: number;
    directFiles: number;
    nestedFiles: number;
    uniqueFiles: number;
    duplicateCopies: number;
    metadataDateAnomalies: number;
  };
  repositories: DriveArtifactRepository[];
  zipAnalysisPipeline: DriveZipAnalysisPipeline;
  insights: string[];
};

export type DriveZipPipelineStage = {
  label: string;
  action: string;
  result: string;
};

export type DriveZipTaskGroup = {
  title: string;
  folderName: string;
  useCase: string;
  fileCount: number;
  promptCount: number;
  responseCount: number;
  skillCount: number;
  dataFiles: string[];
  summary: string;
  verification: string;
};

export type DriveZipArchiveAnalysis = {
  owner: string;
  archiveName: string;
  folderUrl: string;
  sourceParts: string[];
  combinedSizeBytes: number;
  extractedEntries: number;
  extractedFiles: number;
  extractedDirectories: number;
  promptFiles: number;
  responseFiles: number;
  skillFiles: number;
  dataFiles: number;
  crcWarningFiles: string[];
  cleanupStatus: string;
  verificationStatus: string;
  taskGroups: DriveZipTaskGroup[];
};

export type DriveZipAnalysisPipeline = {
  collectedAt: string;
  mode: string;
  cleanupPolicy: string;
  stages: DriveZipPipelineStage[];
  totals: {
    splitParts: number;
    archives: number;
    extractedFiles: number;
    taskGroups: number;
    dataFiles: number;
    crcWarnings: number;
  };
  archives: DriveZipArchiveAnalysis[];
};

const inventoryTypeColors: Record<string, string> = {
  "Google Docs": "#0f8b8d",
  "세션 텍스트": "#5f6f8c",
  "이미지·미디어": "#e85d4f",
  "Office·데이터": "#2f8f46",
  "코드·구성": "#7d6ca7",
  "압축·분할 보관": "#c58612",
};

const useCaseColors: Record<string, string> = {
  "AX 운영·KPI": "#0f8b8d",
  "산업·AI 트렌드": "#7d6ca7",
  "IRIS·공고 데이터": "#2f8f46",
  "업무보고·지식관리": "#c58612",
  "초안·문서화": "#5f6f8c",
  "현장 안전관리 자료": "#e85d4f",
  "사업장 데이터 수집": "#0f8b8d",
  "V1 초안 정리": "#5f6f8c",
  "자료실·현장 데이터 수집": "#0f8b8d",
  "안전관리 계획·비용": "#c58612",
};

const jaewooArtifacts: DriveArtifact[] = [
  {
    title: "IRIS_연구과제공고_7일_20260622.xlsx",
    url: "https://docs.google.com/spreadsheets/d/106kKY0ZtfI1u72ZSWCQOp_8nT4WyBTba/edit?usp=drivesdk&ouid=112973521836270298332&rtpof=true&sd=true",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    createdAt: "2026-06-23T03:34:37.875Z",
    modifiedAt: "2026-06-23T03:34:37.875Z",
    kind: "데이터 파일",
    useCase: "IRIS·공고 데이터",
    usageSignal: "IRIS 연구과제 공고 수집 결과가 별도 엑셀 산출물로 저장됨",
  },
  {
    title: "2026-06-21_Claude-session-to-notion_11dc5d34588d_응답.md",
    url: "https://drive.google.com/file/d/1aIo4J2ugWhujbYLgQF7O0yw-T_U2hYV4/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:15:39.377Z",
    modifiedAt: "2026-06-23T03:15:39.377Z",
    kind: "응답",
    useCase: "업무보고·지식관리",
    usageSignal: "Claude 세션을 Notion/Drive 기록으로 전환하는 자동화 응답",
  },
  {
    title: "2026-06-21_Claude-session-to-notion_11dc5d34588d_프롬프트.md",
    url: "https://drive.google.com/file/d/10sxfL00tj_4xwo3wHabCry3uLhjQvU_-/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:15:30.556Z",
    modifiedAt: "2026-06-23T03:15:30.556Z",
    kind: "프롬프트",
    useCase: "업무보고·지식관리",
    usageSignal: "응답 파일과 쌍으로 보관되어 재현 가능한 프롬프트 기록",
  },
  {
    title: "2026-06-21_Ax-kpi-daily-update_cff49fd9c420_응답.md",
    url: "https://drive.google.com/file/d/1UzOz0nO51pBEQtBe-g7uH8TOZb52qmV2/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:15:26.920Z",
    modifiedAt: "2026-06-23T03:15:26.920Z",
    kind: "응답",
    useCase: "AX 운영·KPI",
    usageSignal: "AX KPI 일일 업데이트 산출 응답",
  },
  {
    title: "2026-06-21_Ax-kpi-daily-update_cff49fd9c420_프롬프트.md",
    url: "https://drive.google.com/file/d/1i6p8DUijFmqmq0UuMSseAhgvEI3qSI-Z/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:15:20.806Z",
    modifiedAt: "2026-06-23T03:15:20.806Z",
    kind: "프롬프트",
    useCase: "AX 운영·KPI",
    usageSignal: "AX KPI 일일 업데이트 요청 프롬프트",
  },
  {
    title: "2026-06-21_Aitrendv1_d67f59bf56c8_응답.md",
    url: "https://drive.google.com/file/d/1PAK5qBVgBCUEIc8eBL7rvuRDOVAinwZI/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:15:16.758Z",
    modifiedAt: "2026-06-23T03:15:16.758Z",
    kind: "응답",
    useCase: "산업·AI 트렌드",
    usageSignal: "AI 트렌드 분석 응답",
  },
  {
    title: "2026-06-21_Aitrendv1_d67f59bf56c8_프롬프트.md",
    url: "https://drive.google.com/file/d/1_q8GrommUOuV2SxMpShTg5KqZQ4uqnSm/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:15:07.875Z",
    modifiedAt: "2026-06-23T03:15:07.875Z",
    kind: "프롬프트",
    useCase: "산업·AI 트렌드",
    usageSignal: "AI 트렌드 분석 요청 프롬프트",
  },
  {
    title: "2026-06-21_Iris_2d2ef096ca58_응답.md",
    url: "https://drive.google.com/file/d/1MTOa_Mr9YWk5gcjRYGO8J7jHvsCtDCKc/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:14:57.649Z",
    modifiedAt: "2026-06-23T03:14:57.649Z",
    kind: "응답",
    useCase: "IRIS·공고 데이터",
    usageSignal: "IRIS 공고 수집/정리 응답",
  },
  {
    title: "2026-06-21_Iris_2d2ef096ca58_프롬프트.md",
    url: "https://drive.google.com/file/d/1-sPl4fsqALA34jElTg06dhA4C_C2uxJj/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:14:47.957Z",
    modifiedAt: "2026-06-23T03:14:47.957Z",
    kind: "프롬프트",
    useCase: "IRIS·공고 데이터",
    usageSignal: "IRIS 공고 수집 요청 프롬프트",
  },
  {
    title: "일일업무보고_2026-06-21.md",
    url: "https://drive.google.com/file/d/1ACCzn6VE8moXCIGPqeciPJUqYmT8YY3P/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:14:44.180Z",
    modifiedAt: "2026-06-23T03:14:44.180Z",
    kind: "업무보고",
    useCase: "업무보고·지식관리",
    usageSignal: "일일 업무보고 산출물로 재사용 가능",
  },
  {
    title: "2026-06-21_V1_885ee8525d03_응답.md",
    url: "https://drive.google.com/file/d/1k83GOEvohbsWmaSXqNheIv1_o8ZeB7NI/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:14:29.284Z",
    modifiedAt: "2026-06-23T03:14:29.284Z",
    kind: "응답",
    useCase: "초안·문서화",
    usageSignal: "V1 초안/정리 응답",
  },
  {
    title: "2026-06-21_V1_885ee8525d03_프롬프트.md",
    url: "https://drive.google.com/file/d/1QoevSltGZ0AwXEjUVGdEBwhoD9hpRLrE/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:14:22.793Z",
    modifiedAt: "2026-06-23T03:14:22.793Z",
    kind: "프롬프트",
    useCase: "초안·문서화",
    usageSignal: "V1 초안/정리 요청 프롬프트",
  },
  {
    title: "2026-06-21_Parkv1_657632d9819b_응답.md",
    url: "https://drive.google.com/file/d/1NKLByS8epCskpt10mtmS1iUoLY1F84cg/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:14:13.107Z",
    modifiedAt: "2026-06-23T03:14:13.107Z",
    kind: "응답",
    useCase: "초안·문서화",
    usageSignal: "Parkv1 문서화 응답",
  },
  {
    title: "2026-06-21_Parkv1_657632d9819b_프롬프트.md",
    url: "https://drive.google.com/file/d/1QPyrIeBqDz4ELPlMiwdoXbl7Lvm4URNJ/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:14:02.881Z",
    modifiedAt: "2026-06-23T03:14:02.881Z",
    kind: "프롬프트",
    useCase: "초안·문서화",
    usageSignal: "Parkv1 문서화 요청 프롬프트",
  },
  {
    title: "2026-06-21_Ax_7acf2f609153_응답.md",
    url: "https://drive.google.com/file/d/13DU-i8BKezoleWV-bPThOSFxV_1Nm2Ix/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:13:58.382Z",
    modifiedAt: "2026-06-23T03:13:58.382Z",
    kind: "응답",
    useCase: "AX 운영·KPI",
    usageSignal: "AX 관련 실무 응답",
  },
  {
    title: "2026-06-21_Ax_7acf2f609153_프롬프트.md",
    url: "https://drive.google.com/file/d/1jEVYPVm5HxosieEt4H4cKJXYEMU_Ikke/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:13:49.517Z",
    modifiedAt: "2026-06-23T03:13:49.517Z",
    kind: "프롬프트",
    useCase: "AX 운영·KPI",
    usageSignal: "AX 관련 실무 요청 프롬프트",
  },
  {
    title: "2026-06-22_Ax-kpi-daily-update_fa76233c2b1f_응답.md",
    url: "https://drive.google.com/file/d/12TiRfcsrs4eKFrhzmgmhL0opRNcFxuN4/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:13:38.598Z",
    modifiedAt: "2026-06-23T03:13:38.598Z",
    kind: "응답",
    useCase: "AX 운영·KPI",
    usageSignal: "AX KPI 일일 업데이트 산출 응답",
  },
  {
    title: "2026-06-22_Ax-kpi-daily-update_fa76233c2b1f_프롬프트.md",
    url: "https://drive.google.com/file/d/1jsY58EyKXcfk4ktJMdgZgcwRYAh-dC-m/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:13:32.468Z",
    modifiedAt: "2026-06-23T03:13:32.468Z",
    kind: "프롬프트",
    useCase: "AX 운영·KPI",
    usageSignal: "AX KPI 일일 업데이트 요청 프롬프트",
  },
  {
    title: "2026-06-22_Daily-blogging_오전_a7d85e6786e3_응답.md",
    url: "https://drive.google.com/file/d/1-bki2wwie3EWy-c40LixqLykRxLyUiHG/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:13:30.719Z",
    modifiedAt: "2026-06-23T03:13:30.719Z",
    kind: "응답",
    useCase: "산업·AI 트렌드",
    usageSignal: "블로그/콘텐츠 초안 응답",
  },
  {
    title: "2026-06-22_Daily-blogging_오전_a7d85e6786e3_프롬프트.md",
    url: "https://drive.google.com/file/d/1oamGI2ztuwOf8rD018NQf0VJGLBe8zg_/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:13:19.552Z",
    modifiedAt: "2026-06-23T03:13:19.552Z",
    kind: "프롬프트",
    useCase: "산업·AI 트렌드",
    usageSignal: "블로그/콘텐츠 초안 요청 프롬프트",
  },
  {
    title: "2026-06-22_Iris_e8996927a856_응답.md",
    url: "https://drive.google.com/file/d/1xpGc2z4unsl2FnemwCnO2u51qidV9vLw/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:13:02.758Z",
    modifiedAt: "2026-06-23T03:13:02.758Z",
    kind: "응답",
    useCase: "IRIS·공고 데이터",
    usageSignal: "IRIS 공고 수집/정리 응답",
  },
  {
    title: "2026-06-22_Iris_e8996927a856_프롬프트.md",
    url: "https://drive.google.com/file/d/1TzABomHsAFQsZrnVpwzO4Gk-3PPZ4-Pb/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:12:54.511Z",
    modifiedAt: "2026-06-23T03:12:54.511Z",
    kind: "프롬프트",
    useCase: "IRIS·공고 데이터",
    usageSignal: "IRIS 공고 수집 요청 프롬프트",
  },
  {
    title: "2026-06-22_Aitrendv1_228e08c54796_응답.md",
    url: "https://drive.google.com/file/d/1Tf-NHXrBz5vBXTmC1ILLag4f3PLPzPiH/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:12:51.307Z",
    modifiedAt: "2026-06-23T03:12:51.307Z",
    kind: "응답",
    useCase: "산업·AI 트렌드",
    usageSignal: "AI 트렌드 분석 응답",
  },
  {
    title: "2026-06-22_Aitrendv1_228e08c54796_프롬프트.md",
    url: "https://drive.google.com/file/d/18SaW_zf37PJ-CRnrJdeEifTHGAzHdUBN/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:12:41.854Z",
    modifiedAt: "2026-06-23T03:12:41.854Z",
    kind: "프롬프트",
    useCase: "산업·AI 트렌드",
    usageSignal: "AI 트렌드 분석 요청 프롬프트",
  },
  {
    title: "2026-06-22_Work-list-status-update_0523916af5d2_응답.md",
    url: "https://drive.google.com/file/d/1ZW0IKtfQkJj9tBKkJhdGujOET_GG1g3i/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:12:30.915Z",
    modifiedAt: "2026-06-23T03:12:30.915Z",
    kind: "응답",
    useCase: "AX 운영·KPI",
    usageSignal: "업무 리스트 상태 업데이트 응답",
  },
  {
    title: "2026-06-22_Work-list-status-update_0523916af5d2_프롬프트.md",
    url: "https://drive.google.com/file/d/1knMmBuap7ZoPvGsSLGidyIktQM98x7_U/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:12:27.325Z",
    modifiedAt: "2026-06-23T03:12:27.325Z",
    kind: "프롬프트",
    useCase: "AX 운영·KPI",
    usageSignal: "업무 리스트 상태 업데이트 요청 프롬프트",
  },
  {
    title: "2026-06-22_Obsidian-LLM-wiki_65b1a380adb2_응답.md",
    url: "https://drive.google.com/file/d/18Iryl9hv3_YtoBj-pSCc9-lHpP97rpE6/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:12:24.729Z",
    modifiedAt: "2026-06-23T03:12:24.729Z",
    kind: "응답",
    useCase: "업무보고·지식관리",
    usageSignal: "Obsidian LLM wiki 운영 응답",
  },
  {
    title: "2026-06-22_Obsidian-LLM-wiki_65b1a380adb2_프롬프트.md",
    url: "https://drive.google.com/file/d/1-jGpJJResbYookib35OYpcONwNUsGxA2/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:12:03.858Z",
    modifiedAt: "2026-06-23T03:12:03.858Z",
    kind: "프롬프트",
    useCase: "업무보고·지식관리",
    usageSignal: "Obsidian LLM wiki 운영 요청 프롬프트",
  },
  {
    title: "2026-06-22_Gensparkv1_34e69a230c44_응답.md",
    url: "https://drive.google.com/file/d/1Mj4H35wPw23VHv7L35LMIPEbkUCRWXBI/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:11:50.660Z",
    modifiedAt: "2026-06-23T03:11:50.660Z",
    kind: "응답",
    useCase: "초안·문서화",
    usageSignal: "Genspark 관련 정리 응답",
  },
  {
    title: "2026-06-22_Gensparkv1_34e69a230c44_프롬프트.md",
    url: "https://drive.google.com/file/d/1Efo0A2fM8mcYZyf_--12MydKNh09TsCX/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:11:44.318Z",
    modifiedAt: "2026-06-23T03:11:44.318Z",
    kind: "프롬프트",
    useCase: "초안·문서화",
    usageSignal: "Genspark 관련 정리 요청 프롬프트",
  },
  {
    title: "일일업무보고_2026-06-22.md",
    url: "https://drive.google.com/file/d/1zznKaxEWxZsbA33pI-oYnTSrHD52Jb80/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:11:41.055Z",
    modifiedAt: "2026-06-23T03:11:41.055Z",
    kind: "업무보고",
    useCase: "업무보고·지식관리",
    usageSignal: "일일 업무보고 산출물로 재사용 가능",
  },
  {
    title: "2026-06-22_V1_d47f1ed9adb5_응답.md",
    url: "https://drive.google.com/file/d/1UHHlnPVs0q7PNBb6q5qtzWA95k9x0bCG/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:11:25.664Z",
    modifiedAt: "2026-06-23T03:11:25.664Z",
    kind: "응답",
    useCase: "초안·문서화",
    usageSignal: "V1 초안/정리 응답",
  },
  {
    title: "2026-06-22_V1_d47f1ed9adb5_프롬프트.md",
    url: "https://drive.google.com/file/d/19qDbNV3o3z_lRkl-Jh-rpL1oeoDrIn8E/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:11:20.552Z",
    modifiedAt: "2026-06-23T03:11:20.552Z",
    kind: "프롬프트",
    useCase: "초안·문서화",
    usageSignal: "V1 초안/정리 요청 프롬프트",
  },
  {
    title: "2026-06-22_Ax_695553238cca_응답.md",
    url: "https://drive.google.com/file/d/1k6BF68D1Qfhnt03W1YjgbpV4xPuH23G0/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:10:55.418Z",
    modifiedAt: "2026-06-23T03:10:55.418Z",
    kind: "응답",
    useCase: "AX 운영·KPI",
    usageSignal: "AX 관련 실무 응답",
  },
  {
    title: "2026-06-22_Ax_695553238cca_프롬프트.md",
    url: "https://drive.google.com/file/d/1mAbK1iAxukpkhwz6YlAeGz2x0FvPWVkv/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:10:46.229Z",
    modifiedAt: "2026-06-23T03:10:46.229Z",
    kind: "프롬프트",
    useCase: "AX 운영·KPI",
    usageSignal: "AX 관련 실무 요청 프롬프트",
  },
  {
    title: "2026-06-22_Daily-blogging_ed69d4639764_응답.md",
    url: "https://drive.google.com/file/d/1cr7ZdetPjSENynDZP6UNhCfB4fEGp-fk/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:10:43.029Z",
    modifiedAt: "2026-06-23T03:10:43.029Z",
    kind: "응답",
    useCase: "산업·AI 트렌드",
    usageSignal: "블로그/콘텐츠 초안 응답",
  },
  {
    title: "2026-06-22_Daily-blogging_ed69d4639764_프롬프트.md",
    url: "https://drive.google.com/file/d/1MRkKEPnIXyUujzs-XONBFNIIKO6tH_1K/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-06-23T03:10:32.079Z",
    modifiedAt: "2026-06-23T03:10:32.079Z",
    kind: "프롬프트",
    useCase: "산업·AI 트렌드",
    usageSignal: "블로그/콘텐츠 초안 요청 프롬프트",
  },
];

const jaewooZipFolderUrl = "https://drive.google.com/drive/folders/1Q2OorOdMlPn8xRBzuHWyY5kqGHxRYpPZ?usp=drive_link";
const jaewooZipModifiedAt = "2026-07-22T02:17:36.314Z";

const jaewooZipArtifacts: DriveArtifact[] = [
  {
    title: "2026-07-22 / AX_2026-07-22",
    url: "https://docs.google.com/document/d/1l6PouazdPQVNpKgw4FXpllLrnM3eN8UUYuSytAfihCg/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-21T23:15:56.508Z",
    modifiedAt: "2026-07-21T23:15:57.931Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal:
      "7월 22일 AX 전환 현황판은 Chrome 제어 직접 크롤링으로 6탭을 수집했고 API 7일 비용 $82.8, Claude API 단일 모델 스파이크, 집계창 1~6월 전진을 기록. Drive 저장소는 전일 모델을 승계하되 오늘 백업 폴더와 처리로그가 추가됨",
  },
  {
    title: "2026-07-22 / AX_대시보드분석_2026-07-22",
    url: "https://docs.google.com/document/d/1l6ap98q5p_H0rPiMwkAboVBFZgX42A47aElLfGVztrY/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-22T02:17:35.084Z",
    modifiedAt: "2026-07-22T02:17:36.314Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal:
      "7월 22일 대시보드 분석 문서로 AI 활용 상세 분석 탭의 Drive 저장 산출물 79개(김재우 59·이형배 20)와 이형배 일부 바이너리 미업로드·크기 불일치 재업로드 권고를 재확인",
  },
  {
    title: "2026-07-22 / AX_세션처리로그_2026-07-22.md",
    url: "https://drive.google.com/file/d/1Bdsz2U2y-_smel31k-VoDX4zhsfRyEMC/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-07-22T02:13:34.701Z",
    modifiedAt: "2026-07-22T02:13:34.701Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal:
      "7월 22일 처리 로그로 7월 21일 대상 신규 13건, AX_세션백업_2026-07-21 세션폴더 12개와 _세션요약.md, 국책·Genspark·AI트렌드·Blog·KPI·CEO·IRIS 바이너리 cp를 기록했고 zip·분할·base64·세션백업 Docs 미사용을 명시",
  },
  {
    title: "2026-07-21 / AX_2026-07-21",
    url: "https://docs.google.com/document/d/1MK6p-1mQ6ZTYB9MnOdbI042dr9LqMlyzypMe7Frqe34/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-20T23:16:26.125Z",
    modifiedAt: "2026-07-20T23:16:27.464Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal:
      "7월 21일 AX 전환 현황판은 Chrome 제어 직접 크롤링으로 6탭을 수집했고 Claude Team 활성 19/19명, Code Lines 204,744줄, API 7일 비용 $65.1를 보고. Drive 저장소는 김재우 56개 기준을 유지한다고 설명",
  },
  {
    title: "2026-07-21 / AX_대시보드분석_2026-07-21",
    url: "https://docs.google.com/document/d/1ltb_ZaEN57LnljjyQhiNOLbcZwkLr7PciStpWcDMb7I/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-21T02:18:05.753Z",
    modifiedAt: "2026-07-21T02:18:06.970Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal:
      "7월 21일 대시보드 분석 문서로 통합 분석 1,776건, 실무 산출형 91건, Drive 산출물 74개, 김재우 56개와 이형배 18개 기준을 재확인",
  },
  {
    title: "2026-07-21 / AX_세션처리로그_2026-07-21.md",
    url: "https://drive.google.com/file/d/1_2KAM-W4OpnH4EJ_G7P8vJDR2pfqsroQ/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-07-21T02:13:33.900Z",
    modifiedAt: "2026-07-21T02:13:33.900Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal:
      "7월 21일 처리 로그로 7월 20일 대상 신규 14건, AX_세션백업_2026-07-20 하위폴더 14개와 _세션요약.md, 생성파일 cp 12건(Genspark xlsx+md+py2, Aitrend md, Blog 5, Iris xlsx+py)을 기록했고 zip·분할·base64·세션백업 Docs 미사용을 명시",
  },
  {
    title: "2026-07-20 / AX_2026-07-20",
    url: "https://docs.google.com/document/d/1rUpVm-cYVLa_U9thDoITYSldF6i62W_xVMnkCnV9yA8/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-19T23:13:51.956Z",
    modifiedAt: "2026-07-19T23:13:53.395Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal:
      "7월 20일 AX 전환 현황판은 Chrome 제어 5탭 직접 크롤링, API 탭 08:08 갱신, 최근 7일 API 비용 $70.4와 Drive 저장 산출물 71개 기준을 승계했다고 보고",
  },
  {
    title: "2026-07-20 / AX_대시보드분석_2026-07-20",
    url: "https://docs.google.com/document/d/1YQQzBZAzh9SmDPnHKLIsm5L0HUImG4SH1023iSd1qyM/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-19T23:28:11.415Z",
    modifiedAt: "2026-07-19T23:28:12.670Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal:
      "7월 20일 대시보드 분석 문서로 통합 분석 1,776건, 실무 산출형 91건, Drive 저장 산출물 71개, 김재우 53개와 이형배 18개 기준을 재확인",
  },
  {
    title: "2026-07-20 / AX_세션처리로그_2026-07-20.md",
    url: "https://drive.google.com/file/d/1P5XORmoaf0gkGvHnfgxcjmWUoJeA_4zn/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-07-19T23:24:04.195Z",
    modifiedAt: "2026-07-19T23:24:04.197Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal:
      "7월 20일 처리 로그로 7월 19일 대상 신규 8건, AX_세션백업_2026-07-19 하위폴더 7개와 _세션요약.md, Iris·Blog·AItrend·Genspark 생성파일 cp를 기록했고 zip·분할·base64·세션백업 Docs 미사용을 명시",
  },
  {
    title: "2026-07-19 / AX_2026-07-19",
    url: "https://docs.google.com/document/d/1owN3xSXBVx5bVKXZLDz0CqVH4agb0n-MfWJM2KxoLOI/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-18T23:14:40.357Z",
    modifiedAt: "2026-07-18T23:14:41.730Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 19일 AX 전환 현황판은 Firecrawl 5탭 정상 수집, 통합 활용기록 1,776건, Drive 저장 산출물 71개, 김재우 53개, 이형배 18개와 zip 내부 6개 상태를 유지한다고 보고",
  },
  {
    title: "2026-07-19 / AX_대시보드분석_2026-07-19.md",
    url: "https://drive.google.com/file/d/1qdpLFd-Kf1gXeruRdTB3nQrRvFUiLjct/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-07-19T02:20:06.536Z",
    modifiedAt: "2026-07-19T02:20:06.536Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 19일 대시보드 분석 Markdown으로 통합 분석 1,776건, 실무 산출형 91건, Drive 저장 산출물 71개, 김재우 53개와 이형배 18개 상태를 재점검",
  },
  {
    title: "2026-07-19 / AX_세션처리로그_2026-07-19.md",
    url: "https://drive.google.com/file/d/16nBT_E0fSjk_h2cErQv3VGCCTlSY5PUX/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-07-19T02:16:02.936Z",
    modifiedAt: "2026-07-19T02:16:22.114Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "7월 19일 처리 로그로 7월 18일 대상 신규 11건, AX_세션백업_2026-07-18 하위폴더 10개와 _세션요약.md, 생성 파일 13건 cp를 기록했고 zip·분할·base64·세션백업 Docs 미사용을 명시",
  },
  {
    title: "2026-07-09 / AX_2026-07-09",
    url: "https://docs.google.com/document/d/1V_6mlbOv86EcwDxXxonLoGUSKlZ8Amms6TjiUi71IKo/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-08T23:14:57.028Z",
    modifiedAt: "2026-07-08T23:14:58.482Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 9일 AX 전환 현황판 자동 갱신본으로 최신 AI 활용 상세와 비용/API 상태를 보존",
  },
  {
    title: "2026-07-09 / AX_대시보드분석_2026-07-09.md",
    url: "https://drive.google.com/file/d/1J0m4syDqIt9H5pHEcNXqj-UcrmrKykSZ/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-07-08T22:14:30.519Z",
    modifiedAt: "2026-07-08T22:14:30.519Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 9일 대시보드 분석 Markdown으로 Drive 저장소 63개, 김재우 47개, 이형배 16개 상태를 재점검",
  },
  {
    title: "2026-07-09 / AX_세션처리로그_2026-07-09.md",
    url: "https://drive.google.com/file/d/1QNSP1v_pCKPnywd6A2i1zuQaQgPuIVPd/view?usp=drivesdk",
    mimeType: "text/markdown",
    createdAt: "2026-07-08T22:10:46.837Z",
    modifiedAt: "2026-07-08T22:10:46.837Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "7월 9일 세션 처리 로그로 신규 19건, 7월 8일 세션백업 폴더, 216개 원본 파일 업로드 방식을 추적",
  },
  {
    title: "2026-07-07 / AX_2026-07-07",
    url: "https://docs.google.com/document/d/1GWIwf7rijE_PQE6sfsCIJaGUegXvGQZPkgwvvNMRk1c/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-06T23:13:15.759Z",
    modifiedAt: "2026-07-06T23:13:17.139Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 7일 AX 전환 현황판 자동 갱신본으로 최신 Drive 백업·대시보드 상태를 보존",
  },
  {
    title: "2026-07-07 / AX_대시보드분석_2026-07-07",
    url: "https://docs.google.com/document/d/1nDC2E57EjmneQre-TeyHiTMEaUpIXW4c43Hb57YE4UE/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-06T22:20:29.056Z",
    modifiedAt: "2026-07-06T22:20:30.135Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 7일 대시보드 분석본으로 AI 활용 상세와 Drive 산출물 상태를 재점검한 결과",
  },
  {
    title: "2026-07-07 / AX_세션처리로그_2026-07-07.md",
    url: "https://drive.google.com/file/d/1MnGp95jx2lxpvzy8nBzxc57JDDMp0EGU/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-07-06T22:17:26.832Z",
    modifiedAt: "2026-07-06T22:17:26.832Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "7월 7일 세션 처리 로그로 신규 AX Docs와 세션백업 폴더 생성 회차를 추적",
  },
  {
    title: "2026-07-06 / AX_2026-07-06",
    url: "https://docs.google.com/document/d/1Vq9XzZjR3HRZUJX6sEG7_gWUEELMy1KPyHUNQs4Er9E/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-05T23:14:55.624Z",
    modifiedAt: "2026-07-05T23:14:57.875Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 6일 AX 전환 현황판 자동 갱신본",
  },
  {
    title: "2026-07-06 / AX_대시보드분석_2026-07-06.md",
    url: "https://drive.google.com/file/d/1pOQpJrY2xAbqlkwavCbyB8LqGZwkei17/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-07-05T22:48:41.969Z",
    modifiedAt: "2026-07-05T22:48:41.969Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 6일 대시보드 분석 Markdown 산출물",
  },
  {
    title: "2026-07-06 / AX_세션처리로그_2026-07-06.md",
    url: "https://drive.google.com/file/d/1L5BCcsm5w39lwNYtbEHo1zwTQfgiZ97U/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-07-05T22:35:49.617Z",
    modifiedAt: "2026-07-05T22:35:49.617Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "7월 6일 세션 처리 로그로 7월 5일 백업 회차와 처리 상태를 보존",
  },
  {
    title: "2026-07-05 / AX_2026-07-05",
    url: "https://docs.google.com/document/d/1AUNbuipx7VGnUSOSGMRiNVC0APZN41JGNOuIXbzcBzE/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-04T23:12:51.953Z",
    modifiedAt: "2026-07-04T23:12:53.183Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 5일 AX 전환 현황판 자동 갱신본",
  },
  {
    title: "2026-07-05 / AX_대시보드분석_2026-07-05",
    url: "https://docs.google.com/document/d/1mScpfkq85jmLEVJ2WKG8kzMruLjZaShDW6pInjjehr0/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-04T22:16:36.423Z",
    modifiedAt: "2026-07-04T22:16:37.593Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 5일 대시보드 분석본으로 AI 활용 상세와 AX 운영 상태를 보존",
  },
  {
    title: "2026-07-05 / AX_세션처리로그_2026-07-05.md",
    url: "https://drive.google.com/file/d/1jwVSLFPk1SLrhD_F2DlTwJxYGKFny7dG/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-07-04T22:13:32.334Z",
    modifiedAt: "2026-07-04T22:13:32.334Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "7월 5일 세션 처리 로그로 7월 4일 백업 회차와 처리 상태를 보존",
  },
  {
    title: "2026-07-02 / AX_2026-07-02",
    url: "https://docs.google.com/document/d/1NUBldQfEPWN5fCa0gQMGOpxg1CkCH_urvynQ7CEZQUg/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-01T23:14:30.345Z",
    modifiedAt: "2026-07-01T23:14:31.952Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 2일 AX 전환 현황판 자동 갱신본으로 API 정상화, 예측 하향, Drive 산출물 45개 상태를 보존",
  },
  {
    title: "2026-07-02 / AX_대시보드분석_2026-07-02",
    url: "https://docs.google.com/document/d/1zSnHBjZf9jvXx6Q2yoWV309zqG34mNkMdvA0vtTtEYA/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-01T22:25:09.655Z",
    modifiedAt: "2026-07-01T22:25:11.113Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 2일 대시보드 분석본으로 AI 활용 상세와 5탭 수집 결과를 재점검한 산출물",
  },
  {
    title: "2026-07-02 / AX_세션처리로그_2026-07-02.md",
    url: "https://drive.google.com/file/d/1gEPd3vPpeOO6pKUx26gquHPm16Ycu1TX/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-07-01T22:21:53.743Z",
    modifiedAt: "2026-07-01T22:21:53.743Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "7월 2일 세션 처리 로그로 신규 AX Docs와 split zip 생성 회차를 추적",
  },
  {
    title: "2026-07-01 / AX_2026-07-01",
    url: "https://docs.google.com/document/d/1SCkIcFo2WxQT3TXTBE8bnpcjTuJCDV57NCRuTPjkBeA/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-30T23:16:36.080Z",
    modifiedAt: "2026-06-30T23:16:37.463Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 1일 AX 전환 현황판 자동 갱신본으로 최신 AX 운영 지표와 산출물 저장 상태를 보존",
  },
  {
    title: "2026-07-01 / AX_대시보드분석_2026-07-01",
    url: "https://docs.google.com/document/d/1io949UXIA8ccLVgEFqyzRTU9LkqskrKkeGFBRf6wR9E/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-30T22:52:21.772Z",
    modifiedAt: "2026-06-30T22:52:22.930Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "7월 1일 대시보드 분석본으로 AI 활용 상세와 API 사용 흐름을 재점검한 결과",
  },
  {
    title: "2026-07-01 / AX_세션처리로그_2026-07-01.md",
    url: "https://drive.google.com/file/d/193E0uU5YdOuWNdpMKmMHm4gIgssXdjvg/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-06-30T22:47:34.264Z",
    modifiedAt: "2026-06-30T22:47:34.264Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "7월 1일 세션 처리 로그로 신규 AX Docs와 split zip 생성 회차를 추적",
  },
  {
    title: "2026-06-30 / AX_2026-06-30",
    url: "https://docs.google.com/document/d/1EyakMFegAZcEddkJ-Hj5VQHhNrDBil1ns1nFE5SWXkA/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-29T23:15:24.759Z",
    modifiedAt: "2026-06-29T23:15:26.342Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "6월 30일 AX 전환 현황판 자동 갱신본",
  },
  {
    title: "2026-06-30 / AX_대시보드분석_2026-06-30.md",
    url: "https://drive.google.com/file/d/1vrZbrMDfqZyVv0UI-4iP437M66DfCyUh/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-06-29T22:54:35.476Z",
    modifiedAt: "2026-06-29T22:54:35.476Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "6월 30일 대시보드 분석 Markdown 산출물",
  },
  {
    title: "2026-06-30 / AX_세션처리로그_2026-06-30.md",
    url: "https://drive.google.com/file/d/1bJsEWeazDimd_rimUh8kZz7U9C6ngiEA/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-06-29T22:44:28.280Z",
    modifiedAt: "2026-06-29T22:44:28.280Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "6월 30일 세션 처리 로그로 전일 백업 생성과 처리 상태를 보존",
  },
  {
    title: "2026-06-29 / AX_2026-06-29",
    url: "https://docs.google.com/document/d/1GzLQGGUCmGAZA2pYrmJe5JzT42WoxWbjWe6HgWePAc0/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-28T23:13:26.858Z",
    modifiedAt: "2026-06-28T23:13:28.156Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "6월 29일 AX 전환 현황판 자동 갱신본으로 AX Level 3.8, 활용 기록 224건, 산출형 91건, API 비용 $68.3을 요약",
  },
  {
    title: "2026-06-29 / AX_대시보드분석_2026-06-29",
    url: "https://docs.google.com/document/d/1k8FhoDFNljhiWJQ7v9vMdUQCgKXx7sb8Bv7zkxsohl0/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-28T23:30:56.645Z",
    modifiedAt: "2026-06-28T23:30:57.725Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "6월 29일 대시보드 분석본으로 5탭 직접 추출 결과와 API탭 08:05 갱신 상태를 보존",
  },
  {
    title: "2026-06-29 / AX_세션처리로그_2026-06-29.md",
    url: "https://drive.google.com/file/d/1-YSnBhmgXTK8PYb6lffp0eVvm8KXV62P/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-06-28T23:27:20.015Z",
    modifiedAt: "2026-06-28T23:27:20.015Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "2026-06-29 실행 로그로 6/28 주간 세션 백업과 처리 상태를 보존",
  },
  {
    title: "2026-06-27 / AX_2026-06-27",
    url: "https://docs.google.com/document/d/1XaGU9mmfumFjduGDFTgR3W5TK-P1pgh4IpN7sbBK5w4/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-26T23:26:54.161Z",
    modifiedAt: "2026-06-26T23:26:55.583Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "6월 27일 AX 전환 현황판 자동 갱신본으로 AX Level 3.8, 활용 기록 224건, 산출형 91건, Claude Team 276,191줄을 요약",
  },
  {
    title: "2026-06-27 / AX_대시보드분석_2026-06-27",
    url: "https://docs.google.com/document/d/14sBr6V413XgE4-VLSTxWKAacIzrsSJFB0HITMDJ8Ui8/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-26T23:16:29.445Z",
    modifiedAt: "2026-06-26T23:16:30.617Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "6월 27일 대시보드 5탭 분석본으로 활용성, AI 활용 상세, 결재, 예측, API 사용 탭을 누락 없이 재수집",
  },
  {
    title: "2026-06-27 / AX_세션처리로그_2026-06-27.md",
    url: "https://drive.google.com/file/d/1kPBPCgQ05ML-sYRZ5mi05VxTpdZqI1xj/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-06-26T23:12:37.697Z",
    modifiedAt: "2026-06-26T23:12:37.697Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "2026-06-27 실행에서 신규 세션 25건을 처리했고 실행 중 partial 세션 2건은 다음 회차 재처리 대상으로 남김",
  },
  {
    title: "2026-06-26 / AX_2026-06-26",
    url: "https://docs.google.com/document/d/1Fy7LlpxRKPuM9Rimtj7vl6eQytj5XIEULlOBaU_BfJo/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-25T23:13:35.503Z",
    modifiedAt: "2026-06-25T23:13:36.907Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "6월 26일 AX 전환 현황판 자동 갱신본으로 API 토큰 17.8M, 비용 $77.4, Drive 저장 산출물 35개와 zip 내부 26개를 요약",
  },
  {
    title: "2026-06-26 / AX_대시보드분석_2026-06-26",
    url: "https://docs.google.com/document/d/1G1N8wG_YYtlM68aeUfIqpS03IqHxiCmz2usf2bvsebA/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-25T22:12:31.525Z",
    modifiedAt: "2026-06-25T22:12:33.056Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "6월 26일 대시보드 5탭 분석본으로 활용성, AI 활용 상세, 결재, 예측, API 사용 탭을 다시 정리",
  },
  {
    title: "2026-06-26 / AX_대시보드분석_2026-06-26_탭2-5상세",
    url: "https://docs.google.com/document/d/1P9famjMt3gLrXk5QbCS06j9gpAtlM1KJOR_tv_HoFiA/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-25T22:14:01.350Z",
    modifiedAt: "2026-06-25T22:14:02.490Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "AI 활용 상세·결재·월별/예측·API 사용 탭의 세부 수치를 별도 보존한 분석 문서",
  },
  {
    title: "2026-06-26 / AX_세션처리로그_2026-06-26.md",
    url: "https://drive.google.com/file/d/1ydkaABmcraAFaic7kSJodkz7AWw3U5Pa/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-06-25T22:44:47.536Z",
    modifiedAt: "2026-06-25T22:44:47.536Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "2026-06-25 대상 신규 세션 26건과 백업 실행 세션 1건을 중복 재처리하지 않도록 누적 처리 ID로 보존",
  },
  {
    title: "2026-06-25 / AX_2026-06-25",
    url: "https://docs.google.com/document/d/109IEO8m0JsZSyk5bhw1wU490PhqHeUULyVoi6Yp-GCo/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-24T23:15:31.511Z",
    modifiedAt: "2026-06-24T23:15:33.210Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "전사 AX 전환 현황판을 6월 25일 기준으로 자동 갱신하고 API 런레이트 가속, Claude Team 사용량, AX 챔피언 후보를 정리",
  },
  {
    title: "2026-06-25 / AX_대시보드분석_2026-06-25",
    url: "https://docs.google.com/document/d/1OfifPlcsnCbSoZrtu7C2FtKZHKUqGPK9QHqqws6vpE4/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-24T23:08:49.794Z",
    modifiedAt: "2026-06-24T23:08:51.289Z",
    kind: "프롬프트+응답",
    useCase: "AX 운영·KPI",
    usageSignal: "AI 비용 대시보드 5개 탭을 6월 25일 기준으로 분석해 AX 수준 3.6/5, 208건 활용기록, 84건 산출형 사용, API 비용 증가를 요약",
  },
  {
    title: "2026-06-25 / AX_세션처리로그_2026-06-25.md",
    url: "https://drive.google.com/file/d/1k0sxM0kVeajAKrwcQyCtXMN-5NE9l5Ji/view?usp=drivesdk",
    mimeType: "text/plain",
    createdAt: "2026-06-24T23:04:25.578Z",
    modifiedAt: "2026-06-24T23:04:25.578Z",
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "2026-06-24 세션 11건과 백업 실행 세션 1건을 중복 재처리하지 않도록 누적 처리 ID를 보존",
  },
  {
    title: "2026-06-23_세션모음.zip / claude-session-to-notion_SKILL.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "문서 산출물",
    useCase: "업무보고·지식관리",
    usageSignal: "zip 내부에서 확인된 세션별 Drive 저장 자동화 지시서",
  },
  {
    title: "2026-06-23_세션모음.zip / AxKPI_f2b7538e978c/프롬프트.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "프롬프트",
    useCase: "AX 운영·KPI",
    usageSignal: "전사 AI 사용 현황 대시보드 값을 Notion AX 현황판에 반영하는 자동 작업 요청",
  },
  {
    title: "2026-06-23_세션모음.zip / AxKPI_f2b7538e978c/응답.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "응답",
    useCase: "AX 운영·KPI",
    usageSignal: "API 토큰·비용·구독 총액 변동과 Notion 갱신 결과가 기록됨",
  },
  {
    title: "2026-06-23_세션모음.zip / AxKPI_f2b7538e978c/ax-kpi-daily-update_SKILL.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "문서 산출물",
    useCase: "AX 운영·KPI",
    usageSignal: "AX 전환 현황판 자동 갱신 절차와 수동 보호 영역이 정의됨",
  },
  {
    title: "2026-06-23_세션모음.zip / NaverAInews_74e90e57f6b9/프롬프트.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "프롬프트",
    useCase: "산업·AI 트렌드",
    usageSignal: "최신 네이버 AI 뉴스 크롤링 및 엑셀 생성 요청",
  },
  {
    title: "2026-06-23_세션모음.zip / NaverAInews_74e90e57f6b9/응답.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "응답",
    useCase: "산업·AI 트렌드",
    usageSignal: "네이버 AI 뉴스 17건 수집, 중복 제거, 엑셀 생성 결과가 기록됨",
  },
  {
    title: "2026-06-23_세션모음.zip / NaverAInews_74e90e57f6b9/naver_ai_news.xlsx",
    url: jaewooZipFolderUrl,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "데이터 파일",
    useCase: "산업·AI 트렌드",
    usageSignal: "뉴스 17건 엑셀 산출물이나 zip CRC 경고가 있어 본문 재검증 필요",
  },
  {
    title: "2026-06-23_세션모음.zip / Iris_689c22221d6c/프롬프트.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "프롬프트",
    useCase: "IRIS·공고 데이터",
    usageSignal: "IRIS R&D 공고 크롤링, AI·산업안전·마감임박 분류 엑셀 생성 요청",
  },
  {
    title: "2026-06-23_세션모음.zip / Iris_689c22221d6c/응답.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "응답",
    useCase: "IRIS·공고 데이터",
    usageSignal: "최근 7일 기준 45건, AI 3건, 산업안전 2건, 마감임박 28건 요약",
  },
  {
    title: "2026-06-23_세션모음.zip / Iris_689c22221d6c/IRIS_R_and_D_20260623.xlsx",
    url: jaewooZipFolderUrl,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "데이터 파일",
    useCase: "IRIS·공고 데이터",
    usageSignal: "7시트 IRIS 공고 엑셀 산출물이나 zip CRC 경고가 있어 본문 재검증 필요",
  },
  {
    title: "2026-06-23_세션모음.zip / Iris_689c22221d6c/iris_SKILL.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "문서 산출물",
    useCase: "IRIS·공고 데이터",
    usageSignal: "IRIS 연구과제 공고 크롤러 실행 지시서",
  },
  {
    title: "2026-06-23_세션모음.zip / ClaudeSessionToNotion_ed9281e57303/프롬프트.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "프롬프트",
    useCase: "업무보고·지식관리",
    usageSignal: "세션 저장 위치를 김재우 폴더로 바꾸고 프롬프트·응답·생성파일 분리 저장하도록 지시",
  },
  {
    title: "2026-06-23_세션모음.zip / ClaudeSessionToNotion_ed9281e57303/응답.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "응답",
    useCase: "업무보고·지식관리",
    usageSignal: "6/21·6/22 세션 17개 백필, 텍스트 산출물 2개, IRIS 엑셀 업로드 결과가 기록됨",
  },
  {
    title: "2026-06-23_세션모음.zip / Aitrendv1_1b13bc120fa0/프롬프트.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "프롬프트",
    useCase: "산업·AI 트렌드",
    usageSignal: "최신 AI 기술 동향과 산업안전 적용 인사이트 리포트 작성 요청",
  },
  {
    title: "2026-06-23_세션모음.zip / Aitrendv1_1b13bc120fa0/응답.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "응답",
    useCase: "산업·AI 트렌드",
    usageSignal: "에이전틱·멀티모달·피지컬 AI 등 2026 AI 트렌드와 산업안전 적용 로드맵 요약",
  },
  {
    title: "2026-06-23_세션모음.zip / Aitrendv1_1b13bc120fa0/aitrendv1_SKILL.md",
    url: jaewooZipFolderUrl,
    mimeType: "text/markdown",
    createdAt: "2026-06-23T08:12:00.000Z",
    modifiedAt: jaewooZipModifiedAt,
    kind: "문서 산출물",
    useCase: "산업·AI 트렌드",
    usageSignal: "AI 기술 트렌드 분석 및 산업안전 적용 인사이트 도출 지시서",
  },
];

const hyungbaeDateFolderUrl = "https://drive.google.com/drive/folders/1n87stddMKhfup7y7eV5gh0pqjeIZMMQ3?usp=sharing";
const hyungbaeDocsCreatedAt = "2026-07-08T18:08:49.521Z";
const hyungbaeDocsModifiedAt = "2026-07-08T18:17:08.270Z";
const hyungbaeRepositoryModifiedAt = "2026-07-22T10:35:13.333Z";

function hyungbaeDoc(
  title: string,
  documentId: string,
  useCase: string,
  usageSignal: string,
): DriveArtifact {
  return {
    title,
    url: `https://docs.google.com/document/d/${documentId}/edit?usp=drivesdk`,
    mimeType: "application/vnd.google-apps.document",
    createdAt: hyungbaeDocsCreatedAt,
    modifiedAt: hyungbaeDocsModifiedAt,
    kind: "프롬프트+응답",
    useCase,
    usageSignal,
  };
}

const hyungbaeArtifacts: DriveArtifact[] = [
  {
    title: "2026-07-22 / 건설현장 점검사진 분석",
    url: "https://docs.google.com/document/d/1DyuMTi74Vdx0fIyXQP_X9h4SBElj2xaoEUUE8a4a-1c/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-22T10:35:11.236Z",
    modifiedAt: "2026-07-22T10:35:13.333Z",
    kind: "프롬프트+응답",
    useCase: "현장 안전관리 자료",
    usageSignal:
      "7월 22일 README 기준 건설현장 점검사진 15매 판독 결과로 직접·추론 위험요인, 사고유형, 산안법·안전보건규칙 조항, 안전대책을 분석완료 XLSX로 정리. 대화기록 3건은 업로드됐지만 사진·법령 PDF·원본/최종 XLSX는 base64 한도로 미업로드",
  },
  {
    title: "2026-07-22 / Main Agent",
    url: "https://docs.google.com/document/d/1XXUkWXYdR2q81-3a8m6w07tc-Q8Sk6ZZkiK50OyAOso/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-22T10:34:48.535Z",
    modifiedAt: "2026-07-22T10:34:50.968Z",
    kind: "프롬프트+응답",
    useCase: "현장 안전관리 자료",
    usageSignal:
      "7월 22일 README 기준 RiskZero 안전보건 자동 브리핑과 HD현대 울산조선소 곤돌라 협착 사망사고 분석 산출물. 텍스트 브리핑 6건과 대화기록 1건은 업로드됐고 CSI XLSX·7/21 데일리브리핑 DOCX는 바이너리 업로드 한도로 미업로드",
  },
  {
    title: "2026-07-20 / 건설현장 점검사진 분석",
    url: "https://docs.google.com/document/d/1BNX4RymtA959bEndrn6c6ZAtmYYN-qJcrgl1Ul8vUv4/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-20T10:34:16.749Z",
    modifiedAt: "2026-07-20T10:34:19.985Z",
    kind: "프롬프트+응답",
    useCase: "현장 안전관리 자료",
    usageSignal:
      "7월 20일 README 기준 현장 점검사진 4매와 법령 PDF를 바탕으로 유해위험요인·사고유형·법규·안전대책을 엑셀에 정리. 대화기록 4건은 업로드 완료됐으나 사진·PDF·원본/최종 XLSX는 base64 전송 제약으로 미업로드",
  },
  {
    title: "2026-07-20 / Main Agent",
    url: "https://docs.google.com/document/d/14k26S_lcfp-MBT3NIhPf6eTuPhsggRNo8Yj3JtzlYTA/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-20T10:33:56.105Z",
    modifiedAt: "2026-07-20T10:33:58.950Z",
    kind: "프롬프트+응답",
    useCase: "현장 안전관리 자료",
    usageSignal:
      "7월 20일 README 기준 안전보건 자동 브리핑 저장소에 6/24~7/20 안전동향 브리핑 6건과 현대중공업 울산조선소 곤돌라 끼임 사망사고·CSI 재분류 대화기록 2건을 보존. CSI XLSX 업로드본은 원본과 크기 불일치로 손상 가능성 표시",
  },
  {
    title: "2026-07-19 / 건설현장 점검사진 분석",
    url: "https://docs.google.com/document/d/164-bl3uA6MApOKRwa42AJxa9sgDTQsFymdYJzPgljgg/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-19T15:19:37.025Z",
    modifiedAt: "2026-07-19T15:19:39.703Z",
    kind: "데이터 파일",
    useCase: "현장 안전관리 자료",
    usageSignal: "7월 19일 README 기준 건설현장 점검사진 4장, 법령 PDF 5개, 분석 템플릿 1개를 입력으로 유해·위험요인, 법규 조항, 안전대책, 사고유형을 매칭. 템플릿 XLSX와 분석완료 텍스트본은 업로드됐고 대용량 사진·PDF 원본과 527KB 분석완료 XLSX 원본은 로컬 보관 제약으로 미업로드",
  },
  {
    title: "2026-07-19 / Main Agent",
    url: "https://docs.google.com/document/d/19CMuF2pjs367eGdF2TD6vSOuKKov_4yi8k-SLrckqCc/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-07-19T15:18:58.400Z",
    modifiedAt: "2026-07-19T15:19:01.379Z",
    kind: "데이터 파일",
    useCase: "현장 안전관리 자료",
    usageSignal: "7월 19일 README 기준 RiskZero 안전보건 자동 브리핑·분류 산출물 저장소. CSI 건설사고 분류기준 XLSX 1건과 안전보건 브리핑·보고 텍스트 5건 등 생성결과물 6개를 보존하고 원본 바이너리 업로드 검증을 완료",
  },
  hyungbaeDoc(
    "2026-07-09 / Collect data from all station resource pages (b6a9200d)",
    "1-Frt93JA9sUen1iqXqqOgalAKbbeCZA-EmwnT-RLIXM",
    "자료실·현장 데이터 수집",
    "GH Biz&고양 23개 현장 자료실을 점검하고 양주은남 현장 파일 3건을 확보한 세션",
  ),
  hyungbaeDoc(
    "2026-07-09 / Document TBM safety management system (0b3672ce)",
    "1saOnhSLWbUDgo8mWo2zr2gbkiGQYKR-ljQ5HsxQm0Z8",
    "현장 안전관리 자료",
    "4개 활성 현장의 TBM 263건과 첨부 메타데이터 823건을 정리하고 자동 다운로드 제한을 기록",
  ),
  hyungbaeDoc(
    "2026-07-09 / Document safety management system pages (c921fcc7)",
    "1RyhrqAs7UVASGtnvHWOT5NzzYF4Z6Hw3lTMbcmBlpR4",
    "현장 안전관리 자료",
    "노사협의체 자료 23개 현장 점검, 6개 현장 18개 회의 기록과 첨부 파일 수집 결과",
  ),
  hyungbaeDoc(
    "2026-07-09 / Collect ergonomic hazard assessment data (6e85c136)",
    "1w_Xqe5WsDgzOFZ8ct5bX3-eqVrW5x92ipEzHyIgVmZA",
    "현장 안전관리 자료",
    "근골격계 유해요인조사 23개 현장 점검, 용인 2공구 조사 2건과 PDF 3건 수집",
  ),
  hyungbaeDoc(
    "2026-07-09 / Collect safety management plan data (7a5e7017)",
    "1nFQFGeijR-AG3rwRR871xGgXQUDNWSBzWdSe9NhVk-Y",
    "안전관리 계획·비용",
    "부서별 안전보건관리계획 23개 현장을 확인했으나 수집 가능한 기록이 없음을 검증",
  ),
  hyungbaeDoc(
    "2026-07-09 / Collect safety management cost data (6348cd75)",
    "1hx5aVqPkRb5xJ2Azr654C9rQLD84_jA6lvD1LuVN9zc",
    "안전관리 계획·비용",
    "산안법 안전관리비 계획 탭에서 약 1.9조원 대상액과 약 520억원 계상액, 첨부 21건을 정리",
  ),
  hyungbaeDoc("2026-07-09 / V2 safety management cost branch (f959b650)", "1lUDqmPLiL7_VBu6UJuq52YD3ZGltpKQJeQfgf1y8SmI", "안전관리 계획·비용", "안전관리비 수집 세션의 보완본으로 대상 현장 조회와 다운로드 준비 흐름을 보존"),
  hyungbaeDoc("2026-07-09 / V2 safety management pages branch (a99fe24b)", "1BFZnRadl99TWIyTZaog_6RVjRr6zgZt9-UV9h5fIE5k", "현장 안전관리 자료", "안전관리 시스템 페이지 문서화 세션의 보완본으로 현장별 페이지 탐색을 보존"),
  hyungbaeDoc("2026-07-09 / Document safety equipment distribution across sites (718b84a0)", "16wFlODWLuaYQ9D1eDiQW3JBW2OnhZgLO5uoimhZnnpk", "현장 안전관리 자료", "현장별 안전장비 배치·배포 현황을 문서화한 세션"),
  hyungbaeDoc("2026-07-09 / Collect safety facility data across sites (59f4398d)", "1G1ItY93MXVOea4mjbrzawY1apwxT4MNPLaJ4Q3BBIz8", "현장 안전관리 자료", "현장별 안전시설 데이터를 수집하고 비교하기 위한 세션"),
  hyungbaeDoc("2026-07-09 / Collect risk assessment data from all sites (2c77ed42)", "1TcKxzyCVgy1oVohq7L-CiICgqA7V9NOBO_FvfFe3TzQ", "현장 안전관리 자료", "전체 현장 위험성평가 자료를 수집·검증한 세션"),
  hyungbaeDoc("2026-07-09 / Collect disaster response manuals from all sites (4d18ed3c)", "1RznYIXrY27DnCkmmO13uyt6qi2NWUygYr9ozMKqPK9s", "현장 안전관리 자료", "전체 현장 재난대응 매뉴얼 자료 수집을 수행한 세션"),
  hyungbaeDoc("2026-07-09 / Document safety report system across sites (ab9618f4)", "1y9777n9KI5_BIhpUh9W8t3Hl5fPvJcFhDsLJGJsOBwM", "현장 안전관리 자료", "현장별 안전보고 체계와 보고 흐름을 문서화한 세션"),
  hyungbaeDoc("2026-07-09 / Collect safety management cost data (05ac25e6)", "1rIgXKq_nhwkSxXH1kC1thNTw8vh-6VKcLYII6TIgrKs", "안전관리 계획·비용", "임시소방시설비 또는 안전관리비 관련 수집 결과를 정리한 세션"),
  hyungbaeDoc("2026-07-09 / Collect safety management expense data (5915ecf8)", "1-PMmgG2jFwaBdwvCxxLi8bjGJ5sLoCKhtuOSXrESZUo", "안전관리 계획·비용", "안전관리비 집행·경비 자료 수집 결과를 정리한 세션"),
  hyungbaeDoc("2026-07-09 / Collect risk assessment data from all sites (bad3d43a)", "1alP8IlwWCEMZi61zKgfnmIww9CZGw44jlNRfxbxqJH0", "현장 안전관리 자료", "전체 현장 위험성평가 자료를 수집·검증한 별도 세션"),
];

function buildCountBreakdown(
  counts: Record<string, number>,
  total: number,
  colorMap: Record<string, string>,
): DriveArtifactBreakdown[] {
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      share: total ? Math.round((count / total) * 1000) / 10 : 0,
      color: colorMap[label] ?? "#5f6f8c",
    }))
    .sort((a, b) => b.count - a.count);
}

type DriveRepositorySpec = Omit<
  DriveArtifactRepository,
  "fileCount" | "promptCount" | "outputCount" | "documentCount" | "dataFileCount" | "typeBreakdown" | "useCaseBreakdown"
> & {
  promptArtifactTitles?: string[];
};

function buildRepository(spec: DriveRepositorySpec): DriveArtifactRepository {
  const { promptArtifactTitles = [], ...repositorySpec } = spec;
  const promptArtifactTitleSet = new Set(promptArtifactTitles);
  const artifacts = repositorySpec.artifacts.map((artifact) =>
    promptArtifactTitleSet.has(artifact.title)
      ? {
          ...artifact,
          kind: "프롬프트+응답" as DriveArtifactKind,
          usageSignal: `${artifact.usageSignal} · Google Docs 본문에 프롬프트와 응답 기록 포함`,
        }
      : artifact,
  );
  const fileCount = repositorySpec.inventory.fileCount;
  const promptCount = artifacts.filter((artifact) => artifact.kind === "프롬프트" || artifact.kind === "프롬프트+응답").length;
  const dataFileCount = repositorySpec.inventory.dataFileCount;
  const documentCount = repositorySpec.inventory.documentCount;
  const outputCount = artifacts.filter((artifact) => artifact.kind !== "프롬프트").length;

  return {
    ...repositorySpec,
    artifacts,
    fileCount,
    promptCount,
    outputCount,
    documentCount,
    dataFileCount,
    typeBreakdown: buildCountBreakdown(
      repositorySpec.inventory.typeCounts,
      fileCount,
      inventoryTypeColors,
    ),
    useCaseBreakdown: buildCountBreakdown(
      repositorySpec.inventory.useCaseCounts,
      fileCount,
      useCaseColors,
    ),
  };
}

const zipAnalysisPipeline: DriveZipAnalysisPipeline = {
  collectedAt: "2026-07-22 23:10 KST",
  mode: "Drive에는 zip 분할 원본만 보존하고, 대시보드 수집 시 로컬 임시 영역에서만 결합·해제·분석합니다.",
  cleanupPolicy: "결합 zip과 압축 해제 폴더는 분석 완료 후 삭제하며 Drive 원본 zip part 파일은 삭제하거나 변환하지 않습니다.",
  stages: [
    {
      label: "1. Drive 원본 조회",
      action: "대상 폴더에서 zip.partNN, zip.001, z01+zip 패턴을 그룹화",
      result: "연결된 Drive 목록에서 김재우 7/22 AX Docs·처리로그, 7/21 세션백업 폴더, 최신 split 원본인 7/5 4-part AX_2026-07-05_백업.zip을 확인. 이형배 폴더는 2026-07-22 날짜 폴더가 추가됐고 건설현장 점검사진 분석·Main Agent README 2건과 업로드 완료 텍스트/대화기록 파일을 확인. 이형배 루트 split zip은 없음",
    },
    {
      label: "2. 임시 결합",
      action: "part 번호 순서대로 /private/tmp 영역에서 단일 zip으로 결합",
      result: "connector raw byte handle로 7/5 part00~part03을 /private/tmp/drive-zip-20260722에 다운로드하고 23,988-byte zip으로 결합. 새 split part는 없었고 Drive 원본 part는 변경하지 않음",
    },
    {
      label: "3. 압축 해제 분석",
      action: "프롬프트·응답·SKILL·엑셀 산출물의 파일명, 크기, 본문 요약을 추출",
      result: "7/5 결합 zip은 이번 실행에서도 End-of-central-directory signature not found로 unzip 테스트와 zipinfo 목록 조회가 실패했고 zip -FF도 누락된 AX_2026-07-05_백업.z01 split을 요구. 마지막 성공 해제 상태는 6/29 zip 내부 6개 파일, 2개 작업 묶음, 프롬프트 2개와 응답 2개, Ops_dashboard_tab2_3h 프롬프트 CRC 경고 1건으로 유지",
    },
    {
      label: "4. 임시 파일 삭제",
      action: "분석 후 결합 zip과 해제 폴더를 제거하고 요약 결과만 대시보드 데이터로 유지",
      result: "이번 실행의 /private/tmp/drive-zip-20260722 결합 zip·part 파일·repair 출력은 검증 후 삭제했고 cleanup 확인은 TEMP_CLEAN. Drive 원본은 변경하지 않음",
    },
  ],
  totals: {
    splitParts: 64,
    archives: 14,
    extractedFiles: 6,
    taskGroups: 2,
    dataFiles: 0,
    crcWarnings: 1,
  },
  archives: [
    {
      owner: "김재우",
      archiveName: "AX_2026-07-05_백업.zip",
      folderUrl: jaewooZipFolderUrl,
      sourceParts: [
        "AX_2026-07-05_백업.zip.part00",
        "AX_2026-07-05_백업.zip.part01",
        "AX_2026-07-05_백업.zip.part02",
        "AX_2026-07-05_백업.zip.part03",
      ],
      combinedSizeBytes: 23988,
      extractedEntries: 0,
      extractedFiles: 0,
      extractedDirectories: 0,
      promptFiles: 0,
      responseFiles: 0,
      skillFiles: 0,
      dataFiles: 0,
      crcWarningFiles: [],
      cleanupStatus: "이번 실행에서 connector raw byte handle로 받은 4개 part를 /private/tmp/drive-zip-20260722 안에서만 결합·검증했고 cleanup 단계에서 삭제. Drive 원본 part는 변경하지 않음",
      verificationStatus: "Drive 목록에서 4개 part가 유지되고 connector raw byte handle로 part00~part03을 내려받아 23,988 bytes로 결합했지만 unzip -t와 unzip -Z가 End-of-central-directory signature not found로 실패. zip -FF는 누락된 AX_2026-07-05_백업.z01 split을 요구",
      taskGroups: [],
    },
    {
      owner: "김재우",
      archiveName: "AX_2026-06-29_백업.zip",
      folderUrl: jaewooZipFolderUrl,
      sourceParts: [
        "AX_2026-06-29_백업.zip.part00",
        "AX_2026-06-29_백업.zip.part01",
        "AX_2026-06-29_백업.zip.part02",
        "AX_2026-06-29_백업.zip.part03",
        "AX_2026-06-29_백업.zip.part04",
        "AX_2026-06-29_백업.zip.part05",
        "AX_2026-06-29_백업.zip.part06",
        "AX_2026-06-29_백업.zip.part07",
        "AX_2026-06-29_백업.zip.part08",
        "AX_2026-06-29_백업.zip.part09",
        "AX_2026-06-29_백업.zip.part10",
        "AX_2026-06-29_백업.zip.part11",
      ],
      combinedSizeBytes: 6986,
      extractedEntries: 6,
      extractedFiles: 6,
      extractedDirectories: 0,
      promptFiles: 2,
      responseFiles: 2,
      skillFiles: 0,
      dataFiles: 0,
      crcWarningFiles: ["Ops_dashboard_tab2_3h_6fb565c4b3a1/_프롬프트.md"],
      cleanupStatus: "결합 zip과 압축 해제 폴더는 /private/tmp/drive-zip-20260629.* 안에서 분석 후 삭제됨. Drive 원본 part는 변경하지 않음",
      verificationStatus: "zip 테스트와 압축 해제는 완료됐고 Ops_dashboard_tab2_3h_6fb565c4b3a1 프롬프트 1개에서 CRC 경고 1건이 발생",
      taskGroups: [
        {
          title: "세션 응답 — Claude session to notion (8adcfe9f6717) — 2026-06-28 백업 회차",
          folderName: "Claude_session_to_notion_8adcfe9f6717",
          useCase: "업무보고·지식관리",
          fileCount: 2,
          promptCount: 1,
          responseCount: 1,
          skillCount: 0,
          dataFiles: [],
          summary: "신규 세션 34건 처리(2026-06-27 주간 + 06-28). 영업/업무 대시보드 자동배포, IRIS 연구과제 요약, AI 트렌드, Genspark 크롤링, Hermes harness 최적화, AX KPI 5탭 수집을 포함",
          verification: "프롬프트 1개 · 응답 1개",
        },
        {
          title: "세션 응답 — Ops dashboard tab2 3h (6fb565c4b3a1)",
          folderName: "Ops_dashboard_tab2_3h_6fb565c4b3a1",
          useCase: "초안·문서화",
          fileCount: 2,
          promptCount: 1,
          responseCount: 1,
          skillCount: 0,
          dataFiles: [],
          summary: "Desktop Commander 연결과 .deploy 디렉터리 상태를 확인한 운영 대시보드 탭2 3시간 작업 로그. 프롬프트 파일은 CRC 경고가 있어 원문 재검증 필요",
          verification: "프롬프트 1개 · 응답 1개",
        },
      ],
    },
  ],
};

const repositories: DriveArtifactRepository[] = [
  buildRepository({
    owner: "김재우",
    folderName: "김재우",
    folderId: "1Q2OorOdMlPn8xRBzuHWyY5kqGHxRYpPZ",
    folderUrl: "https://drive.google.com/drive/folders/1Q2OorOdMlPn8xRBzuHWyY5kqGHxRYpPZ?usp=drive_link",
    role: "Claude 세션·AX 산출물 재귀 저장소",
    folderModifiedAt: "2026-07-22T23:13:55.718Z",
    utilizationScore: 88,
    utilizationLevel: "높음",
    inventory: {
      fileCount: 1004,
      directFileCount: 159,
      nestedFileCount: 845,
      folderCount: 253,
      maxDepth: 7,
      uniqueFileCount: 951,
      duplicateCopyCount: 53,
      metadataDateAnomalyCount: 85,
      documentCount: 76,
      dataFileCount: 39,
      typeCounts: {
        "세션 텍스트": 521,
        "이미지·미디어": 177,
        "코드·구성": 93,
        "Office·데이터": 78,
        "Google Docs": 76,
        "압축·분할 보관": 59,
      },
      useCaseCounts: {
        "AX 운영·KPI": 318,
        "산업·AI 트렌드": 275,
        "초안·문서화": 182,
        "업무보고·지식관리": 162,
        "IRIS·공고 데이터": 67,
      },
      dailyCounts: [
        { date: "2026-06-23", count: 4 },
        { date: "2026-06-24", count: 12 },
        { date: "2026-06-25", count: 7 },
        { date: "2026-06-26", count: 19 },
        { date: "2026-06-27", count: 6 },
        { date: "2026-06-28", count: 7 },
        { date: "2026-06-29", count: 15 },
        { date: "2026-06-30", count: 6 },
        { date: "2026-07-01", count: 8 },
        { date: "2026-07-02", count: 7 },
        { date: "2026-07-03", count: 10 },
        { date: "2026-07-04", count: 7 },
        { date: "2026-07-05", count: 4 },
        { date: "2026-07-06", count: 25 },
        { date: "2026-07-07", count: 63 },
        { date: "2026-07-08", count: 174 },
        { date: "2026-07-09", count: 58 },
        { date: "2026-07-10", count: 35 },
        { date: "2026-07-11", count: 45 },
        { date: "2026-07-12", count: 39 },
        { date: "2026-07-13", count: 32 },
        { date: "2026-07-14", count: 41 },
        { date: "2026-07-15", count: 50 },
        { date: "2026-07-16", count: 29 },
        { date: "2026-07-17", count: 34 },
        { date: "2026-07-18", count: 31 },
        { date: "2026-07-19", count: 24 },
        { date: "2026-07-20", count: 30 },
        { date: "2026-07-21", count: 65 },
        { date: "2026-07-22", count: 31 },
        { date: "2026-07-23", count: 1 },
      ],
    },
    artifacts: jaewooZipArtifacts,
    insights: [
      "루트 파일 159개와 모든 하위 폴더의 파일 845개를 합쳐 1,004개를 확인했습니다. 253개 폴더를 최대 7단계까지 재귀 탐색했고 조회 오류는 없었습니다.",
      "파일명·크기·MIME 조합 기준 중복 추정 사본 53개를 분리하면 고유 파일 신호는 951개입니다.",
      "전체 경로 분류에서 AX 운영·KPI 318개, 산업·AI 트렌드 275개, 초안·문서화 182개 순으로 나타났습니다.",
      "1980년 생성시각으로 보존된 85개 파일은 실제 업무 생성일로 해석하지 않고 날짜 추이의 시작 잔액으로 분리했습니다.",
    ],
  }),
  buildRepository({
    owner: "이형배",
    folderName: "이형배",
    folderId: "1OFfN4APAViKNtgURnmn9W51jSvcxy6fg",
    folderUrl: "https://drive.google.com/drive/folders/1OFfN4APAViKNtgURnmn9W51jSvcxy6fg?usp=sharing",
    role: "Claude 날짜별 백업·현장 산출물 재귀 저장소",
    folderModifiedAt: hyungbaeRepositoryModifiedAt,
    utilizationScore: 86,
    utilizationLevel: "높음",
    inventory: {
      fileCount: 690,
      directFileCount: 1,
      nestedFileCount: 689,
      folderCount: 91,
      maxDepth: 5,
      uniqueFileCount: 520,
      duplicateCopyCount: 170,
      metadataDateAnomalyCount: 0,
      documentCount: 576,
      dataFileCount: 8,
      typeCounts: {
        "Google Docs": 576,
        "세션 텍스트": 87,
        "Office·데이터": 18,
        "이미지·미디어": 8,
        "코드·구성": 1,
      },
      useCaseCounts: {
        "V1 초안 정리": 409,
        "현장 안전관리 자료": 217,
        "안전관리 계획·비용": 49,
        "자료실·현장 데이터 수집": 15,
      },
      dailyCounts: [
        { date: "2026-06-25", count: 29 },
        { date: "2026-06-26", count: 28 },
        { date: "2026-06-27", count: 27 },
        { date: "2026-06-28", count: 32 },
        { date: "2026-06-29", count: 33 },
        { date: "2026-06-30", count: 35 },
        { date: "2026-07-01", count: 38 },
        { date: "2026-07-02", count: 40 },
        { date: "2026-07-03", count: 42 },
        { date: "2026-07-04", count: 43 },
        { date: "2026-07-05", count: 44 },
        { date: "2026-07-06", count: 45 },
        { date: "2026-07-07", count: 47 },
        { date: "2026-07-08", count: 50 },
        { date: "2026-07-09", count: 51 },
        { date: "2026-07-14", count: 12 },
        { date: "2026-07-15", count: 25 },
        { date: "2026-07-16", count: 13 },
        { date: "2026-07-17", count: 12 },
        { date: "2026-07-19", count: 9 },
        { date: "2026-07-20", count: 22 },
        { date: "2026-07-22", count: 13 },
      ],
    },
    artifacts: hyungbaeArtifacts,
    insights: [
      "루트 파일 1개와 모든 하위 폴더의 파일 689개를 합쳐 690개를 확인했습니다. 91개 폴더를 최대 5단계까지 재귀 탐색했고 조회 오류는 없었습니다.",
      "파일명·크기·MIME 조합 기준 중복 추정 사본 170개를 분리하면 고유 파일 신호는 520개입니다.",
      "Google Docs 576개가 날짜별 백업 폴더에 축적되어 있으며, 전체 경로 분류에서 현장 안전관리 217개와 안전관리 계획·비용 49개가 확인됩니다.",
      "날짜별 백업은 같은 자료가 여러 회차에 포함될 수 있으므로 전체 보관 파일 수와 중복 추정 제외 수를 함께 봐야 합니다.",
    ],
  }),
];

export const driveArtifactRepositoryData: DriveArtifactRepositoryData = {
  source: {
    name: "Google Drive Claude 산출물 저장소",
    collectedAt: "2026-07-23 11:18 KST",
    period: "2026-06-21 ~ 2026-07-23",
    note: "두 Drive 루트에서 폴더가 더 이상 발견되지 않을 때까지 재귀 조회했습니다. 김재우는 파일 1,004개·폴더 253개, 이형배는 파일 690개·폴더 91개이며 조회 오류는 0건입니다. 총 1,694개 중 루트 직접 파일은 160개, 하위 폴더 파일은 1,534개입니다. 중복 추정은 파일명·크기·MIME 조합 기준이며 콘텐츠 해시와 동일하지 않습니다. 업무 유형은 전체 파일 경로·파일명 기준으로 분류하고, 상세 의미는 기존 대표 검증 자료를 유지합니다.",
  },
  totals: {
    repositories: repositories.length,
    files: repositories.reduce((sum, repository) => sum + repository.fileCount, 0),
    prompts: repositories.reduce((sum, repository) => sum + repository.promptCount, 0),
    outputs: repositories.reduce((sum, repository) => sum + repository.outputCount, 0),
    documents: repositories.reduce((sum, repository) => sum + repository.documentCount, 0),
    dataFiles: repositories.reduce((sum, repository) => sum + repository.dataFileCount, 0),
    folders: repositories.reduce((sum, repository) => sum + repository.inventory.folderCount, 0),
    directFiles: repositories.reduce((sum, repository) => sum + repository.inventory.directFileCount, 0),
    nestedFiles: repositories.reduce((sum, repository) => sum + repository.inventory.nestedFileCount, 0),
    uniqueFiles: repositories.reduce((sum, repository) => sum + repository.inventory.uniqueFileCount, 0),
    duplicateCopies: repositories.reduce((sum, repository) => sum + repository.inventory.duplicateCopyCount, 0),
    metadataDateAnomalies: repositories.reduce(
      (sum, repository) => sum + repository.inventory.metadataDateAnomalyCount,
      0,
    ),
  },
  repositories,
  zipAnalysisPipeline,
  insights: [
    "기존 84개 직접·선별 집계에서 전체 하위 폴더 재귀 집계 1,694개로 범위를 교체했습니다.",
    "하위 폴더 파일이 전체의 90.6%이므로 루트 직접 목록만 조회하면 실제 저장 현황을 크게 누락합니다.",
    "반복 백업 사본을 생산성 산출물로 과대 해석하지 않도록 전체 1,694개와 중복 추정 제외 1,471개를 분리합니다.",
    `이형배 폴더는 ${hyungbaeDateFolderUrl} 하위 날짜별 프로젝트와 claude-backup 폴더를 모두 포함해 집계했습니다.`,
  ],
};
