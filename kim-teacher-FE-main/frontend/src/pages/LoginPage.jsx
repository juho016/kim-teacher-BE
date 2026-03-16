import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위해 추가

const LoginPage = () => {
  const navigate = useNavigate(); // 이동 함수 생성
  const [activeTab, setActiveTab] = useState('login');

  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // 로그인 요청 핸들러
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 주호님의 로컬 백엔드 주소로 설정 -> vite에서 이미 proxy 설정 있어서 자동으로 연결됨
      const API_URL = '/api/login';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('로그인 성공:', data);

        // ★ [추가] 브라우저 주머니(localStorage)에 user_id를 영구 저장!
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('nickname', data.nickname);

        navigate('/user-home');
      } else {
        console.error('로그인 실패');
        alert(data.detail || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('네트워크 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden">

        {/* 헤더 */}
        <div className="flex flex-col items-center pt-8 pb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">김선생</h1>
        </div>

        {/* 탭 */}
        <div className="px-6">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('login')}
            >
              로그인
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              회원가입
            </button>
          </div>
        </div>

        <div className="p-6 pt-8">
          {activeTab === 'login' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* 아이디 입력 (수정된 부분) */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  아이디 (이메일)
                </label>
                <input
                  type="text"
                  id="email"   /* 여기를 username -> email 로 고쳤습니다! */
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
                  placeholder="아이디를 입력하세요."
                />
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors placeholder-gray-400"
                  placeholder="비밀번호를 입력하세요."
                />
                <div className="flex justify-end">
                  <a href="#" className="text-xs text-gray-500 hover:text-blue-600 hover:underline">
                    아이디/비밀번호 찾기
                  </a>
                </div>
              </div>

              {/* 버튼 */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm mt-2"
              >
                로그인하기
              </button>
            </form>
          )}

          {activeTab === 'signup' && (
            <div className="text-center py-10 text-gray-500">
              <p>회원가입 기능은 준비 중입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;