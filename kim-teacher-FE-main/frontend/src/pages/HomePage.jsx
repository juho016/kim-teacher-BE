import React from 'react';
import Header from '../components/layout/HeaderPublic';
import HeroSection from '../components/home/HeroSection';
import FeatureGrid from '../components/home/FeatureGrid';
import { useNavigate } from "react-router-dom";


const StepsSection = () => {
  const steps = [
    { step: "1단계", title: "학습 목표 설정", desc: "자신의 학습 목표와 일정을 설정하여 맞춤형 커리큘럼을 생성합니다." },
    { step: "2단계", title: "AI 학습 코칭", desc: "AI가 제공하는 실시간 피드백과 함께 학습을 진행합니다." },
    { step: "3단계", title: "취약점 집중 보완", desc: "분석된 데이터를 바탕으로 부족한 부분을 집중적으로 학습합니다." }
  ];

  return (
    <section className="steps-section">
      <div className="section-header">
        <h2 className="section-title">김선생, 이렇게 이용하세요.</h2>
      </div>
      <div className="steps-container">
        {steps.map((item, index) => (
          <div key={index} className="step-item">
            <div className="step-label">{item.step}</div>
            <h3 className="step-title">{item.title}</h3>
            <p className="step-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const CtaSection = ({ onStart }) => {
  return (
    <section className="cta-section">
      <h2 className="cta-title">
        지금 바로 김선생을 만나고,<br />최고의 학습 파트너를 경험해보세요.
      </h2>
      <button className="btn btn-primary btn-large" onClick={onStart}>
        무료로 시작하기
      </button>
    </section>
  );
};


const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="main-card">
        <Header />
        <main>
          <HeroSection />
          <FeatureGrid />
          <StepsSection />
           <CtaSection onStart={() => navigate("/login-page")} />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
