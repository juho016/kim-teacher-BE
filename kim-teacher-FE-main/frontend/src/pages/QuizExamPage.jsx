import React, { useState } from "react";

const questions = [
  {
    id: 1,
    question: "머신러닝의 주요 학습 방식이 아닌 것은?",
    options: [
      "지도학습",
      "비지도학습",
      "강화학습",
      "통제학습",
    ],
    answer: 3,
  },
  {
    id: 2,
    question: "지도학습에서 사용하는 데이터는?",
    options: [
      "레이블 없는 데이터",
      "레이블 있는 데이터",
      "이미지만 있는 데이터",
      "텍스트만 있는 데이터",
    ],
    answer: 1,
  },
];

export default function QuizExamPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);

  const q = questions[index];

  return (
    <div
      style={{
        height: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "600px" }}>
        <h2 style={{ marginBottom: "2rem" }}>
          문제 {index + 1} / {questions.length}
        </h2>

        <h3 style={{ marginBottom: "2rem" }}>{q.question}</h3>

        {q.options.map((opt, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            style={{
              padding: "1rem",
              marginBottom: "0.8rem",
              borderRadius: "10px",
              cursor: "pointer",
              border:
                selected === i
                  ? "2px solid #3b82f6"
                  : "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {opt}
          </div>
        ))}

        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          <button
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            이전 문제
          </button>

          <button
            disabled={index === questions.length - 1}
            onClick={() => setIndex(index + 1)}
          >
            다음 문제
          </button>
        </div>
      </div>
    </div>
  );
}