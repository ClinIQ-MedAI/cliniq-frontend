import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { DoctorLayout } from './components/DoctorLayout'
import { DashboardPage } from './pages/DashboardPage'
import { useState } from 'react'
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import { DashboardLayout } from './components/Dashboard/Layout/DashboardLayout'

function Appointments() {
  return <div><h2>Appointments</h2><p>Appointments table placeholder</p></div>;
}

function Patients() {
  return <div><h2>Patients</h2><p>Patients list placeholder</p></div>;
}

function Announcements() {
  return <div><h2>Announcements</h2><p>Announcements placeholder</p></div>;
}

function Settings() {
  return <div><h2>Settings</h2><p>Settings placeholder</p></div>;
}

function App() {
  const [openSignUpForm, setOpenSignUpForm] = useState(false)
  const [openLoginForm, setOpenLoginForm] = useState(false)

  return (<>
    <Router>
      <Routes>
        <Route element={<DoctorLayout setOpenSignUpForm={setOpenSignUpForm} setOpenLoginForm={setOpenLoginForm} />}>
          <Route path={"/"} element={<DashboardPage
            openLoginForm={openLoginForm}
            setOpenLoginForm={setOpenLoginForm}
            setOpenSignUpForm={setOpenSignUpForm}
            openSignUpForm={openSignUpForm}
          />}
          />
        </Route>

        <Route element={<DashboardLayout/>}>

          <Route path="/doctor-dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

      </Routes>
    </Router>
  </>
  )
}

export default App
