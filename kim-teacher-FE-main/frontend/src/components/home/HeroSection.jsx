import React from 'react';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">AI 학습 코치 김선생과 함께,<br />당신의 잠재력을 깨우세요.</h1>
        <p className="hero-subtitle">
          김선생은 최신 AI 기술을 활용하여 개인 맞춤형 학습 경험을 제공합니다.<br />
          지금 바로 시작하여 효율적인 학습의 새로운 기준을 경험해보세요.
        </p>
        <button className="btn btn-primary btn-large">김선생 시작하기</button>
      </div>
      <div className="hero-image-container">
        <div className="hero-image-placeholder">
            <img src="/src/assets/home-image.png" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
