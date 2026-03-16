import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LearningDashboardLayout from '../components/templates/LearningDashboardLayout';

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const weaknessMockData = [
  {
    id: 1,
    category: '약함',
    title: '딥러닝 기초 개념',
    pages: '관련 페이지: 5, 6, 7',
    description:
      '신경망의 구조와 학습 과정에 대한 이해가 부족합니다. 역전파 알고리즘과 경사 하강법의 원리를 복습하고, 간단한 신경망을 직접 구현해보는 것을 추천합니다.',
  },
  {
    id: 2,
    category: '약함',
    title: '과적합 문제 해결',
    pages: '관련 페이지: 7, 8',
    description:
      '정규화 기법들의 동작 원리와 적용 방법에 대한 이해가 필요합니다. L1, L2 정규화, 드롭아웃, 조기 종료 등의 기법을 실제 프로젝트에 적용해보면서 학습하세요.',
  },
  {
    id: 3,
    category: '보통',
    title: '지도학습 vs 비지도학습',
    pages: '관련 페이지: 2, 3',
    description:
      '지도학습과 비지도학습의 차이는 이해하고 있지만, 실제 문제에 어떤 방식을 적용해야 하는지 더 연습이 필요합니다.',
  },
  {
    id: 4,
    category: '강점',
    title: '머신러닝 기본 정의',
    pages: '관련 페이지: 1, 2',
    description:
      '기본 개념 이해가 잘 되어 있습니다. 현재 수준을 유지하면서 실전 예제를 더 풀어보면 좋습니다.',
  },
  {
    id: 5,
    category: '보통',
    title: '의사결정트리 분기 기준',
    pages: '관련 페이지: 11, 12',
    description:
      '엔트로피와 지니 불순도 계산은 알고 있으나, 분기 기준이 실제 성능에 어떤 영향을 주는지 추가 학습이 필요합니다.',
  },
  {
    id: 6,
    category: '강점',
    title: '선형회귀 해석',
    pages: '관련 페이지: 9',
    description:
      '선형회귀의 개념과 계수 해석에 대한 이해가 잘 되어 있습니다.',
  },
];

const categoryColor = {
  전체보기: '#ef4444',
  약함: '#ef4444',
  보통: '#facc15',
  강점: '#22c55e',
};

export default function WeaknessAnalysisPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pdfId = searchParams.get('pdf_id') || 'Assignment2.pdf';

  const [activeFilter, setActiveFilter] = useState('전체보기');

  const filters = useMemo(() => {
    const counts = {
      전체보기: weaknessMockData.length,
      약함: weaknessMockData.filter((item) => item.category === '약함').length,
      보통: weaknessMockData.filter((item) => item.category === '보통').length,
      강점: weaknessMockData.filter((item) => item.category === '강점').length,
    };

    return [
      { id: '전체보기', label: '전체 보기', count: counts['전체보기'], active: activeFilter === '전체보기' },
      { id: '약함', label: '약함', count: counts['약함'], active: activeFilter === '약함' },
      { id: '보통', label: '보통', count: counts['보통'], active: activeFilter === '보통' },
      { id: '강점', label: '강점', count: counts['강점'], active: activeFilter === '강점' },
    ];
  }, [activeFilter]);

  const filteredData = useMemo(() => {
    if (activeFilter === '전체보기') return weaknessMockData;
    return weaknessMockData.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  const stats = useMemo(() => {
    return [
      { label: '분석 영역', value: String(weaknessMockData.length), color: 'blue' },
      { label: '약한 항목', value: String(weaknessMockData.filter((i) => i.category === '약함').length), color: 'green' },
      { label: '수준 종류', value: '3', color: 'pink' },
    ];
  }, []);

  return (
    <LearningDashboardLayout
      title="약점 진단 분석"
      fileName={pdfId}
      pageIcon={<ActivityIcon />}
      filters={filters}
      onFilterClick={setActiveFilter}
      stats={stats}
      tips="약한 영역부터 집중 복습하고, 관련 페이지와 함께 다시 보면 훨씬 빨리 이해할 수 있습니다."
      aiGuideText="학습 패턴을 분석하여 취약한 부분을 진단했습니다. 각 영역별 개선 방향을 확인해보세요."
      aiGuideColor="purple"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredData.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.72)',
              border: `1px solid ${categoryColor[item.category]}55`,
              borderRadius: '12px',
              padding: '1.2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '999px',
                  backgroundColor: `${categoryColor[item.category]}22`,
                  color: categoryColor[item.category],
                  border: `1px solid ${categoryColor[item.category]}55`,
                  fontWeight: 700,
                }}
              >
                {item.category}
              </span>
              <span style={{ fontSize: '1.08rem', fontWeight: 700 }}>{item.title}</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.pages}</span>
            </div>

            <div
              style={{
                backgroundColor: `${categoryColor[item.category]}18`,
                border: `1px solid ${categoryColor[item.category]}33`,
                borderRadius: '10px',
                padding: '0.95rem 1rem',
                color: '#e2e8f0',
                lineHeight: 1.7,
                marginBottom: '0.9rem',
              }}
            >
              {item.description}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => alert('관련 페이지 보기 기능은 PDF 뷰어와 연결하면 됩니다.')}
                style={{
                  padding: '0.58rem 0.95rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(148,163,184,0.24)',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                관련 페이지 보기
              </button>

              <button
                onClick={() => navigate(`/concept?pdf_id=${pdfId}`)}
                style={{
                  padding: '0.58rem 0.95rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(34,197,94,0.24)',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                핵심 자료 복습
              </button>

              <button
                onClick={() => navigate(`/learning-room?pdf_id=${pdfId}`)}
                style={{
                  padding: '0.58rem 0.95rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(250,204,21,0.24)',
                  backgroundColor: '#fffbeb',
                  color: '#854d0e',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                학습실로 돌아가기
              </button>
            </div>
          </div>
        ))}
      </div>
    </LearningDashboardLayout>
  );
}