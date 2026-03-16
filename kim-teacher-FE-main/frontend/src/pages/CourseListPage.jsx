import { useNavigate } from "react-router-dom";
import Header from "../components/layout/HeaderAuthed.jsx";

const courses = [
  { id: "database", title: "데이터베이스", last: "마지막 학습: 2일 전", img: "/images/db.png" },
  { id: "computer-arch", title: "컴퓨터구조", last: "마지막 학습: 2일 전", img: "/images/arch.png" },
  { id: "physics1", title: "물리학1", last: "마지막 학습: 2일 전", img: "/images/physics.png" },
  { id: "algo", title: "알고리즘", last: "마지막 학습: 2일 전", img: "/images/algo.png" },
  { id: "os", title: "운영체제", last: "마지막 학습: 2일 전", img: "/images/os.png" },
  { id: "ml", title: "머신러닝", last: "마지막 학습: 2일 전", img: "/images/ml.png" },
  { id: "discrete", title: "이산수학", last: "마지막 학습: 2일 전", img: "/images/discrete.png" },
  { id: "newtech", title: "신기술특론", last: "마지막 학습: 2일 전", img: "/images/newtech.png" },
];

export default function CourseListPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="main-card">
        <Header />

        <main className="content">
          <div className="top-row">
            <button className="back-btn" onClick={() => navigate(-1)}>←</button>
            <h2 className="page-title">과목 전체 보기</h2>
          </div>

          <div className="course-row">
            {courses.map((c) => (
              <button
                key={c.id}
                className="course-card"
                onClick={() => navigate(`/courses/${c.id}`)}
              >
                <div className="course-thumb">
                  <img
                    src={c.img}
                    alt={c.title}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
                <div className="course-meta">
                  <div className="course-name">{c.title}</div>
                  <div className="course-last">{c.last}</div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
