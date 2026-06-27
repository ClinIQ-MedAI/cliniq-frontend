import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { DoctorLayout } from "./components/DoctorLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard/Dashboard";
import AppointmentsPage from "./components/AppointmentsPage/AppointmentsPage";
import Profile from "./components/Profile/Profile";
import { DashboardLayout } from "./components/Dashboard/Layout/DashboardLayout";
import { Authentication } from "./components/Authentication";
import Survey from "./pages/ServeyPage";
import VerificationStatus from "./pages/VerificationStatus";
import { AdminDashboard } from "./pages/AdminDashboardPage";
import { AdminPatients } from "./pages/AdminPatientsPage";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminDoctors } from "./pages/AdminDoctorPage";

function Patients() {
    return (
        <div>
            <h2>Patients</h2>
            <p>Patients list placeholder</p>
        </div>
    );
}

function Announcements() {
    return (
        <div>
            <h2>Announcements</h2>
            <p>Announcements placeholder</p>
        </div>
    );
}

function Settings() {
    return (
        <div>
            <h2>Settings</h2>
            <p>Settings placeholder</p>
        </div>
    );
}

function App() {
    const [openSignUpForm, setOpenSignUpForm] = useState(false);
    const [openLoginForm, setOpenLoginForm] = useState(false);

    return (
        <>
            <Routes>
                <Route
                    element={
                        <DoctorLayout
                            setOpenSignUpForm={setOpenSignUpForm}
                            setOpenLoginForm={setOpenLoginForm}
                        />
                    }
                >
                    <Route
                        path={"/"}
                        element={
                            <DashboardPage
                                openLoginForm={openLoginForm}
                                setOpenLoginForm={setOpenLoginForm}
                                setOpenSignUpForm={setOpenSignUpForm}
                                openSignUpForm={openSignUpForm}
                            />
                        }
                    />
                </Route>

                <Route
                    path="/admin"
                    element={<Authentication allowed={["Admin"]} />}
                >
                    <Route element={<AdminSidebar />}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="patients" element={<AdminPatients />} />
                        <Route path="doctors" element={<AdminDoctors />} />
                    </Route>
                </Route>
                <Route path="/survey" element={<Survey />} />
                <Route
                    path="/verification-status"
                    element={<VerificationStatus />}
                />

                <Route element={<Authentication allowed={["Doctor"]} />}>
                    <Route element={<DashboardLayout />}>
                        <Route
                            path="/doctor-dashboard"
                            element={<Dashboard />}
                        />
                        <Route
                            path="/appointments"
                            element={<AppointmentsPage />}
                        />
                        <Route path="/patients" element={<Patients />} />
                        <Route
                            path="/announcements"
                            element={<Announcements />}
                        />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>
            </Routes>
        </>
    );
}

export default App;
