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
import { AuthProvider } from './context/AuthContext'

function App() {

  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Navbar />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/courses" element={<CoursesPage />} />
      </Routes>
      <ToastContainer limit={3} />
    </AuthProvider>
  )
}

export default App
