import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/HeaderAuthed.jsx";

const courseNameMap = {
  database: "데이터베이스",
  "computer-arch": "컴퓨터구조",
  physics1: "물리학1",
  algo: "알고리즘",
  os: "운영체제",
  ml: "머신러닝",
  discrete: "이산수학",
  newtech: "신기술특론",
};

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const title = useMemo(() => courseNameMap[courseId] ?? "과목", [courseId]);

  const fileRef = useRef(null);
  const [files, setFiles] = useState([
    { name: `${title}_4강.pdf`, date: "업로드: 2025-11-13" },
    { name: `${title}_3강.pdf`, date: "업로드: 2025-11-13" },
    { name: `${title}_2강.pdf`, date: "업로드: 2025-11-13" },
  ]);

  const openDialog = () => fileRef.current?.click();

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFiles((prev) => [{ name: f.name, date: "업로드: (방금)" }, ...prev]);
    e.target.value = "";
  };

  return (
    <div className="page-container">
      <div className="main-card">
        <Header />

        <main className="content">
          <div className="top-row">
            <button className="back-btn" onClick={() => navigate(-1)}>←</button>
            <h2 className="page-title">{title}</h2>
          </div>

          <section className="section">
            <h3 className="sub-title">홍길동님을 위한 AI 추천</h3>
            <div className="recommend-row">
              <div className="recommend-card">
                <div className="recommend-head">
                  <div className="recommend-title">DB 정규화 심화</div>
                  <div className="badge">AI</div>
                </div>
                <div className="recommend-desc">
                  시험 주요 출제 부분으로 예상됩니다.<br />
                  관련 예제를 풀어보세요.
                </div>
              </div>

              <div className="recommend-card">
                <div className="recommend-head">
                  <div className="recommend-title">강한관계, 약한관계</div>
                  <div className="badge">AI</div>
                </div>
                <div className="recommend-desc">
                  오늘은 이렇습니다. 개념을 다시 공부하<br />
                  여 지식을 확인해 하세요.
                </div>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="row-between">
              <h3 className="sub-title">내 학습 자료(PDF)</h3>

              <div>
                <button className="btn btn-secondary small" onClick={openDialog}>
                  PDF 업로드
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: "none" }}
                  onChange={onPick}
                />
              </div>
            </div>

            <div className="file-list">
              {files.map((f, idx) => (
                <div key={idx} className="file-item">
                  <div className="file-left">
                    <div className="file-icon">📄</div>
                    <div>
                      <div className="file-name">{f.name}</div>
                      <div className="file-date">{f.date}</div>
                    </div>
                  </div>

                  <div className="file-actions">
                    <button className="icon-btn" title="수정">✏️</button>
                    <button className="icon-btn" title="삭제">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
