import { Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import HistoryPage from './pages/HistoryPage'
import SignupPage from './pages/SignupPage'

function App() {

  return (
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/history" element={<HistoryPage/>} />
      <Route path="/signup" element={<SignupPage/>} />
    </Routes>
  )
}

export default App
