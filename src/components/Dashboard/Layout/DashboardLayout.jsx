import { Outlet } from "react-router-dom";
import Sidebar from "../../Sidebar/Sidebar";
import Header from "../../Header/Header";
import { useState } from "react";

export const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-page text-t1 transition-colors duration-200">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            ></Sidebar>
            <div className="w-full">
                <Header setIsSidebarOpen={setIsSidebarOpen} />
                <Outlet />
            </div>
        </div>
    );
};
