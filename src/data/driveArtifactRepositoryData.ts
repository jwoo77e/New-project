export type DriveArtifactKind = "프롬프트" | "응답" | "업무보고" | "데이터 파일" | "문서 산출물";

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
  insights: string[];
};

const kindColors: Record<DriveArtifactKind, string> = {
  프롬프트: "#0f8b8d",
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

const hyungbaeArtifacts: DriveArtifact[] = [
  {
    title: "V1 (dd36b6e9)",
    url: "https://docs.google.com/document/d/1_hnC-nNAwd5PAQ7yYiOFdDjRIWkQJvboGPENAvCUTG4/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:36.131Z",
    modifiedAt: "2026-06-23T04:30:37.394Z",
    kind: "문서 산출물",
    useCase: "V1 초안 정리",
    usageSignal: "Claude 생성 초안이 Google Docs 문서로 저장됨",
  },
  {
    title: "Collect data from all station resource pages (b6a9200d)",
    url: "https://docs.google.com/document/d/1Ap7i-HNxPDXECfF9_BxKCJ-cXZYCqtx7baGSolDKTck/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:31.378Z",
    modifiedAt: "2026-06-23T04:30:32.638Z",
    kind: "문서 산출물",
    useCase: "사업장 데이터 수집",
    usageSignal: "전체 사업장 리소스 페이지 수집 결과",
  },
  {
    title: "V1 (70f54c98)",
    url: "https://docs.google.com/document/d/11kzRYTMQ4p5E2t2oADFn4YHM_dJnQhqTrGbI25PyyWE/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:30.431Z",
    modifiedAt: "2026-06-23T04:30:31.593Z",
    kind: "문서 산출물",
    useCase: "V1 초안 정리",
    usageSignal: "Claude 생성 초안이 Google Docs 문서로 저장됨",
  },
  {
    title: "V1 (b19a2c2d)",
    url: "https://docs.google.com/document/d/1j1IP5WTpUISYIsJDWua2RAsnwDoiTL8aBtPvEI3u6wQ/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:29.481Z",
    modifiedAt: "2026-06-23T04:30:30.870Z",
    kind: "문서 산출물",
    useCase: "V1 초안 정리",
    usageSignal: "Claude 생성 초안이 Google Docs 문서로 저장됨",
  },
  {
    title: "Collect safety management plan data (7a5e7017)",
    url: "https://docs.google.com/document/d/1odaQeunICtyhbttlAO-SGjTTZJMe6-H-rMrIjZLFsW4/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:21.495Z",
    modifiedAt: "2026-06-23T04:30:22.719Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "안전관리계획 자료 수집 결과",
  },
  {
    title: "Collect ergonomic hazard assessment data (6e85c136)",
    url: "https://docs.google.com/document/d/1WWIn6HUDCHYZKGyasIb52USj90IHp0Ejq8wvnwdmGGQ/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:20.786Z",
    modifiedAt: "2026-06-23T04:30:21.995Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "근골격계/인간공학 유해요인 평가 자료 수집 결과",
  },
  {
    title: "V1 (ac99fd8e)",
    url: "https://docs.google.com/document/d/1yOKTRWU7NYwZkoK1cdyp26gn6Ef92GxecqnzWhTkyEw/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:17.603Z",
    modifiedAt: "2026-06-23T04:30:18.880Z",
    kind: "문서 산출물",
    useCase: "V1 초안 정리",
    usageSignal: "Claude 생성 초안이 Google Docs 문서로 저장됨",
  },
  {
    title: "Collect safety management cost data (05ac25e6)",
    url: "https://docs.google.com/document/d/1-Ju-LjYVPB1iVv9TSzkNU_j6NdzVkfYfE9vkVDUlIWU/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:12.123Z",
    modifiedAt: "2026-06-23T04:30:13.422Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "안전관리비 자료 수집 결과",
  },
  {
    title: "Collect disaster response manuals from all sites (4d18ed3c)",
    url: "https://docs.google.com/document/d/1Pi6AXLP8HBldDZLm5dY75_USN6URlOOO52c5WpbpjRI/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:09.685Z",
    modifiedAt: "2026-06-23T04:30:10.923Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "전체 현장 재난 대응 매뉴얼 수집 결과",
  },
  {
    title: "V1 (15f95825)",
    url: "https://docs.google.com/document/d/1ulFk9e91QvggLXWRqvlEwyE3KNFVTaP6w-9tvMkY5YE/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:04.490Z",
    modifiedAt: "2026-06-23T04:30:05.699Z",
    kind: "문서 산출물",
    useCase: "V1 초안 정리",
    usageSignal: "Claude 생성 초안이 Google Docs 문서로 저장됨",
  },
  {
    title: "Document TBM safety management system (0b3672ce)",
    url: "https://docs.google.com/document/d/1hbxivAjHUataqkhAak_WA9HIwy0-E0JEzf4doc53CEk/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:30:01.746Z",
    modifiedAt: "2026-06-23T04:30:02.993Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "TBM 안전관리 체계 문서화 결과",
  },
  {
    title: "Collect risk assessment data (2c77ed42)",
    url: "https://docs.google.com/document/d/1YyCaXJKjGycbPKzm_7DRnek0aE4kmis2P8RquL1v9gM/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:29:58.572Z",
    modifiedAt: "2026-06-23T04:29:59.731Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "위험성 평가 자료 수집 결과",
  },
  {
    title: "V1 (41303be4)",
    url: "https://docs.google.com/document/d/1HTw8u6FHNs0tt8fwbEQQqCh6EfZYNbrIs14WZ95155c/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:29:58.343Z",
    modifiedAt: "2026-06-23T04:29:59.607Z",
    kind: "문서 산출물",
    useCase: "V1 초안 정리",
    usageSignal: "Claude 생성 초안이 Google Docs 문서로 저장됨",
  },
  {
    title: "Document safety management system pages (c921fcc7)",
    url: "https://docs.google.com/document/d/1AIKKyzz1WRtWHY-nCAfvmNO5MEmtNeS07973gfIstG0/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:29:55.675Z",
    modifiedAt: "2026-06-23T04:29:56.931Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "안전관리 시스템 페이지 문서화 결과",
  },
  {
    title: "Collect safety management expense data (5915ecf8)",
    url: "https://docs.google.com/document/d/1bV4gb-JMC3q85nivFPMtz6ZRVJYkjiwSouFjz6Ocq8E/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:29:45.992Z",
    modifiedAt: "2026-06-23T04:29:47.169Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "안전관리비/경비 자료 수집 결과",
  },
  {
    title: "Document safety report system across sites (ab9618f4)",
    url: "https://docs.google.com/document/d/113ThrH26MBk4VS9MIigoa__dj8xgT_C-XUkkeJuCWIY/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:29:36.383Z",
    modifiedAt: "2026-06-23T04:29:37.870Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "현장별 안전 보고 체계 문서화 결과",
  },
  {
    title: "Document safety equipment distribution across sites (718b84a0)",
    url: "https://docs.google.com/document/d/1Cvz0u6UIstZuzivSNKaO4RWtMMTvKQm7sIdyBC_T_Z0/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:29:32.455Z",
    modifiedAt: "2026-06-23T04:29:33.756Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "현장별 안전장비 배포 현황 문서화 결과",
  },
  {
    title: "Collect safety management cost data (6348cd75)",
    url: "https://docs.google.com/document/d/1z_5RtzQJNUwqhaP6h3tno7R6DJ7sOPP3k9gd-9CbFQQ/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:29:27.241Z",
    modifiedAt: "2026-06-23T04:29:28.530Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "안전관리비 자료 수집 결과",
  },
  {
    title: "Collect safety facility data across sites (59f4398d)",
    url: "https://docs.google.com/document/d/14FfEZt010AEei9Ew7ROo8ZL9MkP5B8vR9JfH6Vwtt7w/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:29:20.104Z",
    modifiedAt: "2026-06-23T04:29:21.394Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "현장별 안전시설 자료 수집 결과",
  },
  {
    title: "Collect risk assessment data (bad3d43a)",
    url: "https://docs.google.com/document/d/1ONHHOed5GqqC9fMVjICGnx5mnJr2myn7udLJ7dYhP1E/edit?usp=drivesdk",
    mimeType: "application/vnd.google-apps.document",
    createdAt: "2026-06-23T04:29:10.351Z",
    modifiedAt: "2026-06-23T04:29:11.724Z",
    kind: "문서 산출물",
    useCase: "현장 안전관리 자료",
    usageSignal: "위험성 평가 자료 수집 결과",
  },
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

function buildRepository(
  spec: Omit<
    DriveArtifactRepository,
    "fileCount" | "promptCount" | "outputCount" | "documentCount" | "dataFileCount" | "typeBreakdown" | "useCaseBreakdown"
  >,
): DriveArtifactRepository {
  const fileCount = spec.artifacts.length;
  const promptCount = spec.artifacts.filter((artifact) => artifact.kind === "프롬프트").length;
  const dataFileCount = spec.artifacts.filter((artifact) => artifact.kind === "데이터 파일").length;
  const documentCount = spec.artifacts.filter((artifact) => artifact.kind === "문서 산출물").length;
  const outputCount = spec.artifacts.filter((artifact) => artifact.kind !== "프롬프트").length;

  return {
    ...spec,
    fileCount,
    promptCount,
    outputCount,
    documentCount,
    dataFileCount,
    typeBreakdown: buildBreakdown(
      spec.artifacts.map((artifact) => artifact.kind),
      fileCount,
      kindColors,
    ),
    useCaseBreakdown: buildBreakdown(
      spec.artifacts.map((artifact) => artifact.useCase),
      fileCount,
      useCaseColors,
    ),
  };
}

const repositories: DriveArtifactRepository[] = [
  buildRepository({
    owner: "김재우",
    folderName: "김재우",
    folderId: "1Q2OorOdMlPn8xRBzuHWyY5kqGHxRYpPZ",
    folderUrl: "https://drive.google.com/drive/folders/1Q2OorOdMlPn8xRBzuHWyY5kqGHxRYpPZ?usp=drive_link",
    role: "Claude 프롬프트·응답·업무 산출물 저장소",
    folderModifiedAt: "2026-06-23T04:39:55.790Z",
    utilizationScore: 86,
    utilizationLevel: "높음",
    artifacts: jaewooArtifacts,
    insights: [
      "프롬프트와 응답이 17쌍으로 저장되어 재현성과 리뷰 가능성이 높습니다.",
      "AX 운영, IRIS 공고, 업무보고, 지식관리까지 용도가 분산되어 실무 활용 폭이 넓습니다.",
      "업무보고와 엑셀 산출물이 포함되어 단순 질의보다 실제 업무 결과물 보관에 가까운 형태입니다.",
    ],
  }),
  buildRepository({
    owner: "이형배",
    folderName: "이형배",
    folderId: "1OFfN4APAViKNtgURnmn9W51jSvcxy6fg",
    folderUrl: "https://drive.google.com/drive/folders/1OFfN4APAViKNtgURnmn9W51jSvcxy6fg?usp=sharing",
    role: "Claude 기반 현장·안전관리 자료 생성 저장소",
    folderModifiedAt: "2026-06-23T04:40:36.187Z",
    utilizationScore: 78,
    utilizationLevel: "양호",
    artifacts: hyungbaeArtifacts,
    insights: [
      "20개 파일 모두 Google Docs 문서로 저장되어 자료 검토와 후속 편집에 적합합니다.",
      "안전관리비, 위험성 평가, 재난 대응, TBM 등 현장 안전관리 주제가 집중되어 있습니다.",
      "명시적인 프롬프트 파일은 별도 보관되지 않아 프롬프트-응답 재현성은 김재우 폴더보다 낮습니다.",
    ],
  }),
];

export const driveArtifactRepositoryData: DriveArtifactRepositoryData = {
  source: {
    name: "Google Drive Claude 산출물 저장소",
    collectedAt: "2026-06-23 13:40 KST",
    period: "2026-06-21 ~ 2026-06-23",
    note: "사용자가 지정한 Google Drive 폴더 2건을 직접 조회해 파일명, 유형, 수정시점, 저장 구조를 기준으로 집계했습니다.",
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
  insights: [
    "김재우 폴더는 프롬프트와 응답을 쌍으로 남겨 사용 의도와 결과물을 함께 추적할 수 있습니다.",
    "이형배 폴더는 현장 안전관리 자료 수집·문서화 결과가 집중되어 있어 업무 주제는 선명하지만, 프롬프트 원문 보관은 보강이 필요합니다.",
    "다음 단계에서는 Drive 파일별 제출 여부, 재사용 여부, 업무 절감 시간을 태그로 추가하면 활용성 지표가 비용 관리와 직접 연결됩니다.",
  ],
};
