export type GammaDriveArtifact = {
  id: string;
  title: string;
  url: string;
  category: "솔루션 제안서" | "AI CCTV 보고" | "홈페이지 리뉴얼" | "시범사업 성과";
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
  deckCount: number;
  totalSlides: number;
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
    collectedAt: "2026-06-26 11:18 KST",
    status: "수집",
    note: "Drive 폴더에서 Google Slides 12개를 읽어 Gamma 산출물 활용 주제와 업무 목적을 분류했습니다.",
  },
  deckCount: 12,
  totalSlides: 220,
  primaryTheme: "스마트 안전관리와 AI CCTV 기반 RiskZero 영업 제안",
  businessUse: "공공기관·개발공사·건설현장 대상 제안서, 도입 보고서, 홈페이지 리뉴얼 기획 초안 생산",
  artifacts: [
    {
      id: "1eECcNysgXj3bF8v_63VRhyQO24NRE7Jeyry1SQaBKNs",
      title: "AI 기반 스마트안전관리솔루션 도입 제안",
      url: "https://docs.google.com/presentation/d/1eECcNysgXj3bF8v_63VRhyQO24NRE7Jeyry1SQaBKNs/edit?usp=drivesdk",
      category: "솔루션 제안서",
      createdAt: "2026-06-26 08:48 KST",
      slideCount: 39,
      focus: "전국 지방개발공사·도시공사 대상 RiskZero 3.0 도입 제안",
    },
    {
      id: "1h6h7HWMLcn_qcKFTW1L_m63rgaMLWizgBmNXorKZnY0",
      title: "AI 기반 스마트 안전관리 솔루션 도입 제안",
      url: "https://docs.google.com/presentation/d/1h6h7HWMLcn_qcKFTW1L_m63rgaMLWizgBmNXorKZnY0/edit?usp=drivesdk",
      category: "솔루션 제안서",
      createdAt: "2026-06-26 08:56 KST",
      slideCount: 30,
      focus: "리스크제로 3.0 기반 개발공사 스마트 안전관리 체계",
    },
    {
      id: "1YCy6c9kDzxw6_YUO5a4xo3hXx5Y-AIZaknPYc_b0Mp0",
      title: "AI 기반 스마트 안전 관리 플랫폼 제안",
      url: "https://docs.google.com/presentation/d/1YCy6c9kDzxw6_YUO5a4xo3hXx5Y-AIZaknPYc_b0Mp0/edit?usp=drivesdk",
      category: "솔루션 제안서",
      createdAt: "2026-06-26 11:07 KST",
      slideCount: 25,
      focus: "64개 현장 통합 관제, Smart TBM, 스마트 장비 연동",
    },
    {
      id: "1x5rw-J93lhznAVai4u-eQMr7IyeG660TPOyrYrQbmpc",
      title: "AI 기반 스마트 안전 관리 플랫폼",
      url: "https://docs.google.com/presentation/d/1x5rw-J93lhznAVai4u-eQMr7IyeG660TPOyrYrQbmpc/edit?usp=drivesdk",
      category: "솔루션 제안서",
      createdAt: "2026-06-26 09:15 KST",
      slideCount: 24,
      focus: "AI 학습모델, Safety Index, War Room, 스마트 안전상황실",
    },
    {
      id: "1Vxz10fQGSZmWUxMsHgRqXrhheiwguFTLd6Udwe_edgU",
      title: "AI 기반 스마트 안전 관리 플랫폼",
      url: "https://docs.google.com/presentation/d/1Vxz10fQGSZmWUxMsHgRqXrhheiwguFTLd6Udwe_edgU/edit?usp=drivesdk",
      category: "솔루션 제안서",
      createdAt: "2026-06-26 11:08 KST",
      slideCount: 21,
      focus: "One-PMIS 데이터 자산화와 지능형 안전 비서 제안",
    },
    {
      id: "1Q0Xu7tlQo3yRT3MZkXM7qBTgQHbcVRvRAxHqWccH43A",
      title: "AI 기반 스마트 안전 관리 플랫폼 제안",
      url: "https://docs.google.com/presentation/d/1Q0Xu7tlQo3yRT3MZkXM7qBTgQHbcVRvRAxHqWccH43A/edit?usp=drivesdk",
      category: "솔루션 제안서",
      createdAt: "2026-06-26 09:11 KST",
      slideCount: 21,
      focus: "AA 시스템 독립화, 맞춤형 TBM, 64개 현장 대시보드",
    },
    {
      id: "1drbHABtUZILs9KIfipCCT0kj1nrpstUY6JJYusrC4mU",
      title: "리스크제로 산업용 AI 스마트안전관리솔루션 도입 제안",
      url: "https://docs.google.com/presentation/d/1drbHABtUZILs9KIfipCCT0kj1nrpstUY6JJYusrC4mU/edit?usp=drivesdk",
      category: "솔루션 제안서",
      createdAt: "2026-06-26 11:11 KST",
      slideCount: 11,
      focus: "제조업 안전관리, 외국인 근로자, JSA, 자동 리포트",
    },
    {
      id: "1f9a3x35ljHN6oYJC-ARRfypjfYt9CYjxOIr4SSor7ks",
      title: "현장 맞춤형 스마트 안전관리 실행체계 구축",
      url: "https://docs.google.com/presentation/d/1f9a3x35ljHN6oYJC-ARRfypjfYt9CYjxOIr4SSor7ks/edit?usp=drivesdk",
      category: "솔루션 제안서",
      createdAt: "2026-06-26 09:14 KST",
      slideCount: 8,
      focus: "70개 현장 통합 관제와 AI 기반 스마트 TBM 실행체계",
    },
    {
      id: "1hw5vs-pMZS9fMGf7TbPDNAexJA0WzHRsZu-eUsKa4Y4",
      title: "OO공사 지능형(AI) CCTV 도입현황 및 효과 보고",
      url: "https://docs.google.com/presentation/d/1hw5vs-pMZS9fMGf7TbPDNAexJA0WzHRsZu-eUsKa4Y4/edit?usp=drivesdk",
      category: "AI CCTV 보고",
      createdAt: "2026-06-26 09:12 KST",
      slideCount: 10,
      focus: "건설사·공공기관 AI CCTV 도입률, 효과, 기술 가이드라인",
    },
    {
      id: "1DsuJCSniAvr6FYjK8gLac1y47DfbSvJUNunbrc97DUc",
      title: "OO공사 지능형(AI) CCTV 도입현황 및 효과 보고",
      url: "https://docs.google.com/presentation/d/1DsuJCSniAvr6FYjK8gLac1y47DfbSvJUNunbrc97DUc/edit?usp=drivesdk",
      category: "AI CCTV 보고",
      createdAt: "2026-06-26 09:13 KST",
      slideCount: 10,
      focus: "AI CCTV 도입 현황, 사고 예방, 정책 제언 요약본",
    },
    {
      id: "121fGry0M_gsZPkdtbaiaWDeD_62ess6_C08rJZazpXY",
      title: "AI 사고 예측 모델 기반 스마트 안전 관리 시스템",
      url: "https://docs.google.com/presentation/d/121fGry0M_gsZPkdtbaiaWDeD_62ess6_C08rJZazpXY/edit?usp=drivesdk",
      category: "시범사업 성과",
      createdAt: "2026-06-26 09:07 KST",
      slideCount: 11,
      focus: "국가철도공단 시범사업 추진 경과, WEB/APP 기능, 성과 지표",
    },
    {
      id: "1vJKBeT3x79zS1qkuqB3Jb1l48oKDwzZae7zG9GGlCTs",
      title: "RISKZERO.AI 홈페이지 메인 페이지 디자인 리뉴얼 제안",
      url: "https://docs.google.com/presentation/d/1vJKBeT3x79zS1qkuqB3Jb1l48oKDwzZae7zG9GGlCTs/edit?usp=drivesdk",
      category: "홈페이지 리뉴얼",
      createdAt: "2026-06-26 11:10 KST",
      slideCount: 10,
      focus: "브랜드 메시지, 홈페이지 정보 구조, 서비스 소개 영상 활용",
    },
  ],
  topicMix: [
    {
      topic: "스마트 안전관리 플랫폼 제안",
      count: 8,
      note: "RiskZero 3.0, Smart TBM, Safety Index, 통합 관제, 스마트 장비 연동이 반복됩니다.",
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
  ],
  insights: [
    "Gamma는 단순 디자인 도구가 아니라 영업 제안서와 보고서 초안을 빠르게 다변형 생산하는 채널로 쓰이고 있습니다.",
    "산출물은 건설·공공·개발공사 안전관리 세그먼트에 집중되어 있어 RiskZero 사업화 자료 축적 관점에서 재사용성이 높습니다.",
    "같은 주제의 유사 deck이 여러 개 생성되어 있어 최종본 선별, 근거 검증, 버전 관리 없이는 제안 품질이 분산될 수 있습니다.",
  ],
  actions: [
    "예약 작업은 Gamma 크레딧 잔여량 수집보다 Drive 폴더 기반 산출물 분석과 대시보드 반영을 우선합니다.",
    "Drive 폴더 신규 Gamma deck을 주기적으로 읽고 제목, 주제, 슬라이드 수, 영업 활용 목적을 누적 분류합니다.",
    "중복 deck은 최종본·초안·참고본으로 태그를 나눠 제안서 재사용성과 품질 검수 상태를 분리합니다.",
  ],
};
