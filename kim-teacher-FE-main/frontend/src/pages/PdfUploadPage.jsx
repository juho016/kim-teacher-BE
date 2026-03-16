import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PdfUploadPage.css';

export default function PdfUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('PDF 파일을 선택하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('업로드 성공:', data);
        navigate(`/pdf-analysis?pdf_id=${data.pdf_id}`);
      } else {
        alert(data.detail || '업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="pdf-upload-page">
      <div className="upload-container">
        <div className="header-section">
          <div className="icon-wrapper">
            <span style={{ fontSize: '30px' }}>📄</span>
          </div>
          <h1 className="title">PDF 학습 도우미</h1>
          <p className="subtitle">PDF를 업로드하면 AI가 학습을 도와드립니다.</p>
        </div>

        <div className="upload-box" onClick={handleBoxClick}>
          <span style={{ fontSize: '40px', marginBottom: '1rem', display: 'block' }}>⬆️</span>
          <p className="upload-text">PDF 파일을 드래그하거나 클릭하세요</p>
          <p className="upload-limit">최대 50MB까지 업로드 가능</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn btn-select-file"
            onClick={(e) => {
              e.stopPropagation();
              handleBoxClick();
            }}
          >
            파일 선택
          </button>

          <p style={{ marginTop: '1rem', color: '#d1d5db' }}>
            {file ? file.name : '선택된 파일 없음'}
          </p>
        </div>

        <div className="action-buttons">
          <button className="btn btn-action" onClick={handleUpload}>개념 추출</button>
          <button className="btn btn-action" onClick={handleUpload}>Q&A 생성</button>
          <button className="btn btn-action" onClick={handleUpload}>퀴즈 생성</button>
        </div>
      </div>
    </div>
  );
}