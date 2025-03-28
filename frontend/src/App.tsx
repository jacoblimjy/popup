import { Route, Routes } from 'react-router-dom'
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

function App() {

  return (
    <AuthProvider>
      <ChildrenProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Navbar />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/manage-children" element={<ManageChildrenPage/>} />
          <Route path="/analytics" element={<AnalyticsPage/>} />
          <Route path="/admin" element={<AdminPage/>} />
          <Route path="/practice/:topic_id/:difficulty_id" element={<QuestionsPage/>} />
          <Route path='/results/:set_id' element={<ResultsPage/>} />
        </Routes>
        <ToastContainer limit={3} />
      </ChildrenProvider>
    </AuthProvider>
  )
}

export default App
