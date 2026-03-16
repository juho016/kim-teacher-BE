import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/HeaderAuthed.jsx";

const analysisMenus = [
  // path를 나중에 App.jsx에서 설정할 경로와 반드시 맞춰야 합니다.
  { id: "progress", title: "학습 진도 현황", desc: "나의 성실도 확인", icon: "📈", path: "/learning-status" },
  { id: "notes", title: "오답 노트 관리", desc: "틀린 문제 다시보기", icon: "📋", path: "/wrong-notes" },
  { id: "report", title: "취약점 분석 리포트", desc: "부족한 부분 진단", icon: "📊", path: "/report" },
  { id: "style", title: "학습 스타일 분석", desc: "나만의 공부법 찾기", icon: "🧠", path: "/analysis" },
];

const settingMenus = [
  { id: "profile", title: "프로필 관리", icon: "👤", path: "/profile" },
  { id: "goals", title: "학습 목표 설정", icon: "🎯", path: "/goals" },
  { id: "language", title: "언어 설정", icon: "🌐", path: "/settings/lang" },
  { id: "alarm", title: "알림 설정", icon: "🔔", path: "/settings/alarm" },
];

export default function MyPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="main-card">
        <Header />
        <main className="content">
          <section className="hero" style={{ textAlign: 'left', marginBottom: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button className="btn-back" onClick={() => navigate(-1)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ←
                </button>
                <h1 className="hero-title" style={{ margin: 0 }}>마이페이지</h1>
             </div>
             <p className="hero-sub" style={{ margin: '5px 0 0 0' }}>학습 통계 확인 및 계정 설정을 관리하세요.</p>
          </section>

          <div className="mypage-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginTop: '10px' }}>
            {/* 왼쪽 섹션 */}
            <section className="section">
              <h2 className="section-title">학습 분석 및 관리</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {analysisMenus.map((menu) => (
                  <button
                    key={menu.id}
                    className="course-card"
                    onClick={() => navigate(menu.path)} // 여기서 페이지 이동이 일어납니다.
                    style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '15px 20px', textAlign: 'left' }}
                  >
                    <div style={{ fontSize: '24px', marginRight: '20px' }}>{menu.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div className="course-name" style={{ fontSize: '16px' }}>{menu.title}</div>
                      <div className="course-last" style={{ marginTop: '2px' }}>{menu.desc}</div>
                    </div>
                    <span style={{ color: '#ccc' }}>→</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 오른쪽 섹션 */}
            <section className="section">
              <h2 className="section-title">환경 설정</h2>
              <div className="settings-wrapper" style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px' }}>
                {settingMenus.map((menu, index) => (
                  <div key={menu.id}>
                    <button
                      onClick={() => navigate(menu.path)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: '20px', marginRight: '15px' }}>{menu.icon}</span>
                      <span style={{ flex: 1, fontSize: '15px', fontWeight: '500', textAlign: 'left' }}>{menu.title}</span>
                      <span style={{ color: '#bbb' }}>→</span>
                    </button>
                    {index !== settingMenus.length - 1 && <hr style={{ border: '0', borderTop: '1px solid #f0f0f0', margin: '0' }} />}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}