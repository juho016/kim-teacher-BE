import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PdfAnalysisResultPage.css';

// SVG Icons
const CheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const FileText = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const Lightbulb = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="9" y1="18" x2="15" y2="18"></line>
    <line x1="10" y1="22" x2="14" y2="22"></line>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 16.5 8 4.5 4.5 0 0 0 12 3.5 4.5 4.5 0 0 0 7.5 8c0 1.68.73 2.85 1.5 3.5.76.76 1.23 1.52 1.41 2.5"></path>
  </svg>
);

const GraduationCap = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
  </svg>
);

const Check = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const Star = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const ArrowRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default function PdfAnalysisResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pdfId = searchParams.get('pdf_id');

  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('PDF 분석을 시작하는 중입니다...');

  useEffect(() => {
    if (!pdfId) {
      setMessage('pdf_id가 없습니다.');
      setLoading(false);
      return;
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const pollConcepts = async () => {
      const maxTries = 15;

      for (let i = 0; i < maxTries; i++) {
        try {
          const res = await fetch(`/api/pdf/${pdfId}/concepts`);
          const data = await res.json();

          if (res.ok && data.concepts && data.concepts.length > 0) {
            const sortedConcepts = [...data.concepts].sort(
              (a, b) => a.order_index - b.order_index
            );
            setConcepts(sortedConcepts);
            setMessage('분석이 완료되었습니다.');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('개념 조회 실패:', err);
        }

        await sleep(2000);
      }

      setMessage('분석은 시작되었지만 아직 개념이 생성되지 않았습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
    };

    const startAnalysis = async () => {
      try {
        const res = await fetch(`/api/pdf/${pdfId}/structure`, {
          method: 'POST',
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || '구조 분석 시작 실패');
        }

        setMessage(data.message || '분석 시작됨');
        await pollConcepts();
      } catch (err) {
        console.error(err);
        setMessage(err.message || '분석 시작 실패');
        setLoading(false);
      }
    };

    startAnalysis();
  }, [pdfId]);

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <div className="panel summary-panel">
          <div className="summary-header">
            <CheckCircle className="success-icon" />
            <h1 className="summary-title">분석 완료!</h1>
            <p className="file-name">{pdfId}</p>
          </div>

          <div className="type-box">
            <span className="type-label">상태 :</span>
            <span className="type-value">{message}</span>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">개념</span>
              <span className="stat-value blue">{concepts.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">상태</span>
              <span className="stat-value green">{loading ? '분석중' : '완료'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">AI</span>
              <span className="stat-value pink">Gemini</span>
            </div>
          </div>

          <div className="generated-list">
            <h3 className="list-title">생성된 학습 자료</h3>

            <div className="list-item clickable" onClick={() => navigate(`/concept?pdf_id=${pdfId}`)}>
              <div className="item-left">
                <FileText className="item-icon" />
                <span>핵심 개념 추출</span>
              </div>
              {!loading && concepts.length > 0 && <Check className="check-icon" />}
            </div>

            <div className="list-item">
              <div className="item-left">
                <Lightbulb className="item-icon" />
                <span>Q&A 생성</span>
              </div>
            </div>

            <div className="list-item">
              <div className="item-left">
                <GraduationCap className="item-icon" />
                <span>학습 퀴즈</span>
              </div>
            </div>
          </div>

          <button
            className="btn-start-learning"
            onClick={() => navigate(`/learning-room?pdf_id=${pdfId}&file_name=${encodeURIComponent('Assignment2.pdf')}`)}
            disabled={concepts.length === 0}
          >
            <span>학습 시작하기</span>
            <ArrowRight className="btn-icon" />
          </button>
        </div>

        <div className="panel structure-panel">
          <div className="structure-header">
            <Star className="star-icon" />
            <h2 className="structure-title">교안 구조 분석</h2>
          </div>

          <div className="structure-content">
            {loading ? (
              <p>AI가 교안을 분석 중입니다...</p>
            ) : concepts.length === 0 ? (
              <p>아직 생성된 개념이 없습니다.</p>
            ) : (
              concepts.map((concept) => (
                <div key={concept.concept_id} className="chapter-item">
                  <div className="chapter-title">
                    {concept.order_index}. {concept.title} ({concept.start_page}p ~ {concept.end_page}p)
                  </div>
                  <div className="chapter-children">
                    <div className="child-item">
                      <Lightbulb className="child-icon concept" />
                      <span className="child-text">{concept.description}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}