import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import UserHomePage from "./pages/UserHomePage.jsx";
import CourseListPage from "./pages/CourseListPage.jsx";
import CourseDetailPage from "./pages/CourseDetailPage.jsx";
import PdfUploadPage from "./pages/PdfUploadPage.jsx";
import PdfAnalysisResultPage from "./pages/PdfAnalysisResultPage.jsx";
import ConceptExtractionPage from "./pages/ConceptExtractionPage.jsx";
import QAGenerationPage from "./pages/QAGenerationPage.jsx";
import LearningRoomPage from "./pages/LearningRoomPage.jsx";
import "./App.css";
import LoginPage from "./pages/LoginPage.jsx";
import MyPage from "./pages/mypage/MyPage.jsx";
import MyStatus from "./pages/mypage/MyStatus.jsx";
import LearningStatusDetail from "./pages/mypage/LearningStatusDetail.jsx";
import WeaknessAnalysisPage from "./pages/WeaknessAnalysisPage.jsx";
import CornellNotePage from "./pages/CornellNotePage.jsx";
import WrongAnswerNotePage from "./pages/WrongAnswerNotePage.jsx";
import QuizExamPage from "./pages/QuizExamPage.jsx";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/user-home" element={<UserHomePage />} />
      <Route path="/courses" element={<CourseListPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      <Route path="/pdf-upload" element={<PdfUploadPage />} />
      <Route path="/pdf-analysis" element={<PdfAnalysisResultPage />} />
      <Route path="/concept" element={<ConceptExtractionPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/login-page" element={<LoginPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/learning-status" element={<MyStatus />} />
        <Route path="/status-detail" element={<LearningStatusDetail />} />
        <Route path="/qa" element={<QAGenerationPage />} />
        <Route path="/learning-room" element={<LearningRoomPage />} />
        <Route path="/weakness" element={<WeaknessAnalysisPage />} />
        <Route path="/cornell" element={<CornellNotePage />} />
        <Route path="/wrong-note" element={<WrongAnswerNotePage />} />
        <Route path="/quiz-exam" element={<QuizExamPage />} />

    </Routes>
  );
}
