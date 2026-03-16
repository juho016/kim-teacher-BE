import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// 아이콘들
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>
);

const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const GraduationCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6"></path>
    <path d="M2 10l10-5 10 5-10 5z"></path>
    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"></line>
    <line x1="10" y1="22" x2="14" y2="22"></line>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 16.5 8 4.5 4.5 0 0 0 12 3.5 4.5 4.5 0 0 0 7.5 8c0 1.68.73 2.85 1.5 3.5.76.76 1.23 1.52 1.41 2.5"></path>
  </svg>
);

const tabStyles = {
  concept: {
    color: '#60a5fa',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.28)',
    buttonBg: '#2563eb',
  },
  qa: {
    color: '#4ade80',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.28)',
    buttonBg: '#16a34a',
  },
  weakness: {
    color: '#f87171',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.28)',
    buttonBg: '#dc2626',
  },
  cornell: {
    color: '#a78bfa',
    bg: 'rgba(168,85,247,0.12)',
    border: 'rgba(168,85,247,0.28)',
    buttonBg: '#7c3aed',
  },
  wrong: {
    color: '#fb923c',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.28)',
    buttonBg: '#ea580c',
  },
  quiz: {
    color: '#facc15',
    bg: 'rgba(250,204,21,0.12)',
    border: 'rgba(250,204,21,0.28)',
    buttonBg: '#7c3aed',
  },
};

export default function LearningRoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pdfId = searchParams.get('pdf_id');
  const fileNameFromQuery = searchParams.get('file_name') || 'PDF 파일';

  const [activeTab, setActiveTab] = useState('concept');
  const [conceptCount, setConceptCount] = useState(0);
  const [loadingConcepts, setLoadingConcepts] = useState(true);

  useEffect(() => {
    if (!pdfId) {
      setLoadingConcepts(false);
      return;
    }

    const fetchConcepts = async () => {
      try {
        const response = await fetch(`/api/pdf/${pdfId}/concepts`);
        const data = await response.json();

        if (response.ok && Array.isArray(data.concepts)) {
          setConceptCount(data.concepts.length);
        } else {
          setConceptCount(0);
        }
      } catch (error) {
        console.error('학습실 concept 조회 실패:', error);
        setConceptCount(0);
      } finally {
        setLoadingConcepts(false);
      }
    };

    fetchConcepts();
  }, [pdfId]);

  const tabs = useMemo(() => [
    {
      id: 'concept',
      label: '개념 추출',
      icon: <FileTextIcon />,
      title: '핵심 개념 추출',
      description: 'PDF에서 자동으로 중요한 개념과 키워드를 추출합니다',
      emptyText: loadingConcepts
        ? '개념 정보를 불러오는 중입니다'
        : conceptCount > 0
        ? `현재 ${conceptCount}개의 개념이 준비되어 있습니다`
        : '아직 추출된 개념이 없습니다',
      buttonText: conceptCount > 0 ? '개념 추출 보기' : '개념 추출 시작',
      onAction: () => navigate(`/concept?pdf_id=${pdfId}`),
      theme: 'concept',
    },
    {
      id: 'qa',
      label: 'Q&A 생성',
      icon: <MessageSquareIcon />,
      title: 'Q&A 자동 생성',
      description: '핵심 개념을 바탕으로 질문과 답변을 자동 생성합니다',
      emptyText: '개념을 선택한 뒤 Q&A를 생성할 수 있습니다',
      buttonText: 'Q&A 시작하기',
      onAction: () => navigate(`/concept?pdf_id=${pdfId}`),
      theme: 'qa',
    },
    {
      id: 'weakness',
      label: '약점 진단',
      icon: <ActivityIcon />,
      title: '약점 진단 분석',
      description: '학습 결과를 바탕으로 취약한 개념과 영역을 분석합니다',
      emptyText: 'Q&A나 퀴즈 진행 후 약점 진단 기능을 활용해보세요',
      buttonText: '개념부터 학습하기',
      onAction: () => navigate(`/weakness?pdf_id=${pdfId}`),
      theme: 'weakness',
    },
    {
      id: 'cornell',
      label: '코넬 노트',
      icon: <BookOpenIcon />,
      title: '코넬 노트 방식',
      description: '핵심 개념을 체계적으로 정리한 코넬 노트를 생성합니다',
      emptyText: '개념을 바탕으로 정리형 학습 노트를 만들 수 있습니다',
      buttonText: '코넬 노트 보기',
      onAction: () => navigate(`/cornell?pdf_id=${pdfId}`),
      theme: 'cornell',
    },
    {
      id: 'wrong',
      label: '오답 노트',
      icon: <AlertCircleIcon />,
      title: '오답 노트',
      description: '틀린 문제를 다시 정리하고 반복 학습할 수 있습니다',
      emptyText: 'Q&A 또는 퀴즈 풀이 후 오답이 누적되면 활용할 수 있습니다',
      buttonText: 'Q&A부터 시작하기',
      onAction: () => navigate(`/wrong-note?pdf_id=${pdfId}`),
      theme: 'wrong',
    },
    {
      id: 'quiz',
      label: '퀴즈/시험',
      icon: <GraduationCapIcon />,
      title: '퀴즈/시험',
      description: '학습한 개념을 점검할 수 있는 문제를 생성합니다',
      emptyText: '개념 학습 후 퀴즈 기능으로 이해도를 점검해보세요',
      buttonText: '퀴즈 준비하기',
      onAction: () => navigate(`/quiz-exam?pdf_id=${pdfId}`),
      theme: 'quiz',
    },
  ], [pdfId, conceptCount, loadingConcepts, navigate]);

  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const currentTheme = tabStyles[currentTab.theme];

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Pretendard, sans-serif',
      }}
    >
      {/* 상단바 */}
      <header
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          borderBottom: '1px solid rgba(51,65,85,0.6)',
          backgroundColor: '#162033',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            AI
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>AI 학습 도우미</span>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          <HomeIcon />
          처음으로
        </button>
      </header>

      {/* 본문 */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* 좌측 PDF 뷰어 */}
        <section
          style={{
            width: '50%',
            minWidth: '420px',
            borderRight: '1px solid rgba(51,65,85,0.6)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1b2436',
          }}
        >
          <div
            style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 0.8rem',
              borderBottom: '1px solid rgba(51,65,85,0.45)',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              flexShrink: 0,
            }}
          >
            <span>{fileNameFromQuery}</span>
            <div style={{ display: 'flex', gap: '0.6rem', opacity: 0.9 }}>
              <span>📄</span>
              <span>🔍</span>
              <span>➕</span>
              <span>➖</span>
              <span>↗</span>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', marginBottom: '0.6rem' }}>PDF Viewer Component</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                Integration with react-pdf or pdf.js
              </div>
            </div>
          </div>
        </section>

        {/* 우측 학습 기능 */}
        <section
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            backgroundColor: '#0f1b36',
          }}
        >
          {/* 탭 메뉴 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid rgba(51,65,85,0.55)',
              backgroundColor: '#182235',
              overflowX: 'auto',
              flexShrink: 0,
            }}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              const theme = tabStyles[tab.theme];

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: isActive ? theme.bg : 'transparent',
                    color: isActive ? theme.color : '#e5e7eb',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${theme.color}` : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 우측 메인 컨텐츠 */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                border: `1px solid ${currentTheme.border}`,
                backgroundColor: currentTheme.bg,
                borderRadius: '10px',
                padding: '0.95rem 1rem',
                marginBottom: '1.2rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontWeight: 700,
                  color: currentTheme.color,
                  marginBottom: '0.25rem',
                }}
              >
                {currentTab.icon}
                {currentTab.title}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.84rem' }}>
                {currentTab.description}
              </div>
            </div>

            <div
              style={{
                minHeight: 'calc(100% - 110px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '1rem',
              }}
            >
              <div style={{ marginBottom: '1rem', opacity: 0.9 }}>
                <LightbulbIcon />
              </div>

              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '0.98rem',
                  marginBottom: '1rem',
                }}
              >
                {currentTab.emptyText}
              </div>

              <button
                onClick={currentTab.onAction}
                style={{
                  backgroundColor: currentTheme.buttonBg,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.7rem 1.2rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.16)',
                }}
              >
                {currentTab.buttonText}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}