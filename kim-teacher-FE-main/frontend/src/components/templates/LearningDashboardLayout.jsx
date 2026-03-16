import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LearningDashboardLayout.css';

// SVG Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"></line>
    <line x1="10" y1="22" x2="14" y2="22"></line>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 16.5 8 4.5 4.5 0 0 0 12 3.5 4.5 4.5 0 0 0 7.5 8c0 1.68.73 2.85 1.5 3.5.76.76 1.23 1.52 1.41 2.5"></path>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const PageIconDefault = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

/**
 * LearningDashboardLayout
 * 
 * @param {string} title - 페이지 타이틀 (예: 핵심 개념 추출)
 * @param {string} fileName - 파일명 (예: Assignment2.pdf)
 * @param {ReactNode} pageIcon - 타이틀 옆 아이콘 컴포넌트
 * @param {Array} filters - 좌측 필터 데이터 [{ id, label, count, active }]
 * @param {Function} onFilterClick - 필터 클릭 핸들러
 * @param {Array} stats - 우측 통계 데이터 [{ label, value, color }]
 * @param {string} tips - 우측 학습 팁 텍스트
 * @param {string} aiGuideText - 중앙 상단 AI 안내 문구
 * @param {string} aiGuideColor - AI 안내 문구 박스 색상 테마 (default: 'blue')
 * @param {ReactNode} children - 중앙 컨텐츠
 */
export default function LearningDashboardLayout({
  title = "페이지 타이틀",
  fileName = "파일명.pdf",
  pageIcon = <PageIconDefault />,
  filters = [],
  onFilterClick = () => {},
  stats = [],
  tips = "학습 팁이 여기에 표시됩니다.",
  aiGuideText = "AI가 학습 내용을 분석했습니다.",
  aiGuideColor = "blue",
  children
}) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      {/* Top Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="page-icon-wrapper">
            {pageIcon}
          </div>
          <div className="header-titles">
            <h1 className="header-title">{title}</h1>
            <span className="header-filename">{fileName}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-back-home" onClick={() => navigate(`/learning-room?pdf_id=${pdfId}`)}>
            <HomeIcon />
            <span>학습실로 돌아가기</span>
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        {/* Left Sidebar: Filters */}
        <aside className="sidebar left-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <FilterIcon />
              <span>필터</span>
            </h3>
            <ul className="filter-list">
              {filters.map((filter) => (
                <li 
                  key={filter.id} 
                  className={`filter-item ${filter.active ? 'active' : ''}`}
                  onClick={() => onFilterClick(filter.id)}
                >
                  <span className="filter-label">{filter.label}</span>
                  <span className="filter-count">({filter.count})</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className={`ai-guide-box ${aiGuideColor}`}>
            <div className="ai-guide-icon">
              <StarIcon />
            </div>
            <p className="ai-guide-text">{aiGuideText}</p>
          </div>
          
          <div className="content-area">
            {children}
          </div>
        </main>

        {/* Right Sidebar: Stats & Tips */}
        <aside className="sidebar right-sidebar">
          {/* Stats Section */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <BarChartIcon />
              <span>분석 통계</span>
            </h3>
            <div className="stats-grid-sidebar">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card-sidebar">
                  <span className="stat-label-sidebar">{stat.label}</span>
                  <span className={`stat-value-sidebar ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <LightbulbIcon />
              <span>학습 팁</span>
            </h3>
            <div className="tips-box">
              <div className="tips-icon">
                <LightbulbIcon />
              </div>
              <p className="tips-text">{tips}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
