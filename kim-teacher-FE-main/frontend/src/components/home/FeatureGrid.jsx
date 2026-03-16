import React from 'react';

const FeatureGrid = () => {
  const features = [
    {
      title: "효율적인 학습을 위한 AI 요약",
      description: "방대한 학습 자료를 AI가 핵심만 요약하여 제공합니다. 시간을 절약하고 중요한 내용에 집중하세요."
    },
    {
      title: "취약점 분석 및 보완",
      description: "학습 데이터를 분석하여 부족한 부분을 찾아내고, 이를 보완할 수 있는 맞춤형 문제를 추천합니다."
    },
    {
      title: "AI 실시간 강의와 질의응답",
      description: "언제 어디서나 AI 튜터에게 질문하고 실시간으로 답변을 받아 학습의 흐름을 유지하세요."
    }
  ];

  return (
    <section className="feature-section">
      <div className="section-header">
        <h2 className="section-title">김선생의 핵심 기능</h2>
        <p className="section-subtitle">최첨단 AI 기술로 당신만을 위한 학습 경험을 설계합니다.</p>
      </div>
      <div className="feature-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon-placeholder"></div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
