import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../PdfAnalysisResultPage.css';

/**
 * [LearningStatusDetail]
 * 1. 상단 헤더(Header)를 임포트하거나 내부에서 구현하지 않습니다.
 * 2. 제공된 PdfAnalysisResultPage 디자인(2컬럼 패널)을 그대로 사용합니다.
 * 3. 오른쪽 교안 구조 분석 패널은 내부 스크롤이 가능합니다.
 */

// SVG 아이콘 컴포넌트 (내부 선언으로 의존성 제거)
const CheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const Lightbulb = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="9" y1="18" x2="15" y2="18"></line>
    <line x1="10" y1="22" x2="14" y2="22"></line>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 16.5 8 4.5 4.5 0 0 0 12 3.5 4.5 4.5 0 0 0 7.5 8c0 1.68.73 2.85 1.5 3.5.76.76 1.23 1.52 1.41 2.5"></path>
  </svg>
);

const Star = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const Check = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// 머신러닝 학습 완료 데이터 예시
const structureData = [
  {
    id: 1,
    title: "1. 추천 시스템 개요 (1p ~ 10p)",
    completed: true,
    children: [
      { id: 11, title: "추천 시스템 가치·프로세스·평점 행렬 소개 (1p ~ 9p)", type: "concept", completed: true }
    ]
  },
  {
    id: 2,
    title: "2. 협업 필터링 (11p ~ 115p)",
    completed: true,
    children: [
      { id: 21, title: "메모리 기반 CF (user-based / item-based) (16p ~ 60p)", type: "concept", completed: true },
      { id: 22, title: "예제 1 : User-based (21p ~ 39p)", type: "example", completed: true },
      { id: 23, title: "예제 2 : Item-based CF (45p ~ 56p)", type: "example", completed: true },
      { id: 24, title: "모델 기반 CF (SVD, Matrix Factorization) (61p ~ 115p)", type: "concept", completed: true }
    ]
  },
  {
    id: 3,
    title: "3. 콘텐츠 기반 필터링 (117p ~ 126p)",
    completed: true,
    children: [
      { id: 31, title: "콘텐츠 기반 필터링 개념·구조 (117p ~ 119p)", type: "concept", completed: true }
    ]
  }
];

export default function LearningStatusDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  useEffect(() => {
    // API 요청 시 courseId를 사용하여 과목 상세 정보를 불러옵니다.
    console.log(`${courseId} 기반 상세 데이터 호출`);
  }, [courseId]);

  return (
    <div className="analysis-page">
      <div className="analysis-container">

        {/* Left Panel: 요약 및 현황 */}
        <div className="panel summary-panel">
          <div className="summary-header">
            {/* 학습 완료 상태 시각화 (초록색 체크) */}
            <div style={{ backgroundColor: '#22c55e', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Check style={{ color: 'white', width: '32px', height: '32px' }} />
            </div>
            <h1 className="summary-title">‘머신러닝’ 교안 학습 완료 !</h1>
            <p className="file-name">머신러닝.pdf</p>
          </div>

          <div className="type-box">
            <span className="type-label">교안 유형 :</span>
            <span className="type-value">예제 중심 개념설명</span>
          </div>

          {/* 주요 통계 그리드 */}
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">개념</span>
              <span className="stat-value blue">12</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">질문</span>
              <span className="stat-value green">24</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">페이지</span>
              <span className="stat-value pink">119</span>
            </div>
          </div>

          {/* 생성된 자료 목록 */}
          <div className="generated-list">
            <h3 className="list-title">✨ 생성된 학습 자료</h3>
            {['핵심 개념 추출', 'Q&A 생성', '학습 퀴즈'].map((item, idx) => (
              <div key={idx} className="list-item" style={{ border: 'none', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px' }}>
                <div className="item-left">
                  <Lightbulb className="item-icon" style={{ color: '#60a5fa' }} />
                  <span>{item}</span>
                </div>
                <Check className="check-icon" style={{ color: '#22c55e' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: 교안 구조 분석 (스크롤 영역) */}
        <div className="panel structure-panel" style={{ width: '600px', flex: 'none' }}>
          <div className="structure-header">
            <Star className="star-icon" />
            <h2 className="structure-title">교안 구조 분석</h2>
          </div>

          {/* 목차 스크롤 영역 */}
          <div className="structure-content" style={{ maxHeight: '550px', overflowY: 'auto' }}>
            {structureData.map((chapter) => (
              <div key={chapter.id} className="chapter-item" style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="chapter-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cbd5e1' }}>
                  <span>{chapter.title}</span>
                  {chapter.completed && <Check style={{ color: '#22c55e', width: '16px' }} />}
                </div>

                <div className="chapter-children" style={{ marginTop: '12px', borderLeft: 'none', marginLeft: 0 }}>
                  {chapter.children.map((child) => (
                    <div key={child.id} className="child-item" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Lightbulb className="child-icon concept" style={{ width: '16px', color: '#fbbf24' }} />
                        <span className="child-text" style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{child.title}</span>
                      </div>
                      {child.completed && <Check style={{ color: '#22c55e', width: '16px' }} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}