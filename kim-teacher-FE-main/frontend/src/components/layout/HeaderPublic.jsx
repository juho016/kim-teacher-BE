import React from 'react';
import { useNavigate } from "react-router-dom";

const HeaderPublic = () => {
    const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-logo">김선생</div>
      <div className="header-actions">
        <button className="btn btn-secondary"
        onClick={() => navigate("/login-page")}>로그인</button>
        <button className="btn btn-primary">회원가입</button>
      </div>
    </header>
  );
};

export default HeaderPublic;
