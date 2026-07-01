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

const kindColors: Record<DriveArtifactKind, string> = {
  프롬프트: "#0f8b8d",
  "프롬프트+응답": "#0f8b8d",
  응답: "#2f8f46",
  업무보고: "#c58612",
  "데이터 파일": "#5f6f8c",
  "문서 산출물": "#e85d4f",
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
const jaewooZipModifiedAt = "2026-06-30T23:16:37.463Z";

const jaewooZipArtifacts: DriveArtifact[] = [
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

const hyungbaeDateFolderUrl = "https://drive.google.com/drive/folders/1TCi4WMw_rQez84eDvaNs0xKiz5BzAVoS?usp=sharing";
const hyungbaeDocsCreatedAt = "2026-06-30T18:08:53.135Z";
const hyungbaeDocsModifiedAt = "2026-06-30T18:14:33.649Z";

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
  hyungbaeDoc(
    "2026-07-01 / Collect data from all station resource pages (b6a9200d)",
    "1bG47xvMbUKmoQz7Cer3H1mYLQcTQhr17vitCjuC3Dkk",
    "자료실·현장 데이터 수집",
    "GH Biz&고양 23개 현장 자료실을 점검하고 양주은남 현장 파일 3건을 확보한 세션",
  ),
  hyungbaeDoc(
    "2026-07-01 / Document TBM safety management system (0b3672ce)",
    "1zuKoiR97ko8OdpbSrfbnv1rqW3-chBScwnF5Lm-u5yc",
    "현장 안전관리 자료",
    "4개 활성 현장의 TBM 263건과 첨부 메타데이터 823건을 정리하고 자동 다운로드 제한을 기록",
  ),
  hyungbaeDoc(
    "2026-07-01 / Document safety management system pages (c921fcc7)",
    "1U-gyF27ArhUY2APANVJeuhDKGcL5wYXPobXzgo1bvuQ",
    "현장 안전관리 자료",
    "노사협의체 자료 23개 현장 점검, 6개 현장 18개 회의 기록과 첨부 파일 수집 결과",
  ),
  hyungbaeDoc(
    "2026-07-01 / Collect ergonomic hazard assessment data (6e85c136)",
    "1YoLgz99pslcIKoIlsAa7bj2lPHlEmHqYZlTvv0cQtB0",
    "현장 안전관리 자료",
    "근골격계 유해요인조사 23개 현장 점검, 용인 2공구 조사 2건과 PDF 3건 수집",
  ),
  hyungbaeDoc(
    "2026-07-01 / Collect safety management plan data (7a5e7017)",
    "1ur_4BjCY9-OcLfjcxk-X9cKY6hyovxX54QDGJuYMxak",
    "안전관리 계획·비용",
    "부서별 안전보건관리계획 23개 현장을 확인했으나 수집 가능한 기록이 없음을 검증",
  ),
  hyungbaeDoc(
    "2026-07-01 / Collect safety management cost data (6348cd75)",
    "1kpQJwY2QmBeOEbvmoGHHn-KeNjq01AIccsP5WQMztWI",
    "안전관리 계획·비용",
    "산안법 안전관리비 계획 탭에서 약 1.9조원 대상액과 약 520억원 계상액, 첨부 21건을 정리",
  ),
  hyungbaeDoc("2026-07-01 / V2 safety management cost branch (f959b650)", "1rWoj7Rys9rKkl1IqzCE8K6XFUmbrpThiUUeIWnSl42Q", "안전관리 계획·비용", "안전관리비 수집 세션의 보완본으로 대상 현장 조회와 다운로드 준비 흐름을 보존"),
  hyungbaeDoc("2026-07-01 / V2 safety management pages branch (a99fe24b)", "1OLEINcgbBW1Mkn_zXt3lnLZWydAyDi_8wCtY1g7_mQ8", "현장 안전관리 자료", "안전관리 시스템 페이지 문서화 세션의 보완본으로 현장별 페이지 탐색을 보존"),
  hyungbaeDoc("2026-07-01 / Document safety equipment distribution across sites (718b84a0)", "14QTQbJTAyuoSyi_wB1QlWABIt6Zg8eaeLRnP-T6cBvo", "현장 안전관리 자료", "현장별 안전장비 배치·배포 현황을 문서화한 세션"),
  hyungbaeDoc("2026-07-01 / Collect safety facility data across sites (59f4398d)", "17BvsImT-dIsQmg_m-tsI2WDqlElYz5Z14hFmZolS9Bo", "현장 안전관리 자료", "현장별 안전시설 데이터를 수집하고 비교하기 위한 세션"),
  hyungbaeDoc("2026-07-01 / Collect risk assessment data from all sites (2c77ed42)", "1pUNPTTFufOvk2gBoVBjsF16mFJRtue9A93FoppC0gC8", "현장 안전관리 자료", "전체 현장 위험성평가 자료를 수집·검증한 세션"),
  hyungbaeDoc("2026-07-01 / Collect disaster response manuals from all sites (4d18ed3c)", "1J-vU72KDP9TzjWRtCl6Ok0kDcr1je9fFN1s-ehrhKAA", "현장 안전관리 자료", "전체 현장 재난대응 매뉴얼 자료 수집을 수행한 세션"),
  hyungbaeDoc("2026-07-01 / Document safety report system across sites (ab9618f4)", "1WC9DYzfKJ99mP1DlaqhRuverza7CfMRFfsS3VL_prEo", "현장 안전관리 자료", "현장별 안전보고 체계와 보고 흐름을 문서화한 세션"),
  hyungbaeDoc("2026-07-01 / Collect safety management cost data (05ac25e6)", "1wrHJNKl7fr2hvK8U85tXo8hMi9O6ONpVdDd-vS-FALE", "안전관리 계획·비용", "임시소방시설비 또는 안전관리비 관련 수집 결과를 정리한 세션"),
  hyungbaeDoc("2026-07-01 / Collect safety management expense data (5915ecf8)", "1CljGA9fR6p6ZrVnIh6G6-mPDpvDk8IvdUk_FsNvpWKQ", "안전관리 계획·비용", "안전관리비 집행·경비 자료 수집 결과를 정리한 세션"),
  hyungbaeDoc("2026-07-01 / Collect risk assessment data from all sites (bad3d43a)", "11JWjzGkC_5WC40-kkaS8HmAnv4ZcYk21siXH-fPf3Z0", "현장 안전관리 자료", "전체 현장 위험성평가 자료를 수집·검증한 별도 세션"),
];

function buildBreakdown<T extends string>(
  values: T[],
  total: number,
  colorMap: Record<string, string>,
): DriveArtifactBreakdown[] {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

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
  const fileCount = artifacts.length;
  const promptCount = artifacts.filter((artifact) => artifact.kind === "프롬프트" || artifact.kind === "프롬프트+응답").length;
  const dataFileCount = artifacts.filter((artifact) => artifact.kind === "데이터 파일").length;
  const documentCount = artifacts.filter((artifact) => artifact.mimeType === "application/vnd.google-apps.document").length;
  const outputCount = artifacts.filter((artifact) => artifact.kind !== "프롬프트").length;

  return {
    ...repositorySpec,
    artifacts,
    fileCount,
    promptCount,
    outputCount,
    documentCount,
    dataFileCount,
    typeBreakdown: buildBreakdown(
      artifacts.map((artifact) => artifact.kind),
      fileCount,
      kindColors,
    ),
    useCaseBreakdown: buildBreakdown(
      artifacts.map((artifact) => artifact.useCase),
      fileCount,
      useCaseColors,
    ),
  };
}

const zipAnalysisPipeline: DriveZipAnalysisPipeline = {
  collectedAt: "2026-07-01 23:03 KST",
  mode: "Drive에는 zip 분할 원본만 보존하고, 대시보드 수집 시 로컬 임시 영역에서만 결합·해제·분석합니다.",
  cleanupPolicy: "결합 zip과 압축 해제 폴더는 분석 완료 후 삭제하며 Drive 원본 zip part 파일은 삭제하거나 변환하지 않습니다.",
  stages: [
    {
      label: "1. Drive 원본 조회",
      action: "대상 폴더에서 zip.partNN, zip.001, z01+zip 패턴을 그룹화",
      result: "김재우 폴더에서 최신 AX_2026-07-01_백업.zip.part00~part04 5개와 7/1 AX Docs·처리로그를 확인. 이형배 폴더는 claude-backup-2026-07-01 날짜별 Docs 폴더로 갱신",
    },
    {
      label: "2. 임시 결합",
      action: "part 번호 순서대로 /private/tmp 영역에서 단일 zip으로 결합",
      result: "7/1 raw 파일은 Drive connector에서 확인됐지만 shell의 sdmntprwestcentralus.oaiusercontent.com DNS 해석 실패와 서비스 계정 토큰 fetch failed로 로컬 결합 검증은 차단됨. 직전 로컬 검증 상태는 6/29 백업",
    },
    {
      label: "3. 압축 해제 분석",
      action: "프롬프트·응답·SKILL·엑셀 산출물의 파일명, 크기, 본문 요약을 추출",
      result: "신규 7/1 zip은 아직 로컬 해제 분석 미완료. 마지막으로 검증된 6/29 zip 내부에서는 6개 파일, 2개 작업 묶음, 프롬프트 2개와 응답 2개를 확인했고 Ops_dashboard_tab2_3h 프롬프트 1개에서 CRC 경고가 발생",
    },
    {
      label: "4. 임시 파일 삭제",
      action: "분석 후 결합 zip과 해제 폴더를 제거하고 요약 결과만 대시보드 데이터로 유지",
      result: "Drive 원본은 변경하지 않았고, 실패한 /private/tmp/drive-zip-20260701-parts.* staging 디렉터리와 비어 있던 로컬 part 파일은 삭제됨",
    },
  ],
  totals: {
    splitParts: 54,
    archives: 10,
    extractedFiles: 6,
    taskGroups: 2,
    dataFiles: 0,
    crcWarnings: 1,
  },
  archives: [
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
    role: "Claude 세션 분할 zip 및 AX Docs 산출물 저장소",
    folderModifiedAt: jaewooZipModifiedAt,
    utilizationScore: 88,
    utilizationLevel: "높음",
    artifacts: jaewooZipArtifacts,
    insights: [
      "Drive 폴더에는 최신 AX_2026-07-01_백업.zip.part00~part04 5개와 7/1 AX Docs·처리로그가 추가됐습니다.",
      "7/1 raw payload는 connector에서 확인됐지만 shell DNS와 서비스 계정 토큰 발급 실패로 로컬 결합·unzip 검증은 이번 실행에서 차단됐습니다.",
      "마지막 로컬 검증 archive는 6/29 백업이며 Ops_dashboard_tab2_3h_6fb565c4b3a1 프롬프트 파일 CRC 경고 1건을 계속 재검증 대상으로 표시합니다.",
    ],
  }),
  buildRepository({
    owner: "이형배",
    folderName: "이형배",
    folderId: "1OFfN4APAViKNtgURnmn9W51jSvcxy6fg",
    folderUrl: "https://drive.google.com/drive/folders/1OFfN4APAViKNtgURnmn9W51jSvcxy6fg?usp=sharing",
    role: "Claude 세션 날짜별 Google Docs 저장소",
    folderModifiedAt: hyungbaeDocsModifiedAt,
    utilizationScore: 86,
    utilizationLevel: "높음",
    artifacts: hyungbaeArtifacts,
    insights: [
      "최신 하위 폴더 claude-backup-2026-07-01에서 36개 Google Docs와 SKILL 파일 2개를 확인했고, 의미 있는 현장·안전관리 Docs 16개를 선별했습니다.",
      "Docs 본문은 프롬프트와 Claude 응답이 함께 남는 형태라 현장 자료 수집 목적과 결과를 같은 단위로 검토할 수 있습니다.",
      "주요 작업은 TBM 263건, 노사협의체 18건, 근골격계 조사 2건, 안전관리비 계획·집행, 위험성평가·재난대응·안전보고 체계 수집으로 묶입니다.",
    ],
  }),
];

export const driveArtifactRepositoryData: DriveArtifactRepositoryData = {
  source: {
    name: "Google Drive Claude 산출물 저장소",
    collectedAt: "2026-07-01 23:03 KST",
    period: "2026-06-21 ~ 2026-07-01",
    note: "김재우 폴더는 최신 AX_2026-07-01_백업.zip.part00~part04와 7/1 AX Docs·처리로그를 확인했지만 로컬 zip 검증은 DNS/token fetch 실패로 차단됐고, 이형배 폴더는 claude-backup-2026-07-01 날짜 폴더 아래 36개 Docs와 2개 SKILL 파일 중 현장·안전관리 분석에 직접 쓰이는 16개를 선별했습니다.",
  },
  totals: {
    repositories: repositories.length,
    files: repositories.reduce((sum, repository) => sum + repository.fileCount, 0),
    prompts: repositories.reduce((sum, repository) => sum + repository.promptCount, 0),
    outputs: repositories.reduce((sum, repository) => sum + repository.outputCount, 0),
    documents: repositories.reduce((sum, repository) => sum + repository.documentCount, 0),
    dataFiles: repositories.reduce((sum, repository) => sum + repository.dataFileCount, 0),
  },
  repositories,
  zipAnalysisPipeline,
  insights: [
    "김재우 폴더는 Drive에 zip part 원본만 남기고, 대시보드 수집 시 임시 해제 분석 결과만 저장하는 구조로 운영합니다.",
    `이형배 폴더는 ${hyungbaeDateFolderUrl} 하위의 날짜별 Docs 백업 구조로 전환되어, zip 해제 없이 세션별 프롬프트·응답 본문을 바로 추적합니다.`,
    "최신 김재우 7/1 분할 zip은 live Drive listing과 connector raw payload 존재만 확인됐고, 로컬 결합·해제 검증은 환경 DNS/token fetch 실패로 차단됐습니다.",
  ],
};
