import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/layout/PublicLayout'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

/* --- public --- */
import Home from './pages/public/Home'
import Courses from './pages/public/Courses'
import CourseDetail from './pages/public/CourseDetail'
import Enrollment from './pages/public/Enrollment'
import Teachers from './pages/public/Teachers'
import TeacherDetail from './pages/public/TeacherDetail'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import NotFound from './pages/public/NotFound'

/* --- tələbə --- */
import StudentDashboard from './pages/student/Dashboard'
import StudentCourses from './pages/student/MyCourses'
import StudentCoursePlayer from './pages/student/CoursePlayer'
import StudentSchedule from './pages/student/Schedule'
import StudentGrades from './pages/student/Grades'
import StudentPayments from './pages/student/Payments'
import StudentProfile from './pages/student/Profile'

/* --- müəllim --- */
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherCourses from './pages/teacher/Courses'
import TeacherCourseEditor from './pages/teacher/CourseEditor'
import TeacherLessons from './pages/teacher/Lessons'
import TeacherStudents from './pages/teacher/Students'
import TeacherSchedule from './pages/teacher/Schedule'
import TeacherRevenue from './pages/teacher/Revenue'
import TeacherProfile from './pages/teacher/Profile'

/* --- admin --- */
import AdminDashboard from './pages/admin/Dashboard'
import AdminAnalytics from './pages/admin/Analytics'
import AdminUsers from './pages/admin/Users'
import AdminTeachers from './pages/admin/Teachers'
import AdminApplications from './pages/admin/Applications'
import AdminCourses from './pages/admin/Courses'
import AdminEnrollments from './pages/admin/Enrollments'
import AdminPayments from './pages/admin/Payments'
import AdminSettings from './pages/admin/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/kurslar" element={<Courses />} />
        <Route path="/kurslar/:courseId" element={<CourseDetail />} />
        <Route path="/kurslar/:courseId/qeydiyyat" element={<Enrollment />} />
        <Route path="/muellimler" element={<Teachers />} />
        <Route path="/muellimler/:id" element={<TeacherDetail />} />
        <Route path="/haqqimizda" element={<About />} />
        <Route path="/elaqe" element={<Contact />} />
        <Route path="/giris" element={<Login />} />
        <Route path="/qeydiyyat" element={<Register />} />
        <Route path="/panel" element={<Navigate to="/giris" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ---------------- TƏLƏBƏ ---------------- */}
      <Route element={<ProtectedRoute allow={['student']} />}>
        <Route path="/panel/telebe" element={<DashboardLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="kurslar" element={<StudentCourses />} />
          <Route path="kurs/:courseId" element={<StudentCoursePlayer />} />
          <Route path="cedvel" element={<StudentSchedule />} />
          <Route path="qiymetler" element={<StudentGrades />} />
          <Route path="odenisler" element={<StudentPayments />} />
          <Route path="profil" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* ---------------- MÜƏLLİM ---------------- */}
      <Route element={<ProtectedRoute allow={['teacher']} />}>
        <Route path="/panel/muellim" element={<DashboardLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="kurslar" element={<TeacherCourses />} />
          <Route path="kurslar/:courseId" element={<TeacherCourseEditor />} />
          <Route path="dersler" element={<TeacherLessons />} />
          <Route path="telebe" element={<TeacherStudents />} />
          <Route path="cedvel" element={<TeacherSchedule />} />
          <Route path="gelir" element={<TeacherRevenue />} />
          <Route path="profil" element={<TeacherProfile />} />
        </Route>
      </Route>

      {/* ---------------- ADMİN ---------------- */}
      <Route element={<ProtectedRoute allow={['admin']} />}>
        <Route path="/panel/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="analitika" element={<AdminAnalytics />} />
          <Route path="istifadeciler" element={<AdminUsers />} />
          <Route path="muellimler" element={<AdminTeachers />} />
          <Route path="muraciatlar" element={<AdminApplications />} />
          <Route path="kurslar" element={<AdminCourses />} />
          <Route path="qeydiyyatlar" element={<AdminEnrollments />} />
          <Route path="odenisler" element={<AdminPayments />} />
          <Route path="parametrler" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  )
}
