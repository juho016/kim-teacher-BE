import { useNavigate } from "react-router-dom";
import Header from "../components/layout/HeaderAuthed.jsx";

const recentCourses = [
  { id: "database", title: "데이터베이스", last: "마지막 학습: 2일 전", img: "/images/db.png" },
  { id: "computer-arch", title: "컴퓨터구조", last: "마지막 학습: 2일 전", img: "/images/arch.png" },
  { id: "physics1", title: "물리학1", last: "마지막 학습: 2일 전", img: "/images/physics.png" },
  { id: "algo", title: "알고리즘", last: "마지막 학습: 2일 전", img: "/images/algo.png" },
];

export default function UserHomePage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="main-card">
        <Header />

        <main className="content">
          <section className="hero">
            <h1 className="hero-title">신규유저님, 오늘도 화이팅!</h1>
            <p className="hero-sub">
              새로운 학습을 시작하거나, 기존 학습을 이어가세요.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary">
                새로운 학습 시작하기
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/courses")}>
                과목 전체 보기
              </button>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">최근 학습한 과목</h2>

            <div className="course-row">
              {recentCourses.map((c) => (
                <button
                  key={c.id}
                  className="course-card"
                  onClick={() => navigate(`/courses/${c.id}`)}
                >
                  <div className="course-thumb">
                    {/* 이미지가 없으면 회색 박스라도 보이게 */}
                    <img
                      src={c.img}
                      alt={c.title}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="course-meta">
                    <div className="course-name">{c.title}</div>
                    <div className="course-last">{c.last}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
