import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/HeaderAuthed.jsx";

/**
 * [학습 진도 현황 페이지]
 * 1. 각 과목은 전체 교안 수 대비 진행된 교안 수로 진행률을 계산합니다.
 * 2. 진행률이 100%인 경우 초록색 테두리(border-success)와 체크 마크가 표시됩니다.
 */

const courseProgressData = [
  { id: "db", title: "데이터베이스", totalLessons: 8, completedLessons: 5, lastStudy: "2일 전" },
  { id: "ds", title: "자료구조", totalLessons: 16, completedLessons: 5, lastStudy: "5일 전" },
  { id: "arch", title: "컴퓨터 구조", totalLessons: 20, completedLessons: 1, lastStudy: "2일 전" },
  { id: "mgmt", title: "테크기업경영", totalLessons: 8, completedLessons: 7, lastStudy: "2일 전" },
  { id: "algo", title: "알고리즘", totalLessons: 8, completedLessons: 4, lastStudy: "10일 전" },
  { id: "drone", title: "드론과 로보틱스", totalLessons: 8, completedLessons: 5, lastStudy: "2일 전" },
  { id: "ml", title: "머신러닝", totalLessons: 8, completedLessons: 8, lastStudy: "2일 전" }, // 100% 케이스
];

export default function MyStatus() {
  const navigate = useNavigate();

  // 과목 카드 클릭 핸들러
  const handleCourseClick = (courseId) => {
    // TODO: 실제 API 연동 시 courseId를 사용하여 해당 과목의 상세 데이터를 불러오도록 구현 필요
    // 현재는 더미 데이터를 사용하는 LearningStatusDetail 페이지로 이동
    navigate(`/status-detail`);
  };

  return (
    <div className="page-container">
      <div className="main-card">
        <Header />

        <main className="content">
          {/* 상단 헤더 영역 */}
          <section className="hero" style={{ textAlign: 'left', marginBottom: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button className="btn-back" onClick={() => navigate(-1)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ←
                </button>
                <h1 className="hero-title" style={{ margin: 0 }}>학습 진도 현황</h1>
             </div>
          </section>

          {/* 과목 진도 그리드 레이아웃 */}
          <div className="progress-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {courseProgressData.map((course) => {
              const progressPercent = Math.round((course.completedLessons / course.totalLessons) * 100);
              const isCompleted = progressPercent === 100;

              return (
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course.id)}
                  className={`course-card ${isCompleted ? 'completed-border' : ''}`}
                  style={{
                    padding: '20px',
                    textAlign: 'left',
                    position: 'relative',
                    border: isCompleted ? '2px solid #4ade80' : '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '200px',
                    cursor: 'pointer', // 클릭 가능함을 나타내는 커서 스타일 추가
                    transition: 'transform 0.2s, box-shadow 0.2s' // 호버 효과를 위한 트랜지션
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* 상단 통계 정보 */}
                  <div className="progress-info" style={{ color: '#888', fontSize: '14px', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span>•</span> 전체 교안 갯수 : {course.totalLessons}
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span>•</span> 진행 교안 수 : {course.completedLessons}
                    </div>
                    <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#aaa' }}>
                      전체 진행률 : {progressPercent}%
                    </div>
                  </div>

                  {/* 진행 바 (Progress Bar) */}
                  <div className="progress-bar-container" style={{
                    height: '10px',
                    backgroundColor: '#334155',
                    borderRadius: '5px',
                    margin: '15px 0',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6, #a855f7)',
                      borderRadius: '5px'
                    }} />
                  </div>

                  {/* 하단 과목명 및 마지막 학습일 */}
                  <div className="course-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div className="course-name" style={{ fontSize: '18px', fontWeight: 'bold' }}>{course.title}</div>
                      <div className="course-last" style={{ fontSize: '12px', color: '#bbb', marginTop: '4px' }}>마지막 학습: {course.lastStudy}</div>
                    </div>

                    {/* 100% 달성 시 체크 아이콘 표시 */}
                    {isCompleted && (
                      <div className="check-icon" style={{
                        width: '24px', height: '24px',
                        borderRadius: '50%', border: '2px solid #4ade80',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#4ade80', fontSize: '14px', fontWeight: 'bold'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
