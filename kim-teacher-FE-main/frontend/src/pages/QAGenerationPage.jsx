import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LearningDashboardLayout from '../components/templates/LearningDashboardLayout';

const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default function QAGenerationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const conceptId = searchParams.get('concept_id');
  const pdfId = searchParams.get('pdf_id');
  const conceptTitle = searchParams.get('title') || 'Q&A 자동 생성';

  const [roomId, setRoomId] = useState(localStorage.getItem(`room_id_${pdfId}`) || '');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('AI가 퀴즈를 생성하는 중입니다...');

  // --- [NEW] 퀴즈 풀이 상태 ---
  const [userAnswers, setUserAnswers] = useState({}); // { quiz_id: "선택한 답" }
  const [startTime, setStartTime] = useState({}); // { quiz_id: 시작 시간(timestamp) }
  const [quizResult, setQuizResult] = useState(null); // 채점 결과 저장
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 로딩 상태

  useEffect(() => {
    if (!conceptId || !pdfId) {
      setLoading(false);
      setMessage('concept_id 또는 pdf_id가 없습니다.');
      return;
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const ensureLearningRoom = async () => {
      if (roomId) return roomId;
      const response = await fetch('/api/learning-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_id: pdfId, study_goal: '퀴즈 풀이 학습' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || '학습방 생성 실패');
      localStorage.setItem(`room_id_${pdfId}`, data.room_id);
      setRoomId(data.room_id);
      return data.room_id;
    };

    const pollQuizzes = async () => {
      for (let i = 0; i < 15; i++) {
        try {
          const response = await fetch(`/api/concepts/${conceptId}/quizzes`);
          const data = await response.json();
          if (response.ok && data.quizzes && data.quizzes.length > 0) {
            setQuizzes(data.quizzes);
            // 퀴즈 시작 시간 기록
            const startTimes = {};
            data.quizzes.forEach(q => {
              startTimes[q.quiz_id] = Date.now();
            });
            setStartTime(startTimes);
            setMessage('퀴즈가 생성되었습니다. 문제를 풀어보세요.');
            setLoading(false);
            return;
          }
        } catch (error) { console.error('퀴즈 조회 실패:', error); }
        await sleep(2000);
      }
      setMessage('퀴즈 생성은 시작되었지만 아직 결과가 없습니다.');
      setLoading(false);
    };

    const generateAndFetchQuizzes = async () => {
      try {
        const ensuredRoomId = await ensureLearningRoom();
        const response = await fetch(`/api/concepts/${conceptId}/quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_id: ensuredRoomId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || '퀴즈 생성 시작 실패');
        setMessage(data.message || '퀴즈 생성 시작됨');
        await pollQuizzes();
      } catch (error) {
        console.error(error);
        setMessage(error.message || '퀴즈 생성 실패');
        setLoading(false);
      }
    };

    generateAndFetchQuizzes();
  }, [conceptId, pdfId]);

  // --- [NEW] 답안 선택 핸들러 ---
  const handleAnswerSelect = (quizId, choice) => {
    setUserAnswers(prev => ({
      ...prev,
      [quizId]: choice,
    }));
  };

  // --- [NEW] 제출 핸들러 ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const submissionData = {
      room_id: roomId,
      answers: Object.entries(userAnswers).map(([quiz_id, selected_answer]) => ({
        quiz_id,
        selected_answer,
        solve_time_seconds: (Date.now() - startTime[quiz_id]) / 1000,
      })),
    };

    try {
      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      const data = await response.json();
      if (response.ok) {
        setQuizResult(data);
      } else {
        alert(data.detail || '제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('제출 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI 렌더링 ---
  if (quizResult) {
    // 결과 화면 렌더링
    return (
      <LearningDashboardLayout title="퀴즈 결과" fileName={conceptTitle}>
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">채점 결과</h2>
          <p className="text-lg text-gray-300">점수: {quizResult.score} / {quizResult.total_questions}</p>
          <h3 className="text-xl font-semibold text-white mt-6 mb-3">오답 노트</h3>
          {quizResult.wrong_answers.length > 0 ? (
            quizResult.wrong_answers.map((wa, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-700 rounded-md">
                <p className="font-bold text-gray-200">Q. {wa.question}</p>
                <p className="text-red-400">내 답: {wa.your_answer}</p>
                <p className="text-green-400">정답: {wa.correct_answer}</p>
                <p className="text-gray-300 mt-2">해설: {wa.explanation}</p>
              </div>
            ))
          ) : (
            <p className="text-green-400">모든 문제를 맞혔습니다! 완벽해요!</p>
          )}
          <button onClick={() => navigate('/user-home')} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md">
            홈으로 돌아가기
          </button>
        </div>
      </LearningDashboardLayout>
    );
  }

  return (
    <LearningDashboardLayout
      title="퀴즈 풀이"
      fileName={conceptTitle}
      pageIcon={<MessageSquareIcon />}
      tips="문제를 꼼꼼히 읽고 가장 적절한 답을 선택하세요."
    >
      {loading ? (
        <div>{message}</div>
      ) : (
        <div>
          {quizzes.map((quiz, index) => (
            <div key={quiz.quiz_id} className="mb-6 p-4 bg-gray-800 rounded-lg">
              <p className="font-bold text-lg text-gray-200 mb-4">Q{index + 1}. {quiz.question}</p>
              <div className="space-y-2">
                {quiz.choices.map((choice, choiceIndex) => (
                  <button
                    key={choiceIndex}
                    onClick={() => handleAnswerSelect(quiz.quiz_id, choice)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      userAnswers[quiz.quiz_id] === choice
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(userAnswers).length !== quizzes.length}
            className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-500"
          >
            {isSubmitting ? '제출 중...' : '결과 확인하기'}
          </button>
        </div>
      )}
    </LearningDashboardLayout>
  );
}
