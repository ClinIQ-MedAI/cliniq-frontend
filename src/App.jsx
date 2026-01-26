import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { DoctorLayout } from './components/DoctorLayout'
import { DashboardPage } from './pages/DashboardPage'
import { useState } from 'react'

function App() {
  const [openSignUpForm, setOpenSignUpForm] = useState(false)

  return (<>
    <Router>
      <Routes>
        <Route element={<DoctorLayout setOpenSignUpForm={setOpenSignUpForm} />}>
          <Route path={"/"} element={<DashboardPage setOpenSignUpForm={setOpenSignUpForm} openSignUpForm={openSignUpForm} />} />
        </Route>
      </Routes>
    </Router>
  </>
  )
}

export default App
