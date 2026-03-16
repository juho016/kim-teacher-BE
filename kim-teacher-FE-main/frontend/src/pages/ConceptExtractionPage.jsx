import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LearningDashboardLayout from '../components/templates/LearningDashboardLayout';

// 아이콘
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const LightbulbIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"></line>
    <line x1="10" y1="22" x2="14" y2="22"></line>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 16.5 8 4.5 4.5 0 0 0 12 3.5 4.5 4.5 0 0 0 7.5 8c0 1.68.73 2.85 1.5 3.5.76.76 1.23 1.52 1.41 2.5"></path>
  </svg>
);

const PageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

const QuestionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// 키워드 추출 함수
function extractKeywords(title, description) {
  const combined = `${title} ${description}`.trim();

  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'including',
    'about', 'using', 'used', 'are', 'is', 'of', 'to', 'in', 'on', 'by',
    '및', '관련', '대한', '하는', '이다', '있는', '기초', '소개', '개요'
  ]);

  const words = combined
    .replace(/[^\w가-힣\s/-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !stopWords.has(w.toLowerCase()));

  const unique = [];
  for (const w of words) {
    if (!unique.includes(w)) unique.push(w);
    if (unique.length === 4) break;
  }

  return unique;
}

// 제목 기반 카테고리 추출
function getCategory(concept) {
  const title = concept.title?.trim() || '기타';
  return title.split(':')[0].trim();
}

export default function ConceptExtractionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pdfId = searchParams.get('pdf_id');

  const [allConcepts, setAllConcepts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pdfId) {
      setLoading(false);
      return;
    }

    const fetchConcepts = async () => {
      try {
        const response = await fetch(`/api/pdf/${pdfId}/concepts`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || '개념 데이터를 불러오지 못했습니다.');
        }

        const rawConcepts = data.concepts || [];

        // 중복 제거 + 정렬
        const uniqueConcepts = Array.from(
          new Map(
            rawConcepts.map((item) => [
              `${item.title}-${item.start_page}-${item.end_page}`,
              item,
            ])
          ).values()
        ).sort((a, b) => a.order_index - b.order_index);

        setAllConcepts(uniqueConcepts);
      } catch (error) {
        console.error('개념 조회 실패:', error);
        setAllConcepts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConcepts();
  }, [pdfId]);

  const enrichedConcepts = useMemo(() => {
    return allConcepts.map((concept) => ({
      ...concept,
      category: getCategory(concept),
      keywords: extractKeywords(concept.title, concept.description),
    }));
  }, [allConcepts]);

  const filters = useMemo(() => {
    const categoryCount = enrichedConcepts.reduce((acc, concept) => {
      acc[concept.category] = (acc[concept.category] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        id: 'all',
        label: '전체 보기',
        count: enrichedConcepts.length,
        active: activeFilter === 'all',
      },
      ...Object.entries(categoryCount).map(([category, count]) => ({
        id: category,
        label: category,
        count,
        active: activeFilter === category,
      })),
    ];
  }, [enrichedConcepts, activeFilter]);

  const filteredConcepts = useMemo(() => {
    if (activeFilter === 'all') return enrichedConcepts;
    return enrichedConcepts.filter((concept) => concept.category === activeFilter);
  }, [enrichedConcepts, activeFilter]);

  const stats = useMemo(() => {
    const totalPages =
      enrichedConcepts.length > 0
        ? Math.max(...enrichedConcepts.map((c) => c.end_page)) -
          Math.min(...enrichedConcepts.map((c) => c.start_page)) +
          1
        : 0;

    return [
      { label: '총 개념', value: String(enrichedConcepts.length), color: 'blue' },
      { label: '핵심 개념', value: String(filteredConcepts.length), color: 'green' },
      { label: '분석 페이지', value: String(totalPages), color: 'pink' },
    ];
  }, [enrichedConcepts, filteredConcepts]);

  const handleFilterClick = (id) => {
    setActiveFilter(id);
  };

  const toggleAccordion = (conceptId) => {
    setOpenId((prev) => (prev === conceptId ? null : conceptId));
  };

  const handleMoveToPage = (concept) => {
    alert(`${concept.start_page}페이지로 이동 기능은 다음 단계에서 PDF 뷰어와 연결하면 됩니다.`);
  };

  const handleGenerateQA = (concept) => {
  navigate(
    `/qa?concept_id=${concept.concept_id}&pdf_id=${pdfId}&title=${encodeURIComponent(concept.title)}`
  );
};

  return (
    <>
      <LearningDashboardLayout
        title="핵심 개념 추출"
        fileName={pdfId || 'PDF 파일'}
        pageIcon={<BookOpenIcon />}
        filters={filters}
        onFilterClick={handleFilterClick}
        stats={stats}
        tips="각 개념의 키워드를 클릭해 관련 개념을 먼저 파악하고, 필요한 경우 Q&A 생성으로 바로 학습을 이어가보세요."
        aiGuideText={
          loading
            ? 'AI가 PDF 내용을 바탕으로 핵심 개념을 불러오는 중입니다.'
            : `AI가 PDF에서 핵심 개념 ${enrichedConcepts.length}개를 추출했습니다. 각 개념을 클릭하여 상세 내용과 관련 키워드를 확인하세요.`
        }
        aiGuideColor="green"
      >
        {loading ? (
          <div style={{ color: '#cbd5e1', fontSize: '1rem' }}>
            개념을 불러오는 중입니다...
          </div>
        ) : filteredConcepts.length === 0 ? (
          <div
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '12px',
              padding: '2rem',
              color: '#cbd5e1',
            }}
          >
            표시할 개념이 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredConcepts.map((concept) => {
              const isOpen = openId === concept.concept_id;

              return (
                <div
                  key={concept.concept_id}
                  style={{
                    backgroundColor: 'rgba(30, 41, 59, 0.72)',
                    border: '1px solid rgba(51, 65, 85, 0.55)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: isOpen
                      ? '0 8px 24px rgba(0, 0, 0, 0.16)'
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <button
                    onClick={() => toggleAccordion(concept.concept_id)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      padding: '1.1rem 1.4rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(59, 130, 246, 0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#60a5fa',
                          flexShrink: 0,
                        }}
                      >
                        <LightbulbIcon size={15} color="#60a5fa" />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 }}>
                          {concept.order_index}. {concept.title}
                        </span>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: '#cbd5e1',
                            backgroundColor: 'rgba(148, 163, 184, 0.18)',
                            padding: '0.18rem 0.45rem',
                            borderRadius: '999px',
                          }}
                        >
                          p.{concept.start_page}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '1.3rem',
                        color: '#e2e8f0',
                        width: '24px',
                        textAlign: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.4rem 1.3rem',
                        borderTop: '1px solid rgba(51, 65, 85, 0.45)',
                      }}
                    >
                      <p
                        style={{
                          color: '#dbe4f0',
                          lineHeight: 1.75,
                          marginTop: '1rem',
                          marginBottom: '1rem',
                          fontSize: '0.98rem',
                        }}
                      >
                        {concept.description}
                      </p>

                      <div style={{ marginBottom: '0.9rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            marginBottom: '0.55rem',
                            color: '#cbd5e1',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                          }}
                        >
                          <span>📌</span>
                          <span>관련 키워드</span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                          {concept.keywords.map((keyword, idx) => (
                            <span
                              key={`${concept.concept_id}-kw-${idx}`}
                              style={{
                                fontSize: '0.78rem',
                                color: '#bfdbfe',
                                backgroundColor: 'rgba(37, 99, 235, 0.18)',
                                border: '1px solid rgba(59, 130, 246, 0.28)',
                                borderRadius: '999px',
                                padding: '0.32rem 0.6rem',
                              }}
                            >
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '0.6rem',
                          flexWrap: 'wrap',
                          marginTop: '1rem',
                        }}
                      >
                        <button
                          onClick={() => handleMoveToPage(concept)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.38rem',
                            padding: '0.58rem 0.9rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(148, 163, 184, 0.22)',
                            backgroundColor: 'white',
                            color: '#1e293b',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <PageIcon />
                          페이지로 이동
                        </button>

                        <button
                          onClick={() => handleGenerateQA(concept)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.38rem',
                            padding: '0.58rem 0.9rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(250, 204, 21, 0.22)',
                            backgroundColor: '#fff7ed',
                            color: '#78350f',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <QuestionIcon />
                          Q&A 생성
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </LearningDashboardLayout>
    </>
  );
}