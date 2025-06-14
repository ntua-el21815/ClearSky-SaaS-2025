import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginpage_1';
import StudentDashboard from './pages/student/grade_statistics';
import StudentCourses from './pages/student/my_courses';
import GradeReviewRequest from './pages/student/grade_review_request';
import PersonalGrades from './pages/student/personal_grades';
import ReviewStatus from './pages/student/review_status';
import InstructorCourses from './pages/instructor/instructor_courses';
import InstructorReviewRequests from './pages/instructor/instructor_review_requests';
import InstructorReviewReply from './pages/instructor/review_reply';
import PostInitialGrades from './pages/instructor/post_initial_grades';
import PostFinalGrades from './pages/instructor/post_final_grades';
import InstructorStatistics from './pages/instructor/instructor_statistics';
import InstitutionDashboard from './pages/institution/institution_dashboard';
import RegisterInstitution from './pages/institution/register_institution';
import UserManagement from './pages/institution/user_management';
import PurchaseCredits from './pages/institution/purchace_credits';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student/grade_statistics" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/grade_review_request" element={<GradeReviewRequest />} />
        <Route path="/student/personal_grades" element={<PersonalGrades />} />
        <Route path="/student/review_status" element={<ReviewStatus />} />
        <Route path="/instructor/dashboard" element={<InstructorCourses />} />
        <Route path="/instructor/instructor_review_requests" element={<InstructorReviewRequests />} />
        <Route path="/instructor/review_reply" element={<InstructorReviewReply />} />
        <Route path="/instructor/post_initial_grades" element={<PostInitialGrades />} />
        <Route path="/instructor/post_final_grades" element={<PostFinalGrades />} />
        <Route path="instructor/statistics" element={<InstructorStatistics />} />
        <Route path="institution/dashboard" element={<InstitutionDashboard />} />
        <Route path="institution/register" element={<RegisterInstitution />} />
        <Route path="institution/user_management" element={<UserManagement/>} />
        <Route path="institution/credits" element={<PurchaseCredits/>} />
      </Routes>
    </Router>
  );
}
export default App;