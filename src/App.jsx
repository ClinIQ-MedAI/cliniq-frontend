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
import { AdminContactUs } from "./pages/AdminContactUs";
import PatientDocuments from "./pages/PatientDocumentsPage";
import GeneralContactUs from "./pages/GeneralContactUs";
import Patients from "./pages/PatientsPage";
import { RequirePermission } from "./components/guards/RequirePermissionGuard";
import AdminAdmins from "./pages/AdminAdminsPage";
import AdminRoles from "./pages/AdminRolesPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

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
                <Route path="/contact-us" element={<GeneralContactUs />} />
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
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route element={<Authentication />}>
                    <Route path="/survey" element={<Survey />} />
                    <Route
                        path="/verification-status"
                        element={<VerificationStatus />}
                    />

                    <Route
                        element={
                            <AuthorizationRoleGuard
                                allowed={["Admin", "SuperAdmin"]}
                            />
                        }
                    >
                        <Route element={<AdminSidebar />}>
                            <Route
                                element={
                                    <RequirePermission
                                        permission={"Permissions.Admins.View"}
                                    />
                                }
                            >
                                <Route
                                    path="/admin/admins"
                                    element={<AdminAdmins />}
                                />
                            </Route>
                            <Route
                                path="/admin/roles"
                                element={<AdminRoles />}
                            />

                            <Route
                                path="/admin/dashboard"
                                element={<AdminDashboard />}
                            />

                            <Route
                                element={
                                    <RequirePermission permission="Permissions.Patients.View" />
                                }
                            >
                                <Route
                                    path="/admin/patients"
                                    element={<AdminPatients />}
                                />
                            </Route>

                            <Route
                                element={
                                    <RequirePermission permission="Permissions.Doctors.View" />
                                }
                            >
                                <Route
                                    path="/admin/doctors"
                                    element={<AdminDoctors />}
                                />
                            </Route>

                            <Route
                                element={
                                    <RequirePermission permission="Permissions.Bookings.View" />
                                }
                            >
                                <Route
                                    path="/admin/bookings"
                                    element={<AdminBookings />}
                                />
                            </Route>

                            <Route
                                element={
                                    <RequirePermission permission="Permissions.Contacts.Manage" />
                                }
                            >
                                <Route
                                    path="/admin/contact-us"
                                    element={<AdminContactUs />}
                                />
                            </Route>
                        </Route>
                    </Route>

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
                                path="/patients/:patientId/documents"
                                element={<PatientDocuments />}
                            />
                            <Route
                                path="/announcements"
                                element={<Announcements />}
                            />
                            <Route
                                path="/availability"
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
