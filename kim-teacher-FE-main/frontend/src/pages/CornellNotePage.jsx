import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LearningDashboardLayout from '../components/templates/LearningDashboardLayout';

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const mockNotes = [
  {
    id: 1,
    title: '노트 #1 머신러닝 정의',
    page: 'p.1',
    cue: ['머신러닝 정의', '학습 방식', '응용 분야'],
    notes: [
      '머신러닝은 명시적인 프로그래밍 없이 컴퓨터가 데이터로부터 학습하는 기술',
      '지도학습: 레이블된 데이터 사용',
      '비지도학습: 레이블 없는 데이터에서 패턴 발견',
      '강화학습: 보상을 통한 학습',
      '이미지 인식, 자연어 처리, 추천 시스템 등 다양한 분야에서 활용',
    ],
    summary:
      '머신러닝은 데이터 기반 학습을 통해 문제를 해결하는 AI 기술로, 지도/비지도/강화 학습 방식이 있으며 실생활의 많은 영역에서 활용되고 있다.',
  },
  {
    id: 2,
    title: '노트 #2 지도학습',
    page: 'p.2',
    cue: ['지도학습', '레이블', '예측'],
    notes: [
      '지도학습은 입력과 정답이 함께 주어진 데이터로 학습',
      '분류와 회귀 문제에 자주 사용됨',
      '새로운 입력에 대한 예측값을 생성하는 것이 목표',
    ],
    summary:
      '지도학습은 정답이 포함된 데이터를 이용하여 예측 모델을 만드는 방법이며, 대표적으로 분류와 회귀에 활용된다.',
  },
  {
    id: 3,
    title: '노트 #3 비지도학습',
    page: 'p.3',
    cue: ['비지도학습', '군집화', '패턴 발견'],
    notes: [
      '레이블이 없는 데이터에서 구조를 찾음',
      '대표 예시는 군집화와 차원 축소',
      '데이터 내부 패턴과 유사성을 찾는 데 적합',
    ],
    summary:
      '비지도학습은 레이블이 없는 데이터에서 구조를 발견하는 학습 방식으로, 군집화와 차원 축소에 활용된다.',
  },
];

export default function CornellNotePage() {
  const [searchParams] = useSearchParams();
  const pdfId = searchParams.get('pdf_id') || 'Assignment2.pdf';

  const [activeNoteId, setActiveNoteId] = useState(mockNotes[0].id);

  const activeNote = useMemo(
    () => mockNotes.find((note) => note.id === activeNoteId) || mockNotes[0],
    [activeNoteId]
  );

  const filters = useMemo(
    () =>
      mockNotes.map((note) => ({
        id: note.id,
        label: note.title,
        count: 1,
        active: note.id === activeNoteId,
      })),
    [activeNoteId]
  );

  const stats = useMemo(
    () => [
      { label: '생성된 노트', value: String(mockNotes.length), color: 'blue' },
      { label: '총 페이지', value: '7', color: 'green' },
      { label: '학습 섹션', value: '3', color: 'pink' },
    ],
    []
  );

  return (
    <LearningDashboardLayout
      title="코넬 노트 방식"
      fileName={pdfId}
      pageIcon={<BookOpenIcon />}
      filters={filters}
      onFilterClick={setActiveNoteId}
      stats={stats}
      tips="단서(Cue)를 먼저 읽고, 노트 내용을 스스로 떠올린 뒤 요약으로 정리하면 복습 효과가 더 좋아집니다."
      aiGuideText="효과적인 학습을 위해 코넬 노트 방식으로 정리되었습니다. 단서, 노트, 요약 구조를 확인해보세요."
      aiGuideColor="purple"
    >
      <div
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.72)',
          border: '1px solid rgba(168,85,247,0.25)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.2rem',
            borderBottom: '1px solid rgba(51,65,85,0.55)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.6rem',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{activeNote.title}</div>
          <div
            style={{
              fontSize: '0.78rem',
              color: '#cbd5e1',
              backgroundColor: 'rgba(148,163,184,0.15)',
              padding: '0.2rem 0.45rem',
              borderRadius: '999px',
            }}
          >
            {activeNote.page}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '420px' }}>
          {/* Cue */}
          <div
            style={{
              borderRight: '1px solid rgba(51,65,85,0.55)',
              padding: '1.1rem',
              backgroundColor: 'rgba(91, 33, 182, 0.08)',
            }}
          >
            <div style={{ color: '#c4b5fd', fontWeight: 700, marginBottom: '0.9rem' }}>
              단서 (Cue)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {activeNote.cue.map((cue, idx) => (
                <div key={idx} style={{ color: '#e9d5ff', lineHeight: 1.6 }}>
                  {cue}
                </div>
              ))}
            </div>
          </div>

          {/* Notes + Summary */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.1rem', flex: 1 }}>
              <div style={{ color: '#bfdbfe', fontWeight: 700, marginBottom: '0.9rem' }}>
                노트 (Notes)
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.15rem', color: '#e2e8f0', lineHeight: 1.8 }}>
                {activeNote.notes.map((note, idx) => (
                  <li key={idx} style={{ marginBottom: '0.45rem' }}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(51,65,85,0.55)',
                backgroundColor: 'rgba(168,85,247,0.10)',
                padding: '1.1rem',
              }}
            >
              <div style={{ color: '#ddd6fe', fontWeight: 700, marginBottom: '0.7rem' }}>
                요약 (Summary)
              </div>
              <div style={{ color: '#f5f3ff', lineHeight: 1.8 }}>{activeNote.summary}</div>
            </div>
          </div>
        </div>
      </div>
    </LearningDashboardLayout>
  );
}