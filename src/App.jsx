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
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { AuthorizationRoleGuard } from "./components/guards/AuthorizationRoleGuard";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ConversationsPage } from "./pages/ConversationsPage";
import ChatPage from "./pages/ChatPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import { AdminBookings } from "./pages/AdminBookingPage";

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
                    <Route
                        path="/forgot-password"
                        element={<ForgotPasswordPage />}
                    />
                </Route>
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route element={<Authentication />}>
                    <Route
                        element={<AuthorizationRoleGuard allowed={["Admin"]} />}
                    >
                        <Route element={<AdminSidebar />}>
                            <Route
                                path="/admin/dashboard"
                                element={<AdminDashboard />}
                            />
                            <Route
                                path="/admin/patients"
                                element={<AdminPatients />}
                            />
                            <Route
                                path="/admin/doctors"
                                element={<AdminDoctors />}
                            />
                            <Route
                                path="/admin/bookings"
                                element={<AdminBookings />}
                            />
                        </Route>
                    </Route>
                </Route>
                <Route path="/survey" element={<Survey />} />
                <Route
                    path="/verification-status"
                    element={<VerificationStatus />}
                />
                <Route element={<Authentication />}>
                    <Route
                        element={
                            <AuthorizationRoleGuard allowed={["Doctor"]} />
                        }
                    >
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
                            <Route
                                path="/settings"
                                element={<AvailabilityPage />}
                            />
                            <Route path="/profile" element={<Profile />} />
                            <Route
                                path="/conversations"
                                element={<ConversationsPage />}
                            />
                            <Route path="/messages" element={<ChatPage />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </>
    );
}

export default App;
