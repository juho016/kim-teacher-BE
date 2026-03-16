import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import LearningDashboardLayout from "../components/templates/LearningDashboardLayout";

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const mockWrongQuestions = [
  {
    id: 1,
    question: "딥러닝과 머신러닝의 주요 차이점은 무엇인가?",
    myAnswer: "딥러닝은 더 복잡한 알고리즘을 사용한다",
    correct: "딥러닝은 여러 층의 신경망을 사용하여 자동으로 특징을 추출하며, 전통적 머신러닝은 사람이 특징을 설계한다",
    explanation:
      "딥러닝의 핵심은 깊은 신경망 구조를 통해 자동 특징 추출을 수행하는 것이다.",
  },
  {
    id: 2,
    question: "지도학습의 특징은 무엇인가?",
    myAnswer: "레이블이 없다",
    correct: "레이블이 있는 데이터로 학습한다",
    explanation:
      "지도학습은 입력과 정답(label)이 함께 제공된 데이터를 이용하여 모델을 학습하는 방식이다.",
  },
];

export default function WrongAnswerNotePage() {
  const [searchParams] = useSearchParams();
  const pdfId = searchParams.get("pdf_id") || "Assignment2.pdf";

  const [activeId, setActiveId] = useState(mockWrongQuestions[0].id);

  const active = useMemo(
    () => mockWrongQuestions.find((q) => q.id === activeId),
    [activeId]
  );

  const filters = useMemo(
    () =>
      mockWrongQuestions.map((q) => ({
        id: q.id,
        label: `문제 #${q.id}`,
        count: 1,
        active: q.id === activeId,
      })),
    [activeId]
  );

  const stats = [
    { label: "총 오답", value: mockWrongQuestions.length, color: "red" },
    { label: "복습 필요", value: mockWrongQuestions.length, color: "yellow" },
  ];

  return (
    <LearningDashboardLayout
      title="오답 노트"
      fileName={pdfId}
      pageIcon={<AlertCircleIcon />}
      filters={filters}
      onFilterClick={setActiveId}
      stats={stats}
      tips="틀린 문제를 여러 번 복습하면 장기 기억으로 전환됩니다."
      aiGuideText="틀린 문제를 분석하여 다시 학습할 수 있도록 정리했습니다."
      aiGuideColor="orange"
    >
      <div
        style={{
          background: "rgba(30,41,59,0.8)",
          padding: "1.2rem",
          borderRadius: "12px",
        }}
      >
        <h3 style={{ marginBottom: "1rem" }}>{active.question}</h3>

        <div style={{ marginBottom: "1rem", color: "#ef4444" }}>
          ❌ 내 답: {active.myAnswer}
        </div>

        <div style={{ marginBottom: "1rem", color: "#22c55e" }}>
          ✔ 정답: {active.correct}
        </div>

        <div
          style={{
            background: "#1e293b",
            padding: "1rem",
            borderRadius: "10px",
            lineHeight: 1.7,
          }}
        >
          💡 해설: {active.explanation}
        </div>
      </div>
    </LearningDashboardLayout>
  );
}