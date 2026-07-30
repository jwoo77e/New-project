export type GammaDriveArtifact = {
  id: string;
  title: string;
  url: string;
  category:
    | "솔루션 제안서"
    | "AI CCTV 보고"
    | "홈페이지 리뉴얼"
    | "시범사업 성과"
    | "제품 기능 소개";
  format: "Google Slides" | "PDF";
  createdAt: string;
  slideCount: number;
  focus: string;
};

export type GammaDriveUsageData = {
  source: {
    name: string;
    folderUrl: string;
    collectedAt: string;
    status: "수집";
    note: string;
  };
  artifactCount: number;
  googleSlidesCount: number;
  pdfCount: number;
  totalPages: number;
  primaryTheme: string;
  businessUse: string;
  artifacts: GammaDriveArtifact[];
  topicMix: Array<{
    topic: string;
    count: number;
    note: string;
  }>;
  insights: string[];
  actions: string[];
};

export const gammaDriveUsageData: GammaDriveUsageData = {
  source: {
    name: "Gamma Drive 산출물 폴더",
    folderUrl: "https://drive.google.com/drive/folders/1lBGlyDjDzeGqsZP4Vpz5UgI1Mf0flDzC?usp=drive_link",
    collectedAt: "2026-07-30 12:02 KST",
    status: "수집",
    note: "Drive 폴더 전체 15개 파일의 목록과 내용을 확인해 Google Slides 12개, 다운로드 PDF 3개의 활용 주제와 업무 목적을 분류했습니다.",
  },
  artifactCount: 15,
  googleSlidesCount: 12,
  pdfCount: 3,
  totalPages: 224,
  primaryTheme: "스마트 안전관리와 AI CCTV 기반 RiskZero 영업 제안",
  businessUse: "공공기관·개발공사·건설현장 대상 제안서, 도입 보고서, 제품 기능 소개와 홈페이지 리뉴얼 기획 초안 생산",
  artifacts: [
    {
      id: "1FNKGNVPx8XBSVCj39tjk-haJyJoH7B8Y",
      title: "제로가드 기능 소개",
      url: "https://drive.google.com/file/d/1FNKGNVPx8XBSVCj39tjk-haJyJoH7B8Y/view?usp=drivesdk",
      category: "제품 기능 소개",
      format: "PDF",
      createdAt: "2026-07-30 11:55 KST",
      slideCount: 2,
      focus: "위험성평가, TBM, 안전보건교육, 일일점검과 점검보고서 자동생성 프로세스",
    },
    {
      id: "1Q0Fwn_aI4tCJ4IgecphnXr8veJB376fE",
      title: "지능형 스마트 안전관리 플랫폼",
      url: "https://drive.google.com/file/d/1Q0Fwn_aI4tCJ4IgecphnXr8veJB376fE/view?usp=drivesdk",
      category: "솔루션 제안서",
      format: "PDF",
      createdAt: "2026-07-30 11:55 KST",
      slideCount: 1,
      focus: "70개 현장 통합 관제, 사고예방률 30%, 점검 효율 50% 향상 목표를 요약한 제안 시안",
    },
    {
      id: "11G6SzDh4XNspoWBbGQK-rHp2X9ljUQu8",
      title: "스마트 안전관리 플랫폼",
      url: "https://drive.google.com/file/d/11G6SzDh4XNspoWBbGQK-rHp2X9ljUQu8/view?usp=drivesdk",
      category: "솔루션 제안서",
      format: "PDF",
      createdAt: "2026-07-30 11:54 KST",
      slideCount: 1,
      focus: "AI 기반 예측 경보, 스마트 TBM, 실시간 위험 정보와 중대재해 ZERO 목표를 정리한 변형 시안",
    },
    {
      id: "1eECcNysgXj3bF8v_63VRhyQO24NRE7Jeyry1SQaBKNs",
      title: "AI 기반 스마트안전관리솔루션 도입 제안",
      url: "https://docs.google.com/presentation/d/1eECcNysgXj3bF8v_63VRhyQO24NRE7Jeyry1SQaBKNs/edit?usp=drivesdk",
      category: "솔루션 제안서",
      format: "Google Slides",
      createdAt: "2026-06-26 08:48 KST",
      slideCount: 39,
      focus: "전국 지방개발공사·도시공사 대상 RiskZero 3.0 도입 제안",
    },
    {
      id: "1h6h7HWMLcn_qcKFTW1L_m63rgaMLWizgBmNXorKZnY0",
      title: "AI 기반 스마트 안전관리 솔루션 도입 제안",
      url: "https://docs.google.com/presentation/d/1h6h7HWMLcn_qcKFTW1L_m63rgaMLWizgBmNXorKZnY0/edit?usp=drivesdk",
      category: "솔루션 제안서",
      format: "Google Slides",
      createdAt: "2026-06-26 08:56 KST",
      slideCount: 30,
      focus: "리스크제로 3.0 기반 개발공사 스마트 안전관리 체계",
    },
    {
      id: "1YCy6c9kDzxw6_YUO5a4xo3hXx5Y-AIZaknPYc_b0Mp0",
      title: "AI 기반 스마트 안전 관리 플랫폼 제안",
      url: "https://docs.google.com/presentation/d/1YCy6c9kDzxw6_YUO5a4xo3hXx5Y-AIZaknPYc_b0Mp0/edit?usp=drivesdk",
      category: "솔루션 제안서",
      format: "Google Slides",
      createdAt: "2026-06-26 11:07 KST",
      slideCount: 25,
      focus: "64개 현장 통합 관제, Smart TBM, 스마트 장비 연동",
    },
    {
      id: "1x5rw-J93lhznAVai4u-eQMr7IyeG660TPOyrYrQbmpc",
      title: "AI 기반 스마트 안전 관리 플랫폼",
      url: "https://docs.google.com/presentation/d/1x5rw-J93lhznAVai4u-eQMr7IyeG660TPOyrYrQbmpc/edit?usp=drivesdk",
      category: "솔루션 제안서",
      format: "Google Slides",
      createdAt: "2026-06-26 09:15 KST",
      slideCount: 24,
      focus: "AI 학습모델, Safety Index, War Room, 스마트 안전상황실",
    },
    {
      id: "1Vxz10fQGSZmWUxMsHgRqXrhheiwguFTLd6Udwe_edgU",
      title: "AI 기반 스마트 안전 관리 플랫폼",
      url: "https://docs.google.com/presentation/d/1Vxz10fQGSZmWUxMsHgRqXrhheiwguFTLd6Udwe_edgU/edit?usp=drivesdk",
      category: "솔루션 제안서",
      format: "Google Slides",
      createdAt: "2026-06-26 11:08 KST",
      slideCount: 21,
      focus: "One-PMIS 데이터 자산화와 지능형 안전 비서 제안",
    },
    {
      id: "1Q0Xu7tlQo3yRT3MZkXM7qBTgQHbcVRvRAxHqWccH43A",
      title: "AI 기반 스마트 안전 관리 플랫폼 제안",
      url: "https://docs.google.com/presentation/d/1Q0Xu7tlQo3yRT3MZkXM7qBTgQHbcVRvRAxHqWccH43A/edit?usp=drivesdk",
      category: "솔루션 제안서",
      format: "Google Slides",
      createdAt: "2026-06-26 09:11 KST",
      slideCount: 21,
      focus: "AA 시스템 독립화, 맞춤형 TBM, 64개 현장 대시보드",
    },
    {
      id: "1drbHABtUZILs9KIfipCCT0kj1nrpstUY6JJYusrC4mU",
      title: "리스크제로 산업용 AI 스마트안전관리솔루션 도입 제안",
      url: "https://docs.google.com/presentation/d/1drbHABtUZILs9KIfipCCT0kj1nrpstUY6JJYusrC4mU/edit?usp=drivesdk",
      category: "솔루션 제안서",
      format: "Google Slides",
      createdAt: "2026-06-26 11:11 KST",
      slideCount: 11,
      focus: "제조업 안전관리, 외국인 근로자, JSA, 자동 리포트",
    },
    {
      id: "1f9a3x35ljHN6oYJC-ARRfypjfYt9CYjxOIr4SSor7ks",
      title: "현장 맞춤형 스마트 안전관리 실행체계 구축",
      url: "https://docs.google.com/presentation/d/1f9a3x35ljHN6oYJC-ARRfypjfYt9CYjxOIr4SSor7ks/edit?usp=drivesdk",
      category: "솔루션 제안서",
      format: "Google Slides",
      createdAt: "2026-06-26 09:14 KST",
      slideCount: 8,
      focus: "70개 현장 통합 관제와 AI 기반 스마트 TBM 실행체계",
    },
    {
      id: "1hw5vs-pMZS9fMGf7TbPDNAexJA0WzHRsZu-eUsKa4Y4",
      title: "OO공사 지능형(AI) CCTV 도입현황 및 효과 보고",
      url: "https://docs.google.com/presentation/d/1hw5vs-pMZS9fMGf7TbPDNAexJA0WzHRsZu-eUsKa4Y4/edit?usp=drivesdk",
      category: "AI CCTV 보고",
      format: "Google Slides",
      createdAt: "2026-06-26 09:12 KST",
      slideCount: 10,
      focus: "건설사·공공기관 AI CCTV 도입률, 효과, 기술 가이드라인",
    },
    {
      id: "1DsuJCSniAvr6FYjK8gLac1y47DfbSvJUNunbrc97DUc",
      title: "OO공사 지능형(AI) CCTV 도입현황 및 효과 보고",
      url: "https://docs.google.com/presentation/d/1DsuJCSniAvr6FYjK8gLac1y47DfbSvJUNunbrc97DUc/edit?usp=drivesdk",
      category: "AI CCTV 보고",
      format: "Google Slides",
      createdAt: "2026-06-26 09:13 KST",
      slideCount: 10,
      focus: "AI CCTV 도입 현황, 사고 예방, 정책 제언 요약본",
    },
    {
      id: "121fGry0M_gsZPkdtbaiaWDeD_62ess6_C08rJZazpXY",
      title: "AI 사고 예측 모델 기반 스마트 안전 관리 시스템",
      url: "https://docs.google.com/presentation/d/121fGry0M_gsZPkdtbaiaWDeD_62ess6_C08rJZazpXY/edit?usp=drivesdk",
      category: "시범사업 성과",
      format: "Google Slides",
      createdAt: "2026-06-26 09:07 KST",
      slideCount: 11,
      focus: "국가철도공단 시범사업 추진 경과, WEB/APP 기능, 성과 지표",
    },
    {
      id: "1vJKBeT3x79zS1qkuqB3Jb1l48oKDwzZae7zG9GGlCTs",
      title: "RISKZERO.AI 홈페이지 메인 페이지 디자인 리뉴얼 제안",
      url: "https://docs.google.com/presentation/d/1vJKBeT3x79zS1qkuqB3Jb1l48oKDwzZae7zG9GGlCTs/edit?usp=drivesdk",
      category: "홈페이지 리뉴얼",
      format: "Google Slides",
      createdAt: "2026-06-26 11:10 KST",
      slideCount: 10,
      focus: "브랜드 메시지, 홈페이지 정보 구조, 서비스 소개 영상 활용",
    },
  ],
  topicMix: [
    {
      topic: "스마트 안전관리 플랫폼 제안",
      count: 10,
      note: "RiskZero 3.0, Smart TBM, Safety Index, 통합 관제, 스마트 장비 연동 제안이 반복되며 1장 PDF 변형 2개가 추가되었습니다.",
    },
    {
      topic: "AI CCTV 도입·효과 보고",
      count: 2,
      note: "건설사·공공기관 도입 현황, 사고율 감소, 설치 가이드라인을 보고서형으로 정리했습니다.",
    },
    {
      topic: "시범사업 성과·레퍼런스",
      count: 1,
      note: "국가철도공단 사례처럼 성과 수치와 WEB/APP 기능을 레퍼런스 자료로 구성했습니다.",
    },
    {
      topic: "브랜드·홈페이지 기획",
      count: 1,
      note: "RISKZERO.AI 홈페이지 히어로 메시지와 서비스 정보 구조 개선안을 만들었습니다.",
    },
    {
      topic: "제품 기능·업무 프로세스",
      count: 1,
      note: "제로가드의 위험성평가, TBM, 교육, 점검과 보고서 자동생성 흐름을 2장 기능 소개 자료로 정리했습니다.",
    },
  ],
  insights: [
    "Gamma Drive에는 Google Slides 12개와 다운로드 PDF 3개, 총 15개 산출물 224장이 축적되어 있습니다.",
    "7월 30일 추가된 PDF 중 2개는 같은 스마트 안전관리 제안의 1장 변형 시안이고, 1개는 제로가드 기능과 현장 적용 프로세스를 설명하는 별도 자료입니다.",
    "건설·공공·개발공사 안전관리 제안에 집중되어 재사용성은 높지만, 유사 시안은 최종본 선별과 근거 검증 상태를 함께 관리해야 합니다.",
  ],
  actions: [
    "매주 금요일 23시에 Drive 폴더 전체 파일과 하위 폴더를 다시 확인해 신규 산출물과 통계를 갱신합니다.",
    "신규 Gamma 산출물은 제목, 형식, 분량, 주제와 영업 활용 목적을 누적 분류합니다.",
    "유사 산출물은 최종본·초안·참고본으로 구분해 생산량과 실제 활용 가능한 결과물 수를 분리합니다.",
  ],
};
