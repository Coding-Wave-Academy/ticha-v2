import { Routes, Route } from "react-router-dom";
import LanguageSelect from "../screens/onboarding/LanguageSelect";
import Welcome from "../screens/onboarding/Welcome";
import Goals from "../screens/onboarding/Goals";
import Level from "../screens/onboarding/Level";
import Subjects from "../screens/onboarding/Subjects";
import CourseUpload from "../screens/onboarding/CourseUpload";
import Dashboard from "../screens/Dashboard";
import SummaryPage from "../screens/SummaryPage";
import KnowledgeUnit from "../screens/KnowledgeUnit";
import Chat from "../screens/Chat";
import Practice from "../screens/Practice";
import VideoLibrary from "../screens/VideoLibrary";
import Auth from "../screens/Signup"; // Reusing Signup as Auth
import PrivateRoute from "../components/PrivateRoute";
import ComingSoon from "../screens/ComingSoon";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Onboarding & Public */}
      <Route path="/" element={<LanguageSelect />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/level" element={<Level />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/upload-courses" element={<CourseUpload />} />
      <Route path="/auth" element={<Auth />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/daily-task" element={<Dashboard />} />
        <Route path="/summaries" element={<SummaryPage />} />
        <Route path="/summary/:id" element={<SummaryPage />} />
        <Route path="/timetable" element={<ComingSoon />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/explore" element={<ComingSoon />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/video" element={<VideoLibrary />} />
        <Route path="/profile" element={<ComingSoon />} />
        <Route path="/knowledge/:id" element={<KnowledgeUnit />} />
      </Route>

      <Route path="*" element={<ComingSoon />} />
    </Routes>
  );
}
