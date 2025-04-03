import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Navbar from './components/Navbar'
import ProfilePage from './pages/ProfilePage'
import HistoryPage from './pages/HistoryPage'
import SignupPage from './pages/SignupPage'
import CoursesPage from './pages/CoursesPage'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthProvider'
import { ChildrenProvider } from './context/ChildrenProvider'
import ManageChildrenPage from './pages/ManageChildrenPage'
import AdminPage from './pages/AdminPage'
import QuestionsPage from './pages/QuestionsPage'
import ResultsPage from './pages/ResultsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProtectedRoute from './misc/ProtectedRoute'

function App() {
  const protectedRoutes = [
    { path: '/profile', element: <ProfilePage /> },
    { path: '/history', element: <HistoryPage /> },
    { path: '/courses', element: <CoursesPage /> },
    { path: '/manage-children', element: <ManageChildrenPage /> },
    { path: '/analytics', element: <AnalyticsPage /> },
    { path: '/admin', element: <AdminPage /> },
    { path: '/practice/:topic_id/:difficulty_id', element: <QuestionsPage /> },
    { path: '/results/:set_id', element: <ResultsPage /> },
  ];

  return (
    <AuthProvider>
      <ChildrenProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {protectedRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={<ProtectedRoute>{route.element}</ProtectedRoute>} />
          ))}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer limit={3} />
      </ChildrenProvider>
    </AuthProvider>
  );
}

export default App
